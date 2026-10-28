import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Mock Batch Quality Certificate Database
const BATCH_DATABASE: Record<string, {
  batchNo: string;
  productName: string;
  seedOrigin: string;
  pressingDate: string;
  expiryDate: string;
  freeFattyAcids: string;
  peroxideValue: string;
  moistureContent: string;
  smokePoint: string;
  mineralOil: string;
  artificialColor: string;
  labCertificateNo: string;
  testingLab: string;
  status: "Passed - 100% Pure Virgin Grade" | "Verified";
}> = {
  "AR-GNT-2026-08": {
    batchNo: "AR-GNT-2026-08",
    productName: "Wood Pressed Groundnut (Peanut) Oil",
    seedOrigin: "Saurashtra Certified Non-GMO Farmers Collective, Gujarat",
    pressingDate: "2026-08-02",
    expiryDate: "2027-08-01",
    freeFattyAcids: "0.42% (Max limit: 1.5%)",
    peroxideValue: "1.8 meq/kg (Max limit: 10 meq/kg)",
    moistureContent: "0.08% (Max limit: 0.25%)",
    smokePoint: "225°C / 437°F",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / Zero Additives",
    labCertificateNo: "NABL/FSSAI-2026-8841A",
    testingLab: "AgroNutri Analytical Labs & Quality Council",
    status: "Passed - 100% Pure Virgin Grade",
  },
  "AR-COC-2026-08": {
    batchNo: "AR-COC-2026-08",
    productName: "Extra Virgin Cold Pressed Coconut Oil",
    seedOrigin: "Pollachi & Malabar Sun-Dried Sulfur-Free Copra, Kerala",
    pressingDate: "2026-08-04",
    expiryDate: "2027-08-03",
    freeFattyAcids: "0.21% (Max limit: 0.5%)",
    peroxideValue: "0.9 meq/kg (Max limit: 5 meq/kg)",
    moistureContent: "0.05% (Max limit: 0.1%)",
    smokePoint: "177°C / 350°F",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / Natural Pearlescent White to Crystal",
    labCertificateNo: "NABL/FSSAI-2026-9022C",
    testingLab: "Coastal Phytochemical Research Labs",
    status: "Passed - 100% Pure Virgin Grade",
  },
  "AR-SES-2026-08": {
    batchNo: "AR-SES-2026-08",
    productName: "Wood Pressed Black & White Sesame (Gingelly) Oil",
    seedOrigin: "Organic Heritage Black Til Farms, Tamil Nadu & Andhra",
    pressingDate: "2026-08-05",
    expiryDate: "2027-08-04",
    freeFattyAcids: "0.48% (Max limit: 1.5%)",
    peroxideValue: "1.4 meq/kg (Max limit: 10 meq/kg)",
    moistureContent: "0.09% (Max limit: 0.2%)",
    smokePoint: "210°C / 410°F",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / Naturally Extracted with Palm Jaggery",
    labCertificateNo: "NABL/FSSAI-2026-7731S",
    testingLab: "AyurVeda Pharmacopoeia Testing Cell",
    status: "Passed - 100% Pure Virgin Grade",
  },
  "AR-KAL-2026-07": {
    batchNo: "AR-KAL-2026-07",
    productName: "Pure Cold Pressed Black Seed (Kalonji) Oil",
    seedOrigin: "Nigella Sativa Direct Harvest, Madhya Pradesh",
    pressingDate: "2026-07-28",
    expiryDate: "2028-07-27",
    freeFattyAcids: "0.35% (Max limit: 1.0%)",
    peroxideValue: "1.2 meq/kg (Max limit: 5 meq/kg)",
    moistureContent: "0.04% (Max limit: 0.1%)",
    smokePoint: "Low (Therapeutic Raw & Dressing Grade)",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / Dark Amber with Rich Thymoquinone (1.8%)",
    labCertificateNo: "NABL/FSSAI-2026-6192K",
    testingLab: "Herbal Bio-Analysis Institute",
    status: "Passed - 100% Pure Virgin Grade",
  },
  "AR-MUS-2026-08": {
    batchNo: "AR-MUS-2026-08",
    productName: "Kachi Ghani Mustard (Sarson) Oil",
    seedOrigin: "Select Golden & Black Mustard Fields, Rajasthan",
    pressingDate: "2026-08-01",
    expiryDate: "2027-08-01",
    freeFattyAcids: "0.39% (Max limit: 1.5%)",
    peroxideValue: "1.5 meq/kg (Max limit: 10 meq/kg)",
    moistureContent: "0.07% (Max limit: 0.25%)",
    smokePoint: "250°C / 480°F",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / Natural Allyl Isothiocyanate Pungency",
    labCertificateNo: "NABL/FSSAI-2026-5510M",
    testingLab: "Northern Agri-Commodity Quality Labs",
    status: "Passed - 100% Pure Virgin Grade",
  },
  "AR-ALM-2026-07": {
    batchNo: "AR-ALM-2026-07",
    productName: "100% Pure Badam Roghan (Sweet Almond) Oil",
    seedOrigin: "Mamra & Gurbandi Kashmiri Almond Kernels",
    pressingDate: "2026-07-25",
    expiryDate: "2028-07-24",
    freeFattyAcids: "0.18% (Max limit: 0.5%)",
    peroxideValue: "0.8 meq/kg (Max limit: 5 meq/kg)",
    moistureContent: "0.03% (Max limit: 0.1%)",
    smokePoint: "216°C / 420°F",
    mineralOil: "Negative / Not Detected (0.00%)",
    artificialColor: "Nil / 100% Edible & Cosmetic Grade",
    labCertificateNo: "NABL/FSSAI-2026-4402A",
    testingLab: "Apex Dermatological & Food Safety Laboratory",
    status: "Passed - 100% Pure Virgin Grade",
  }
};

// API Endpoints
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    mart: "Al Raza Cold Press Oil Mart",
    timestamp: new Date().toISOString(),
  });
});

// Batch Quality Verification Endpoint
app.get("/api/batch-verify/:batchNo", (req, res) => {
  const { batchNo } = req.params;
  const cleanBatch = batchNo.trim().toUpperCase();
  
  if (BATCH_DATABASE[cleanBatch]) {
    res.json({
      found: true,
      report: BATCH_DATABASE[cleanBatch],
    });
  } else {
    // Return sample matches or not found
    const available = Object.keys(BATCH_DATABASE);
    res.status(404).json({
      found: false,
      message: `Batch ID ${cleanBatch} not found in current public registry.`,
      sampleBatches: available,
    });
  }
});

// List all known verified batches
app.get("/api/batches", (_req, res) => {
  res.json({
    batches: Object.values(BATCH_DATABASE),
  });
});

// Initialize Email & Twilio clients (Lazy loaded/guarded in case env vars are missing)
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

let emailTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Create Order & Notify Store Owner
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    console.log("New Order Received:", orderData.orderId);
    
    // 1. Send SMS Notification via Twilio to Store Owner
    const ownerPhone = "03292832225";
    const smsBody = `New Order: ${orderData.orderId}\nTotal: Rs.${orderData.totalAmount}\nCustomer: ${orderData.customerName}\nPhone: ${orderData.customerPhone}`;
    
    if (twilioClient && process.env.TWILIO_FROM_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: smsBody,
          from: process.env.TWILIO_FROM_NUMBER,
          to: ownerPhone
        });
        console.log("SMS notification sent to owner successfully.");
      } catch (smsError) {
        console.error("Failed to send Twilio SMS:", smsError);
      }
    } else {
      console.log(`[Twilio Mock] SMS to ${ownerPhone}:`, smsBody);
      console.log("Note: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER missing in env. Simulated SMS delivery.");
    }

    // 2. Send Real Email Notification to Store Owner (FormSubmit + fallback)
    const ownerEmail = (orderData.targetEmail || "tshirtsprintingworld@gmail.com").trim();
    
    // Dispatch via FormSubmit from backend
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ownerEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          _subject: `🚨 [NEW ORDER #${orderData.orderId}] Rs. ${orderData.totalAmount} - ${orderData.customerName}`,
          _template: "table",
          _captcha: "false",
          "Order ID": `#${orderData.orderId}`,
          "Customer Name": orderData.customerName,
          "Customer Phone": orderData.customerPhone,
          "Customer Email": orderData.customerEmail || "Not Provided",
          "Delivery Address": orderData.deliveryAddress,
          "City": orderData.city || "Pakistan",
          "Payment Method": orderData.paymentMethod || "Cash on Delivery",
          "Total Payable": `Rs. ${orderData.totalAmount}`,
          "Items Ordered": orderData.itemsSummary || "View in Admin Panel",
          "Date": new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        }),
      });
      console.log(`Email notification successfully dispatched to ${ownerEmail}`);
    } catch (fsErr) {
      console.warn("Backend FormSubmit email dispatch error:", fsErr);
    }

    if (emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_USER,
          to: ownerEmail,
          subject: `New Order Received - ${orderData.orderId} - Al Raza Mart`,
          html: `<h3>New Order Received: #${orderData.orderId}</h3><p>Amount: Rs. ${orderData.totalAmount}</p><p>Customer: ${orderData.customerName} (${orderData.customerPhone})</p><pre>${orderData.itemsSummary}</pre>`
        });
      } catch (emailErr) {
        console.error("Nodemailer dispatch note:", emailErr);
      }
    }

    // 3. Instant Push Notification via Ntfy.sh (No Auth Required)
    try {
      await fetch("https://ntfy.sh/alraza_coldpress_orders", {
        method: "POST",
        body: `Order ID: ${orderData.orderId}\nCustomer: ${orderData.customerName}\nAmount: Rs. ${orderData.totalAmount}\nItems: ${orderData.itemsSummary || "View details in panel"}`,
        headers: {
          "Title": "New Order on Al Raza Mart!",
          "Tags": "moneybag,green_salad,bell",
          "Priority": "high"
        }
      });
    } catch (e) {
      console.error("Ntfy push error:", e);
    }

    res.json({ success: true, message: "Order processed and notifications triggered successfully." });
  } catch (error) {
    console.error("Order processing error:", error);
    res.status(500).json({ error: "Failed to process order." });
  }
});

// Affiliate Partner Registration Notification API
app.post("/api/notify-affiliate", async (req, res) => {
  try {
    const affiliate = req.body;
    const ownerEmail = (affiliate.targetEmail || "tshirtsprintingworld@gmail.com").trim();
    console.log("New Affiliate Registered:", affiliate.fullName);

    // Send FormSubmit email to owner
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ownerEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          _subject: `🤝 [NEW AFFILIATE PARTNER] ${affiliate.fullName} (${affiliate.referralCode})`,
          _template: "table",
          _captcha: "false",
          "Partner Name": affiliate.fullName,
          "Mobile / WhatsApp": affiliate.phone,
          "Email Address": affiliate.email,
          "Payout Method": affiliate.paymentMethod,
          "Account Details": affiliate.accountDetails,
          "Assigned Referral Code": affiliate.referralCode,
          "Registration Date": affiliate.createdAt || new Date().toLocaleString(),
        }),
      });
      console.log(`Affiliate notification email sent to ${ownerEmail}`);
    } catch (fsErr) {
      console.warn("Affiliate FormSubmit dispatch error:", fsErr);
    }

    // Push notification via Ntfy
    try {
      await fetch("https://ntfy.sh/alraza_coldpress_orders", {
        method: "POST",
        body: `New Affiliate Signup!\nName: ${affiliate.fullName}\nPhone: ${affiliate.phone}\nCode: ${affiliate.referralCode}\nAccount: ${affiliate.paymentMethod} - ${affiliate.accountDetails}`,
        headers: {
          "Title": "New Affiliate Partner Joined!",
          "Tags": "handshake,money_with_wings",
          "Priority": "high",
        },
      });
    } catch {}

    res.json({ success: true, message: "Affiliate notification processed successfully." });
  } catch (error) {
    console.error("Affiliate notification error:", error);
    res.status(500).json({ error: "Failed to process affiliate notification." });
  }
});

// Bulk & Mart Visit Inquiry API
app.post("/api/inquiry", (req, res) => {
  const { name, phone, email, inquiryType, message, quantityNeeded } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and contact number are required." });
  }

  const inquiryId = "INQ-" + Math.floor(10000 + Math.random() * 90000);

  res.json({
    success: true,
    inquiryId,
    message: "Inquiry received. Our Mart Master will reach out within 2 business hours via WhatsApp/Call.",
  });
});

// Server start & Vite integration
async function startServer() {
  // Serve public directory for static assets (hero banners, logos, webp assets)
  app.use(express.static(path.join(process.cwd(), "public"), {
    maxAge: "7d",
    etag: true,
  }));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Al Raza Cold Press Oil Mart server running on port ${PORT}`);
  });
}

startServer();
