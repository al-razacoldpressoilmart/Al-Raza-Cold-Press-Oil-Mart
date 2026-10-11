import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  X, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  MessageCircle,
  Copy,
  Check,
  PackageCheck,
  MapPin,
  User,
  Phone
} from "lucide-react";
import { CartItem } from "../types";
import { StoreConfig } from "../data/storeConfig";
import { NotificationManager } from "../utils/NotificationManager";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  promoDiscount: number;
  onOrderSuccess: (orderData: any) => void;
  storeConfig: StoreConfig;
  onOpenOrderTracking?: (orderId: string) => void;
  appliedPromo?: string | null;
}

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Gujranwala",
  "Sialkot",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Sukkur",
  "Other City"
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  promoDiscount,
  onOrderSuccess,
  storeConfig,
  onOpenOrderTracking,
  appliedPromo,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Customer details state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [customCity, setCustomCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Payment method: Cash on delivery is primary default in WordPress
  const activePaymentMethods = storeConfig.paymentMethods.filter((pm) => pm.active);
  const defaultMethod = activePaymentMethods.find((p) => p.id === "cod") || activePaymentMethods[0] || {
    id: "cod",
    name: "Cash on Delivery",
    instructions: "Pay when parcel arrives"
  };

  const [selectedMethodId, setSelectedMethodId] = useState<string>(defaultMethod.id);
  const [tidNumber, setTidNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setCustomerName("");
      setCustomerPhone("");
      setAddress("");
      setCity("Lahore");
      setCustomCity("");
      setDeliveryNotes("");
      setTidNumber("");
      setCompletedOrder(null);
      const codOption = activePaymentMethods.find((p) => p.id === "cod");
      setSelectedMethodId(codOption ? "cod" : activePaymentMethods[0]?.id || "cod");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPaymentMethod = activePaymentMethods.find((pm) => pm.id === selectedMethodId) || defaultMethod;

  const subtotal = cartItems.reduce((sum, item) => {
    const sizeOpt = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
    return sum + (sizeOpt?.price || 0) * item.quantity;
  }, 0);

  const freeDeliveryThreshold = storeConfig.freeDeliveryThreshold ?? 2500;
  const isFreeDelivery = Boolean(storeConfig.enableFreeDeliveryAboveThreshold && subtotal >= freeDeliveryThreshold);
  const deliveryFee = isFreeDelivery || subtotal === 0 ? 0 : (storeConfig.deliveryFee ?? 150);
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#16a34a", "#22c55e", "#d97706", "#f59e0b"],
      });
    } catch (e) {
      console.log("Confetti trigger:", e);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }

    setIsProcessing(true);

    const effectiveCity = city === "Other City" ? customCity || "Pakistan" : city;
    const orderId = `AR-${Date.now().toString().slice(-6)}`;
    const fullAddress = `${address.trim()}, ${effectiveCity}`;

    const orderPayload = {
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: "",
      deliveryAddress: fullAddress,
      city: effectiveCity,
      deliveryNotes: deliveryNotes.trim(),
      paymentMethod: currentPaymentMethod.name,
      tidNumber: selectedMethodId !== "cod" ? tidNumber.trim() : "",
      subtotal,
      deliveryFee,
      promoDiscount,
      totalAmount: finalTotal,
      items: cartItems.map((it) => ({
        product: it.product,
        selectedSizeIndex: it.selectedSizeIndex,
        quantity: it.quantity,
        price: it.product.sizes[it.selectedSizeIndex]?.price || 0,
      })),
      date: new Date().toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    // Play chime sound and trigger desktop alert
    NotificationManager.notify("🎉 New Order Received!", {
      body: `Order #${orderId} by ${orderPayload.customerName} for Rs. ${orderPayload.totalAmount}`,
    });

    setCompletedOrder(orderPayload);
    setIsSuccess(true);
    triggerConfetti();
    onOrderSuccess(orderPayload);
    setIsProcessing(false);
  };

  const handleCopyTracking = () => {
    if (completedOrder?.orderId) {
      navigator.clipboard.writeText(completedOrder.orderId);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const generateWhatsAppUrl = () => {
    if (!completedOrder) return "";
    const itemsText = cartItems
      .map((it) => {
        const size = it.product.sizes[it.selectedSizeIndex]?.size || "Standard";
        return `• ${it.product.name} (${size}) x ${it.quantity}`;
      })
      .join("\n");

    const message = `🌿 *NEW ORDER PLACED at ${storeConfig.brandName}*\n\n` +
      `*Order ID:* #${completedOrder.orderId}\n` +
      `*Customer:* ${customerName}\n` +
      `*Phone:* ${customerPhone}\n` +
      `*Address:* ${completedOrder.deliveryAddress}\n\n` +
      `*Items Ordered:*\n${itemsText}\n\n` +
      `*Total Amount:* Rs. ${finalTotal} (${completedOrder.paymentMethod})\n` +
      (deliveryNotes ? `*Note:* ${deliveryNotes}\n` : "") +
      `\nHello! I have placed this Cash on Delivery order. Please confirm dispatch.`;

    const cleanNumber = (storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white text-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div 
          className="p-5 sm:p-6 text-white flex items-center justify-between border-b"
          style={{ backgroundColor: "var(--theme-header-bg, #0f172a)" }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                {isSuccess ? "Order Confirmed / آرڈر مکمل ہو گیا" : "WordPress Easy Checkout / آسان آرڈر چیک آؤٹ"}
              </h2>
              <p className="text-xs text-stone-300">
                {isSuccess ? "Your order has been registered" : "Cash on Delivery · Pay when you receive"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-sm">
          
          {/* SUCCESS SCREEN */}
          {isSuccess && completedOrder ? (
            <div className="text-center space-y-6 py-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  Order Successfully Placed
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Thank You, {customerName}!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                  آپ کا کیش آن ڈیلیوری آرڈر موصول ہو چکا ہے۔ پارسل کی ترسیل کے وقت رقم ادا کریں۔
                </p>
              </div>

              {/* Order Details summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <span className="text-[11px] text-stone-500 font-bold block">Order ID</span>
                    <span className="font-mono text-lg font-bold text-stone-900">
                      #{completedOrder.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-stone-100 cursor-pointer"
                  >
                    {copiedTracking ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 font-medium">Customer:</span>
                    <p className="font-bold text-stone-900">{customerName}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Phone:</span>
                    <p className="font-bold text-stone-900">{customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500 font-medium">Address:</span>
                    <p className="text-stone-800">{completedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Payment:</span>
                    <p className="font-bold text-emerald-700">{completedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Total:</span>
                    <p className="font-bold text-base text-stone-900">Rs. {finalTotal}</p>
                  </div>
                </div>
              </div>

              {/* PROMINENT WHATSAPP SEND BUTTON */}
              <div className="max-w-lg mx-auto space-y-3">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] ring-4 ring-emerald-400/50 animate-pulse text-base cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>واٹس ایپ پر آرڈر بھیجیں (Send on WhatsApp)</span>
                </a>
                <p className="text-xs text-stone-500">
                  ⚡ فوری تصدیق اور جلد پارسل روانگی کے لیے واٹس ایپ پر آرڈر شیئر کریں۔
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-4">
                {onOpenOrderTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrderTracking(completedOrder.orderId);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Track This Order / آرڈر ٹریک کریں
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-stone-600 hover:underline cursor-pointer"
                >
                  Close / بند کریں
                </button>
              </div>
            </div>
          ) : (
            /* SINGLE-PAGE WORDPRESS CHECKOUT FORM */
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Delivery Details (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Delivery Address / ترسیل کی تفصیلات
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name / پورا نام <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="e.g. Muhammad Ali"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        placeholder="e.g. 0300 1234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Delivery Address / گھر کا مکمل پتہ اور گلی <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <textarea
                      id="checkout-address"
                      required
                      rows={2}
                      placeholder="e.g. House # 45, Street # 3, Sector G-10/2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      City / شہر <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="checkout-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {city === "Other City" && (
                      <input
                        type="text"
                        placeholder="Enter your city name"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="mt-2 w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Special Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver before 5 PM"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    Payment Method / طریقہ ادائیگی:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMethodId("cod")}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        selectedMethodId === "cod"
                          ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs">Cash on Delivery</span>
                          {selectedMethodId === "cod" && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        </div>
                        <span className="text-[11px] text-stone-600 block">پارسل ملنے پر رقم دیں</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethodId("easypaisa")}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        selectedMethodId !== "cod"
                          ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs">Online Transfer</span>
                          {selectedMethodId !== "cod" && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        </div>
                        <span className="text-[11px] text-stone-600 block">EasyPaisa / JazzCash / Bank</span>
                      </div>
                    </button>
                  </div>

                  {selectedMethodId !== "cod" && (
                    <div className="mt-3 bg-stone-900 text-stone-100 p-3.5 rounded-2xl space-y-2 text-xs animate-fadeIn">
                      <p className="font-bold text-stone-200">Account Details for Transfer:</p>
                      {storeConfig.paymentMethods.filter(p => p.active && p.id !== "cod").slice(0, 2).map((pm) => (
                        <div key={pm.id} className="bg-stone-800 p-2 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{pm.name} ({pm.accountTitle})</span>
                            <span className="text-emerald-400 font-mono">{pm.accountNumber}</span>
                          </div>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="TID Number (Optional / or send on WhatsApp)"
                        value={tidNumber}
                        onChange={(e) => setTidNumber(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-white text-xs mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Review & Total (5 Cols) */}
              <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <h3 className="font-serif font-bold text-sm text-stone-900">
                      Order Summary ({cartItems.length} items)
                    </h3>
                  </div>

                  {/* Cart Items list */}
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                    {cartItems.map((item, idx) => {
                      const sz = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
                      return (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-100">
                          <div>
                            <p className="font-bold text-stone-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-[10px] text-stone-500">Size: {sz?.size} x {item.quantity}</p>
                          </div>
                          <span className="font-bold text-stone-900 shrink-0">
                            Rs. {(sz?.price || 0) * item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-stone-900">Rs. {subtotal}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount ({appliedPromo}):</span>
                        <span>-Rs. {promoDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold text-stone-900">
                        {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline">
                      <span className="font-bold text-sm text-stone-900">Total Payable:</span>
                      <span className="font-serif text-xl font-bold text-emerald-800">
                        Rs. {finalTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-98 text-sm cursor-pointer"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>
                      {isProcessing
                        ? "Booking Order..."
                        : `Place Order (Cash on Delivery)`}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Pure Guaranteed · Pay Upon Delivery</span>
                  </div>
                </div>

              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
