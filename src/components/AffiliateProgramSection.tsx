import React, { useState } from "react";
import { 
  Users, 
  DollarSign, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  Percent,
  Gift
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";
import { AffiliatePartner } from "../types";

interface AffiliateProgramSectionProps {
  storeConfig: StoreConfig;
}

export const AffiliateProgramSection: React.FC<AffiliateProgramSectionProps> = ({
  storeConfig,
}) => {
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("EasyPaisa");
  const [accountDetails, setAccountDetails] = useState("");
  const [platform, setPlatform] = useState("WhatsApp & Social Media");
  const [preferredCode, setPreferredCode] = useState("");

  const [isCopied, setIsCopied] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredPartner, setRegisteredPartner] = useState<AffiliatePartner | null>(null);

  // Live Generator demo code
  const demoCode = (preferredCode.trim() || partnerName.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "ALRAZA10").toUpperCase();
  const demoReferralLink = `https://alrazaoilmart.com/?ref=${demoCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(demoReferralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegisterAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerPhone.trim()) return;

    const finalCode = (preferredCode.trim() || partnerName.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "PARTNER10").toUpperCase();

    const newPartner: AffiliatePartner = {
      id: `AFF-${Date.now().toString().slice(-5)}`,
      name: partnerName.trim(),
      phone: partnerPhone.trim(),
      email: partnerEmail.trim() || `${finalCode.toLowerCase()}@partner.pk`,
      paymentMethod: payoutMethod,
      accountDetails: accountDetails.trim() || `${partnerPhone.trim()} (${payoutMethod})`,
      referralCode: finalCode,
      customDiscount: "10% Off for Buyers",
      platform,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "active",
      totalEarnings: 0,
      totalOrders: 0,
    };

    try {
      const saved = localStorage.getItem("alraza_all_affiliates");
      const list: AffiliatePartner[] = saved ? JSON.parse(saved) : [];
      list.unshift(newPartner);
      localStorage.setItem("alraza_all_affiliates", JSON.stringify(list));
    } catch {
      // fallback
    }

    setRegisteredPartner(newPartner);
    setIsRegistered(true);
  };

  return (
    <section 
      id="affiliate-program" 
      className="py-14 sm:py-20 bg-white border-b border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>Earn With Al Raza Mart</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Affiliate & Partner Program
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Earn <strong>10% cash commission</strong> on every order placed through your referral link. Payouts transferred directly to your EasyPaisa, JazzCash, or Bank Account.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-base mx-auto">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">Sign Up in 1 Minute</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fill out your name and mobile number below to generate your unique referral code. No fee, completely free to join.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-base mx-auto">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">Share Your Link</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Share your link on WhatsApp groups, Facebook, Instagram, YouTube, or recommend to grocery shoppers & family.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-base mx-auto">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">Get Paid 10% Cash</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              When orders are delivered, commission is automatically credited and sent to your EasyPaisa or JazzCash account.
            </p>
          </div>
        </div>

        {/* Affiliate Main Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Referral Link Generator */}
          <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Referral Link Generator</h3>
                <p className="text-xs text-slate-500">Test or generate your personal link</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">
                Your Preferred Promo Code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. TARIQ10 / FARHAN"
                  value={preferredCode}
                  onChange={(e) => setPreferredCode(e.target.value.toUpperCase())}
                  className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Generated Link Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Your Live Shareable Link:</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">10% Commission</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-emerald-800 font-semibold break-all">
                {demoReferralLink}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Link Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out Al Raza Pure Cold Pressed Oils, Spices & Stone-Ground Flour! Get authentic unadulterated essentials with Cash on Delivery: ${demoReferralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Share</span>
                </a>
              </div>
            </div>

            {/* Trust points */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day cookie attribution tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Minimum payout threshold: only Rs. 500</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transparent payouts every Monday</span>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            
            {isRegistered && registeredPartner ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Welcome to Al Raza Affiliate Network!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    Congratulations <strong>{registeredPartner.name}</strong>, your affiliate partner account is now active.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Partner Code:</span>
                    <span className="font-mono font-bold text-emerald-700">{registeredPartner.referralCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Commission Rate:</span>
                    <span className="font-bold text-slate-900">10% on every sale</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Payout Destination:</span>
                    <span className="font-semibold text-slate-900">{registeredPartner.paymentMethod} ({registeredPartner.phone})</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegistered(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Register Another Partner
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterAffiliate} className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Join Partner Program (Free Registration)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Start earning passive income by recommending authentic kitchen essentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ayesha / Tariq Mahmood"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      WhatsApp / Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03XX-XXXXXXX"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Payout Method *
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs cursor-pointer"
                    >
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                      <option value="HBL / Standard Bank">HBL / Other Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account Number / Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 03001234567 - Tariq Mahmood"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Where will you promote? (Platform / Audience)
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs cursor-pointer"
                  >
                    <option value="WhatsApp & Family/Friends">WhatsApp Groups, Family & Friends</option>
                    <option value="Instagram / TikTok Food Creator">Instagram / TikTok Food Creator</option>
                    <option value="YouTube Cooking Channel">YouTube Cooking & Health Channel</option>
                    <option value="Nutrition / Medical Clinic">Nutritionist / Gym / Health Clinic</option>
                    <option value="Retail Grocery Store">Retail Store / Local Mart</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Partner Program & Activate 10% Earning</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
