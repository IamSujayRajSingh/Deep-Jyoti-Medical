import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, PackageX, Boxes, Plus, Minus } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { getSettings } from "@/lib/orders";

const STATUS_CLS = {
  in_stock: "bg-green-100 text-green-800",
  limited: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
};
const STATUS_LABEL = { in_stock: "In Stock", limited: "Low Stock", out_of_stock: "Out of Stock" };

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [adjust, setAdjust] = useState({});
  const { toast } = useToast();

  const load = async () => {
    try {
      const s = await getSettings();
      setThreshold(s.low_stock_threshold || 10);
      setProducts(await db.entities.Product.list("-created_date", 500));
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const lowStock = products.filter((p) => (p.stock_quantity || 0) <= threshold && (p.stock_status || "in_stock") !== "out_of_stock");
  const outOfStock = products.filter((p) => p.stock_status === "out_of_stock" || (p.stock_quantity || 0) <= 0);

  const applyAdjust = async (p) => {
    const delta = Number(adjust[p.id]);
    if (!delta) return;
    const newQty = Math.max(0, (Number(p.stock_quantity) || 0) + delta);
    const newStatus = newQty === 0 ? "out_of_stock" : newQty <= threshold ? "limited" : "in_stock";
    try {
      await db.entities.Product.update(p.id, { stock_quantity: newQty, stock_status: newStatus });
      setAdjust((a) => { const c = { ...a }; delete c[p.id]; return c; });
      await load();
      toast({ title: "Stock updated", description: `${p.name}: ${newQty} units` });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">Stock levels and low-stock alerts</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><Boxes className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Total Products</p><p className="font-bold text-xl">{products.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Low Stock</p><p className="font-bold text-xl">{lowStock.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center"><PackageX className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Out of Stock</p><p className="font-bold text-xl">{outOfStock.length}</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Stock Management</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Product</th>
                <th className="text-right px-3 py-3">Current Stock</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-center px-3 py-3">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium">{p.name}</td>
                  <td className="px-3 py-3 text-right font-semibold">{p.stock_quantity ?? 0}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[p.stock_status] || STATUS_CLS.in_stock}`}>
                      {STATUS_LABEL[p.stock_status] || "In Stock"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setAdjust((a) => ({ ...a, [p.id]: (Number(a[p.id]) || 0) - 1 }))}><Minus className="w-3.5 h-3.5" /></Button>
                      <Input type="number" value={adjust[p.id] || ""} onChange={(e) => setAdjust((a) => ({ ...a, [p.id]: e.target.value }))} placeholder="0" className="h-8 w-16 text-center" />
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setAdjust((a) => ({ ...a, [p.id]: (Number(a[p.id]) || 0) + 1 }))}><Plus className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" onClick={() => applyAdjust(p)} disabled={!adjust[p.id]}>Apply</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-10">No products.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}