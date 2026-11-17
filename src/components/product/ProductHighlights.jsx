import React from "react";
import { Check } from "lucide-react";

export default function ProductHighlights({ product }) {
  const highlights = product.highlights && product.highlights.length > 0
    ? product.highlights
    : [];

  const derived = [];
  if (product.form) derived.push(`Form: ${product.form}`);
  if (product.brand) derived.push(`Brand: ${product.brand}`);
  if (product.pack_size) derived.push(`Pack Size: ${product.pack_size}`);
  if (product.category) derived.push(`Category: ${product.category}`);

  const all = [...highlights, ...derived];
  if (all.length === 0) return null;

  return (
    <section className="py-8 border-t border-border/60">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Product Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
        {all.map((h, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-secondary mt-1 shrink-0" />
            <span className="text-sm text-foreground/80">{h}</span>
          </div>
        ))}
      </div>
    </section>
  );
}