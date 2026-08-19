import React, { useState } from "react";
import { 
  HelpCircle, 
  X, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Droplet, 
  Sparkles, 
  ShoppingBag, 
  Flame, 
  Heart, 
  ShieldCheck 
} from "lucide-react";
import { Product } from "../types";
import { ASSETS } from "../assets/images";

interface OilFinderQuizProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const OilFinderQuiz: React.FC<OilFinderQuizProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onSelectProduct,
}) => {
  const [step, setStep] = useState(1);
  const [selectedPurpose, setSelectedPurpose] = useState<string>("cooking");
  const [selectedCookingStyle, setSelectedCookingStyle] = useState<string>("high-heat");
  const [selectedTaste, setSelectedTaste] = useState<string>("nutty");
  const [result, setResult] = useState<{ primary: Product; secondary?: Product; reason: string } | null>(null);

  const calculateResult = () => {
    let primaryId = "ar-groundnut";
    let secondaryId = "ar-coconut";
    let reason = "Ideal for everyday high-heat cooking with balanced healthy fats.";

    if (selectedPurpose === "immunity") {
      primaryId = "ar-kalonji";
      secondaryId = "ar-coconut";
      reason = "100% pure Nigella Sativa with 1.8%+ Thymoquinone for unmatched immune defense and respiratory health.";
    } else if (selectedPurpose === "hair-skin") {
      primaryId = "ar-almond";
      secondaryId = "ar-castor";
      reason = "Rich natural Vitamin E and Ricinoleic acid penetrate deep to nourish hair roots and enhance skin luminosity.";
    } else if (selectedPurpose === "heart") {
      if (selectedCookingStyle === "raw") {
        primaryId = "ar-flaxseed";
        secondaryId = "ar-groundnut";
        reason = "Over 55% plant-based Omega-3 ALA for arterial flexibility and cardiovascular wellness.";
      } else {
        primaryId = "ar-safflower";
        secondaryId = "ar-groundnut";
        reason = "High Oleic MUFA profile that absorbs 20% less oil during cooking with zero cholesterol.";
      }
    } else if (selectedTaste === "pungent") {
      primaryId = "ar-mustard";
      secondaryId = "ar-groundnut";
      reason = "High smoke point (250°C) with authentic natural pungency, ideal for North Indian curries and winter warmth.";
    } else if (selectedTaste === "traditional-sesame" || selectedCookingStyle === "south-indian") {
      primaryId = "ar-sesame";
      secondaryId = "ar-groundnut";
      reason = "Extracted with organic palm jaggery for that authentic South Indian dosa, tadka, and pickle magic.";
    }

    const primaryProd = products.find((p) => p.id === primaryId) || products[0];
    const secondaryProd = products.find((p) => p.id === secondaryId);

    setResult({
      primary: primaryProd,
      secondary: secondaryProd,
      reason,
    });
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedPurpose("cooking");
    setSelectedCookingStyle("high-heat");
    setSelectedTaste("nutty");
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-amber-50 text-amber-950 rounded-3xl shadow-2xl overflow-hidden border border-amber-900/30 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-amber-950 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700/80 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Find Your Perfect Cold-Pressed Oil Match
              </h2>
              <p className="text-xs text-amber-300">
                Answer 3 simple questions to discover your ideal pure oil ritual
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

        {/* Progress Bar */}
        <div className="w-full bg-amber-200 h-1.5">
          <div
            className="bg-amber-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-700">Question 1 of 3</span>
                <span className="text-xs text-amber-800">Primary Goal</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-950">
                What is your primary purpose for using cold-pressed oil?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: "cooking", title: "Daily Family Cooking", desc: "For everyday curries, dal tadka, and deep frying." },
                  { id: "heart", title: "Heart & Cardio Health", desc: "Lower cholesterol, clean fats, and arterial wellness." },
                  { id: "immunity", title: "Immunity & Respiratory", desc: "Superfood spoon dosage for seasonal defense." },
                  { id: "hair-skin", title: "Hair Density & Skin Care", desc: "Topical massage, baby care, and natural glow." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPurpose(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPurpose === item.id
                        ? "border-amber-700 bg-amber-900 text-white shadow-md font-semibold"
                        : "border-amber-200 bg-white hover:bg-amber-100/70 text-amber-950"
                    }`}
                  >
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className={`text-xs mt-1 ${selectedPurpose === item.id ? "text-amber-200" : "text-amber-800"}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-700">Question 2 of 3</span>
                <span className="text-xs text-amber-800">Usage Habits</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-950">
                How do you plan to use the oil most frequently?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: "high-heat", title: "High-Heat Frying & Sautéing", desc: "Needs high smoke point to prevent thermal breakdown." },
                  { id: "south-indian", title: "South Indian Dosa, Idli Podi & Tadka", desc: "Authentic sesame gingelly and coconut flavor." },
                  { id: "raw", title: "Raw Spoonfuls, Smoothies & Salads", desc: "Maximum unheated nutrient and Omega-3 absorption." },
                  { id: "massage", title: "Scalp & Body Abhyanga Massage", desc: "Deep tissue hydration and root strengthening." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCookingStyle(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedCookingStyle === item.id
                        ? "border-amber-700 bg-amber-900 text-white shadow-md font-semibold"
                        : "border-amber-200 bg-white hover:bg-amber-100/70 text-amber-950"
                    }`}
                  >
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className={`text-xs mt-1 ${selectedCookingStyle === item.id ? "text-amber-200" : "text-amber-800"}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-amber-800 hover:text-amber-950 text-xs font-bold cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-700">Question 3 of 3</span>
                <span className="text-xs text-amber-800">Flavor Profile</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-950">
                What aroma and taste profile does your family prefer?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: "nutty", title: "Warm & Roasted Nutty", desc: "Authentic roasted peanut sweetness (Groundnut Oil)." },
                  { id: "traditional-sesame", title: "Earthy & Toasted with Jaggery", desc: "Rich fragrant South Indian gingelly aroma." },
                  { id: "pungent", title: "Sharp & Pungent Kick", desc: "Authentic eye-clearing Rajasthani mustard pungency." },
                  { id: "mild", title: "Ultra-Light & Neutral", desc: "Feather-light with no strong flavor override." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTaste(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTaste === item.id
                        ? "border-amber-700 bg-amber-900 text-white shadow-md font-semibold"
                        : "border-amber-200 bg-white hover:bg-amber-100/70 text-amber-950"
                    }`}
                  >
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className={`text-xs mt-1 ${selectedTaste === item.id ? "text-amber-200" : "text-amber-800"}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-amber-800 hover:text-amber-950 text-xs font-bold cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  onClick={calculateResult}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reveal My Match</span>
                </button>
              </div>
            </div>
          )}

          {step === 4 && result && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Your Tailored Oil Recommendation
                </span>
                <h3 className="font-serif text-2xl font-bold text-amber-950">
                  {result.primary.name}
                </h3>
                <p className="text-xs text-amber-800 max-w-lg mx-auto">
                  {result.reason}
                </p>
              </div>

              {/* Primary Match Card */}
              <div className="bg-white rounded-2xl border-2 border-amber-600/50 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={result.primary.heroImage && result.primary.heroImage.trim() !== "" ? result.primary.heroImage : ASSETS.olivePlasticBottle}
                  alt={result.primary.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover border border-amber-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700">Top Match (100% Wood-Pressed)</span>
                    <h4 className="font-serif text-lg font-bold text-amber-950">
                      {result.primary.name}
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900/80 line-clamp-2">
                    {result.primary.shortDescription}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="text-lg font-serif font-bold text-amber-950">
                      ₹{result.primary.sizes[0].price}
                    </span>
                    <span className="text-xs text-amber-600 line-through">
                      ₹{result.primary.sizes[0].originalPrice}
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                      {result.primary.sizes[0].size}
                    </span>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={() => {
                        onAddToCart(result.primary, 0, 1);
                        onClose();
                      }}
                      className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Match to Cart</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(result.primary);
                      }}
                      className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl border border-amber-300 transition-colors cursor-pointer"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Match booster */}
              {result.secondary && (
                <div className="bg-amber-100/60 rounded-xl p-3.5 border border-amber-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-amber-700" />
                      Recommended Booster Companion:
                    </span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Pair with {result.secondary.name} for complete daily nutritional rotation.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (result.secondary) onSelectProduct(result.secondary);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold shrink-0 cursor-pointer"
                  >
                    View
                  </button>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleReset}
                  className="text-xs text-amber-700 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
