import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle, Plus } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatINR, discountPercent } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/constants";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({ title: "Added to cart", description: product.name });
  };

  const off = discountPercent(product.mrp, product.selling_price);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {off > 0 && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {off}% Off
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{product.brand}</p>
        )}
        <h3 className="font-heading text-base font-semibold text-foreground leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {product.rating ? (
            <>
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
              <span className="text-xs text-muted-foreground">{product.rating} ({product.review_count || 0})</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">New arrival</span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-primary">{formatINR(product.selling_price ?? product.price)}</span>
          {product.mrp && product.mrp > (product.selling_price ?? 0) && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={handleQuickAdd}>
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
          <a
            href={WHATSAPP_URL(`Hi, I'm interested in ${product.name}. Please share details.`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm" variant="outline" className="text-secondary border-secondary/40 hover:bg-secondary/10">
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </Link>
  );
}