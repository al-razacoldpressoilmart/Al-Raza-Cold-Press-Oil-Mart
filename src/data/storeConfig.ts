import { ASSETS } from "../assets/images";

export interface PaymentMethodConfig {
  id: string;
  name: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  instructions: string;
  active: boolean;
  requiresProof: boolean;
}

export interface StoreConfig {
  brandName: string;
  brandTagline: string;
  brandBadge: string;
  logoUrl?: string; // Optional custom logo image URL
  
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;

  contactPhone1: string;
  contactPhone2: string;
  whatsappNumber: string;
  email: string;
  notificationEmail?: string; // Email for receiving real-time order notifications via FormSubmit
  address: string;
  city: string;
  martTimings: string;
  liveExtractionSchedule: string;
  mapsUrl: string;

  // Social Media Profiles
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;

  // Website Bottom / Footer Styling & Colors Customization
  footerStyleMode?: "theme" | "custom"; // "theme" = follow active 150 color themes; "custom" = custom colors chosen by owner
  footerBgColor?: string; // Custom footer background hex (e.g. #1c1917, #ffffff, #0f172a, etc.)
  footerTextColor?: string; // Custom footer text color hex (e.g. #fef3c7, #18181b, etc.)
  footerBorderColor?: string; // Custom footer border color hex (e.g. #78350f, #e2e8f0, etc.)
  footerTopBannerBg?: string; // Custom quality badges banner background

  // SEO & Search Engine Indexing Meta Configuration
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Delivery & Shipping Configuration (Owner Editable)
  deliveryFee: number; // Flat standard delivery fee (e.g. 150 PKR)
  freeDeliveryThreshold: number; // Order amount for free delivery (e.g. 2500 PKR)
  enableFreeDeliveryAboveThreshold: boolean; // Whether free delivery is enabled above threshold or charged separately
  deliveryEstimatedDays: string; // e.g. "2 to 3 Working Days (All Pakistan)"
  deliveryPolicyNotes?: string; // Shipping notes / courier details

  // Affiliate Program Settings (Owner Editable - 10% Earning per product)
  affiliateProgramActive: boolean;
  affiliateCommissionRate: number; // Default 10% (0.10 or 10)
  affiliateBuyerDiscount: number; // Default 10% discount for buyers
  affiliateMinPayout: number; // Minimum payout threshold in PKR (e.g. 500)
  affiliateTerms?: string;

  paymentMethods: PaymentMethodConfig[];
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  brandName: "AL RAZA",
  brandTagline: "Cold Press Oil Mart • Automatic Extraction",
  brandBadge: "Pure",
  heroTitle: "Pure, Unrefined",
  heroHighlight: "Cold-Pressed Oils",
  heroSubtitle: "Extracted fresh daily using advanced 304 Food-Grade Stainless Steel Automatic Cold Press Screw Extractor (<42°C). Retaining 100% of natural enzymes, plant antioxidants, aroma, and rich nutrients — free from chemical hexane solvents and refining heat.",
  heroBadge: "Pure Cold Press • Food Grade 304 Steel",
  heroImage: ASSETS.heroOilsDisplay,

  contactPhone1: "+92 300 1234567",
  contactPhone2: "+92 321 7654321",
  whatsappNumber: "923001234567",
  email: "care@alrazaoilmart.com",
  notificationEmail: "tshirtsprintingworld@gmail.com",
  address: "Shop #12-15, Main Organic Market Arcade, Commercial Area",
  city: "Lahore / Karachi",
  martTimings: "Monday – Saturday: 9:00 AM – 9:00 PM (Sunday Closed)",
  liveExtractionSchedule: "Daily 10:00 AM & 4:00 PM Live Machine Pressing",
  mapsUrl: "https://maps.google.com",

  // Social Media Defaults
  instagramUrl: "https://instagram.com/alrazaoilmart",
  facebookUrl: "https://facebook.com/alrazaoilmart",
  youtubeUrl: "https://youtube.com/@alrazaoilmart",
  tiktokUrl: "https://tiktok.com/@alrazaoilmart",

  // Website Bottom / Footer Customization Defaults
  footerStyleMode: "theme",
  footerBgColor: "#1c1917",
  footerTextColor: "#fef3c7",
  footerBorderColor: "#78350f",
  footerTopBannerBg: "#291809",

  // SEO Meta Defaults
  metaTitle: "Al Raza Cold Press Oil Mart | 100% Pure & Fresh Organic Oils",
  metaDescription: "Buy pure, unrefined cold-pressed oils extracted fresh daily under 42°C in food-grade 304 stainless steel machinery. 100% natural mustard, sesame, almond, black seed, coconut & olive oils.",
  metaKeywords: "cold pressed oil, pure sarson ka tel, mustard oil, black seed kalonji oil, virgin coconut oil, almond oil, pure organic oil pakistan, kachi ghani, food grade cold press",

  // Delivery & Shipping Defaults
  deliveryFee: 150,
  freeDeliveryThreshold: 2500,
  enableFreeDeliveryAboveThreshold: true,
  deliveryEstimatedDays: "2 to 3 Working Days (Nationwide Delivery)",
  deliveryPolicyNotes: "All oil bottles are securely bubble-wrapped in double-wall shockproof packaging to guarantee zero leakage during courier transit.",

  // Affiliate Program Defaults (10% Earning)
  affiliateProgramActive: true,
  affiliateCommissionRate: 10, // 10% commission per product
  affiliateBuyerDiscount: 10, // 10% buyer discount
  affiliateMinPayout: 500,
  affiliateTerms: "Affiliate partners earn 10% flat commission on every product order placed using their referral link or coupon code. Payouts processed weekly via EasyPaisa, JazzCash, or Direct Bank IBFT.",

  paymentMethods: [
    {
      id: "easypaisa",
      name: "EasyPaisa",
      accountTitle: "Al Raza Pure Oils",
      accountNumber: "03001234567",
      instructions: "Send order amount to this EasyPaisa number. Copy TID and upload screenshot.",
      active: true,
      requiresProof: true,
    },
    {
      id: "jazzcash",
      name: "JazzCash",
      accountTitle: "Al Raza Pure Oils",
      accountNumber: "03001234567",
      instructions: "Send order amount to this JazzCash account. Enter TID and attach screenshot.",
      active: true,
      requiresProof: true,
    },
    {
      id: "meezan_bank",
      name: "Meezan Bank Transfer (IBFT)",
      accountTitle: "Al Raza Mart Enterprises",
      accountNumber: "01010101010101",
      iban: "PK00MEZN0000000101010101",
      instructions: "Transfer to Meezan Bank account. Enter transaction TID and upload screenshot proof.",
      active: true,
      requiresProof: true,
    },
    {
      id: "hbl_bank",
      name: "Habib Bank Limited (HBL)",
      accountTitle: "Al Raza Mart Enterprises",
      accountNumber: "22334455667788",
      iban: "PK00HABB0000002233445566",
      instructions: "Transfer via HBL Mobile / ATM. Enter transaction TID and upload screenshot proof.",
      active: true,
      requiresProof: true,
    },
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      accountTitle: "COD",
      accountNumber: "N/A",
      instructions: "Pay in cash to the rider upon delivery. No advance TID needed.",
      active: true,
      requiresProof: false,
    },
  ],
};
