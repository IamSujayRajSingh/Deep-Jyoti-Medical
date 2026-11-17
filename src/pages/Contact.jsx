import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle, Leaf } from "lucide-react";
import { BUSINESS, DOCTOR, WHATSAPP_URL, CALL_URL } from "@/lib/constants";
import InquiryForm from "@/components/home/InquiryForm";

export default function Contact() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-primary/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5">
            <Leaf className="w-3 h-3 mr-1" /> Get in Touch
          </Badge>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Contact Deep Jyoti Medical
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visit us at Rajabazar, call, WhatsApp, or fill out the form below. 
            We're here to help you on your natural healing journey.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left - Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="space-y-3">
                <a href={CALL_URL} className="block">
                  <Button variant="outline" className="w-full justify-start h-14 text-left">
                    <Phone className="w-5 h-5 mr-3 text-accent" />
                    <div>
                      <p className="font-medium">Call Now</p>
                      <p className="text-xs text-muted-foreground">{BUSINESS.phone}</p>
                    </div>
                  </Button>
                </a>
                <a href={WHATSAPP_URL()} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full justify-start h-14 text-left bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-xs opacity-80">{BUSINESS.phone}</p>
                    </div>
                  </Button>
                </a>
                <a href={`mailto:${BUSINESS.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start h-14 text-left">
                    <Mail className="w-5 h-5 mr-3 text-accent" />
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-xs text-muted-foreground">{BUSINESS.email}</p>
                    </div>
                  </Button>
                </a>
              </div>

              {/* Address */}
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" /> Our Location
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{BUSINESS.address}</p>
                <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Get Directions
                  </Button>
                </a>
              </div>

              {/* Hours */}
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" /> Consultation Hours
                </h3>
                <ul className="space-y-2">
                  {DOCTOR.timings.map((t) => (
                    <li key={t.day} className="flex justify-between text-sm">
                      <span className="font-medium">{t.day}</span>
                      <span className="text-muted-foreground">{t.time}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  Medicine store is open on all days during regular business hours.
                </p>
              </div>
            </div>

            {/* Right - Form + Map */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm"
              >
                <h3 className="font-heading text-2xl font-bold mb-1">Send Us a Message</h3>
                <p className="text-sm text-muted-foreground mb-6">We'll respond within 24 hours.</p>
                <InquiryForm source="contact_form" />
              </motion.div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-border/50 h-[350px]">
                <iframe
                  src={BUSINESS.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Deep Jyoti Medical Location Map"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
