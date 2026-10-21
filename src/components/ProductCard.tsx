import React, { useState } from "react";
import { 
  ShoppingBag, 
  Star, 
  Check, 
  Eye, 
  AlertTriangle,
  PackageX,
  CheckCircle2,
  Droplet,
  Flame,
  Wheat,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Product } from "../types";
import { ASSETS } from "../assets/images";
import { Language, TRANSLATIONS } from "../utils/translations";

interface ProductCardProps {
  product: Product;
  cardIndex?: number;
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onQuickView: (product: Product) => void;
  onBuyNow?: (product: Product, sizeIndex: number) => void;
  language?: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardIndex = 0,
  onAddToCart,
  onQuickView,
  onBuyNow,
  language = "ur",
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const t = TRANSLATIONS[language];
  const isUrdu = language === "ur";

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];
  const discount = Math.round(
    ((currentSize.originalPrice - currentSize.price) / currentSize.originalPrice) * 100
  );

  const stockQty = currentSize.stockQuantity ?? 15;
  const isOutOfStock = !!product.isOutOfStock || !currentSize.inStock || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= (currentSize.lowStockThreshold || 5);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, selectedSizeIndex, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const getCategoryBadgeIcon = () => {
    if (product.category === "oils") return <Droplet className="w-3 h-3 text-emerald-600 fill-emerald-600" />;
    if (product.category === "spices") return <Flame className="w-3 h-3 text-amber-600" />;
    if (product.category === "flour") return <Wheat className="w-3 h-3 text-amber-700" />;
    if (product.category === "beauty") return <Sparkles className="w-3 h-3 text-rose-500" />;
    return <ShieldCheck className="w-3 h-3 text-emerald-600" />;
  };

  const isEager = cardIndex < 4;
  let resolvedImage = product.heroImage?.trim() || "";
  if (!resolvedImage || resolvedImage.includes("olive_plastic_bottle") || resolvedImage.includes("1786261283172")) {
    resolvedImage = ASSETS.olivePlasticBottle || "/olive_plastic_bottle.webp";
  }

  const imageSource = imageError ? (ASSETS.olivePlasticBottle || "/olive_plastic_bottle.webp") : resolvedImage;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs"
    >
      {/* Product Image Section */}
      <div 
        className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden cursor-pointer aspect-[4/3]"
        onClick={() => onQuickView(product)}
      >
        <img
          src={imageSource}
          alt={product.name}
          width={400}
          height={300}
          loading={isEager ? "eager" : "lazy"}
          decoding="async"
          {...(isEager ? { fetchPriority: "high" as const } : {})}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <PackageX className="w-3 h-3" /> {t.outOfStock}
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {stockQty} units
            </span>
          ) : product.badge ? (
            <span className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {product.badge}
            </span>
          ) : null}

          {discount > 0 && !isOutOfStock && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs w-fit">
              {discount}% {t.save}
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title={t.quickView}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Rating and Reviews Footer on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px]">
          <span className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200 text-slate-800 font-medium flex items-center gap-1">
            {getCategoryBadgeIcon()}
            <span>{product.batchNo}</span>
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating} ({product.reviewsCount})
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Subtitle / Tag */}
          <p className="text-xs font-bold text-emerald-700 line-clamp-1">
            {isUrdu ? product.nativeName : product.tag}
          </p>

          {/* Product Name in English */}
          <h3 
            className="font-bold text-base sm:text-lg text-slate-900 transition-colors mt-0.5 cursor-pointer line-clamp-1 hover:text-emerald-700"
            onClick={() => onQuickView(product)}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Key Benefit Highlights */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.bestFor.slice(0, 2).map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Pack / Size Selection */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {t.selectPackSize}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t.inStock}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {product.sizes.map((sizeOpt, idx) => {
              const isSelected = selectedSizeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSizeIndex(idx)}
                  className={`py-1.5 px-2 rounded-xl text-xs transition-all cursor-pointer text-left border relative ${
                    isSelected
                      ? "bg-emerald-700 text-white border-emerald-800 font-bold shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sizeOpt.size}</span>
                    <span className="font-extrabold ml-1">Rs. {sizeOpt.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Order Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                Rs. {currentSize.price}
              </span>
              {currentSize.originalPrice > currentSize.price && (
                <span className="text-xs line-through text-slate-400">
                  Rs. {currentSize.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Buttons: Buy Now & Add to Cart */}
          <div className="flex items-center gap-1.5">
            {onBuyNow && !isOutOfStock && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product, selectedSizeIndex);
                }}
                className="px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap active:scale-95"
                title={t.buyNow}
              >
                <span>{t.buyNow}</span>
              </button>
            )}

            <button
              id={`add-to-cart-${product.id}`}
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer active:scale-95 ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : isAdded
                  ? "bg-emerald-800 text-white"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              {isOutOfStock ? (
                <>
                  <PackageX className="w-3.5 h-3.5" />
                  <span>{t.outOfStock}</span>
                </>
              ) : isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUrdu ? "شامل ہو گیا!" : "Added!"}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
