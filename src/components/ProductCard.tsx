import React, { useState } from "react";
import { 
  ShoppingBag, 
  Star, 
  Check, 
  Eye, 
  AlertTriangle,
  PackageX,
  CheckCircle2
} from "lucide-react";
import { Product } from "../types";
import { ASSETS } from "../assets/images";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, sizeIndex: number, quantity: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];
  const discount = Math.round(
    ((currentSize.originalPrice - currentSize.price) / currentSize.originalPrice) * 100
  );

  const stockQty = currentSize.stockQuantity ?? 10;
  const isOutOfStock = !currentSize.inStock || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= (currentSize.lowStockThreshold || 5);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, selectedSizeIndex, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border"
      style={{
        backgroundColor: "var(--theme-bg-card, #ffffff)",
        borderColor: "var(--theme-border, #fde68a)",
      }}
    >
      {/* Image Container */}
      <div 
        className="relative h-56 sm:h-64 bg-amber-100/60 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.heroImage && product.heroImage.trim() !== "" ? product.heroImage : ASSETS.olivePlasticBottle}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Dark Gradient Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <PackageX className="w-3 h-3" /> Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-stock-pulse flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Low Stock: {stockQty} Left
            </span>
          ) : product.badge ? (
            <span 
              className="text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md"
              style={{ backgroundColor: "var(--theme-primary, #b45309)" }}
            >
              {product.badge}
            </span>
          ) : null}

          {discount > 0 && !isOutOfStock && (
            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow w-fit">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-amber-200 hover:text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Bottom Pill: Cold Extracted Temp */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-amber-200">
          <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-white">
            {product.extractionTemp}
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-300 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating} ({product.reviewsCount})
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Native Name */}
          <p 
            className="text-[11px] font-bold uppercase tracking-wider line-clamp-1"
            style={{ color: "var(--theme-primary, #b45309)" }}
          >
            {product.nativeName}
          </p>

          {/* Product Name */}
          <h3 
            className="font-serif text-lg font-bold transition-colors mt-0.5 cursor-pointer line-clamp-1"
            style={{ color: "var(--theme-text, #451a03)" }}
            onClick={() => onQuickView(product)}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p 
            className="text-xs mt-1 line-clamp-2 leading-relaxed opacity-90"
            style={{ color: "var(--theme-text-muted, #92400e)" }}
          >
            {product.shortDescription}
          </p>

          {/* Key Benefit Highlights */}
          <div className="mt-3 flex flex-wrap gap-1">
            {product.bestFor.slice(0, 2).map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: "var(--theme-bg-secondary, #fef3c7)",
                  color: "var(--theme-text, #451a03)",
                  borderColor: "var(--theme-border, #fde68a)"
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Size Selection Pills */}
        <div 
          className="space-y-1.5 pt-2 border-t"
          style={{ borderColor: "var(--theme-border, #fde68a)" }}
        >
          <div className="flex items-center justify-between">
            <span 
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--theme-text-muted, #92400e)" }}
            >
              Select Size:
            </span>

            {/* Inventory Status Indicator */}
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                <PackageX className="w-3 h-3" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold text-rose-600 animate-stock-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stockQty} units left!
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> In Stock ({stockQty})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {product.sizes.map((sizeOpt, idx) => {
              const optStock = sizeOpt.stockQuantity ?? 10;
              const optOut = !sizeOpt.inStock || optStock <= 0;
              const isSelected = selectedSizeIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSizeIndex(idx)}
                  className={`py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer text-left border relative ${
                    isSelected
                      ? "shadow-sm font-bold text-white"
                      : "opacity-90 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelected 
                      ? "var(--theme-primary, #b45309)" 
                      : "var(--theme-bg-secondary, #fef3c7)",
                    borderColor: isSelected 
                      ? "var(--theme-primary-dark, #451a03)" 
                      : "var(--theme-border, #fde68a)",
                    color: isSelected 
                      ? "#ffffff" 
                      : "var(--theme-text, #451a03)"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sizeOpt.size.split(" ")[0]}</span>
                    <span className="font-bold">Rs. {sizeOpt.price}</span>
                  </div>
                  {optOut && (
                    <span className="text-[9px] text-rose-500 font-semibold block">Sold Out</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Visual Scarcity Alert Strip if Low Stock */}
          {isLowStock && (
            <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 animate-stock-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Low Stock: Only {stockQty} bottles remaining!</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div 
          className="pt-3 border-t flex items-center justify-between gap-2"
          style={{ borderColor: "var(--theme-border, #fde68a)" }}
        >
          <div>
            <div className="flex items-baseline gap-1.5">
              <span 
                className="text-xl font-serif font-bold"
                style={{ color: "var(--theme-text, #451a03)" }}
              >
                Rs. {currentSize.price}
              </span>
              <span 
                className="text-xs line-through opacity-70"
                style={{ color: "var(--theme-text-muted, #92400e)" }}
              >
                Rs. {currentSize.originalPrice}
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-semibold">
              Batch: {product.batchNo}
            </p>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300"
                : isAdded
                ? "bg-emerald-700 text-white cursor-pointer"
                : "text-white cursor-pointer hover:shadow-md active:scale-95"
            }`}
            style={{
              backgroundColor: isOutOfStock
                ? undefined
                : isAdded
                ? "#047857"
                : "var(--theme-primary, #b45309)",
            }}
          >
            {isOutOfStock ? (
              <>
                <PackageX className="w-3.5 h-3.5" />
                <span>Sold Out</span>
              </>
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
