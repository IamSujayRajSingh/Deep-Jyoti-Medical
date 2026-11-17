import React from "react";
import { Link } from "react-router-dom";
import { Leaf, MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { BUSINESS, DOCTOR, CALL_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Areas Served - Local SEO */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-primary-foreground/70 text-center">
            Proudly Serving Central Kolkata:{" "}
            {BUSINESS.areasServed.map((area, i) => (
              <span key={area}>
                <span className="text-primary-foreground/90 font-medium">{area}</span>
                {i < BUSINESS.areasServed.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-heading text-xl font-bold">Deep Jyoti Medical</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-4">
              Trusted Ayurvedic clinic and medicine store in Kolkata since 1995. 
              Natural healing through classical Ayurvedic wisdom.
            </p>
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} Deep Jyoti Medical. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Doctor", path: "/doctor" },
                { label: "Treatments", path: "/treatments" },
                { label: "Products", path: "/products" },
                { label: "Blog", path: "/blog" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultation */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Consultation Hours</h3>
            <ul className="space-y-2">
              {DOCTOR.timings.map((t) => (
                <li key={t.day} className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 mt-0.5 text-primary-foreground/50" />
                  <div>
                    <span className="font-medium">{t.day}</span>
                    <span className="text-primary-foreground/70 ml-1">{t.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/50" />
                <span className="text-primary-foreground/70">{BUSINESS.address}</span>
              </li>
              <li>
                <a href={CALL_URL} className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  <Phone className="w-4 h-4 text-primary-foreground/50" />
                  {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  <Mail className="w-4 h-4 text-primary-foreground/50" />
                  {BUSINESS.email}
                </a>
              </li>
              <li>
                <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary-foreground/50" />
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom SEO Text */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-primary-foreground/40 text-center leading-relaxed">
            Deep Jyoti Medical — Best Ayurvedic Doctor in Kolkata | Ayurvedic Clinic near Rajabazar, Sealdah, Maniktolla | 
            Ayurvedic Medicine Store Kolkata | Hair Fall, Joint Pain, Skin Disease Treatment | Dr. Nilratan Mahapatra BAMS
          </p>
        </div>
      </div>
    </footer>
  );
}