import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Settings as SettingsIcon, Banknote, Mail, CreditCard } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { getSettings } from "@/lib/orders";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => { setSettings(await getSettings()); })();
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const data = {
        admin_email: settings.admin_email,
        cod_enabled: settings.cod_enabled,
        online_payment_enabled: settings.online_payment_enabled !== false,
        cod_min_order_value: Number(settings.cod_min_order_value) || 0,
        cod_max_order_value: Number(settings.cod_max_order_value) || 0,
        cod_handling_fee: Number(settings.cod_handling_fee) || 0,
        cod_free_threshold: Number(settings.cod_free_threshold) || 0,
        cod_pincodes: settings.cod_pincodes || "",
        shipping_fee: Number(settings.shipping_fee) || 0,
        free_shipping_threshold: Number(settings.free_shipping_threshold) || 0,
        tax_rate: Number(settings.tax_rate) || 0,
        enable_new_order_email: settings.enable_new_order_email,
        enable_customer_email: settings.enable_customer_email,
        allow_resend_email: settings.allow_resend_email,
        low_stock_threshold: Number(settings.low_stock_threshold) || 10,
      };
      if (settings._id) {
        await db.entities.StoreSetting.update(settings._id, data);
      } else {
        const created = await db.entities.StoreSetting.create(data);
        setSettings({ ...settings, _id: created.id });
      }
      toast({ title: "Settings saved" });
    } catch (e) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (!settings) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure checkout, COD, and notifications</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}</Button>
      </div>

      {/* Online payment */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="w-4 h-4" /> Online Payment (Razorpay)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Enable online payment at checkout</Label>
            <Switch checked={settings.online_payment_enabled !== false} onCheckedChange={(v) => set("online_payment_enabled", v)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Only shown to customers when the Razorpay keys are set on the server. Refunds are made from the Razorpay dashboard; then mark the order's payment as Refunded here.
          </p>
        </CardContent>
      </Card>

      {/* COD */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Banknote className="w-4 h-4" /> Cash on Delivery</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Cash on Delivery</Label>
            <Switch checked={settings.cod_enabled} onCheckedChange={(v) => set("cod_enabled", v)} />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Minimum Order Value (₹)</Label>
              <Input type="number" value={settings.cod_min_order_value} onChange={(e) => set("cod_min_order_value", e.target.value)} />
            </div>
            <div>
              <Label>Maximum Order Value (₹)</Label>
              <Input type="number" value={settings.cod_max_order_value} onChange={(e) => set("cod_max_order_value", e.target.value)} />
            </div>
            <div>
              <Label>COD Handling Fee (₹)</Label>
              <Input type="number" value={settings.cod_handling_fee} onChange={(e) => set("cod_handling_fee", e.target.value)} />
            </div>
            <div>
              <Label>Free COD Threshold (₹) — 0 = never free</Label>
              <Input type="number" value={settings.cod_free_threshold} onChange={(e) => set("cod_free_threshold", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>COD Pincodes — comma-separated, or empty for all</Label>
            <Input value={settings.cod_pincodes} onChange={(e) => set("cod_pincodes", e.target.value)} placeholder="e.g. 700001,700009,700014" />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Tax */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Shipping & Tax</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Shipping Fee (₹)</Label>
            <Input type="number" value={settings.shipping_fee} onChange={(e) => set("shipping_fee", e.target.value)} />
          </div>
          <div>
            <Label>Free Shipping Threshold (₹)</Label>
            <Input type="number" value={settings.free_shipping_threshold} onChange={(e) => set("free_shipping_threshold", e.target.value)} />
          </div>
          <div>
            <Label>Tax Rate (%)</Label>
            <Input type="number" value={settings.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Mail className="w-4 h-4" /> Order Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Admin Email Address (receives new order notifications — must be a registered app user)</Label>
            <Input type="email" value={settings.admin_email} onChange={(e) => set("admin_email", e.target.value)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label>Enable New Order Email (to admin)</Label>
            <Switch checked={settings.enable_new_order_email} onCheckedChange={(v) => set("enable_new_order_email", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Customer Confirmation Email</Label>
            <Switch checked={settings.enable_customer_email} onCheckedChange={(v) => set("enable_customer_email", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow Resend Email</Label>
            <Switch checked={settings.allow_resend_email} onCheckedChange={(v) => set("allow_resend_email", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Inventory</CardTitle></CardHeader>
        <CardContent>
          <Label>Low Stock Threshold (units)</Label>
          <Input type="number" value={settings.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} className="max-w-[160px]" />
          <p className="text-xs text-muted-foreground mt-1">Products at or below this count are flagged as low stock.</p>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}</Button>
    </div>
  );
}