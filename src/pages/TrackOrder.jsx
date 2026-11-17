import { db } from "@/api/client";

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Package, Clock, ArrowLeft } from "lucide-react";

import { formatINR } from "@/lib/format";
import { STATUS_LABELS, PAYMENT_LABELS, DELIVERY_LABELS } from "@/lib/orders";

const FLOW = ["new", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

export default function TrackOrder() {
  const { orderId } = useParams();
  return <OrderLookup key={orderId} initialOrderId={orderId || ""} />;
}

function OrderLookup({ initialOrderId }) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setOrder(await db.orders.track(orderId, phone));
      setPhone("");
    } catch (error) {
      setError(error.message || "Could not look up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!order) return <div className="min-h-screen pt-24 px-4 pb-16">
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <h1 className="font-heading text-2xl font-bold mb-4">Track Order</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-id">Order ID</Label>
            <Input id="tracking-id" value={orderId} onChange={(e) => setOrderId(e.target.value)} maxLength={40} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-phone">Mobile number used at checkout</Label>
            <Input id="tracking-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={24} required />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Checking…" : "Track order"}</Button>
        </form>
      </CardContent>
    </Card>
  </div>;

  const currentIdx = FLOW.indexOf(order.order_status);
  const isCancelled = ["cancelled", "failed_delivery", "returned"].includes(order.order_status);
  const timeline = order.timeline || [];

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">Track Order</h1>
            <p className="text-primary font-semibold">{order.order_id}</p>
          </div>
          <Badge variant={isCancelled ? "destructive" : "secondary"}>
            {STATUS_LABELS[order.order_status]}
          </Badge>
        </div>

        {/* Progress */}
        {!isCancelled && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {FLOW.map((step, i) => (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    {i < FLOW.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentIdx ? "bg-secondary" : "bg-border"}`} />
                    )}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs ${i <= currentIdx ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {i < currentIdx ? <CheckCircle2 className="w-4 h-4" /> : i === currentIdx ? <Package className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 text-center hidden sm:block ${i <= currentIdx ? "text-foreground font-medium" : "text-muted-foreground"}`}>{STATUS_LABELS[step]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span><span>{new Date(order.created_date).toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Method</span><span>{order.payment_method === "cod" ? "Cash on Delivery" : "Online"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Status</span><span>{PAYMENT_LABELS[order.payment_status]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery Status</span><span>{DELIVERY_LABELS[order.delivery_status]}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total Amount</span><span className="text-primary">{formatINR(order.final_total)}</span></div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Order Timeline</h2>
            <div className="space-y-4">
              {[...timeline].reverse().map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-secondary" : "bg-muted-foreground/40"}`} />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium">{t.status.startsWith("payment:") ? `Payment: ${PAYMENT_LABELS[t.status.replace("payment:", "")] || t.status}` : STATUS_LABELS[t.status] || t.status}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.changed_at).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
