import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";

export default function ProductNotFound() {
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 5);
        setSuggested(all);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
      <h1 className="font-heading text-4xl font-bold text-foreground mb-3">Product Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find the product you're looking for. It may have been moved or is no longer available.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Link to="/products">
          <Button className="bg-primary text-primary-foreground">
            <Search className="w-4 h-4" /> Browse All Products
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      {suggested.length > 0 && (
        <div className="w-full max-w-5xl">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6">You May Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {suggested.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}