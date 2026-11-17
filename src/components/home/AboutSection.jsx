import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

const INGREDIENTS_IMG = "/images/6f320addc_generated_1956749e.png";

const values = [
{ icon: Heart, title: "Family-Owned", desc: "A trusted family business serving Kolkata since 1995." },
{ icon: Leaf, title: "Classical Ayurveda", desc: "Authentic medicines sourced from classical Ayurvedic texts." },
{ icon: BookOpen, title: "31+ Years Experience", desc: "Decades of expertise in traditional Ayurvedic healing." },
{ icon: ShieldCheck, title: "Natural Wellness", desc: "Holistic treatment approach for lasting health benefits." }];

export default function AboutSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative">
            
            <div className="rounded-2xl overflow-hidden">
              <img src="/images/2101cd573_WhatsApp_Image_2026-06-03_at_52043_PM.jpeg"

              alt="Traditional Ayurvedic ingredients used at Deep Jyoti Medical"
              className="w-full h-[400px] object-cover"
              loading="lazy" />
              
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground rounded-xl px-5 py-3 shadow-lg">
              <p className="font-heading text-2xl font-bold">Since 1995</p>
              <p className="text-xs opacity-80">Serving Kolkata</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">About Us</p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
              A Legacy of Natural Healing in the Heart of Kolkata
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Deep Jyoti Medical has been a cornerstone of Ayurvedic healthcare in Central Kolkata 
              for over three decades. Founded with a mission to bring authentic, classical Ayurvedic 
              medicines and expert consultations to our community, we continue to serve families 
              across Rajabazar, Sealdah, Maniktolla, and beyond with personalized, natural wellness solutions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {values.map((v, i) =>
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <v.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
                  </div>
                </div>
              )}
            </div>

            <Link to="/about">
              <Button variant="outline" className="group">
                Learn More About Us
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>);

}