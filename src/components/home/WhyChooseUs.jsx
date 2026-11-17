import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, FlaskRound, Users, Clock, Star, Leaf } from "lucide-react";

const reasons = [
  {
    icon: Stethoscope,
    title: "Expert Ayurvedic Doctor",
    description: "Dr. Nilratan Mahapatra brings 31+ years of clinical experience with BAMS qualification from Calcutta University.",
  },
  {
    icon: FlaskRound,
    title: "Classical Medicines",
    description: "Authentic Ayurvedic formulations sourced from time-tested classical texts for effective, natural treatment.",
  },
  {
    icon: Users,
    title: "Personalized Care",
    description: "Every patient receives customized guidance based on their unique constitution and health condition.",
  },
  {
    icon: Clock,
    title: "Trusted Since 1995",
    description: "Three decades of serving families in Kolkata with integrity, quality, and compassion.",
  },
  {
    icon: Star,
    title: "Holistic Approach",
    description: "We treat the root cause, not just symptoms — focusing on lasting wellness through natural methods.",
  },
  {
    icon: Leaf,
    title: "Natural & Safe",
    description: "All treatments use natural ingredients with minimal side effects, suitable for all age groups.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Why Choose Us</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            The Deep Jyoti Medical Difference
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover why thousands of families in Kolkata trust us for their Ayurvedic healthcare needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border/50 hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <reason.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{reason.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}