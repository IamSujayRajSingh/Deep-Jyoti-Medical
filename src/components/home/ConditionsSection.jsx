import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CONDITIONS, WHATSAPP_URL } from "@/lib/constants";
import {
  Flame, Bone, Scissors, Palette, Activity, Scale,
  Baby, Stethoscope, Circle, Brain, Apple, HeartPulse, ArrowRight
} from "lucide-react";

const conditionIcons = [
  Flame, Bone, Scissors, Palette, Activity, Scale,
  Baby, Stethoscope, Circle, Brain, Apple, HeartPulse
];

export default function ConditionsSection() {
  return (
    <section className="py-20 lg:py-28 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Conditions We Treat</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comprehensive Ayurvedic Care
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From chronic ailments to lifestyle disorders, we offer natural Ayurvedic solutions 
            tailored to your unique health needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CONDITIONS.map((condition, i) => {
            const Icon = conditionIcons[i];
            return (
              <motion.div
                key={condition}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/treatments#${condition.toLowerCase().replace(/\s/g, '-')}`}
                  className="group flex flex-col items-center p-5 rounded-xl bg-card border border-border/50 hover:border-secondary/30 hover:shadow-md transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{condition}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/treatments">
            <Button variant="outline" className="group">
              View All Treatments
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href={WHATSAPP_URL("I'd like to know about Ayurvedic treatments available.")} target="_blank" rel="noopener noreferrer">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Discuss Your Condition
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}