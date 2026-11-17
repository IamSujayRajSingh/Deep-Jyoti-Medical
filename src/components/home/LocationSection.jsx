import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS, DOCTOR, WHATSAPP_URL, CALL_URL } from "@/lib/constants";

export default function LocationSection() {
  return (
    <section className="py-20 lg:py-28" id="location">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Find Us</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Visit Deep Jyoti Medical
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conveniently located at Rajabazar Crossing, easily accessible from Sealdah, 
            Maniktolla, Narkeldanga, and College Street.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border/50 h-[350px] lg:h-[450px]">
            <iframe
              src={BUSINESS.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Deep Jyoti Medical Location"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-4">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{BUSINESS.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={CALL_URL} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {BUSINESS.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${BUSINESS.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {BUSINESS.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Consultation Hours
              </h3>
              <ul className="space-y-2">
                {DOCTOR.timings.map((t) => (
                  <li key={t.day} className="flex justify-between text-sm">
                    <span className="font-medium">{t.day}</span>
                    <span className="text-muted-foreground">{t.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </a>
              <a href={WHATSAPP_URL()} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
