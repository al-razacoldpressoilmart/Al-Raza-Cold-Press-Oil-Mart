import React, { useState } from "react";
import { 
  Droplet, 
  Sparkles, 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  MessageCircle, 
  Truck, 
  Flame, 
  Wheat, 
  Building2,
  Gift
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrderTracking?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  storeConfig: StoreConfig;
  onSelectCategory?: (category: "all" | "oils" | "spices" | "flour") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenOrderTracking,
  searchQuery,
  setSearchQuery,
  activeSection,
  scrollToSection,
  storeConfig,
  onSelectCategory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCategoryClick = (cat: "all" | "oils" | "spices" | "flour") => {
    setIsMobileMenuOpen(false);
    onSelectCategory?.(cat);
    scrollToSection("products");
  };

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors duration-200">
      {/* Top Notification Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs px-4 py-1.5 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1 bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Cold-Pressed & Chemical-Free
            </span>
            <span>Free Home Delivery Across Pakistan on orders above Rs. 2,500!</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            {onOpenOrderTracking && (
              <button
                id="top-track-order-btn"
                onClick={onOpenOrderTracking}
                className="inline-flex items-center gap-1 text-emerald-100 hover:text-white font-medium transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Track Order</span>
              </button>
            )}

            <a
              id="top-whatsapp-link"
              href={`https://wa.me/${(storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello! I would like to inquire about Al Raza cold pressed oils, spices, and chakki atta.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-200 hover:text-white font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: {storeConfig.contactPhone1}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick("hero")}
          >
            {storeConfig.logoUrl && storeConfig.logoUrl.trim() !== "" ? (
              <img
                src={storeConfig.logoUrl}
                alt={storeConfig.brandName}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
                <Droplet className="w-6 h-6 fill-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {storeConfig.brandName}
                </span>
                <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                  Organic Pantry
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                {storeConfig.brandTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
            {/* Oils Section */}
            <button
              id="nav-section-oils"
              onClick={() => handleCategoryClick("oils")}
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Droplet className="w-4 h-4 text-emerald-600 fill-emerald-600/30" />
              <span>Cold Pressed Oils</span>
            </button>

            {/* Spices Section */}
            <button
              id="nav-section-spices"
              onClick={() => handleCategoryClick("spices")}
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Spices (Masalajat)</span>
            </button>

            {/* Flour / Atta Section */}
            <button
              id="nav-section-flour"
              onClick={() => handleCategoryClick("flour")}
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wheat className="w-4 h-4 text-amber-700" />
              <span>Chakki Atta & Flour</span>
            </button>

            {/* Wholesale & Bulk Quantity Form Link */}
            <button
              id="nav-wholesale-btn"
              onClick={() => handleNavClick("wholesale-bulk")}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Wholesale & Bulk</span>
            </button>

            {/* Affiliate Program Link */}
            <button
              id="nav-affiliate-btn"
              onClick={() => handleNavClick("affiliate-program")}
              className="px-3.5 py-2 rounded-xl text-emerald-800 hover:bg-emerald-50 border border-emerald-200 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Affiliate (Earn 10%)</span>
            </button>
          </nav>

          {/* Right Action Controls: Search & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white shadow-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="navbar-search-input"
                    type="text"
                    placeholder="Search oils, spices, atta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none ml-2"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="navbar-search-toggle"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="navbar-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          <div className="p-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            Explore Categories
          </div>

          <button
            onClick={() => handleCategoryClick("oils")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            <Droplet className="w-4 h-4 text-emerald-600" />
            <span>Cold Pressed Oils</span>
          </button>

          <button
            onClick={() => handleCategoryClick("spices")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Spices & Masalajat</span>
          </button>

          <button
            onClick={() => handleCategoryClick("flour")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-800 transition-colors"
          >
            <Wheat className="w-4 h-4 text-amber-700" />
            <span>Chakki Atta & Flour</span>
          </button>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNavClick("wholesale-bulk")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-sm font-bold text-amber-950 transition-colors"
            >
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Wholesale & Bulk Quantity Supply</span>
            </button>

            <button
              onClick={() => handleNavClick("affiliate-program")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-sm font-bold text-emerald-900 transition-colors"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Affiliate Program (Earn 10%)</span>
            </button>

            {onOpenOrderTracking && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenOrderTracking();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Track Your Order</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
