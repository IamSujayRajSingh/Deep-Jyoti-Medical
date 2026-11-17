import React from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import AboutSection from "@/components/home/AboutSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import DoctorProfile from "@/components/home/DoctorProfile";
import ConditionsSection from "@/components/home/ConditionsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PrescriptionSection from "@/components/home/PrescriptionSection";
import InquirySection from "@/components/home/InquirySection";
import ReviewsSection from "@/components/home/ReviewsSection";
import FAQSection from "@/components/home/FAQSection";
import LocationSection from "@/components/home/LocationSection";
import WhatsAppBanner from "@/components/home/WhatsAppBanner";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <AboutSection />
      <WhyChooseUs />
      <DoctorProfile />
      <ConditionsSection />
      <FeaturedProducts />
      <PrescriptionSection />
      <ReviewsSection />
      <InquirySection />
      <FAQSection />
      <LocationSection />
      <WhatsAppBanner />
    </>
  );
}