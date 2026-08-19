import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Clock, 
  Sparkles, 
  Droplet, 
  Utensils, 
  Heart, 
  ChevronRight, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { RECIPES } from "../data/recipes";
import { Recipe } from "../types";

export const RecipesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const categories = ["All", "Traditional Cooking", "Ayurvedic Remedy", "Immunity Drinks", "Beauty & Hair Care"];

  const filteredRecipes = selectedCategory === "All"
    ? RECIPES
    : RECIPES.filter((r) => r.category === selectedCategory);

  return (
    <section id="recipes" className="py-16 sm:py-20 bg-amber-50 text-amber-950 border-b border-amber-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
            <span>Culinary & Herbal Traditions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-amber-950">
            Traditional Recipes & Wellness Remedies
          </h2>
          <p className="text-sm sm:text-base text-amber-900/80">
            Discover authentic culinary techniques and ancient Ayurvedic remedies designed to maximize the bioavailability of unrefined cold-pressed oils.
          </p>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-900 text-amber-50 shadow-sm"
                    : "bg-amber-200/70 hover:bg-amber-300/80 text-amber-900 border border-amber-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recipes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-amber-400 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                    {recipe.category}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTime}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-amber-950 hover:text-amber-700 transition-colors">
                  {recipe.title}
                </h3>

                <p className="text-xs text-amber-900/80 leading-relaxed">
                  {recipe.description}
                </p>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/70 text-xs">
                  <p className="font-bold text-amber-900 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-amber-700" />
                    Key Oil Used:
                  </p>
                  <p className="text-amber-800 text-[11px] mt-0.5 font-medium">
                    {recipe.oilUsed}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {recipe.ingredients.length} Pure Ingredients
                </span>
                <button
                  onClick={() => setActiveRecipe(recipe)}
                  className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Recipe</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recipe Modal */}
        {activeRecipe && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-amber-50 text-amber-950 rounded-3xl shadow-2xl overflow-hidden border border-amber-900/30 max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="bg-amber-950 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-800">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-lg font-bold text-white">
                    {activeRecipe.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveRecipe(null)}
                  className="p-1 text-amber-300 hover:text-white hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
                
                <div className="bg-amber-100/80 p-4 rounded-2xl border border-amber-300/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    {activeRecipe.category} • Prep Time: {activeRecipe.prepTime}
                  </span>
                  <p className="text-sm font-medium text-amber-950">
                    {activeRecipe.description}
                  </p>
                  <p className="text-xs text-emerald-900 font-semibold pt-1">
                    ✨ Benefit: {activeRecipe.wellnessBenefit}
                  </p>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-amber-950">
                    Required Ingredients:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-amber-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="text-amber-950 font-medium">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step by Step Instructions */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-amber-950">
                    Preparation Instructions:
                  </h4>
                  <ol className="space-y-2 text-xs">
                    {activeRecipe.instructions.map((stepText, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-200">
                        <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-100 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-amber-900 leading-relaxed">{stepText}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
