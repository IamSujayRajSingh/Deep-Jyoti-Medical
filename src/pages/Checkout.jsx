import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Truck, MapPin, User, Loader2, Check, ShieldCheck, Banknote } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

import { formatINR } from "@/lib/format";
import { getSettings, computeTotals, codEligible, placeOrder } from "@/lib/orders";
import { useToast } from "@/components/ui/use-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh",
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: "",
    email: user?.email || "",
    alternate_phone: "",
    line1: "", line2: "", landmark: "",
    city: "", state: "West Bengal", pincode: "", country: "India",
  });
  const [errors, setErrors] = useState(/** @type {Partial<Record<keyof typeof form, string>>} */ ({}));

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      // fetch products in cart for stock validation
      const fetched = [];
      for (const it of items) {
        try { fetched.push(await db.entities.Product.get(it.id)); } catch { /* ignore */ }
      }
      setProducts(fetched);
    })();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * (i.price || 0), 0);
  const totals = computeTotals(subtotal, settings, "cod");
  const codCheck = settings ? codEligible(subtotal, settings, form.pincode) : { ok: false, reason: "" };

  const stockIssue = products.find((p) => {
    const ci = items.find((i) => i.id === p.id);
    if (!ci) return false;
    if (p.stock_status === "out_of_stock") return true;
    // Only block when an explicit numeric stock is tracked and insufficient;
    // null/undefined stock means inventory isn't tracked → treat as available.
    const sq = Number(p.stock_quantity);
    return Number.isFinite(sq) && sq < ci.qty;
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const normalizePhone = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    const mobile = normalizePhone(form.phone);
    if (!/^[6-9]\d{9}$/.test(mobile)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!form.line1.trim()) e.line1 = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "Please select your state";
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    if (!form.country.trim()) e.country = "Country is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (submitting) return; // double-click protection
    if (!validate()) {
      toast({ title: "Please check the form", description: "Some required fields are missing.", variant: "destructive" });
      return;
    }
    if (stockIssue) {
      toast({ title: "Stock issue", description: `"${stockIssue.name}" is no longer available in the requested quantity.`, variant: "destructive" });
      return;
    }
    if (!codCheck.ok) {
      toast({ title: "COD unavailable", description: codCheck.reason, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const mobile = normalizePhone(form.phone);
      const { order_id, order } = await placeOrder({
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        customer: {
          full_name: form.full_name.trim(), phone: `+91 ${mobile}`, email: form.email.trim(), alternate_phone: form.alternate_phone.trim(),
        },
        address: {
          line1: form.line1, line2: form.line2, landmark: form.landmark,
          city: form.city, state: form.state, pincode: form.pincode, country: form.country,
        },
        paymentMethod: "cod",
      });
      clearCart();
      navigate(`/order-confirmed/${order_id}`, { replace: true, state: { order } });
    } catch (err) {
      setSubmitting(false);
      toast({ title: "Order failed", description: err.message || "Could not place order. Please try again.", variant: "destructive" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add products to your cart before checking out.</p>
        <Link to="/products"><Button>Shop Now</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Complete your details and pay with Cash on Delivery.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: forms */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg"><User className="w-4 h-4" /> Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={form.full_name} onChange={set("full_name")} />
                    {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <Label>Mobile Number *</Label>
                    <Input value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input value={form.email} onChange={set("email")} placeholder="optional" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label>Alternate Phone</Label>
                    <Input value={form.alternate_phone} onChange={set("alternate_phone")} placeholder="optional" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-4 h-4" /> Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Address Line 1 *</Label>
                  <Input value={form.line1} onChange={set("line1")} placeholder="House no, building, street" />
                  {errors.line1 && <p className="text-xs text-destructive mt-1">{errors.line1}</p>}
                </div>
                <div>
                  <Label>Address Line 2</Label>
                  <Input value={form.line2} onChange={set("line2")} placeholder="Area, locality (optional)" />
                </div>
                <div>
                  <Label>Landmark</Label>
                  <Input value={form.landmark} onChange={set("landmark")} placeholder="Near... (optional)" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input value={form.city} onChange={set("city")} />
                    {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label>State *</Label>
                    <select value={form.state} onChange={set("state")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label>Pincode *</Label>
                    <Input value={form.pincode} onChange={set("pincode")} placeholder="6 digits" maxLength={6} />
                    {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode}</p>}
                  </div>
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input value={form.country} onChange={set("country")} />
                  {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg"><Banknote className="w-4 h-4" /> Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${codCheck.ok ? "border-primary bg-primary/5" : "border-border opacity-60"}`}>
                  <input type="radio" name="payment" checked readOnly disabled={!codCheck.ok} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Cash on Delivery</span>
                      {codCheck.ok && <Badge variant="secondary" className="text-xs">Available</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay {settings && formatINR(totals.finalTotal)} in cash when your order is delivered.
                    </p>
                    {!codCheck.ok && form.pincode && <p className="text-xs text-destructive mt-1">{codCheck.reason}</p>}
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-white border border-border/40 overflow-hidden shrink-0">
                      <img src={it.image} alt={it.name} className="w-full h-full object-contain p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{it.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {it.qty}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatINR(it.price * it.qty)}</span>
                  </div>
                ))}
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
                  {totals.discount > 0 && <div className="flex justify-between text-secondary"><span>Discount</span><span>-{formatINR(totals.discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totals.shippingFee ? formatINR(totals.shippingFee) : "Free"}</span></div>
                  {totals.codFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span>{formatINR(totals.codFee)}</span></div>}
                  {totals.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(totals.tax)}</span></div>}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span><span className="text-primary">{formatINR(totals.finalTotal)}</span>
                </div>
                {codCheck.ok && (
                  <p className="text-xs text-muted-foreground bg-muted/60 rounded p-2 flex items-start gap-1.5">
                    <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Pay {formatINR(totals.finalTotal)} in cash when your order is delivered.
                  </p>
                )}
                {!codCheck.ok && settings && (
                  <p className="text-xs text-destructive bg-destructive/5 rounded p-2 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" /> COD unavailable: {codCheck.reason}
                  </p>
                )}
                {stockIssue && (
                  <p className="text-xs text-destructive bg-destructive/5 rounded p-2">
                    "{stockIssue.name}" is out of stock or has insufficient quantity.
                  </p>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</> : <><Check className="w-4 h-4" /> Place Order (COD)</>}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Your information is secure & private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
