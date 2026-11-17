import { db } from "@/api/client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/ui/use-toast";

import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import TrustStrip from "@/components/product/TrustStrip";
import ProductHighlights from "@/components/product/ProductHighlights";
import ProductDescription from "@/components/product/ProductDescription";
import ProductDetailsTable from "@/components/product/ProductDetailsTable";
import ProductDisclaimer from "@/components/product/ProductDisclaimer";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import RecentlyViewed, { trackRecentlyViewed } from "@/components/product/RecentlyViewed";
import StickyPurchaseBar from "@/components/product/StickyPurchaseBar";
import ProductNotFound from "@/pages/ProductNotFound";

const GENERIC_SEO_DESC =
  "Authentic Ayurvedic product available at Deep Jyoti Medical. Inquire via WhatsApp for pricing, availability, and expert guidance.";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const all = await db.entities.Product.list("-created_date", 50);
        if (!active) return;
        const found = all.find((p) => p.slug === slug);
        if (!found) {
          setNotFound(true);
        } else {
          setProduct(found);
          trackRecentlyViewed(found.slug);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // SEO
  useEffect(() => {
    if (!product) return;
    const seoTitle = product.seo_title || `${product.name} — Buy Online | Deep Jyoti Medical`;
    const seoDesc = product.seo_description || product.full_description?.slice(0, 155) || GENERIC_SEO_DESC;
    document.title = seoTitle;
    setMeta("description", seoDesc);
    setMeta("og:title", seoTitle, true);
    setMeta("og:description", seoDesc, true);
    setMeta("og:image", product.image, true);
    setMeta("og:type", "product", true);
    setCanonical(`/products/${product.slug}`);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.image,
      description: seoDesc,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      offers: {
        "@type": "Offer",
        price: product.selling_price ?? product.price,
        priceCurrency: "INR",
        availability:
          product.stock_status === "out_of_stock"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
      },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  const handleAddToCart = useCallback(
    (qty) => {
      addToCart(product, qty);
      toast({ title: "Added to cart", description: `${qty} × ${product.name}` });
    },
    [product, addToCart, toast]
  );

  const handleBuyNow = useCallback(
    (qty) => {
      addToCart(product, qty);
      navigate("/cart");
    },
    [product, addToCart, navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-24 lg:pb-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductBreadcrumb product={product} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-4">
          <div className="bg-card rounded-2xl p-2 lg:p-4">
            <ProductGallery image={product.image} images={product.images} name={product.name} />
          </div>
          <div>
            <ProductPurchasePanel product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            <div className="mt-6">
              <TrustStrip />
            </div>
          </div>
        </div>

        <ProductHighlights product={product} />
        <ProductDescription product={product} />
        <ProductDetailsTable product={product} />
        <ProductDisclaimer product={product} />
        <ProductReviews product={product} />
        <RelatedProducts product={product} />
        <RecentlyViewed currentSlug={product.slug} />
      </div>

      <StickyPurchaseBar product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>
  );
}

function setMeta(name, content, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(path) {
  const existing = document.querySelector('link[rel="canonical"]');
  let link = existing instanceof HTMLLinkElement ? existing : null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = window.location.origin + path;
}
