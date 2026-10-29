import React, { useState, useMemo } from "react";
import { 
  Droplet, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  Flame, 
  Wheat,
  Layers,
  ShieldCheck
} from "lucide-react";
import { Product, CategoryType } from "../types";
import { ProductCard } from "./ProductCard";
import { Language, TRANSLATIONS } from "../utils/translations";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onQuickView: (product: Product) => void;
  onBuyNow?: (product: Product, sizeIndex: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language?: Language;
  selectedCategory?: "all" | "oils" | "spices" | "flour" | "beauty";
  setSelectedCategory?: (cat: "all" | "oils" | "spices" | "flour" | "beauty") => void;
  isLoading?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickView,
  onBuyNow,
  searchQuery,
  setSearchQuery,
  language = "ur",
  selectedCategory: controlledCategory,
  setSelectedCategory: setControlledCategory,
  isLoading = false,
}) => {
  const [localCategory, setLocalCategory] = useState<"all" | "oils" | "spices" | "flour" | "beauty">("all");
  const [sortBy, setSortBy] = useState<"popularity" | "price-low" | "price-high" | "rating">("popularity");

  const selectedCategory = controlledCategory !== undefined ? controlledCategory : localCategory;
  const setSelectedCategory = setControlledCategory || setLocalCategory;

  const t = TRANSLATIONS[language];
  const isUrdu = language === "ur";

  const categories = [
    { 
      id: "all" as const, 
      label: t.catAll, 
      desc: t.catAllDesc,
      icon: <Layers className="w-4 h-4" />,
      count: products.length 
    },
    { 
      id: "oils" as const, 
      label: t.catOils, 
      desc: t.catOilsDesc,
      icon: <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-600/30" />,
      count: products.filter(p => p.category === "oils" || p.category === "cooking" || p.category === "wellness").length 
    },
    { 
      id: "spices" as const, 
      label: t.catSpices, 
      desc: t.catSpicesDesc,
      icon: <Flame className="w-4 h-4 text-amber-600" />,
      count: products.filter(p => p.category === "spices").length 
    },
    { 
      id: "flour" as const, 
      label: t.catFlour, 
      desc: t.catFlourDesc,
      icon: <Wheat className="w-4 h-4 text-amber-700" />,
      count: products.filter(p => p.category === "flour").length 
    },
    { 
      id: "beauty" as const, 
      label: t.catBeauty || "Hair Oils & Beauty", 
      desc: t.catBeautyDesc || "Hair Growth, Castor, Badam Roghan & Scalp Tonics",
      icon: <Sparkles className="w-4 h-4 text-rose-500" />,
      count: products.filter(p => p.category === "beauty").length 
    },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      if (selectedCategory !== "all") {
        if (selectedCategory === "oils") {
          const isOil = product.category === "oils" || product.category === "cooking" || product.category === "wellness";
          if (!isOil) return false;
        } else if (selectedCategory === "beauty") {
          if (product.category !== "beauty") return false;
        } else if (product.category !== selectedCategory) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesNative = product.nativeName.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesShort = product.shortDescription.toLowerCase().includes(query);
        const matchesBatch = product.batchNo.toLowerCase().includes(query);
        if (!matchesName && !matchesNative && !matchesDesc && !matchesShort && !matchesBatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aPrice = (Array.isArray(a?.sizes) && a.sizes[0]?.price) ? a.sizes[0].price : 0;
      const bPrice = (Array.isArray(b?.sizes) && b.sizes[0]?.price) ? b.sizes[0].price : 0;
      if (sortBy === "price-low") {
        return aPrice - bPrice;
      }
      if (sortBy === "price-high") {
        return bPrice - aPrice;
      }
      if (sortBy === "rating") {
        return (b?.rating || 0) - (a?.rating || 0);
      }
      return (b?.featured ? 1 : 0) - (a?.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section 
      id="products" 
      className="py-12 sm:py-16 bg-white border-b border-slate-200 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Organic Artisanal Pantry</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pantry & Kitchen Essentials Collection
          </h2>

          <p className="text-xs sm:text-sm text-slate-600">
            Cold-pressed virgin oils, traditional stone-ground whole wheat flour, and unadulterated whole & ground spices.
          </p>
        </div>

        {/* The 3 Core Section Tabs (Oils, Spices, Flour, All) */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs max-w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span 
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? "bg-emerald-900 text-emerald-100" 
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Active Category Description Tag */}
          <div className="text-xs text-slate-500 font-medium">
            <span>{categories.find(c => c.id === selectedCategory)?.desc}</span>
          </div>

          {/* Sort Selector & Search Query Active */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {searchQuery && (
              <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <span>{isUrdu ? "تلاش:" : "Search:"} <strong>"{searchQuery}"</strong></span>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="popularity">{isUrdu ? "سب سے زیادہ مقبول" : "Most Popular"}</option>
                <option value="price-low">{isUrdu ? "قیمت: کم سے زیادہ" : "Price: Low to High"}</option>
                <option value="price-high">{isUrdu ? "قیمت: زیادہ سے کم" : "Price: High to Low"}</option>
                <option value="rating">{isUrdu ? "اعلیٰ ریٹنگ" : "Highest Rating"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-52 sm:h-56 bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 bg-slate-200 rounded w-1/4" />
                    <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product?.id ? `${product.id}-${idx}` : `product-item-${idx}`}
                product={product}
                cardIndex={idx}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onBuyNow={onBuyNow}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-700 font-bold text-base">
              {isUrdu ? "اس زمرے میں کوئی چیز نہیں ملی" : "No products found matching your search"}
            </p>
            <p className="text-xs text-slate-500">
              {isUrdu ? "براہ کرم سرچ تبدیل کریں یا تمام اشیاء دیکھیں" : "Try searching with different keywords or switch category."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              {isUrdu ? "تمام اشیاء دکھائیں" : "View All Products"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
