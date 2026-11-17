import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Mail } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-28 lg:pt-32 pb-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent mb-3">
          <Leaf className="w-3 h-3" /> Privacy
        </span>
        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          This page is being finalized. The summary below explains how we handle your prescription
          submissions today. For any privacy concern, please contact us.
        </p>

        <div className="prose prose-sm max-w-none text-foreground/90 space-y-4">
          <p>
            <strong>Deep Jyoti Medical</strong> respects your privacy. When you submit a prescription
            request, the information you provide — your name, contact details, message and prescription
            file(s) — is used only to review your request, check product availability, and assist you
            with your order.
          </p>
          <p>
            Your prescription files are stored securely and are <strong>not publicly accessible</strong>.
            Only authorised Deep Jyoti Medical staff can access them. We do not display prescription
            uploads anywhere on the public website, and one customer cannot access another customer's
            prescription.
          </p>
          <p>
            We do not diagnose, recommend prescription medicines, alter your prescription, or generate
            medical advice based on your upload. Our team reviews the prescription and contacts you to
            guide you through the appropriate purchase flow.
          </p>
          <p>
            A more detailed policy will be published here soon. For questions, email{" "}
            <a className="text-primary underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
          </p>
        </div>

        <div className="mt-10">
          <Link to="/">
            <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}