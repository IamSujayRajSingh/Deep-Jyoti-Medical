// Reconstructed for local development: the original file was missing from the
// export. Props match how ProductDetail.jsx uses it.
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, Star, Minus, Plus, MessageCircle } from "lucide-react";
import { formatINR, discountPercent } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/constants";

export default function ProductPurchasePanel({ product, onAddToCart, onBuyNow }) {
  const [qty, setQty] = useState(1);

  const price = product.selling_price ?? product.price;
  const off = discountPercent(product.mrp, product.selling_price);
  const inStock = (product.stock_status || "in_stock") !== "out_of_stock";
  const tracked = Number.isFinite(Number(product.stock_quantity)) && product.stock_quantity !== null && product.stock_quantity !== ""
    ? Number(product.stock_quantity)
    : null;
  const maxQty = tracked !== null ? Math.max(1, tracked) : 99;

  const change = (delta) => setQty((q) => Math.min(maxQty, Math.max(1, q + delta)));

  return (
    <div>
      {product.brand && (
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.brand}</p>
      )}
      <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3">
        {product.name}
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {product.category && <Badge variant="secondary" className="text-xs">{product.category}</Badge>}
        {product.rating ? (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            {product.rating} ({product.review_count || 0} reviews)
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline flex-wrap gap-3 mb-1">
        <span className="text-3xl font-bold text-primary">{formatINR(price)}</span>
        {off > 0 && (
          <>
            <span className="text-base text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
              {off}% Off
            </span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">Inclusive of all taxes</p>

      {product.short_description && (
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{product.short_description}</p>
      )}

      <p className={`text-sm font-medium mb-5 ${inStock ? "text-secondary-foreground" : "text-destructive"}`}>
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${inStock ? "bg-secondary" : "bg-destructive"}`} />
        {!inStock ? "Out of Stock" : product.stock_status === "limited" ? "Limited Stock" : "In Stock"}
      </p>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center border border-border rounded-lg">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => change(-1)}
            disabled={!inStock || qty <= 1}
            className="w-9 h-9 flex items-center justify-center text-foreground disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => change(1)}
            disabled={!inStock || qty >= maxQty}
            className="w-9 h-9 flex items-center justify-center text-foreground disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          disabled={!inStock}
          onClick={() => onAddToCart(qty)}
          className="flex-1 bg-primary text-primary-foreground"
        >
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </Button>
        <Button
          size="lg"
          variant="secondary"
          disabled={!inStock}
          onClick={() => onBuyNow(qty)}
          className="flex-1 bg-secondary text-secondary-foreground"
        >
          <Zap className="w-4 h-4" /> Buy Now
        </Button>
      </div>

      <a
        href={WHATSAPP_URL(`Hi, I'm interested in ${product.name}. Please share details.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3"
      >
        <Button variant="outline" className="w-full text-secondary-foreground border-secondary/40 hover:bg-secondary/10">
          <MessageCircle className="w-4 h-4" /> Inquire on WhatsApp
        </Button>
      </a>
    </div>
  );
}
