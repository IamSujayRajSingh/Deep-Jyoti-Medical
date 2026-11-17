import { db } from "@/api/client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Eye, Loader2, FileText, Download } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const STATUSES = ["new", "under_review", "contacted", "order_in_progress", "completed", "cancelled"];
const STATUS_LABELS = {
  new: "New", under_review: "Under Review", contacted: "Contacted",
  order_in_progress: "Order in Progress", completed: "Completed", cancelled: "Cancelled",
};
const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  contacted: "bg-violet-100 text-violet-700",
  order_in_progress: "bg-cyan-100 text-cyan-700",
  completed: "bg-secondary/20 text-secondary",
  cancelled: "bg-destructive/10 text-destructive",
};
const CONTACT_LABELS = { whatsapp: "WhatsApp", phone: "Phone Call", email: "Email" };

const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const fmtSize = (b) => {
  if (b == null) return "";
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

export default function AdminPrescriptions() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState(null); // selected for dialog
  const [busyFile, setBusyFile] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await db.entities.PrescriptionRequest.list("-created_date", 500);
      setRequests(list || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 : null;
    return (requests || []).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      const t = new Date(r.created_date).getTime();
      if (from != null && t < from) return false;
      if (to != null && t > to) return false;
      if (!q) return true;
      return (
        (r.reference_id || "").toLowerCase().includes(q) ||
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter, dateFrom, dateTo]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await db.entities.PrescriptionRequest.update(id, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      setActive((a) => (a && a.id === id ? { ...a, status } : a));
    } catch {
      /* ignore */
    } finally {
      setUpdatingId(null);
    }
  };

  const openFile = async (file_uri, filename) => {
    setBusyFile(file_uri);
    try {
      const res = await db.integrations.Core.CreateFileSignedUrl({ file_uri });
      if (res && res.signed_url) {
        window.open(res.signed_url, "_blank", "noopener,noreferrer");
      }
    } catch {
      /* ignore */
    } finally {
      setBusyFile(null);
    }
  };

  const count = filtered.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">Prescription Requests</h1>
        <p className="text-sm text-muted-foreground">{count} request(s) • Files are private and require a signed link to open.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Reference ID, name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-auto" />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No prescription requests match your filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3">Reference</th>
                  <th className="text-left px-3 py-3">Date</th>
                  <th className="text-left px-3 py-3">Customer</th>
                  <th className="text-left px-3 py-3">Mobile</th>
                  <th className="text-left px-3 py-3">Contact</th>
                  <th className="text-center px-3 py-3">Files</th>
                  <th className="text-left px-3 py-3">Status</th>
                  <th className="text-center px-3 py-3">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-3 py-3 font-semibold">{r.reference_id}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_date)}</td>
                    <td className="px-3 py-3">{r.full_name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.phone}</td>
                    <td className="px-3 py-3">{CONTACT_LABELS[r.preferred_contact] || r.preferred_contact}</td>
                    <td className="px-3 py-3 text-center">{(r.files || []).length}</td>
                    <td className="px-3 py-3">
                      <select
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={`h-8 rounded-md border-0 px-2 text-xs font-medium ${STATUS_COLORS[r.status] || "bg-muted text-foreground"}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => setActive(r)} aria-label={`View ${r.reference_id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {active?.reference_id}
            </DialogTitle>
            <DialogDescription>Prescription request details</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-3 text-sm">
              <Row label="Customer" value={active.full_name} />
              <Row label="Mobile" value={active.phone} />
              <Row label="Email" value={active.email || "—"} />
              <Row label="Preferred contact" value={CONTACT_LABELS[active.preferred_contact] || active.preferred_contact} />
              <Row label="Submitted" value={fmtDate(active.created_date)} />
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Message</p>
                <p className="text-foreground whitespace-pre-wrap">{active.message || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-2">Prescription files</p>
                <div className="space-y-2">
                  {(active.files || []).length === 0 && <p className="text-muted-foreground">No files.</p>}
                  {(active.files || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.filename}</p>
                        <p className="text-xs text-muted-foreground">{fmtSize(f.size)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyFile === f.file_uri}
                        onClick={() => openFile(f.file_uri, f.filename)}
                      >
                        {busyFile === f.file_uri ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Update status</Label>
                <select
                  value={active.status}
                  disabled={updatingId === active.id}
                  onChange={(e) => updateStatus(active.id, e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}