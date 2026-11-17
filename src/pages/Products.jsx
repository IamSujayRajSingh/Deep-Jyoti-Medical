import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Leaf, Search } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

import { useLocation } from "react-router-dom";
import ProductCard from "@/components/product/ProductCard";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 100);
        setProducts(all);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Deep-link from category banners (e.g. /products?category=Hair%20Care)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat && PRODUCT_CATEGORIES.includes(cat)) setActiveCategory(cat);
  }, [location.search]);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.full_description || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5">
            <Leaf className="w-3 h-3 mr-1" /> Ayurvedic Products
          </Badge>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Classical Ayurvedic Medicines
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Authentic, quality-assured Ayurvedic formulations from trusted manufacturers.
            Tap any product for full details, or inquire via WhatsApp for pricing and availability.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Filters + Products */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                  {filtered.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No products found. Try a different search or category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}