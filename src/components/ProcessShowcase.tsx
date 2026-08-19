import React, { useState } from "react";
import { 
  Sprout, 
  Cpu, 
  Flame, 
  Clock, 
  ShieldCheck, 
  PackageCheck, 
  Droplet, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X,
  ThermometerSnowflake,
  HeartPulse
} from "lucide-react";
import { PROCESS_STEPS, COMPARISON_DATA } from "../data/processData";
import { ASSETS } from "../assets/images";

export const ProcessShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"steps" | "comparison">("steps");

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "Sprout": return <Sprout className="w-5 h-5" />;
      case "Cpu": return <Cpu className="w-5 h-5" />;
      case "Flame": return <Flame className="w-5 h-5" />;
      case "Clock": return <Clock className="w-5 h-5" />;
      case "ShieldCheck": return <ShieldCheck className="w-5 h-5" />;
      case "PackageCheck": return <PackageCheck className="w-5 h-5" />;
      default: return <Droplet className="w-5 h-5" />;
    }
  };

  return (
    <section 
      id="process" 
      className="py-16 sm:py-20 text-white border-b relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-header-bg, #291305)",
        borderColor: "var(--theme-border, #fde68a)",
      }}
    >
      
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/3 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: "var(--theme-accent, #f59e0b)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div 
            className="inline-flex items-center gap-1.5 border px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderColor: "var(--theme-accent, #f59e0b)",
              color: "var(--theme-accent, #f59e0b)"
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Precision Extraction Technology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white">
            The Science of Cold Press Extraction
          </h2>
          <p className="text-sm sm:text-base opacity-90 leading-relaxed text-white/90">
            Learn why low-temperature extraction using our food-grade <strong>304 Stainless Steel Automatic Cold Press Screw Extractor</strong> below 42°C yields oil that is healthier, 100% unadulterated, and rich in natural nutrients.
          </p>

          {/* Toggle Tab */}
          <div className="pt-4 flex justify-center">
            <div 
              className="p-1 rounded-xl border inline-flex shadow-inner"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                borderColor: "var(--theme-border, #fde68a)"
              }}
            >
              <button
                onClick={() => setActiveTab("steps")}
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === "steps" ? "var(--theme-primary, #b45309)" : "transparent",
                  color: "#ffffff"
                }}
              >
                6-Step Extraction Journey
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === "comparison" ? "var(--theme-primary, #b45309)" : "transparent",
                  color: "#ffffff"
                }}
              >
                Cold-Pressed vs Factory Refined
              </button>
            </div>
          </div>
        </div>

        {activeTab === "steps" ? (
          <div className="space-y-12">
            {/* Top Showcase: Live Machine Photo & Philosophy */}
            <div 
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border rounded-3xl p-6 sm:p-8 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderColor: "var(--theme-border, #fde68a)"
              }}
            >
              <div className="lg:col-span-6 space-y-4">
                <div 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--theme-accent, #f59e0b)" }}
                >
                  <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
                  <span>Low-Temperature Precision Extraction</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Why Our Cold Press Machine Excels
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Our commercial <strong>Automatic Cold Press Machine</strong> features a 100% food-grade 304 stainless steel screw extruder and temperature-controlled chamber. It extracts pure virgin oil at a strict low temperature below 42°C, preventing seed burn and thermal oxidation.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div 
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderColor: "rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <p className="font-bold text-white">&lt; 42°C Cold Extraction</p>
                    <p className="text-white/70 text-[11px] mt-0.5">Live enzymes & Vitamin E retained 100%</p>
                  </div>
                  <div 
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderColor: "rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <p className="text-emerald-400 font-bold">100% Food-Grade 304 Steel</p>
                    <p className="text-white/70 text-[11px] mt-0.5">Zero Hexane, Bleaching, or Chemical Solvents</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div 
                  className="rounded-2xl overflow-hidden border-2 shadow-2xl relative"
                  style={{ borderColor: "var(--theme-primary, #b45309)" }}
                >
                  <img
                    src={ASSETS.stainlessPressMachine || ASSETS.heroOilsDisplay}
                    alt="Food-grade stainless steel automatic cold press oil extraction machine at Al Raza Mart"
                    className="w-full h-64 sm:h-80 object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div 
                    className="absolute bottom-3 left-3 right-3 backdrop-blur-md p-2.5 rounded-xl border text-xs text-white flex items-center justify-between"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      borderColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <span className="font-bold text-white">Al Raza Mart Cold Press Machine Unit #1</span>
                    <span className="text-emerald-400 font-semibold">Live Pressing Daily</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-6 rounded-2xl space-y-4 transition-all hover:-translate-y-1 shadow-md flex flex-col justify-between border"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                      >
                        {getStepIcon(step.iconName)}
                      </div>
                      <span 
                        className="font-mono text-2xl font-bold opacity-60"
                        style={{ color: "var(--theme-accent, #f59e0b)" }}
                      >
                        {step.stepNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">
                        {step.title}
                      </h4>
                      <p 
                        className="text-xs font-medium mt-0.5"
                        style={{ color: "var(--theme-accent, #f59e0b)" }}
                      >
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div 
                    className="pt-3 border-t"
                    style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}
                  >
                    <span 
                      className="inline-block border text-[11px] font-semibold px-2.5 py-1 rounded-lg text-white"
                      style={{
                        backgroundColor: "var(--theme-primary, #b45309)",
                        borderColor: "var(--theme-accent, #f59e0b)"
                      }}
                    >
                      {step.keyMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Comparison Table */
          <div 
            className="border rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              borderColor: "var(--theme-border, #fde68a)"
            }}
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">
                The Stark Contrast: Pure Cold Press vs Commercial Refined
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                Most commercial refined oils use petroleum hexane solvents, 200°C+ thermal expellers, and harsh chemicals. Here is how Al Raza compares:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr 
                    className="border-b"
                    style={{
                      borderColor: "var(--theme-border, #fde68a)",
                      color: "var(--theme-accent, #f59e0b)"
                    }}
                  >
                    <th className="py-3.5 px-4 font-bold uppercase text-xs">Quality Parameter</th>
                    <th 
                      className="py-3.5 px-4 font-bold text-white rounded-t-xl"
                      style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Al Raza Pure Cold Press (&lt;42°C)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-white/80">
                      <div className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-rose-400" />
                        <span>Commercial Factory Refined Oil</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {row.feature}
                      </td>
                      <td 
                        className="py-4 px-4 font-medium text-white"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                      >
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{row.coldPress}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/70">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                          <span>{row.refinedOil}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Bar */}
            <div 
              className="border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderColor: "var(--theme-border, #fde68a)"
              }}
            >
              <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="text-white">
                  <strong>Health Takeaway:</strong> Switching from refined solvent oils to authentic cold-pressed oils reduces ingested trans fats and synthetic preservatives by 100%.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
