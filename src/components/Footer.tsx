import React, { useState } from "react";
import { 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  Truck,
  Heart,
  Flame,
  Wheat,
  Building2,
  Gift
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

interface FooterProps {
  onOpenOrderTracking?: () => void;
  storeConfig: StoreConfig;
  onOpenOwnerPanel?: () => void;
  onSelectCategory?: (category: "all" | "oils" | "spices" | "flour" | "beauty") => void;
  scrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOrderTracking,
  storeConfig,
  onOpenOwnerPanel,
  onSelectCategory,
  scrollToSection,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const handleNav = (sectionId: string) => {
    if (scrollToSection) {
      scrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer 
      id="website-footer-main"
      className="bg-slate-50 border-t border-slate-200 text-slate-700 transition-colors duration-200"
    >
      {/* Top Trust Badges Strip */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-emerald-600" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Cold-Pressed Oils
              </h4>
              <p className="text-[11px] text-slate-500">
                Extraction &lt; 38°C Without Chemicals
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Ground Spices
              </h4>
              <p className="text-[11px] text-slate-500">
                Zero Artificial Food Colors or Fillers
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Wheat className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Stone-Ground Whole Wheat Flour
              </h4>
              <p className="text-[11px] text-slate-500">
                Bran &amp; Germ Intact • Zero Maida
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Cash on Delivery
              </h4>
              <p className="text-[11px] text-slate-500">
                Secure Delivery Across Pakistan
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                {storeConfig.brandName}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Dedicated to traditional cold-pressed virgin oils, stone-ground unbleached wheat flour, and unadulterated whole ground spices. Retaining raw aroma, vital nutrients, and natural health benefits.
            </p>

            <div className="pt-2 text-xs space-y-2 text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{storeConfig.address}, {storeConfig.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{storeConfig.contactPhone1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{storeConfig.email}</span>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onSelectCategory?.("oils")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Droplet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cold Pressed Oils</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("spices")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Spices (Masalajat)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("flour")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Wheat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Stone-Ground Flour</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("beauty")}
                  className="hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Hair Oil &amp; Beauty</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("all")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>All Pantry Essentials</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Business & Programs */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              B2B &amp; Programs
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => handleNav("wholesale-bulk")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Wholesale &amp; Bulk Orders</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav("affiliate-program")}
                  className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800"
                >
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Affiliate Program (Earn 10%)</span>
                </button>
              </li>
              {onOpenOrderTracking && (
                <li>
                  <button
                    onClick={onOpenOrderTracking}
                    className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Track Your Order</span>
                  </button>
                </li>
              )}
              {onOpenOwnerPanel && (
                <li>
                  <button
                    onClick={onOpenOwnerPanel}
                    className="hover:text-emerald-700 transition-colors text-slate-400 text-[11px] cursor-pointer pt-2"
                  >
                    Owner Admin Access
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Direct WhatsApp Ordering & Newsletter */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Direct Helpline
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Order directly or ask questions on our dedicated customer care WhatsApp.
            </p>

            <a
              href={`https://wa.me/${(storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello! I want to place an order.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {storeConfig.contactPhone1}</span>
            </a>

            <div className="pt-2">
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter email for deals..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {storeConfig.brandName}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Natural Artisanal Purity</span>
            <span>•</span>
            <span>Food-Grade Sealed Containers</span>
            <span>•</span>
            <span>Nationwide COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
