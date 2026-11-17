import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { formatINR } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/constants";

export default function Cart() {
  const { items, updateQty, removeItem, totalPrice, totalItems, clearCart } = useCart();

  const checkoutMsg = `Hello Deep Jyoti Medical! I'd like to order:\n${items
    .map((i) => `• ${i.name} (Qty: ${i.qty}) — ${formatINR(i.price * i.qty)}`)
    .join("\n")}\n\nTotal: ${formatINR(totalPrice)}`;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Browse our Ayurvedic products and add items to your cart.</p>
        <Link to="/products">
          <Button className="bg-primary text-primary-foreground">Shop Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 lg:pt-28 pb-12 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Your Cart ({totalItems})</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-card border border-border/60 rounded-xl p-3">
                <Link to={`/products/${item.slug}`} className="w-20 h-20 rounded-lg bg-white border border-border/40 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-heading text-sm font-semibold text-foreground line-clamp-2 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-primary font-bold mt-1">{formatINR(item.price)}</p>
                </div>
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1.5 hover:bg-muted" aria-label="Decrease">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium w-8 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1.5 hover:bg-muted" aria-label="Increase">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-5 h-fit lg:sticky lg:top-28">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm text-foreground/80 mb-2">
              <span>Items ({totalItems})</span>
              <span>{formatINR(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-4 mb-5">
              <span>Total</span>
              <span className="text-primary">{formatINR(totalPrice)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full bg-primary text-primary-foreground">
                Proceed to Checkout
              </Button>
            </Link>
            <a href={WHATSAPP_URL(checkoutMsg)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full mt-2">
                <MessageCircle className="w-4 h-4" /> Order via WhatsApp
              </Button>
            </a>
            <Link to="/products">
              <Button variant="ghost" className="w-full mt-2">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}