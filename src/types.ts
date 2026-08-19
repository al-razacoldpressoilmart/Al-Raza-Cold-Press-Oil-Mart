export type CategoryType = "all" | "cooking" | "wellness" | "beauty" | "bundles";

export interface OilSizeOption {
  size: string; // e.g. "250ml", "500ml", "1 Litre", "5 Litre Canister"
  price: number;
  originalPrice: number;
  inStock: boolean;
  stockQuantity?: number; // Current inventory count in units
  lowStockThreshold?: number; // Stock warning threshold (default 5)
}

export interface OilNutrition {
  caloriesPer100g: number;
  monounsaturatedFat: string;
  polyunsaturatedFat: string;
  saturatedFat: string;
  vitaminE: string;
  omega3: string;
  omega6: string;
  antioxidants: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  authorEmail?: string;
  authorCity?: string;
  rating: number; // 1 to 5 stars
  title?: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  status: "approved" | "pending" | "rejected";
  helpfulVotes?: number;
  ownerReply?: string;
  isFeatured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  nativeName: string;
  category: "cooking" | "wellness" | "beauty" | "bundles";
  tag: string;
  description: string;
  shortDescription: string;
  heroImage: string;
  seedOrigin: string;
  woodType: string; // e.g., "304 Stainless Steel Cold Screw Extractor"
  extractionTemp: string; // e.g., "Cold Extracted < 38°C"
  smokePoint: string; // e.g., "225°C / 437°F"
  aromaTaste: string;
  colorProfile: string;
  batchNo: string;
  sizes: OilSizeOption[];
  benefits: string[];
  bestFor: string[];
  nutrition: OilNutrition;
  rating: number;
  reviewsCount: number;
  badge?: string;
  featured?: boolean;
  totalStock?: number;
}

export interface CartItem {
  id: string; // unique item id = `${productId}-${sizeIndex}`
  product: Product;
  selectedSizeIndex: number;
  quantity: number;
}

export interface BatchTestReport {
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
}

export interface Recipe {
  id: string;
  title: string;
  category: "Traditional Cooking" | "Ayurvedic Remedy" | "Beauty & Hair Care" | "Immunity Drinks";
  oilUsed: string;
  prepTime: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  wellnessBenefit: string;
  image?: string;
}
