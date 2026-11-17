import { db } from "@/api/client";

import React, { useState, useEffect } from "react";

import ProductCard from "./ProductCard";

export default function RelatedProducts({ product }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 50);
        if (!active) return;
        const sameCat = all.filter((p) => p.id !== product.id && p.category === product.category);
        const others = all.filter((p) => p.id !== product.id && p.category !== product.category);
        setRelated([...sameCat, ...others].slice(0, 5));
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [product.id, product.category]);

  if (loading) return null;
  if (related.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/60">
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Related Products</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}