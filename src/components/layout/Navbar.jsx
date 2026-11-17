import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, MessageCircle, ShoppingCart } from "lucide-react";
import { WHATSAPP_URL, CALL_URL } from "@/lib/constants";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Shield } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Doctor", path: "/doctor" },
  { label: "Treatments", path: "/treatments" },
  { label: "Products", path: "/products" },
  { label: "Prescription", path: "/send-prescription" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/images/99270628e_Deepjyotilogo.png"
              alt="Deep Jyoti Medical"
              className="h-20 lg:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              </Link>
            )}
            <a href={CALL_URL}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </a>
            <a href={WHATSAPP_URL()} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </a>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <img
                      src="/images/99270628e_Deepjyotilogo.png"
                      alt="Deep Jyoti Medical"
                      className="h-14 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Shield className="w-4 h-4 inline mr-2" /> Admin Dashboard
                    </Link>
                  )}
                </div>
                <div className="p-4 border-t space-y-2">
                  <Link to="/cart" onClick={() => setOpen(false)} className="block">
                    <Button variant="outline" className="w-full relative">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                      {totalItems > 0 && (
                        <span className="absolute top-1.5 right-3 bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <a href={WHATSAPP_URL()} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                  <a href={CALL_URL} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}