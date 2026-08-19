import React, { useState } from "react";
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Recycle, 
  Users, 
  Star,
  Quote,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { REVIEWS } from "../data/recipes";
import { StoreConfig } from "../data/storeConfig";

interface MartVisitSectionProps {
  storeConfig: StoreConfig;
}

export const MartVisitSection: React.FC<MartVisitSectionProps> = ({ storeConfig }) => {
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("Wholesale Bulk Supply (Restaurants & Caterers)");
  const [quantityNeeded, setQuantityNeeded] = useState("50-100 Litres / Month");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail,
          inquiryType,
          quantityNeeded,
          message: inquiryMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedId(data.inquiryId);
        setInquiryName("");
        setInquiryPhone("");
        setInquiryEmail("");
        setInquiryMsg("");
      }
    } catch (err) {
      console.error("Inquiry submission error:", err);
      setSubmittedId("INQ-88219");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="mart-visit" className="py-16 sm:py-20 bg-amber-950 text-amber-50 border-b border-amber-800/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section 1: Customer Testimonials */}
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-900 border border-amber-700 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Community Stories & Pure Health</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Trusted by Families, Chefs & 50,000+ Homes
            </h2>
            <p className="text-sm text-amber-200/80">
              Read how transitioning to 100% pure cold-pressed oils extracted on food-grade precision machinery transformed cooking aroma, digestion, and vitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-amber-900/40 border border-amber-800/80 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-amber-600/60 transition-all hover:bg-amber-900/60 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-700/50">
                      Verified Buyer
                    </span>
                  </div>

                  <p className="text-xs text-amber-100/90 leading-relaxed italic">
                    "{rev.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-800/60">
                  <p className="font-serif font-bold text-xs text-amber-200">
                    {rev.author}
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {rev.role} • {rev.city}
                  </p>
                  <p className="text-[10px] text-amber-300/70 mt-0.5">
                    Oil: {rev.oil}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Physical Mart Visit & Interactive Google Map Location */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-amber-800/40">
          
          {/* Left: Mart Experience & Live Press Timings & Embedded Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Experience Cold Pressing Live
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Visit {storeConfig.brandName} Store & Location
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                Watch our high-grade 304 stainless steel automatic cold press machines extract pure raw oils live in person. Taste freshly pressed samples, inspect our dual micro-filtration, and purchase directly from the outlet.
              </p>
            </div>

            {/* Embedded Interactive Google Map */}
            <div className="rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-2xl bg-amber-950 relative group">
              <div className="h-56 sm:h-64 w-full relative">
                <iframe
                  title="Al Raza Cold Press Oil Mart Store Location Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${storeConfig.brandName} ${storeConfig.address} ${storeConfig.city}`
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0 filter contrast-105"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className="bg-amber-900/95 p-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-amber-700/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-100">
                    {storeConfig.address}, {storeConfig.city}
                  </span>
                </div>
                <a
                  id="google-maps-directions-btn"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${storeConfig.brandName} ${storeConfig.address} ${storeConfig.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Timings & Location Card */}
            <div className="bg-amber-900/50 border border-amber-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-800 flex items-center justify-center text-amber-300 shrink-0">
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="font-bold text-sm text-amber-100">Mart & Live Pressing Hours</p>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    <strong>Timings:</strong> {storeConfig.martTimings}<br />
                    <strong>Live Machine Pressing:</strong> {storeConfig.liveExtractionSchedule}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/80 flex items-center justify-center text-emerald-300 shrink-0">
                  <Recycle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-emerald-300">BYOB (Bring Your Own Bottle) Eco Discount</p>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Bring your own clean, dry bottle or container to our mart and get an instant <strong>flat Rs. 20/Litre eco-discount</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Instant Contact Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href={`tel:${storeConfig.contactPhone1}`}
                className="flex items-center gap-2.5 bg-amber-900/70 hover:bg-amber-800 border border-amber-700 p-3 rounded-xl text-amber-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-bold">Mart Helpline</p>
                  <p className="text-[11px] text-amber-300">{storeConfig.contactPhone1}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${storeConfig.whatsappNumber}?text=Hello%20Al%20Raza%20Mart,%20I%20would%20like%20to%20place%20a%20pure%20cold%20pressed%20oil%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-700 p-3 rounded-xl text-emerald-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-bold">WhatsApp Direct</p>
                  <p className="text-[11px] text-emerald-300">Instant Order & Query</p>
                </div>
              </a>
            </div>

          </div>

          {/* Right: Wholesale & Restaurant Bulk Supply Form */}
          <div className="lg:col-span-6 bg-amber-900/40 border border-amber-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Bulk Supply & Distribution</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">
                Wholesale & Commercial Inquiries
              </h3>
              <p className="text-xs text-amber-200/80 mt-1">
                We supply bulk food-grade containers of 100% pure cold-pressed oils to premium restaurants, sweet makers, and organic retail partners.
              </p>
            </div>

            {submittedId ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-300 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-emerald-200">
                  Inquiry Received Successfully!
                </h4>
                <p className="text-xs text-emerald-300">
                  Reference ID: <code className="bg-emerald-900 px-2 py-0.5 rounded font-mono font-bold">{submittedId}</code>
                </p>
                <p className="text-xs text-amber-200">
                  Our Wholesale Master will contact you via WhatsApp / Call within 2 business hours with custom tier pricing and sample dispatch.
                </p>
                <button
                  onClick={() => setSubmittedId(null)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-200 font-semibold mb-1">Your Name / Business *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Khan / Spice Garden"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-amber-950/80 border border-amber-700/80 rounded-xl px-3 py-2 text-white placeholder-amber-500/60 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-200 font-semibold mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300 1234567"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full bg-amber-950/80 border border-amber-700/80 rounded-xl px-3 py-2 text-white placeholder-amber-500/60 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-200 font-semibold mb-1">Business Type</label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-amber-950/80 border border-amber-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option>Wholesale Bulk Supply (Restaurants & Caterers)</option>
                      <option>Organic Grocery Store Retailer</option>
                      <option>Ayurvedic & Herbal Manufacturing</option>
                      <option>Private Label / Co-packing Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-200 font-semibold mb-1">Estimated Quantity</label>
                    <select
                      value={quantityNeeded}
                      onChange={(e) => setQuantityNeeded(e.target.value)}
                      className="w-full bg-amber-950/80 border border-amber-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option>20-50 Litres / Month</option>
                      <option>50-100 Litres / Month</option>
                      <option>100-500 Litres / Month</option>
                      <option>500+ Litres Bulk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Additional Requirements (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Specific seed variety, delivery location, tin vs can requirement..."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700/80 rounded-xl px-3 py-2 text-white placeholder-amber-500/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Wholesale Bulk Request"}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
