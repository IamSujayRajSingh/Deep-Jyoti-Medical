import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Leaf, ShieldCheck } from "lucide-react";

export default function PrescriptionSection() {
  return (
    <section className="py-14 lg:py-16 bg-primary/[0.03]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary to-[#143a2c]">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-7 sm:p-10 lg:p-12">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-secondary/15 items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-secondary/90 mb-2">
                  <Leaf className="w-3 h-3" /> Prescription Assistance
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground leading-tight">
                  Have a Prescription?
                </h2>
                <p className="mt-2 text-sm sm:text-base text-primary-foreground/80 max-w-xl">
                  Send us your prescription and let our team help you check availability and place your order.
                </p>
                <p className="mt-1 text-xs text-primary-foreground/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Uploaded securely — only our store team can view it.
                </p>
              </div>
            </div>
            <div className="md:self-center">
              <Link to="/send-prescription">
                <Button
                  size="lg"
                  className="bg-[#F5E6C8] text-[#1B4332] hover:bg-[#EAD29B] h-12 px-7 text-sm font-semibold tracking-wide w-full md:w-auto"
                >
                  SEND YOUR PRESCRIPTION
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}