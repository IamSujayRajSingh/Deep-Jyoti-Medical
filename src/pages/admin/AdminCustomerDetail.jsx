import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Phone, Mail, MapPin, Plus, ShoppingBag, IndianRupee, Clock } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = async () => {
    const c = await db.entities.Customer.get(id);
    setCustomer(c);
    if (c) {
      const ords = await db.entities.Order.filter({ customer_id: c.customer_id }, "-created_date", 100);
      setOrders(ords || []);
    }
  };

  useEffect(() => {
    (async () => {
      try { await load(); } catch { setCustomer(null); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const notes = [...(customer.notes || []), { text: noteText.trim(), added_by: user.email, date: new Date().toISOString() }];
      await db.entities.Customer.update(customer.id, { notes });
      setNoteText("");
      await load();
      toast({ title: "Note added" });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setSavingNote(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  if (!customer) return <div className="text-center py-20"><p className="text-muted-foreground mb-4">Customer not found.</p><Link to="/admin/customers"><Button>Back</Button></Link></div>;

  const notes = (customer.notes || []).slice().reverse();

  return (
    <div className="space-y-5">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      {/* Overview */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">{customer.full_name}</h1>
              <p className="text-sm text-muted-foreground">{customer.customer_id}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="w-3.5 h-3.5" /> {customer.phone}</a>
                {customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="w-3.5 h-3.5" /> {customer.email}</a>}
                {customer.alternate_phone && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {customer.alternate_phone}</span>}
              </div>
            </div>
            <span className="inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold bg-muted">
              {{ new: "New", active: "Active", repeat_customer: "Repeat Customer", inactive: "Inactive" }[customer.status] || customer.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Clock className="w-3.5 h-3.5" /> Customer Since</div>
          <p className="font-semibold mt-1">{new Date(customer.created_date).toLocaleDateString("en-IN")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><ShoppingBag className="w-3.5 h-3.5" /> Total Orders</div>
          <p className="font-semibold mt-1 text-xl">{customer.total_orders || 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><IndianRupee className="w-3.5 h-3.5" /> Total Spent</div>
          <p className="font-semibold mt-1 text-xl">{formatINR(customer.total_amount_spent || 0)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><IndianRupee className="w-3.5 h-3.5" /> Avg Order Value</div>
          <p className="font-semibold mt-1 text-xl">{formatINR(customer.average_order_value || 0)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Address + Orders */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-4 h-4" /> Saved Address</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{customer.address_line1}{customer.address_line2 ? ", " + customer.address_line2 : ""}{customer.landmark ? ", " + customer.landmark : ""}</p>
              <p className="text-sm text-muted-foreground">{customer.city}, {customer.state} — {customer.pincode}</p>
              <p className="text-sm text-muted-foreground">{customer.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Order History</CardTitle></CardHeader>
            <CardContent className="p-0">
              {orders.length === 0 ? <p className="text-sm text-muted-foreground p-4">No orders yet.</p> : (
                <div className="divide-y divide-border">
                  {orders.map((o) => (
                    <Link key={o.id} to={`/admin/orders/${o.order_id}`} className="flex items-center justify-between p-4 hover:bg-muted/30">
                      <div>
                        <p className="font-semibold text-sm">{o.order_id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString("en-IN")} · {(o.items || []).map((i) => i.product_name).join(", ").slice(0, 50)}</p>
                        <div className="flex gap-2 mt-1">
                          <OrderStatusBadge status={o.order_status} />
                          <PaymentStatusBadge status={o.payment_status} />
                        </div>
                      </div>
                      <span className="font-bold">{formatINR(o.final_total)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card className="h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Internal Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="e.g. Customer prefers delivery after 6 PM" />
              <Button className="w-full mt-2" size="sm" onClick={addNote} disabled={savingNote || !noteText.trim()}>
                <Plus className="w-4 h-4" /> {savingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Notes are internal only — never shown to the customer.</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : notes.map((n, i) => (
                <div key={i} className="bg-muted/50 rounded p-2.5">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{n.added_by} · {new Date(n.date).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}