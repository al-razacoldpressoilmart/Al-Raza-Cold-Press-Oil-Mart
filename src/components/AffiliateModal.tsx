import React, { useState, useMemo } from "react";
import { 
  X, 
  Sparkles, 
  DollarSign, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Gift, 
  Award,
  Wallet,
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  Search,
  ExternalLink,
  Receipt,
  FileCheck
} from "lucide-react";
import { StoreConfig } from "../data/storeConfig";

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  allOrders?: any[];
}

export interface AffiliatePartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  paymentMethod: string;
  accountDetails: string;
  referralCode: string;
  customDiscount: string;
  platform: string;
  createdAt: string;
  status: "active" | "pending";
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
  allOrders = [],
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "register" | "dashboard" | "earnings" | "calculator">("overview");
  
  // Registration Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [accountDetails, setAccountDetails] = useState("");
  const [platform, setPlatform] = useState("whatsapp_family");
  const [desiredCode, setDesiredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPartner, setRegisteredPartner] = useState<AffiliatePartner | null>(() => {
    try {
      const saved = localStorage.getItem("alraza_user_affiliate");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Custom Lookup Code in Earnings tab
  const [lookupCode, setLookupCode] = useState<string>(() => {
    if (registeredPartner?.referralCode) return registeredPartner.referralCode;
    return "ALRAZA-VIP";
  });

  // Calculator State
  const [monthlyBottles, setMonthlyBottles] = useState<number>(30);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active Referral Code for Dashboard/Earnings
  const currentRefCode = registeredPartner ? registeredPartner.referralCode : (desiredCode.trim().toUpperCase() || lookupCode.trim().toUpperCase() || "ALRAZA-VIP");
  const activeCodeForEarnings = lookupCode.trim().toUpperCase() || currentRefCode;
  const referralLink = `${window.location.origin}/?ref=${activeCodeForEarnings}`;

  const commissionPercent = storeConfig.affiliateCommissionRate || 10; // 10% Earning per product
  const buyerDiscountPercent = storeConfig.affiliateBuyerDiscount || 10; // 10% Discount
  const avgPricePerBottle = 650; // PKR average per pure cold-pressed oil bottle
  const estimatedEarnings = Math.round(monthlyBottles * avgPricePerBottle * (commissionPercent / 100));

  // Compute live affiliate earnings from stored application orders
  const affiliateStats = useMemo(() => {
    const ordersList = Array.isArray(allOrders) && allOrders.length > 0
      ? allOrders
      : (() => {
          try {
            return JSON.parse(localStorage.getItem("alraza_orders") || "[]");
          } catch {
            return [];
          }
        })();

    // Filter orders matching the referral code (or check promo code or notes)
    const matchingOrders = ordersList.filter((order: any) => {
      const refInOrder = (order.referralCode || "").trim().toUpperCase();
      const promoInOrder = (order.promoCode || order.appliedPromo || "").trim().toUpperCase();
      const notesInOrder = (order.specialInstructions || order.notes || "").toUpperCase();
      const codeMatch = activeCodeForEarnings.toUpperCase();

      return (
        refInOrder === codeMatch ||
        promoInOrder === codeMatch ||
        notesInOrder.includes(codeMatch)
      );
    });

    const totalOrdersCount = matchingOrders.length;
    const grossSales = matchingOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
    const subtotalSales = matchingOrders.reduce((sum: number, o: any) => sum + (Number(o.subtotal) || Number(o.totalAmount) || 0), 0);
    const totalCommission = Math.round(grossSales * (commissionPercent / 100));
    
    const paidCommission = matchingOrders
      .filter((o: any) => o.affiliatePayoutStatus === "paid")
      .reduce((sum: number, o: any) => sum + Math.round((Number(o.totalAmount) || 0) * (commissionPercent / 100)), 0);

    const pendingCommission = Math.max(0, totalCommission - paidCommission);

    return {
      orders: matchingOrders,
      totalOrdersCount,
      grossSales,
      subtotalSales,
      totalCommission,
      paidCommission,
      pendingCommission,
      allStoredOrdersCount: ordersList.length,
    };
  }, [allOrders, activeCodeForEarnings, commissionPercent]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeForEarnings);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanCode = (desiredCode.trim() || name.replace(/\s+/g, "").toUpperCase()).slice(0, 10);
    const newPartner: AffiliatePartner = {
      id: `AFF-${Date.now()}`,
      name,
      phone,
      email,
      paymentMethod,
      accountDetails,
      referralCode: cleanCode,
      customDiscount: `${buyerDiscountPercent}% Off for buyers`,
      platform,
      createdAt: new Date().toLocaleDateString(),
      status: "active",
    };

    setTimeout(() => {
      try {
        localStorage.setItem("alraza_user_affiliate", JSON.stringify(newPartner));
        const existingAll = JSON.parse(localStorage.getItem("alraza_all_affiliates") || "[]");
        localStorage.setItem("alraza_all_affiliates", JSON.stringify([newPartner, ...existingAll.filter((a: any) => a.id !== newPartner.id)]));
      } catch (err) {
        console.error("Failed to save affiliate:", err);
      }

      setRegisteredPartner(newPartner);
      setLookupCode(cleanCode);
      setIsSubmitting(false);
      setActiveTab("dashboard");
    }, 600);
  };

  const generatePayoutClaimUrl = () => {
    const partnerName = registeredPartner?.name || name || "Affiliate Partner";
    const partnerAcc = registeredPartner?.accountDetails || accountDetails || "Please check registered wallet";
    const partnerMethod = registeredPartner?.paymentMethod || paymentMethod || "EasyPaisa";
    
    const message = 
`💼 *AL RAZA AFFILIATE COMMISSION PAYOUT REQUEST* 💼

👤 *Partner Name:* ${partnerName}
🏷️ *Referral Code:* ${activeCodeForEarnings}
🔢 *Qualifying Orders:* ${affiliateStats.totalOrdersCount} orders
💰 *Gross Sales Generated:* Rs. ${affiliateStats.grossSales.toLocaleString()}
💵 *Total Commission (10%):* Rs. ${affiliateStats.totalCommission.toLocaleString()}
⏳ *Pending Payout Balance:* Rs. ${affiliateStats.pendingCommission.toLocaleString()}

💳 *Payout Method:* ${partnerMethod}
🏦 *Account Details:* ${partnerAcc}

Please review and transfer my weekly affiliate commission. Thank you!`;

    return `https://wa.me/${storeConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-amber-950 text-amber-50 border-2 border-amber-600/50 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-fadeIn flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-4 sm:py-5 border-b border-amber-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-white">
                  {storeConfig.brandName} Affiliate Partner Network
                </h3>
                <span className="bg-emerald-800 text-emerald-200 border border-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  Earn {commissionPercent}% Per Sale
                </span>
              </div>
              <p className="text-xs text-amber-200/90">
                Partner with Pakistan's purest cold-pressed oil brand & earn 10% commission on every product order.
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

        {/* Tab Navigation */}
        <div className="bg-amber-900/40 px-4 sm:px-6 py-2 border-b border-amber-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "bg-amber-600 text-white shadow"
                : "text-amber-300 hover:text-white hover:bg-amber-900/60"
            }`}
          >
            Program Benefits
          </button>
          
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === "calculator"
                ? "bg-amber-600 text-white shadow"
                : "text-amber-300 hover:text-white hover:bg-amber-900/60"
            }`}
          >
            10% Calculator
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "earnings"
                ? "bg-amber-500 text-stone-950 font-bold shadow"
                : "text-amber-300 hover:text-white hover:bg-amber-900/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live 10% Earnings Dashboard</span>
            {affiliateStats.totalOrdersCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {affiliateStats.totalOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab(registeredPartner ? "dashboard" : "register")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === "register" || activeTab === "dashboard"
                ? "bg-emerald-700 text-white shadow font-bold"
                : "text-emerald-300 hover:text-white hover:bg-emerald-900/40"
            }`}
          >
            {registeredPartner ? "Partner Profile & Link" : "Join Program (Free Signup)"}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-900/50 border border-amber-700/60 rounded-2xl p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-800 mx-auto flex items-center justify-center text-amber-300">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-100">{commissionPercent}% Direct Commission</h4>
                  <p className="text-xs text-amber-200/80">
                    Earn a flat {commissionPercent}% commission on every product and bottle of pure cold-pressed oil sold via your link.
                  </p>
                </div>

                <div className="bg-amber-900/50 border border-amber-700/60 rounded-2xl p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-900 mx-auto flex items-center justify-center text-emerald-300">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-100">Weekly Direct Payouts</h4>
                  <p className="text-xs text-amber-200/80">
                    Direct bank and mobile wallet transfers to EasyPaisa, JazzCash, or bank accounts (Meezan, HBL, etc.).
                  </p>
                </div>

                <div className="bg-amber-900/50 border border-amber-700/60 rounded-2xl p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-800 mx-auto flex items-center justify-center text-amber-300">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-100">{buyerDiscountPercent}% Buyer Discount</h4>
                  <p className="text-xs text-amber-200/80">
                    Your followers & family get {buyerDiscountPercent}% off with your custom coupon code, increasing your orders.
                  </p>
                </div>
              </div>

              {/* How it Works 4 Steps */}
              <div className="bg-amber-900/30 border border-amber-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-lg font-bold text-white text-center">
                  How It Works (Simple 4-Step Process)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800 space-y-1">
                    <span className="font-bold text-amber-400">Step 1</span>
                    <p className="font-bold text-white">Sign Up in 30 Seconds</p>
                    <p className="text-amber-200/70">No fees or paperwork required. Instant verified account activation.</p>
                  </div>
                  <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800 space-y-1">
                    <span className="font-bold text-amber-400">Step 2</span>
                    <p className="font-bold text-white">Get Referral Link & Code</p>
                    <p className="text-amber-200/70">Unique link & 10% discount promo code with your chosen name.</p>
                  </div>
                  <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800 space-y-1">
                    <span className="font-bold text-amber-400">Step 3</span>
                    <p className="font-bold text-white">Share with Network</p>
                    <p className="text-amber-200/70">Share benefits of pure cold pressed oils on WhatsApp, Instagram, or clinic.</p>
                  </div>
                  <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800 space-y-1">
                    <span className="font-bold text-emerald-400">Step 4</span>
                    <p className="font-bold text-white">Earn 10% Every Order</p>
                    <p className="text-amber-200/70">10% commission credited automatically on every product purchase.</p>
                  </div>
                </div>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl border border-amber-600/50">
                <div>
                  <h4 className="font-serif font-bold text-base text-white">
                    Ready to start earning with {storeConfig.brandName}?
                  </h4>
                  <p className="text-xs text-amber-200">
                    Join health enthusiasts, nutritionists, chefs, and homemakers earning 10% commission.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("earnings")}
                    className="px-4 py-2.5 bg-amber-950 hover:bg-stone-900 text-amber-300 border border-amber-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    View Live Earnings
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Register Free as Partner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE EARNINGS DASHBOARD (Based on application order history) */}
          {activeTab === "earnings" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Banner with Code Selector */}
              <div className="bg-amber-900/50 border border-amber-700/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-serif text-lg font-bold text-white">
                      Affiliate Earnings & Sales Performance
                    </h4>
                  </div>
                  <p className="text-xs text-amber-200/80">
                    Live calculation based on recorded order history (10% commission on every sale made using your affiliate code).
                  </p>
                </div>

                {/* Referral Code Switcher */}
                <div className="flex items-center gap-2 w-full md:w-auto bg-amber-950/80 p-2 rounded-xl border border-amber-700">
                  <span className="text-xs text-amber-300 font-medium pl-1">Code:</span>
                  <input
                    type="text"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ALRAZA-VIP"
                    className="bg-amber-900/80 text-white font-mono text-xs px-2.5 py-1 rounded-lg border border-amber-600 focus:outline-none uppercase w-28 text-center"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copy this code's referral link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Link"}</span>
                  </button>
                </div>
              </div>

              {/* Metric Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                <div className="p-4 rounded-2xl bg-amber-900/40 border border-amber-700/60 space-y-1">
                  <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-400" /> Referred Orders
                  </span>
                  <p className="text-2xl font-serif font-bold text-white">
                    {affiliateStats.totalOrdersCount} <span className="text-xs font-normal text-amber-300">Sales</span>
                  </p>
                  <p className="text-[10px] text-amber-400/80">Matching code "{activeCodeForEarnings}"</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-900/40 border border-amber-700/60 space-y-1">
                  <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Gross Sales Generated
                  </span>
                  <p className="text-2xl font-serif font-bold text-amber-200">
                    Rs. {affiliateStats.grossSales.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-400/80">Total value of orders referred</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-600/60 space-y-1">
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Total 10% Commission
                  </span>
                  <p className="text-2xl font-serif font-bold text-emerald-300">
                    Rs. {affiliateStats.totalCommission.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-400/80">10% of gross referred revenue</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-900/40 border border-amber-700/60 space-y-1">
                  <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" /> Pending Payout Balance
                  </span>
                  <p className="text-2xl font-serif font-bold text-amber-100">
                    Rs. {affiliateStats.pendingCommission.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-400/80">Ready for transfer to wallet</p>
                </div>

              </div>

              {/* Commission Claim / Payout Action Bar */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-amber-950 to-emerald-950 rounded-2xl border border-emerald-700/60 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Weekly Payout Available: Rs. {affiliateStats.pendingCommission.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-amber-200/80">
                    Payouts are disbursed every Friday directly to EasyPaisa, JazzCash, or bank accounts.
                  </p>
                </div>

                <a
                  id="claim-affiliate-payout-btn"
                  href={generatePayoutClaimUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Request 10% Payout via WhatsApp</span>
                </a>
              </div>

              {/* Referred Orders Breakdown Table */}
              <div className="bg-amber-900/30 border border-amber-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="font-serif font-bold text-base text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span>Referred Customer Orders Breakdown ({affiliateStats.totalOrdersCount})</span>
                  </h5>
                  <span className="text-xs text-amber-300/80">
                    Filtered by Affiliate Code: <strong className="text-white font-mono">{activeCodeForEarnings}</strong>
                  </span>
                </div>

                {affiliateStats.orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-amber-700/80 text-amber-300 font-semibold">
                          <th className="pb-2.5 pr-3">Order ID</th>
                          <th className="pb-2.5 pr-3">Date</th>
                          <th className="pb-2.5 pr-3">Customer / City</th>
                          <th className="pb-2.5 pr-3">Items Summary</th>
                          <th className="pb-2.5 pr-3 text-right">Order Total</th>
                          <th className="pb-2.5 pr-3 text-right">10% Commission</th>
                          <th className="pb-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-800/60">
                        {affiliateStats.orders.map((order: any, idx: number) => {
                          const orderVal = Number(order.totalAmount) || 0;
                          const commissionVal = Math.round(orderVal * (commissionPercent / 100));
                          const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent";

                          return (
                            <tr key={order.id || order.orderId || idx} className="hover:bg-amber-900/40 transition-colors">
                              <td className="py-3 pr-3 font-mono font-bold text-amber-200">
                                {order.orderId || order.id}
                              </td>
                              <td className="py-3 pr-3 text-amber-300/80">
                                {dateStr}
                              </td>
                              <td className="py-3 pr-3">
                                <span className="font-semibold text-white">{order.customerName}</span>
                                <span className="text-[10px] text-amber-400 block">{order.city || "Pakistan"}</span>
                              </td>
                              <td className="py-3 pr-3 text-amber-200/90 max-w-xs truncate" title={order.itemsSummary}>
                                {order.itemsSummary || "Cold-Pressed Oil Batch"}
                              </td>
                              <td className="py-3 pr-3 text-right font-bold text-white">
                                Rs. {orderVal.toLocaleString()}
                              </td>
                              <td className="py-3 pr-3 text-right font-bold text-emerald-400 font-mono">
                                +Rs. {commissionVal.toLocaleString()}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  order.status === "delivered" 
                                    ? "bg-emerald-900 text-emerald-200 border border-emerald-600" 
                                    : "bg-amber-900 text-amber-200 border border-amber-600"
                                }`}>
                                  {order.status || "confirmed"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3 bg-amber-950/60 rounded-xl border border-amber-800 p-6">
                    <Share2 className="w-10 h-10 mx-auto text-amber-400/70" />
                    <h6 className="font-serif font-bold text-white text-sm">
                      No referred orders found for code "{activeCodeForEarnings}" yet
                    </h6>
                    <p className="text-xs text-amber-200/80 max-w-md mx-auto">
                      Share your unique referral link on WhatsApp status, family groups, or Instagram bio. Every time a customer places an order using your code, your 10% commission will appear here in real-time!
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? "Link Copied!" : "Copy Referral Link"}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("dashboard")}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h4 className="font-serif text-xl font-bold text-white">
                  Estimate Your Monthly 10% Earnings
                </h4>
                <p className="text-xs text-amber-200/80">
                  Slide to adjust how many bottles of cold-pressed oil your network buys each month:
                </p>
              </div>

              <div className="bg-amber-900/40 border border-amber-700/60 rounded-2xl p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-amber-200">Monthly Bottles / Litres Sold:</span>
                    <span className="text-2xl text-amber-300 font-mono">{monthlyBottles} Bottles</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={monthlyBottles}
                    onChange={(e) => setMonthlyBottles(Number(e.target.value))}
                    className="w-full h-2.5 bg-amber-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-amber-400">
                    <span>5 bottles (Family)</span>
                    <span>100 bottles (WhatsApp circles)</span>
                    <span>300+ (Social / Clinic)</span>
                  </div>
                </div>

                <div className="bg-amber-950/80 p-6 rounded-2xl border-2 border-emerald-600/60 text-center space-y-2">
                  <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">
                    Your Monthly Income ({commissionPercent}% Commission per Product)
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mono">
                    Rs. {estimatedEarnings.toLocaleString()} <span className="text-base text-amber-200 font-normal">/ Month</span>
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Annual Earning Potential: <strong className="text-white font-mono">Rs. {(estimatedEarnings * 12).toLocaleString()} / Year</strong>
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("register")}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Claim Your 10% Referral Code Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: REGISTRATION */}
          {activeTab === "register" && !registeredPartner && (
            <form onSubmit={handleRegister} className="space-y-4 max-w-xl mx-auto animate-fadeIn">
              <div className="text-center space-y-1 pb-2">
                <h4 className="font-serif text-xl font-bold text-white">
                  Join Al Raza Affiliate Network
                </h4>
                <p className="text-xs text-amber-200/80">
                  Fill in your payout information to receive your referral link and earnings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ayesha / Bilal Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white placeholder-amber-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white placeholder-amber-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white placeholder-amber-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Your Promotional Channel</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="whatsapp_family">WhatsApp Friends & Family Circles</option>
                    <option value="instagram_tiktok">Instagram / TikTok / YouTube Content</option>
                    <option value="nutrition_clinic">Nutritionist / Doctor / Health Clinic</option>
                    <option value="gym_fitness">Gym / Fitness Training & Yoga</option>
                    <option value="organic_store">Organic Store / Home Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Payout Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="meezan">Meezan Bank (IBFT)</option>
                    <option value="hbl">HBL Bank (IBFT)</option>
                    <option value="other_bank">Other Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-200 font-semibold mb-1">Account Title & Number / IBAN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bilal Ahmed - 03001234567"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white placeholder-amber-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-amber-200 font-semibold mb-1">
                  Custom Referral Code (Optional - e.g. YOURNAME10)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TARIQ-HEALTH or PURE-SANA"
                  value={desiredCode}
                  onChange={(e) => setDesiredCode(e.target.value)}
                  className="w-full bg-amber-950/80 border border-amber-700 rounded-xl px-3.5 py-2.5 text-white placeholder-amber-600 focus:outline-none focus:border-amber-400 uppercase font-mono"
                />
                <p className="text-[11px] text-amber-400/80 mt-1">
                  Your buyers will use this code to get 10% off, and you'll earn 10% commission on their orders.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Generating Partner Account..." : "Create Partner Account & Get Referral Link"}</span>
              </button>
            </form>
          )}

          {/* TAB 5: DASHBOARD (Active Partner Profile & Links) */}
          {(activeTab === "dashboard" || registeredPartner) && activeTab !== "overview" && activeTab !== "calculator" && activeTab !== "earnings" && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
              
              {/* Welcome Badge */}
              <div className="bg-emerald-950/80 border-2 border-emerald-600/60 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-emerald-300">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-white">
                        {registeredPartner ? registeredPartner.name : name || "Partner"}
                      </h4>
                      <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Verified Partner
                      </span>
                    </div>
                    <p className="text-xs text-amber-200">
                      Tier: <strong>10% Commission</strong> • Payout: {registeredPartner?.paymentMethod || "EasyPaisa"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("earnings")}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Total Earnings</span>
                  </button>
                  <a
                    href={`https://wa.me/${storeConfig.whatsappNumber}?text=Hello%20Al%20Raza%20Affiliate%20Team,%20my%20partner%20code%20is%20${currentRefCode}.%20I%20want%20to%20check%20my%20weekly%20sales.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Affiliate Support</span>
                  </a>
                </div>
              </div>

              {/* Referral Link & Promo Code Share Box */}
              <div className="bg-amber-900/40 border border-amber-700/60 rounded-2xl p-6 space-y-4">
                <div>
                  <h5 className="font-serif font-bold text-sm text-white">Your Unique Referral Link</h5>
                  <p className="text-xs text-amber-300/80">Share this link directly on WhatsApp, Facebook, Instagram Bio, or YouTube:</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-amber-950 border border-amber-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 font-mono select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>

                {/* Promo Code Box */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-800/60">
                  <div>
                    <span className="text-xs text-amber-200">Your Exclusive 10% Discount Code:</span>
                    <p className="font-mono font-bold text-amber-300 text-base">{currentRefCode}</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-100 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              </div>

              {/* Instant WhatsApp Share Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🌿 Salam! Order 100% Pure Cold-Pressed Groundnut, Coconut, Sesame & Mustard Oils extracted below 42°C from Al Raza Mart. Use my link to get a 10% discount on your order:\n👉 ${referralLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>Share Referral Offer on WhatsApp Now</span>
              </a>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
