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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-amber-50 h-full shadow-2xl flex flex-col justify-between border-l border-amber-900/20 text-amber-950">
        
        {/* Drawer Header */}
        <div className="bg-amber-950 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold">Your Pure Oils Cart</h2>
            <span className="bg-amber-800 text-amber-200 text-xs px-2 py-0.5 rounded-full font-bold">
              {cartItems.length}
            </span>
          </div>
          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="p-1 text-amber-300 hover:text-white hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="bg-amber-100 px-6 py-3 border-b border-amber-200 text-xs">
          <div className="flex items-center justify-between font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-amber-900">
              <Truck className="w-4 h-4 text-emerald-600" />
              {amountNeeded === 0 ? (
                <strong className="text-emerald-800">🎉 You unlocked FREE Express Delivery!</strong>
              ) : (
                <span>Add <strong>Rs. {amountNeeded}</strong> more for FREE shipping</span>
              )}
            </span>
            <span className="font-bold text-amber-950">{progressPercent}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 transition-all duration-300 ${
                amountNeeded === 0 ? "bg-emerald-600" : "bg-amber-700"
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
                  className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3"
                >
                  <img
                    src={item.product.heroImage && item.product.heroImage.trim() !== "" ? item.product.heroImage : ASSETS.olivePlasticBottle}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-serif font-bold text-xs text-amber-950 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-amber-700 font-medium">
                      {sizeOpt.size}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-serif font-bold text-sm text-amber-950">
                        Rs. {sizeOpt.price * item.quantity}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden bg-amber-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-amber-900 hover:bg-amber-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-amber-950 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-amber-900 hover:bg-amber-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-amber-400 hover:text-rose-600 transition-colors"
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
                    className="text-xs text-rose-600 hover:underline font-bold"
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
                      className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs uppercase font-mono font-semibold text-amber-950 focus:outline-none focus:border-amber-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
                  )}
                  <p className="text-[10px] text-amber-700">
                    *Tip: Use <strong>PURE10</strong> for 10% off or <strong>FIRSTPRESS</strong> for Rs. 150 off.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-white p-5 border-t border-amber-200 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-amber-900">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold font-serif text-sm text-amber-950">Rs. {subtotal}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Savings</span>
                  <span>-Rs. {promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Door Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-100 font-bold text-sm text-amber-950">
                <span className="font-serif text-base">Grand Total</span>
                <span className="font-serif text-xl text-amber-950">Rs. {finalTotal}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                id="drawer-proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="drawer-whatsapp-quick-order"
                onClick={handleWhatsAppInstantOrder}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>1-Click Order via WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-amber-700 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Unbroken Glass Safe Delivery Guarantee</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
