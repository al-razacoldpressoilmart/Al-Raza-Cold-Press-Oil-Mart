import React, { useState, useEffect, useRef } from "react";
import { 
  Truck, 
  ShoppingBag, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle, 
  Copy, 
  Check, 
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  PackageCheck,
  CreditCard,
  Banknote
} from "lucide-react";
import confetti from "canvas-confetti";
import { Product } from "../types";
import { StoreConfig } from "../data/storeConfig";
import { NotificationManager } from "../utils/NotificationManager";

interface WordPressOrderFormProps {
  products: Product[];
  onOrderSuccess: (orderData: any) => void;
  storeConfig: StoreConfig;
  preSelectedProduct?: { product: Product; sizeIndex: number } | null;
  onClearPreSelected?: () => void;
}

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
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
  "Gujrat",
  "Mardan",
  "Rahim Yar Khan",
  "Sheikhupura",
  "Other City"
];

interface OrderItemLine {
  productId: string;
  sizeIndex: number;
  quantity: number;
}

export const WordPressOrderForm: React.FC<WordPressOrderFormProps> = ({
  products,
  onOrderSuccess,
  storeConfig,
  preSelectedProduct,
  onClearPreSelected,
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Items in the simple form
  const [items, setItems] = useState<OrderItemLine[]>(() => {
    if (products.length > 0) {
      return [{ productId: products[0].id, sizeIndex: 0, quantity: 1 }];
    }
    return [];
  });

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [customCity, setCustomCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Payment
  const [paymentType, setPaymentType] = useState<"cod" | "online">("cod");
  const [selectedOnlineMethodId, setSelectedOnlineMethodId] = useState<string>("easypaisa");
  const [onlineTid, setOnlineTid] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // If a product was clicked with "Buy Now / فوری آرڈر", update the form and scroll to it
  useEffect(() => {
    if (preSelectedProduct && preSelectedProduct.product) {
      setItems([
        {
          productId: preSelectedProduct.product.id,
          sizeIndex: preSelectedProduct.sizeIndex,
          quantity: 1,
        },
      ]);
      setCompletedOrder(null);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      onClearPreSelected?.();
    }
  }, [preSelectedProduct, onClearPreSelected]);

  // Calculations
  const calculatedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId) || products[0];
    const sizeOpt = product?.sizes[item.sizeIndex] || product?.sizes[0] || {
      size: "500ml",
      price: 1000,
      originalPrice: 1200,
      inStock: true,
    };
    return {
      product,
      sizeOpt,
      sizeIndex: item.sizeIndex,
      quantity: item.quantity,
      lineTotal: (sizeOpt.price || 0) * item.quantity,
    };
  });

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.lineTotal, 0);
  const freeThreshold = storeConfig.freeDeliveryThreshold ?? 2500;
  const isFreeDelivery = Boolean(
    storeConfig.enableFreeDeliveryAboveThreshold && subtotal >= freeThreshold
  );
  const deliveryFee = isFreeDelivery || subtotal === 0 ? 0 : storeConfig.deliveryFee ?? 150;
  const finalTotal = subtotal + deliveryFee;

  const handleUpdateItemProduct = (index: number, newProductId: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { productId: newProductId, sizeIndex: 0, quantity: next[index].quantity };
      return next;
    });
  };

  const handleUpdateItemSize = (index: number, newSizeIndex: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], sizeIndex: newSizeIndex };
      return next;
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const newQty = Math.max(1, next[index].quantity + delta);
      next[index] = { ...next[index], quantity: newQty };
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems((prev) => [...prev, { productId: products[0].id, sizeIndex: 0, quantity: 1 }]);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#16a34a", "#22c55e", "#d97706", "#f59e0b"],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }

    setIsSubmitting(true);

    const effectiveCity = city === "Other City" ? customCity || "Pakistan" : city;
    const orderId = `AR-${Date.now().toString().slice(-6)}`;
    const chosenMethodName =
      paymentType === "cod"
        ? "Cash on Delivery"
        : storeConfig.paymentMethods.find((p) => p.id === selectedOnlineMethodId)?.name ||
          "Online Transfer";

    const formattedItems = calculatedItems.map((it) => ({
      product: it.product,
      selectedSizeIndex: it.sizeIndex,
      quantity: it.quantity,
      price: it.sizeOpt.price,
    }));

    const orderPayload = {
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: "",
      deliveryAddress: `${address.trim()}, ${effectiveCity}`,
      city: effectiveCity,
      deliveryNotes: deliveryNotes.trim(),
      paymentMethod: chosenMethodName,
      tidNumber: paymentType === "online" ? onlineTid.trim() : "",
      subtotal,
      deliveryFee,
      promoDiscount: 0,
      totalAmount: finalTotal,
      items: formattedItems,
      date: new Date().toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    // Trigger chime and desktop push alert
    NotificationManager.notify("🎉 New Order Received!", {
      body: `Order #${orderId} by ${orderPayload.customerName} for Rs. ${orderPayload.totalAmount}`,
    });

    // Save order in parent
    onOrderSuccess(orderPayload);
    triggerConfetti();

    setCompletedOrder(orderPayload);
    setIsSubmitting(false);

    // Scroll to success box
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyOrderId = () => {
    if (!completedOrder?.orderId) return;
    navigator.clipboard.writeText(completedOrder.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const generateWhatsAppUrl = () => {
    if (!completedOrder) return "";
    const itemsList = completedOrder.items
      .map((it: any) => {
        const sz = it.product?.sizes?.[it.selectedSizeIndex]?.size || "Standard";
        return `• ${it.product?.name} (${sz}) x ${it.quantity} = Rs. ${it.price * it.quantity}`;
      })
      .join("\n");

    const message =
      `🌿 *NEW ORDER DETAILS (${storeConfig.brandName})*\n\n` +
      `*Order ID:* #${completedOrder.orderId}\n` +
      `*Customer:* ${completedOrder.customerName}\n` +
      `*Phone:* ${completedOrder.customerPhone}\n` +
      `*Address:* ${completedOrder.deliveryAddress}\n\n` +
      `*Ordered Items:*\n${itemsList}\n\n` +
      `*Total Amount:* Rs. ${completedOrder.totalAmount} (${completedOrder.paymentMethod})\n` +
      (completedOrder.deliveryNotes ? `*Note:* ${completedOrder.deliveryNotes}\n` : "") +
      `\nAssalam o Alaikum! I have placed this Cash on Delivery order on your website. Please confirm dispatch.`;

    const cleanNum = (storeConfig.whatsappNumber || "923292832225").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  };

  const handleResetForm = () => {
    setCompletedOrder(null);
    setCustomerName("");
    setCustomerPhone("");
    setAddress("");
    setDeliveryNotes("");
    setOnlineTid("");
    if (products.length > 0) {
      setItems([{ productId: products[0].id, sizeIndex: 0, quantity: 1 }]);
    }
  };

  return (
    <section 
      id="order-form" 
      ref={formRef}
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-bg-secondary, #ffffff)",
        borderColor: "var(--theme-border, #e2e8f0)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* If Order is Placed: Highlight WhatsApp Screen */}
        {completedOrder ? (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Order Received Successfully / آرڈر موصول ہو گیا ہے
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
                Thank You, {completedOrder.customerName}!
              </h2>
              <p className="text-emerald-800 text-sm mt-1 max-w-lg mx-auto">
                آپ کا آرڈر سسٹم میں درج ہو چکا ہے۔ ہمارا نمائندہ آپ سے رابطہ کر کے پارسل روانہ کر دے گا۔
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm text-left max-w-xl mx-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">Order Tracking ID:</span>
                  <span className="font-mono text-lg font-bold text-stone-900">
                    #{completedOrder.orderId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedOrderId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
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
                  <span className="text-stone-500 font-semibold block">Customer Name:</span>
                  <span className="font-bold text-stone-900">{completedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block">Phone Number:</span>
                  <span className="font-bold text-stone-900">{completedOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-500 font-semibold block">Delivery Address:</span>
                  <span className="text-stone-900">{completedOrder.deliveryAddress}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block">Payment Method:</span>
                  <span className="font-bold text-emerald-800">{completedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-semibold block">Total Amount:</span>
                  <span className="font-bold text-lg text-emerald-900">Rs. {completedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-500 font-semibold block mb-1">Items Summary:</span>
                <ul className="space-y-1">
                  {completedOrder.items.map((it: any, idx: number) => {
                    const sz = it.product?.sizes?.[it.selectedSizeIndex]?.size || "";
                    return (
                      <li key={idx} className="flex justify-between text-stone-700">
                        <span>• {it.product?.name} ({sz}) x {it.quantity}</span>
                        <span className="font-semibold">Rs. {it.price * it.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* MANDATORY PROMINENT WHATSAPP SEND BUTTON */}
            <div className="max-w-xl mx-auto space-y-3">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-98 ring-4 ring-emerald-400/50 animate-pulse text-base sm:text-lg cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>واٹس ایپ پر آرڈر بھیجیں (Send Details on WhatsApp)</span>
              </a>
              <p className="text-xs text-stone-600">
                ⚡ کلک کر کے فوری طور پر اپنے آرڈر کی تصدیق واٹس ایپ پر حاصل کریں تاکہ پارسل فوری روانہ کیا جا سکے۔
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-200">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-emerald-900 hover:text-emerald-700 text-xs font-bold underline cursor-pointer"
              >
                Place Another Order / نیا آرڈر بک کریں
              </button>
            </div>
          </div>
        ) : (
          /* THE CLEAN WORDPRESS ORDER FORM */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
            
            {/* Form Top Banner */}
            <div 
              className="p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ backgroundColor: "var(--theme-header-bg, #0f172a)" }}
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WordPress Quick Order Form / آسان کیش آن ڈیلیوری فارم</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                  Cash on Delivery Order Form
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm mt-1">
                  نیچے دیا گیا فارم پُر کر کے فوری آرڈر بک کریں۔ رقم پارسل وصول کرتے وقت ادا کریں۔
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="block font-bold text-white">Cash on Delivery</span>
                  <span className="text-stone-300 text-[11px]">All Over Pakistan</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-8">
              
              {/* STEP 1: PRODUCT SELECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Select Your Products / پروڈکٹ کا انتخاب کریں
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    100% Pure Cold Pressed
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const product = products.find((p) => p.id === item.productId) || products[0];
                    const sizeOpt = product?.sizes[item.sizeIndex] || product?.sizes[0];

                    return (
                      <div 
                        key={idx}
                        className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Product Picker */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            Pure Oil / تیل منتخب کریں:
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleUpdateItemProduct(idx, e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.nativeName ? `(${p.nativeName})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Size Picker */}
                        <div className="w-full md:w-48">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            Bottle Size / سائز:
                          </label>
                          <select
                            value={item.sizeIndex}
                            onChange={(e) => handleUpdateItemSize(idx, Number(e.target.value))}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {product?.sizes.map((s, sIdx) => (
                              <option key={sIdx} value={sIdx}>
                                {s.size} — Rs. {s.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Counter */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            Quantity / تعداد:
                          </label>
                          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-stone-500 block">Total</span>
                            <span className="font-bold text-emerald-800 text-base">
                              Rs. {(sizeOpt?.price || 0) * item.quantity}
                            </span>
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 border border-dashed border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Oil / مزید آئل شامل کریں</span>
                </button>
              </div>

              {/* STEP 2: CUSTOMER INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Delivery Address & Information / ڈیلیوری کی معلومات
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name / آپ کا پورا نام <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        id="order-form-name"
                        type="text"
                        required
                        placeholder="e.g. Muhammad Usman"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      WhatsApp / Mobile Number / موبائل نمبر <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        id="order-form-phone"
                        type="tel"
                        required
                        placeholder="e.g. 0300 1234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Complete Delivery Address / گھر کا مکمل پتہ اور گلی، مکان نمبر <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <textarea
                      id="order-form-address"
                      required
                      rows={2}
                      placeholder="e.g. House # 12, Street # 5, Block B, Model Town"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      City / شہر <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="order-form-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
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
                      Special Delivery Instructions / خصوصی ہدایات (اختیاری)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery, deliver in afternoon"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: PAYMENT METHOD */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Payment Method / طریقہ ادائیگی
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("cod")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentType === "cod"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                        : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">
                          Cash on Delivery (COD)
                        </span>
                        {paymentType === "cod" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        )}
                      </div>
                      <span className="text-xs text-stone-600 block mt-0.5">
                        کیش آن ڈیلیوری - پارسل ملنے پر رقم ادا کریں۔
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("online")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentType === "online"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                        : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">
                          EasyPaisa / JazzCash / Bank
                        </span>
                        {paymentType === "online" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        )}
                      </div>
                      <span className="text-xs text-stone-600 block mt-0.5">
                        آن لائن پیمنٹ ٹرانسفر (اختیاری)
                      </span>
                    </div>
                  </button>
                </div>

                {/* Online Payment Details Box if selected */}
                {paymentType === "online" && (
                  <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl space-y-3 animate-fadeIn text-xs">
                    <p className="font-bold text-stone-200">
                      Select Account for Transfer:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {storeConfig.paymentMethods
                        .filter((pm) => pm.active && pm.id !== "cod")
                        .map((pm) => (
                          <div
                            key={pm.id}
                            onClick={() => setSelectedOnlineMethodId(pm.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedOnlineMethodId === pm.id
                                ? "border-emerald-400 bg-stone-800"
                                : "border-stone-700 bg-stone-800/50 hover:bg-stone-800"
                            }`}
                          >
                            <span className="font-bold text-white block">{pm.name}</span>
                            <span className="text-stone-300 block">{pm.accountTitle}</span>
                            <span className="text-emerald-400 font-mono font-bold block">
                              {pm.accountNumber}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div>
                      <label className="block text-stone-300 mb-1">
                        Transaction ID (TID) / اختیاری رسید نمبر:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234567890 (or send on WhatsApp after ordering)"
                        value={onlineTid}
                        onChange={(e) => setOnlineTid(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: ORDER SUMMARY & SUBMIT */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 font-medium">Subtotal ({calculatedItems.length} items):</span>
                  <span className="font-bold text-stone-900">Rs. {subtotal}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-600 font-medium">Delivery Charges:</span>
                    {isFreeDelivery && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        FREE Delivery
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-stone-900">
                    {deliveryFee === 0 ? "FREE (مفت)" : `Rs. ${deliveryFee}`}
                  </span>
                </div>

                {!isFreeDelivery && subtotal > 0 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                    💡 مزید Rs. {Math.max(0, freeThreshold - subtotal)} کی خریداری پر ہوم ڈیلیوری بالکل مفت حاصل کریں!
                  </p>
                )}

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-base font-bold text-stone-900">
                    Total Payable Amount / کل رقم:
                  </span>
                  <span className="text-2xl font-serif font-bold text-emerald-800">
                    Rs. {finalTotal}
                  </span>
                </div>

                {/* BIG CONFIRM ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting || subtotal === 0}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-98 text-base sm:text-lg cursor-pointer"
                >
                  <PackageCheck className="w-6 h-6" />
                  <span>
                    {isSubmitting
                      ? "Booking Order..."
                      : `Confirm Order / آرڈر مکمل کریں (Rs. ${finalTotal})`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 text-[11px] text-stone-500 font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Pure Guaranteed</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2-3 Days Fast Delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>
    </section>
  );
};
