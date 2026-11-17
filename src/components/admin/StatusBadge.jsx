import React from "react";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/orders";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  processing: "bg-amber-100 text-amber-800 border-amber-200",
  packed: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
  out_for_delivery: "bg-teal-100 text-teal-800 border-teal-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  failed_delivery: "bg-orange-100 text-orange-800 border-orange-200",
  returned: "bg-rose-100 text-rose-800 border-rose-200",
};

const PAYMENT_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  cod: "bg-orange-100 text-orange-800 border-orange-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
};

export function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || "bg-muted text-muted-foreground border-border"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[status] || "bg-muted text-muted-foreground border-border"}`}>
      {PAYMENT_LABELS[status] || status}
    </span>
  );
}