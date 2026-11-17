// Reconstructed for local development: the original file was missing from the
// export. Props match how ProductDetail.jsx uses it.
import React, { useState, useEffect } from "react";

export default function ProductGallery({ image, images, name }) {
  const all = [image, ...(Array.isArray(images) ? images : [])].filter(
    (src, i, arr) => src && arr.indexOf(src) === i
  );
  const [active, setActive] = useState(all[0]);

  useEffect(() => {
    setActive(all[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  if (all.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-xl overflow-hidden bg-white border border-border/40">
        <img src={active || all[0]} alt={name} className="w-full h-full object-contain p-4" />
      </div>
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              aria-label={`Show image ${i + 1} of ${name}`}
              className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white border transition-colors ${
                (active || all[0]) === src ? "border-primary" : "border-border/60 hover:border-primary/50"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-contain p-1" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
