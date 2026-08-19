import React, { useState } from "react";
import { 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag, 
  Phone, 
  Search, 
  Menu, 
  X, 
  MessageCircle, 
  HelpCircle, 
  Award,
  BookOpen,
  MapPin,
  User as UserIcon,
  LogOut,
  Truck
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";
import { User } from "firebase/auth";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAffiliate?: () => void;
  onOpenOrderTracking?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  storeConfig: StoreConfig;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAffiliate,
  onOpenOrderTracking,
  searchQuery,
  setSearchQuery,
  activeSection,
  scrollToSection,
  storeConfig,
  user,
  onSignIn,
  onSignOut,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const affRate = storeConfig.affiliateCommissionRate ?? 10;
  const freeThreshold = storeConfig.freeDeliveryThreshold ?? 2500;
  const hasFreeShip = storeConfig.enableFreeDeliveryAboveThreshold ?? true;

  const navLinks = [
    { id: "products", label: "Pure Oils Catalog" },
    { id: "process", label: "Cold Press Extraction" },
    { id: "recipes", label: "Traditional Recipes" },
    { id: "mart-visit", label: "Visit Mart & Location" },
    ...(onOpenOrderTracking ? [{ id: "tracking", label: "Track Order", action: onOpenOrderTracking }] : []),
    ...(onOpenAffiliate ? [{ id: "affiliate", label: `Affiliate & Earn ${affRate}%`, action: onOpenAffiliate }] : []),
  ];

  const handleNavClick = (link: { id: string; label: string; action?: () => void }) => {
    setIsMobileMenuOpen(false);
    if (link.action) {
      link.action();
    } else {
      scrollToSection(link.id);
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 text-white backdrop-blur-md border-b shadow-lg transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-header-bg, #291305)",
        borderColor: "var(--theme-border, #fde68a)",
      }}
    >
      {/* Top Announcement Bar */}
      <div 
        className="text-xs px-4 py-1.5 border-b"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.9)"
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
              style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
            >
              <Sparkles className="w-3 h-3 text-amber-200" />
              Cold Press Master Precision
            </span>
            <span>100% Cold-Pressed in Food-Grade 304 Stainless Steel (&lt;42°C) • Zero Chemical Solvents</span>
            <span className="hidden sm:inline font-bold" style={{ color: "var(--theme-accent, #f59e0b)" }}>
              • {hasFreeShip ? `Free Shipping over Rs. ${freeThreshold}` : `Standard Delivery Rs. ${storeConfig.deliveryFee ?? 150}`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {onOpenOrderTracking && (
              <button
                id="top-track-order-btn"
                onClick={onOpenOrderTracking}
                className="inline-flex items-center gap-1 text-amber-200 hover:text-white font-semibold transition-colors cursor-pointer"
                title="Track Live Order Status"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Order</span>
              </button>
            )}
            {onOpenAffiliate && (
              <button
                id="top-affiliate-program-btn"
                onClick={onOpenAffiliate}
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Earn {affRate}% (Affiliate)</span>
              </button>
            )}
            <a
              id="top-whatsapp-link"
              href={`https://wa.me/${storeConfig.whatsappNumber}?text=Hello%20Al%20Raza%20Oil%20Mart,%20I%20would%20like%20to%20inquire%20about%20pure%20cold-pressed%20oils.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support ({storeConfig.contactPhone1})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => scrollToSection("hero")}
          >
            {storeConfig.logoUrl && storeConfig.logoUrl.trim() !== "" ? (
              <img
                src={storeConfig.logoUrl}
                alt={storeConfig.brandName}
                className="w-12 h-12 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-white/20 group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
              >
                <div className="relative">
                  <Droplet className="w-7 h-7 text-white fill-white" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-wider text-white group-hover:opacity-90 transition-opacity">
                  {storeConfig.brandName}
                </span>
                {storeConfig.brandBadge && (
                  <span 
                    className="border text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded text-white"
                    style={{ 
                      backgroundColor: "var(--theme-primary, #b45309)",
                      borderColor: "var(--theme-accent, #f59e0b)"
                    }}
                  >
                    {storeConfig.brandBadge}
                  </span>
                )}
              </div>
              <p 
                className="text-[11px] uppercase tracking-widest font-medium"
                style={{ color: "var(--theme-accent, #f59e0b)" }}
              >
                {storeConfig.brandTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-products-btn"
              onClick={() => scrollToSection("products")}
              className="px-3.5 py-2 rounded-lg transition-all cursor-pointer font-medium"
              style={{
                backgroundColor: activeSection === "products" ? "var(--theme-primary, #b45309)" : "transparent",
                color: "#ffffff"
              }}
            >
              Pure Oils
            </button>
            <button
              id="nav-process-btn"
              onClick={() => scrollToSection("process")}
              className="px-3.5 py-2 rounded-lg transition-all cursor-pointer font-medium"
              style={{
                backgroundColor: activeSection === "process" ? "var(--theme-primary, #b45309)" : "transparent",
                color: "#ffffff"
              }}
            >
              Extraction Process
            </button>
            <button
              id="nav-recipes-btn"
              onClick={() => scrollToSection("recipes")}
              className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:bg-white/10 text-white"
            >
              <BookOpen className="w-4 h-4" style={{ color: "var(--theme-accent, #f59e0b)" }} />
              <span>Recipes</span>
            </button>
            <button
              id="nav-visit-btn"
              onClick={() => scrollToSection("mart-visit")}
              className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:bg-white/10 text-white"
            >
              <MapPin className="w-4 h-4" style={{ color: "var(--theme-accent, #f59e0b)" }} />
              <span>Visit Mart</span>
            </button>
            {onOpenOrderTracking && (
              <button
                id="nav-track-order-btn"
                onClick={onOpenOrderTracking}
                className="px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:bg-amber-800/60 text-amber-200 hover:text-white border border-amber-500/30 font-medium"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Track Order</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input / Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div 
                  className="flex items-center border rounded-lg px-2.5 py-1.5 w-48 sm:w-64"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <Search className="w-4 h-4 shrink-0" style={{ color: "var(--theme-accent, #f59e0b)" }} />
                  <input
                    id="navbar-search-input"
                    type="text"
                    placeholder="Search groundnut, coconut..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-white placeholder-white/60 focus:outline-none ml-2"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-white hover:opacity-80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="navbar-search-toggle"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Search Oils"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Auth Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  id="nav-user-profile-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-white hover:bg-white/10 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.25)",
                    borderColor: "rgba(255,255,255,0.2)"
                  }}
                  title={user.displayName || user.email || "Account"}
                >
                  {user?.photoURL && user.photoURL.trim() !== "" ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-6 h-6 rounded-full border border-amber-300 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-medium max-w-[90px] truncate">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-stone-900 border border-amber-900/60 shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-stone-800">
                      <p className="text-xs font-bold text-white truncate">{user.displayName || "Customer"}</p>
                      <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                    </div>
                    <button
                      id="nav-signout-btn"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={onSignIn}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border text-amber-200 hover:text-white hover:bg-amber-600/30 transition-colors cursor-pointer"
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  borderColor: "var(--theme-accent, #f59e0b)"
                }}
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md border hover:opacity-90 transition-all cursor-pointer"
              style={{
                backgroundColor: "var(--theme-primary, #b45309)",
                borderColor: "var(--theme-accent, #f59e0b)",
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="navbar-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden border-t px-4 pt-3 pb-6 space-y-3 animate-fadeIn"
          style={{
            backgroundColor: "var(--theme-header-bg, #291305)",
            borderColor: "rgba(255,255,255,0.15)"
          }}
        >
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className="text-left px-4 py-2.5 rounded-lg text-sm text-white hover:bg-white/10 font-medium transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/20 flex flex-col gap-2 text-xs">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center gap-2">
                  {user?.photoURL && user.photoURL.trim() !== "" ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-7 h-7 rounded-full border border-amber-300" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{user.displayName || "User"}</p>
                    <p className="text-[10px] text-amber-200/80 leading-tight">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSignOut?.();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 bg-rose-950/40 rounded border border-rose-800/40"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignIn?.();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}

            <a
              href={`tel:${storeConfig.contactPhone1}`}
              className="flex items-center gap-2 text-white py-1"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline: {storeConfig.contactPhone1}</span>
            </a>
            <a
              href={`https://wa.me/${storeConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-400 py-1 font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Order</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
