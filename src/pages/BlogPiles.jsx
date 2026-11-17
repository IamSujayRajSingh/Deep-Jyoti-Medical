import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Leaf, Clock, User, MessageCircle, Calendar, Quote, ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { WHATSAPP_URL, DOCTOR } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PILES_IMG = "/images/6f320addc_generated_1956749e.png";
const HERBS_IMG = "/images/3d0d60dba_generated_c1e147b2.png";
const NATURE_IMG = "/images/c8316dd59_generated_7365d2ea.png";

const faqs = [
  {
    q: "Can Ayurveda treat piles without surgery?",
    a: "Yes. Grade 1 and Grade 2 piles (internal, non-prolapsing) respond very well to Ayurvedic treatment with medicines and lifestyle changes alone. Grade 3 can often be managed conservatively. Grade 4 may require a surgical opinion, but Ayurvedic support before and after surgery significantly improves recovery.",
  },
  {
    q: "How long does Ayurvedic piles treatment take?",
    a: "Most patients experience significant symptom relief — reduced bleeding, pain, and discomfort — within 4–6 weeks of consistent treatment. Complete healing and prevention of recurrence typically takes 3–4 months depending on the grade and duration of the condition.",
  },
  {
    q: "What is Kshara Karma in Ayurveda for piles?",
    a: "Kshara Karma is a classical Ayurvedic parasurgical procedure where a specially prepared alkaline paste (Kshara) made from medicinal plant ash is applied directly to the hemorrhoid. It cauterizes and shrinks the mass naturally without general anesthesia, making it one of the most effective non-surgical Ayurvedic interventions for internal piles.",
  },
  {
    q: "What foods should I avoid with piles?",
    a: "Avoid spicy foods, deep-fried items, red meat, alcohol, refined flour (maida), and foods that cause constipation such as bananas and pomegranates. Reduce caffeine intake. These aggravate Pitta and Vata doshas which worsen hemorrhoid symptoms.",
  },
  {
    q: "Can piles come back after Ayurvedic treatment?",
    a: "Piles can recur if the root causes — constipation, poor diet, and sedentary lifestyle — are not corrected. Dr. Mahapatra's treatment focuses on permanently correcting bowel habits and dietary patterns to minimize the risk of recurrence.",
  },
  {
    q: "Is Ayurvedic treatment for piles safe during pregnancy?",
    a: "Many Ayurvedic treatments are safe during pregnancy, but specific medicines must be chosen carefully. Dr. Mahapatra prescribes pregnancy-safe formulations such as Triphala, isabgol (psyllium husk), and topical applications that relieve symptoms without any harm to the mother or baby.",
  },
];

export default function BlogPiles() {
  return (
    <>
      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>

      {/* Hero */}
      <section className="py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5">
                <Leaf className="w-3 h-3 mr-1" /> Treatments
              </Badge>
              <Badge variant="outline" className="text-xs">Digestive Health</Badge>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Ayurvedic Treatment for Piles in Kolkata — Heal Without Surgery
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Hemorrhoids (Arsha) are one of the most common yet least discussed health conditions. 
              Discover how classical Ayurveda offers safe, effective, non-surgical relief — and how 
              thousands of patients in Kolkata have found lasting freedom from piles at Deep Jyoti Medical.
            </p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground border-y border-border/50 py-4">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Dr. Nilratan Mahapatra, BAMS</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 9 min read</span>
              <span>Published: January 2025</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-2xl overflow-hidden h-72 lg:h-96">
          <img src={PILES_IMG} alt="Ayurvedic herbs for piles treatment at Deep Jyoti Medical Kolkata" className="w-full h-full object-cover" loading="eager" />
        </div>
      </div>

      {/* Article Body */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="prose-content space-y-10">

          {/* Intro */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">What Are Piles (Arsha)?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Piles, medically known as hemorrhoids and in Ayurveda as <em>Arsha</em>, are swollen and 
              inflamed veins in the rectum and anus that cause discomfort, pain, and bleeding. They are 
              among the most prevalent yet underreported conditions — affecting an estimated 75% of people 
              at some point in their lives.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In Ayurvedic understanding, Arsha is described as a mass that "torments" the patient — 
              the literal translation of the Sanskrit word. The condition is classified based on the 
              dominant dosha involved and whether the piles are internal (Abhyantara Arsha) or 
              external (Bahya Arsha), bleeding (Srava Arsha) or non-bleeding (Shushka Arsha).
            </p>
          </motion.section>

          {/* Types */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Types & Grades of Piles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { grade: "Grade 1", desc: "Small inflammations inside the anal lining. Not visible externally. Common bleeding during bowel movements.", icon: "🟢", treatability: "Fully treatable with Ayurveda" },
                { grade: "Grade 2", desc: "Larger piles that may prolapse during straining but return inside spontaneously.", icon: "🟡", treatability: "Highly responsive to Ayurvedic treatment" },
                { grade: "Grade 3", desc: "Prolapse outside the anus and require manual repositioning. May cause significant discomfort.", icon: "🟠", treatability: "Manageable with Kshara Karma + medicines" },
                { grade: "Grade 4", desc: "Permanently prolapsed and cannot be pushed back. Often require surgical consideration.", icon: "🔴", treatability: "Ayurvedic support before/after surgery" },
              ].map((g) => (
                <div key={g.grade} className="bg-card rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{g.icon}</span>
                    <span className="font-heading font-bold text-foreground">{g.grade}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{g.desc}</p>
                  <p className="text-xs font-medium text-secondary">{g.treatability}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Symptoms */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Common Symptoms</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Bright red bleeding during or after bowel movements",
                "Pain, aching, or soreness around the anus",
                "Itching or irritation in the anal region",
                "Feeling of incomplete bowel evacuation",
                "Swelling or a lump near the anus",
                "Mucus discharge after passing stool",
                "Discomfort while sitting for long periods",
                "Foul odour due to mucus secretion",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mt-4">
              <p className="text-sm text-foreground font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                If you notice rectal bleeding, do not self-diagnose. Consult Dr. Mahapatra to rule out other conditions and receive an accurate diagnosis.
              </p>
            </div>
          </motion.section>

          {/* Causes - Ayurvedic */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Root Causes — The Ayurvedic View</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ayurveda identifies that all three doshas — Vata, Pitta, and Kapha — play a role in 
              Arsha, but the dominant dosha determines the type of treatment required:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-5">
                <h3 className="font-heading font-bold text-foreground mb-2">Vata Arsha</h3>
                <p className="text-sm text-muted-foreground mb-3">Dry, hard, rough piles with severe pain and constipation. Dark-coloured.</p>
                <p className="text-xs font-medium text-secondary">Cause: Dry food, suppressing natural urges, sedentary habits</p>
              </div>
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-5">
                <h3 className="font-heading font-bold text-foreground mb-2">Pitta Arsha</h3>
                <p className="text-sm text-muted-foreground mb-3">Bleeding piles with burning sensation, inflammation, and soft texture.</p>
                <p className="text-xs font-medium text-accent">Cause: Spicy foods, alcohol, excessive heat exposure</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                <h3 className="font-heading font-bold text-foreground mb-2">Kapha Arsha</h3>
                <p className="text-sm text-muted-foreground mb-3">Soft, oily, pale piles with mucus discharge and mild pain.</p>
                <p className="text-xs font-medium text-foreground">Cause: Heavy, oily food, obesity, low metabolism</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Modern contributing factors include prolonged sitting, low-fiber diet, inadequate water intake, 
              straining during bowel movements, pregnancy, obesity, and chronic constipation.
            </p>
          </motion.section>

          {/* Ayurvedic Treatment */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Ayurvedic Treatment Approach at Deep Jyoti Medical</h2>
            <div className="rounded-2xl overflow-hidden mb-6 h-56">
              <img src={HERBS_IMG} alt="Ayurvedic herbal medicines for piles treatment" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Dr. Nilratan Mahapatra follows a classical four-pronged Ayurvedic approach to treating 
              piles that addresses both symptoms and root causes simultaneously:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "1. Bhaishajya Chikitsa (Herbal Medicines)",
                  desc: "Classical formulations prescribed internally to reduce swelling, stop bleeding, relieve constipation, and restore normal bowel function. Key medicines include Arshoghni Vati, Abhayarishta, Triphala Churna, and Kankayan Vati.",
                  icon: "🌿",
                },
                {
                  title: "2. Kshara Karma (Alkaline Cauterization)",
                  desc: "A safe, minimally invasive parasurgical procedure where Apamarga Kshara (plant ash alkali) is applied directly to the hemorrhoid mass. It effectively shrinks and destroys the pile mass without general anesthesia or hospitalization. Highly effective for Grade 2 and 3 piles.",
                  icon: "⚗️",
                },
                {
                  title: "3. Pathya (Diet & Lifestyle Modifications)",
                  desc: "A personalized high-fiber diet plan, adequate hydration, and bowel habit corrections form an essential pillar of treatment. Eliminating trigger foods and establishing a regular toilet routine is critical for preventing recurrence.",
                  icon: "🥦",
                },
                {
                  title: "4. Virechana (Therapeutic Purgation)",
                  desc: "For chronic and severe cases, a supervised Panchakarma detox using Virechana (controlled therapeutic purgation) clears accumulated toxins (Ama), resets the digestive system, and creates the foundation for lasting healing.",
                  icon: "🧘",
                },
              ].map((step) => (
                <div key={step.title} className="flex gap-4 p-5 bg-card rounded-xl border border-border/50">
                  <span className="text-2xl shrink-0">{step.icon}</span>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Key Medicines */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Key Ayurvedic Medicines for Piles</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Arshoghni Vati", use: "Primary anti-hemorrhoid formulation. Reduces swelling, bleeding, and mass size." },
                { name: "Triphala Churna", use: "Natural laxative that regularizes bowel movements and prevents constipation." },
                { name: "Abhayarishta", use: "Classical fermented tonic for digestive health, gas, and chronic piles." },
                { name: "Kankayan Vati", use: "Effective for both bleeding and non-bleeding piles with abdominal discomfort." },
                { name: "Nagakesara", use: "Excellent hemostatic herb to stop bleeding from hemorrhoids rapidly." },
                { name: "Daruharidra (Indian Barberry)", use: "Anti-inflammatory and antimicrobial for external application in piles." },
              ].map((med, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-secondary/5 border border-secondary/10 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{med.use}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              * All medicines are prescribed by Dr. Mahapatra based on individual assessment. Do not self-medicate.
            </p>
          </motion.section>

          {/* Diet */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Diet & Lifestyle for Piles — The Ayurvedic Way</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" /> Recommended Foods
                </h3>
                <ul className="space-y-1.5">
                  {["Whole grains — brown rice, wheat, oats", "High-fibre vegetables — spinach, bottle gourd", "Ripe papaya, figs, soaked raisins", "Buttermilk (Takra) — excellent for Arsha", "Warm water with lemon in the morning", "Moong dal — easy to digest", "Coconut water for hydration"].map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-5">
                <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" /> Foods to Avoid
                </h3>
                <ul className="space-y-1.5">
                  {["Spicy foods — chilli, hot sauces", "Deep-fried and oily snacks", "Red meat and processed food", "Alcohol and caffeinated drinks", "White bread and refined maida", "Raw banana and pomegranate", "Excessive non-vegetarian food"].map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-5 mt-4">
              <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" /> Lifestyle Tips
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {[
                  "Never suppress the urge to pass stools",
                  "Avoid sitting on the toilet for long",
                  "Take a 15-minute walk after meals",
                  "Drink 8–10 glasses of water daily",
                  "Avoid prolonged sitting at work",
                  "Practice Sitz bath (warm water soak) for relief",
                ].map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Doctor Image + Quote */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl overflow-hidden mb-6 h-56">
              <img src={NATURE_IMG} alt="Natural Ayurvedic healing environment" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 flex gap-4">
              <Quote className="w-10 h-10 text-accent shrink-0" />
              <div>
                <p className="text-foreground italic leading-relaxed mb-2 font-heading text-lg">
                  "Most patients who come to me with piles have been suffering silently for months, 
                  fearing surgery. In the majority of cases, we can achieve complete relief without 
                  any surgical intervention through classical Ayurvedic treatment. The key is 
                  addressing the digestive system as a whole, not just the symptom."
                </p>
                <p className="text-sm font-semibold text-foreground">— {DOCTOR.name}, {DOCTOR.qualifications}</p>
                <p className="text-xs text-muted-foreground">{DOCTOR.title}, Deep Jyoti Medical, Kolkata</p>
              </div>
            </div>
          </motion.section>

          {/* Why Choose */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Why Choose Ayurveda Over Surgery for Piles?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "No Anesthesia", desc: "Kshara Karma is performed with local or no anesthesia.", emoji: "💉" },
                { title: "No Hospitalization", desc: "Outpatient procedures and medicines — no hospital stays.", emoji: "🏠" },
                { title: "No Recurrence Risk", desc: "Treats root cause, not just the mass — far lower recurrence.", emoji: "🔁" },
                { title: "No Side Effects", desc: "Natural herbal formulations are safe for long-term use.", emoji: "✅" },
                { title: "Quick Recovery", desc: "Resume daily activities immediately after Kshara Karma.", emoji: "⚡" },
                { title: "Holistic Healing", desc: "Improves entire digestive health, not just piles.", emoji: "🌿" },
              ].map((b, i) => (
                <div key={i} className="p-4 bg-card rounded-xl border border-border/50 text-center">
                  <span className="text-2xl mb-2 block">{b.emoji}</span>
                  <p className="font-semibold text-sm text-foreground mb-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQs */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-heading text-base font-semibold hover:no-underline py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>

          {/* CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-primary rounded-2xl p-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-primary-foreground mb-3">
                Get Permanent Relief from Piles — Naturally
              </h2>
              <p className="text-primary-foreground/70 mb-6 max-w-lg mx-auto text-sm">
                Book a consultation with Dr. Nilratan Mahapatra at Deep Jyoti Medical, Rajabazar, Kolkata. 
                Personalized Ayurvedic treatment for lasting results.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/doctor#appointment">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <a href={WHATSAPP_URL("Hello! I'd like to consult about Ayurvedic treatment for piles.")} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </motion.section>

        </div>
      </article>
    </>
  );
}