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
import { sendOrderEmailNotification, generateOrderWhatsAppUrl } from "../services/notificationService";
import { Language, TRANSLATIONS } from "../utils/translations";

interface WordPressOrderFormProps {
  products: Product[];
  onOrderSuccess: (orderData: any) => void;
  storeConfig: StoreConfig;
  preSelectedProduct?: { product: Product; sizeIndex: number } | null;
  onClearPreSelected?: () => void;
  language?: Language;
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
  language = "ur",
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];
  const isUrdu = language === "ur";

  // Items in the form
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

  // Group products by category for clean dropdown
  const oilProducts = products.filter(p => p.category === "oils" || p.category === "cooking" || p.category === "wellness" || p.category === "beauty");
  const spiceProducts = products.filter(p => p.category === "spices");
  const flourProducts = products.filter(p => p.category === "flour");

  // Calculations
  const calculatedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId) || products[0];
    const sizeOpt = (Array.isArray(product?.sizes) && (product.sizes[item.sizeIndex] || product.sizes[0])) || {
      size: "Pack",
      price: 500,
      originalPrice: 600,
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
        colors: ["#15803d", "#22c55e", "#d97706", "#f59e0b"],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      alert(isUrdu ? "براہ کرم اپنا نام، موبائل نمبر اور گھر کا پتہ درج کریں۔" : "Please fill in your Name, Phone Number, and Delivery Address.");
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

    // 1. Dispatch real-time email notification directly to owner Gmail (tshirtsprintingworld@gmail.com)
    sendOrderEmailNotification(orderPayload, storeConfig).catch((err) => {
      console.warn("WordPress form email notification error:", err);
    });

    // Save order in parent
    onOrderSuccess(orderPayload);
    triggerConfetti();

    setCompletedOrder(orderPayload);
    setIsSubmitting(false);

    // 2. Automatically prompt opening WhatsApp message to owner (03292832225)
    setTimeout(() => {
      try {
        const waUrl = generateOrderWhatsAppUrl(orderPayload, storeConfig);
        window.open(waUrl, "_blank");
      } catch {
        // Popups might be blocked on mobile browsers; button remains on screen
      }
    }, 400);

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
    return generateOrderWhatsAppUrl(completedOrder, storeConfig);
  };

  const handleResetForm = () => {
    setCompletedOrder(null);
    setCustomerName("");
    setCustomerPhone("");
    setAddress("");
    setDeliveryNotes("");
    setItems([{ productId: products[0]?.id || "", sizeIndex: 0, quantity: 1 }]);
  };

  return (
    <section 
      id="order-form" 
      ref={formRef}
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200 transition-colors duration-200"
    >
      <div className="max-w-4xl mx-auto">
        
        {/* If Order is Placed: Highlight WhatsApp Screen */}
        {completedOrder ? (
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                {isUrdu ? "آرڈر کامیابی سے بک ہو گیا ہے!" : "Order Placed Successfully!"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isUrdu ? `شکریہ جناب ${completedOrder.customerName} صاحب!` : `Thank You, ${completedOrder.customerName}!`}
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-lg mx-auto">
                {isUrdu 
                  ? "آپ کا آرڈر موصول ہو چکا ہے۔ پارسل کی فوری ترسیل کے لیے نیچے دیے گئے بٹن پر کلک کر کے واٹس ایپ پر کنفرم فرمائیں۔"
                  : "Your order has been recorded. Click the button below to confirm with our dispatch team on WhatsApp for fastest delivery."
                }
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs text-left max-w-xl mx-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">{t.orderIdLabel}:</span>
                  <span className="font-mono text-lg font-bold text-slate-900">
                    #{completedOrder.orderId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  {copiedOrderId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isUrdu ? "کاپی ہو گیا!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isUrdu ? "نمبر کاپی کریں" : "Copy ID"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">{t.fullNameLabel}:</span>
                  <span className="font-bold text-slate-900">{completedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">{t.phoneLabel}:</span>
                  <span className="font-bold text-slate-900">{completedOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">{t.addressLabel}:</span>
                  <span className="text-slate-900">{completedOrder.deliveryAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">ادائیگی کا طریقہ:</span>
                  <span className="font-bold text-emerald-700">{completedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">{t.totalPayable}:</span>
                  <span className="font-extrabold text-lg text-emerald-700">Rs. {completedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold block mb-1">اشیاء کی تفصیل:</span>
                <ul className="space-y-1">
                  {completedOrder.items.map((it: any, idx: number) => {
                    const sz = it.product?.sizes?.[it.selectedSizeIndex]?.size || "";
                    return (
                      <li key={idx} className="flex justify-between text-slate-700">
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
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-98 ring-4 ring-emerald-400/40 text-base sm:text-lg cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>{t.confirmOnWhatsApp} (WhatsApp)</span>
              </a>
              <p className="text-xs text-slate-500">
                {isUrdu 
                  ? "⚡ بٹن پر کلک کر کے واٹس ایپ پر آرڈر میسج بھیجیں تاکہ پارسل اسی وقت پیک کر کے روانہ کیا جا سکے۔"
                  : "⚡ Click above to send order details via WhatsApp for immediate priority dispatch."
                }
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-bold underline cursor-pointer"
              >
                {isUrdu ? "نیا آرڈر بک کریں" : "Place Another Order"}
              </button>
            </div>
          </div>
        ) : (
          /* THE CLEAN WORDPRESS COD ORDER FORM */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            
            {/* Form Top Header */}
            <div className="p-6 sm:p-8 bg-emerald-700 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isUrdu ? "فوری کیش آن ڈیلیوری فارم" : "Quick Cash on Delivery Form"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  {t.orderFormTitle}
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                  {t.orderFormSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 bg-emerald-800/80 px-4 py-2.5 rounded-2xl border border-emerald-600 text-xs">
                <Truck className="w-5 h-5 text-emerald-200 shrink-0" />
                <div>
                  <span className="block font-bold text-white">{isUrdu ? "کیش آن ڈیلیوری" : "Cash on Delivery"}</span>
                  <span className="text-emerald-200 text-[11px]">{isUrdu ? "پورے پاکستان میں" : "Across Pakistan"}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-8">
              
              {/* STEP 1: PRODUCT SELECTION WITH CATEGORY OPTGROUPS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">
                      {isUrdu ? "اشیاء کا انتخاب کریں (تیل، مصالحہ جات یا آٹا)" : "Select Products (Oils, Spices or Flour)"}
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    100% Pure & Organic
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const product = products.find((p) => p.id === item.productId) || products[0];
                    const sizeOpt = (Array.isArray(product?.sizes) && (product.sizes[item.sizeIndex] || product.sizes[0])) || {
                      size: "Pack",
                      price: 500,
                      originalPrice: 600,
                      inStock: true,
                    };

                    return (
                      <div 
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Product Picker */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {t.selectProductLabel}:
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleUpdateItemProduct(idx, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {oilProducts.length > 0 && (
                              <optgroup label={isUrdu ? "خالص تیل جات (Pure Oils)" : "Pure Oils"}>
                                {oilProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {isUrdu ? `${p.name} (${p.nativeName.split("(")[0].trim()})` : p.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {spiceProducts.length > 0 && (
                              <optgroup label={isUrdu ? "خالص مصالحہ جات (Spices & Masalajat)" : "Spices & Masalajat"}>
                                {spiceProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {isUrdu ? `${p.name} (${p.nativeName.split("(")[0].trim()})` : p.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {flourProducts.length > 0 && (
                              <optgroup label={isUrdu ? "چکی کا آٹا اور اناج (Stone-Ground Flour & Grains)" : "Stone-Ground Flour & Grains"}>
                                {flourProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {isUrdu ? `${p.name} (${p.nativeName.split("(")[0].trim()})` : p.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        {/* Size Picker */}
                        <div className="w-full md:w-48">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {t.selectSizeLabel}:
                          </label>
                          <select
                            value={item.sizeIndex}
                            onChange={(e) => handleUpdateItemSize(idx, Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {(Array.isArray(product?.sizes) ? product.sizes : []).map((s, sIdx) => (
                              <option key={sIdx} value={sIdx}>
                                {s.size} — Rs. {s.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Counter */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {t.quantityLabel}:
                          </label>
                          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Total</span>
                            <span className="font-extrabold text-emerald-800 text-base">
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
                  <span>{isUrdu ? "+ مزید چیز شامل کریں (Add Another Item)" : "+ Add Another Product"}</span>
                </button>
              </div>

              {/* STEP 2: CUSTOMER INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {isUrdu ? "ڈیلیوری کی معلومات" : "Delivery Address & Contact Details"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.fullNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="order-form-name"
                        type="text"
                        required
                        placeholder={isUrdu ? "مثلاً محمد عثمان" : "e.g. Muhammad Usman"}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.phoneLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="order-form-phone"
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.addressLabel} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      id="order-form-address"
                      required
                      rows={2}
                      placeholder={isUrdu ? "مکان نمبر، گلی، محلہ، نزدیکی مشہور جگہ" : "House #, Street #, Sector / Area"}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.cityLabel} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="order-form-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        className="mt-2 w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.notesLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={isUrdu ? "مثلاً ڈیلیوری سے پہلے فون کریں" : "e.g. Call before delivery"}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: PAYMENT METHOD */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {isUrdu ? "طریقہ ادائیگی" : "Payment Method"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("cod")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentType === "cod"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {isUrdu ? "کیش آن ڈیلیوری (COD)" : "Cash on Delivery"}
                        </span>
                        {paymentType === "cod" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        )}
                      </div>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        {t.codNotice}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("online")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentType === "online"
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          EasyPaisa / JazzCash / Bank
                        </span>
                        {paymentType === "online" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        )}
                      </div>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        {isUrdu ? "آن لائن ٹرانسفر (اختیاری)" : "Online Transfer (Optional)"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Online Payment Details Box if selected */}
                {paymentType === "online" && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 text-xs">
                    <p className="font-bold text-slate-200">
                      {isUrdu ? "اکاؤنٹ منتخب کریں:" : "Select Account for Payment:"}
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
                                ? "border-emerald-400 bg-slate-800"
                                : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"
                            }`}
                          >
                            <span className="font-bold text-white block">{pm.name}</span>
                            <span className="text-slate-300 block">{pm.accountTitle}</span>
                            <span className="text-emerald-400 font-mono font-bold block">
                              {pm.accountNumber}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">
                        {isUrdu ? "رسید نمبر (TID / Trx ID) - اختیاری:" : "Transaction ID (TID) - Optional:"}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234567890"
                        value={onlineTid}
                        onChange={(e) => setOnlineTid(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: ORDER SUMMARY & SUBMIT */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">
                    {t.subtotal} ({calculatedItems.length} items):
                  </span>
                  <span className="font-bold text-slate-900">Rs. {subtotal}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">{t.deliveryFee}:</span>
                    {isFreeDelivery && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        FREE Delivery
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? `${t.free}` : `Rs. ${deliveryFee}`}
                  </span>
                </div>

                {!isFreeDelivery && subtotal > 0 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2 font-medium">
                    {isUrdu 
                      ? `💡 مزید Rs. ${Math.max(0, freeThreshold - subtotal)} کی خریداری پر ہوم ڈیلیوری بالکل مفت حاصل کریں!`
                      : `💡 Add Rs. ${Math.max(0, freeThreshold - subtotal)} more for FREE Home Delivery!`
                    }
                  </p>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    {t.totalPayable}:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    Rs. {finalTotal}
                  </span>
                </div>

                {/* BIG CONFIRM ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting || subtotal === 0}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-98 text-base sm:text-lg cursor-pointer disabled:opacity-50"
                >
                  <PackageCheck className="w-6 h-6" />
                  <span>
                    {isSubmitting
                      ? (isUrdu ? "آرڈر بک ہو رہا ہے..." : "Booking Order...")
                      : `${t.submitOrder} (Rs. ${finalTotal})`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? "100% خالص ضمانت" : "100% Pure Guarantee"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? "تیز رفتار ترسیل" : "Fast Delivery"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? "کیش آن ڈیلیوری" : "Cash on Delivery"}</span>
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
