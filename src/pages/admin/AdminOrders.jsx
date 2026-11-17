import { db } from "@/api/client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye, Filter } from "lucide-react";

import { formatINR } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABELS, PAYMENT_LABELS, DELIVERY_LABELS } from "@/lib/orders";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { exportToCsv } from "@/lib/exportCsv";

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "high", label: "Highest Value" },
  { key: "low", label: "Lowest Value" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    (async () => {
      try { setOrders(await db.entities.Order.list("-created_date", 500)); }
      catch { setOrders([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let res = orders.filter((o) => {
      if (statusFilter !== "all" && o.order_status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.payment_status !== paymentFilter) return false;
      if (methodFilter !== "all" && o.payment_method !== methodFilter) return false;
      if (!q) return true;
      const a = o.delivery_address || {};
      return (
        (o.order_id || "").toLowerCase().includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").toLowerCase().includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q) ||
        (a.pincode || "").toLowerCase().includes(q)
      );
    });
    res = [...res].sort((a, b) => {
      if (sort === "newest") return Date.parse(b.created_date) - Date.parse(a.created_date);
      if (sort === "oldest") return Date.parse(a.created_date) - Date.parse(b.created_date);
      if (sort === "high") return (b.final_total || 0) - (a.final_total || 0);
      if (sort === "low") return (a.final_total || 0) - (b.final_total || 0);
      return 0;
    });
    return res;
  }, [orders, search, statusFilter, paymentFilter, methodFilter, sort]);

  const handleExport = () => {
    exportToCsv("orders.csv", filtered, [
      { label: "Order ID", get: (o) => o.order_id },
      { label: "Date", get: (o) => new Date(o.created_date).toLocaleString("en-IN") },
      { label: "Customer", get: (o) => o.customer_name },
      { label: "Phone", get: (o) => o.customer_phone },
      { label: "Email", get: (o) => o.customer_email || "" },
      { label: "Pincode", get: (o) => o.delivery_address?.pincode || "" },
      { label: "City", get: (o) => o.delivery_address?.city || "" },
      { label: "Items", get: (o) => (o.items || []).map((i) => `${i.product_name} x${i.quantity}`).join("; ") },
      { label: "Subtotal", get: (o) => o.subtotal },
      { label: "Shipping", get: (o) => o.shipping_fee },
      { label: "COD Fee", get: (o) => o.cod_fee },
      { label: "Tax", get: (o) => o.tax },
      { label: "Total", get: (o) => o.final_total },
      { label: "Payment Method", get: (o) => o.payment_method },
      { label: "Payment Status", get: (o) => o.payment_status },
      { label: "Order Status", get: (o) => o.order_status },
      { label: "Delivery Status", get: (o) => o.delivery_status },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} order(s)</p>
        </div>
        <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by Order ID, name, phone, email, pincode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="all">All Payments</option>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_LABELS[s]}</option>)}
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="all">All Methods</option>
              <option value="cod">COD</option>
              <option value="online">Online</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No orders match your filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3">Order ID</th>
                  <th className="text-left px-3 py-3">Date</th>
                  <th className="text-left px-3 py-3">Customer</th>
                  <th className="text-left px-3 py-3">Phone</th>
                  <th className="text-center px-3 py-3">Items</th>
                  <th className="text-right px-3 py-3">Value</th>
                  <th className="text-left px-3 py-3">Method</th>
                  <th className="text-left px-3 py-3">Payment</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-left px-3 py-3">Delivery</th>
                  <th className="text-center px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-3 py-3 font-semibold">{o.order_id}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{new Date(o.created_date).toLocaleDateString("en-IN")}</td>
                    <td className="px-3 py-3">{o.customer_name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.customer_phone}</td>
                    <td className="px-3 py-3 text-center">{(o.items || []).reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatINR(o.final_total)}</td>
                    <td className="px-3 py-3">{o.payment_method === "cod" ? "COD" : "Online"}</td>
                    <td className="px-3 py-3"><PaymentStatusBadge status={o.payment_status} /></td>
                    <td className="px-3 py-3"><OrderStatusBadge status={o.order_status} /></td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{DELIVERY_LABELS[o.delivery_status]}</td>
                    <td className="px-3 py-3 text-center">
                      <Link to={`/admin/orders/${o.order_id}`}>
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
