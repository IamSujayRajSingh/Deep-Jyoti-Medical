import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Leaf, Search, Clock, ArrowRight, User } from "lucide-react";

const NATURE_IMG = "/images/c8316dd59_generated_7365d2ea.png";
const INGREDIENTS_IMG = "/images/6f320addc_generated_1956749e.png";
const HERBS_IMG = "/images/3d0d60dba_generated_c1e147b2.png";
const PILES_IMG = "/images/88fd49999_generated_image.png";

const categories = ["All", "Treatments", "Wellness", "Ayurvedic Lifestyle", "Nutrition", "Products"];

const blogPosts = [
  { id: 1, title: "Best Ayurvedic Doctor in Rajabazar — Why Dr. Mahapatra is Kolkata's Trusted Physician", category: "Treatments", image: NATURE_IMG, excerpt: "Discover why families across Central Kolkata trust Dr. Nilratan Mahapatra for authentic Ayurvedic consultations and treatments for over 31 years.", date: "2024-12-15", readTime: "5 min" },
  { id: 2, title: "Ayurvedic Treatment for Hair Fall — A Complete Guide", category: "Treatments", image: HERBS_IMG, excerpt: "Learn how classical Ayurvedic treatments can reverse hair fall naturally. Expert insights from Dr. Mahapatra on Bhringraj, diet, and scalp therapy.", date: "2024-12-10", readTime: "7 min" },
  { id: 3, title: "Natural Remedies for Acidity — Ayurvedic Perspective", category: "Wellness", image: INGREDIENTS_IMG, excerpt: "Chronic acidity plagues millions. Here's how Ayurveda treats it at the root by balancing Pitta dosha with herbs and lifestyle changes.", date: "2024-12-05", readTime: "6 min" },
  { id: 4, title: "Ayurvedic Care for Joint Pain — What You Need to Know", category: "Treatments", image: NATURE_IMG, excerpt: "Joint pain and arthritis are among the most common ailments treated at Deep Jyoti Medical. Learn about our Vata-pacifying approach.", date: "2024-11-28", readTime: "6 min" },
  { id: 5, title: "Benefits of Ayurvedic Oils — From Mahanarayan to Bhringraj", category: "Products", image: HERBS_IMG, excerpt: "A comprehensive guide to classical Ayurvedic oils, their benefits, and how to use them effectively for pain relief, hair care, and skin health.", date: "2024-11-20", readTime: "8 min" },
  { id: 6, title: "Digestive Health Through Ayurveda — Strengthening Your Agni", category: "Wellness", image: INGREDIENTS_IMG, excerpt: "In Ayurveda, digestion is the cornerstone of health. Learn how to strengthen your digestive fire (Agni) through herbs, diet, and daily routines.", date: "2024-11-15", readTime: "5 min" },
  { id: 7, title: "Understanding Your Prakriti — The Key to Personalized Healing", category: "Ayurvedic Lifestyle", image: NATURE_IMG, excerpt: "Your Prakriti (body constitution) determines everything from diet to exercise. Here's how to identify yours and live in balance.", date: "2024-11-10", readTime: "7 min" },
  { id: 8, title: "Immunity Boosting Through Ayurveda — Beyond Chyawanprash", category: "Nutrition", image: HERBS_IMG, excerpt: "While Chyawanprash is popular, Ayurveda offers a much broader immunity toolkit. Explore Rasayana therapies and daily immunity practices.", date: "2024-11-05", readTime: "6 min" },
  { id: 9, title: "Ayurvedic Clinic in Sealdah Area — Deep Jyoti Medical", category: "Treatments", image: INGREDIENTS_IMG, excerpt: "Located near Sealdah, Deep Jyoti Medical provides expert Ayurvedic consultations for residents of Sealdah, Narkeldanga, and surrounding areas.", date: "2024-10-28", readTime: "4 min" },
  { id: 10, title: "Ayurvedic Treatment for Piles in Kolkata — Heal Without Surgery", category: "Treatments", image: PILES_IMG, excerpt: "Discover how classical Ayurveda treats hemorrhoids (Arsha) safely and effectively without surgery using Kshara Karma, herbal medicines, and diet therapy.", date: "2025-01-15", readTime: "9 min", link: "/blog/piles" },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = blogPosts[0];

  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-20 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent/30 text-accent bg-accent/5">
            <Leaf className="w-3 h-3 mr-1" /> Ayurvedic Insights
          </Badge>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Health & Wellness Blog
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Expert Ayurvedic insights, treatment guides, and natural wellness tips from 
            Dr. Nilratan Mahapatra and the Deep Jyoti Medical team.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-2xl border border-border/50 overflow-hidden mb-12"
          >
            <div className="h-64 md:h-80">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-6 md:p-8">
              <Badge className="mb-3 bg-secondary/10 text-secondary border-0">{featured.category}</Badge>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{featured.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. Mahapatra</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readTime}</span>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-primary" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(1).map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <Badge variant="outline" className="mb-2 text-xs">{post.category}</Badge>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    {post.link ? (
                      <Link to={post.link} className="flex items-center gap-1 text-secondary font-medium group-hover:translate-x-1 transition-transform">
                        Read More <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-secondary font-medium group-hover:translate-x-1 transition-transform">
                        Read More <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="text-center mt-16 py-12 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="font-heading text-xl font-bold mb-2">100+ Articles Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              We're building a comprehensive library of Ayurvedic health articles covering treatments, 
              lifestyle tips, seasonal wellness guides, and more.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}