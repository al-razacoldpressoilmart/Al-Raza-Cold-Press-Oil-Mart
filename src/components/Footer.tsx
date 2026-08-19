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
  Award,
  Heart,
  PackageCheck,
  Cpu,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Truck
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";
import { COLOR_THEMES } from "../data/themes";

interface FooterProps {
  onOpenAffiliate?: () => void;
  onOpenOrderTracking?: () => void;
  onOpenQuiz?: () => void;
  onOpenBatchVerifier?: (code?: string) => void;
  storeConfig: StoreConfig;
  activeThemeId?: string;
  onChangeTheme?: (themeId: string) => void;
  onOpenOwnerPanel?: () => void;
}

function isLightColor(colorStr?: string): boolean {
  if (!colorStr) return false;
  if (colorStr.startsWith("#")) {
    const hex = colorStr.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return 0.299 * r + 0.587 * g + 0.114 * b > 165;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return 0.299 * r + 0.587 * g + 0.114 * b > 165;
    }
  }
  return false;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAffiliate,
  onOpenOrderTracking,
  onOpenQuiz,
  onOpenBatchVerifier,
  storeConfig,
  activeThemeId = "obsidian-luxury-black",
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const affRate = storeConfig.affiliateCommissionRate ?? 10;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const currentTheme = COLOR_THEMES.find((t) => t.id === activeThemeId) || COLOR_THEMES[0];

  const isCustomMode = storeConfig.footerStyleMode === "custom";
  const isWhiteMinimal = currentTheme.category === "Pure & Minimalist White" && !isCustomMode;

  const footerBg = isCustomMode 
    ? (storeConfig.footerBgColor || "#1c1917")
    : (isWhiteMinimal ? (currentTheme.bgSecondary || "#f8fafc") : (currentTheme.headerBg || "#1c1917"));

  const footerText = isCustomMode
    ? (storeConfig.footerTextColor || "#fef3c7")
    : (isWhiteMinimal ? (currentTheme.textColor || "#0f172a") : "#fef3c7");

  const footerBorder = isCustomMode
    ? (storeConfig.footerBorderColor || "#78350f")
    : (currentTheme.border || "#e2e8f0");

  const footerTopBanner = isCustomMode
    ? (storeConfig.footerTopBannerBg || (isLightColor(footerBg) ? "#f1f5f9" : "rgba(0,0,0,0.25)"))
    : (isWhiteMinimal ? "#ffffff" : "rgba(0,0,0,0.25)");

  const isLight = isLightColor(footerBg);

  return (
    <footer 
      id="website-footer-main"
      className="border-t-2 transition-colors duration-300"
      style={{
        backgroundColor: footerBg,
        color: footerText,
        borderColor: footerBorder,
      }}
    >
      {/* Top Banner / Quality Badges Row */}
      <div 
        className="border-b py-8 transition-colors duration-300"
        style={{
          backgroundColor: footerTopBanner,
          borderColor: footerBorder,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                  isLight ? "bg-stone-200 text-stone-800" : "bg-stone-800 text-amber-400"
                }`}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className={`font-serif font-bold text-sm ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                Cold Press Extractor
              </h4>
              <p className={`text-[11px] ${isLight ? "text-stone-600" : "opacity-80"}`}>
                304 Stainless Steel Screw &lt; 42°C
              </p>
            </div>

            <div className="space-y-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                  isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className={`font-serif font-bold text-sm ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                Zero Chemicals
              </h4>
              <p className={`text-[11px] ${isLight ? "text-stone-600" : "opacity-80"}`}>
                0.00% Mineral oil & zero chemical solvents
              </p>
            </div>

            <div className="space-y-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                  isLight ? "bg-stone-200 text-stone-800" : "bg-stone-800 text-amber-400"
                }`}
              >
                <PackageCheck className="w-5 h-5" />
              </div>
              <h4 className={`font-serif font-bold text-sm ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                Pure Food-Grade Bottles
              </h4>
              <p className={`text-[11px] ${isLight ? "text-stone-600" : "opacity-80"}`}>
                Aroma-locked & leak-proof tamper sealing
              </p>
            </div>

            <div className="space-y-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                  isLight ? "bg-stone-200 text-stone-800" : "bg-stone-800 text-amber-400"
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className={`font-serif font-bold text-sm ${isLight ? "text-stone-900" : "text-stone-100"}`}>
                Fresh Daily Pressing
              </h4>
              <p className={`text-[11px] ${isLight ? "text-stone-600" : "opacity-80"}`}>
                Extracted daily for raw aroma & potency
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Col 1: Brand story */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-md border"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: isLightColor(currentTheme.primary) ? "#18181b" : "#ffffff",
                  borderColor: footerBorder
                }}
              >
                AR
              </div>
              <div>
                <span className={`font-serif text-lg font-bold tracking-wide block ${isLight ? "text-stone-950" : "text-white"}`}>
                  {storeConfig.brandName}
                </span>
                <span 
                  className="text-[10px] uppercase tracking-widest block font-bold"
                  style={{ color: currentTheme.accent || currentTheme.primary }}
                >
                  {storeConfig.brandTagline}
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? "text-stone-600" : "opacity-80"}`}>
              Dedicated to delivering 100% pure, unadulterated cold-pressed oils. We extract pure culinary and therapeutic oils below 42°C using advanced stainless steel cold press machinery — bringing pure nature directly to your kitchen.
            </p>

            <div className={`pt-2 text-xs space-y-1.5 ${isLight ? "text-stone-700" : "opacity-90"}`}>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{storeConfig.address}, {storeConfig.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{storeConfig.contactPhone1} {storeConfig.contactPhone2 ? `/ ${storeConfig.contactPhone2}` : ""}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{storeConfig.email}</span>
              </p>
            </div>

            {/* Social Media Links from Owner Configuration */}
            <div 
              className="pt-3 border-t"
              style={{ borderColor: footerBorder }}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-2 ${isLight ? "text-stone-800" : "opacity-90"}`}>
                Follow Pure Organic Oils
              </span>
              <div className="flex items-center gap-2.5">
                {storeConfig.instagramUrl && (
                  <a
                    id="footer-social-instagram"
                    href={storeConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs hover:scale-105 ${
                      isLight 
                        ? "bg-white border border-stone-300 text-stone-700 hover:text-rose-600 hover:border-rose-300"
                        : "bg-stone-900 border border-stone-700 text-stone-200 hover:text-white hover:border-rose-500"
                    }`}
                    title="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {storeConfig.facebookUrl && (
                  <a
                    id="footer-social-facebook"
                    href={storeConfig.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs hover:scale-105 ${
                      isLight 
                        ? "bg-white border border-stone-300 text-stone-700 hover:text-blue-600 hover:border-blue-300"
                        : "bg-stone-900 border border-stone-700 text-stone-200 hover:text-white hover:border-blue-500"
                    }`}
                    title="Facebook Page"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {storeConfig.youtubeUrl && (
                  <a
                    id="footer-social-youtube"
                    href={storeConfig.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs hover:scale-105 ${
                      isLight 
                        ? "bg-white border border-stone-300 text-stone-700 hover:text-red-600 hover:border-red-300"
                        : "bg-stone-900 border border-stone-700 text-stone-200 hover:text-white hover:border-red-500"
                    }`}
                    title="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {storeConfig.tiktokUrl && (
                  <a
                    id="footer-social-tiktok"
                    href={storeConfig.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs hover:scale-105 ${
                      isLight 
                        ? "bg-white border border-stone-300 text-stone-700 hover:text-stone-950"
                        : "bg-stone-900 border border-stone-700 text-stone-200 hover:text-cyan-400"
                    }`}
                    title="TikTok Profile"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.41a8.3 8.3 0 0 0 4.91 1.63V6.69z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Oil Collections */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className={`font-serif font-bold text-sm uppercase tracking-wider ${isLight ? "text-stone-900" : "text-white"}`}>
              Pure Oils Catalog
            </h4>
            <ul className={`space-y-2 ${isLight ? "text-stone-600" : "opacity-80"}`}>
              <li><a href="#products" className="hover:underline transition-colors">Cold Pressed Groundnut (Peanut) Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Extra Virgin Coconut Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Cold Pressed Sesame (Til) Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Cold Pressed Black Seed (Kalonji) Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Cold Pressed Mustard (Sarson) Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Sweet Almond (Badam) Oil</a></li>
              <li><a href="#products" className="hover:underline transition-colors">Pure Castor & Flaxseed Oils</a></li>
            </ul>
          </div>

          {/* Col 3: Interactive Features */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <h4 className={`font-serif font-bold text-sm uppercase tracking-wider ${isLight ? "text-stone-900" : "text-white"}`}>
              Explore & Info
            </h4>
            <ul className={`space-y-2 ${isLight ? "text-stone-600" : "opacity-80"}`}>
              {onOpenOrderTracking && (
                <li>
                  <button
                    id="footer-track-order-btn"
                    onClick={onOpenOrderTracking}
                    className="hover:underline text-left flex items-center gap-1.5 transition-colors cursor-pointer text-amber-500 font-bold"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order Status</span>
                  </button>
                </li>
              )}
              {onOpenAffiliate && (
                <li>
                  <button
                    id="footer-affiliate-btn"
                    onClick={onOpenAffiliate}
                    className="hover:underline text-left flex items-center gap-1.5 transition-colors cursor-pointer text-emerald-600 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Affiliate Program ({affRate}%)</span>
                  </button>
                </li>
              )}
              {onOpenQuiz && (
                <li>
                  <button
                    id="footer-oil-quiz-btn"
                    onClick={onOpenQuiz}
                    className="hover:underline text-left transition-colors cursor-pointer"
                  >
                    Oil Recommendation Quiz
                  </button>
                </li>
              )}
              {onOpenBatchVerifier && (
                <li>
                  <button
                    id="footer-batch-verifier-btn"
                    onClick={() => onOpenBatchVerifier()}
                    className="hover:underline text-left transition-colors cursor-pointer"
                  >
                    Lab Batch Quality Verifier
                  </button>
                </li>
              )}
              <li>
                <a href="#process" className="hover:underline transition-colors block">
                  Cold Press Extraction Process
                </a>
              </li>
              <li>
                <a href="#recipes" className="hover:underline transition-colors block">
                  Healthy Traditional Recipes
                </a>
              </li>
              <li>
                <a href="#mart-visit" className="hover:underline transition-colors block">
                  Live Mart & Google Maps Location
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & WhatsApp */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className={`font-serif font-bold text-sm uppercase tracking-wider ${isLight ? "text-stone-900" : "text-white"}`}>
              Stay Connected
            </h4>
            <p className={`text-xs ${isLight ? "text-stone-600" : "opacity-80"}`}>
              Subscribe for monthly oil wellness tips and new freshly pressed batch notifications.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/40 rounded-xl text-emerald-600 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className={`w-full rounded-l-xl px-3 py-2 text-xs focus:outline-none border ${
                      isLight 
                        ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400"
                        : "bg-black/30 border-stone-700 text-white placeholder-stone-400"
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-r-xl transition-colors cursor-pointer shadow"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2">
              <a
                href={`https://wa.me/${(storeConfig.whatsappNumber || "").replace(/[^0-9]/g, "")}?text=Hello%20Al%20Raza%20Oil%20Mart,%20I%20would%20like%20to%20place%20an%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Instant Support</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Socials */}
        <div 
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4"
          style={{ borderColor: footerBorder, color: isLight ? "#64748b" : "rgba(244, 244, 245, 0.75)" }}
        >
          <p>© {new Date().getFullYear()} {storeConfig.brandName} • {storeConfig.brandTagline}. All rights reserved.</p>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              {storeConfig.instagramUrl && (
                <a href={storeConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" title="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {storeConfig.facebookUrl && (
                <a href={storeConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" title="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {storeConfig.youtubeUrl && (
                <a href={storeConfig.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" title="YouTube">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
              {storeConfig.tiktokUrl && (
                <a href={storeConfig.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" title="TikTok">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.41a8.3 8.3 0 0 0 4.91 1.63V6.69z"/>
                  </svg>
                </a>
              )}
            </div>

            <span>•</span>

            <span className="flex items-center gap-1">
              <span>Crafted for Pure Wellness & Health</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
