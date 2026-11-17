import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, Plus, X } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/lib/format";
import { slugify } from "@/lib/slug";

const STOCK_STATUS = [
  { value: "in_stock", label: "In Stock", cls: "bg-green-100 text-green-800" },
  { value: "limited", label: "Limited", cls: "bg-amber-100 text-amber-800" },
  { value: "out_of_stock", label: "Out of Stock", cls: "bg-red-100 text-red-800" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", slug: "", selling_price: "", mrp: "", stock_quantity: "", category: "" });
  const { toast } = useToast();

  const load = async () => {
    try { setProducts(await db.entities.Product.list("-created_date", 500)); }
    catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (p) => setEdits((e) => ({ ...e, [p.id]: { selling_price: p.selling_price, stock_quantity: p.stock_quantity, stock_status: p.stock_status } }));

  const saveEdit = async (p) => {
    const e = edits[p.id];
    if (!e) return;
    setSaving((s) => ({ ...s, [p.id]: true }));
    try {
      await db.entities.Product.update(p.id, {
        selling_price: Number(e.selling_price) || 0,
        stock_quantity: Number(e.stock_quantity) || 0,
        stock_status: e.stock_status,
      });
      setEdits((ed) => { const c = { ...ed }; delete c[p.id]; return c; });
      await load();
      toast({ title: "Product updated" });
    } catch (err) { toast({ title: "Update failed", description: err.message, variant: "destructive" }); }
    finally { setSaving((s) => ({ ...s, [p.id]: false })); }
  };

  const handleAdd = async () => {
    if (!newProd.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    try {
      await db.entities.Product.create({
        name: newProd.name,
        slug: newProd.slug || slugify(newProd.name),
        selling_price: Number(newProd.selling_price) || 0,
        mrp: Number(newProd.mrp) || 0,
        stock_quantity: Number(newProd.stock_quantity) || 0,
        stock_status: (Number(newProd.stock_quantity) || 0) === 0 ? "out_of_stock" : "in_stock",
        category: newProd.category || "Hair Care",
        brand: "", image: "", short_description: "", full_description: "",
      });
      setNewProd({ name: "", slug: "", selling_price: "", mrp: "", stock_quantity: "", category: "" });
      setShowAdd(false);
      await load();
      toast({ title: "Product added" });
    } catch (err) { toast({ title: "Failed", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} product(s)</p>
        </div>
        <Button onClick={() => setShowAdd((s) => !s)}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <Input placeholder="Name *" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} />
              <Input placeholder="Slug (auto)" value={newProd.slug} onChange={(e) => setNewProd({ ...newProd, slug: e.target.value })} />
              <Input placeholder="Price ₹" type="number" value={newProd.selling_price} onChange={(e) => setNewProd({ ...newProd, selling_price: e.target.value })} />
              <Input placeholder="MRP ₹" type="number" value={newProd.mrp} onChange={(e) => setNewProd({ ...newProd, mrp: e.target.value })} />
              <Input placeholder="Stock" type="number" value={newProd.stock_quantity} onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3">Product</th>
                  <th className="text-left px-3 py-3">Category</th>
                  <th className="text-right px-3 py-3">Price (₹)</th>
                  <th className="text-right px-3 py-3">Stock</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-center px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const e = edits[p.id];
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded bg-white border border-border/40 overflow-hidden shrink-0">
                            {p.image && <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" />}
                          </div>
                          <Link to={`/products/${p.slug}`} className="font-medium hover:underline line-clamp-1 max-w-[200px]">{p.name}</Link>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-3 py-3 text-right">
                        {e ? (
                          <Input type="number" value={e.selling_price} onChange={(ev) => setEdits((ed) => ({ ...ed, [p.id]: { ...ed[p.id], selling_price: ev.target.value } }))} className="h-8 w-24 ml-auto text-right" />
                        ) : <span className="font-semibold">{formatINR(p.selling_price)}</span>}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {e ? (
                          <Input type="number" value={e.stock_quantity} onChange={(ev) => setEdits((ed) => ({ ...ed, [p.id]: { ...ed[p.id], stock_quantity: ev.target.value } }))} className="h-8 w-20 ml-auto text-right" />
                        ) : <span>{p.stock_quantity ?? 0}</span>}
                      </td>
                      <td className="px-3 py-3">
                        {e ? (
                          <select value={e.stock_status} onChange={(ev) => setEdits((ed) => ({ ...ed, [p.id]: { ...ed[p.id], stock_status: ev.target.value } }))} className="h-8 rounded-md border border-input bg-transparent px-2 text-xs">
                            {STOCK_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${(STOCK_STATUS.find((s) => s.value === p.stock_status) || STOCK_STATUS[0]).cls}`}>
                            {(STOCK_STATUS.find((s) => s.value === p.stock_status) || STOCK_STATUS[0]).label}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {e ? (
                          <div className="flex justify-center gap-1">
                            <Button size="sm" onClick={() => saveEdit(p)} disabled={saving[p.id]}><Save className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setEdits((ed) => { const c = { ...ed }; delete c[p.id]; return c; })}><X className="w-3.5 h-3.5" /></Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}