import React from "react";
import { 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Layers,
  ThermometerSnowflake,
  PackageCheck
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";
import { ASSETS } from "../assets/images";

interface HeroBannerProps {
  onExploreProducts: () => void;
  onOpenProcess: () => void;
  storeConfig: StoreConfig;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreProducts,
  onOpenProcess,
  storeConfig,
}) => {
  return (
    <section 
      id="hero" 
      className="relative text-white overflow-hidden border-b transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-header-bg, #291305)",
        borderColor: "var(--theme-border, #fde68a)",
      }}
    >
      {/* Decorative background glows */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--theme-accent, #f59e0b)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Announcement Pill */}
            <div 
              className="inline-flex items-center gap-2 border px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderColor: "var(--theme-accent, #f59e0b)",
                color: "var(--theme-accent, #f59e0b)"
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{storeConfig.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              {storeConfig.heroTitle} <br />
              <span style={{ color: "var(--theme-accent, #f59e0b)" }}>
                {storeConfig.heroHighlight}
              </span> <br />
              For True Health & Purity
            </h1>

            {/* Subtitle & Value Proposition */}
            <p className="text-base sm:text-lg text-white/90 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {storeConfig.heroSubtitle}
            </p>

            {/* Quality Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-white/90">
              <div 
                className="flex items-center gap-2 border px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.25)",
                  borderColor: "rgba(255, 255, 255, 0.15)"
                }}
              >
                <ThermometerSnowflake className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>&lt; 42°C Cold Press</span>
              </div>
              <div 
                className="flex items-center gap-2 border px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.25)",
                  borderColor: "rgba(255, 255, 255, 0.15)"
                }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Chemical Hexane</span>
              </div>
              <div 
                className="flex items-center gap-2 border px-3 py-2 rounded-lg col-span-2 sm:col-span-1"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.25)",
                  borderColor: "rgba(255, 255, 255, 0.15)"
                }}
              >
                <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Food-Grade Safe</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                id="hero-explore-products-btn"
                onClick={onExploreProducts}
                className="px-6 py-3.5 font-bold text-sm sm:text-base rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer text-white"
                style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
              >
                <span>Shop Pure Oils</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-process-btn"
                onClick={onOpenProcess}
                className="px-5 py-3.5 border text-white font-semibold text-sm sm:text-base rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <Layers className="w-4 h-4" style={{ color: "var(--theme-accent, #f59e0b)" }} />
                <span>Cold Press Process</span>
              </button>
            </div>

            {/* Live Pressing Alert */}
            <div className="pt-2">
              <div 
                onClick={onOpenProcess}
                className="inline-flex items-center gap-2.5 border px-4 py-2 rounded-xl text-xs cursor-pointer transition-all text-white"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span><strong>Live Mart Press:</strong> {storeConfig.liveExtractionSchedule}</span>
                <span className="font-semibold underline hidden sm:inline" style={{ color: "var(--theme-accent, #f59e0b)" }}>Learn Process &rarr;</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase & Craft Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Frame */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl border-2 group"
                style={{
                  borderColor: "var(--theme-primary, #b45309)",
                  backgroundColor: "var(--theme-header-bg, #291305)"
                }}
              >
                <img
                  src={storeConfig.heroImage && storeConfig.heroImage.trim() !== "" ? storeConfig.heroImage : ASSETS.heroOilsDisplay}
                  alt="Al Raza Cold Press Oil Mart"
                  className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom Float Card */}
                <div 
                  className="absolute bottom-4 left-4 right-4 backdrop-blur-md border p-3.5 rounded-xl shadow-lg"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                      >
                        <Droplet className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white">100% Food Grade 304 Steel</p>
                        <p className="text-[11px] text-white/80">304 Stainless Steel Expeller (&lt;42°C)</p>
                      </div>
                    </div>
                    <span className="bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 font-bold px-2 py-1 rounded text-[11px]">
                      Pure & Fresh
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Temperature guarantee */}
              <div 
                className="absolute -top-4 -left-4 sm:-left-6 border p-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs text-white"
                style={{
                  backgroundColor: "var(--theme-header-bg, #291305)",
                  borderColor: "var(--theme-primary, #b45309)"
                }}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">&lt; 42°C Cold Press</p>
                  <p className="text-[10px]" style={{ color: "var(--theme-accent, #f59e0b)" }}>Live Enzymes Preserved</p>
                </div>
              </div>

              {/* Floating Badge 2: Bottle Packaging */}
              <div 
                className="absolute -bottom-4 -right-4 sm:-right-6 border p-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs text-white"
                style={{
                  backgroundColor: "var(--theme-header-bg, #291305)",
                  borderColor: "var(--theme-primary, #b45309)"
                }}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Hygienic Sealed Bottling</p>
                  <p className="text-[10px]" style={{ color: "var(--theme-accent, #f59e0b)" }}>Fresh Daily Live Pressing</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
