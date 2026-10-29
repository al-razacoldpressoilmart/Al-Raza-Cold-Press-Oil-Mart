import { StoreConfig } from "../data/storeConfig";
import { getWorkspaceAccessToken, sendGmailEmail } from "../lib/googleWorkspace";

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

export const DEFAULT_OWNER_EMAIL = "tshirtsprintingworld@gmail.com";
export const OWNER_WHATSAPP = "923292832225";

/**
 * Sends a real-time order confirmation email to the store owner's Gmail.
 * First tries official Google Workspace Gmail API if connected (100% inbox delivery),
 * then failovers to FormSubmit and server-side mailer.
 */
export async function sendOrderEmailNotification(
  order: OrderNotificationPayload,
  storeConfig?: StoreConfig
): Promise<{ success: boolean; method: string }> {
  const targetEmail = storeConfig?.notificationEmail?.trim() || DEFAULT_OWNER_EMAIL;

  const itemsListString = order.items
    .map((it, idx) => {
      const size = it.sizeName || "Pack";
      return `${idx + 1}. ${it.product?.name || "Product"} (${size}) x ${it.quantity} = Rs. ${it.price * it.quantity}`;
    })
    .join("\n");

  // 1. PRIMARY: If Google Workspace OAuth is active, send directly via official Gmail API
  const token = getWorkspaceAccessToken();
  if (token) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #047857; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">🛒 New Customer Order Received!</h2>
            <p style="margin: 4px 0 0; font-size: 14px;">Order #${order.orderId} • Rs. ${order.totalAmount}</p>
          </div>
          <table style="width: 100%; margin-top: 16px; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b;">Customer Name:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${order.customerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 8px 0; font-weight: bold; color: #047857;"><a href="tel:${order.customerPhone}" style="color: #047857;">${order.customerPhone}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Delivery Address:</td><td style="padding: 8px 0; color: #0f172a;">${order.deliveryAddress}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">City:</td><td style="padding: 8px 0; color: #0f172a;">${order.city}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Payment Method:</td><td style="padding: 8px 0; color: #0f172a;">${order.paymentMethod} ${order.tidNumber ? `(TID: ${order.tidNumber})` : ''}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Total Amount:</td><td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #047857;">Rs. ${order.totalAmount}</td></tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <h4 style="margin: 0 0 8px; color: #0f172a;">Ordered Items:</h4>
          <pre style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #334155; white-space: pre-wrap;">${itemsListString}</pre>
          ${order.deliveryNotes ? `<p style="font-size: 13px; color: #64748b;"><strong>Notes:</strong> ${order.deliveryNotes}</p>` : ''}
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/${String(order.customerPhone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${order.customerName}! Your order #${order.orderId} at Al Raza Mart has been received and confirmed.`)}" 
               style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Contact Customer on WhatsApp
            </a>
          </div>
        </div>
      `;

      await sendGmailEmail({
        to: targetEmail,
        subject: `🚨 [NEW ORDER #${order.orderId}] Rs. ${order.totalAmount} - ${order.customerName}`,
        bodyHtml: emailHtml,
        accessToken: token,
      });

      return { success: true, method: "gmail_api" };
    } catch (gErr) {
      console.warn("Gmail API direct dispatch fallback:", gErr);
    }
  }

  // 2. SECONDARY: FormSubmit AJAX with table template
  const formData = {
    _subject: `🚨 [NEW ORDER #${order.orderId}] Rs. ${order.totalAmount} - ${order.customerName}`,
    _template: "table",
    _captcha: "false",
    "Order ID": `#${order.orderId}`,
    "Customer Name": order.customerName,
    "Customer Phone": order.customerPhone,
    "Delivery Address": order.deliveryAddress,
    "City": order.city,
    "Payment Method": order.paymentMethod + (order.tidNumber ? ` (TID: ${order.tidNumber})` : ""),
    "Subtotal": `Rs. ${order.subtotal}`,
    "Delivery Fee": order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`,
    "Promo Discount": order.promoDiscount > 0 ? `-Rs. ${order.promoDiscount}` : "None",
    "TOTAL PAYABLE AMOUNT": `Rs. ${order.totalAmount}`,
    "Items Ordered": itemsListString,
    "Customer Notes": order.deliveryNotes || "None",
    "Order Date": new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    "Store Name": storeConfig?.brandName || "Al Raza Pure Organic Mart",
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Notify backend server route
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        targetEmail,
        itemsSummary: itemsListString,
      }),
    }).catch(() => {});

    return { success: response.ok, method: "formsubmit" };
  } catch (error) {
    console.warn("FormSubmit order email dispatch error:", error);
    // Still notify backend route
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...order,
        targetEmail,
        itemsSummary: itemsListString,
      }),
    }).catch(() => {});

    return { success: false, method: "failed" };
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

  // Try Gmail API first if token present
  const token = getWorkspaceAccessToken();
  if (token) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #7c3aed; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">🤝 New Affiliate Partner Registered!</h2>
            <p style="margin: 4px 0 0; font-size: 14px;">${affiliate.fullName} • Referral Code: ${affiliate.referralCode}</p>
          </div>
          <table style="width: 100%; margin-top: 16px; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748b;">Partner Name:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${affiliate.fullName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 8px 0; font-weight: bold; color: #7c3aed;"><a href="tel:${affiliate.phone}" style="color: #7c3aed;">${affiliate.phone}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Email Address:</td><td style="padding: 8px 0; color: #0f172a;">${affiliate.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Payout Method:</td><td style="padding: 8px 0; color: #0f172a;">${affiliate.paymentMethod} (${affiliate.accountDetails})</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Assigned Referral Code:</td><td style="padding: 8px 0; font-weight: bold; color: #047857;">${affiliate.referralCode}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Commission Rate:</td><td style="padding: 8px 0; font-weight: bold; color: #047857;">10% Cash Commission</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Promotion Channel:</td><td style="padding: 8px 0; color: #0f172a;">${affiliate.platform || 'Social Media / WhatsApp'}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/${String(affiliate.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${affiliate.fullName}! Welcome to the Al Raza Mart Affiliate Program. Your referral code "${affiliate.referralCode}" is now active.`)}" 
               style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Message Partner on WhatsApp
            </a>
          </div>
        </div>
      `;

      await sendGmailEmail({
        to: targetEmail,
        subject: `🤝 [NEW AFFILIATE PARTNER] ${affiliate.fullName} (${affiliate.referralCode})`,
        bodyHtml: emailHtml,
        accessToken: token,
      });

      return true;
    } catch (gErr) {
      console.warn("Gmail API affiliate dispatch fallback:", gErr);
    }
  }

  // Fallback to FormSubmit
  const formData = {
    _subject: `🤝 [NEW AFFILIATE PARTNER] ${affiliate.fullName} (${affiliate.referralCode})`,
    _template: "table",
    _captcha: "false",
    "Partner Full Name": affiliate.fullName,
    "Mobile / WhatsApp": affiliate.phone,
    "Email Address": affiliate.email,
    "Payout Method": affiliate.paymentMethod,
    "Account Details": affiliate.accountDetails,
    "Assigned Referral Code": affiliate.referralCode,
    "Commission Rate": `${storeConfig?.affiliateCommissionRate || 10}% per order`,
    "Promotion Channel": affiliate.platform || "WhatsApp / Social Media",
    "Registration Date": affiliate.createdAt,
    "Store Name": storeConfig?.brandName || "Al Raza Pure Organic Mart",
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

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
 * Triggers FormSubmit activation test email so owner can confirm their inbox/spam folder
 */
export async function triggerFormSubmitVerification(targetEmail: string): Promise<boolean> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "🧪 [Al Raza Mart] Email Notification Test & Activation",
        _template: "table",
        _captcha: "false",
        "Test Status": "SUCCESSFUL",
        "Destination Email": targetEmail,
        "Timestamp": new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        "Message": "Your store notification endpoint is now active! If this is your first time, make sure to check your Spam folder if needed.",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Generates direct pre-filled WhatsApp link in 100% ENGLISH for Store Owner (03292832225)
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
    `🛒 *NEW ORDER RECEIVED - ${storeConfig?.brandName || "Al Raza Pure Organic Mart"}*\n\n` +
    `*Order ID:* #${order.orderId}\n` +
    `*Customer Name:* ${order.customerName}\n` +
    `*Phone / WhatsApp:* ${order.customerPhone}\n` +
    `*Delivery Address:* ${order.deliveryAddress}\n` +
    `*City:* ${order.city}\n` +
    `*Payment Method:* ${order.paymentMethod}${order.tidNumber ? ` (TID: ${order.tidNumber})` : ""}\n\n` +
    `*Ordered Items:*\n${itemsList}\n\n` +
    `*Subtotal:* Rs. ${order.subtotal}\n` +
    `*Delivery Charges:* ${order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`}\n` +
    `*Promo Discount:* ${order.promoDiscount > 0 ? `-Rs. ${order.promoDiscount}` : "None"}\n` +
    `*TOTAL PAYABLE AMOUNT:* Rs. ${order.totalAmount}\n` +
    (order.deliveryNotes ? `\n*Special Instructions:* ${order.deliveryNotes}\n` : "") +
    `\nHello! I have placed this order on Al Raza Mart. Please confirm and dispatch my parcel.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates direct pre-filled WhatsApp link in 100% ENGLISH for new Affiliate registration
 */
export function generateAffiliateWhatsAppUrl(
  affiliate: AffiliateNotificationPayload,
  storeConfig?: StoreConfig
): string {
  const cleanNumber = (storeConfig?.whatsappNumber || OWNER_WHATSAPP).replace(/[^0-9]/g, "");

  const message =
    `🤝 *NEW AFFILIATE PARTNER REGISTRATION - ${storeConfig?.brandName || "Al Raza Mart"}*\n\n` +
    `*Partner Name:* ${affiliate.fullName}\n` +
    `*Mobile / WhatsApp:* ${affiliate.phone}\n` +
    `*Email Address:* ${affiliate.email}\n` +
    `*Payout Method:* ${affiliate.paymentMethod} (${affiliate.accountDetails})\n` +
    `*Assigned Referral Code:* ${affiliate.referralCode}\n` +
    `*Commission Rate:* 10% Cash Commission per order\n` +
    `*Promotion Channel:* ${affiliate.platform || "WhatsApp / Social Media"}\n\n` +
    `Hello! I have registered as an official affiliate partner on Al Raza Mart. Please approve and activate my partner account.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
