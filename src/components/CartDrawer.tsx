import React, { useState } from "react";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Truck,
  Droplet,
  MessageCircle
} from "lucide-react";
import { CartItem } from "../types";
import { StoreConfig, DEFAULT_STORE_CONFIG } from "../data/storeConfig";
import { ASSETS } from "../assets/images";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
  appliedPromo: string | null;
  promoDiscount: number;
  onApplyPromo: (code: string) => boolean;
  onRemovePromo: () => void;
  storeConfig?: StoreConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedPromo,
  promoDiscount,
  onApplyPromo,
  onRemovePromo,
  storeConfig = DEFAULT_STORE_CONFIG,
}) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const sizeOpt = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
    return sum + sizeOpt.price * item.quantity;
  }, 0);

  const freeDeliveryThreshold = storeConfig.freeDeliveryThreshold ?? 2500;
  const isFreeDelivery = Boolean(storeConfig.enableFreeDeliveryAboveThreshold && subtotal >= freeDeliveryThreshold);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryFee = (isFreeDelivery || subtotal === 0) ? 0 : (storeConfig.deliveryFee ?? 150);
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoInput.trim()) return;

    const success = onApplyPromo(promoInput.trim());
    if (!success) {
      setPromoError("Invalid code. Try 'PURE10' or 'FIRSTPRESS'.");
    } else {
      setPromoInput("");
    }
  };

  const handleWhatsAppInstantOrder = () => {
    const itemsList = cartItems
      .map((it) => {
        const sizeOpt = it.product.sizes[it.selectedSizeIndex] || it.product.sizes[0];
        return `• ${it.product.name} (${sizeOpt.size}) x ${it.quantity} = Rs. ${sizeOpt.price * it.quantity}`;
      })
      .join("\n");

    const message = `Hello ${storeConfig.brandName}! 🌿\n\nI would like to place an instant order for:\n\n${itemsList}\n\n*Subtotal:* Rs. ${subtotal}\n*Delivery Fee:* ${deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}\n*Total Amount:* Rs. ${finalTotal}\n\nPlease confirm availability and dispatch details!`;

    const encoded = encodeURIComponent(message);
    const cleanNumber = (storeConfig.whatsappNumber || "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 text-slate-900">
        
        {/* Drawer Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-200" />
            <h2 className="text-lg font-bold">Shopping Cart / شاپنگ کارٹ</h2>
            <span className="bg-emerald-800 text-emerald-100 text-xs px-2 py-0.5 rounded-full font-bold">
              {cartItems.length}
            </span>
          </div>
          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="p-1 text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 text-xs">
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              {amountNeeded === 0 ? (
                <strong className="text-emerald-800">🎉 FREE Home Delivery Unlocked!</strong>
              ) : (
                <span>Add <strong>Rs. {amountNeeded}</strong> more for FREE shipping</span>
              )}
            </span>
            <span className="font-bold text-emerald-800">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 transition-all duration-300 ${
                amountNeeded === 0 ? "bg-emerald-600" : "bg-emerald-700"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
                <Droplet className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-950">
                Your cart is empty
              </h3>
              <p className="text-xs text-amber-800 max-w-xs mx-auto">
                Explore our pure wood-pressed groundnut, coconut, sesame, and therapeutic cold-pressed oils.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors cursor-pointer"
              >
                Browse Pure Oils
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const sizeOpt = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
              return (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3"
                >
                  <img
                    src={item.product.heroImage && item.product.heroImage.trim() !== "" ? item.product.heroImage : ASSETS.olivePlasticBottle}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      {sizeOpt.size}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-extrabold text-sm text-slate-900">
                        Rs. {sizeOpt.price * item.quantity}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}

          {/* Promo Code Box */}
          {cartItems.length > 0 && (
            <div className="pt-2">
              {appliedPromo ? (
                <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Promo <strong>{appliedPromo}</strong> applied (-Rs. {promoDiscount})</span>
                  </div>
                  <button
                    onClick={onRemovePromo}
                    className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromoCode} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. PURE10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs uppercase font-mono font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    *Tip: Use <strong>PURE10</strong> for 10% off.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-white p-5 border-t border-slate-200 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-sm text-slate-900">Rs. {subtotal}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Savings</span>
                  <span>-Rs. {promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Home Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-slate-900">
                <span className="text-base">Grand Total</span>
                <span className="text-xl font-black text-emerald-800">Rs. {finalTotal}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                id="drawer-proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Checkout (کیش آن ڈیلیوری)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="drawer-whatsapp-quick-order"
                onClick={handleWhatsAppInstantOrder}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>1-Click Order via WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Natural & Safe Delivery Guarantee</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
