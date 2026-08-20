import React, { useState, useEffect } from "react";
import { PRODUCTS } from "./data/products";
import { Product, CartItem, ProductReview } from "./types";
import { DEFAULT_STORE_CONFIG, StoreConfig } from "./data/storeConfig";
import { COLOR_THEMES, ColorTheme } from "./data/themes";
import { INITIAL_REVIEWS } from "./data/reviews";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { ProcessShowcase } from "./components/ProcessShowcase";
import { ProductCatalog } from "./components/ProductCatalog";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { BatchVerifier } from "./components/BatchVerifier";
import { OilFinderQuiz } from "./components/OilFinderQuiz";
import { RecipesSection } from "./components/RecipesSection";
import { MartVisitSection } from "./components/MartVisitSection";
import { Footer } from "./components/Footer";
import { OwnerPanelModal } from "./components/OwnerPanelModal";
import { AffiliateModal } from "./components/AffiliateModal";
import { OrderTrackingModal } from "./components/OrderTrackingModal";
import { FloatingWhatsAppButton } from "./components/FloatingWhatsAppButton";
import { AuthModal } from "./components/AuthModal";
import { CheckCircle2, Shield, Settings, Sparkles, X } from "lucide-react";
import { auth, logOutUser } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  saveStoreConfigToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeProducts,
  subscribeOrders,
  subscribeReviews,
  subscribeStoreConfig,
  FirestoreOrder
} from "./services/firestoreService";

// Helpers for tracking deleted product IDs to prevent resurrection from cache/snapshots
const getDeletedProductIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem("alraza_deleted_product_ids");
    return new Set<string>(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set<string>();
  }
};

const markProductIdDeleted = (productId: string) => {
  try {
    const saved = localStorage.getItem("alraza_deleted_product_ids");
    const arr: string[] = saved ? JSON.parse(saved) : [];
    if (!arr.includes(productId)) {
      arr.push(productId);
      localStorage.setItem("alraza_deleted_product_ids", JSON.stringify(arr));
    }
  } catch (e) {
    console.warn("Error recording deleted product ID:", e);
  }
};

const unmarkProductIdDeleted = (productId: string) => {
  try {
    const saved = localStorage.getItem("alraza_deleted_product_ids");
    if (saved) {
      const arr: string[] = JSON.parse(saved);
      const filtered = arr.filter((id) => id !== productId);
      localStorage.setItem("alraza_deleted_product_ids", JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn("Error unmarking deleted product ID:", e);
  }
};

export default function App() {
  // Firebase User Authentication State
  const [user, setUser] = useState<User | null>(null);

  // 1. Products state (Persisted in localStorage so owner modifications persist)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const deletedIds = getDeletedProductIds();
      const saved = localStorage.getItem("alraza_products");
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Ensure stock quantities are initialized properly and excluded deleted items
        return parsed
          .filter((p) => !deletedIds.has(p.id))
          .map((p) => ({
            ...p,
            sizes: p.sizes.map((s) => ({
              ...s,
              stockQuantity: s.stockQuantity !== undefined ? s.stockQuantity : 20,
              lowStockThreshold: s.lowStockThreshold || 5,
              inStock: s.inStock !== undefined ? s.inStock : true,
            })),
          }));
      }
      return PRODUCTS.filter((p) => !deletedIds.has(p.id));
    } catch {
      return PRODUCTS;
    }
  });

  // 2. Store Config state (Persisted in localStorage)
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem("alraza_store_config");
      return saved ? { ...DEFAULT_STORE_CONFIG, ...JSON.parse(saved) } : DEFAULT_STORE_CONFIG;
    } catch {
      return DEFAULT_STORE_CONFIG;
    }
  });

  // 3. Active 150 Color Themes state (Default: Obsidian Luxury Black)
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("alraza_active_theme");
      if (saved && saved !== "royal-amber" && saved !== "warm-mustard") {
        return saved;
      }
      return "obsidian-luxury-black";
    } catch {
      return "obsidian-luxury-black";
    }
  });

  // 4. Orders state (Persisted in localStorage)
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("alraza_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Customer Reviews & Feedback state (Persisted in localStorage)
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem("alraza_product_reviews");
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Navigation & Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBatchVerifierOpen, setIsBatchVerifierOpen] = useState(false);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("AR-GNT-2026-08");
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");

  const handleOpenOrderTracking = (orderId?: string) => {
    if (orderId) {
      setTrackingOrderId(orderId);
    }
    setIsOrderTrackingOpen(true);
  };

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("alraza_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState<string | null>(() => {
    try {
      return localStorage.getItem("alraza_promo") || null;
    } catch {
      return null;
    }
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ id: number; title: string; desc?: string } | null>(null);

  // Capture Referral Link query parameter (?ref=CODE) automatically
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      if (refCode) {
        const cleanRef = refCode.trim().toUpperCase();
        localStorage.setItem("alraza_referral_code", cleanRef);
        if (!appliedPromo) {
          setAppliedPromo(cleanRef);
          setToastMessage({
            id: Date.now(),
            title: `Partner Discount Applied: ${cleanRef}`,
            desc: "Enjoy 10% off your entire cold-pressed oil order!",
          });
        }
      }
    } catch (e) {
      console.error("Referral param parsing error:", e);
    }
  }, []);

  // Firebase Auth State Listener & Firestore Live Subscriptions
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsubConfig = subscribeStoreConfig((remoteConfig) => {
      if (remoteConfig) {
        setStoreConfig((prev) => {
          const merged = { ...prev, ...remoteConfig };
          // Preserve valid local heroImage/logoUrl if remote returns empty string
          if ((!remoteConfig.heroImage || remoteConfig.heroImage.trim() === "") && prev.heroImage && prev.heroImage.trim() !== "") {
            merged.heroImage = prev.heroImage;
          }
          if ((!remoteConfig.logoUrl || remoteConfig.logoUrl.trim() === "") && prev.logoUrl && prev.logoUrl.trim() !== "") {
            merged.logoUrl = prev.logoUrl;
          }
          return merged;
        });
      }
    });

    const unsubProducts = subscribeProducts((remoteProducts) => {
      if (remoteProducts && remoteProducts.length > 0) {
        const deletedIds = getDeletedProductIds();
        const validRemote = remoteProducts.filter((p) => !deletedIds.has(p.id));
        setProducts(validRemote);
      }
    });

    const unsubReviews = subscribeReviews((remoteReviews) => {
      if (remoteReviews && remoteReviews.length > 0) {
        setReviews(remoteReviews);
      }
    });

    const unsubOrders = subscribeOrders((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    return () => {
      unsubAuth();
      unsubConfig();
      unsubProducts();
      unsubReviews();
      unsubOrders();
    };
  }, []);

  // Sync Products to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("alraza_products", JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products", e);
    }
  }, [products]);

  // Sync Store Config to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("alraza_store_config", JSON.stringify(storeConfig));
    } catch (e) {
      console.error("Failed to save storeConfig", e);
    }
  }, [storeConfig]);

  // Sync Orders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("alraza_orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  }, [orders]);

  // Sync Reviews to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("alraza_product_reviews", JSON.stringify(reviews));
    } catch (e) {
      console.error("Failed to save reviews", e);
    }
  }, [reviews]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("alraza_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  // Sync Promo to LocalStorage
  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem("alraza_promo", appliedPromo);
      } else {
        localStorage.removeItem("alraza_promo");
      }
    } catch (e) {
      console.error("Failed to save promo to localStorage", e);
    }
  }, [appliedPromo]);

  // Apply Active Theme CSS properties dynamically to :root for instant site-wide theme switching!
  useEffect(() => {
    try {
      localStorage.setItem("alraza_active_theme", activeThemeId);
      const theme = COLOR_THEMES.find((t) => t.id === activeThemeId) || COLOR_THEMES[0];
      if (theme) {
        const root = document.documentElement;
        root.style.setProperty("--theme-primary", theme.primary);
        root.style.setProperty("--theme-primary-dark", theme.primaryDark);
        root.style.setProperty("--theme-primary-light", theme.primaryLight);
        root.style.setProperty("--theme-accent", theme.accent);
        root.style.setProperty("--theme-bg-main", theme.bgMain);
        root.style.setProperty("--theme-bg-secondary", theme.bgSecondary);
        root.style.setProperty("--theme-bg-card", theme.bgCard);
        root.style.setProperty("--theme-header-bg", theme.headerBg);
        root.style.setProperty("--theme-text", theme.textColor);
        root.style.setProperty("--theme-text-muted", theme.textMuted);
        root.style.setProperty("--theme-border", theme.border);
        root.style.setProperty("--theme-badge-bg", theme.badgeBg);

        // Dynamic footer custom CSS variables
        const isCustomFooter = storeConfig.footerStyleMode === "custom";
        const footerBg = isCustomFooter
          ? (storeConfig.footerBgColor || "#1c1917")
          : (theme.category === "Pure & Minimalist White" ? (theme.bgSecondary || "#f8fafc") : (theme.headerBg || "#1c1917"));
        const footerText = isCustomFooter
          ? (storeConfig.footerTextColor || "#fef3c7")
          : (theme.category === "Pure & Minimalist White" ? (theme.textColor || "#0f172a") : "#fef3c7");
        const footerBorder = isCustomFooter
          ? (storeConfig.footerBorderColor || "#78350f")
          : (theme.border || "#e2e8f0");
        const footerTopBanner = isCustomFooter
          ? (storeConfig.footerTopBannerBg || "rgba(0,0,0,0.25)")
          : (theme.category === "Pure & Minimalist White" ? "#ffffff" : "rgba(0,0,0,0.25)");

        root.style.setProperty("--theme-footer-bg", footerBg);
        root.style.setProperty("--theme-footer-text", footerText);
        root.style.setProperty("--theme-footer-border", footerBorder);
        root.style.setProperty("--theme-footer-top-banner", footerTopBanner);
      }
    } catch (e) {
      console.error("Failed to apply theme", e);
    }
  }, [activeThemeId, storeConfig.footerStyleMode, storeConfig.footerBgColor, storeConfig.footerTextColor, storeConfig.footerBorderColor, storeConfig.footerTopBannerBg]);

  // Synchronize dynamic SEO Meta Tags (Title, Description, Keywords) with DOM for search engines
  useEffect(() => {
    if (storeConfig.metaTitle) {
      document.title = storeConfig.metaTitle;
    }

    if (storeConfig.metaDescription) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement("meta");
        descMeta.setAttribute("name", "description");
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute("content", storeConfig.metaDescription);
    }

    if (storeConfig.metaKeywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement("meta");
        keywordsMeta.setAttribute("name", "keywords");
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute("content", storeConfig.metaKeywords);
    }
  }, [storeConfig.metaTitle, storeConfig.metaDescription, storeConfig.metaKeywords]);

  // Calculate Promo Discount
  const subtotal = cartItems.reduce((sum, item) => {
    const sizeOpt = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
    return sum + sizeOpt.price * item.quantity;
  }, 0);

  let promoDiscount = 0;
  if (appliedPromo === "PURE10") {
    promoDiscount = Math.round(subtotal * 0.1);
  } else if (appliedPromo === "FIRSTPRESS") {
    promoDiscount = subtotal > 500 ? 150 : 50;
  }

  const showToast = (title: string, desc?: string) => {
    const id = Date.now();
    setToastMessage({ id, title, desc });
    setTimeout(() => {
      setToastMessage((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, sizeIndex: number, quantity: number = 1) => {
    const itemId = `${product.id}-${sizeIndex}`;
    const sizeName = product.sizes[sizeIndex]?.size || product.sizes[0].size;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            product,
            selectedSizeIndex: sizeIndex,
            quantity,
          },
        ];
      }
    });

    showToast(
      `Added to Cart: ${product.name}`,
      `${quantity}x (${sizeName}) added successfully.`
    );
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast("Item removed from cart");
  };

  const handleApplyPromo = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "PURE10" || cleanCode === "FIRSTPRESS") {
      setAppliedPromo(cleanCode);
      showToast(`Promo Applied: ${cleanCode}`, cleanCode === "PURE10" ? "10% Discount applied" : "Rs. 150 Discount applied");
      return true;
    }
    return false;
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast("Promo code removed");
  };

  const handleOpenBatchVerifier = (batchNo?: string) => {
    if (batchNo) setSelectedBatchCode(batchNo);
    setIsBatchVerifierOpen(true);
  };

  const handleOrderSuccess = (orderPayload: any) => {
    setOrders((prev) => [orderPayload, ...prev]);

    // Save order to Firestore
    try {
      const firestoreOrder: FirestoreOrder = {
        id: orderPayload.orderId || `AR-${Date.now()}`,
        customerName: orderPayload.customerName || "Customer",
        customerPhone: orderPayload.customerPhone || "",
        customerEmail: orderPayload.customerEmail || "",
        shippingAddress: orderPayload.deliveryAddress || "",
        city: orderPayload.deliveryAddress?.split(",")?.[1]?.trim() || "Karachi",
        totalAmount: Number(orderPayload.totalAmount) || 0,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "pending",
        itemsSummary: JSON.stringify(orderPayload.items || []),
        createdAt: new Date().toISOString()
      };
      saveOrderToFirestore(firestoreOrder).catch((err) => console.warn("Firestore order sync:", err));
    } catch (e) {
      console.warn("Order sync error:", e);
    }
    
    // Decrement stock for ordered items
    setProducts((prev) => {
      const updated = [...prev];
      orderPayload.items?.forEach((it: any) => {
        const pIdx = updated.findIndex((p) => p.id === it.product?.id || p.name === it.product?.name);
        if (pIdx > -1) {
          const sIdx = it.selectedSizeIndex || 0;
          if (updated[pIdx].sizes[sIdx]) {
            const currentStock = updated[pIdx].sizes[sIdx].stockQuantity ?? 10;
            const newStock = Math.max(0, currentStock - (it.quantity || 1));
            updated[pIdx].sizes[sIdx].stockQuantity = newStock;
            updated[pIdx].sizes[sIdx].inStock = newStock > 0;
          }
        }
      });
      return updated;
    });

    setCartItems([]);
    setAppliedPromo(null);
    showToast("Order Placed Successfully!", `Order ID: ${orderPayload.orderId}`);
  };

  // Review Submissions and Moderation
  const handleCreateReview = (reviewData: Omit<ProductReview, "id" | "date" | "status">) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `REV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: "approved", // auto approved for immediate display or manageable in owner panel
      helpfulVotes: 1,
    };
    setReviews((prev) => [newRev, ...prev]);
    saveReviewToFirestore(newRev).catch((err) => console.warn("Firestore review sync:", err));
    showToast("Review Posted!", "Thank you for sharing your cold-pressed experience.");
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "approved" } : r))
    );
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: "rejected" } : r))
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== reviewId);
      try {
        localStorage.setItem("alraza_product_reviews", JSON.stringify(updated));
      } catch (e) {
        console.warn("Local review storage sync:", e);
      }
      return updated;
    });
    deleteReviewFromFirestore(reviewId).catch((err) => console.warn("Firestore delete review error:", err));
    showToast("Review Deleted", "The customer review was removed.");
  };

  const handleToggleFeatureReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isFeatured: !r.isFeatured } : r))
    );
  };

  const handleSaveOwnerReply = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ownerReply: replyText } : r))
    );
  };

  // Owner Panel Handlers
  const handleSaveProduct = (updatedProduct: Product) => {
    // Unmark from deleted IDs in case a previously deleted ID is recreated
    unmarkProductIdDeleted(updatedProduct.id);

    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProduct.id);
      let next: Product[];
      if (idx > -1) {
        next = [...prev];
        next[idx] = updatedProduct;
      } else {
        next = [updatedProduct, ...prev];
      }
      try {
        localStorage.setItem("alraza_products", JSON.stringify(next));
      } catch (e) {
        console.warn("Local product storage sync:", e);
      }
      return next;
    });

    // Save product to Firestore
    saveProductToFirestore(updatedProduct).catch((err) =>
      console.warn("Firestore product save error:", err)
    );

    // Update selected product if modal is open
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }

    showToast("Product Saved!", `${updatedProduct.name} updated successfully.`);
  };

  const handleDeleteProduct = (productId: string) => {
    // 1. Mark as permanently deleted to prevent restoration from cache or snapshots
    markProductIdDeleted(productId);

    // 2. Immediately remove from product catalog state (triggers instant synchronous re-render)
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem("alraza_products", JSON.stringify(updated));
      } catch (e) {
        console.warn("Local product storage sync:", e);
      }
      return updated;
    });

    // 3. Remove from cart if item belongs to deleted product
    setCartItems((prev) => {
      const updatedCart = prev.filter((item) => item.product.id !== productId);
      try {
        localStorage.setItem("alraza_cart", JSON.stringify(updatedCart));
      } catch (e) {
        console.warn("Cart storage sync:", e);
      }
      return updatedCart;
    });

    // 4. Close detail modal immediately if open for this product
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }

    // 5. Remove permanently from Firestore database
    deleteProductFromFirestore(productId).catch((err) =>
      console.warn("Firestore delete product error:", err)
    );

    showToast("Product Deleted", "The product was permanently removed from the store catalog.");
  };

  const handleSaveStoreConfig = (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    saveStoreConfigToFirestore(newConfig).catch((err) => console.warn("Firestore store config sync:", err));
    showToast("Store Settings Updated!", "Website branding and contact details updated.");
  };

  const handleChangeTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    showToast("Theme Palette Activated!", `Whole website updated to theme: ${themeId}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => (o.orderId || o.id) !== orderId && o.id !== orderId && o.orderId !== orderId);
      try {
        localStorage.setItem("alraza_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("Local order storage sync:", e);
      }
      return updated;
    });
    deleteOrderFromFirestore(orderId).catch((err) => console.warn("Firestore delete order error:", err));
    showToast("Order Deleted", `Order #${orderId} was removed from records.`);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative transition-colors duration-400"
      style={{
        backgroundColor: "var(--theme-bg-main, #fffbeb)",
        color: "var(--theme-text, #451a03)",
      }}
    >
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300 max-w-sm">
          <div 
            className="text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 border"
            style={{
              backgroundColor: "var(--theme-header-bg, #291305)",
              borderColor: "var(--theme-border, #fde68a)"
            }}
          >
            <div className="p-1.5 bg-emerald-800 rounded-lg text-emerald-200 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm text-white">{toastMessage.title}</p>
              {toastMessage.desc && <p className="text-amber-200/90 mt-0.5">{toastMessage.desc}</p>}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-amber-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBatchVerifier={() => handleOpenBatchVerifier()}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenAffiliate={() => setIsAffiliateOpen(true)}
        onOpenOrderTracking={handleOpenOrderTracking}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        storeConfig={storeConfig}
        user={user}
        onSignIn={() => setIsAuthModalOpen(true)}
        onSignOut={logOutUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroBanner
          onExploreProducts={() => scrollToSection("products")}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onOpenProcess={() => scrollToSection("process")}
          storeConfig={storeConfig}
        />

        {/* Cold Press 6-Step Precision Process & Refined vs Cold Pressed Comparison */}
        <ProcessShowcase />

        {/* Product Catalog with Categories, Search, Filters & Size Selection */}
        <ProductCatalog
          products={products}
          onAddToCart={handleAddToCart}
          onQuickView={(product) => setSelectedProduct(product)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Traditional Culinary Recipes & Ayurvedic Remedies */}
        <RecipesSection />

        {/* Physical Mart Visit, Live Extraction Timings, Reviews & Wholesale Bulk Inquiry */}
        <MartVisitSection storeConfig={storeConfig} />
      </main>

      {/* Comprehensive Footer with Live Bottom Theme Studio */}
      <Footer
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenBatchVerifier={handleOpenBatchVerifier}
        onOpenAffiliate={() => setIsAffiliateOpen(true)}
        onOpenOrderTracking={handleOpenOrderTracking}
        storeConfig={storeConfig}
        activeThemeId={activeThemeId}
        onChangeTheme={handleChangeTheme}
        onOpenOwnerPanel={() => setIsOwnerPanelOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onVerifyBatch={(batchNo) => handleOpenBatchVerifier(batchNo)}
        reviews={reviews}
        onSubmitReview={handleCreateReview}
        storeConfig={storeConfig}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        promoDiscount={promoDiscount}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
        storeConfig={storeConfig}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        promoDiscount={promoDiscount}
        onOrderSuccess={handleOrderSuccess}
        storeConfig={storeConfig}
        onOpenOrderTracking={handleOpenOrderTracking}
        appliedPromo={appliedPromo}
      />

      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        initialOrderId={trackingOrderId}
        storeConfig={storeConfig}
        allOrders={orders}
      />

      <BatchVerifier
        isOpen={isBatchVerifierOpen}
        onClose={() => setIsBatchVerifierOpen(false)}
        initialBatchNo={selectedBatchCode}
      />

      <OilFinderQuiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />

      <AffiliateModal
        isOpen={isAffiliateOpen}
        onClose={() => setIsAffiliateOpen(false)}
        storeConfig={storeConfig}
        allOrders={orders}
      />

      {/* SECRET OWNER PANEL MODAL (Password: ads546rf) */}
      <OwnerPanelModal
        isOpen={isOwnerPanelOpen}
        onClose={() => setIsOwnerPanelOpen(false)}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        storeConfig={storeConfig}
        onSaveStoreConfig={handleSaveStoreConfig}
        activeThemeId={activeThemeId}
        onChangeTheme={handleChangeTheme}
        orders={orders}
        onDeleteOrder={handleDeleteOrder}
        reviews={reviews}
        onApproveReview={handleApproveReview}
        onRejectReview={handleRejectReview}
        onDeleteReview={handleDeleteReview}
        onToggleFeatureReview={handleToggleFeatureReview}
        onSaveOwnerReply={handleSaveOwnerReply}
      />

      {/* Floating WhatsApp Support Button */}
      <FloatingWhatsAppButton storeConfig={storeConfig} cart={cartItems} />

      {/* Authentication Modal (Email/Google Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 
        SECRET OWNER PANEL TRIGGER BUTTON:
        Positioned strictly in the bottom right corner.
        Color-matched to the footer/background with subtle blend so only the owner who knows its location can access it.
      */}
      <button
        id="secret-owner-panel-trigger"
        onClick={() => setIsOwnerPanelOpen(true)}
        aria-label="Admin Control"
        title="Owner Panel"
        className="fixed bottom-1.5 right-1.5 z-40 p-2 rounded-full text-amber-950/20 hover:text-amber-950/90 hover:bg-amber-900/20 transition-all duration-300 cursor-pointer flex items-center justify-center opacity-30 hover:opacity-100"
      >
        <Shield className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
