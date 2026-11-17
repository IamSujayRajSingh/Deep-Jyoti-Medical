import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Truck, MapPin, Package, Phone, Mail } from "lucide-react";

import { formatINR } from "@/lib/format";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/orders";

export default function OrderConfirmed() {
  const { orderId } = useParams();
  const order = useLocation().state?.order;
  if (!order || order.order_id !== orderId) {
    return <Navigate to={`/track-order/${encodeURIComponent(orderId)}`} replace />;
  }

  const a = order.delivery_address || {};

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/15 mb-4">
            <CheckCircle2 className="w-9 h-9 text-secondary" />
          </div>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your order. We'll process it shortly.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Order ID</p>
                <p className="font-heading text-xl font-bold text-primary">{order.order_id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Order Date</p>
                <p className="text-sm font-medium">{new Date(order.created_date).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
                <p className="font-semibold">{order.payment_method === "cod" ? "Cash on Delivery" : "Online"}</p>
                <p className="text-xs text-muted-foreground">{PAYMENT_LABELS[order.payment_status]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Status</p>
                <p className="font-semibold">{STATUS_LABELS[order.order_status]}</p>
              </div>
            </div>

            {order.payment_method === "cod" && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay on Delivery</p>
                <p className="font-heading text-3xl font-bold text-secondary">{formatINR(order.final_total)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Order Summary</h2>
            <div className="space-y-3">
              {(order.items || []).map((it) => (
                <div key={it.product_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-white border border-border/40 overflow-hidden shrink-0">
                    <img src={it.product_image} alt={it.product_name} className="w-full h-full object-contain p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${it.slug}`} className="text-sm font-medium line-clamp-2 hover:underline">{it.product_name}</Link>
                    <p className="text-xs text-muted-foreground">Qty: {it.quantity} × {formatINR(it.unit_price)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatINR(it.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              {order.shipping_fee ? <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatINR(order.shipping_fee)}</span></div> : null}
              {order.cod_fee ? <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span>{formatINR(order.cod_fee)}</span></div> : null}
              {order.tax ? <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(order.tax)}</span></div> : null}
              <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="text-primary">{formatINR(order.final_total)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery address */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</h2>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{a.line1}{a.line2 ? ", " + a.line2 : ""}{a.landmark ? ", " + a.landmark : ""}</p>
            <p className="text-sm text-muted-foreground">{a.city}, {a.state} — {a.pincode}</p>
            <p className="text-sm text-muted-foreground">{a.country}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="w-3.5 h-3.5" /> {order.customer_phone}</a>
              {order.customer_email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {order.customer_email}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/track-order/${order.order_id}`} className="flex-1">
            <Button variant="outline" className="w-full"><Truck className="w-4 h-4" /> Track Your Order</Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
