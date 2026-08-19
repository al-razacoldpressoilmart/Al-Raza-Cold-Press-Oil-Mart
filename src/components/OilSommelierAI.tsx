import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Droplet, 
  CheckCircle2, 
  Bot, 
  User, 
  HelpCircle, 
  Flame, 
  Heart, 
  ShieldCheck, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { Product } from "../types";

interface OilSommelierAIProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const OilSommelierAI: React.FC<OilSommelierAIProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState("");
  const [healthGoal, setHealthGoal] = useState("Daily Vitality & Heart Health");
  const [cookingStyle, setCookingStyle] = useState("Everyday Curries & Tadka");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const quickQuestions = [
    "Which cold pressed oil has the highest smoke point for deep frying?",
    "How should I take Kalonji (Black Seed) oil for morning immunity?",
    "What oil blend is best for dry scalp, hair loss, and dandruff?",
    "Is cold pressed coconut oil good for daily cooking and digestion?",
    "How does Mara Chekku wood press compare to chemical refined oil?",
  ];

  const handleAskAdvisor = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend && !healthGoal && !concern) return;

    setLoading(true);
    setAdvice(null);

    try {
      const response = await fetch("/api/gemini/oil-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: promptToSend,
          healthGoal,
          cookingStyle,
          concern,
        }),
      });

      const data = await response.json();
      if (data.advice) {
        setAdvice(data.advice);
      } else {
        setAdvice(
          "We recommend Al Raza Wood Pressed Groundnut Oil for daily cooking (high smoke point 225°C), Extra Virgin Coconut Oil for morning immunity and hair care, and Wood Pressed Sesame Oil for rich traditional tadkas and dosas."
        );
      }
    } catch (error) {
      console.error("Oil Advisor Error:", error);
      setAdvice(
        "Al Raza Cold Press Oil Mart Master recommends:\n\n- **Everyday High-Heat Cooking**: Wood Pressed Groundnut (Peanut) Oil.\n- **Morning Immunity & Respiratory Health**: Cold Pressed Black Seed (Kalonji) Oil (1/2 tsp daily with honey).\n- **Skin & Hair Nourishment**: 100% Pure Sweet Almond (Badam Roghan) & Extra Virgin Coconut Oil.\n- **Traditional Tadka & Bone Strength**: Wood Pressed Gingelly (Sesame) Oil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-amber-950 text-amber-50 rounded-3xl shadow-2xl overflow-hidden border border-amber-700/60 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-4 flex items-center justify-between border-b border-amber-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700/80 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Al Raza AI Oil Sommelier & Wellness Guide
              </h2>
              <p className="text-xs text-amber-300">
                Personalized cold-pressed oil matching & Ayurvedic wellness guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-300 hover:text-white hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Quick Prompts Carousel / Pills */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Frequently Asked Master Craftsman Questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleAskAdvisor(q);
                  }}
                  className="bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 text-xs px-3 py-1.5 rounded-xl text-left transition-all hover:border-amber-500 cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Consultation Form */}
          <div className="bg-amber-900/40 border border-amber-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="font-serif font-bold text-amber-100 text-sm flex items-center gap-2">
              <Droplet className="w-4 h-4 text-amber-400" />
              Customize Your Oil Consultation:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Primary Health Goal:
                </label>
                <select
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value)}
                  className="w-full bg-amber-950 border border-amber-700 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Daily Vitality & Heart Health">Daily Vitality & Heart Health</option>
                  <option value="Super Immunity & Respiratory Support">Super Immunity & Respiratory Support</option>
                  <option value="Hair Density, Scalp Care & Glowing Skin">Hair Density, Scalp Care & Glowing Skin</option>
                  <option value="Weight Management & Clean Digestion">Weight Management & Clean Digestion</option>
                  <option value="Traditional South Indian Culinary Authentic Flavor">Traditional South Indian Flavor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Cooking / Usage Habit:
                </label>
                <select
                  value={cookingStyle}
                  onChange={(e) => setCookingStyle(e.target.value)}
                  className="w-full bg-amber-950 border border-amber-700 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Everyday Curries, Sautéing & Tadka">Everyday Curries, Sautéing & Tadka</option>
                  <option value="High-Heat Deep Frying & Crispy Cooking">High-Heat Deep Frying & Crispy Cooking</option>
                  <option value="Raw Spoonfuls, Smoothies & Salad Dressing">Raw Spoonfuls, Smoothies & Salad Dressing</option>
                  <option value="Topical Scalp & Skin Application">Topical Scalp & Skin Application</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                Your Specific Question or Health Concern (Optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Can I use sesame oil for morning oil pulling? Which oil for low cholesterol?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskAdvisor();
                  }}
                  className="w-full bg-amber-950 border border-amber-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-amber-500"
                />
                <button
                  id="submit-ai-advisor-btn"
                  onClick={() => handleAskAdvisor()}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Ask</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Output Card */}
          {advice && (
            <div className="bg-amber-900/60 border border-amber-600/60 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-amber-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Al Raza Master Sommelier Recommendation:</span>
                </div>
                <button
                  onClick={() => handleAskAdvisor()}
                  className="text-[11px] text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>

              {/* Formatted Markdown Content */}
              <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm leading-relaxed text-amber-100 space-y-3 whitespace-pre-line">
                {advice}
              </div>

              {/* Matching Products Quick Links */}
              <div className="pt-3 border-t border-amber-800/80">
                <p className="text-xs font-bold text-amber-300 mb-2">
                  Featured Al Raza Mart Recommendations:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {products.slice(0, 4).map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        onClose();
                        onSelectProduct(prod);
                      }}
                      className="p-2.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Droplet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs font-semibold text-amber-100 truncate">{prod.name}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-300 shrink-0">Rs. {prod.sizes[0].price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
