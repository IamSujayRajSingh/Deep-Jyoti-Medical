// Reconstructed for local development: the original file was missing from the
// export. It shows approved reviews from the `Review` entity
// for this product.
import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Star, BadgeCheck } from "lucide-react";

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(value) ? "fill-secondary text-secondary" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await db.entities.Review.filter({ product_id: String(product.id) }, "-created_date", 50);
        if (active) setReviews((list || []).filter((r) => (r.status || "approved") === "approved"));
      } catch {
        /* reviews are optional */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [product.id]);

  if (loading) return null;

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  return (
    <section className="py-8 border-t border-border/60">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Customer Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={average} /> {average.toFixed(1)} ({reviews.length})
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-muted/20 rounded-xl p-4">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-border/60 p-4 bg-card">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Stars value={Number(r.rating) || 0} />
                {r.verified_purchase && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BadgeCheck className="w-3.5 h-3.5 text-secondary" /> Verified Purchase
                  </span>
                )}
              </div>
              {r.title && <h3 className="text-sm font-semibold text-foreground mb-1">{r.title}</h3>}
              {r.body && <p className="text-sm text-foreground/80 leading-relaxed">{r.body}</p>}
              <p className="text-xs text-muted-foreground mt-2">— {r.author_name}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
