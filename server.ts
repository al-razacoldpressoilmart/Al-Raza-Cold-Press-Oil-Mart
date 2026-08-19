import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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

// Oil Wellness & Recommendation AI Advisor Endpoint
app.post("/api/gemini/oil-advisor", async (req, res) => {
  try {
    const { query, healthGoal, cookingStyle, concern, currentDiet } = req.body;

    const ai = getGenAI();

    // Fallback if no API key configured
    if (!ai) {
      return res.json({
        advice: `Based on your interest in ${healthGoal || concern || "cold pressed pure oils"}, Al Raza Cold Press Oil Mart recommends:
- **Daily Cooking**: Wood Pressed Groundnut (Peanut) Oil (high smoke point 225°C, balanced MUFA/PUFA, zero cholesterol).
- **Heart & Immunity**: Extra Virgin Coconut Oil (Lauric acid) & Cold Pressed Black Seed / Kalonji Oil (Thymoquinone).
- **South Indian & Traditional Tadka**: Wood Pressed Gingelly (Sesame) Oil (Rich Sesamol & Natural Antioxidants).
- **Hair & Skin Nourishment**: Pure Sweet Almond (Badam Roghan) & Virgin Coconut Oil.

*All Al Raza oils are extracted on slow-moving wooden churners (Mara Chekku) below 38°C to retain all natural enzymes, vitamins, and aroma.*`,
        recommendedProducts: [
          "Wood Pressed Groundnut Oil",
          "Extra Virgin Coconut Oil",
          "Cold Pressed Black Seed (Kalonji) Oil",
          "Wood Pressed Sesame (Gingelly) Oil",
        ],
        usageTips: [
          "Store in dark amber glass bottles away from direct sunlight.",
          "Natural cold pressed oils have slight sediment at the bottom — this is proof of unrefined pure seed fiber.",
          "Use medium heat for traditional cooking to preserve delicate polyphenols.",
        ],
      });
    }

    const prompt = `You are the Master Oil Craftsman and Nutritional Wellness Sommelier at "Al Raza Cold Press Oil Mart". 
Al Raza Mart specializes in 100% pure traditional wood-pressed (Mara Chekku / Kachi Ghani) unrefined virgin oils:
1. Wood Pressed Groundnut (Peanut) Oil (High smoke point 225°C, heart health, ideal for deep frying, sautéing, curries)
2. Extra Virgin Cold Pressed Coconut Oil (Raw copra extraction, Lauric acid, digestion, golden milk, skin/hair, baking)
3. Wood Pressed Sesame / Gingelly Oil (Pressed with traditional palm jaggery, rich in Sesamol, ideal for pickles, tadka, dosa, Ayurvedic oil pulling)
4. Kachi Ghani Mustard Oil (Strong natural pungency, Allyl isothiocyanate, northern curries, fish, joint massage)
5. Cold Pressed Black Seed (Kalonji) Oil (Therapeutic Nigella Sativa, powerful immunity, asthma/digestion, 1 tsp morning ritual)
6. Pure Sweet Almond (Badam Roghan) Oil (Brain food, baby massage, glowing skin, 100% edible)
7. Cold Pressed Flaxseed (Alsi) Oil (Rich plant-based Omega-3 ALA, salad dressing, raw smoothies, heart cholesterol)
8. Virgin Castor Oil (Wood pressed, thick therapeutic grade, hair density, eyebrow growth, gut cleanse)

User details:
- User Question / Inquiry: ${query || "Recommend the best cold pressed oils for my family"}
- Primary Health Goal: ${healthGoal || "Overall Vitality & Clean Eating"}
- Cooking Style / Daily Usage: ${cookingStyle || "Everyday Indian / Global Cooking"}
- Specific Health Concern or Preference: ${concern || "Heart health and reducing refined chemical oils"}
- Diet / Lifestyle: ${currentDiet || "Standard healthy home cooking"}

Please provide a structured, friendly, knowledgeable response with:
1. Personalized recommendation explaining why specific Al Raza cold pressed oils match their lifestyle.
2. Cooking / Usage rituals (including temperature guidelines, smoke points, internal or topical usage).
3. The health comparison vs commercial refined oils (chemical hexane solvent vs slow cold wood press).
4. A concise bullet list of Top 2-3 Recommended Al Raza Products.
Keep formatting clean with clear markdown headings and bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({
      advice: response.text,
    });
  } catch (error: any) {
    console.error("Gemini advisor error:", error);
    res.status(500).json({
      error: "Unable to consult Oil Advisor at the moment.",
      message: error.message,
    });
  }
});

// Order Placement API
app.post("/api/orders", (req, res) => {
  const { customerName, phone, email, address, items, paymentMethod, totalAmount, notes } = req.body;

  if (!customerName || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required order information." });
  }

  const orderId = "AR-" + Math.floor(100000 + Math.random() * 900000);
  const estimatedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  res.json({
    success: true,
    orderId,
    estimatedDelivery,
    totalAmount,
    customerName,
    message: "Thank you for choosing 100% pure cold-pressed oils from Al Raza Mart!",
  });
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
