import React from "react";
import { ShieldCheck, Leaf, Lock, Truck, Headphones } from "lucide-react";

const TRUST = [
  { icon: ShieldCheck, label: "Authentic Products" },
  { icon: Leaf, label: "Trusted Ayurvedic Brands" },
  { icon: Lock, label: "Secure Payments" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Headphones, label: "Easy Support" },
];

export default function TrustStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-5 border-y border-border/60 bg-muted/20 rounded-xl px-4">
      {TRUST.map((t) => (
        <div key={t.label} className="flex items-center gap-2 justify-center text-center md:text-left">
          <t.icon className="w-5 h-5 text-secondary shrink-0" />
          <span className="text-xs font-medium text-foreground/80 leading-tight">{t.label}</span>
        </div>
      ))}
    </div>
  );
}