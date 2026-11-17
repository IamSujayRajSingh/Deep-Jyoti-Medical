import React from "react";
import { motion } from "framer-motion";
import InquiryForm from "./InquiryForm";

export default function InquirySection() {
  return (
    <section className="py-20 lg:py-28" id="inquiry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Get in Touch</p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-6 leading-tight">
              Start Your Healing Journey Today
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Fill out the form and our team will reach out to you to schedule a consultation 
              with Dr. Nilratan Mahapatra. Alternatively, you can call us or message us on WhatsApp 
              for immediate assistance.
            </p>
            <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-3">What to Expect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  Detailed Prakriti (constitution) assessment
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  Root cause analysis of your health concern
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  Personalized Ayurvedic treatment plan
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  Diet and lifestyle recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  Classical Ayurvedic medicine prescription
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm"
          >
            <h3 className="font-heading text-xl font-semibold mb-1">Patient Inquiry</h3>
            <p className="text-sm text-muted-foreground mb-6">We'll respond within 24 hours.</p>
            <InquiryForm source="home_inquiry" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}