import { db } from "@/api/client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, MessageCircle, Phone, Mail, Loader2, FileText, ChevronLeft } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { WHATSAPP_URL } from "@/lib/constants";
import PrescriptionUploader from "@/components/prescription/PrescriptionUploader";

const normalizePhone = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const CONTACT_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
];

export default function SendPrescription() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", message: "",
    preferred_contact: "whatsapp", consent: false,
  });
  const [errors, setErrors] = useState(/** @type {Partial<Record<keyof typeof form | "files", string>>} */ ({}));
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Please enter your full name.";
    const mobile = normalizePhone(form.phone);
    if (!/^[6-9]\d{9}$/.test(mobile)) e.phone = "Please enter a valid mobile number.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Please enter a valid email address.";
    if (files.length === 0) e.files = "No prescription uploaded. Please upload your prescription.";
    if (!form.consent) e.consent = "Please accept the consent checkbox before submitting.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    if (busy) {
      toast({ title: "Upload in progress", description: "Please wait for your files to finish uploading.", variant: "destructive" });
      return;
    }
    if (!validate()) {
      toast({ title: "Please check the form", description: "Some required fields are missing.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const reference_id = `DJM-${Math.floor(100000 + Math.random() * 900000)}`;
      const phone = `+91 ${normalizePhone(form.phone)}`;
      await db.entities.PrescriptionRequest.create({
        reference_id,
        full_name: form.full_name.trim(),
        phone,
        email: form.email.trim(),
        message: form.message.trim(),
        preferred_contact: form.preferred_contact,
        status: "new",
        files,
      });

      // Best-effort admin notification email
      let emailSent = false;
      try {
        const settings = await db.entities.StoreSetting.list();
        const adminEmail = settings && settings[0] && settings[0].admin_email;
        if (adminEmail) {
          const body = [
            "New Prescription Request",
            `Reference ID: ${reference_id}`,
            `Customer: ${form.full_name.trim()}`,
            `Mobile: ${phone}`,
            `Email: ${form.email.trim() || "—"}`,
            `Preferred Contact: ${form.preferred_contact}`,
            `Message: ${form.message.trim() || "—"}`,
            `Prescription: ${files.length} file(s) — review securely in Admin → Prescriptions`,
            `Submission time: ${new Date().toLocaleString("en-IN")}`,
          ].join("\n");
          await db.integrations.Core.SendEmail({ to: adminEmail, subject: `New Prescription Request ${reference_id}`, text: body });
          emailSent = true;
        }
      } catch (err) {
        /* notification is best-effort; submission still succeeds */
      }
      if (emailSent) {
        try { await db.entities.PrescriptionRequest.update?.(reference_id, { email_sent: true }); } catch {}
      }
      setSubmitted({ reference_id, preferred_contact: form.preferred_contact });
    } catch (err) {
      toast({ title: "Submission failed", description: err.message || "Something went wrong while submitting. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const waMsg = `Hello Deep Jyoti Medical, I just submitted a prescription request. Reference ID: ${submitted.reference_id}`;
    return (
      <div className="min-h-screen pt-28 lg:pt-32 pb-16 flex items-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/15 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-secondary" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Prescription Received</h1>
            <p className="text-muted-foreground">
              Thank you. We've received your prescription. Our team will review your request and contact you shortly.
            </p>
          </div>
          <Card>
            <CardContent className="p-6 text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Reference ID</p>
                <p className="font-heading text-2xl font-bold text-primary">{submitted.reference_id}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Please keep this Reference ID for follow-up. Our team will reach out using your preferred contact method.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                <Link to="/products"><Button variant="outline" className="w-full sm:w-auto">Back to Shop</Button></Link>
                <Link to="/"><Button className="w-full sm:w-auto">Continue Shopping</Button></Link>
              </div>
              {submitted.preferred_contact === "whatsapp" && (
                <a href={WHATSAPP_URL(waMsg)} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full border-secondary/40 text-secondary hover:bg-secondary/10">
                    <MessageCircle className="w-4 h-4 mr-2" /> Contact us on WhatsApp
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 lg:pt-32 pb-16 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-accent/30 text-accent bg-accent/5">
            <FileText className="w-3 h-3 mr-1" /> Prescription Assistance
          </Badge>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-2">Send Your Prescription</h1>
          <p className="text-muted-foreground">
            Upload your prescription and our team will check product availability and assist you with your order.
          </p>
        </div>

        <Card>
          <CardContent className="p-5 sm:p-7">
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <Label htmlFor="rx-name">Full Name *</Label>
                <Input id="rx-name" value={form.full_name} onChange={set("full_name")} autoComplete="name" />
                {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
              </div>

              {/* Phone + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rx-phone">Mobile Number *</Label>
                  <Input id="rx-phone" value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit mobile" autoComplete="tel" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="rx-email">Email Address</Label>
                  <Input id="rx-email" value={form.email} onChange={set("email")} placeholder="optional" autoComplete="email" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Upload */}
              <div>
                <Label>Prescription Upload *</Label>
                <div className="mt-1.5">
                  <PrescriptionUploader onChange={setFiles} onBusy={setBusy} />
                </div>
                {errors.files && <p className="text-xs text-destructive mt-1">{errors.files}</p>}
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="rx-msg">Anything you'd like us to know?</Label>
                <Textarea id="rx-msg" value={form.message} onChange={set("message")} rows={3} placeholder="Example: I need these medicines for 30 days." />
              </div>

              {/* Preferred contact */}
              <div>
                <Label>Preferred Contact Method</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {CONTACT_OPTIONS.map((o) => {
                    const Icon = o.icon;
                    const active = form.preferred_contact === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set("preferred_contact")({ target: { value: o.value } })}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consent */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={set("consent")}
                    className="mt-1 w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to share the information and prescription uploaded above with Deep Jyoti Medical for the purpose of reviewing my request, checking product availability and contacting me about my order.
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-destructive mt-1">{errors.consent}</p>}
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={submitting || busy}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send Prescription</>}
              </Button>

              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Your prescription and personal information are used only to process your request and assist with your order.{" "}
                <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
