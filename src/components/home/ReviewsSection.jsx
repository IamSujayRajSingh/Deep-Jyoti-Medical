import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Subhashis Ghosh",
    rating: 5,
    text: "Dr. Mahapatra is an excellent Ayurvedic physician. I've been consulting him for my chronic acidity issues and the improvement has been remarkable. Highly recommended!",
    date: "2 months ago",
  },
  {
    name: "Priya Banerjee",
    rating: 5,
    text: "Deep Jyoti Medical has been our family's go-to Ayurvedic store for over 10 years. The medicines are authentic and the staff is very helpful.",
    date: "1 month ago",
  },
  {
    name: "Amit Dey",
    rating: 5,
    text: "I had severe joint pain and was skeptical about Ayurveda. But Dr. Mahapatra's treatment plan worked wonders. Pain reduced significantly in just 3 weeks!",
    date: "3 months ago",
  },
  {
    name: "Suchitra Roy",
    rating: 5,
    text: "Very knowledgeable doctor. He takes time to explain the treatment and gives proper diet advice along with medicines. A rare find these days.",
    date: "2 weeks ago",
  },
  {
    name: "Rajesh Kumar Singh",
    rating: 5,
    text: "Best Ayurvedic clinic in the Rajabazar area. Doctor is very experienced and the medicines are genuine. Reasonable consultation fees too.",
    date: "1 month ago",
  },
  {
    name: "Dipanwita Mukherjee",
    rating: 5,
    text: "My hair fall issue was resolved within 2 months with Dr. Mahapatra's treatment. The personalized approach really makes a difference.",
    date: "3 weeks ago",
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-20 lg:py-28 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent mb-3">Patient Reviews</p>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-accent text-accent" />)}
          </div>
          <p className="text-muted-foreground">Based on Google Reviews</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-secondary/20 mb-3" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}