import { db } from "@/api/client";

import { DEFAULT_SETTINGS } from "@/lib/orderLogic";

// The order rules (statuses, totals, COD eligibility) live in orderLogic.js so
// the server applies exactly the same ones.
export {
  ORDER_STATUSES, PAYMENT_STATUSES, CUSTOMER_STATUSES, STATUS_LABELS, PAYMENT_LABELS,
  DELIVERY_LABELS, DEFAULT_SETTINGS, mapDeliveryStatus, computeTotals, codEligible,
} from "@/lib/orderLogic";

export async function getSettings() {
  try {
    const list = await db.entities.StoreSetting.list("-created_date", 1);
    if (list && list.length) return { ...DEFAULT_SETTINGS, ...list[0], _id: list[0].id };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Re-sends the admin and customer emails for an order (admin only).
 * Returns { adminSent, customerSent, error }.
 */
export async function sendOrderEmails(order) {
  return db.orders.resendEmails(order.order_id);
}

/**
 * Places a guest order (no login required). The server re-checks prices, stock
 * and COD rules, assigns the order number and sends the emails.
 * Throws on validation failure. Returns { order_id, order }.
 */
export async function placeOrder({ items, customer, address, paymentMethod }) {
  if (!items || !items.length) throw new Error("Your cart is empty.");
  if (!customer.full_name || !customer.phone) throw new Error("Full name and mobile number are required.");
  if (!address.line1 || !address.city || !address.state || !address.pincode)
    throw new Error("Please complete the delivery address.");

  return db.orders.place({ items, customer, address, paymentMethod });
}
