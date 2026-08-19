import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Droplet, 
  Sparkles, 
  Search, 
  Filter, 
  Flame, 
  CheckCircle2, 
  Layers, 
  SlidersHorizontal,
  Heart,
  ShieldCheck
} from "lucide-react";
import { Product, CategoryType } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onQuickView: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickView,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedHealthFocus, setSelectedHealthFocus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popularity" | "price-low" | "price-high" | "rating">("popularity");

  const categories: { id: CategoryType; label: string; count: number }[] = [
    { id: "all", label: "All Pure Oils", count: products.length },
    { id: "cooking", label: "Everyday Cooking", count: products.filter(p => p.category === "cooking").length },
    { id: "wellness", label: "Super-Oils & Immunity", count: products.filter(p => p.category === "wellness").length },
    { id: "beauty", label: "Therapeutic & Beauty", count: products.filter(p => p.category === "beauty").length },
    { id: "bundles", label: "Family Combos (Save 20%)", count: products.filter(p => p.category === "bundles").length },
  ];

  const healthFocusFilters = [
    { id: "all", label: "All Health Goals" },
    { id: "heart", label: "Heart & Cardio Friendly" },
    { id: "immunity", label: "Super Immunity & Respiratory" },
    { id: "hair-skin", label: "Hair Density & Glowing Skin" },
    { id: "deep-frying", label: "High Smoke Point Frying" },
    { id: "baby", label: "Infant & Baby Safe" },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesNative = product.nativeName.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesBenefits = product.benefits.some(b => b.toLowerCase().includes(query));
        const matchesBatch = product.batchNo.toLowerCase().includes(query);
        if (!matchesName && !matchesNative && !matchesDesc && !matchesBenefits && !matchesBatch) {
          return false;
        }
      }

      // Health Focus filter
      if (selectedHealthFocus === "heart") {
        return product.benefits.some(b => b.toLowerCase().includes("heart") || b.toLowerCase().includes("cholesterol") || b.toLowerCase().includes("mufa"));
      }
      if (selectedHealthFocus === "immunity") {
        return product.benefits.some(b => b.toLowerCase().includes("immune") || b.toLowerCase().includes("thymoquinone") || b.toLowerCase().includes("lauric"));
      }
      if (selectedHealthFocus === "hair-skin") {
        return product.benefits.some(b => b.toLowerCase().includes("hair") || b.toLowerCase().includes("skin") || b.toLowerCase().includes("scalp"));
      }
      if (selectedHealthFocus === "deep-frying") {
        return product.smokePoint.includes("225°C") || product.smokePoint.includes("250°C") || product.smokePoint.includes("232°C");
      }
      if (selectedHealthFocus === "baby") {
        return product.id === "ar-almond" || product.id === "ar-coconut";
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") {
        return a.sizes[0].price - b.sizes[0].price;
      }
      if (sortBy === "price-high") {
        return b.sizes[0].price - a.sizes[0].price;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, selectedHealthFocus, sortBy]);

  return (
    <section 
      id="products" 
      className="py-16 sm:py-20 border-b transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-bg-main, #fffbeb)",
        color: "var(--theme-text, #451a03)",
        borderColor: "var(--theme-border, #fde68a)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--theme-primary, #b45309)",
              color: "#ffffff"
            }}
          >
            <Droplet className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Farm-Fresh Cold Extraction</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold"
            style={{ color: "var(--theme-text, #451a03)" }}
          >
            Our Cold-Pressed Oil Collection
          </h2>
          <p 
            className="text-sm sm:text-base opacity-90"
            style={{ color: "var(--theme-text-muted, #92400e)" }}
          >
            100% pure, single-origin oils extracted below 42°C in certified food-grade cold extraction machinery. Unrefined, chemical-free, and sealed for maximum freshness.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <div 
            className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl shadow-inner max-w-full border"
            style={{
              backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
              borderColor: "var(--theme-border, #fde68a)",
            }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: isActive ? "var(--theme-primary, #b45309)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--theme-text, #451a03)",
                  }}
                >
                  <span>{cat.label}</span>
                  <span 
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                    style={{
                      backgroundColor: isActive ? "var(--theme-primary-dark, #451a03)" : "var(--theme-border, #fde68a)",
                      color: isActive ? "#ffffff" : "var(--theme-text, #451a03)",
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Filter and Search Bar Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: "var(--theme-bg-card, #ffffff)",
            borderColor: "var(--theme-border, #fde68a)",
          }}
        >
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search 
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" 
              style={{ color: "var(--theme-primary, #b45309)" }}
            />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search by oil, seed, or health benefit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl focus:outline-none border"
              style={{
                backgroundColor: "var(--theme-bg-main, #fffbeb)",
                borderColor: "var(--theme-border, #fde68a)",
                color: "var(--theme-text, #451a03)",
              }}
            />
          </div>

          {/* Health Focus Chips & Sort Dropdown */}
          <div className="flex flex-wrap items-center justify-between md:justify-end w-full md:w-auto gap-3">
            
            {/* Health Focus Dropdown / Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span 
                className="font-bold hidden sm:inline flex items-center gap-1"
                style={{ color: "var(--theme-text, #451a03)" }}
              >
                <Heart className="w-3.5 h-3.5" style={{ color: "var(--theme-primary, #b45309)" }} /> Focus:
              </span>
              <select
                id="health-focus-select"
                value={selectedHealthFocus}
                onChange={(e) => setSelectedHealthFocus(e.target.value)}
                className="border font-medium rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-bg-main, #fffbeb)",
                  borderColor: "var(--theme-border, #fde68a)",
                  color: "var(--theme-text, #451a03)",
                }}
              >
                {healthFocusFilters.map((hf) => (
                  <option key={hf.id} value={hf.id}>
                    {hf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs">
              <span 
                className="font-bold hidden sm:inline flex items-center gap-1"
                style={{ color: "var(--theme-text, #451a03)" }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--theme-primary, #b45309)" }} /> Sort:
              </span>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border font-medium rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: "var(--theme-bg-main, #fffbeb)",
                  borderColor: "var(--theme-border, #fde68a)",
                  color: "var(--theme-text, #451a03)",
                }}
              >
                <option value="popularity">Popularity / Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

          </div>

        </motion.div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (idx % 4) * 0.08 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div 
            className="text-center py-16 rounded-2xl border p-8 space-y-4"
            style={{
              backgroundColor: "var(--theme-bg-card, #ffffff)",
              borderColor: "var(--theme-border, #fde68a)",
            }}
          >
            <Droplet className="w-12 h-12 mx-auto" style={{ color: "var(--theme-primary, #b45309)" }} />
            <h3 className="font-serif text-xl font-bold" style={{ color: "var(--theme-text, #451a03)" }}>
              No matching oils found
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--theme-text-muted, #92400e)" }}>
              We couldn't find any cold-pressed oils matching "{searchQuery}". Try searching for groundnut, coconut, sesame, kalonji, or reset your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedHealthFocus("all");
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
