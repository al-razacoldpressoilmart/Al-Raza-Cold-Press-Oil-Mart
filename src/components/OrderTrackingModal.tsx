import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  MapPin,
  Phone,
  Droplet,
  Copy,
  Check,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

export interface OrderTrackingItem {
  productId?: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface TrackableOrder {
  id?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  deliveryAddress?: string;
  city?: string;
  items?: OrderTrackingItem[];
  itemsSummary?: string;
  subtotal?: number;
  deliveryFee?: number;
  promoDiscount?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  status?: "pending" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled";
  tidNumber?: string;
  notes?: string;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  storeConfig: StoreConfig;
  allOrders?: TrackableOrder[];
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = "",
  storeConfig,
  allOrders = [],
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState<TrackableOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [copiedCourierTrack, setCopiedCourierTrack] = useState(false);
  const [recentOrdersList, setRecentOrdersList] = useState<TrackableOrder[]>([]);

  // Load all local and passed orders
  useEffect(() => {
    try {
      const savedLocal = JSON.parse(localStorage.getItem("alraza_orders") || "[]");
      // Merge with allOrders prop
      const mergedMap = new Map<string, TrackableOrder>();
      [...allOrders, ...savedLocal].forEach((ord) => {
        const id = ord.orderId || ord.id;
        if (id) {
          mergedMap.set(id, { ...ord, orderId: id });
        }
      });
      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentOrdersList(combined);

      if (initialOrderId) {
        const match = combined.find(
          (o) => o.orderId?.toUpperCase() === initialOrderId.toUpperCase()
        );
        if (match) {
          setSelectedOrder(match);
          setSearchInput(match.orderId);
        } else {
          setSearchInput(initialOrderId);
        }
      } else if (combined.length > 0 && !selectedOrder) {
        // Auto-select most recent order
        setSelectedOrder(combined[0]);
        setSearchInput(combined[0].orderId);
      }
    } catch {
      // ignore
    }
  }, [isOpen, initialOrderId, allOrders]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const query = searchInput.trim().toUpperCase();

    if (!query) {
      setErrorMessage("Please enter an Order ID (e.g. AR-123456) or your phone number.");
      return;
    }

    // Try finding by Order ID or Phone number
    const match = recentOrdersList.find((ord) => {
      const idMatch = ord.orderId?.toUpperCase() === query;
      const phoneMatch = ord.customerPhone?.replace(/\D/g, "") === query.replace(/\D/g, "");
      return idMatch || (phoneMatch && query.replace(/\D/g, "").length >= 7);
    });

    if (match) {
      setSelectedOrder(match);
      setErrorMessage(null);
    } else {
      setErrorMessage(`No active order found matching "${searchInput}". Please verify your Order ID or contact WhatsApp support.`);
    }
  };

  const handleCopyOrderId = () => {
    if (selectedOrder?.orderId) {
      navigator.clipboard.writeText(selectedOrder.orderId);
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2000);
    }
  };

  const handleCopyCourierTrack = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedCourierTrack(true);
    setTimeout(() => setCopiedCourierTrack(false), 2000);
  };

  // Determine active step (1 to 4)
  const getStepIndex = (status?: string): number => {
    switch (status) {
      case "pending":
        return 1;
      case "confirmed":
        return 2;
      case "processing":
        return 3;
      case "dispatched":
        return 4;
      case "delivered":
        return 5;
      case "cancelled":
        return 0;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex(selectedOrder?.status);

  const trackingStages = [
    {
      step: 1,
      title: "Order Placed & Registered",
      description: "Booking logged in system, TID and items verified.",
      time: selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Done",
      icon: Clock,
    },
    {
      step: 2,
      title: "Fresh Extraction & Quality Check",
      description: "Extracted fresh below 42°C with 304 food-grade stainless steel machine.",
      time: currentStep >= 2 ? "Inspection Passed" : "Pending",
      icon: Droplet,
    },
    {
      step: 3,
      title: "Aroma-Sealed & Shockproof Packaging",
      description: "Bottled in food-grade container with tamper-evident seal and protective bubble wrapping.",
      time: currentStep >= 3 ? "Packaged Securely" : "Queueing",
      icon: Package,
    },
    {
      step: 4,
      title: "Dispatched with Courier Partner",
      description: selectedOrder?.courierName 
        ? `Handed over to ${selectedOrder.courierName} (${selectedOrder.trackingNumber || "Assigned"}).` 
        : "Assigned to express shipping courier for door delivery.",
      time: currentStep >= 4 ? (selectedOrder?.dispatchedAt || "In Transit") : "Expected within 24h",
      icon: Truck,
    },
    {
      step: 5,
      title: "Out for Delivery & Delivered",
      description: "Courier rider delivers pure cold pressed oils directly to your address.",
      time: currentStep >= 5 ? (selectedOrder?.deliveredAt || "Delivered") : (storeConfig.deliveryEstimatedDays || "2-3 Days"),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-amber-950 text-amber-50 border-2 border-amber-600/50 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-fadeIn flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-4 border-b border-amber-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
              <Truck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Live Order Tracking & Dispatch Status
                </h3>
                <span className="bg-emerald-800 text-emerald-200 border border-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-amber-200/90">
                Track cold-pressing, tamper sealing & door-to-door courier dispatch for {storeConfig.brandName}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-amber-400 hover:text-white p-2 rounded-xl hover:bg-amber-800/80 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar & Order Lookup */}
        <div className="bg-amber-900/40 p-4 sm:p-5 border-b border-amber-800 shrink-0">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. AR-849201) or Phone (e.g. 03001234567)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-amber-950/80 border border-amber-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-amber-500/80 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </button>
          </form>

          {errorMessage && (
            <div className="mt-2.5 bg-rose-950/60 border border-rose-600 text-rose-200 text-xs p-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Select Pill Buttons for Recent Orders on this Device */}
          {recentOrdersList.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto text-[11px] pb-1">
              <span className="text-amber-300/80 font-medium shrink-0">Your Recent Bookings:</span>
              {recentOrdersList.slice(0, 4).map((ord) => (
                <button
                  key={ord.orderId}
                  type="button"
                  onClick={() => {
                    setSelectedOrder(ord);
                    setSearchInput(ord.orderId);
                    setErrorMessage(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedOrder?.orderId === ord.orderId
                      ? "bg-amber-600 text-white border-amber-400 shadow-xs"
                      : "bg-amber-950/60 text-amber-200 border-amber-800 hover:border-amber-600"
                  }`}
                >
                  {ord.orderId} (Rs. {ord.totalAmount})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {selectedOrder ? (
            <div className="space-y-6">
              
              {/* Top Order Status Banner Card */}
              <div className="bg-amber-900/50 border border-amber-700/70 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800 pb-3">
                  <div>
                    <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold block">
                      Booking Reference Number
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-lg sm:text-xl text-white">
                        {selectedOrder.orderId}
                      </span>
                      <button
                        onClick={handleCopyOrderId}
                        className="p-1 bg-amber-800/80 hover:bg-amber-700 text-amber-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedTrackingId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTrackingId ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold block">
                      Live Status
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-0.5 ${
                        selectedOrder.status === "delivered"
                          ? "bg-emerald-900 text-emerald-200 border-emerald-500"
                          : selectedOrder.status === "dispatched"
                          ? "bg-sky-900 text-sky-200 border-sky-500 animate-pulse"
                          : selectedOrder.status === "processing"
                          ? "bg-amber-700 text-amber-100 border-amber-400"
                          : "bg-amber-800 text-amber-200 border-amber-600"
                      }`}
                    >
                      {selectedOrder.status ? selectedOrder.status.toUpperCase() : "CONFIRMED & IN PREPARATION"}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Extraction & Delivery Progress Timeline
                  </h4>

                  <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-800">
                    {trackingStages.map((stage) => {
                      const isComplete = currentStep >= stage.step;
                      const isCurrent = currentStep === stage.step;
                      const StageIcon = stage.icon;

                      return (
                        <div key={stage.step} className="flex items-start gap-4 relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border transition-all ${
                              isComplete
                                ? "bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/30"
                                : "bg-amber-950 text-amber-500 border-amber-800"
                            }`}
                          >
                            <StageIcon className="w-4 h-4" />
                          </div>

                          <div
                            className={`flex-1 p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? "bg-amber-800/60 border-amber-500 shadow"
                                : isComplete
                                ? "bg-amber-900/30 border-amber-800/80"
                                : "bg-amber-950/40 border-amber-900/50 opacity-70"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <h5 className={`font-bold text-xs sm:text-sm ${isComplete ? "text-white" : "text-amber-300"}`}>
                                {stage.title}
                              </h5>
                              <span className="text-[11px] font-mono font-medium text-amber-400">
                                {stage.time}
                              </span>
                            </div>
                            <p className="text-xs text-amber-200/80 mt-0.5">
                              {stage.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier & Tracking Details Card if Dispatched */}
                {selectedOrder.courierName && (
                  <div className="bg-sky-950/80 border-2 border-sky-600/70 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sky-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300 block">
                        Assigned Courier Partner
                      </span>
                      <strong className="text-white text-sm font-serif">
                        {selectedOrder.courierName} Express Shipping
                      </strong>
                      {selectedOrder.trackingNumber && (
                        <p className="text-xs text-sky-200 font-mono mt-0.5">
                          Consignment / CN: <strong>{selectedOrder.trackingNumber}</strong>
                        </p>
                      )}
                    </div>

                    {selectedOrder.trackingNumber && (
                      <button
                        onClick={() => handleCopyCourierTrack(selectedOrder.trackingNumber!)}
                        className="px-3 py-1.5 bg-sky-800 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                      >
                        {copiedCourierTrack ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCourierTrack ? "CN Copied" : "Copy Consignment #"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items & Pricing Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left: Ordered Items */}
                <div className="bg-amber-900/40 border border-amber-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" />
                    Ordered Cold-Pressed Oils
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-950/80 border border-amber-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{item.name}</p>
                            <span className="text-[11px] text-amber-300 font-medium">
                              Size: {item.size} • Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-200">
                            Rs. {item.price * item.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-amber-200/80 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800">
                        {selectedOrder.itemsSummary || "Cold-Pressed Oils Basket"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Payment & Delivery Charge Breakdown */}
                <div className="bg-amber-900/40 border border-amber-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Payment & Delivery Breakdown
                  </h4>

                  <div className="space-y-1.5 text-xs text-amber-200 bg-amber-950/80 p-3 rounded-xl border border-amber-800/80">
                    <div className="flex justify-between">
                      <span className="text-amber-300">Items Subtotal:</span>
                      <span className="font-mono font-semibold text-white">
                        Rs. {selectedOrder.subtotal || Math.max(0, selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        Delivery Charges:
                      </span>
                      <span className={`font-mono font-bold ${(selectedOrder.deliveryFee ?? 0) === 0 ? "text-emerald-400" : "text-white"}`}>
                        {(selectedOrder.deliveryFee ?? 0) === 0 ? "FREE" : `Rs. ${selectedOrder.deliveryFee}`}
                      </span>
                    </div>

                    {(selectedOrder.promoDiscount ?? 0) > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount Savings:</span>
                        <span className="font-mono font-bold">-Rs. {selectedOrder.promoDiscount}</span>
                      </div>
                    )}

                    <div className="border-t border-amber-800 pt-1.5 flex justify-between font-bold text-sm text-white">
                      <span>Total Amount:</span>
                      <span className="font-mono font-extrabold text-amber-300 text-base">
                        Rs. {selectedOrder.totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-300/90 space-y-1">
                    <p>
                      <strong>Payment Mode:</strong> {selectedOrder.paymentMethod}
                    </p>
                    {selectedOrder.tidNumber && (
                      <p className="font-mono">
                        <strong>Transaction TID:</strong> {selectedOrder.tidNumber}
                      </p>
                    )}
                    <p>
                      <strong>Destination:</strong> {selectedOrder.shippingAddress || selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>

              </div>

              {/* Direct WhatsApp Support Inquiry Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-950/80 border-2 border-emerald-600/70 rounded-2xl">
                <div>
                  <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    Need an urgent dispatch update?
                  </h5>
                  <p className="text-xs text-emerald-200/90">
                    Connect directly with the Al Raza dispatch team for live courier status.
                  </p>
                </div>

                <a
                  href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(
                    `Salam Al Raza Oil Mart! 🌿\n\nI am inquiring about the live tracking status of my Order:\n\n*Order ID:* ${selectedOrder.orderId}\n*Customer:* ${selectedOrder.customerName}\n*Phone:* ${selectedOrder.customerPhone}\n*Total Amount:* Rs. ${selectedOrder.totalAmount}\n\nPlease share the latest dispatch/delivery update!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center mx-auto text-amber-400">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">
                Enter Your Order ID to Track
              </h4>
              <p className="text-xs text-amber-300/80 max-w-sm mx-auto">
                You will receive full visibility into seed crushing, aroma-locked bottling, and courier consignment details.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-950 px-6 py-3 border-t border-amber-800/80 flex items-center justify-between text-xs text-amber-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Leak-Proof Cold Chain Delivery</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
