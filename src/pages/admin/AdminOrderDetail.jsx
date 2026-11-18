import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Mail, Phone, MessageCircle, Save, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABELS, PAYMENT_LABELS, mapDeliveryStatus, sendOrderEmails } from "@/lib/orders";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { WHATSAPP_URL, CALL_URL } from "@/lib/constants";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [newPayment, setNewPayment] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);

  const load = async () => {
    const found = await db.entities.Order.filter({ order_id: orderId }, "-created_date", 1);
    setOrder(found && found[0] || null);
    if (found && found[0]) {
      setAdminNotes(found[0].admin_notes || "");
      setNewStatus(found[0].order_status);
      setNewPayment(found[0].payment_status);
    }
  };

  useEffect(() => {
    (async () => {
      try { await load(); } catch { setOrder(null); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const restoreStock = async (items) => {
    for (const it of items) {
      try {
        const p = await db.entities.Product.get(it.product_id);
        const newQty = (Number(p.stock_quantity) || 0) + (Number(it.quantity) || 0);
        const newStatus = newQty === 0 ? "out_of_stock" : newQty <= 10 ? "limited" : "in_stock";
        await db.entities.Product.update(it.product_id, { stock_quantity: newQty, stock_status: newStatus });
      } catch { /* ignore */ }
    }
  };

  const handleStatusUpdate = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const timeline = [...(order.timeline || [])];
      const now = new Date().toISOString();
      const updates = {};
      if (newStatus && newStatus !== order.order_status) {
        timeline.push({ status: newStatus, previous_status: order.order_status, changed_by: user.email, changed_at: now, note: statusNote || "" });
        updates.order_status = newStatus;
        updates.delivery_status = mapDeliveryStatus(newStatus);
        if (["cancelled", "failed_delivery", "returned"].includes(newStatus)) {
          await restoreStock(order.items || []);
        }
      }
      if (newPayment && newPayment !== order.payment_status) {
        updates.payment_status = newPayment;
        timeline.push({ status: `payment:${newPayment}`, previous_status: `payment:${order.payment_status}`, changed_by: user.email, changed_at: now, note: `Payment marked ${newPayment}` });
      }
      if (Object.keys(updates).length === 0) {
        toast({ title: "No changes to apply" });
        setUpdating(false);
        return;
      }
      updates.timeline = timeline;
      await db.entities.Order.update(order.id, updates);
      setStatusNote("");
      await load();
      toast({ title: "Order updated" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      const timeline = [...(order.timeline || []), { status: "cancelled", previous_status: order.order_status, changed_by: user.email, changed_at: now, note: "Order cancelled by admin" }];
      await restoreStock(order.items || []);
      await db.entities.Order.update(order.id, { order_status: "cancelled", delivery_status: "cancelled", timeline });
      await load();
      toast({ title: "Order cancelled & stock restored" });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setUpdating(false); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await db.entities.Order.update(order.id, { admin_notes: adminNotes });
      await load();
      toast({ title: "Notes saved" });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setSavingNotes(false); }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const res = await sendOrderEmails(order);
      await load();
      if (res.error) toast({ title: "Email partially sent", description: res.error, variant: "destructive" });
      else toast({ title: "Emails resent successfully" });
    } catch (e) { toast({ title: "Resend failed", description: e.message, variant: "destructive" }); }
    finally { setResending(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  if (!order) return <div className="text-center py-20"><p className="text-muted-foreground mb-4">Order not found.</p><Link to="/admin/orders"><Button>Back to Orders</Button></Link></div>;

  const a = order.delivery_address || {};
  const timeline = (order.timeline || []).slice().reverse();

  return (
    <div className="space-y-5 print:space-y-3">
      <div className="flex items-center justify-between no-print">
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Button>
          <Button variant="outline" size="sm" onClick={handleResendEmail} disabled={resending}>
            {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Resend Email
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-bold">{order.order_id}</h1>
              <p className="text-sm text-muted-foreground">{new Date(order.created_date).toLocaleString("en-IN")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.order_status} />
              <PaymentStatusBadge status={order.payment_status} />
              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold bg-muted">
                {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
              </span>
              {order.razorpay_payment_id && (
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono bg-muted" title="Razorpay payment ID — refunds are made from the Razorpay dashboard">
                  {order.razorpay_payment_id}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Customer + Address */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Customer & Delivery</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">{order.customer_name}</p>
                <div className="flex flex-wrap gap-4 mt-1 text-sm">
                  <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="w-3.5 h-3.5" /> {order.customer_phone}</a>
                  {order.customer_email && <a href={`mailto:${order.customer_email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="w-3.5 h-3.5" /> {order.customer_email}</a>}
                  <a href={CALL_URL} className="flex items-center gap-1 text-secondary hover:underline"><Phone className="w-3.5 h-3.5" /> Call</a>
                  <a href={WHATSAPP_URL(`Hello ${order.customer_name}, regarding your order ${order.order_id}...`)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-secondary hover:underline"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground uppercase mb-1">Delivery Address</p>
                <p className="text-sm">{a.line1}{a.line2 ? ", " + a.line2 : ""}{a.landmark ? ", " + a.landmark : ""}</p>
                <p className="text-sm">{a.city}, {a.state} — {a.pincode}</p>
                <p className="text-sm text-muted-foreground">{a.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Products</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr><th className="text-left px-4 py-2">Product</th><th className="text-center px-4 py-2">Qty</th><th className="text-right px-4 py-2">Unit Price</th><th className="text-right px-4 py-2">Subtotal</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(order.items || []).map((it) => (
                    <tr key={it.product_id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-white border border-border/40 overflow-hidden shrink-0">
                            <img src={it.product_image} alt="" className="w-full h-full object-contain p-0.5" />
                          </div>
                          <Link to={`/products/${it.slug}`} className="font-medium hover:underline line-clamp-2">{it.product_name}</Link>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">{it.quantity}</td>
                      <td className="text-right px-4 py-3">{formatINR(it.unit_price)}</td>
                      <td className="text-right px-4 py-3 font-semibold">{formatINR(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-5 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.discount ? <div className="flex justify-between text-secondary"><span>Discount</span><span>-{formatINR(order.discount)}</span></div> : null}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping_fee ? formatINR(order.shipping_fee) : "Free"}</span></div>
              {order.cod_fee ? <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span>{formatINR(order.cod_fee)}</span></div> : null}
              {order.tax ? <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(order.tax)}</span></div> : null}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Grand Total</span><span className="text-primary">{formatINR(order.final_total)}</span></div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Order Timeline</CardTitle></CardHeader>
            <CardContent>
              {timeline.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
                <div className="space-y-3">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{t.status.startsWith("payment:") ? `Payment: ${PAYMENT_LABELS[t.status.replace("payment:", "")]}` : STATUS_LABELS[t.status] || t.status}</p>
                        {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(t.changed_at).toLocaleString("en-IN")} · {t.changed_by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: status + notes */}
        <div className="space-y-5">
          <Card className="no-print">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Order Status</Label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <select value={newPayment} onChange={(e) => setNewPayment(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <Label>Note (optional)</Label>
                <Input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="e.g. Customer confirmed address" />
              </div>
              <Button className="w-full" onClick={handleStatusUpdate} disabled={updating}>
                {updating ? "Updating..." : "Apply Update"}
              </Button>
              {order.payment_method === "cod" && order.payment_status !== "paid" && (
                <Button variant="secondary" className="w-full" onClick={() => { setNewPayment("paid"); }} disabled={updating}>
                  <CheckCircle2 className="w-4 h-4" /> Mark Payment Received
                </Button>
              )}
              {order.order_status !== "cancelled" && (
                <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCancel} disabled={updating}>
                  <XCircle className="w-4 h-4" /> Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="no-print">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Admin Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} placeholder="Internal notes (never shown to customer)" />
              <Button variant="outline" className="w-full" onClick={handleSaveNotes} disabled={savingNotes}>
                <Save className="w-4 h-4" /> {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
