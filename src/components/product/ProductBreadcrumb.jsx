import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function ProductBreadcrumb({ product }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap py-4">
      <Link to="/" className="hover:text-foreground flex items-center gap-1">
        <Home className="w-3.5 h-3.5" /> Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
      <Link to="/products" className="hover:text-foreground">Products</Link>
      {product.category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-foreground/70">{product.category}</span>
        </>
      )}
      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
      <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">{product.name}</span>
    </nav>
  );
}