export const BUSINESS = {
  name: "Deep Jyoti Medical",
  tagline: "Trusted Ayurvedic Care Since 1995",
  phone: "+91 90074 49644",
  phoneRaw: "919007449644",
  email: "deepjyotimedical63@gmail.com",
  whatsapp: "919007449644",
  address: "296 A.P.C. Road, Rajabazar Crossing, Kolkata, West Bengal – 700009",
  addressShort: "296 A.P.C. Road, Rajabazar, Kolkata",
  mapUrl: "https://maps.app.goo.gl/xK7qtkCkYuq8iCoG7",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.8!2d88.3752!3d22.5835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM1JzAwLjYiTiA4OMKwMjInMzAuNyJF!5e0!3m2!1sen!2sin!4v1",
  foundedYear: 1995,
  areasServed: ["Rajabazar", "Narkeldanga", "Sealdah", "Maniktolla", "College Street", "Sastitola", "Central Kolkata"],
};

export const DOCTOR = {
  name: "Dr. Nilratan Mahapatra",
  qualifications: "BAMS (CU)",
  title: "Senior Ayurvedic Consultant",
  experience: "31+",
  previousRole: "Ex Physician of J.B. Roy Hospital",
  timings: [
    { day: "Tuesday", time: "6:30 PM – 8:30 PM" },
    { day: "Friday", time: "6:30 PM – 8:30 PM" },
    { day: "Thursday", time: "12:00 PM – 2:00 PM" },
    { day: "Sunday", time: "12:00 PM – 2:00 PM" },
  ],
};

export const CONDITIONS = [
  "Acidity", "Joint Pain", "Hair Fall", "Skin Diseases",
  "Diabetes Management", "Weight Management", "Infertility Support",
  "Liver Disorders", "Piles", "Migraine", "Digestive Issues", "Lifestyle Disorders"
];

export const PRODUCT_CATEGORIES = [
  "All", "Hair Care", "Joint & Muscle", "Thyroid & Hormonal", "Women's Health", "Vitality & Wellness", "Classical Tablets"
];

export const WHATSAPP_URL = (message = "") =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message || "Hello! I'd like to inquire about Ayurvedic consultation at Deep Jyoti Medical.")}`;

export const CALL_URL = `tel:${BUSINESS.phone.replace(/\s/g, "")}`;