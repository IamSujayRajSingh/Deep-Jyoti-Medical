// Server-side order placement. The browser sends only product ids, quantities
// and the customer's details; prices, stock, totals, COD rules, order numbers
// and emails are all decided here so they cannot be tampered with.
import { HttpError, records, buildCreate, buildUpdate, guardCheckoutRecord, nextCounter, nowIso, sortRecords } from "./db.js";
import { sendEmail, emailConfigured } from "./email.js";
import {
  DEFAULT_SETTINGS, computeTotals, codEligible, adminEmailBody, customerEmailBody,
} from "../src/lib/orderLogic.js";

const text = (value, max = 200) => String(value ?? "").trim().slice(0, max);

function mobileNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export async function trackOrder(env, { orderId, phone }) {
  const number = text(orderId, 40).toUpperCase();
  const mobile = mobileNumber(phone);
  if (!/^DJM-\d+$/.test(number) || !/^\d{10}$/.test(mobile)) {
    throw new HttpError(400, "Enter your order ID and 10-digit mobile number.");
  }
  const order = await records.getOrderByNumber(env, number);
  if (!order || mobileNumber(order.customer_phone) !== mobile) {
    throw new HttpError(404, "No order matched that order ID and mobile number.");
  }
  const { order_id, created_date, payment_method, payment_status, delivery_status, order_status, final_total } = order;
  return {
    order_id, created_date, payment_method, payment_status, delivery_status, order_status, final_total,
    timeline: (order.timeline || []).map(({ status, changed_at }) => ({ status, changed_at })),
  };
}

export async function getSettings(env) {
  const list = sortRecords(await records.all(env, "StoreSetting"), "-created_date");
  return list.length ? { ...DEFAULT_SETTINGS, ...list[0] } : { ...DEFAULT_SETTINGS };
}

function validate(body) {
  const customer = body?.customer || {};
  const address = body?.address || {};
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) throw new HttpError(400, "Your cart is empty.");
  if (items.length > 50) throw new HttpError(400, "Too many items in one order.");

  const mobile = mobileNumber(customer.phone);
  if (!text(customer.full_name)) throw new HttpError(400, "Full name and mobile number are required.");
  if (!/^[6-9]\d{9}$/.test(mobile)) throw new HttpError(400, "Enter a valid 10-digit Indian mobile number.");
  const email = text(customer.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email.");
  if (!text(address.line1) || !text(address.city) || !text(address.state))
    throw new HttpError(400, "Please complete the delivery address.");
  if (!/^\d{6}$/.test(text(address.pincode))) throw new HttpError(400, "Enter a valid 6-digit pincode.");
  if (!["cod", "online"].includes(body.paymentMethod)) throw new HttpError(400, "Choose a payment method.");

  // Merge duplicate lines for the same product so stock is checked against the total.
  const merged = new Map();
  for (const it of items) {
    const id = String(it.id);
    const qty = Math.floor(Number(it.qty));
    merged.set(id, (merged.get(id) || 0) + (Number.isFinite(qty) ? qty : 1));
  }

  return {
    items: [...merged].map(([id, qty]) => ({ id, qty })),
    customer: {
      full_name: text(customer.full_name, 120),
      phone: `+91 ${mobile}`,
      email,
      alternate_phone: text(customer.alternate_phone, 30),
    },
    address: {
      line1: text(address.line1), line2: text(address.line2), landmark: text(address.landmark),
      city: text(address.city, 80), state: text(address.state, 80), pincode: text(address.pincode, 6),
      country: text(address.country, 80) || "India",
    },
    paymentMethod: body.paymentMethod,
  };
}

const trackedStockOf = (product) => {
  const raw = product.stock_quantity;
  const tracked = raw === null || raw === undefined || raw === "" ? null : Number(raw);
  return Number.isFinite(tracked) ? tracked : null;
};

/** Reads each product fresh, checks stock and returns priced order lines. */
async function priceCart(env, items) {
  const snapshot = [];
  for (const it of items) {
    const product = await records.get(env, "Product", it.id);
    if (!product) throw new HttpError(400, "A product in your cart is no longer available.");
    if (it.qty < 1 || it.qty > 999) throw new HttpError(400, `Invalid quantity for "${product.name}".`);
    const trackedStock = trackedStockOf(product);
    if (product.stock_status === "out_of_stock" || (trackedStock !== null && trackedStock < it.qty))
      throw new HttpError(409, `Only ${trackedStock ?? 0} unit(s) of "${product.name}" are available.`);
    const unitPrice = Number(product.selling_price) || 0;
    snapshot.push({
      product, trackedStock,
      line: {
        product_id: String(product.id), product_name: product.name, product_image: product.image || "",
        slug: product.slug || "", quantity: it.qty, unit_price: unitPrice, subtotal: unitPrice * it.qty,
      },
    });
  }
  return snapshot;
}

/**
 * Prices and checks a checkout without saving anything.
 * Returns { customer, address, paymentMethod, settings, snapshot, totals }.
 */
export async function prepareCheckout(env, body) {
  const checkout = validate(body);
  const settings = await getSettings(env);
  const snapshot = await priceCart(env, checkout.items);
  const subtotal = snapshot.reduce((sum, s) => sum + s.line.subtotal, 0);
  if (checkout.paymentMethod === "cod") {
    const eligibility = codEligible(subtotal, settings, checkout.address.pincode);
    if (!eligibility.ok) throw new HttpError(400, eligibility.reason);
  } else if (settings.online_payment_enabled === false) {
    throw new HttpError(400, "Online payment is not available right now.");
  }
  return { ...checkout, settings, snapshot, totals: computeTotals(subtotal, settings, checkout.paymentMethod) };
}

/** Places a Cash on Delivery order. */
export async function placeOrder(env, body, origin) {
  const checkout = await prepareCheckout(env, body);
  if (checkout.paymentMethod !== "cod") throw new HttpError(400, "Online orders are placed after payment.");
  return writeOrder(env, checkout, {
    payment_method: "cod", payment_status: "cod", note: "Order placed by customer",
  }, origin);
}

/**
 * Saves a paid online order from the lines and totals the customer paid for.
 * Stock is re-read now. A paid order is never refused for stock: shortfalls
 * are written into the admin notes instead.
 */
export async function placePaidOrder(env, intent, payment, origin) {
  const settings = await getSettings(env);
  const snapshot = [];
  const shortages = [];
  for (const line of intent.lines) {
    const product = await records.get(env, "Product", line.product_id);
    const trackedStock = product ? trackedStockOf(product) : null;
    if (!product) shortages.push(`"${line.product_name}" was deleted after payment`);
    else if (trackedStock !== null && trackedStock < line.quantity)
      shortages.push(`"${line.product_name}": ${line.quantity} paid, ${trackedStock} in stock`);
    snapshot.push({ product, trackedStock, line });
  }
  return writeOrder(env, { ...intent, settings, snapshot }, {
    payment_method: "online",
    payment_status: "paid",
    razorpay_order_id: payment.razorpay_order_id,
    razorpay_payment_id: payment.razorpay_payment_id,
    amount_paid: payment.amount / 100,
    paid_at: payment.paid_at,
    note: `Order placed and paid online (Razorpay ${payment.razorpay_payment_id})`,
    admin_notes: shortages.length ? `STOCK SHORTFALL after payment: ${shortages.join("; ")}` : "",
  }, origin);
}

async function writeOrder(env, { customer, address, settings, snapshot, totals }, payment, origin) {
  const { note, admin_notes = "", ...paymentFields } = payment;
  const now = nowIso();
  const writes = snapshot.filter((s) => s.product).map(({ product }) => guardCheckoutRecord(env, "Product", product));

  // Customer dedup by mobile number, then email.
  const customers = await records.all(env, "Customer");
  const existing = customers.find((c) => c.phone === customer.phone)
    || (customer.email && customers.find((c) => c.email && c.email.toLowerCase() === customer.email.toLowerCase()))
    || null;
  const addressFields = {
    address_line1: address.line1, address_line2: address.line2, landmark: address.landmark,
    city: address.city, state: address.state, pincode: address.pincode, country: address.country,
  };
  let customerId;
  if (!existing) {
    customerId = `CUST-${1000 + (await nextCounter(env, "customer_number"))}`;
    writes.push(env.DB.prepare(
      `INSERT INTO checkout_guard (valid)
       SELECT 0 WHERE EXISTS (
         SELECT 1 FROM records WHERE entity = 'Customer' AND (
           json_extract(data, '$.phone') = ?1 OR (?2 <> '' AND lower(json_extract(data, '$.email')) = lower(?2))
         )
       )`
    ).bind(customer.phone, customer.email));
    writes.push(buildCreate(env, "Customer", {
      customer_id: customerId,
      full_name: customer.full_name, email: customer.email, phone: customer.phone,
      alternate_phone: customer.alternate_phone, ...addressFields,
      last_order_date: now, total_orders: 1, total_amount_spent: totals.finalTotal,
      average_order_value: totals.finalTotal, status: "new", notes: [],
    }).stmt);
  } else {
    writes.push(guardCheckoutRecord(env, "Customer", existing));
    customerId = existing.customer_id;
    const newTotal = (existing.total_orders || 0) + 1;
    const newSpent = (existing.total_amount_spent || 0) + totals.finalTotal;
    writes.push(buildUpdate(env, "Customer", existing, {
      email: customer.email || existing.email,
      alternate_phone: customer.alternate_phone || existing.alternate_phone,
      ...addressFields,
      last_order_date: now, total_orders: newTotal, total_amount_spent: newSpent,
      average_order_value: Math.round(newSpent / newTotal),
      status: newTotal > 1 ? "repeat_customer" : "new",
    }).stmt);
  }

  const orderWrite = buildCreate(env, "Order", {
    order_id: `DJM-${10000 + (await nextCounter(env, "order_number"))}`,
    customer_id: customerId,
    customer_name: customer.full_name, customer_phone: customer.phone, customer_email: customer.email,
    delivery_address: { ...address },
    items: snapshot.map((s) => s.line),
    subtotal: totals.subtotal, discount: totals.discount, shipping_fee: totals.shippingFee,
    cod_fee: totals.codFee, tax: totals.tax, final_total: totals.finalTotal,
    ...paymentFields,
    order_status: "new", delivery_status: "pending", admin_notes,
    timeline: [{ status: "new", previous_status: null, changed_by: "system", changed_at: now, note }],
    email_sent: false, customer_email_sent: false, email_error: "",
  });
  writes.push(orderWrite.stmt);

  // Reduce inventory (only for products whose stock is tracked)
  const lowThreshold = settings.low_stock_threshold || 10;
  for (const s of snapshot) {
    if (!s.product || s.trackedStock === null) continue;
    const newQty = Math.max(0, s.trackedStock - s.line.quantity);
    writes.push(buildUpdate(env, "Product", s.product, {
      stock_quantity: newQty,
      stock_status: newQty === 0 ? "out_of_stock" : newQty <= lowThreshold ? "limited" : "in_stock",
    }).stmt);
  }

  // Customer, order and stock changes are saved together or not at all.
  try {
    await env.DB.batch(writes);
  } catch (error) {
    if (!String(error.message).includes("checkout_snapshot_changed")) throw error;
    throw new HttpError(409, "The order details changed during checkout. Review your cart and try again.");
  }
  const order = orderWrite.record;

  // Emails are best-effort: a failure never cancels the order.
  const result = await sendOrderEmails(env, order, settings, origin);
  if (result.adminSent || result.customerSent || result.error) {
    try {
      await env.DB.prepare(
        `UPDATE records SET data = json_set(data, '$.email_sent', json(?), '$.customer_email_sent', json(?), '$.email_error', ?),
         updated_date = ? WHERE entity = 'Order' AND id = ?`
      ).bind(JSON.stringify(result.adminSent), JSON.stringify(result.customerSent), result.error, nowIso(), order.id).run();
    } catch {
      console.error("[orders] Could not save email delivery status");
    }
  }
  return { order_id: order.order_id, order: publicOrder(order) };
}

/** The parts of an order the customer's confirmation page shows. */
export function publicOrder(order) {
  const { customer_name, customer_phone, customer_email, delivery_address, order_id, created_date,
    items, subtotal, shipping_fee, cod_fee, tax, final_total,
    payment_method, payment_status, order_status, razorpay_payment_id } = order;
  return { order_id, customer_name, customer_phone, customer_email, delivery_address, created_date,
    items, subtotal, shipping_fee, cod_fee, tax, final_total,
    payment_method, payment_status, order_status, razorpay_payment_id };
}

export async function sendOrderEmails(env, order, settings, origin) {
  let adminSent = false;
  let customerSent = false;
  let error = "";
  if (settings.enable_new_order_email && settings.admin_email) {
    try {
      const r = await sendEmail(env, { to: settings.admin_email, subject: `New Order Received — #${order.order_id}`, html: adminEmailBody(order, origin) });
      adminSent = r.sent;
    } catch (err) { error = `Admin email failed: ${err.message}`; }
  }
  if (settings.enable_customer_email && order.customer_email) {
    try {
      const r = await sendEmail(env, { to: order.customer_email, subject: `Order Confirmed — #${order.order_id}`, html: customerEmailBody(order, origin) });
      customerSent = r.sent;
    } catch (err) { error += (error ? " | " : "") + `Customer email failed: ${err.message}`; }
  }
  if (!error && !emailConfigured(env)) error = "Emails were not sent: email is not set up on the server.";
  return { adminSent, customerSent, error };
}
