import React, { useState } from "react";
import { 
  Building2, 
  Truck, 
  Package, 
  Phone, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Droplet, 
  Flame, 
  Wheat, 
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  Percent,
  Check
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";
import { Product } from "../types";

export interface WholesaleInquiry {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  city: string;
  category: "all" | "oils" | "spices" | "flour" | "mixed";
  estimatedQuantity: string;
  frequency: "one-time" | "weekly" | "monthly";
  notes?: string;
  createdAt: string;
  status: "new" | "contacted" | "quote_sent" | "closed";
}

interface WholesaleBulkOrderFormProps {
  storeConfig: StoreConfig;
  products?: Product[];
}

export const WholesaleBulkOrderForm: React.FC<WholesaleBulkOrderFormProps> = ({
  storeConfig,
  products = [],
}) => {
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Lahore");
  const [category, setCategory] = useState<"all" | "oils" | "spices" | "flour" | "mixed">("oils");
  const [estimatedQuantity, setEstimatedQuantity] = useState("");
  const [frequency, setFrequency] = useState<"one-time" | "weekly" | "monthly">("one-time");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<WholesaleInquiry | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson.trim() || !phone.trim() || !estimatedQuantity.trim()) {
      return;
    }

    setIsSubmitting(true);

    const newInquiry: WholesaleInquiry = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      businessName: businessName.trim() || "Bulk Buyer / Retail Store",
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      category,
      estimatedQuantity: estimatedQuantity.trim(),
      frequency,
      notes: notes.trim(),
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "new",
    };

    try {
      const existing = localStorage.getItem("alraza_wholesale_inquiries");
      const list: WholesaleInquiry[] = existing ? JSON.parse(existing) : [];
      list.unshift(newInquiry);
      localStorage.setItem("alraza_wholesale_inquiries", JSON.stringify(list));
    } catch {
      // localStorage fallback
    }

    // 1. Dispatch email notification to owner's Gmail
    const targetEmail = storeConfig.notificationEmail || "tshirtsprintingworld@gmail.com";
    fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: `🏭 [WHOLESALE INQUIRY] ${newInquiry.businessName} - ${newInquiry.contactPerson}`,
        _template: "table",
        _captcha: "false",
        "Inquiry ID": newInquiry.id,
        "Business / Buyer": newInquiry.businessName,
        "Contact Person": newInquiry.contactPerson,
        "Mobile / WhatsApp": newInquiry.phone,
        "City": newInquiry.city,
        "Category": getCategoryTitle(newInquiry.category),
        "Quantity Needed": newInquiry.estimatedQuantity,
        "Frequency": newInquiry.frequency,
        "Special Notes": newInquiry.notes || "None",
      }),
    }).catch(() => {});

    // 2. Auto-prompt WhatsApp
    setTimeout(() => {
      try {
        const waClean = (storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "");
        window.open(`https://wa.me/${waClean}?text=${generateWhatsAppMessage(newInquiry)}`, "_blank");
      } catch {}
    }, 400);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedInquiry(newInquiry);
    }, 600);
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "oils": return "Cold Pressed Oils (Drums & Canisters: 5L - 200L)";
      case "spices": return "Spices & Masalajat (Bulk Sacks: 5kg - 50kg)";
      case "flour": return "Stone-Ground Flour & Grains (Bulk Bags: 20kg - 100kg)";
      default: return "Mixed Grocery & Commodities";
    }
  };

  const generateWhatsAppMessage = (inq: WholesaleInquiry) => {
    const text = `*New Wholesale & Bulk Order Inquiry [${inq.id}]*
• Business / Buyer: ${inq.businessName}
• Contact Person: ${inq.contactPerson}
• Mobile / WhatsApp: ${inq.phone}
• City / Destination: ${inq.city}
• Category: ${getCategoryTitle(inq.category)}
• Required Quantity: ${inq.estimatedQuantity}
• Frequency: ${inq.frequency.toUpperCase()}
${inq.notes ? `• Special Instructions: ${inq.notes}\n` : ""}
Please provide your wholesale price list and delivery timeline.`;
    return encodeURIComponent(text);
  };

  const targetWhatsApp = (storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "");

  return (
    <section 
      id="wholesale-bulk" 
      className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>B2B Wholesale & Commercial Supply</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Wholesale & Bulk Quantity Supply
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Direct mill and cold press supply for grocery marts, supermarkets, restaurants, hotels, bakeries, and bulk institutional buyers across Pakistan. Get discounted commercial pricing with guaranteed freshness.
          </p>
        </div>

        {/* 3 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Wholesale Volume Pricing</h4>
              <p className="text-xs text-slate-500 mt-1">
                Save 15% to 30% compared to retail prices on bulk canisters, sacks, and commercial drums.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Food-Grade Bulk Packaging</h4>
              <p className="text-xs text-slate-500 mt-1">
                Sealed 5L/10L/20L/50L/200L oil drums and 10kg/20kg/40kg/50kg moisture-proof flour and spice bags.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Nationwide Goods Transport</h4>
              <p className="text-xs text-slate-500 mt-1">
                Reliable cargo transport and doorstep truck delivery to Karachi, Lahore, Islamabad, Multan, and all cities.
              </p>
            </div>
          </div>
        </div>

        {/* Main Wholesale Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {submittedInquiry ? (
            /* Success State */
            <div className="p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Inquiry ID: {submittedInquiry.id}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3">
                  Wholesale Inquiry Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Thank you, <strong>{submittedInquiry.contactPerson}</strong>. Our wholesale commercial team will contact you at <strong>{submittedInquiry.phone}</strong> with the custom bulk quotation and delivery schedule.
                </p>
              </div>

              {/* Inquiry Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Business / Buyer:</span>
                  <span className="font-semibold text-slate-900">{submittedInquiry.businessName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">City / Destination:</span>
                  <span className="font-semibold text-slate-900">{submittedInquiry.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Commodity Category:</span>
                  <span className="font-semibold text-slate-900 capitalize">{submittedInquiry.category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Required Quantity:</span>
                  <span className="font-bold text-emerald-700">{submittedInquiry.estimatedQuantity}</span>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${targetWhatsApp}?text=${generateWhatsAppMessage(submittedInquiry)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Directly on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedInquiry(null);
                    setBusinessName("");
                    setContactPerson("");
                    setPhone("");
                    setEmail("");
                    setEstimatedQuantity("");
                    setNotes("");
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              
              {/* Step 1: Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Step 1: Select Commodity Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory("oils")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      category === "oils"
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <Droplet className="w-4 h-4 fill-emerald-600" />
                    </div>
                    <p className="text-xs font-bold">Cold Pressed Oils</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">5L, 10L, 20L, 200L drums</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("spices")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      category === "spices"
                        ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                      <Flame className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold">Spices (Masalajat)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">5kg, 10kg, 25kg, 50kg bags</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("flour")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      category === "flour"
                        ? "bg-amber-50 border-amber-600 ring-2 ring-amber-600/20 text-amber-950 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold">Stone-Ground Flour</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">20kg, 40kg, 100kg sacks</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("mixed")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      category === "mixed"
                        ? "bg-slate-100 border-slate-700 ring-2 ring-slate-700/20 text-slate-950 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-2">
                      <Package className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold">Mixed Grocery</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Multiple items & contracts</p>
                  </button>
                </div>
              </div>

              {/* Step 2: Contact & Business Information */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Step 2: Business & Contact Details
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Business / Shop / Buyer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Madina Superstore / Royal Restaurant"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Contact Person Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Farhan / Sheikh Bilal"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      WhatsApp / Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03XX-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      City / Delivery Destination *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs cursor-pointer"
                    >
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Other City (Pakistan)">Other City (Pakistan)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Quantity & Requirements */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Step 3: Quantity & Supply Frequency
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Estimated Quantity Needed *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100kg Whole Wheat Flour + 50 Litres Mustard Oil"
                      value={estimatedQuantity}
                      onChange={(e) => setEstimatedQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Requirement Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs cursor-pointer"
                    >
                      <option value="one-time">One-Time Trial Order</option>
                      <option value="weekly">Weekly Recurring Supply</option>
                      <option value="monthly">Monthly Contract</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Additional Notes / Target Specifications (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify preferred pack sizes (e.g. 20kg bags, 5L cans), private labeling / branding requirements, or delivery schedule..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct mill prices with commercial tax invoice & fast freight delivery</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Wholesale Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
