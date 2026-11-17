import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, Shield, Award, Users, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_URL, DOCTOR } from "@/lib/constants";
import { motion } from "framer-motion";

const DOCTOR_IMG = "/images/772599e5d_generated_ca8d6ed6.png";
const STORE_IMG = "/images/4c6762e39_generated_ea6f4e44.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            
            <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5 px-3 py-1">
              <Leaf className="w-3 h-3 mr-1" />
              Trusted Since 1995
            </Badge>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Healing the Source,{" "}
              <span className="text-secondary">Not Just the Symptom</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Consult experienced Ayurvedic physician{" "}
              <strong className="text-foreground">{DOCTOR.name}</strong> and discover 
              natural solutions for long-term wellness at Kolkata's trusted Ayurvedic destination.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/doctor#appointment">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <a href={WHATSAPP_URL()} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-12 px-6 border-secondary/40 text-secondary hover:bg-secondary/10">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                  <span className="ml-2 w-2 h-2 bg-secondary rounded-full animate-pulse-slow" />
                </Button>
              </a>
            </div>

            {/* Trust Bar */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border/50">
              <TrustStat icon={Award} value="31+" label="Years Experience" />
              <TrustStat icon={Users} value="10,000+" label="Patients Served" />
              <TrustStat icon={Shield} value="BAMS" label="Certified Doctor" />
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative">
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={DOCTOR_IMG}
                alt="Dr. Nilratan Mahapatra - Senior Ayurvedic Consultant at Deep Jyoti Medical, Kolkata"
                className="w-full h-[400px] lg:h-[520px] object-cover"
                loading="eager" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

              {/* Floating Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-xl rounded-xl p-4 border border-border/50">
                <p className="font-heading text-lg font-semibold">{DOCTOR.name}</p>
                <p className="text-sm text-muted-foreground">{DOCTOR.qualifications} · {DOCTOR.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-slow" />
                  <span className="text-xs text-secondary font-medium">Next: {DOCTOR.timings[0].day} {DOCTOR.timings[0].time}</span>
                </div>
              </div>
            </div>

            {/* Small Store Image */}
            

            
          </motion.div>
        </div>
      </div>
    </section>);

}

function TrustStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-secondary" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>);

}