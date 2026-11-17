import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function StickyPurchaseBar({ product, onAddToCart, onBuyNow }) {
  const price = product.selling_price ?? product.price;
  const inStock = (product.stock_status || "in_stock") !== "out_of_stock";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{product.name}</p>
        <p className="text-lg font-bold text-primary">{formatINR(price)}</p>
      </div>
      <Button size="sm" disabled={!inStock} onClick={() => onAddToCart(1)} className="bg-primary text-primary-foreground">
        <ShoppingCart className="w-4 h-4" /> Add
      </Button>
      <Button size="sm" variant="secondary" disabled={!inStock} onClick={() => onBuyNow(1)} className="bg-secondary text-secondary-foreground">
        <Zap className="w-4 h-4" /> Buy
      </Button>
    </div>
  );
}