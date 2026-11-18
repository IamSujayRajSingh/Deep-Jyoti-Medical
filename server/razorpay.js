// Online payments through Razorpay (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).
//
// 1. createPayment: prices the cart (same rules as COD), creates a Razorpay
//    order for that amount and remembers the checkout in `payment_intents`.
//    Nothing else is saved and no stock is held.
// 2. The customer pays in Razorpay Checkout in the browser.
// 3. verifyPayment (browser) or handleWebhook (Razorpay's servers, as a backup
//    if the browser never comes back) confirm the payment with Razorpay and
//    only then create the real Order, marked Paid. Both paths are idempotent.
//
// Needs the secrets RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, and optionally
// RAZORPAY_WEBHOOK_SECRET for the webhook.
import { HttpError, records, newId, nowIso } from "./db.js";
import { hex, safeEqual } from "./schema.js";
import { prepareCheckout, placePaidOrder, publicOrder, getSettings } from "./orders.js";
import { BUSINESS } from "../src/lib/constants.js";

const API = "https://api.razorpay.com/v1";
const STALE_CLAIM_MS = 2 * 60 * 1000;

export const razorpayConfigured = (env) => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

function requireConfigured(env) {
  if (!razorpayConfigured(env)) throw new HttpError(400, "Online payment is not available right now.");
}

async function razorpay(env, method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[razorpay] ${method} ${path} failed (${response.status}):`, data?.error?.description || "no details");
    throw new HttpError(502, "The payment service did not respond as expected. Please try again.");
  }
  return data;
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

/** Whether checkout should offer online payment. */
export async function paymentConfig(env) {
  const settings = await getSettings(env);
  return { online: razorpayConfigured(env) && settings.online_payment_enabled !== false };
}

/** Step 1: price the cart and open a Razorpay order for it. */
export async function createPayment(env, body) {
  requireConfigured(env);
  const checkout = await prepareCheckout(env, { ...body, paymentMethod: "online" });
  const amount = Math.round(checkout.totals.finalTotal * 100);
  if (amount < 100) throw new HttpError(400, "Online payment needs an order total of at least ₹1.");

  const rzpOrder = await razorpay(env, "POST", "/orders", {
    amount,
    currency: "INR",
    receipt: `web_${newId()}`.slice(0, 40),
    notes: { source: "website" },
  });

  const now = nowIso();
  const intent = {
    customer: checkout.customer,
    address: checkout.address,
    lines: checkout.snapshot.map((s) => s.line),
    totals: checkout.totals,
  };
  await env.DB
    .prepare("INSERT INTO payment_intents (id, data, amount, status, created_date, updated_date) VALUES (?, ?, ?, 'created', ?, ?)")
    .bind(rzpOrder.id, JSON.stringify(intent), amount, now, now)
    .run();

  return {
    key_id: env.RAZORPAY_KEY_ID,
    razorpay_order_id: rzpOrder.id,
    amount,
    currency: "INR",
    name: BUSINESS.name,
    prefill: {
      name: checkout.customer.full_name,
      email: checkout.customer.email || undefined,
      contact: checkout.customer.phone.replace(/\D/g, ""),
    },
  };
}

/** Step 3a: the browser reports a successful payment. */
export async function verifyPayment(env, body, origin) {
  requireConfigured(env);
  const orderId = String(body?.razorpay_order_id || "");
  const paymentId = String(body?.razorpay_payment_id || "");
  const signature = String(body?.razorpay_signature || "");
  if (!/^order_\w+$/.test(orderId) || !/^pay_\w+$/.test(paymentId) || !signature) {
    throw new HttpError(400, "Invalid payment details.");
  }
  const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (!safeEqual(expected, signature)) throw new HttpError(400, "Payment could not be verified.");
  return finalize(env, orderId, paymentId, origin);
}

/** Step 3b: Razorpay's webhook (order.paid / payment.captured / payment.authorized). */
export async function handleWebhook(env, request, origin) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !razorpayConfigured(env)) throw new HttpError(404, "Not found");
  const raw = await request.text();
  if (raw.length > 500_000) throw new HttpError(413, "Invalid request");
  const expected = await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw);
  if (!safeEqual(expected, request.headers.get("X-Razorpay-Signature") || "")) {
    throw new HttpError(400, "Invalid signature");
  }
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid request");
  }
  if (!["order.paid", "payment.captured", "payment.authorized"].includes(event?.event)) return { ignored: true };
  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id) return { ignored: true };

  const known = await env.DB.prepare("SELECT 1 FROM payment_intents WHERE id = ?").bind(payment.order_id).first();
  if (!known) return { ignored: true }; // not a website checkout (e.g. a payment link)
  // Errors propagate as non-2xx so Razorpay retries the webhook later.
  const { order_id } = await finalize(env, payment.order_id, payment.id, origin);
  return { ok: true, order_id };
}

/**
 * Confirms the payment with Razorpay (capturing it if needed) and creates the
 * order exactly once, however many times it is called.
 */
async function finalize(env, rzpOrderId, paymentId, origin) {
  const intentRow = await env.DB.prepare("SELECT * FROM payment_intents WHERE id = ?").bind(rzpOrderId).first();
  if (!intentRow) throw new HttpError(404, "This payment was not started from this website.");
  if (intentRow.status === "paid") return existingOrder(env, intentRow);

  // Ask Razorpay directly: never trust the browser for amount or status.
  let payment = await razorpay(env, "GET", `/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== rzpOrderId || Number(payment.amount) !== Number(intentRow.amount) || payment.currency !== "INR") {
    console.error(`[razorpay] payment ${paymentId} does not match order ${rzpOrderId}`);
    throw new HttpError(400, "Payment could not be verified.");
  }
  if (payment.status === "authorized") {
    payment = await razorpay(env, "POST", `/payments/${encodeURIComponent(paymentId)}/capture`, {
      amount: Number(intentRow.amount), currency: "INR",
    });
  }
  if (payment.status !== "captured") throw new HttpError(402, "Payment was not completed.");

  // Claim the intent so the browser and the webhook cannot both create the order.
  const now = Date.now();
  const claim = await env.DB.prepare(
    `UPDATE payment_intents SET status = 'processing', payment_id = ?, updated_date = ?
     WHERE id = ? AND (status = 'created' OR (status = 'processing' AND updated_date < ?))`
  ).bind(paymentId, new Date(now).toISOString(), rzpOrderId, new Date(now - STALE_CLAIM_MS).toISOString()).run();
  if (claim.meta.changes !== 1) {
    const latest = await env.DB.prepare("SELECT * FROM payment_intents WHERE id = ?").bind(rzpOrderId).first();
    if (latest?.status === "paid") return existingOrder(env, latest);
    throw new HttpError(409, "Your payment is being confirmed. Please wait a moment.");
  }

  const intent = JSON.parse(intentRow.data);
  const paidAt = payment.created_at ? new Date(payment.created_at * 1000).toISOString() : nowIso();
  let result;
  try {
    for (let attempt = 1; ; attempt++) {
      try {
        result = await placePaidOrder(env, intent, {
          razorpay_order_id: rzpOrderId, razorpay_payment_id: paymentId, amount: Number(intentRow.amount), paid_at: paidAt,
        }, origin);
        break;
      } catch (err) {
        // A concurrent order touched the same product or customer: re-read and retry.
        if (!(err instanceof HttpError && err.status === 409) || attempt >= 3) throw err;
      }
    }
  } catch (err) {
    // Release the claim so the webhook (or the customer retrying) can try again.
    console.error(`[razorpay] PAID but order not saved for ${rzpOrderId} / ${paymentId}:`, err.message);
    await env.DB.prepare("UPDATE payment_intents SET status = 'created', error = ?, updated_date = ? WHERE id = ?")
      .bind(String(err.message).slice(0, 500), nowIso(), rzpOrderId).run();
    throw new HttpError(500, `Your payment was received but the order could not be saved yet. Please contact us with payment ID ${paymentId}.`);
  }
  // The order exists now. If this update fails the claim goes stale after
  // STALE_CLAIM_MS, so record it with a retry rather than risk a second order.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await env.DB.prepare("UPDATE payment_intents SET status = 'paid', order_id = ?, error = NULL, updated_date = ? WHERE id = ?")
        .bind(result.order_id, nowIso(), rzpOrderId).run();
      break;
    } catch (err) {
      console.error(`[razorpay] could not mark ${rzpOrderId} paid (order ${result.order_id}):`, err.message);
    }
  }
  return result;
}

async function existingOrder(env, intentRow) {
  const order = await records.getOrderByNumber(env, intentRow.order_id);
  if (!order) throw new HttpError(404, "Order not found");
  return { order_id: order.order_id, order: publicOrder(order) };
}
