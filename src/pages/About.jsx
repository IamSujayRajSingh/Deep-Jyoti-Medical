import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Leaf, Heart, Eye, Target, Users, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

const STORE_IMG = "/images/4c6762e39_generated_ea6f4e44.png";
const INGREDIENTS_IMG = "/images/6f320addc_generated_1956749e.png";
const NATURE_IMG = "/images/c8316dd59_generated_7365d2ea.png";

const timeline = [
{ year: "1995", title: "Foundation", desc: "Deep Jyoti Medical established at A.P.C. Road, Rajabazar, Kolkata." },
{ year: "2000", title: "Growing Trust", desc: "Became a trusted name for Ayurvedic medicines in Central Kolkata." },
{ year: "2005", title: "Expert Consultations", desc: "Dr. Nilratan Mahapatra joined as Senior Ayurvedic Consultant." },
{ year: "2010", title: "Expanded Range", desc: "Expanded product range to over 500+ classical Ayurvedic formulations." },
{ year: "2020", title: "Digital Reach", desc: "Launched WhatsApp consultations to serve patients remotely." },
{ year: "2024", title: "31+ Years Strong", desc: "Continuing to serve families with authentic Ayurvedic care." }];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={NATURE_IMG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5">
            <Leaf className="w-3 h-3 mr-1" /> Our Story
          </Badge>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
            A Legacy of Natural Healing Since 1995
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deep Jyoti Medical has been a cornerstone of Ayurvedic healthcare in Kolkata, 
            serving families across Central Kolkata with authentic medicines and expert consultations 
            for over three decades.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-2xl overflow-hidden">
                <img src="/images/2101cd573_WhatsApp_Image_2026-06-03_at_52043_PM.jpeg" alt="Deep Jyoti Medical Store - Ayurvedic Medicine Store in Kolkata" className="w-full h-[400px] object-cover" loading="lazy" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Our Heritage</p>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
                Family-Owned, Community-Trusted
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nestled at the bustling Rajabazar Crossing on A.P.C. Road, Deep Jyoti Medical was 
                born from a deep conviction in the power of Ayurveda to heal naturally. What started 
                as a small Ayurvedic medicine shop in 1995 has grown into one of Central Kolkata's 
                most trusted destinations for authentic Ayurvedic care.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With Dr. Nilratan Mahapatra at its helm — bringing over 31 years of clinical expertise 
                and a BAMS degree from Calcutta University — Deep Jyoti Medical combines the wisdom 
                of classical Ayurveda with compassionate, personalized patient care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To make authentic Ayurvedic healthcare accessible to every family in Kolkata. 
                We strive to treat the root cause of ailments through time-tested classical 
                formulations, personalized consultations, and a commitment to natural wellness 
                that has zero side effects.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be Kolkata's foremost Ayurvedic wellness center — a place where ancient healing 
                wisdom meets modern patient care standards. We envision a community where families 
                turn to Ayurveda first for preventive care and long-term health management.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Our Journey</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-border" />
            {timeline.map((item, i) =>
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative pl-12 lg:pl-0 mb-10 last:mb-0 ${i % 2 === 0 ? "lg:pr-[55%]" : "lg:pl-[55%]"}`}>
              
                <div className="absolute left-2.5 lg:left-1/2 top-1 w-3 h-3 rounded-full bg-secondary border-2 border-background -translate-x-1/2" />
                <div className="bg-card rounded-xl p-5 border border-border/50">
                  <Badge variant="outline" className="mb-2 text-accent border-accent/30">{item.year}</Badge>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Our Values</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">What Defines Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { icon: Heart, title: "Compassion", desc: "Every patient is treated like family with genuine care." },
            { icon: BookOpen, title: "Authenticity", desc: "Only classical, time-tested Ayurvedic formulations." },
            { icon: ShieldCheck, title: "Integrity", desc: "Honest guidance without unnecessary treatments." },
            { icon: Users, title: "Community", desc: "Serving our Kolkata community for over 3 decades." }].
            map((v, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="text-center p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Experience Authentic Ayurveda</h2>
          <p className="text-muted-foreground mb-8">Visit us at Rajabazar or book a consultation with Dr. Mahapatra today.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/doctor#appointment">
              <Button size="lg" className="bg-primary hover:bg-primary/90">Book Appointment</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="group">
                Contact Us <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>);

}