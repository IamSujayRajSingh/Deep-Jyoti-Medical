// Reconstructed for local development: the original file was missing from the
// export. Props match how ProductDetail.jsx uses it.
import React from "react";

export default function ProductDescription({ product }) {
  const text = product.full_description || product.short_description;
  if (!text) return null;

  return (
    <section className="py-8 border-t border-border/60">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Product Description</h2>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line max-w-4xl">{text}</p>
    </section>
  );
}
