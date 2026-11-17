import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What conditions does Dr. Nilratan Mahapatra treat?",
    a: "Dr. Mahapatra specializes in treating acidity, joint pain, hair fall, skin diseases, diabetes management, weight management, infertility support, liver disorders, piles, migraine, digestive issues, and various lifestyle disorders through classical Ayurvedic methods."
  },
  {
    q: "What are the consultation timings at Deep Jyoti Medical?",
    a: "Dr. Mahapatra is available on Tuesday and Friday from 6:30 PM to 8:30 PM, and Thursday and Sunday from 12:00 PM to 2:00 PM. We recommend booking an appointment in advance."
  },
  {
    q: "Do I need an appointment for consultation?",
    a: "While walk-ins are welcome, we strongly recommend booking an appointment to avoid waiting. You can book through our website, call us, or message us on WhatsApp."
  },
  {
    q: "Is Ayurvedic treatment safe?",
    a: "Yes, Ayurvedic treatments use natural herbs and formulations with minimal side effects. Dr. Mahapatra carefully prescribes medicines based on each patient's unique constitution (Prakriti) for safe and effective results."
  },
  {
    q: "How long does Ayurvedic treatment take to show results?",
    a: "Results vary depending on the condition and individual. Acute conditions may show improvement within days, while chronic conditions typically require 2-3 months of consistent treatment. Dr. Mahapatra will provide you with a personalized timeline."
  },
  {
    q: "Do you sell Ayurvedic medicines at the store?",
    a: "Yes, Deep Jyoti Medical is both a clinic and a medicine store. We stock a wide range of classical Ayurvedic medicines including tablets, churna, oils, syrups, immunity boosters, and wellness products."
  },
  {
    q: "Where is Deep Jyoti Medical located?",
    a: "We are located at 296 A.P.C. Road, Rajabazar Crossing, Kolkata, West Bengal – 700009. We are easily accessible from Rajabazar, Sealdah, Maniktolla, Narkeldanga, and College Street areas."
  },
  {
    q: "Can I consult on WhatsApp?",
    a: "Yes, you can reach out to us on WhatsApp at +91 90074 49644 for initial queries, follow-up consultations, or product inquiries. However, we recommend an in-person visit for the first consultation."
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 lg:py-28 bg-primary/[0.02]" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">FAQ</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-heading text-base font-semibold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}