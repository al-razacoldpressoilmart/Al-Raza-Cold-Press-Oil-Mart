import React, { useState } from "react";
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
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Phone,
  FileCheck,
  PackageCheck
} from "lucide-react";
import { CartItem } from "../types";
import { StoreConfig, PaymentMethodConfig } from "../data/storeConfig";
import { compressImageFile } from "../utils/imageCompressor";

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
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  
  // Customer details state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Payment state
  const activePaymentMethods = storeConfig.paymentMethods.filter((pm) => pm.active);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    activePaymentMethods[0]?.id || "easypaisa"
  );
  const [tidNumber, setTidNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedAccountNo, setCopiedAccountNo] = useState(false);
  const [paymentValidationError, setPaymentValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPaymentMethod = activePaymentMethods.find((pm) => pm.id === selectedMethodId) || activePaymentMethods[0];
  const requiresProof = currentPaymentMethod?.requiresProof !== false;

  const subtotal = cartItems.reduce((sum, item) => {
    const sizeOpt = item.product.sizes[item.selectedSizeIndex] || item.product.sizes[0];
    return sum + sizeOpt.price * item.quantity;
  }, 0);

  // Dynamic delivery charge calculation from store owner settings
  const freeDeliveryThreshold = storeConfig.freeDeliveryThreshold ?? 2500;
  const isFreeDelivery = Boolean(storeConfig.enableFreeDeliveryAboveThreshold && subtotal >= freeDeliveryThreshold);
  const deliveryFee = isFreeDelivery || subtotal === 0 ? 0 : (storeConfig.deliveryFee ?? 150);
  const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#b45309", "#d97706", "#059669", "#fbbf24"],
      });
    } catch (e) {
      console.log("Confetti trigger:", e);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) return;
    setStep("payment");
  };

  // Image Upload Handler for Payment Screenshot (compressed < 80KB)
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFileName(file.name);
      try {
        const compressed = await compressImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.72 });
        setScreenshotFile(compressed);
        setPaymentValidationError(null);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotFile(reader.result as string);
          setPaymentValidationError(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePlaceOrder = async () => {
    // Validation check: if online payment, must have TID & Screenshot
    if (requiresProof) {
      if (!tidNumber.trim()) {
        setPaymentValidationError("Please enter your Transaction ID (TID) number from your payment receipt.");
        return;
      }
      if (!screenshotFile) {
        setPaymentValidationError("Please upload or attach your payment screenshot receipt before placing order.");
        return;
      }
    }

    setIsProcessing(true);
    setPaymentValidationError(null);

    const orderId = `AR-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemsSummary = cartItems
      .map((it) => {
        const sizeOpt = it.product.sizes[it.selectedSizeIndex] || it.product.sizes[0];
        return `${it.product.name} (${sizeOpt.size}) x${it.quantity}`;
      })
      .join(", ");

    const orderPayload = {
      id: orderId,
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress: `${address}, ${city || storeConfig.city || "Pakistan"} ${pincode ? `- ${pincode}` : ""}`,
      deliveryAddress: `${address}, ${city || storeConfig.city || "Pakistan"} ${pincode ? `- ${pincode}` : ""}`,
      city: city || storeConfig.city || "Pakistan",
      items: cartItems.map((it) => ({
        productId: it.product.id,
        name: it.product.name,
        size: it.product.sizes[it.selectedSizeIndex]?.size || "500ml",
        price: it.product.sizes[it.selectedSizeIndex]?.price || 0,
        quantity: it.quantity,
      })),
      itemsSummary,
      subtotal,
      deliveryFee,
      promoDiscount,
      totalAmount: finalTotal,
      promoCode: appliedPromo || localStorage.getItem("alraza_referral_code") || "",
      referralCode: appliedPromo || localStorage.getItem("alraza_referral_code") || "",
      affiliatePayoutStatus: "pending",
      paymentMethod: currentPaymentMethod?.name || selectedMethodId,
      paymentStatus: requiresProof ? "pending" : "pending",
      status: "confirmed", // Initial status: confirmed & queued for pressing/dispatch
      tidNumber: requiresProof ? tidNumber : "COD",
      screenshotUrl: screenshotFile,
      specialInstructions: deliveryNotes,
      notes: deliveryNotes,
      courierName: "",
      trackingNumber: "",
      createdAt: new Date().toISOString(),
    };

    try {
      // Save locally to orders history
      const existingOrders = JSON.parse(localStorage.getItem("alraza_orders") || "[]");
      const updatedOrders = [orderPayload, ...existingOrders.filter((o: any) => (o.id || o.orderId) !== orderId)];
      localStorage.setItem("alraza_orders", JSON.stringify(updatedOrders));

      // Attempt API call if server is running
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      }).catch(() => {});

      // Send silent email notification to owner via free FormSubmit API
      const ownerEmail = storeConfig.notificationEmail || storeConfig.email || "tshirtsprintingworld@gmail.com";
      fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Order Received - ${orderId} - Al Raza Mart`,
          Customer: customerName,
          Phone: customerPhone,
          Address: `${address}, ${city}`,
          Payment_Method: currentPaymentMethod?.name || selectedMethodId,
          Total_Amount: `Rs. ${finalTotal}`,
          Order_Details: cartItems.map((it) => `${it.product.name} (${it.product.sizes[it.selectedSizeIndex]?.size}) x ${it.quantity}`).join(" | ")
        })
      }).catch(() => { /* silent fail if network error */ });

      setCompletedOrder(orderPayload);
      setStep("success");
      triggerConfetti();
      onOrderSuccess(orderPayload);
    } catch (err) {
      console.error("Order error:", err);
      setCompletedOrder(orderPayload);
      setStep("success");
      triggerConfetti();
      onOrderSuccess(orderPayload);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyTracking = () => {
    if (completedOrder?.orderId) {
      navigator.clipboard.writeText(completedOrder.orderId);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleCopyAccount = (accNo: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedAccountNo(true);
    setTimeout(() => setCopiedAccountNo(false), 2000);
  };

  const generateWhatsAppUrl = () => {
    if (!completedOrder) return "";
    const itemsText = cartItems
      .map((it) => {
        const size = it.product.sizes[it.selectedSizeIndex]?.size || "500ml";
        return `• ${it.product.name} (${size}) x ${it.quantity}`;
      })
      .join("\n");

    const message = `🌿 *NEW ORDER PLACED at ${storeConfig.brandName}*\n\n` +
      `*Order ID:* ${completedOrder.orderId}\n` +
      `*Customer:* ${customerName}\n` +
      `*Phone:* ${customerPhone}\n` +
      `*Address:* ${address}, ${city}\n\n` +
      `*Items Ordered:*\n${itemsText}\n\n` +
      `*Subtotal:* Rs. ${subtotal}\n` +
      `*Delivery Fee:* ${deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}\n` +
      (promoDiscount > 0 ? `*Discount:* -Rs. ${promoDiscount}\n` : "") +
      `*Total Amount Paid:* Rs. ${finalTotal}\n` +
      `*Payment Method:* ${completedOrder.paymentMethod}\n` +
      `*Recorded TID Number:* ${tidNumber || "N/A"}\n\n` +
      `Please find attached my payment screenshot receipt for quick verification & dispatch!`;

    const cleanNumber = (storeConfig.whatsappNumber || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-amber-50 text-amber-950 rounded-3xl shadow-2xl overflow-hidden border border-amber-900/30 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-amber-950 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold">
              {step === "success" ? "Order Placed & Payment Verification" : "Secure Checkout & Order Booking"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-300 hover:text-white hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* STEP 1: CUSTOMER DETAILS */}
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700" />
                  Step 1: Delivery Address & Contact
                </h3>
                <span className="text-xs text-amber-700 font-semibold">{cartItems.length} items in cart</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-900 font-bold mb-1">Full Name *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ali"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-amber-900 font-bold mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-900 font-bold mb-1">Email Address (Optional)</label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="e.g. yourname@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="block text-amber-900 font-bold mb-1">Full Delivery Address / House No. *</label>
                <textarea
                  id="checkout-address"
                  required
                  rows={2}
                  placeholder="e.g. House # 45, Street 4, Sector G-9/1, Main Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-900 font-bold mb-1">City / Town</label>
                  <input
                    id="checkout-city"
                    type="text"
                    placeholder="e.g. Lahore / Karachi / Islamabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-amber-900 font-bold mb-1">Postal Code (Optional)</label>
                  <input
                    id="checkout-pincode"
                    type="text"
                    placeholder="e.g. 54000"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-900 font-bold mb-1">Special Delivery Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, leave with security"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-950 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & MANDATORY TID / SCREENSHOT */}
          {step === "payment" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  Step 2: Select Payment Method & Transfer
                </h3>
                <span className="text-xs text-amber-900 font-bold">Total Payable: Rs. {finalTotal}</span>
              </div>

              {/* Payment Methods Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activePaymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethodId(pm.id);
                      setPaymentValidationError(null);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                      selectedMethodId === pm.id
                        ? "border-amber-700 bg-amber-100/90 ring-2 ring-amber-700/30"
                        : "border-amber-200 bg-white hover:bg-amber-50"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-amber-950">{pm.name}</p>
                      <p className="text-[11px] text-amber-800 line-clamp-1">{pm.instructions}</p>
                    </div>
                    {selectedMethodId === pm.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Payment Method Details Box */}
              {currentPaymentMethod && (
                <div className="bg-amber-950 text-amber-100 p-4 rounded-2xl border border-amber-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-800/80 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                      Transfer Details for {currentPaymentMethod.name}
                    </span>
                    <span className="text-xs font-serif font-bold text-emerald-400">Amount: Rs. {finalTotal}</span>
                  </div>

                  {currentPaymentMethod.accountNumber && currentPaymentMethod.accountNumber !== "N/A" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-amber-900/60 p-2.5 rounded-xl border border-amber-800">
                        <span className="text-[11px] text-amber-300 block">Account Title:</span>
                        <strong className="text-white text-sm">{currentPaymentMethod.accountTitle}</strong>
                      </div>

                      <div className="bg-amber-900/60 p-2.5 rounded-xl border border-amber-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-amber-300 block">Account / Mobile Number:</span>
                          <strong className="text-white text-sm font-mono">{currentPaymentMethod.accountNumber}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(currentPaymentMethod.accountNumber)}
                          className="p-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAccountNo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccountNo ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      {currentPaymentMethod.iban && (
                        <div className="sm:col-span-2 bg-amber-900/60 p-2 rounded-xl border border-amber-800 text-xs">
                          <span className="text-[11px] text-amber-300">IBAN: </span>
                          <span className="font-mono text-white select-all">{currentPaymentMethod.iban}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-amber-200/90 bg-amber-900/40 p-2 rounded-xl border border-amber-800/60">
                    💡 <strong>Instructions:</strong> {currentPaymentMethod.instructions}
                  </p>
                </div>
              )}

              {/* MANDATORY TID & SCREENSHOT UPLOAD (Required for Online Transfer) */}
              {requiresProof && (
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-400 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wide">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mandatory Payment Verification Proof</span>
                  </div>

                  <p className="text-xs text-amber-900">
                    To prevent delayed dispatches, please provide your <strong>Transaction ID (TID)</strong> and upload the <strong>payment screenshot</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mandatory TID Field */}
                    <div>
                      <label className="block text-amber-950 font-bold text-xs mb-1">
                        1. Transaction ID (TID / Trx ID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10293847561"
                        value={tidNumber}
                        onChange={(e) => {
                          setTidNumber(e.target.value);
                          setPaymentValidationError(null);
                        }}
                        className="w-full bg-amber-50/70 border border-amber-300 rounded-xl px-3 py-2 font-mono text-sm text-amber-950 focus:outline-none focus:border-amber-700"
                      />
                    </div>

                    {/* Mandatory Screenshot Attachment */}
                    <div>
                      <label className="block text-amber-950 font-bold text-xs mb-1">
                        2. Payment Screenshot Receipt *
                      </label>
                      <label className="flex items-center gap-2 w-full bg-amber-50/70 hover:bg-amber-100/80 border border-dashed border-amber-400 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="text-xs text-amber-900 font-medium truncate">
                          {screenshotFileName ? screenshotFileName : "Choose receipt screenshot..."}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail Preview */}
                  {screenshotFile && screenshotFile.trim() !== "" && (
                    <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-300 rounded-xl">
                      <img
                        src={screenshotFile}
                        alt="Payment Proof Receipt"
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-400 shadow-xs"
                      />
                      <div className="text-xs text-emerald-900">
                        <p className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Screenshot Attached!
                        </p>
                        <p className="text-[11px] text-emerald-700">Receipt will be sent directly to WhatsApp support & owner panel.</p>
                      </div>
                    </div>
                  )}

                  {/* Validation Error Message */}
                  {paymentValidationError && (
                    <div className="bg-rose-50 border border-rose-300 text-rose-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{paymentValidationError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Summary Breakdown */}
              <div className="bg-amber-100/80 p-3.5 rounded-2xl border border-amber-300 space-y-1.5 text-xs text-amber-950">
                <div className="flex justify-between">
                  <span className="text-amber-800">Items Subtotal ({cartItems.length}):</span>
                  <span className="font-semibold">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-700" />
                    Delivery Charges:
                  </span>
                  <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-700" : "text-amber-950"}`}>
                    {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount Applied:</span>
                    <span className="font-bold">-Rs. {promoDiscount}</span>
                  </div>
                )}
                <div className="border-t border-amber-300 pt-1.5 flex justify-between items-center text-sm font-bold text-amber-950">
                  <span>Grand Total Payable:</span>
                  <span className="font-serif text-base text-emerald-900">Rs. {finalTotal}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer"
                >
                  &larr; Back to Details
                </button>
                
                <button
                  id="confirm-place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || (requiresProof && (!tidNumber.trim() || !screenshotFile))}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    "Processing Order..."
                  ) : (
                    <>
                      <span>Confirm & Place Order (Rs. {finalTotal})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & MANDATORY WHATSAPP SUBMISSION */}
          {step === "success" && completedOrder && (
            <div className="text-center space-y-4 animate-fadeIn py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700 border-2 border-emerald-300 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-amber-950">
                  Order Successfully Registered!
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  Thank you, <strong>{customerName}</strong>. Your cold-pressed oil batch is reserved.
                </p>
              </div>

              {/* Order Reference Card */}
              <div className="bg-white p-4 rounded-2xl border border-amber-300 text-left space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <span className="text-amber-800">Order Booking ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-amber-950 text-sm">{completedOrder.orderId}</span>
                    <button
                      onClick={handleCopyTracking}
                      className="p-1 text-amber-700 hover:text-amber-950 cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-amber-800">Payment Mode:</span>
                  <span className="font-bold text-amber-950">{completedOrder.paymentMethod}</span>
                </div>

                {completedOrder.tidNumber && (
                  <div className="flex justify-between bg-amber-50 p-1.5 rounded-lg">
                    <span className="text-amber-800">Recorded TID:</span>
                    <span className="font-mono font-bold text-amber-950">{completedOrder.tidNumber}</span>
                  </div>
                )}

                {/* Delivery Charges Line */}
                <div className="flex justify-between text-amber-900 border-t border-amber-100 pt-1.5">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-amber-900">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-700" />
                    Delivery Charges:
                  </span>
                  <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-700" : "text-amber-950"}`}>
                    {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Discount:</span>
                    <span className="font-bold">-Rs. {promoDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-amber-200 pt-1.5">
                  <span className="font-bold text-amber-950 text-sm">Total Paid:</span>
                  <span className="font-bold text-emerald-800 text-sm font-serif">Rs. {completedOrder.totalAmount}</span>
                </div>
              </div>

              {/* ACTION: TRACK ORDER BUTTON */}
              {onOpenOrderTracking && (
                <div className="bg-amber-100/90 border border-amber-300 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left">
                  <div>
                    <span className="font-bold text-xs text-amber-950 block flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-800" />
                      Live Order Tracking
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Track cold-pressing, packaging & courier dispatch updates in real time.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrderTracking(completedOrder.orderId);
                    }}
                    className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer transition-all"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CRITICAL WHATSAPP SUPPORT SUBMISSION BUTTON */}
              <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl space-y-2.5 text-center">
                <p className="text-xs font-bold text-emerald-900">
                  📱 IMPORTANT: Send your Payment Screenshot to WhatsApp Support
                </p>
                <p className="text-[11px] text-emerald-800">
                  Click the button below to send your Order ID & TID details to our WhatsApp team for immediate verification and fast shipping dispatch!
                </p>
                
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Screenshot & TID to WhatsApp Support</span>
                </a>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl cursor-pointer text-xs"
                >
                  Return to Store
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
