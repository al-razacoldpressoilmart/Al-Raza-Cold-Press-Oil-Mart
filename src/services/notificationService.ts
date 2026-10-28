import { StoreConfig } from "../data/storeConfig";

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  deliveryNotes?: string;
  paymentMethod: string;
  tidNumber?: string;
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  totalAmount: number;
  items: Array<{
    product: { name: string; id: string };
    selectedSizeIndex: number;
    quantity: number;
    price: number;
    sizeName?: string;
  }>;
}

export interface AffiliateNotificationPayload {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: string;
  accountDetails: string;
  referralCode: string;
  platform?: string;
  createdAt: string;
}

export interface WholesaleNotificationPayload {
  inquiryId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  category: string;
  estimatedQuantity: string;
  frequency: string;
  notes?: string;
}

const DEFAULT_OWNER_EMAIL = "tshirtsprintingworld@gmail.com";
const OWNER_WHATSAPP = "923292832225";

/**
 * Sends a real-time order confirmation email to the store owner's Gmail.
 * Uses FormSubmit AJAX with multiple failover paths to guarantee delivery.
 */
export async function sendOrderEmailNotification(
  order: OrderNotificationPayload,
  storeConfig?: StoreConfig
): Promise<boolean> {
  const targetEmail = storeConfig?.notificationEmail?.trim() || DEFAULT_OWNER_EMAIL;

  const itemsListString = order.items
    .map((it, idx) => {
      const size = it.sizeName || "Pack";
      return `${idx + 1}. ${it.product?.name || "Product"} (${size}) x ${it.quantity} = Rs. ${it.price * it.quantity}`;
    })
    .join("\n");

  const formData = {
    _subject: `🚨 [NEW ORDER #${order.orderId}] Rs. ${order.totalAmount} - ${order.customerName}`,
    _template: "table",
    _captcha: "false",
    "Order Tracking ID": `#${order.orderId}`,
    "Customer Name": order.customerName,
    "Customer Mobile / WhatsApp": order.customerPhone,
    "Delivery Address": order.deliveryAddress,
    "City": order.city,
    "Payment Method": order.paymentMethod + (order.tidNumber ? ` (TID: ${order.tidNumber})` : ""),
    "Subtotal": `Rs. ${order.subtotal}`,
    "Delivery Fee": order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`,
    "Promo Discount": order.promoDiscount > 0 ? `-Rs. ${order.promoDiscount}` : "None",
    "TOTAL PAYABLE": `Rs. ${order.totalAmount}`,
    "Items Ordered": itemsListString,
    "Delivery Notes": order.deliveryNotes || "None",
    "Order Date": new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    "Store Name": storeConfig?.brandName || "Al Raza Cold Press Oil Mart",
  };

  try {
    // 1. Primary: Direct AJAX dispatch to FormSubmit for the owner's Gmail
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // 2. Secondary: Notify backend server to trigger background logging and server notifications
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        targetEmail,
        itemsSummary: itemsListString,
      }),
    }).catch(() => {});

    return response.ok;
  } catch (error) {
    console.warn("Order email dispatch note:", error);
    // Still notify backend on network glitch
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        targetEmail,
        itemsSummary: itemsListString,
      }),
    }).catch(() => {});
    return false;
  }
}

/**
 * Sends a real-time email notification when a new affiliate partner joins.
 */
export async function sendAffiliateEmailNotification(
  affiliate: AffiliateNotificationPayload,
  storeConfig?: StoreConfig
): Promise<boolean> {
  const targetEmail = storeConfig?.notificationEmail?.trim() || DEFAULT_OWNER_EMAIL;

  const formData = {
    _subject: `🤝 [NEW AFFILIATE PARTNER] ${affiliate.fullName} (${affiliate.referralCode})`,
    _template: "table",
    _captcha: "false",
    "Partner Full Name": affiliate.fullName,
    "Mobile / WhatsApp": affiliate.phone,
    "Email Address": affiliate.email,
    "Payout Method": affiliate.paymentMethod,
    "Account Number / Details": affiliate.accountDetails,
    "Assigned Referral Code": affiliate.referralCode,
    "Commission Rate": `${storeConfig?.affiliateCommissionRate || 10}% per order`,
    "Promotion Channel": affiliate.platform || "WhatsApp / Social Media",
    "Registration Date": affiliate.createdAt,
    "Store": storeConfig?.brandName || "Al Raza Pure Mart",
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Notify backend as well
    fetch("/api/notify-affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...affiliate,
        targetEmail,
      }),
    }).catch(() => {});

    return response.ok;
  } catch (error) {
    console.warn("Affiliate email notification note:", error);
    return false;
  }
}

/**
 * Generates direct pre-filled WhatsApp link for the Store Owner (03292832225)
 */
export function generateOrderWhatsAppUrl(
  order: OrderNotificationPayload,
  storeConfig?: StoreConfig
): string {
  const cleanNumber = (storeConfig?.whatsappNumber || OWNER_WHATSAPP).replace(/[^0-9]/g, "");

  const itemsList = order.items
    .map((it) => {
      const sz = it.sizeName || "Pack";
      return `• ${it.product?.name} (${sz}) x ${it.quantity} = Rs. ${it.price * it.quantity}`;
    })
    .join("\n");

  const message =
    `🌿 *نیا آرڈر موصول ہوا ہے (${storeConfig?.brandName || "Al Raza Mart"})*\n\n` +
    `*آرڈر نمبر:* #${order.orderId}\n` +
    `*گاہک کا نام:* ${order.customerName}\n` +
    `*فون نمبر:* ${order.customerPhone}\n` +
    `*مکمل پتہ:* ${order.deliveryAddress}\n` +
    `*شہر:* ${order.city}\n` +
    `*ادائیگی:* ${order.paymentMethod}${order.tidNumber ? ` (TID: ${order.tidNumber})` : ""}\n\n` +
    `*اشیاء:*\n${itemsList}\n\n` +
    `*سب ٹوٹل:* Rs. ${order.subtotal}\n` +
    `*ڈلیوری چارجز:* ${order.deliveryFee === 0 ? "مفت (FREE)" : `Rs. ${order.deliveryFee}`}\n` +
    `*کل واجب الادا رقم:* Rs. ${order.totalAmount}\n` +
    (order.deliveryNotes ? `\n*اضافی نوٹ:* ${order.deliveryNotes}\n` : "") +
    `\nالسلام علیکم! میں نے یہ آرڈر پلیس کیا ہے۔ براہ کرم تصدیق فرمائیں۔`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates direct pre-filled WhatsApp link for new Affiliate registration to notify owner
 */
export function generateAffiliateWhatsAppUrl(
  affiliate: AffiliateNotificationPayload,
  storeConfig?: StoreConfig
): string {
  const cleanNumber = (storeConfig?.whatsappNumber || OWNER_WHATSAPP).replace(/[^0-9]/g, "");

  const message =
    `🤝 *نیا ایفیلی ایٹ پارٹنر رجسٹریشن (${storeConfig?.brandName || "Al Raza Mart"})*\n\n` +
    `*پارٹنر کا نام:* ${affiliate.fullName}\n` +
    `*موبائل / واٹس ایپ:* ${affiliate.phone}\n` +
    `*ای میل:* ${affiliate.email}\n` +
    `*پیمنٹ میتھڈ:* ${affiliate.paymentMethod} (${affiliate.accountDetails})\n` +
    `*ریفرل کوڈ:* ${affiliate.referralCode}\n` +
    `*کمیشن:* 10% کیش کمیشن\n\n` +
    `السلام علیکم! میں نے الرضا مارٹ پر بطور ایفیلی ایٹ پارٹنر جوائن کیا ہے۔ براہ کرم میرا اکاؤنٹ ایکٹیو کریں۔`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
