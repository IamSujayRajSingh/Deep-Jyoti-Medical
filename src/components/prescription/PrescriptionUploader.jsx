import { db } from "@/api/client";

import React, { useRef, useState } from "react";
import { Upload, Camera, FileText, Image as ImageIcon, X, Loader2, AlertCircle } from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024;

const validType = (f) => {
  const t = (f.type || "").toLowerCase();
  const n = (f.name || "").toLowerCase();
  return (
    t === "image/jpeg" || t === "image/png" || t === "application/pdf" ||
    n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png") || n.endsWith(".pdf")
  );
};

const fmtSize = (b) => {
  if (b == null) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const iconFor = (type, name) => {
  const n = (name || "").toLowerCase();
  if (type === "application/pdf" || n.endsWith(".pdf")) return FileText;
  return ImageIcon;
};

export default function PrescriptionUploader({ onChange, onBusy }) {
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef(null);
  const camInput = useRef(null);

  const emit = (list) => {
    onChange(
      list.filter((i) => i.status === "done").map((i) => ({
        file_uri: i.file_uri,
        filename: i.name,
        content_type: i.type,
        size: i.size,
      }))
    );
    onBusy(list.some((i) => i.status === "uploading"));
  };

  const addFiles = (fileList) => {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    const newItems = arr.map((f) => {
      const id = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random());
      const base = { id, name: f.name, type: f.type || "", size: f.size, rawFile: f };
      if (!validType(f)) return { ...base, status: "error", error: "Unsupported file type. Use JPG, PNG or PDF." };
      if (f.size > MAX_SIZE) return { ...base, status: "error", error: "File too large. Maximum 10 MB." };
      return { ...base, status: "uploading", file_uri: null };
    });
    const merged = [...items, ...newItems];
    setItems(merged);
    emit(merged);

    newItems.forEach(async (it) => {
      if (it.status !== "uploading") return;
      try {
        const res = await db.integrations.Core.UploadPrivateFile({ file: it.rawFile });
        setItems((prev) => {
          const n = prev.map((x) => (x.id === it.id ? { ...x, status: "done", file_uri: res.file_uri } : x));
          emit(n);
          return n;
        });
      } catch (e) {
        setItems((prev) => {
          const n = prev.map((x) =>
            x.id === it.id ? { ...x, status: "error", error: "Upload failed. Please try again." } : x
          );
          emit(n);
          return n;
        });
      }
    });
  };

  const remove = (id) => {
    setItems((prev) => {
      const n = prev.filter((x) => x.id !== id);
      emit(n);
      return n;
    });
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload prescription"
        onClick={() => fileInput.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="font-medium text-foreground">Upload Prescription</p>
          <p className="text-xs text-muted-foreground">JPG, PNG or PDF • Maximum 10 MB per file</p>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline">
            Click to browse
          </span>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Take Photo — mobile camera */}
      <button
        type="button"
        onClick={() => camInput.current?.click()}
        className="sm:hidden w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Camera className="w-4 h-4 text-primary" /> Take Photo / Upload Prescription
      </button>
      <input
        ref={camInput}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />

      {/* File list */}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it) => {
            const Icon = iconFor(it.type, it.name);
            return (
              <li key={it.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{fmtSize(it.size)}</p>
                  {it.status === "error" && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {it.error}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center">
                  {it.status === "uploading" && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
                  )}
                  {it.status === "done" && (
                    <span className="text-xs text-secondary font-medium mr-2">Uploaded</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    aria-label={`Remove ${it.name}`}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}