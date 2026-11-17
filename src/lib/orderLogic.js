// Order rules shared by the browser (src/lib/orders.js) and the server
// (server/orders.js). Keep this file free of browser-only and Node-only code,
// and use relative imports so Node can load it directly.
import { formatINR } from "./format.js";
import { BUSINESS } from "./constants.js";

export const ORDER_STATUSES = [
  "new", "confirmed", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled", "failed_delivery", "returned",
];

export const PAYMENT_STATUSES = ["pending", "cod", "paid", "failed", "refunded"];

export const CUSTOMER_STATUSES = ["new", "active", "repeat_customer", "inactive"];

export const STATUS_LABELS = {
  new: "New", confirmed: "Confirmed", processing: "Processing", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered",
  cancelled: "Cancelled", failed_delivery: "Failed Delivery", returned: "Returned",
};

export const PAYMENT_LABELS = {
  pending: "Pending", cod: "COD / Payment Pending", paid: "Paid", failed: "Failed", refunded: "Refunded",
};

export function mapDeliveryStatus(status) {
  const map = {
    new: "pending", confirmed: "pending", processing: "pending", packed: "pending",
    shipped: "shipped", out_for_delivery: "out_for_delivery", delivered: "delivered",
    cancelled: "cancelled", failed_delivery: "failed", returned: "returned",
  };
  return map[status] || "pending";
}

export const DELIVERY_LABELS = {
  pending: "Not Shipped", shipped: "Shipped", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", cancelled: "Cancelled", failed: "Failed", returned: "Returned",
};

export const DEFAULT_SETTINGS = {
  admin_email: BUSINESS.email,
  cod_enabled: true,
  cod_min_order_value: 0,
  cod_max_order_value: 50000,
  cod_handling_fee: 0,
  cod_free_threshold: 0,
  cod_pincodes: "",
  shipping_fee: 0,
  free_shipping_threshold: 0,
  tax_rate: 0,
  enable_new_order_email: true,
  enable_customer_email: true,
  allow_resend_email: true,
  low_stock_threshold: 10,
};

export function computeTotals(subtotal, settings, paymentMethod) {
  const s = settings || DEFAULT_SETTINGS;
  const discount = 0;
  let shippingFee = s.shipping_fee || 0;
  if (s.free_shipping_threshold && subtotal >= s.free_shipping_threshold) shippingFee = 0;
  let codFee = 0;
  if (paymentMethod === "cod") {
    codFee = s.cod_handling_fee || 0;
    if (s.cod_free_threshold && subtotal >= s.cod_free_threshold) codFee = 0;
  }
  const tax = Math.round((subtotal * (s.tax_rate || 0)) / 100);
  const finalTotal = subtotal - discount + shippingFee + codFee + tax;
  return { subtotal, discount, shippingFee, codFee, tax, finalTotal };
}

export function codEligible(subtotal, settings, pincode) {
  const s = settings || DEFAULT_SETTINGS;
  if (!s.cod_enabled) return { ok: false, reason: "Cash on Delivery is not available right now." };
  if (subtotal < (s.cod_min_order_value || 0))
    return { ok: false, reason: `COD requires a minimum order of ${formatINR(s.cod_min_order_value)}.` };
  if (s.cod_max_order_value && subtotal > s.cod_max_order_value)
    return { ok: false, reason: `COD is only available up to ${formatINR(s.cod_max_order_value)}.` };
  if (s.cod_pincodes && s.cod_pincodes.trim()) {
    const allowed = s.cod_pincodes.split(",").map((p) => p.trim()).filter(Boolean);
    if (pincode && !allowed.includes(String(pincode).trim()))
      return { ok: false, reason: `COD is not available for pincode ${pincode}.` };
  }
  return { ok: true };
}

// Customer-supplied text goes into HTML emails, so it is always escaped.
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const e = escapeHtml;

function addressHtml(a) {
  return `${e(a.line1)}${a.line2 ? ", " + e(a.line2) : ""}${a.landmark ? ", " + e(a.landmark) : ""}<br/>${e(a.city)}, ${e(a.state)} — ${e(a.pincode)}<br/>${e(a.country || "India")}`;
}

export function adminEmailBody(order, origin) {
  const a = order.delivery_address || {};
  const rows = (order.items || [])
    .map((it) => `<tr><td style="padding:6px 8px;border:1px solid #eee">${e(it.product_name)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:center">${e(it.quantity)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right">${formatINR(it.unit_price)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right">${formatINR(it.subtotal)}</td></tr>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
    <h2 style="color:#1f3a2e">New Order Received — #${e(order.order_id)}</h2>
    <p><strong>Date:</strong> ${new Date(order.created_date || Date.now()).toLocaleString("en-IN")}</p>
    <p><strong>Customer:</strong> ${e(order.customer_name)}<br/><strong>Phone:</strong> ${e(order.customer_phone)}<br/><strong>Email:</strong> ${e(order.customer_email || "—")}</p>
    <h3 style="color:#1f3a2e;margin-top:20px">Delivery Address</h3>
    <p>${addressHtml(a)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#f5f5f0"><th style="padding:6px 8px;border:1px solid #eee;text-align:left">Product</th><th style="padding:6px 8px;border:1px solid #eee">Qty</th><th style="padding:6px 8px;border:1px solid #eee;text-align:right">Price</th><th style="padding:6px 8px;border:1px solid #eee;text-align:right">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
    <table style="width:100%;margin-top:12px;font-size:14px">
      <tr><td>Subtotal</td><td style="text-align:right">${formatINR(order.subtotal)}</td></tr>
      ${order.discount ? `<tr><td>Discount</td><td style="text-align:right">-${formatINR(order.discount)}</td></tr>` : ""}
      <tr><td>Shipping</td><td style="text-align:right">${formatINR(order.shipping_fee)}</td></tr>
      ${order.cod_fee ? `<tr><td>COD Fee</td><td style="text-align:right">${formatINR(order.cod_fee)}</td></tr>` : ""}
      ${order.tax ? `<tr><td>Tax</td><td style="text-align:right">${formatINR(order.tax)}</td></tr>` : ""}
      <tr style="font-weight:bold;font-size:16px"><td>Grand Total</td><td style="text-align:right">${formatINR(order.final_total)}</td></tr>
    </table>
    <p style="margin-top:16px"><strong>Payment Method:</strong> ${order.payment_method === "cod" ? "Cash on Delivery" : "Online"}<br/><strong>Payment Status:</strong> ${e(PAYMENT_LABELS[order.payment_status] || order.payment_status)}<br/><strong>Order Status:</strong> ${e(STATUS_LABELS[order.order_status] || order.order_status)}</p>
    <a href="${e(origin)}/admin/orders/${encodeURIComponent(order.order_id)}" style="display:inline-block;margin-top:16px;background:#1f3a2e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">View Order in Admin Dashboard</a>
  </div>`;
}

export function customerEmailBody(order, origin) {
  const a = order.delivery_address || {};
  const rows = (order.items || [])
    .map((it) => `<tr><td style="padding:6px 8px;border:1px solid #eee">${e(it.product_name)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:center">${e(it.quantity)}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right">${formatINR(it.subtotal)}</td></tr>`)
    .join("");
  const codLine = order.payment_method === "cod"
    ? `<p style="background:#f5f5f0;padding:12px;border-radius:6px"><strong>Payment Method: Cash on Delivery</strong><br/>Amount Payable on Delivery: <strong style="font-size:18px">${formatINR(order.final_total)}</strong></p>`
    : `<p><strong>Payment Method:</strong> Online</p>`;
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
    <h2 style="color:#1f3a2e">Order Confirmed — #${e(order.order_id)}</h2>
    <p>Thank you for your order with ${e(BUSINESS.name)}! We have received your order and will process it shortly.</p>
    ${codLine}
    <h3 style="color:#1f3a2e;margin-top:20px">Order Summary</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#f5f5f0"><th style="padding:6px 8px;border:1px solid #eee;text-align:left">Product</th><th style="padding:6px 8px;border:1px solid #eee">Qty</th><th style="padding:6px 8px;border:1px solid #eee;text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <table style="width:100%;margin-top:12px;font-size:14px">
      <tr><td>Subtotal</td><td style="text-align:right">${formatINR(order.subtotal)}</td></tr>
      ${order.shipping_fee ? `<tr><td>Shipping</td><td style="text-align:right">${formatINR(order.shipping_fee)}</td></tr>` : ""}
      ${order.cod_fee ? `<tr><td>COD Fee</td><td style="text-align:right">${formatINR(order.cod_fee)}</td></tr>` : ""}
      <tr style="font-weight:bold;font-size:16px"><td>Total Amount</td><td style="text-align:right">${formatINR(order.final_total)}</td></tr>
    </table>
    <h3 style="color:#1f3a2e;margin-top:20px">Delivery Address</h3>
    <p>${e(order.customer_name)}<br/>${addressHtml(a)}</p>
    <p><strong>Order Status:</strong> ${e(STATUS_LABELS[order.order_status] || order.order_status)}</p>
    <p><a href="${e(origin)}/track-order/${encodeURIComponent(order.order_id)}">Track your order</a> using the mobile number from checkout.</p>
    <p style="margin-top:16px;color:#666;font-size:13px">For any queries, contact ${e(BUSINESS.name)} at ${e(BUSINESS.phone)} or reply to this email.</p>
  </div>`;
}
