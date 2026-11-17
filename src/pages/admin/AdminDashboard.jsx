import { db } from "@/api/client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, IndianRupee, Clock, Package, Truck, CheckCircle2, Banknote, XCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { formatINR } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-heading text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.entities.Order.list("-created_date", 500);
        setOrders(list || []);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = todayStart - 6 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const inRange = (o, t) => new Date(o.created_date).getTime() >= t;
    const sum = (arr) => arr.reduce((s, o) => s + (Number(o.final_total) || 0), 0);

    const todays = orders.filter((o) => inRange(o, todayStart));
    const weeks = orders.filter((o) => inRange(o, weekStart));
    const months = orders.filter((o) => inRange(o, monthStart));

    const pending = orders.filter((o) => ["new", "confirmed"].includes(o.order_status));
    const processing = orders.filter((o) => ["processing", "packed"].includes(o.order_status));
    const shipped = orders.filter((o) => ["shipped", "out_for_delivery"].includes(o.order_status));
    const delivered = orders.filter((o) => o.order_status === "delivered");
    const codPending = orders.filter((o) => o.payment_method === "cod" && o.payment_status !== "paid" && o.order_status !== "cancelled");
    const cancelled = orders.filter((o) => o.order_status === "cancelled");

    return {
      todayOrders: todays.length,
      todaySales: sum(todays),
      weekOrders: weeks.length,
      weekSales: sum(weeks),
      monthOrders: months.length,
      monthSales: sum(months),
      aov: orders.length ? Math.round(sum(orders) / orders.length) : 0,
      pending: pending.length,
      processing: processing.length,
      shipped: shipped.length,
      delivered: delivered.length,
      codPending: codPending.length,
      cancelled: cancelled.length,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const days = range;
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(new Date(Date.now() - i * 86400000));
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), sales: 0, orders: 0 };
    }
    orders.forEach((o) => {
      const key = new Date(o.created_date).toISOString().slice(0, 10);
      if (buckets[key]) { buckets[key].sales += Number(o.final_total) || 0; buckets[key].orders += 1; }
    });
    return Object.values(buckets);
  }, [orders, range]);

  const recent = orders.slice(0, 6);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of orders and sales</p>
        </div>
        <Link to="/admin/orders"><Button>View All Orders</Button></Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={ShoppingCart} label="Today's Orders" value={stats.todayOrders} accent="bg-blue-100 text-blue-700" />
        <StatCard icon={IndianRupee} label="Today's Sales" value={formatINR(stats.todaySales)} accent="bg-green-100 text-green-700" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={Package} label="Processing" value={stats.processing} accent="bg-purple-100 text-purple-700" />
        <StatCard icon={Truck} label="Shipped" value={stats.shipped} accent="bg-cyan-100 text-cyan-700" />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} accent="bg-green-100 text-green-700" />
        <StatCard icon={Banknote} label="COD Pending" value={stats.codPending} accent="bg-orange-100 text-orange-700" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} accent="bg-red-100 text-red-700" />
      </div>

      {/* Sales overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={TrendingUp} label="Orders This Week" value={stats.weekOrders} accent="bg-muted text-foreground" />
        <StatCard icon={IndianRupee} label="Sales This Week" value={formatINR(stats.weekSales)} accent="bg-muted text-foreground" />
        <StatCard icon={TrendingUp} label="Orders This Month" value={stats.monthOrders} accent="bg-muted text-foreground" />
        <StatCard icon={IndianRupee} label="Avg Order Value" value={formatINR(stats.aov)} accent="bg-muted text-foreground" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Sales Trend</CardTitle>
          <div className="flex gap-1">
            {[7, 30, 90].map((r) => (
              <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)}>
                {r}d
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={range > 30 ? Math.floor(range / 12) : 0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                <Tooltip
                  formatter={(v, n) => n === "sales" ? [formatINR(v), "Sales"] : [v, "Orders"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Bar dataKey="sales" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((o) => (
                <Link key={o.id} to={`/admin/orders/${o.order_id}`} className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
                  <div>
                    <p className="text-sm font-semibold">{o.order_id}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name} · {new Date(o.created_date).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{formatINR(o.final_total)}</span>
                    <OrderStatusBadge status={o.order_status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}