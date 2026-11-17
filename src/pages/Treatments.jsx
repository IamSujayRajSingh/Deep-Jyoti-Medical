import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Leaf, MessageCircle, Calendar, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_URL, DOCTOR } from "@/lib/constants";

const NATURE_IMG = "/images/c8316dd59_generated_7365d2ea.png";

const treatments = [
  {
    id: "hair-fall",
    title: "Hair Fall Treatment in Kolkata",
    symptoms: ["Excessive hair shedding", "Thinning hair", "Receding hairline", "Dry, brittle hair", "Scalp irritation"],
    causes: ["Pitta dosha imbalance", "Nutritional deficiency", "Stress & lifestyle", "Hormonal changes", "Chemical treatments"],
    approach: "Dr. Mahapatra's approach treats hair fall at its root by balancing Pitta dosha through internal medicines (Bhringraj, Amalaki) and external therapies (Shirodhara, medicated oils). A personalized diet plan addresses nutritional gaps.",
    benefits: ["Natural hair regrowth", "Stronger, thicker hair", "Healthy scalp", "No side effects", "Long-lasting results"],
    quote: "Hair fall is often a symptom of internal imbalance. We correct the imbalance, and healthy hair follows naturally.",
    faqs: [
      { q: "How long does Ayurvedic hair fall treatment take?", a: "Most patients see significant improvement within 2-3 months of consistent treatment." },
      { q: "Can Ayurveda treat genetic hair loss?", a: "While genetic factors play a role, Ayurveda can slow progression and strengthen existing hair." },
    ],
  },
  {
    id: "joint-pain",
    title: "Joint Pain Treatment in Kolkata",
    symptoms: ["Stiff joints", "Swelling", "Reduced mobility", "Cracking sounds", "Morning stiffness"],
    causes: ["Vata dosha aggravation", "Ama (toxin) accumulation", "Age-related degeneration", "Sedentary lifestyle", "Nutritional deficiency"],
    approach: "Treatment involves Vata-pacifying therapies including Panchakarma, Mahanarayan oil application, internal medicines like Yogaraja Guggulu, and specific dietary modifications to reduce inflammation naturally.",
    benefits: ["Pain relief without steroids", "Improved joint mobility", "Reduced inflammation", "Strengthened bones", "Prevention of recurrence"],
    quote: "Joint pain is the body's signal of accumulated toxins. Panchakarma and herbal medicines restore joint health from within.",
    faqs: [
      { q: "Is Ayurvedic treatment effective for arthritis?", a: "Yes, Ayurveda has proven effective for both osteoarthritis and rheumatoid arthritis management." },
      { q: "Can I continue my allopathic medicines?", a: "Yes, Ayurvedic treatment can complement existing medications. Dr. Mahapatra will guide you." },
    ],
  },
  {
    id: "diabetes-management",
    title: "Ayurvedic Diabetes Care in Kolkata",
    symptoms: ["Frequent urination", "Excessive thirst", "Unexplained weight loss", "Fatigue", "Slow wound healing"],
    causes: ["Kapha dosha imbalance", "Poor diet & lifestyle", "Genetic predisposition", "Stress", "Sedentary habits"],
    approach: "Comprehensive management through herbs like Guduchi, Shilajit, and Fenugreek, combined with specific diet plans, exercise guidance, and Panchakarma therapies to improve insulin sensitivity naturally.",
    benefits: ["Better blood sugar control", "Reduced dependency on medication", "Weight management", "Improved energy", "Prevention of complications"],
    quote: "Ayurveda doesn't just manage diabetes — it addresses the metabolic imbalance that causes it.",
    faqs: [
      { q: "Can Ayurveda cure diabetes?", a: "While Type 1 diabetes cannot be cured, Ayurveda can effectively manage Type 2 diabetes and often reduce medication dependency." },
      { q: "How does Ayurvedic diabetes management differ?", a: "Unlike conventional medicine, Ayurveda treats the whole body system, improving metabolism, digestion, and lifestyle." },
    ],
  },
  {
    id: "migraine",
    title: "Migraine Treatment in Kolkata",
    symptoms: ["Severe headaches", "Light sensitivity", "Nausea", "Visual disturbances", "Throbbing pain"],
    causes: ["Pitta & Vata imbalance", "Stress & anxiety", "Dietary triggers", "Sleep disruption", "Hormonal changes"],
    approach: "Treatment includes Shirolepa, Nasya therapy, cooling herbal medicines, and lifestyle modifications. Internal medicines like Pathyadi Kwatha and Brahmi help calm the nervous system.",
    benefits: ["Reduced frequency of attacks", "Lower intensity of pain", "Better stress management", "Improved sleep quality", "Natural, drug-free relief"],
    quote: "Migraine reflects an overheated Pitta system. Cooling therapies and herbs bring lasting relief without dependency.",
    faqs: [
      { q: "How many sessions needed for migraine relief?", a: "Most patients experience noticeable improvement within 4-6 weeks of treatment." },
      { q: "Are there dietary restrictions?", a: "Yes, Dr. Mahapatra will recommend specific dietary changes to avoid migraine triggers." },
    ],
  },
  {
    id: "skin-diseases",
    title: "Skin Disease Treatment in Kolkata",
    symptoms: ["Rashes", "Itching", "Dryness", "Pigmentation", "Acne breakouts"],
    causes: ["Blood impurities (Rakta dosha)", "Pitta aggravation", "Poor digestion", "Stress", "Environmental toxins"],
    approach: "Blood purification through Manjistha, Neem, and Khadira, combined with Virechana (therapeutic purgation) and external applications. Internal detoxification is key to lasting skin health.",
    benefits: ["Clear, healthy skin", "Reduced inflammation", "Natural glow", "No chemical side effects", "Long-term improvement"],
    quote: "Skin is the mirror of your internal health. When we purify the blood and balance Pitta, skin conditions resolve naturally.",
    faqs: [
      { q: "Can Ayurveda treat eczema and psoriasis?", a: "Yes, Ayurveda has effective protocols for chronic skin conditions including eczema, psoriasis, and dermatitis." },
      { q: "How long does skin treatment take?", a: "Chronic conditions may take 3-6 months, while acute issues often improve within weeks." },
    ],
  },
  {
    id: "piles",
    title: "Piles Treatment in Kolkata",
    symptoms: ["Bleeding during bowel movements", "Pain & discomfort", "Itching", "Swelling", "Mucus discharge"],
    causes: ["Chronic constipation", "Sedentary lifestyle", "Poor diet", "Straining", "Pregnancy"],
    approach: "Non-surgical treatment through Arshoghni Vati, Triphala, and Kshara Karma. Diet modifications with high-fiber foods, proper hydration, and lifestyle changes for lasting relief.",
    benefits: ["Non-surgical treatment", "No hospitalization", "Quick pain relief", "Prevents recurrence", "Improved digestive health"],
    quote: "Most piles cases can be effectively treated through Ayurveda without surgery. The key is correcting the digestive system.",
    faqs: [
      { q: "Can piles be treated without surgery in Ayurveda?", a: "Yes, Grade 1 and 2 piles respond very well to Ayurvedic treatment. Even Grade 3 can be managed conservatively." },
      { q: "What dietary changes are needed?", a: "A high-fiber diet with adequate water intake is essential. Specific recommendations will be provided." },
    ],
  },
  {
    id: "digestive-issues",
    title: "Digestive Disorders Treatment",
    symptoms: ["Bloating", "Gas", "Acid reflux", "Irregular bowel movements", "Abdominal pain"],
    causes: ["Agni (digestive fire) imbalance", "Poor eating habits", "Stress", "Food intolerances", "Irregular meal times"],
    approach: "Restoring Agni through Trikatu, Hingvastak Churna, and specific dietary protocols. Panchakarma therapies like Virechana help reset the digestive system for optimal function.",
    benefits: ["Improved digestion", "Reduced bloating", "Better nutrient absorption", "Regular bowel movements", "Enhanced energy"],
    quote: "In Ayurveda, we say 'Agni is the source of life.' When digestion is strong, the body heals itself.",
    faqs: [
      { q: "Can Ayurveda treat IBS?", a: "Yes, IBS responds excellently to Ayurvedic treatment combining internal medicines and lifestyle modifications." },
      { q: "How important is diet in digestive treatment?", a: "Diet is 50% of the treatment. Dr. Mahapatra provides personalized meal plans alongside medicines." },
    ],
  },
];

export default function Treatments() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={NATURE_IMG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5">
            <Leaf className="w-3 h-3 mr-1" /> Ayurvedic Treatments
          </Badge>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Comprehensive Ayurvedic Treatment in Kolkata
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evidence-based Ayurvedic solutions for chronic conditions by Dr. Nilratan Mahapatra 
            with 31+ years of clinical experience.
          </p>
        </div>
      </section>

      {/* Treatment Sections */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {treatments.map((t, i) => (
            <motion.article
              key={t.id}
              id={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-24"
            >
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-6 pb-4 border-b border-border/50">
                {t.title}
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-card rounded-xl p-5 border border-border/50">
                  <h3 className="font-heading text-lg font-semibold mb-3 text-foreground">Symptoms</h3>
                  <ul className="space-y-1.5">
                    {t.symptoms.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border/50">
                  <h3 className="font-heading text-lg font-semibold mb-3 text-foreground">Common Causes</h3>
                  <ul className="space-y-1.5">
                    {t.causes.map((c, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/5 rounded-xl p-5 border border-secondary/10 mb-6">
                <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">Our Ayurvedic Approach</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.approach}</p>
              </div>

              <div className="bg-card rounded-xl p-5 border border-border/50 mb-6">
                <h3 className="font-heading text-lg font-semibold mb-3 text-foreground">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {t.benefits.map((b, j) => (
                    <Badge key={j} variant="outline" className="bg-secondary/5 border-secondary/20">{b}</Badge>
                  ))}
                </div>
              </div>

              {/* Doctor Quote */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 mb-6 flex gap-3">
                <Quote className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <p className="text-sm text-foreground italic leading-relaxed mb-1">"{t.quote}"</p>
                  <p className="text-xs text-muted-foreground font-medium">— {DOCTOR.name}</p>
                </div>
              </div>

              {/* FAQs */}
              <Accordion type="single" collapsible className="space-y-2 mb-6">
                {t.faqs.map((faq, j) => (
                  <AccordionItem key={j} value={`${t.id}-faq-${j}`} className="bg-card border border-border/50 rounded-lg px-4">
                    <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-3">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="flex flex-wrap gap-3">
                <a href={WHATSAPP_URL(`I'd like to know about ${t.title}.`)} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Discuss on WhatsApp
                  </Button>
                </a>
                <Link to="/doctor#appointment">
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}