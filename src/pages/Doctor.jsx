import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Building, Clock, Stethoscope, BookOpen, Heart, Brain } from "lucide-react";
import { DOCTOR, CONDITIONS } from "@/lib/constants";
import InquiryForm from "@/components/home/InquiryForm";

const DOCTOR_IMG = "/images/772599e5d_generated_ca8d6ed6.png";

const expertise = [
  { icon: Heart, title: "Chronic Disease Management", desc: "Specialized in long-term Ayurvedic management of diabetes, hypertension, and metabolic disorders." },
  { icon: Stethoscope, title: "Digestive Health", desc: "Expert in treating acidity, IBS, liver disorders, and piles through classical formulations." },
  { icon: Brain, title: "Neurological Conditions", desc: "Treating migraine, stress disorders, and neurological issues with traditional Ayurvedic methods." },
  { icon: BookOpen, title: "Skin & Hair Care", desc: "Holistic approach to dermatological conditions including eczema, psoriasis, and hair fall." },
];

export default function Doctor() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-lg sticky top-24">
                <img src={DOCTOR_IMG} alt="Dr. Nilratan Mahapatra - Best Ayurvedic Doctor Kolkata" className="w-full h-[450px] lg:h-[550px] object-cover" loading="eager" />
                <div className="bg-primary text-primary-foreground p-5">
                  <h2 className="font-heading text-xl font-bold">{DOCTOR.name}</h2>
                  <p className="text-sm text-primary-foreground/70">{DOCTOR.qualifications} · {DOCTOR.title}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/5">Senior Ayurvedic Consultant</Badge>
                <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-4">{DOCTOR.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  With over 31 years of dedicated clinical practice in Ayurvedic medicine, Dr. Nilratan 
                  Mahapatra stands as one of Kolkata's most experienced and respected Ayurvedic physicians. 
                  A graduate of Calcutta University (BAMS) and former physician at the prestigious 
                  J.B. Roy State Ayurvedic Medical College & Hospital, Dr. Mahapatra combines 
                  deep-rooted classical knowledge with decades of hands-on clinical experience.
                </p>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CredentialCard icon={GraduationCap} title="Education" value="BAMS — Calcutta University" />
                <CredentialCard icon={Award} title="Experience" value={`${DOCTOR.experience} Years of Practice`} />
                <CredentialCard icon={Building} title="Previous Role" value={DOCTOR.previousRole} />
                <CredentialCard icon={Clock} title="Consultations" value="4 Days Per Week" />
              </div>

              {/* Consultation Timings */}
              <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
                <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Consultation Timings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCTOR.timings.map((t) => (
                    <div key={t.day} className="flex items-center justify-between bg-background rounded-lg p-3 border border-border/50">
                      <span className="font-medium text-sm">{t.day}</span>
                      <Badge variant="outline">{t.time}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="font-heading text-xl font-semibold mb-4">Areas of Expertise</h3>
                <div className="grid gap-4">
                  {expertise.map((e, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <e.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{e.title}</h4>
                        <p className="text-sm text-muted-foreground">{e.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="font-heading text-xl font-semibold mb-4">Conditions Treated</h3>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <Badge key={c} variant="outline" className="bg-secondary/5 border-secondary/20 text-foreground">{c}</Badge>
                  ))}
                </div>
              </div>

              {/* Appointment Form */}
              <div id="appointment" className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm scroll-mt-24">
                <h3 className="font-heading text-2xl font-bold mb-1">Book an Appointment</h3>
                <p className="text-sm text-muted-foreground mb-6">Schedule your consultation with Dr. Mahapatra.</p>
                <InquiryForm source="appointment_form" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function CredentialCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}