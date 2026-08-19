import React, { useState } from "react";
import { 
  X, 
  Droplet, 
  ShieldCheck, 
  Flame, 
  Check, 
  ShoppingBag, 
  Star, 
  Sparkles, 
  ExternalLink,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  MessageSquarePlus,
  Send,
  ThumbsUp,
  UserCheck,
  MessageCircle
} from "lucide-react";
import { Product, ProductReview } from "../types";
import { StoreConfig } from "../data/storeConfig";
import { ASSETS } from "../assets/images";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onVerifyBatch?: (batchNo: string) => void;
  reviews?: ProductReview[];
  onSubmitReview?: (review: Omit<ProductReview, "id" | "date" | "status">) => void;
  storeConfig?: StoreConfig;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onVerifyBatch,
  reviews = [],
  onSubmitReview,
  storeConfig,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "nutrition" | "reviews">("overview");

  // Feedback form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewCity, setReviewCity] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isVerifiedCustomer, setIsVerifiedCustomer] = useState(true);
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState(false);

  if (!product) return null;

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];
  const discountPercent = Math.round(
    ((currentSize.originalPrice - currentSize.price) / currentSize.originalPrice) * 100
  );

  const stockQty = currentSize.stockQuantity ?? 10;
  const isOutOfStock = !currentSize.inStock || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= (currentSize.lowStockThreshold || 5);

  // Filter reviews for this product
  const productReviews = reviews.filter(
    (r) => r.productId === product.id && (r.status === "approved" || r.status === undefined)
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSizeIndex, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    if (onSubmitReview) {
      onSubmitReview({
        productId: product.id,
        productName: product.name,
        authorName: reviewName.trim(),
        authorCity: reviewCity.trim() || "Verified Buyer",
        rating: reviewRating,
        title: reviewTitle.trim() || "Cold Press Experience",
        comment: reviewComment.trim(),
        verifiedPurchase: isVerifiedCustomer,
      });
    }

    setReviewSubmittedNotice(true);
    setReviewName("");
    setReviewCity("");
    setReviewTitle("");
    setReviewComment("");
    setShowReviewForm(false);
    setTimeout(() => setReviewSubmittedNotice(false), 4000);
  };

  const whatsappNumber = storeConfig?.whatsappNumber || "923001234567";
  const totalPrice = currentSize.price * quantity;
  const whatsappMessage = 
`🌿 *AL RAZA COLD PRESS OIL MART - DIRECT ORDER* 🌿

🛍️ *Product:* ${product.name} (${product.nativeName || "Pure Oil"})
📦 *Selected Bottle Size:* ${currentSize.size}
🔢 *Quantity:* ${quantity} bottle(s)
💰 *Unit Price:* Rs. ${currentSize.price}
💵 *Total Amount:* Rs. ${totalPrice}
🌱 *Batch No:* ${product.batchNo || "Fresh Cold-Pressed Batch"}
📍 *Origin & Press:* ${product.seedOrigin} • ${product.woodType}

Salam Al Raza Mart! I would like to order this item directly via WhatsApp. Please confirm order booking & delivery details.`;

  const whatsappOrderUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border max-h-[92vh] flex flex-col"
        style={{
          backgroundColor: "var(--theme-bg-main, #fffbeb)",
          borderColor: "var(--theme-border, #fde68a)",
        }}
      >
        
        {/* Modal Header */}
        <div 
          className="text-white px-6 py-4 flex items-center justify-between border-b"
          style={{
            backgroundColor: "var(--theme-header-bg, #291305)",
            borderColor: "var(--theme-border, #fde68a)"
          }}
        >
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
              {product.name}
            </h2>
          </div>
          <button
            id="close-product-detail-modal"
            onClick={onClose}
            className="p-1 text-amber-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex items-center px-6 border-b text-xs font-semibold gap-6"
          style={{
            backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
            borderColor: "var(--theme-border, #fde68a)"
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-amber-800 text-amber-950 font-bold"
                : "border-transparent text-amber-900/70 hover:text-amber-950"
            }`}
          >
            Product Overview & Extraction
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "nutrition"
                ? "border-amber-800 text-amber-950 font-bold"
                : "border-transparent text-amber-900/70 hover:text-amber-950"
            }`}
          >
            Nutrition & Test Lab Report
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "border-amber-800 text-amber-950 font-bold"
                : "border-transparent text-amber-900/70 hover:text-amber-950"
            }`}
          >
            <span>Customer Feedback ({productReviews.length})</span>
            <span className="bg-amber-800 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              ★ {product.rating}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1" style={{ color: "var(--theme-text, #451a03)" }}>
          
          {/* Success Banner when review submitted */}
          {reviewSubmittedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Thank you for your valuable feedback!</p>
                <p className="text-[11px] text-emerald-800">Your review has been saved and will appear in the verified customer testimonials.</p>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Product Image & Badges */}
                <div className="md:col-span-5 space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-amber-900/20 bg-amber-100 shadow-inner">
                    <img
                      src={product.heroImage && product.heroImage.trim() !== "" ? product.heroImage : ASSETS.olivePlasticBottle}
                      alt={product.name}
                      className="w-full h-64 sm:h-72 object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    {isOutOfStock ? (
                      <span className="absolute top-3 left-3 bg-rose-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <PackageX className="w-3.5 h-3.5" /> Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-stock-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Only {stockQty} Left!
                      </span>
                    ) : product.badge ? (
                      <span 
                        className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow"
                        style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                      >
                        {product.badge}
                      </span>
                    ) : null}

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/20">
                      {product.extractionTemp}
                    </div>
                  </div>

                  {/* Purity Guarantee Box */}
                  <div 
                    className="rounded-xl p-3.5 space-y-2 text-xs border"
                    style={{
                      backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                      borderColor: "var(--theme-border, #fde68a)"
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        100% Pure & Cold-Pressed Quality
                      </span>
                    </div>
                    <p className="text-[11px] opacity-85">
                      Tested for 0.00% mineral oil, zero synthetic color, and compliant with pure cold press standards.
                    </p>
                  </div>
                </div>

                {/* Right: Pricing, Sizes & Summary */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <p 
                      className="text-xs uppercase tracking-widest font-bold"
                      style={{ color: "var(--theme-primary, #b45309)" }}
                    >
                      {product.nativeName}
                    </p>
                    <h3 className="font-serif text-2xl font-bold mt-1">
                      {product.name}
                    </h3>
                    
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold">{product.rating}</span>
                      <span className="text-xs opacity-75">({product.reviewsCount} customer reviews)</span>
                      <button
                        onClick={() => setActiveTab("reviews")}
                        className="text-xs underline ml-2 font-medium cursor-pointer"
                        style={{ color: "var(--theme-primary, #b45309)" }}
                      >
                        Read / Write Reviews
                      </button>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed opacity-90">
                    {product.description}
                  </p>

                  {/* Size Selector with Stock Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider">
                        Select Pack Size:
                      </label>
                      {isOutOfStock ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <PackageX className="w-3.5 h-3.5" /> Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-xs font-bold text-rose-600 animate-stock-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Only {stockQty} bottles left!
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({stockQty} units)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {product.sizes.map((sizeOpt, idx) => {
                        const optStock = sizeOpt.stockQuantity ?? 10;
                        const optOut = !sizeOpt.inStock || optStock <= 0;
                        const isSelected = selectedSizeIndex === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedSizeIndex(idx)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "shadow-md font-semibold text-white"
                                : "hover:opacity-90"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? "var(--theme-primary, #b45309)"
                                : "var(--theme-bg-secondary, #fef3c7)",
                              borderColor: isSelected
                                ? "var(--theme-primary-dark, #451a03)"
                                : "var(--theme-border, #fde68a)",
                              color: isSelected ? "#ffffff" : "var(--theme-text, #451a03)"
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{sizeOpt.size}</p>
                              {optOut && (
                                <span className="text-[9px] text-rose-400 font-bold">Sold Out</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-bold text-sm">Rs. {sizeOpt.price}</span>
                              <span className={`text-[10px] line-through ${isSelected ? 'text-white/75' : 'opacity-60'}`}>
                                Rs. {sizeOpt.originalPrice}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Low stock prominent warning */}
                    {isLowStock && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-bold flex items-center gap-2 animate-stock-pulse">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>⚠️ Low Stock Alert: Only {stockQty} bottles left in this batch. Order now before stock runs out!</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Add to Cart Controls */}
                  <div 
                    className="pt-3 border-t flex flex-wrap items-center justify-between gap-4"
                    style={{ borderColor: "var(--theme-border, #fde68a)" }}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-bold">
                          Rs. {currentSize.price * quantity}
                        </span>
                        <span className="text-sm line-through opacity-60">
                          Rs. {currentSize.originalPrice * quantity}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                          {discountPercent}% OFF
                        </span>
                      </div>
                      <p className="text-[11px] opacity-75">Inclusive of all taxes • Fresh batch guaranteed</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-amber-300 rounded-lg bg-white overflow-hidden">
                        <button
                          disabled={isOutOfStock}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1.5 text-amber-900 hover:bg-amber-100 font-bold transition-colors disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-amber-950 min-w-[28px] text-center">
                          {quantity}
                        </span>
                        <button
                          disabled={isOutOfStock || quantity >= stockQty}
                          onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                          className="px-3 py-1.5 text-amber-900 hover:bg-amber-100 font-bold transition-colors disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        id="modal-add-to-cart-btn"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                        className={`px-5 py-2.5 font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                          isOutOfStock
                            ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                            : addedNotice
                            ? "bg-emerald-700 text-white"
                            : "text-white hover:shadow-lg active:scale-95"
                        }`}
                        style={{
                          backgroundColor: isOutOfStock
                            ? undefined
                            : addedNotice
                            ? "#047857"
                            : "var(--theme-primary, #b45309)",
                        }}
                      >
                        {isOutOfStock ? (
                          <>
                            <PackageX className="w-4 h-4" />
                            <span>Sold Out</span>
                          </>
                        ) : addedNotice ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* Direct WhatsApp Quick Order Button */}
                      <a
                        id="modal-whatsapp-direct-btn"
                        href={whatsappOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                        title="Order this product directly on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-700" />
                        <span className="hidden sm:inline">Order via WhatsApp</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Technical Specs & Origin Highlights */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl border text-xs"
                style={{
                  backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <div>
                  <p className="font-bold uppercase text-[10px] opacity-75">Seed Origin</p>
                  <p className="font-semibold mt-0.5">{product.seedOrigin}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[10px] opacity-75">Extraction System</p>
                  <p className="font-semibold mt-0.5">{product.woodType}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[10px] opacity-75">Smoke Point</p>
                  <p className="font-semibold mt-0.5">{product.smokePoint}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[10px] opacity-75">Aroma & Flavor</p>
                  <p className="font-semibold mt-0.5">{product.aromaTaste}</p>
                </div>
              </div>

              {/* Health Benefits & Best For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div 
                  className="p-4 rounded-xl border shadow-sm space-y-2"
                  style={{
                    backgroundColor: "var(--theme-bg-card, #ffffff)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <h4 className="font-serif font-bold text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" style={{ color: "var(--theme-primary, #b45309)" }} />
                    Key Health & Dietary Benefits
                  </h4>
                  <ul className="space-y-1.5 text-xs opacity-90">
                    {product.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div 
                  className="p-4 rounded-xl border shadow-sm space-y-2"
                  style={{
                    backgroundColor: "var(--theme-bg-card, #ffffff)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <h4 className="font-serif font-bold text-sm flex items-center gap-1.5">
                    <Flame className="w-4 h-4" style={{ color: "var(--theme-primary, #b45309)" }} />
                    Recommended Culinary & Wellness Uses
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.bestFor.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                        style={{
                          backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                          borderColor: "var(--theme-border, #fde68a)"
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-6">
              {/* Nutritional Profile Table */}
              <div 
                className="rounded-xl border overflow-hidden shadow-sm"
                style={{
                  backgroundColor: "var(--theme-bg-card, #ffffff)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <div 
                  className="text-white px-4 py-2.5 font-serif font-bold text-xs flex items-center justify-between"
                  style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                >
                  <span>Nutritional Value (Per 100g serving)</span>
                  <span className="text-[11px] font-normal text-amber-200">Energy: {product.nutrition.caloriesPer100g} kcal</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="border-r border-amber-200/50 pr-2">
                    <p className="opacity-75">Monounsaturated (MUFA)</p>
                    <p className="font-bold text-sm mt-0.5">{product.nutrition.monounsaturatedFat}</p>
                  </div>
                  <div className="border-r border-amber-200/50 pr-2">
                    <p className="opacity-75">Polyunsaturated (PUFA)</p>
                    <p className="font-bold text-sm mt-0.5">{product.nutrition.polyunsaturatedFat}</p>
                  </div>
                  <div className="border-r border-amber-200/50 pr-2">
                    <p className="opacity-75">Natural Vitamin E</p>
                    <p className="font-bold text-sm mt-0.5">{product.nutrition.vitaminE}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Key Antioxidant</p>
                    <p className="font-bold text-sm mt-0.5">{product.nutrition.antioxidants}</p>
                  </div>
                </div>
              </div>

              {/* Quality Assurance Guarantee */}
              <div 
                className="p-5 rounded-xl border space-y-3"
                style={{
                  backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-serif font-bold text-sm">Official Purity Standards & Lab Grade Quality</h4>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  Every drop of Al Raza Cold Pressed Oil is tested in accredited labs. Free fatty acids are strictly controlled under 0.8%, peroxide values are below 2.0 meq/kg, and mineral oil / solvent residue is confirmed at 0.00%.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Reviews Summary & Write Review Button */}
              <div 
                className="p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4"
                style={{
                  backgroundColor: "var(--theme-bg-card, #ffffff)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-serif font-bold">{product.rating}</p>
                    <div className="flex text-amber-500 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[10px] opacity-75 mt-0.5">{productReviews.length} Ratings</p>
                  </div>
                  <div className="border-l pl-4 text-xs space-y-0.5" style={{ borderColor: "var(--theme-border, #fde68a)" }}>
                    <p className="font-bold">100% Genuine Verified Customer Reviews</p>
                    <p className="text-[11px] opacity-80">Share your experience with aroma, taste, culinary use, or wellness benefits.</p>
                  </div>
                </div>

                <button
                  id="write-customer-review-btn"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{showReviewForm ? "Close Review Form" : "Write a Customer Review"}</span>
                </button>
              </div>

              {/* Feedback Collection Form */}
              {showReviewForm && (
                <form 
                  onSubmit={handleReviewSubmit}
                  className="p-5 rounded-xl border space-y-4 shadow-sm animate-fadeIn"
                  style={{
                    backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                    borderColor: "var(--theme-border, #fde68a)"
                  }}
                >
                  <h4 className="font-serif font-bold text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Submit Your Rating & Experience for {product.name}</span>
                  </h4>

                  {/* Star Rating selector */}
                  <div>
                    <label className="block text-xs font-bold mb-1">Your Star Rating:</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-2xl cursor-pointer hover:scale-125 transition-transform"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= reviewRating 
                                ? "fill-amber-500 text-amber-500" 
                                : "text-stone-300"
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold ml-2">
                        {reviewRating === 5 ? "5/5 - Outstanding Purity!" : `${reviewRating}/5 Stars`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Fatima Tariq"
                        className="w-full p-2 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">City / Region (Optional)</label>
                      <input
                        type="text"
                        value={reviewCity}
                        onChange={(e) => setReviewCity(e.target.value)}
                        placeholder="e.g. Lahore / Mumbai"
                        className="w-full p-2 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold mb-1">Review Headline</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Unbeatable authentic nutty aroma and packaging!"
                      className="w-full p-2 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold mb-1">Your Detailed Feedback & Review *</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe how you used the oil, flavor/aroma notes, health/hair improvements, or mart delivery experience..."
                      className="w-full p-2.5 rounded-lg bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVerifiedCustomer}
                        onChange={(e) => setIsVerifiedCustomer(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span className="flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Purchase / Customer
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer hover:shadow-lg transition-all"
                      style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {productReviews.length === 0 ? (
                  <div 
                    className="p-8 rounded-xl border text-center space-y-2"
                    style={{
                      backgroundColor: "var(--theme-bg-card, #ffffff)",
                      borderColor: "var(--theme-border, #fde68a)"
                    }}
                  >
                    <p className="text-sm font-semibold">No reviews yet for this cold-pressed oil.</p>
                    <p className="text-xs opacity-75">Be the first to share your experience with this freshly extracted batch!</p>
                  </div>
                ) : (
                  productReviews.map((rev) => (
                    <div 
                      key={rev.id}
                      className="p-4 rounded-xl border space-y-2 transition-all hover:shadow-sm"
                      style={{
                        backgroundColor: "var(--theme-bg-card, #ffffff)",
                        borderColor: "var(--theme-border, #fde68a)"
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{rev.authorName}</span>
                            {rev.authorCity && (
                              <span className="text-[10px] opacity-70">({rev.authorCity})</span>
                            )}
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 mt-1">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[10px] opacity-60 ml-2">{rev.date}</span>
                          </div>
                        </div>
                        {rev.isFeatured && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ★ Featured Review
                          </span>
                        )}
                      </div>

                      {rev.title && (
                        <p className="font-serif font-bold text-xs mt-1">{rev.title}</p>
                      )}

                      <p className="text-xs leading-relaxed opacity-90">{rev.comment}</p>

                      {/* Official Owner Response if any */}
                      {rev.ownerReply && (
                        <div className="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950">
                          <p className="font-bold text-[11px] text-amber-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Response from Al Raza Store Owner:
                          </p>
                          <p className="text-[11px] text-amber-900/90 mt-0.5">{rev.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Floating / Sticky 'Order via WhatsApp' Bottom Bar */}
        <div className="p-3.5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t border-amber-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700/40 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-xs flex items-center gap-1.5">
                <span>Direct WhatsApp Booking</span>
                <span className="text-amber-300">• {product.name} ({currentSize.size})</span>
              </p>
              <p className="text-[11px] text-amber-200/80">
                Pre-fills bottle size, {quantity}x quantity & booking message (Rs. {totalPrice})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="floating-whatsapp-order-btn"
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
