import { db } from "@/api/client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Eye } from "lucide-react";

import { formatINR } from "@/lib/format";
import { exportToCsv } from "@/lib/exportCsv";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  repeat_customer: "bg-purple-100 text-purple-800",
  inactive: "bg-gray-100 text-gray-600",
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try { setCustomers(await db.entities.Customer.list("-created_date", 500)); }
      catch { setCustomers([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) =>
      (c.full_name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleExport = () => {
    exportToCsv("customers.csv", filtered, [
      { label: "Customer ID", get: (c) => c.customer_id },
      { label: "Name", get: (c) => c.full_name },
      { label: "Phone", get: (c) => c.phone },
      { label: "Alternate Phone", get: (c) => c.alternate_phone || "" },
      { label: "Email", get: (c) => c.email || "" },
      { label: "City", get: (c) => c.city || "" },
      { label: "State", get: (c) => c.state || "" },
      { label: "Pincode", get: (c) => c.pincode || "" },
      { label: "Total Orders", get: (c) => c.total_orders || 0 },
      { label: "Total Spent", get: (c) => c.total_amount_spent || 0 },
      { label: "Avg Order Value", get: (c) => c.average_order_value || 0 },
      { label: "Last Order", get: (c) => c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN") : "" },
      { label: "Status", get: (c) => c.status || "new" },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} customer(s)</p>
        </div>
        <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No customers found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3">Customer</th>
                  <th className="text-left px-3 py-3">Phone</th>
                  <th className="text-left px-3 py-3">Email</th>
                  <th className="text-center px-3 py-3">Orders</th>
                  <th className="text-right px-3 py-3">Total Spent</th>
                  <th className="text-left px-3 py-3">Last Order</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-center px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-3 py-3">
                      <p className="font-semibold">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.customer_id}</p>
                    </td>
                    <td className="px-3 py-3">{c.phone}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-3 py-3 text-center">{c.total_orders || 0}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatINR(c.total_amount_spent || 0)}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status] || STATUS_STYLES.new}`}>
                        {{ new: "New", active: "Active", repeat_customer: "Repeat", inactive: "Inactive" }[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link to={`/admin/customers/${c.id}`}>
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