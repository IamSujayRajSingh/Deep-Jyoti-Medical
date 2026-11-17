import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, GraduationCap, Building, Clock, ArrowRight } from "lucide-react";
import { DOCTOR } from "@/lib/constants";

const DOCTOR_IMG = "/images/772599e5d_generated_ca8d6ed6.png";

export default function DoctorProfile() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={DOCTOR_IMG}
                alt="Dr. Nilratan Mahapatra - Best Ayurvedic Doctor in Kolkata"
                className="w-full h-[400px] lg:h-[480px] object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 to-transparent h-32" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Meet Our Doctor</p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {DOCTOR.name}
            </h2>
            <p className="text-lg text-secondary font-medium mb-6">{DOCTOR.title}</p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              With over 31 years of dedicated clinical practice, Dr. Mahapatra is one of Kolkata's most 
              respected Ayurvedic physicians. A graduate of Calcutta University and former physician at 
              J.B. Roy State Ayurvedic Medical College & Hospital, he brings unparalleled expertise in 
              classical Ayurvedic treatments for chronic and lifestyle disorders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <InfoCard icon={GraduationCap} title="Qualification" value={DOCTOR.qualifications} />
              <InfoCard icon={Award} title="Experience" value={`${DOCTOR.experience} Years`} />
              <InfoCard icon={Building} title="Previous Role" value={DOCTOR.previousRole} />
              <InfoCard icon={Clock} title="Available" value="4 days/week" />
            </div>

            {/* Timings */}
            <div className="bg-muted/50 rounded-xl p-5 mb-6">
              <h3 className="font-heading text-lg font-semibold mb-3">Consultation Timings</h3>
              <div className="grid grid-cols-2 gap-2">
                {DOCTOR.timings.map((t) => (
                  <div key={t.day} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-background font-medium">{t.day}</Badge>
                    <span className="text-muted-foreground">{t.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/doctor">
              <Button className="bg-primary hover:bg-primary/90 group">
                View Full Profile
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
      <Icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}