import React from "react";
import { Info, ListChecks } from "lucide-react";

const GENERIC_DISCLAIMER =
  "This product is intended for use as directed on the packaging. Please read the label carefully before use. For medical concerns, pregnancy, existing health conditions, or use with other medicines, consult a qualified healthcare professional.";

export default function ProductDisclaimer({ product }) {
  return (
    <div className="space-y-5 py-8 border-t border-border/60">
      {product.directions && (
        <section>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-secondary" /> How to Use
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line bg-muted/20 rounded-xl p-4">
            {product.directions}
          </p>
        </section>
      )}

      <section className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <h2 className="font-heading text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-accent" /> Important Information
        </h2>
        <p className="text-xs text-foreground/70 leading-relaxed">
          {product.disclaimer || GENERIC_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}