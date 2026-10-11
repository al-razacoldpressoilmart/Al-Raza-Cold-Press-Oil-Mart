import React from "react";
import { 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Truck,
  Banknote,
  Flame,
  Wheat,
  PackageCheck,
  Building2
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

interface HeroBannerProps {
  onExploreProducts: () => void;
  onWholesale?: () => void;
  onSelectCategory?: (category: "all" | "oils" | "spices" | "flour") => void;
  storeConfig: StoreConfig;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreProducts,
  onWholesale,
  onSelectCategory,
  storeConfig,
}) => {
  return (
    <section 
      id="hero" 
      className="bg-white border-b border-slate-200 py-10 sm:py-14 lg:py-16 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headings, Badges, CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Top Organic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cold-Pressed, Natural & Chemical-Free</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Cold-Pressed <span className="text-emerald-700">Virgin Oils</span>, Fresh <span className="text-amber-600">Spices</span> & <span className="text-amber-800">Chakki Atta</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Authentic slow cold-pressed virgin oils below 38°C, unadulterated whole ground spices, and traditional stone-ground whole wheat chakki atta delivered fresh with Cash on Delivery across Pakistan.
            </p>

            {/* 3 Categories Visual Cards Shortcuts */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-left">
              <button
                onClick={() => onSelectCategory?.("oils")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Droplet className="w-4 h-4 fill-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                  Cold Pressed Oils
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  Mustard, Olive, Coconut, Kalonji
                </p>
              </button>

              <button
                onClick={() => onSelectCategory?.("spices")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                  Spices (Masalajat)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  Turmeric, Red Chili, Coriander
                </p>
              </button>

              <button
                onClick={() => onSelectCategory?.("flour")}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Wheat className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                  Chakki Atta & Flour
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  Whole Wheat, Besan, Corn
                </p>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <button
                id="hero-explore-products-btn"
                onClick={onExploreProducts}
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onWholesale && (
                <button
                  id="hero-wholesale-btn"
                  onClick={onWholesale}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Wholesale & Bulk Orders</span>
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Chemicals</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Money Back Guarantee</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
              <img
                src={storeConfig.heroImage && storeConfig.heroImage.trim() !== "" ? storeConfig.heroImage : "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"}
                alt={storeConfig.brandName}
                className="w-full h-80 sm:h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent pointer-events-none" />

              {/* Floating Bottom Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Food-Grade Sealed Packaging
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Zero Leakage Courier Delivery Across Pakistan
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    COD Available
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
