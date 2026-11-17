import React from "react";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import { WHATSAPP_URL, CALL_URL } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";

export default function FloatingActions() {
  const location = useLocation();
  const onProductPage = location.pathname.startsWith("/products/") && location.pathname !== "/products";
  return (
    <>
      {/* Desktop - Side Floating WhatsApp */}
      <a
        href={WHATSAPP_URL()}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-8 right-8 z-40 w-14 h-14 bg-secondary text-secondary-foreground rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse-slow" />
      </a>

      {/* Mobile - Bottom Action Bar (hidden on product pages, which have their own sticky purchase bar) */}
      {onProductPage ? null : (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-bottom">
        <div className="grid grid-cols-3 divide-x divide-border">
          <a
            href={CALL_URL}
            className="flex flex-col items-center justify-center py-3 gap-1 text-foreground active:bg-muted transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-medium">Call Now</span>
          </a>
          <a
            href={WHATSAPP_URL()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-3 gap-1 text-secondary-foreground bg-secondary/10 active:bg-secondary/20 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-secondary" />
            <span className="text-[10px] font-medium text-secondary">WhatsApp</span>
          </a>
          <Link
            to="/doctor#appointment"
            className="flex flex-col items-center justify-center py-3 gap-1 text-foreground active:bg-muted transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Book Now</span>
          </Link>
        </div>
      </div>
      )}
    </>
  );
}