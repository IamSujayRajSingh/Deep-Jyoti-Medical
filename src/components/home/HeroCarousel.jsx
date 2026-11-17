import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image: "/images/b8c70ee8e_ChatGPTImageSep24202601_01_34PM.png",
    alt: "Deep Jyoti Medical Ayurvedic hair care collection featuring trusted hair oils, tablets, serums and herbal shampoos.",
    ctaText: "EXPLORE HAIR CARE",
    ctaTo: "/products?category=Hair%20Care",
    ctaAriaLabel: "Explore the Ayurvedic Hair Care collection",
  },
  {
    image: "/images/af54da419_ChatGPTImageSep24202601_19_10PM.png",
    alt: "Deep Jyoti Medical Ayurvedic thyroid wellness collection featuring trusted herbal products.",
    ctaText: "EXPLORE THYROID CARE",
    ctaTo: "/products?category=Thyroid%20%26%20Hormonal",
    ctaAriaLabel: "Explore the Ayurvedic Thyroid Care collection",
  },
];

const AUTOPLAY_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef(null);

  const count = slides.length;
  const go = useCallback((next) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Autoplay — every 5s, paused on hover/focus or when reduced-motion is requested.
  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, reduced, count]);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
  };

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Ayurvedic collections"
      onKeyDown={onKey}
      className="relative w-full"
    >
      <div
        className="group relative w-full max-w-[1600px] mx-auto overflow-hidden aspect-[16/9]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides track */}
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: reduced ? "none" : "transform 700ms ease-out",
          }}
        >
          {slides.map((s, i) => (
            <div key={i} className="relative w-full h-full shrink-0" aria-hidden={i !== index}>
              <img
                src={s.image}
                alt={s.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
              {/* CTA — real clickable button positioned over the artwork CTA area (lower-left) */}
              <Link
                to={s.ctaTo}
                aria-label={s.ctaAriaLabel}
                className="absolute left-[5%] bottom-[9%] sm:left-[6%] sm:bottom-[12%] inline-flex items-center gap-2 rounded-full font-semibold tracking-wide shadow-lg bg-[#F5E6C8] text-[#1B4332] hover:bg-[#EAD29B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F5E6C8]/70 px-5 py-2.5 text-[11px] sm:px-7 sm:py-3 sm:text-sm transition-colors"
              >
                {s.ctaText}
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Previous / Next arrows */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-4 h-9 w-9 lg:h-11 lg:w-11 rounded-full bg-background/85 backdrop-blur text-foreground shadow-md flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-4 h-9 w-9 lg:h-11 lg:w-11 rounded-full bg-background/85 backdrop-blur text-foreground shadow-md flex items-center justify-center hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                i === index ? "bg-background" : "bg-background/50 hover:bg-background/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
