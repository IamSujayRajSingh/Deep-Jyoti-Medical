// Reconstructed for local development: the original file was missing from the
// export. ProductDetail.jsx uses the default export and `trackRecentlyViewed`.
import { db } from "@/api/client";

import React, { useState, useEffect } from "react";

import ProductCard from "./ProductCard";

const STORAGE_KEY = "dj_recently_viewed";
const MAX_ITEMS = 10;

function readSlugs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(slug) {
  if (!slug) return;
  try {
    const next = [slug, ...readSlugs().filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export default function RecentlyViewed({ currentSlug }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    const slugs = readSlugs().filter((s) => s !== currentSlug);
    if (slugs.length === 0) {
      setProducts([]);
      return;
    }
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 100);
        if (!active) return;
        const bySlug = new Map(all.map((p) => [p.slug, p]));
        setProducts(slugs.map((s) => bySlug.get(s)).filter(Boolean).slice(0, 5));
      } catch {
        /* ignore */
      }
    })();
    return () => { active = false; };
  }, [currentSlug]);

  if (products.length === 0) return null;

  return (
    <section className="py-10 border-t border-border/60">
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
