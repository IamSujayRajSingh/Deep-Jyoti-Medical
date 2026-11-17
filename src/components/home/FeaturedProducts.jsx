import { db } from "@/api/client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowRight, BookOpen, Star } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/constants";

import { slugify } from "@/lib/slug";
import { formatINR, discountPercent } from "@/lib/format";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 8);
        setProducts(all);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Our Products</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Classical Ayurvedic Medicines
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Authentic Ayurvedic formulations sourced from classical texts. 
            Every product at Deep Jyoti Medical meets the highest standards of quality and purity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const off = discountPercent(product.mrp, product.selling_price ?? product.price);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <Link to={`/products/${product.slug ?? slugify(product.name)}`} className="relative aspect-square overflow-hidden bg-muted/30 block">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-[10px] border-0">
                    <BookOpen className="w-2.5 h-2.5 mr-1" />
                    {product.category || "Ayurvedic"}
                  </Badge>
                  {off > 0 && (
                    <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {off}% Off
                    </span>
                  )}
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <div className="text-center">
                      <p className="text-primary-foreground text-xs font-medium mb-1">Key Ingredients</p>
                      <p className="text-primary-foreground/80 text-xs">{product.ingredients || "Ayurvedic herbal blend"}</p>
                    </div>
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  {product.brand && (
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{product.brand}</p>
                  )}
                  <Link to={`/products/${product.slug ?? slugify(product.name)}`}>
                    <h3 className="font-heading text-base font-semibold text-foreground mb-1 hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    {product.rating ? (
                      <>
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">New</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary mb-3 mt-auto">{formatINR(product.selling_price ?? product.price)}</p>
                  <div className="flex gap-2">
                    <Link to={`/products/${product.slug ?? slugify(product.name)}`} className="flex-1">
                      <Button size="sm" className="w-full bg-primary text-primary-foreground text-xs h-9">
                        View Product
                      </Button>
                    </Link>
                    <a
                      href={WHATSAPP_URL(`Hi, I'm interested in ${product.name}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-secondary border-secondary/40 hover:bg-secondary/10 h-9 px-2.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/products">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}