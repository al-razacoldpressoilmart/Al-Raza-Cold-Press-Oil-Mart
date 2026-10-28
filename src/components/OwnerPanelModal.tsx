import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Lock, 
  Palette, 
  ShoppingBag, 
  Image as ImageIcon, 
  Phone, 
  MapPin, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Save, 
  RefreshCw, 
  Search, 
  Eye, 
  AlertCircle,
  ExternalLink,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  DollarSign,
  Users,
  MessageCircle,
  Copy,
  FolderOpen,
  TrendingUp,
  Package,
  Star,
  ShieldCheck,
  PackageX,
  AlertTriangle,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Share2,
  Download,
  FileSpreadsheet,
  Tag,
  FileText,
  Building2,
  Droplet,
  Flame,
  Wheat,
  Percent,
  Mail,
  HardDrive
} from "lucide-react";
import { Product, ProductReview, AffiliatePartner } from "../types";
import { COLOR_THEMES, ColorTheme } from "../data/themes";
import { StoreConfig, PaymentMethodConfig } from "../data/storeConfig";
import { ASSETS } from "../assets/images";
import { OwnerAnalyticsDashboard } from "./owner/OwnerAnalyticsDashboard";
import { OwnerInventoryManager } from "./owner/OwnerInventoryManager";
import { OwnerReviewsModeration } from "./owner/OwnerReviewsModeration";
import { OwnerDeliverySettings } from "./owner/OwnerDeliverySettings";
import { OwnerAffiliateManager } from "./owner/OwnerAffiliateManager";
import { OwnerOrdersManager } from "./owner/OwnerOrdersManager";
import { Truck } from "lucide-react";
import { compressImageFile } from "../utils/imageCompressor";

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  storeConfig: StoreConfig;
  onSaveStoreConfig: (newConfig: StoreConfig) => void;
  activeThemeId: string;
  onChangeTheme: (themeId: string) => void;
  orders: any[];
  onDeleteOrder: (orderId: string) => void;
  reviews?: ProductReview[];
  onApproveReview?: (reviewId: string) => void;
  onRejectReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onToggleFeatureReview?: (reviewId: string) => void;
  onSaveOwnerReply?: (reviewId: string, replyText: string) => void;
  onOpenWorkspace?: () => void;
}

export const OwnerPanelModal: React.FC<OwnerPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  storeConfig,
  onSaveStoreConfig,
  activeThemeId,
  onChangeTheme,
  orders,
  onDeleteOrder,
  reviews = [],
  onApproveReview = () => {},
  onRejectReview = () => {},
  onDeleteReview = () => {},
  onToggleFeatureReview = () => {},
  onSaveOwnerReply = () => {},
  onOpenWorkspace,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Active Owner Tab
  const [activeTab, setActiveTab] = useState<
    | "analytics"
    | "inventory"
    | "reviews"
    | "themes"
    | "products"
    | "orders"
    | "shipping"
    | "logo_hero"
    | "payments"
    | "contacts"
    | "affiliates"
    | "seo"
    | "wholesale"
  >("analytics");

  const [themeCategory, setThemeCategory] = useState<string>("all");
  const [themeSearch, setThemeSearch] = useState("");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Wholesale Bulk Inquiries state
  const [wholesaleInquiries, setWholesaleInquiries] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("alraza_wholesale_inquiries");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const reloadWholesaleInquiries = () => {
    try {
      const saved = localStorage.getItem("alraza_wholesale_inquiries");
      if (saved) setWholesaleInquiries(JSON.parse(saved));
    } catch {}
  };

  // Inline Delete Confirmation States (replaces window.confirm for iframe reliability)
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [confirmDeleteAffId, setConfirmDeleteAffId] = useState<string | null>(null);
  const [confirmDeletePaymentIdx, setConfirmDeletePaymentIdx] = useState<number | null>(null);

  // Product CRUD State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Store Configuration Form
  const [configForm, setConfigForm] = useState<StoreConfig>({ ...storeConfig });

  // Uploading progress states
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);

  // Affiliates State (loaded from localStorage)
  const [affiliateList, setAffiliateList] = useState<AffiliatePartner[]>([]);

  // File Input Refs for Browser Upload
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Sync config form when storeConfig prop changes
  useEffect(() => {
    setConfigForm({ ...storeConfig });
  }, [storeConfig]);

  // Load Affiliates
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alraza_all_affiliates");
      if (saved) {
        setAffiliateList(JSON.parse(saved));
      } else {
        const initialSample: AffiliatePartner[] = [
          {
            id: "AFF-101",
            name: "Dr. Ayesha Nutritionist",
            phone: "03001234567",
            email: "ayesha.health@gmail.com",
            paymentMethod: "EasyPaisa",
            accountDetails: "03001234567 - Ayesha Khan",
            referralCode: "AYESHA10",
            customDiscount: "10% Off",
            platform: "Nutrition Clinic",
            createdAt: "01/08/2026",
            status: "active",
          },
          {
            id: "AFF-102",
            name: "Tariq Organic Kitchen",
            phone: "03217654321",
            email: "tariq.kitchen@gmail.com",
            paymentMethod: "Meezan Bank",
            accountDetails: "PK00MEZN00123456789 - Tariq Mahmood",
            referralCode: "TARIQ10",
            customDiscount: "10% Off",
            platform: "Food Blogger & YouTube",
            createdAt: "03/08/2026",
            status: "active",
          },
        ];
        setAffiliateList(initialSample);
        localStorage.setItem("alraza_all_affiliates", JSON.stringify(initialSample));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === "ads546rf") {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleSaveStoreConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveStoreConfig(configForm);
    localStorage.setItem("alraza_store_config", JSON.stringify(configForm));
    showNotification("Website Logo, Banner & Store Settings Saved Successfully!");
  };

  // Browser Upload Handlers using high-quality compressed base64
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      try {
        const compressedBase64 = await compressImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.8 });
        if (compressedBase64) {
          const updated = { ...configForm, logoUrl: compressedBase64 };
          setConfigForm(updated);
          onSaveStoreConfig(updated);
          localStorage.setItem("alraza_store_config", JSON.stringify(updated));
          showNotification("Logo file uploaded and saved successfully!");
        } else {
          showNotification("Unable to process image. Please try another image file.");
        }
      } catch (err) {
        console.error("Logo upload error:", err);
        showNotification("Failed to upload logo. Please try again.");
      } finally {
        setIsUploadingLogo(false);
        if (e.target) e.target.value = "";
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingBanner(true);
      try {
        const compressedBase64 = await compressImageFile(file, { maxWidth: 1280, maxHeight: 720, quality: 0.75 });
        if (compressedBase64) {
          const updated = { ...configForm, heroImage: compressedBase64 };
          setConfigForm(updated);
          onSaveStoreConfig(updated);
          localStorage.setItem("alraza_store_config", JSON.stringify(updated));
          showNotification("Hero Banner uploaded, applied & saved successfully!");
        } else {
          showNotification("Unable to read image. Please select a valid picture file.");
        }
      } catch (err) {
        console.error("Banner upload error:", err);
        showNotification("Failed to upload banner picture. Please try again.");
      } finally {
        setIsUploadingBanner(false);
        if (e.target) e.target.value = "";
      }
    }
  };

  const handleBannerDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setIsUploadingBanner(true);
      try {
        const compressedBase64 = await compressImageFile(file, { maxWidth: 1280, maxHeight: 720, quality: 0.75 });
        if (compressedBase64) {
          const updated = { ...configForm, heroImage: compressedBase64 };
          setConfigForm(updated);
          onSaveStoreConfig(updated);
          localStorage.setItem("alraza_store_config", JSON.stringify(updated));
          showNotification("Hero Banner dropped, applied & saved successfully!");
        }
      } catch (err) {
        console.error("Banner drop upload error:", err);
        showNotification("Failed to process dropped image.");
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      setIsUploadingProductImg(true);
      try {
        const compressedBase64 = await compressImageFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 });
        if (compressedBase64) {
          setEditingProduct((prev) => (prev ? { ...prev, heroImage: compressedBase64 } : null));
          showNotification("Product picture uploaded & compressed!");
        }
      } catch (err) {
        console.error("Product image error:", err);
        showNotification("Failed to upload product picture.");
      } finally {
        setIsUploadingProductImg(false);
        if (e.target) e.target.value = "";
      }
    }
  };

  // Product Delete Handler (Active & Direct)
  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const prodName = prod ? prod.name : "Product";
    onDeleteProduct(productId);
    if (editingProduct?.id === productId) {
      setEditingProduct(null);
    }
    setConfirmDeleteProdId(null);
    showNotification(`"${prodName}" has been permanently deleted from catalog.`);
  };

  // Order Delete Handler (Active & Direct)
  const handleDeleteOrder = (orderId: string) => {
    onDeleteOrder(orderId);
    setConfirmDeleteOrderId(null);
    showNotification(`Order #${orderId} deleted successfully.`);
  };

  // CSV Export for Orders
  const handleDownloadOrdersCSV = () => {
    if (!orders || orders.length === 0) {
      showNotification("No orders found to export as CSV.");
      return;
    }

    try {
      const headers = [
        "Order ID",
        "Order Date",
        "Customer Name",
        "Phone Number",
        "Customer Email",
        "Delivery Address",
        "City",
        "Payment Method",
        "Payment Status",
        "Transaction TID / Ref",
        "Order Fulfillment Status",
        "Total Amount (PKR)",
        "Items Ordered Summary",
        "Special Instructions"
      ];

      const escapeCSV = (val: any): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = orders.map((ord: any) => {
        let itemsStr = "";
        if (Array.isArray(ord.items)) {
          itemsStr = ord.items
            .map((i: any) => `${i.product?.name || i.name || "Cold Press Oil"} (${i.selectedSize || i.size || ""}) x${i.quantity || 1}`)
            .join("; ");
        } else if (typeof ord.itemsSummary === "string") {
          itemsStr = ord.itemsSummary;
        }

        return [
          escapeCSV(ord.orderId || ord.id || ""),
          escapeCSV(ord.date || ord.createdAt || new Date().toLocaleDateString()),
          escapeCSV(ord.customerName || ""),
          escapeCSV(ord.phone || ord.customerPhone || ""),
          escapeCSV(ord.email || ord.customerEmail || ""),
          escapeCSV(ord.address || ord.shippingAddress || ord.deliveryAddress || ""),
          escapeCSV(ord.city || "Karachi"),
          escapeCSV(ord.paymentMethod || "cod"),
          escapeCSV(ord.paymentStatus || "pending"),
          escapeCSV(ord.tidNumber || ord.tid || "N/A"),
          escapeCSV(ord.status || "pending"),
          escapeCSV(ord.totalAmount ?? 0),
          escapeCSV(itemsStr),
          escapeCSV(ord.specialInstructions || ord.notes || "")
        ].join(",");
      });

      const csvContent = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `AlRaza_Orders_Export_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification(`Successfully exported ${orders.length} orders as CSV file!`);
    } catch (e) {
      console.error("CSV Export failed", e);
      showNotification("Failed to generate CSV export file.");
    }
  };

  // Affiliate Delete Handler (Active & Direct)
  const handleDeleteAffiliate = (id: string, name: string) => {
    const updated = affiliateList.filter((a) => a.id !== id);
    setAffiliateList(updated);
    try {
      localStorage.setItem("alraza_all_affiliates", JSON.stringify(updated));
    } catch (e) {
      console.warn("Affiliate local storage sync:", e);
    }
    setConfirmDeleteAffId(null);
    showNotification(`Affiliate partner "${name}" removed successfully.`);
  };

  // Payment Method Delete Handler (Active & Direct)
  const handleDeletePaymentMethod = (pIdx: number) => {
    const pm = configForm.paymentMethods[pIdx];
    const pmName = pm ? pm.name : "Payment method";
    const updated = configForm.paymentMethods.filter((_, i) => i !== pIdx);
    const newConfig = { ...configForm, paymentMethods: updated };
    setConfigForm(newConfig);
    onSaveStoreConfig(newConfig);
    setConfirmDeletePaymentIdx(null);
    showNotification(`Payment method "${pmName}" deleted.`);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setIsNewProduct(false);
  };

  // Preset image collections for quick 1-click select
  const SPICE_PRESET_IMAGES = [
    { label: "Turmeric (Haldi)", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80" },
    { label: "Red Chili (Lal Mirch)", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
    { label: "Coriander (Dhaniya)", url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80" },
    { label: "Garam Masala", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80" },
    { label: "Cumin (Zeera)", url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80" },
    { label: "Black Pepper", url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80" },
  ];

  const FLOUR_PRESET_IMAGES = [
    { label: "Stone-Ground Whole Wheat Flour", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" },
    { label: "Chana Besan (Gram Flour)", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80" },
    { label: "Makai Corn Flour", url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80" },
    { label: "Barley Flour", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80" },
  ];

  const OIL_PRESET_IMAGES = [
    { label: "Mustard (Sarson)", url: ASSETS.mustardHero },
    { label: "Olive (Zaitoon)", url: ASSETS.olivePlasticBottle },
    { label: "Coconut (Nariyal)", url: ASSETS.coconutOil },
    { label: "Sesame (Til)", url: ASSETS.sesameOil },
    { label: "Black Seed (Kalonji)", url: ASSETS.kalonjiOil },
    { label: "Sweet Almond", url: ASSETS.almondOil },
  ];

  const BEAUTY_PRESET_IMAGES = [
    { label: "7-Herb Hair Growth", url: "https://images.unsplash.com/photo-1608248597359-46743b10b037?auto=format&fit=crop&w=800&q=80" },
    { label: "Castor Hair & Eyebrow", url: "https://images.unsplash.com/photo-1547793548-710ec861bb6e?auto=format&fit=crop&w=800&q=80" },
    { label: "Badam Roghan Shirin", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" },
    { label: "Rosemary Scalp Tonic", url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80" },
  ];

  // Open Create New Oil Product
  const handleOpenCreateOil = () => {
    const newProd: Product = {
      id: `ar-oil-${Date.now()}`,
      name: "Cold Pressed Mustard (Sarson) Oil",
      nativeName: "Kachi Ghani Sarson Oil",
      category: "oils",
      tag: "Fresh Cold Press • Virgin Grade",
      shortDescription: "Slow cold extracted below 38°C in food-grade steel machinery. Natural aroma.",
      description: "Traditional kachi ghani cold extracted oil retaining natural vitamins and antioxidants without chemical solvents or refining.",
      heroImage: ASSETS.mustardHero,
      seedOrigin: "Punjab Selected Sun-Dried Seeds",
      woodType: "Food-Grade Cold Screw Chamber",
      extractionTemp: "Cold Pressed < 38°C",
      smokePoint: "240°C",
      aromaTaste: "Rich, pungent, authentic aroma",
      colorProfile: "Golden Amber",
      batchNo: `AR-OIL-${new Date().getFullYear()}`,
      sizes: [
        { size: "500ml Bottle", price: 340, originalPrice: 400, inStock: true, stockQuantity: 30, lowStockThreshold: 5 },
        { size: "1 Litre Bottle", price: 650, originalPrice: 750, inStock: true, stockQuantity: 25, lowStockThreshold: 5 },
        { size: "2 Litre Canister", price: 1250, originalPrice: 1450, inStock: true, stockQuantity: 15, lowStockThreshold: 5 },
        { size: "5 Litre Canister", price: 3000, originalPrice: 3500, inStock: true, stockQuantity: 10, lowStockThreshold: 3 },
      ],
      benefits: [
        "Chemical & Hexane Free",
        "Packed in sealed food-grade containers",
        "Natural Omega-3 and Vitamin E retained",
      ],
      bestFor: ["Daily Cooking & Tadka", "Achaar Preservation", "Hair & Scalp Nourishment"],
      nutrition: {
        caloriesPer100g: 884,
        monounsaturatedFat: "60g",
        polyunsaturatedFat: "21g",
        saturatedFat: "12g",
        vitaminE: "20mg",
        omega3: "6g",
        omega6: "15g",
        antioxidants: "Allyl Isothiocyanate & Tocopherols",
      },
      rating: 5.0,
      reviewsCount: 1,
      isOutOfStock: false,
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  // Open Create New Hair Oil & Beauty Care Product
  const handleOpenCreateBeauty = () => {
    const newProd: Product = {
      id: `ar-bty-${Date.now()}`,
      name: "7-Herb Botanical Hair Growth Miracle Oil",
      nativeName: "سات جڑی بوٹیوں والا بالوں کا روغنی تیل",
      category: "beauty",
      tag: "Amla, Bhringraj & Shikakai Infusion • Zero Mineral Oil",
      shortDescription: "Cold-pressed virgin oils infused with 7 wild herbs to halt hair fall and awaken dormant roots.",
      description: "Traditional herbal scalp formula with sun-dried Amla, Bhringraj, Shikakai, Methi, and Rosemary in virgin cold-pressed oil base.",
      heroImage: "https://images.unsplash.com/photo-1608248597359-46743b10b037?auto=format&fit=crop&w=800&q=80",
      seedOrigin: "Cold Pressed Virgin Base with Certified Botanicals",
      woodType: "Cold Pressed Base + Low-Heat Herbal Maceration",
      extractionTemp: "Slow Infusion (< 40°C)",
      smokePoint: "Topical Scalp Treatment",
      aromaTaste: "Deep herbal, calming botanical scent",
      colorProfile: "Rich Forest Green with Amber Undertones",
      batchNo: `AR-BTY-${new Date().getFullYear()}`,
      sizes: [
        { size: "100ml Dropper Bottle", price: 450, originalPrice: 550, inStock: true, stockQuantity: 40, lowStockThreshold: 10 },
        { size: "200ml Glass Bottle", price: 820, originalPrice: 980, inStock: true, stockQuantity: 35, lowStockThreshold: 8 },
        { size: "500ml Family Value Pack", price: 1850, originalPrice: 2200, inStock: true, stockQuantity: 20, lowStockThreshold: 5 },
      ],
      benefits: [
        "Stops aggressive seasonal & postpartum hair fall",
        "Awakens dormant hair follicles and thickens edges",
        "Deeply conditions without petroleum mineral oils",
      ],
      bestFor: ["Hair Growth Massage", "Dandruff Treatment", "Eyebrow & Beard Growth"],
      nutrition: {
        caloriesPer100g: 884,
        monounsaturatedFat: "42g",
        polyunsaturatedFat: "40g",
        saturatedFat: "14g",
        vitaminE: "32mg",
        omega3: "4.5g",
        omega6: "22g",
        antioxidants: "Botanical Tannins & Rosemary Cineole",
      },
      rating: 5.0,
      reviewsCount: 1,
      isOutOfStock: false,
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  // Open Create New Spice Product
  const handleOpenCreateSpice = () => {
    const newProd: Product = {
      id: `ar-sp-${Date.now()}`,
      name: "Pure Desi Turmeric (Haldi) Powder",
      nativeName: "Pure Haldi Powder (Sabut Pisi)",
      category: "spices",
      tag: "High Curcumin • Chemical Free",
      shortDescription: "Freshly stone-ground from hand-picked whole turmeric roots. Vibrant golden color and rich aroma.",
      description: "Authentic ground spice prepared from cleaned whole roots. Free from synthetic yellow dyes, starch, or lead chromate.",
      heroImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
      seedOrigin: "Premium Organic Desi Whole Roots",
      woodType: "Slow Stone-Grinding Mill",
      extractionTemp: "Cold Ground Processing (< 30°C)",
      smokePoint: "Culinary Spicing",
      aromaTaste: "Warm, earthy, peppery authentic fragrance",
      colorProfile: "Vibrant Golden Ochre",
      batchNo: `AR-SP-${new Date().getFullYear()}`,
      sizes: [
        { size: "250 Gram Pack", price: 280, originalPrice: 340, inStock: true, stockQuantity: 50, lowStockThreshold: 10 },
        { size: "500 Gram Pack", price: 520, originalPrice: 620, inStock: true, stockQuantity: 40, lowStockThreshold: 10 },
        { size: "1 KG Family Pack", price: 980, originalPrice: 1180, inStock: true, stockQuantity: 25, lowStockThreshold: 5 },
      ],
      benefits: [
        "High active natural Curcumin content",
        "Free of toxic artificial colors or polish",
        "Deep authentic aroma and vibrant natural handi color",
      ],
      bestFor: ["Daily Handi & Salan Curries", "Golden Turmeric Milk", "Joint Wellness"],
      nutrition: {
        caloriesPer100g: 354,
        monounsaturatedFat: "1.7g",
        polyunsaturatedFat: "2.2g",
        saturatedFat: "3.1g",
        vitaminE: "3.1mg",
        omega3: "0.2g",
        omega6: "1.8g",
        antioxidants: "Natural Curcuminoids",
      },
      rating: 5.0,
      reviewsCount: 1,
      isOutOfStock: false,
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  // Open Create New Flour / Atta Product
  const handleOpenCreateFlour = () => {
    const newProd: Product = {
      id: `ar-flr-${Date.now()}`,
      name: "Whole Wheat Stone-Ground Flour",
      nativeName: "Stone-Ground Whole Wheat Flour",
      category: "flour",
      tag: "Stone Ground • Bran & Germ Intact",
      shortDescription: "Fresh stone-ground from cleaned golden desi wheat kernels. High fiber, unbleached, makes soft rotis.",
      description: "Traditional natural stone mill ground flour. Operates at slow RPM to preserve full wheat germ and dietary bran. Makes rotis that stay soft and fluffy.",
      heroImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      seedOrigin: "Selected Punjab Golden Wheat",
      woodType: "Traditional Natural Stone Mill",
      extractionTemp: "Slow RPM Cold Stone Grinding",
      smokePoint: "Baking & Roti Making",
      aromaTaste: "Sweet, nutty, earthy whole wheat taste",
      colorProfile: "Natural Creamy Tan with Visible Wheat Bran",
      batchNo: `AR-FLR-${new Date().getFullYear()}`,
      sizes: [
        { size: "5 KG Bag", price: 680, originalPrice: 780, inStock: true, stockQuantity: 40, lowStockThreshold: 10 },
        { size: "10 KG Bag", price: 1320, originalPrice: 1500, inStock: true, stockQuantity: 35, lowStockThreshold: 10 },
        { size: "20 KG Family Sack", price: 2550, originalPrice: 2900, inStock: true, stockQuantity: 20, lowStockThreshold: 5 },
      ],
      benefits: [
        "Unrefined with dietary bran (choker) fully intact",
        "Zero maida, zero chemical bleaching agents",
        "Makes soft, delicious, digestible rotis",
      ],
      bestFor: ["Daily Soft Home Phulkas & Rotis", "Desi Ghee Parathas", "Healthy Family Diet"],
      nutrition: {
        caloriesPer100g: 340,
        monounsaturatedFat: "0.4g",
        polyunsaturatedFat: "1.1g",
        saturatedFat: "0.5g",
        vitaminE: "1.2mg",
        omega3: "0.1g",
        omega6: "1.0g",
        antioxidants: "Dietary Wheat Bran Fiber",
      },
      rating: 5.0,
      reviewsCount: 1,
      isOutOfStock: false,
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  // Immediate 1-Click Out of Stock Toggle on Product Card
  const handleToggleProductOutOfStock = (prod: Product) => {
    const nextState = !prod.isOutOfStock;
    const updated: Product = {
      ...prod,
      isOutOfStock: nextState,
      sizes: prod.sizes.map((s) => ({ ...s, inStock: !nextState })),
    };
    onSaveProduct(updated);
    showNotification(`"${prod.name}" marked ${nextState ? "OUT OF STOCK" : "IN STOCK"}!`);
  };

  // Save Product Changes
  const handleSaveEditingProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onSaveProduct(editingProduct);
    showNotification(`Product "${editingProduct.name}" saved successfully!`);
    setEditingProduct(null);
  };

  // Theme Categories
  const themeCategories = [
    { id: "all", label: "All 150 Palettes" },
    { id: "Pure & Minimalist White", label: "Pure & Minimalist White (25)" },
    { id: "Traditional & Earthy", label: "Traditional & Earthy (25)" },
    { id: "Modern & Fresh", label: "Modern & Fresh (25)" },
    { id: "Royal & Luxury", label: "Royal & Luxury (25)" },
    { id: "Pastel & Minimal", label: "Pastel & Minimal (25)" },
    { id: "Vibrant & Bold", label: "Vibrant & Bold (25)" },
  ];

  // Filter Themes
  const filteredThemes = COLOR_THEMES.filter((theme) => {
    const matchesCategory = themeCategory === "all" || theme.category === themeCategory;
    const matchesSearch =
      theme.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
      theme.category.toLowerCase().includes(themeSearch.toLowerCase()) ||
      (theme.description ? theme.description.toLowerCase().includes(themeSearch.toLowerCase()) : false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-amber-900/40 max-h-[94vh] flex flex-col overflow-hidden"
      >
        
        {/* Header */}
        <div className="bg-stone-950 px-6 py-4 border-b border-amber-900/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
                <span>Al Raza Owner Control Panel</span>
                <span className="text-[10px] uppercase font-sans tracking-widest bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                  Master Superadmin
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Manage stock levels, Recharts analytics, 150 color themes (including Pure White Minimal), reviews moderation, and catalog.
              </p>
            </div>
          </div>

          <button
            id="close-owner-panel-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Global Save Notification */}
        {saveSuccessNotice && (
          <div className="bg-emerald-900/90 text-emerald-100 px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-emerald-700 animate-fadeIn shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {saveSuccessNotice}
            </span>
            <button
              onClick={() => setSaveSuccessNotice(null)}
              className="text-emerald-300 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Password Authentication Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-amber-100">Owner Access Verification</h3>
              <p className="text-xs text-stone-400 mt-1">
                Enter your secret owner password to unlock complete website editing, inventory tracking, analytics, and moderation.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full space-y-3">
              <div>
                <input
                  id="owner-password-input"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter Owner Password..."
                  className="w-full px-4 py-3 bg-stone-950 border border-amber-900/60 rounded-xl text-center text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono tracking-wider"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <button
                id="owner-login-submit-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Unlock Owner Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-stone-950 border-r border-amber-900/30 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              
              <div className="hidden md:block px-3 py-2 text-[10px] uppercase font-bold text-amber-500/80 tracking-wider">
                Store Operations
              </div>

              <button
                onClick={() => { setActiveTab("analytics"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab("inventory"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "inventory"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Inventory & Stock</span>
              </button>

              <button
                onClick={() => { setActiveTab("reviews"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Customer Feedback ({reviews.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("orders"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Tracking ({orders.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("wholesale"); setEditingProduct(null); reloadWholesaleInquiries(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "wholesale"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Wholesale Inquiries ({wholesaleInquiries.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("shipping"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "shipping"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="flex items-center justify-between flex-1">
                  <span>Delivery Charges</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-800">
                    Rs. {storeConfig.deliveryFee ?? 150}
                  </span>
                </span>
              </button>

              <div className="hidden md:block px-3 py-2 mt-2 text-[10px] uppercase font-bold text-amber-500/80 tracking-wider">
                Store Customization
              </div>

              <button
                onClick={() => { setActiveTab("themes"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "themes"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Theme & Color Studio (150)</span>
              </button>

              <button
                onClick={() => { setActiveTab("products"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "products"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Products Catalog ({products.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("logo_hero"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "logo_hero"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Banner</span>
              </button>

              <button
                onClick={() => { setActiveTab("payments"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "payments"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payment Accounts</span>
              </button>

              <button
                onClick={() => { setActiveTab("contacts"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "contacts"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Helpline & Location Map</span>
              </button>

              <button
                onClick={() => { setActiveTab("seo"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "seo"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="flex items-center justify-between flex-1">
                  <span>SEO & Search Indexing</span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-800">
                    SEO
                  </span>
                </span>
              </button>

              <button
                onClick={() => { setActiveTab("affiliates"); setEditingProduct(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "affiliates"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Affiliates ({affiliateList.length})</span>
              </button>

              {onOpenWorkspace && (
                <div className="pt-2 border-t border-amber-900/30">
                  <button
                    onClick={() => {
                      onOpenWorkspace();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Mail className="w-4 h-4 text-rose-400" />
                    <span>Google Workspace</span>
                  </button>
                </div>
              )}

            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-stone-900 text-stone-100">
              
              {/* TAB 1: VISUAL DASHBOARD */}
              {activeTab === "analytics" && (
                <OwnerAnalyticsDashboard
                  orders={orders}
                  products={products}
                  reviews={reviews}
                />
              )}

              {/* TAB 2: INVENTORY & STOCK */}
              {activeTab === "inventory" && (
                <OwnerInventoryManager
                  products={products}
                  onSaveProduct={onSaveProduct}
                />
              )}

              {/* TAB 3: CUSTOMER REVIEWS MODERATION */}
              {activeTab === "reviews" && (
                <OwnerReviewsModeration
                  reviews={reviews}
                  onApproveReview={onApproveReview}
                  onRejectReview={onRejectReview}
                  onDeleteReview={onDeleteReview}
                  onToggleFeatureReview={onToggleFeatureReview}
                  onSaveOwnerReply={onSaveOwnerReply}
                />
              )}

              {/* TAB 4: 150 COLOR THEMES & STUDIO */}
              {activeTab === "themes" && (
                <div className="space-y-6">
                  {/* Themes Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-amber-400" />
                        Website Theme & Color Studio (150 Palettes)
                      </h3>
                      <p className="text-xs text-stone-400">
                        Select any color theme to instantly transform the entire website live. Includes luxury black themes, minimalist pure white palettes, emerald herbs, and rich golds.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onChangeTheme("obsidian-black");
                          showNotification('Activated "Obsidian Luxury Black" sleek theme!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          activeThemeId === "obsidian-black"
                            ? "bg-stone-900 text-amber-300 border-amber-500 ring-2 ring-amber-500"
                            : "bg-stone-900 text-stone-200 border-stone-700 hover:bg-stone-800 hover:text-white"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-black border border-stone-500 inline-block"></span>
                        <span>Obsidian Black (Default)</span>
                        {activeThemeId === "obsidian-black" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onChangeTheme("simple-pure-white");
                          showNotification('Switched to "01. Simple Pure White" minimalist theme!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          activeThemeId === "simple-pure-white"
                            ? "bg-white text-stone-950 border-white ring-2 ring-amber-400"
                            : "bg-stone-900 text-stone-200 border-stone-700 hover:bg-stone-800 hover:text-white"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-white border border-stone-400 inline-block"></span>
                        <span>Simple White</span>
                        {activeThemeId === "simple-pure-white" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      <div className="text-xs font-semibold text-amber-300 bg-amber-900/50 px-3 py-1.5 rounded-xl border border-amber-700">
                        Active: {COLOR_THEMES.find((t) => t.id === activeThemeId)?.name || "Obsidian Luxury Black"}
                      </div>
                    </div>
                  </div>

                  {/* Categories & Search */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {themeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setThemeCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            themeCategory === cat.id
                              ? "bg-amber-600 text-white shadow"
                              : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={themeSearch}
                        onChange={(e) => setThemeSearch(e.target.value)}
                        placeholder="Search theme color..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      />
                    </div>
                  </div>

                  {/* Theme Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredThemes.map((thm) => {
                      const isSelected = thm.id === activeThemeId;

                      return (
                        <div
                          key={thm.id}
                          onClick={() => {
                            onChangeTheme(thm.id);
                            showNotification(`Activated "${thm.name}" theme across entire website!`);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                            isSelected
                              ? "bg-stone-800 border-amber-500 ring-2 ring-amber-500 shadow-xl"
                              : "bg-stone-950 border-stone-800 hover:border-amber-700/60 hover:bg-stone-900"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                                {thm.name}
                              </h4>
                              {isSelected && (
                                <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Active
                                </span>
                              )}
                            </div>
                            {thm.description && (
                              <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{thm.description}</p>
                            )}
                            <p className="text-[10px] text-amber-400/80 font-medium">{thm.category}</p>
                          </div>

                          {/* Color Swatch Dots */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-stone-800/80">
                            <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: thm.primary }} title="Primary" />
                            <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: thm.headerBg }} title="Header" />
                            <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: thm.accent }} title="Accent" />
                            <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: thm.bgMain }} title="Background" />
                            <span className="w-5 h-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: thm.border }} title="Border" />

                            <span className="text-[10px] text-stone-400 font-mono ml-auto">
                              {thm.primary}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* WEBSITE BOTTOM / FOOTER CUSTOM COLOR CUSTOMIZER */}
                  <div className="p-5 bg-stone-950 rounded-2xl border border-amber-900/50 space-y-5 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-amber-400" />
                          <span>Website Bottom (Footer) Color Editor</span>
                        </h4>
                        <p className="text-xs text-stone-400">
                          Customize background, text, borders, and quality badge strip colors of the website's bottom area.
                        </p>
                      </div>

                      {/* Mode Toggle: Auto (Follow 150 Themes) vs Custom Colors */}
                      <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-700">
                        <button
                          type="button"
                          onClick={() => {
                            setConfigForm({ ...configForm, footerStyleMode: "theme" });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            (configForm.footerStyleMode || "theme") === "theme"
                              ? "bg-amber-600 text-white shadow"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          Auto Match Theme
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfigForm({ ...configForm, footerStyleMode: "custom" });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            configForm.footerStyleMode === "custom"
                              ? "bg-amber-600 text-white shadow"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          Custom Bottom Colors
                        </button>
                      </div>
                    </div>

                    {configForm.footerStyleMode === "custom" ? (
                      <div className="space-y-4">
                        {/* 1-Click Quick Preset Palettes for Website Bottom */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-amber-300 block">
                            Quick 1-Click Bottom Color Presets:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {[
                              {
                                name: "Pure Minimal White",
                                bg: "#ffffff",
                                text: "#0f172a",
                                border: "#e2e8f0",
                                top: "#f8fafc",
                              },
                              {
                                name: "Royal Amber Gold",
                                bg: "#291809",
                                text: "#fef3c7",
                                border: "#78350f",
                                top: "#1c1005",
                              },
                              {
                                name: "Charcoal Obsidian",
                                bg: "#18181b",
                                text: "#f4f4f5",
                                border: "#27272a",
                                top: "#09090b",
                              },
                              {
                                name: "Herbal Emerald",
                                bg: "#052e16",
                                text: "#dcfce7",
                                border: "#166534",
                                top: "#022c22",
                              },
                              {
                                name: "Midnight Sapphire",
                                bg: "#0f172a",
                                text: "#e2e8f0",
                                border: "#1e293b",
                                top: "#020617",
                              },
                              {
                                name: "Warm Terracotta",
                                bg: "#431407",
                                text: "#ffedd5",
                                border: "#7c2d12",
                                top: "#290d05",
                              },
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setConfigForm({
                                    ...configForm,
                                    footerStyleMode: "custom",
                                    footerBgColor: preset.bg,
                                    footerTextColor: preset.text,
                                    footerBorderColor: preset.border,
                                    footerTopBannerBg: preset.top,
                                  });
                                  showNotification(`Applied ${preset.name} bottom color preset! Click Save to apply.`);
                                }}
                                className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 rounded-xl text-left transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-1 mb-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: preset.bg }} />
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: preset.text }} />
                                  <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: preset.border }} />
                                </div>
                                <span className="text-[11px] font-bold text-stone-200 group-hover:text-amber-300 block truncate">
                                  {preset.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Individual Color Picker Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                          {/* Footer Background Color */}
                          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                              <span>Bottom Background</span>
                              <span className="text-[10px] text-stone-500 font-mono">{configForm.footerBgColor || "#1c1917"}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={configForm.footerBgColor || "#1c1917"}
                                onChange={(e) => setConfigForm({ ...configForm, footerBgColor: e.target.value })}
                                className="w-9 h-9 rounded-lg border border-stone-700 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={configForm.footerBgColor || "#1c1917"}
                                onChange={(e) => setConfigForm({ ...configForm, footerBgColor: e.target.value })}
                                placeholder="#1c1917"
                                className="flex-1 p-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white font-mono uppercase"
                              />
                            </div>
                          </div>

                          {/* Footer Text Color */}
                          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                              <span>Text & Content Color</span>
                              <span className="text-[10px] text-stone-500 font-mono">{configForm.footerTextColor || "#fef3c7"}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={configForm.footerTextColor || "#fef3c7"}
                                onChange={(e) => setConfigForm({ ...configForm, footerTextColor: e.target.value })}
                                className="w-9 h-9 rounded-lg border border-stone-700 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={configForm.footerTextColor || "#fef3c7"}
                                onChange={(e) => setConfigForm({ ...configForm, footerTextColor: e.target.value })}
                                placeholder="#fef3c7"
                                className="flex-1 p-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white font-mono uppercase"
                              />
                            </div>
                          </div>

                          {/* Footer Border & Divider Color */}
                          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                              <span>Border & Dividers</span>
                              <span className="text-[10px] text-stone-500 font-mono">{configForm.footerBorderColor || "#78350f"}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={configForm.footerBorderColor || "#78350f"}
                                onChange={(e) => setConfigForm({ ...configForm, footerBorderColor: e.target.value })}
                                className="w-9 h-9 rounded-lg border border-stone-700 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={configForm.footerBorderColor || "#78350f"}
                                onChange={(e) => setConfigForm({ ...configForm, footerBorderColor: e.target.value })}
                                placeholder="#78350f"
                                className="flex-1 p-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white font-mono uppercase"
                              />
                            </div>
                          </div>

                          {/* Footer Top Quality Badges Strip */}
                          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                              <span>Top Badges Strip Bg</span>
                              <span className="text-[10px] text-stone-500 font-mono">{configForm.footerTopBannerBg || "#291809"}</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={configForm.footerTopBannerBg || "#291809"}
                                onChange={(e) => setConfigForm({ ...configForm, footerTopBannerBg: e.target.value })}
                                className="w-9 h-9 rounded-lg border border-stone-700 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={configForm.footerTopBannerBg || "#291809"}
                                onChange={(e) => setConfigForm({ ...configForm, footerTopBannerBg: e.target.value })}
                                placeholder="#291809"
                                className="flex-1 p-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white font-mono uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live Bottom Footer Mini Preview Box */}
                        <div className="p-4 rounded-xl border space-y-2 mt-3" style={{
                          backgroundColor: configForm.footerBgColor || "#1c1917",
                          color: configForm.footerTextColor || "#fef3c7",
                          borderColor: configForm.footerBorderColor || "#78350f"
                        }}>
                          <div className="flex items-center justify-between text-xs font-bold border-b pb-2" style={{
                            borderColor: configForm.footerBorderColor || "#78350f"
                          }}>
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold font-serif">AR</span>
                              <span>{configForm.brandName || "Al Raza Pure Oils"} (Live Bottom Preview)</span>
                            </span>
                            <span className="text-[10px] opacity-80 uppercase tracking-wider">Live Footer Preview</span>
                          </div>
                          <div className="p-2 rounded-lg text-[11px]" style={{
                            backgroundColor: configForm.footerTopBannerBg || "rgba(0,0,0,0.2)"
                          }}>
                            <span>Cold Press Extractor • Zero Hexane Chemicals • Fresh Daily Pressing</span>
                          </div>
                          <p className="text-[11px] opacity-85">
                            Dedicated to delivering pure, unadulterated cold-pressed oils. Retaining raw aroma and potency.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-stone-900/60 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Auto Theme Matching Active</span>
                        </div>
                        <p className="text-stone-400 text-[11px] leading-relaxed">
                          The website bottom automatically matches whichever theme is active among the 150 palettes above (for example, choosing any Pure White theme will render a clean, white minimalist bottom, and choosing dark or amber themes will render their corresponding rich styling).
                        </p>
                        <button
                          type="button"
                          onClick={() => setConfigForm({ ...configForm, footerStyleMode: "custom" })}
                          className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-lg text-xs border border-stone-700 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Switch to Custom Bottom Colors</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                      <span className="text-xs text-stone-400">
                        Changes apply site-wide immediately upon saving.
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveStoreConfig}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Bottom & Footer Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRODUCTS CATALOG WITH OUT OF STOCK, CATEGORY ADDING & PRESETS */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {/* Header & Add Buttons for Oils, Spices, and Flour */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-400" />
                        Product Catalog & Packaging Manager
                      </h3>
                      <p className="text-xs text-stone-400">
                        Add spices, flours or oils with details, pictures & prices. Manage live stock levels or toggle Out of Stock.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenCreateOil}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-600"
                      >
                        <Droplet className="w-3.5 h-3.5" />
                        <span>+ Add Oil</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenCreateSpice}
                        className="px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-amber-500"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>+ Add Spice (Masala)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenCreateFlour}
                        className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-amber-700"
                      >
                        <Wheat className="w-3.5 h-3.5" />
                        <span>+ Add Flour (Stone-Ground)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenCreateBeauty}
                        className="px-3.5 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-rose-600"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+ Add Hair Oil / Beauty</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Edit / Create Form Modal */}
                  {editingProduct && (
                    <form
                      onSubmit={handleSaveEditingProduct}
                      className="bg-stone-950 p-5 rounded-2xl border-2 border-amber-600/70 space-y-4 shadow-xl animate-fadeIn"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <span>{isNewProduct ? `Create New ${editingProduct.category.toUpperCase()}` : `Edit Product: ${editingProduct.name}`}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Out of Stock Master Control */}
                      <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <PackageX className="w-5 h-5 text-rose-400" />
                          <div>
                            <span className="font-bold text-xs text-rose-200">
                              Mark Entire Product as OUT OF STOCK
                            </span>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              When enabled, shows an "Out of Stock" red badge on the storefront and disables the Add to Cart button.
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editingProduct.isOutOfStock}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditingProduct({
                                ...editingProduct,
                                isOutOfStock: checked,
                                sizes: editingProduct.sizes.map((s) => ({ ...s, inStock: !checked })),
                              });
                            }}
                            className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>

                      {/* Product Category, Name & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-stone-300 mb-1">Category *</label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                            className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value="oils">Cold Pressed Oils (تیل جات)</option>
                            <option value="spices">Spices & Masalajat (مصالحہ جات)</option>
                            <option value="flour">Stone-Ground Flour &amp; Grains (پتھر چکی آٹا اور اناج)</option>
                            <option value="beauty">Hair Oils & Beauty Care (ہیئر آئل اور بیوٹی)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-300 mb-1">Product Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pure Desi Turmeric (Haldi) Powder"
                            value={editingProduct.name || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-300 mb-1">Variety / Subtitle *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sabut Pisi Haldi / Stone Ground"
                            value={editingProduct.nativeName || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, nativeName: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Picture URL, Device Upload & Quick Presets */}
                      <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-2.5 text-xs">
                        <label className="block font-bold text-amber-300">
                          Product Picture (URL, Device Upload, or 1-Click Preset):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingProduct.heroImage || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, heroImage: e.target.value })}
                            placeholder="Image URL or Base64 data..."
                            className="flex-1 p-2 rounded-lg bg-stone-950 border border-stone-700 text-white font-mono text-xs"
                          />
                          <input
                            type="file"
                            ref={productFileInputRef}
                            onChange={handleProductImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingProductImg}
                            onClick={() => productFileInputRef.current?.click()}
                            className="px-3 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {isUploadingProductImg ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingProductImg ? "Importing..." : "Browse Device"}</span>
                          </button>
                        </div>

                        {/* Quick Presets for Current Category */}
                        <div className="pt-1 space-y-1">
                          <span className="text-[10px] text-stone-400 font-semibold block">
                            Quick Picture Presets for {editingProduct.category.toUpperCase()}:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(editingProduct.category === "spices"
                              ? SPICE_PRESET_IMAGES
                              : editingProduct.category === "flour"
                              ? FLOUR_PRESET_IMAGES
                              : editingProduct.category === "beauty"
                              ? BEAUTY_PRESET_IMAGES
                              : OIL_PRESET_IMAGES
                            ).map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, heroImage: preset.url })}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 cursor-pointer border ${
                                  editingProduct.heroImage === preset.url
                                    ? "bg-amber-600 text-white border-amber-500 font-bold"
                                    : "bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-700"
                                }`}
                              >
                                <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                                <span>{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {editingProduct.heroImage && editingProduct.heroImage.trim() !== "" && (
                          <div className="flex items-center gap-3 pt-1">
                            <img
                              src={editingProduct.heroImage}
                              alt="Preview"
                              className="w-14 h-14 rounded-lg object-cover border border-amber-500/40 shrink-0"
                            />
                            <p className="text-[11px] text-stone-400">Current active picture preview</p>
                          </div>
                        )}
                      </div>

                      {/* Descriptions */}
                      <div className="text-xs space-y-2">
                        <div>
                          <label className="block font-semibold text-stone-300 mb-1">Short Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Freshly stone-ground from hand-selected pure roots. Zero dyes."
                            value={editingProduct.shortDescription || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                            className="w-full p-2 rounded-xl bg-stone-900 border border-stone-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-300 mb-1">Full Detailed Description</label>
                          <textarea
                            rows={2}
                            placeholder="Detailed sourcing, grinding method, aroma, and packaging description..."
                            value={editingProduct.description || ""}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full p-2 rounded-xl bg-stone-900 border border-stone-700 text-white"
                          />
                        </div>
                      </div>

                      {/* Sizes, Pricing & Stock */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-amber-300">Sizes, Prices & Stock Inventory:</label>
                          <button
                            type="button"
                            onClick={() => {
                              const defaultSize = editingProduct.category === "spices" ? "250 Gram Pack" : editingProduct.category === "flour" ? "5 KG Bag" : "1 Litre Bottle";
                              setEditingProduct({
                                ...editingProduct,
                                sizes: [
                                  ...editingProduct.sizes,
                                  { size: defaultSize, price: 500, originalPrice: 600, inStock: true, stockQuantity: 25, lowStockThreshold: 5 },
                                ],
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Size / Weight Row</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {editingProduct.sizes.map((sz, idx) => (
                            <div key={idx} className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                              <div>
                                <label className="text-[10px] text-stone-400 block">Size / Weight</label>
                                <input
                                  type="text"
                                  value={sz.size || ""}
                                  onChange={(e) => {
                                    const nextSizes = [...editingProduct.sizes];
                                    nextSizes[idx].size = e.target.value;
                                    setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                  }}
                                  className="w-full p-1.5 bg-stone-950 border border-stone-700 rounded text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-stone-400 block">Sale Price (Rs.)</label>
                                <input
                                  type="number"
                                  value={sz.price ?? 0}
                                  onChange={(e) => {
                                    const nextSizes = [...editingProduct.sizes];
                                    nextSizes[idx].price = Number(e.target.value);
                                    setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                  }}
                                  className="w-full p-1.5 bg-stone-950 border border-stone-700 rounded text-xs text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-stone-400 block">MRP (Rs.)</label>
                                <input
                                  type="number"
                                  value={sz.originalPrice ?? 0}
                                  onChange={(e) => {
                                    const nextSizes = [...editingProduct.sizes];
                                    nextSizes[idx].originalPrice = Number(e.target.value);
                                    setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                  }}
                                  className="w-full p-1.5 bg-stone-950 border border-stone-700 rounded text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-stone-400 block">Stock (Units)</label>
                                <input
                                  type="number"
                                  value={sz.stockQuantity ?? 10}
                                  onChange={(e) => {
                                    const nextSizes = [...editingProduct.sizes];
                                    const qty = Number(e.target.value);
                                    nextSizes[idx].stockQuantity = qty;
                                    nextSizes[idx].inStock = qty > 0;
                                    setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                  }}
                                  className="w-full p-1.5 bg-stone-950 border border-stone-700 rounded text-xs text-white font-bold"
                                />
                              </div>
                              <div className="flex items-center justify-between pt-3 sm:pt-0">
                                <label className="flex items-center gap-1.5 text-[10px] text-stone-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={sz.inStock && (sz.stockQuantity ?? 0) > 0}
                                    onChange={(e) => {
                                      const nextSizes = [...editingProduct.sizes];
                                      nextSizes[idx].inStock = e.target.checked;
                                      setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                    }}
                                    className="w-3.5 h-3.5 accent-emerald-500 rounded"
                                  />
                                  <span>In Stock</span>
                                </label>
                                {editingProduct.sizes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextSizes = editingProduct.sizes.filter((_, sIndex) => sIndex !== idx);
                                      setEditingProduct({ ...editingProduct, sizes: nextSizes });
                                    }}
                                    className="p-1 text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                                    title="Delete size row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submit Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                        {!isNewProduct && (
                          confirmDeleteProdId === editingProduct.id ? (
                            <div className="flex items-center gap-2 bg-rose-950/90 p-1.5 rounded-xl border border-rose-600">
                              <span className="text-xs font-bold text-rose-200">Delete permanently?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(editingProduct.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg cursor-pointer shadow"
                              >
                                Yes, Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProdId(null)}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProdId(editingProduct.id)}
                              className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                              <span>Delete This Product</span>
                            </button>
                          )
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setConfirmDeleteProdId(null);
                            }}
                            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Product</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Product Cards List with Out-Of-Stock Badges & 1-Click Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {products.map((prod) => {
                      const isProductOut = prod.isOutOfStock || prod.sizes.every((s) => !s.inStock || (s.stockQuantity ?? 0) <= 0);

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 bg-stone-950 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                            isProductOut
                              ? "border-rose-800/80 bg-rose-950/20"
                              : "border-stone-800 hover:border-amber-700/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={prod.heroImage && prod.heroImage.trim() !== "" ? prod.heroImage : ASSETS.olivePlasticBottle}
                              alt={prod.name}
                              className="w-16 h-16 rounded-xl object-cover border border-stone-700 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-serif font-bold text-sm text-white truncate">{prod.name}</h4>
                                {isProductOut ? (
                                  <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <PackageX className="w-3 h-3" /> Out of Stock
                                  </span>
                                ) : (
                                  <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Stock
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-amber-400 font-semibold truncate">{prod.nativeName}</p>
                              <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{prod.shortDescription}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                Category: <strong className="text-amber-300 uppercase">{prod.category}</strong> • {prod.sizes.length} pack sizes
                              </p>
                            </div>
                          </div>

                          {/* Actions Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 text-xs">
                            <div className="flex items-center gap-2">
                              {/* 1-Click Out of Stock Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleProductOutOfStock(prod)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 border ${
                                  isProductOut
                                    ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border-emerald-700"
                                    : "bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-700"
                                }`}
                                title={isProductOut ? "Mark this product as In Stock" : "Mark this product as Out of Stock"}
                              >
                                {isProductOut ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Set In Stock</span>
                                  </>
                                ) : (
                                  <>
                                    <PackageX className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Set Out of Stock</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-400" />
                                <span>Edit</span>
                              </button>
                            </div>

                            {/* Active Delete Product with Inline Confirmation */}
                            {confirmDeleteProdId === prod.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-950/90 p-1 rounded-lg border border-rose-600">
                                <span className="text-[11px] font-bold text-rose-200 px-1">Confirm delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded cursor-pointer shadow"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProdId(null)}
                                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-[10px] rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteProdId(prod.id)}
                                className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs"
                                title="Delete this product"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: WHOLESALE BULK INQUIRIES */}
              {activeTab === "wholesale" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        Wholesale & Bulk Orders Manager
                      </h3>
                      <p className="text-xs text-stone-400">
                        Inquiries submitted through the website Wholesale & Bulk form. Contact commercial clients via WhatsApp or Phone.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={reloadWholesaleInquiries}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Inquiries</span>
                    </button>
                  </div>

                  {wholesaleInquiries.length === 0 ? (
                    <div className="p-12 text-center bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                      <Building2 className="w-12 h-12 text-stone-600 mx-auto" />
                      <p className="text-sm font-bold text-stone-300">No Wholesale Inquiries Yet</p>
                      <p className="text-xs text-stone-500">
                        Inquiries submitted through the website Wholesale form will appear here with business details and direct WhatsApp reply links.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wholesaleInquiries.map((inq: any, iIdx: number) => {
                        const targetWA = (inq.phone || "").replace(/[^0-9]/g, "");
                        return (
                          <div
                            key={inq.id || iIdx}
                            className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-700">
                                  {inq.id}
                                </span>
                                <span className="font-bold text-white text-sm">{inq.businessName}</span>
                                <span className="text-stone-400">({inq.contactPerson})</span>
                              </div>
                              <p className="text-stone-300">
                                City: <strong className="text-white">{inq.city}</strong> • Category: <strong className="text-amber-400 capitalize">{inq.category}</strong> • Qty: <strong className="text-emerald-400">{inq.estimatedQuantity}</strong>
                              </p>
                              <p className="text-stone-400 text-[11px]">
                                Phone: <span className="font-mono text-white">{inq.phone}</span> • Frequency: {inq.frequency} • Date: {inq.createdAt}
                              </p>
                              {inq.notes && (
                                <p className="text-stone-400 text-[11px] italic bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                                  "{inq.notes}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`https://wa.me/${targetWA}?text=${encodeURIComponent(`Hello ${inq.contactPerson}, this is Al Raza Mart regarding your wholesale inquiry [${inq.id}] for ${inq.estimatedQuantity}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Chat WhatsApp</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = wholesaleInquiries.filter((_, idx) => idx !== iIdx);
                                  setWholesaleInquiries(updated);
                                  localStorage.setItem("alraza_wholesale_inquiries", JSON.stringify(updated));
                                  showNotification("Wholesale inquiry deleted.");
                                }}
                                className="p-2 bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                                title="Delete inquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: ORDERS, TID VERIFICATION & TRACKING */}
              {activeTab === "orders" && (
                <OwnerOrdersManager
                  orders={orders}
                  onDeleteOrder={handleDeleteOrder}
                  storeConfig={configForm}
                  showNotification={showNotification}
                />
              )}

              {/* TAB: DELIVERY CHARGES & SHIPPING POLICY */}
              {activeTab === "shipping" && (
                <OwnerDeliverySettings
                  storeConfig={configForm}
                  onSaveStoreConfig={(newCfg) => {
                    setConfigForm(newCfg);
                    onSaveStoreConfig(newCfg);
                  }}
                  showNotification={showNotification}
                />
              )}

              {/* TAB 7: LOGO & BANNER */}
              {activeTab === "logo_hero" && (
                <form onSubmit={handleSaveStoreConfig} className="space-y-6">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-amber-400" />
                        Website Logo & Hero Banner Manager
                      </h3>
                      <p className="text-xs text-stone-400">
                        Upload custom high-res hero banners and store logos from your computer or phone, or choose curated cold-press presets.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  {/* Brand Name & Tagline */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <label className="block font-bold text-amber-300">Website Brand Name & Tagline:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-400 block mb-1">Brand Name</label>
                        <input
                          type="text"
                          value={configForm.brandName || ""}
                          onChange={(e) => setConfigForm({ ...configForm, brandName: e.target.value })}
                          className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Tagline</label>
                        <input
                          type="text"
                          value={configForm.brandTagline || ""}
                          onChange={(e) => setConfigForm({ ...configForm, brandTagline: e.target.value })}
                          className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Upload Section */}
                  <div className="p-5 bg-stone-950 rounded-2xl border border-amber-900/30 space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                      <div>
                        <label className="font-bold text-sm text-amber-300 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          Hero Main Banner Image
                        </label>
                        <p className="text-stone-400 text-xs mt-0.5">
                          This banner appears at the very top of your store homepage. Recommended: 1200x600 px or any landscape photo.
                        </p>
                      </div>

                      {configForm.heroImage && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...configForm, heroImage: ASSETS.heroOilsDisplay };
                            setConfigForm(updated);
                            onSaveStoreConfig(updated);
                            localStorage.setItem("alraza_store_config", JSON.stringify(updated));
                            showNotification("Banner reset to default display!");
                          }}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset to Default</span>
                        </button>
                      )}
                    </div>

                    {/* Drag and drop / Click upload box */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={handleBannerDrop}
                      onClick={() => bannerFileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        isUploadingBanner
                          ? "border-amber-400 bg-amber-950/20"
                          : "border-stone-700 hover:border-amber-500 bg-stone-900/60 hover:bg-stone-900"
                      }`}
                    >
                      <input
                        type="file"
                        ref={bannerFileInputRef}
                        onChange={handleBannerUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      {isUploadingBanner ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-amber-400">
                          <RefreshCw className="w-8 h-8 animate-spin" />
                          <p className="font-bold text-sm">Optimizing & Uploading Banner...</p>
                          <p className="text-xs text-stone-400">Compressing for fast mobile & desktop loading</p>
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-600/30">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-stone-200">
                              Click to choose a banner image from device or Drag & Drop here
                            </p>
                            <p className="text-xs text-stone-400 mt-1">
                              Supports JPG, PNG, WEBP, Camera photos (auto-optimized & saved)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Live Preview of Current Banner */}
                    {configForm.heroImage && configForm.heroImage.trim() !== "" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Active Banner Live Preview
                          </span>
                          <span>Auto-fitted to 16:9 banner container</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden border-2 border-stone-700 shadow-xl bg-stone-900">
                          <img
                            src={configForm.heroImage}
                            alt="Hero Banner Preview"
                            className="w-full h-48 sm:h-56 object-cover object-center"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Alternative: Image URL Input */}
                    <div className="pt-2 border-t border-stone-800 space-y-1.5">
                      <label className="text-stone-400 font-medium text-xs block">Or Paste Direct Banner Image Web URL:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={configForm.heroImage || ""}
                          placeholder="https://images.unsplash.com/... or data:image/..."
                          onChange={(e) => setConfigForm({ ...configForm, heroImage: e.target.value })}
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:border-amber-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleSaveStoreConfig();
                          }}
                          className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply URL</span>
                        </button>
                      </div>
                    </div>

                    {/* 1-Click Curated Presets */}
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <label className="text-stone-400 font-medium text-xs block">1-Click Curated Cold-Press Banners:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...configForm, heroImage: ASSETS.heroOilsDisplay };
                            setConfigForm(updated);
                            onSaveStoreConfig(updated);
                            localStorage.setItem("alraza_store_config", JSON.stringify(updated));
                            showNotification("Selected: Premium Oils Assortment Banner!");
                          }}
                          className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 rounded-xl text-left transition-all cursor-pointer group"
                        >
                          <img
                            src={ASSETS.heroOilsDisplay}
                            alt="Preset 1"
                            className="w-full h-16 object-cover rounded-lg mb-1.5 border border-stone-800"
                          />
                          <p className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">Oils Assortment</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...configForm, heroImage: ASSETS.stainlessPressMachine };
                            setConfigForm(updated);
                            onSaveStoreConfig(updated);
                            localStorage.setItem("alraza_store_config", JSON.stringify(updated));
                            showNotification("Selected: Stainless Steel Cold Press Machine Banner!");
                          }}
                          className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 rounded-xl text-left transition-all cursor-pointer group"
                        >
                          <img
                            src={ASSETS.stainlessPressMachine}
                            alt="Preset 2"
                            className="w-full h-16 object-cover rounded-lg mb-1.5 border border-stone-800"
                          />
                          <p className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">Extraction Machine</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...configForm, heroImage: ASSETS.mustardHero };
                            setConfigForm(updated);
                            onSaveStoreConfig(updated);
                            localStorage.setItem("alraza_store_config", JSON.stringify(updated));
                            showNotification("Selected: Golden Pure Mustard Banner!");
                          }}
                          className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 rounded-xl text-left transition-all cursor-pointer group"
                        >
                          <img
                            src={ASSETS.mustardHero}
                            alt="Preset 3"
                            className="w-full h-16 object-cover rounded-lg mb-1.5 border border-stone-800"
                          />
                          <p className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">Golden Mustard</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...configForm, heroImage: ASSETS.oilPouringGold };
                            setConfigForm(updated);
                            onSaveStoreConfig(updated);
                            localStorage.setItem("alraza_store_config", JSON.stringify(updated));
                            showNotification("Selected: Golden Pouring Oil Banner!");
                          }}
                          className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 rounded-xl text-left transition-all cursor-pointer group"
                        >
                          <img
                            src={ASSETS.oilPouringGold}
                            alt="Preset 4"
                            className="w-full h-16 object-cover rounded-lg mb-1.5 border border-stone-800"
                          />
                          <p className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate">Golden Pure Pour</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <label className="block font-bold text-amber-300">Website Logo Image:</label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {configForm.logoUrl && configForm.logoUrl.trim() !== "" ? (
                        <img
                          src={configForm.logoUrl}
                          alt="Logo Preview"
                          className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 bg-white shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={configForm.logoUrl || ""}
                            onChange={(e) => setConfigForm({ ...configForm, logoUrl: e.target.value })}
                            placeholder="Logo URL or upload file"
                            className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:border-amber-500 outline-none"
                          />
                          <input
                            type="file"
                            ref={logoFileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingLogo}
                            onClick={() => logoFileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {isUploadingLogo ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Branding & Banner Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 8: PAYMENTS ACCOUNTS WITH ACTIVE DELETE */}
              {activeTab === "payments" && (
                <form onSubmit={handleSaveStoreConfig} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-amber-400" />
                        Payment Methods & Bank Accounts
                      </h3>
                      <p className="text-xs text-stone-400">
                        Add or delete payment options (EasyPaisa, JazzCash, Meezan Bank, SadaPay, etc.) shown at checkout.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newMethod: PaymentMethodConfig = {
                          id: `pay-${Date.now()}`,
                          name: "EasyPaisa / Bank Account",
                          accountTitle: "Al Raza Pure Organic Store",
                          accountNumber: "03001234567",
                          instructions: "Please send payment, take screenshot and enter your 11-digit TID number.",
                          active: true,
                          requiresProof: true,
                        };
                        setConfigForm({
                          ...configForm,
                          paymentMethods: [...configForm.paymentMethods, newMethod],
                        });
                      }}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Payment Method</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {configForm.paymentMethods.map((pm, pIdx) => (
                      <div key={pm.id} className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Method Name</label>
                            <input
                              type="text"
                              value={pm.name || ""}
                              onChange={(e) => {
                                const next = [...configForm.paymentMethods];
                                next[pIdx].name = e.target.value;
                                setConfigForm({ ...configForm, paymentMethods: next });
                              }}
                              className="w-full p-2 bg-stone-900 border border-stone-700 rounded text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Account Title</label>
                            <input
                              type="text"
                              value={pm.accountTitle || ""}
                              onChange={(e) => {
                                const next = [...configForm.paymentMethods];
                                next[pIdx].accountTitle = e.target.value;
                                setConfigForm({ ...configForm, paymentMethods: next });
                              }}
                              className="w-full p-2 bg-stone-900 border border-stone-700 rounded text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-1">Account / IBAN Number</label>
                            <input
                              type="text"
                              value={pm.accountNumber || ""}
                              onChange={(e) => {
                                const next = [...configForm.paymentMethods];
                                next[pIdx].accountNumber = e.target.value;
                                setConfigForm({ ...configForm, paymentMethods: next });
                              }}
                              className="w-full p-2 bg-stone-900 border border-stone-700 rounded text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Active Delete Payment Method */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                          <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pm.active ?? (pm as any).isActive ?? true}
                              onChange={(e) => {
                                const next = [...configForm.paymentMethods];
                                next[pIdx].active = e.target.checked;
                                (next[pIdx] as any).isActive = e.target.checked;
                                setConfigForm({ ...configForm, paymentMethods: next });
                              }}
                              className="w-4 h-4 text-amber-600 rounded"
                            />
                            <span>Active in Checkout</span>
                          </label>

                          {confirmDeletePaymentIdx === pIdx ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/90 p-1 rounded-lg border border-rose-600">
                              <span className="text-[11px] font-bold text-rose-200 px-1">Delete method?</span>
                              <button
                                type="button"
                                onClick={() => handleDeletePaymentMethod(pIdx)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded cursor-pointer shadow"
                              >
                                Yes, Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePaymentIdx(null)}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-[10px] rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePaymentIdx(pIdx)}
                              className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Delete Method</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Payment Accounts</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 9: CONTACTS & SOCIAL MEDIA LINKS */}
              {activeTab === "contacts" && (
                <form onSubmit={handleSaveStoreConfig} className="space-y-6">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-amber-400" />
                      Store Helpline, Location Map, & Social Media
                    </h3>
                    <p className="text-xs text-stone-400">
                      Configure your store contact information, physical address, interactive Google Map, and official social media profiles.
                    </p>
                  </div>

                  {/* Contact & Physical Address */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-4 text-xs">
                    <h4 className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-stone-800 pb-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Store Contact & Location Information</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-400 block mb-1">Primary Phone Helpline</label>
                        <input
                          type="text"
                          value={configForm.contactPhone1 || ""}
                          onChange={(e) => setConfigForm({ ...configForm, contactPhone1: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Secondary Phone Helpline (Optional)</label>
                        <input
                          type="text"
                          value={configForm.contactPhone2 || ""}
                          onChange={(e) => setConfigForm({ ...configForm, contactPhone2: e.target.value })}
                          placeholder="+92 321 7654321"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">WhatsApp Support Number (without + symbol)</label>
                        <input
                          type="text"
                          value={configForm.whatsappNumber || ""}
                          onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                          placeholder="923001234567"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Customer Support Email</label>
                        <input
                          type="email"
                          value={configForm.email || (configForm as any).contactEmail || ""}
                          onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                          placeholder="care@alrazaoilmart.com"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-emerald-400 font-bold block mb-1">Order &amp; Affiliate Notifications Email (Real-time)</label>
                        <p className="text-stone-400 text-xs mb-1.5">You will receive instant email alerts at this address whenever a customer places an order or an affiliate registers.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            value={configForm.notificationEmail || ""}
                            onChange={(e) => setConfigForm({ ...configForm, notificationEmail: e.target.value })}
                            placeholder="tshirtsprintingworld@gmail.com"
                            className="flex-1 p-2 bg-stone-900 border border-emerald-900/50 rounded-lg text-white outline-none focus:border-emerald-500 text-xs"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const email = (configForm.notificationEmail || "tshirtsprintingworld@gmail.com").trim();
                              try {
                                await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Accept": "application/json" },
                                  body: JSON.stringify({
                                    _subject: "🧪 Test Notification - Al Raza Mart Email Verification",
                                    _template: "table",
                                    _captcha: "false",
                                    "Status": "Email verification working successfully!",
                                    "Destination Email": email,
                                    "Sent At": new Date().toLocaleString(),
                                  })
                                });
                                alert(`Test email sent to ${email}! Please check your Gmail inbox (or spam) to confirm.`);
                              } catch (e) {
                                alert("Failed to send test email: " + e);
                              }
                            }}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            🧪 Send Test Email
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Physical Mart Address</label>
                        <input
                          type="text"
                          value={configForm.address || ""}
                          onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                          placeholder="Shop #12-15, Main Organic Market Arcade"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">City / Region</label>
                        <input
                          type="text"
                          value={configForm.city || ""}
                          onChange={(e) => setConfigForm({ ...configForm, city: e.target.value })}
                          placeholder="Lahore / Karachi"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Mart Working Hours</label>
                        <input
                          type="text"
                          value={configForm.martTimings || ""}
                          onChange={(e) => setConfigForm({ ...configForm, martTimings: e.target.value })}
                          placeholder="Monday – Saturday: 9:00 AM – 9:00 PM"
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Google Maps Location URL</label>
                        <input
                          type="url"
                          value={configForm.mapsUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, mapsUrl: e.target.value })}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Used for the "Get Directions" button link.</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links Section */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Social Media Channels (Footer Links)</span>
                      </h4>
                      <span className="text-[11px] text-stone-400">Updates the footer social icons in real time</span>
                    </div>

                    <div className="space-y-3">
                      {/* Instagram */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="w-36 flex items-center gap-2 text-stone-300 font-semibold shrink-0">
                          <span className="w-6 h-6 rounded bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400">
                            <Instagram className="w-3.5 h-3.5" />
                          </span>
                          <span>Instagram</span>
                        </div>
                        <input
                          type="url"
                          id="owner-input-instagram"
                          value={configForm.instagramUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/your_handle"
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono"
                        />
                        {configForm.instagramUrl && (
                          <a
                            href={configForm.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </div>

                      {/* Facebook */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="w-36 flex items-center gap-2 text-stone-300 font-semibold shrink-0">
                          <span className="w-6 h-6 rounded bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
                            <Facebook className="w-3.5 h-3.5" />
                          </span>
                          <span>Facebook</span>
                        </div>
                        <input
                          type="url"
                          id="owner-input-facebook"
                          value={configForm.facebookUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/your_page"
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono"
                        />
                        {configForm.facebookUrl && (
                          <a
                            href={configForm.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </div>

                      {/* Twitter / X */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="w-36 flex items-center gap-2 text-stone-300 font-semibold shrink-0">
                          <span className="w-6 h-6 rounded bg-sky-950/80 border border-sky-700/60 flex items-center justify-center text-sky-400">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </span>
                          <span>Twitter / X</span>
                        </div>
                        <input
                          type="url"
                          id="owner-input-twitter"
                          value={configForm.twitterUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, twitterUrl: e.target.value })}
                          placeholder="https://twitter.com/your_handle"
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono"
                        />
                        {configForm.twitterUrl && (
                          <a
                            href={configForm.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </div>

                      {/* YouTube */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="w-36 flex items-center gap-2 text-stone-300 font-semibold shrink-0">
                          <span className="w-6 h-6 rounded bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
                            <Youtube className="w-3.5 h-3.5" />
                          </span>
                          <span>YouTube</span>
                        </div>
                        <input
                          type="url"
                          id="owner-input-youtube"
                          value={configForm.youtubeUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@your_channel"
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono"
                        />
                        {configForm.youtubeUrl && (
                          <a
                            href={configForm.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </div>

                      {/* TikTok */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="w-36 flex items-center gap-2 text-stone-300 font-semibold shrink-0">
                          <span className="w-6 h-6 rounded bg-stone-900 border border-stone-600 flex items-center justify-center text-cyan-400">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.41a8.3 8.3 0 0 0 4.91 1.63V6.69z"/>
                            </svg>
                          </span>
                          <span>TikTok Profile</span>
                        </div>
                        <input
                          type="url"
                          id="owner-input-tiktok"
                          value={configForm.tiktokUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, tiktokUrl: e.target.value })}
                          placeholder="https://tiktok.com/@your_brand"
                          className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs font-mono"
                        />
                        {configForm.tiktokUrl && (
                          <a
                            href={configForm.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        )}
                      </div>

                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Contact & Social Media Settings</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: SEO & SEARCH ENGINE INDEXING */}
              {activeTab === "seo" && (
                <form onSubmit={handleSaveStoreConfig} className="space-y-6">
                  {/* SEO Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-amber-900/30">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-amber-400" />
                        Search Engine Optimization (SEO) & Google Indexing
                      </h3>
                      <p className="text-xs text-stone-400">
                        Customize meta title, search snippet description, and indexing keywords to rank high on Google Search. All changes sync directly to Firestore.
                      </p>
                    </div>

                    <span className="text-xs font-bold text-amber-400 bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Google Sync</span>
                    </span>
                  </div>

                  {/* Google Search Result Live Preview Card */}
                  <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                      <span className="text-xs font-bold text-stone-300 flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-400" />
                        <span>Google Search Snippet Live Preview</span>
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">Desktop & Mobile SERP</span>
                    </div>

                    {/* Google SERP Snippet Box */}
                    <div className="bg-[#202124] p-4 rounded-xl border border-stone-700/80 space-y-1.5 max-w-2xl font-sans">
                      <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                        <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-[9px] text-amber-300 font-bold">
                          AR
                        </div>
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span className="text-[#dadce0] font-medium">{configForm.brandName || "Al Raza Oil Mart"}</span>
                          <span className="text-[#9aa0a6] text-[10px]">https://alrazaoilmart.com › pure-cold-pressed-oils</span>
                        </div>
                      </div>

                      <h4 className="text-[#8ab4f8] text-base hover:underline cursor-pointer font-medium leading-snug">
                        {configForm.metaTitle || `${configForm.brandName || "Al Raza"} | Pure & Fresh Cold Pressed Oils`}
                      </h4>

                      {/* Google Rating Stars & Price Metadata */}
                      <div className="flex items-center gap-2 text-xs text-[#bdc1c6] pt-0.5">
                        <span className="text-[#fbbc04] font-bold">★★★★★</span>
                        <span>Rating: 4.9 · 1,280+ reviews · In stock · PKR 250 - 2,250 · Cold Extraction</span>
                      </div>

                      <p className="text-[#bdc1c6] text-xs leading-relaxed pt-1">
                        {configForm.metaDescription ||
                          "Buy pure, unrefined cold-pressed oils extracted fresh daily under 42°C in food-grade 304 stainless steel machinery. Pure natural mustard, sesame, almond, black seed, coconut & olive oils."}
                      </p>
                    </div>
                  </div>

                  {/* Meta Title Configuration */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <label htmlFor="owner-seo-meta-title" className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span>SEO Meta Title (Browser & Search Tab Header)</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          (configForm.metaTitle || "").length >= 40 && (configForm.metaTitle || "").length <= 60
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : (configForm.metaTitle || "").length > 60
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-stone-900 text-stone-400"
                        }`}
                      >
                        {(configForm.metaTitle || "").length} / 60 Chars (Optimal: 50-60)
                      </span>
                    </div>

                    <input
                      type="text"
                      id="owner-seo-meta-title"
                      value={configForm.metaTitle || ""}
                      onChange={(e) => setConfigForm({ ...configForm, metaTitle: e.target.value })}
                      placeholder="e.g. Al Raza Cold Press Oil Mart | Pure & Fresh Organic Oils"
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-amber-500"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-stone-500">Quick Templates:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            ...configForm,
                            metaTitle: "Al Raza Cold Press Oil Mart | Pure & Fresh Organic Oils",
                          })
                        }
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded cursor-pointer transition-colors"
                      >
                        Brand + Organic Oils
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            ...configForm,
                            metaTitle: "Buy Pure Cold-Pressed Oils Online in Pakistan | Al Raza",
                          })
                        }
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded cursor-pointer transition-colors"
                      >
                        Pakistan Delivery Focus
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            ...configForm,
                            metaTitle: "Pure Kachi Ghani Mustard, Sesame & Kalonji Oils | Al Raza Mart",
                          })
                        }
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded cursor-pointer transition-colors"
                      >
                        Kachi Ghani Specialty
                      </button>
                    </div>
                  </div>

                  {/* Meta Description Configuration */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <label htmlFor="owner-seo-meta-description" className="font-bold text-amber-300 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>SEO Meta Description (Google Search Snippet Text)</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          (configForm.metaDescription || "").length >= 120 && (configForm.metaDescription || "").length <= 160
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : (configForm.metaDescription || "").length > 160
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-stone-900 text-stone-400"
                        }`}
                      >
                        {(configForm.metaDescription || "").length} / 160 Chars (Optimal: 120-160)
                      </span>
                    </div>

                    <textarea
                      id="owner-seo-meta-description"
                      rows={3}
                      value={configForm.metaDescription || ""}
                      onChange={(e) => setConfigForm({ ...configForm, metaDescription: e.target.value })}
                      placeholder="e.g. Buy pure, unrefined cold-pressed oils extracted fresh daily under 42°C in food-grade 304 stainless steel machinery. Pure natural mustard, sesame, almond, black seed, coconut & olive oils."
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white leading-relaxed focus:ring-1 focus:ring-amber-500"
                    />

                    {/* Quick Description Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-stone-500">Quick Templates:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            ...configForm,
                            metaDescription:
                              "Buy pure, unrefined cold-pressed oils extracted fresh daily under 42°C in food-grade 304 stainless steel machinery. Pure natural mustard, sesame, almond, black seed, coconut & olive oils.",
                          })
                        }
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded cursor-pointer transition-colors"
                      >
                        Standard Extraction Focus
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfigForm({
                            ...configForm,
                            metaDescription:
                              "Pure unadulterated cold pressed oils in Pakistan. Chemical-free, unrefined kachi ghani sarson, raw almond roghan badam, kalonji & extra virgin olive oils delivered to your doorstep.",
                          })
                        }
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 rounded cursor-pointer transition-colors"
                      >
                        Health & Wellness Focus
                      </button>
                    </div>
                  </div>

                  {/* SEO Meta Keywords Tag Manager */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <label htmlFor="owner-seo-meta-keywords" className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span>SEO Meta Keywords (Comma-Separated Indexing Terms)</span>
                      </label>
                      <span className="text-[11px] text-stone-400">
                        {configForm.metaKeywords ? configForm.metaKeywords.split(",").filter((k) => k.trim()).length : 0} active tags
                      </span>
                    </div>

                    <input
                      type="text"
                      id="owner-seo-meta-keywords"
                      value={configForm.metaKeywords || ""}
                      onChange={(e) => setConfigForm({ ...configForm, metaKeywords: e.target.value })}
                      placeholder="cold pressed oil, pure sarson ka tel, mustard oil, black seed kalonji oil, virgin coconut oil..."
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />

                    {/* Interactive Keyword Tag Chips */}
                    {configForm.metaKeywords && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {configForm.metaKeywords
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-amber-200 border border-amber-800/60 text-[11px] font-medium"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentTags = (configForm.metaKeywords || "")
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean);
                                  const filtered = currentTags.filter((_, i) => i !== idx);
                                  setConfigForm({ ...configForm, metaKeywords: filtered.join(", ") });
                                }}
                                className="text-stone-500 hover:text-rose-400 cursor-pointer ml-0.5"
                                title="Remove keyword tag"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Quick Add Popular SEO Keywords */}
                    <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                      <span className="text-[11px] text-stone-400 font-semibold block">Click to Add High-Traffic Search Keywords:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Cold Pressed Mustard Oil",
                          "Pure Kachi Ghani Sarson",
                          "Black Seed Kalonji Oil",
                          "Raw Extra Virgin Olive Oil",
                          "Virgin Coconut Oil",
                          "Pure Sweet Almond Oil",
                          "Cold Extracted Sesame Oil",
                          "Organic Cooking Oil Pakistan",
                          "Natural Hair Growth Oil",
                          "Food Grade 304 Cold Press"
                        ].map((suggestedKeyword) => {
                          const currentTags = (configForm.metaKeywords || "")
                            .split(",")
                            .map((t) => t.trim().toLowerCase());
                          const isAlreadyAdded = currentTags.includes(suggestedKeyword.toLowerCase());

                          return (
                            <button
                              key={suggestedKeyword}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                const current = (configForm.metaKeywords || "").trim();
                                const updated = current ? `${current}, ${suggestedKeyword}` : suggestedKeyword;
                                setConfigForm({ ...configForm, metaKeywords: updated });
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                isAlreadyAdded
                                  ? "bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800"
                                  : "bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60"
                              }`}
                            >
                              + {suggestedKeyword} {isAlreadyAdded && "✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Technical SEO Directives & Open Graph Summary */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Technical SEO, OpenGraph & Search Crawler Directives</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-stone-400 block">Robots Directives:</span>
                        <strong className="text-emerald-400 font-mono">index, follow, max-snippet:-1</strong>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-stone-400 block">Social OpenGraph Protocol:</span>
                        <strong className="text-blue-400 font-mono">og:title, og:image, og:type</strong>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                        <span className="text-stone-400 block">Firestore Persistence:</span>
                        <strong className="text-amber-400 font-mono">store_config/main_settings</strong>
                      </div>
                    </div>
                  </div>

                  {/* Save SEO Settings Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Sync SEO Settings to Firestore</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 10: AFFILIATE PROGRAM WITH FULL MANAGEMENT (10% EARNING PER PRODUCT) */}
              {activeTab === "affiliates" && (
                <OwnerAffiliateManager
                  storeConfig={configForm}
                  onSaveStoreConfig={(newCfg) => {
                    setConfigForm(newCfg);
                    onSaveStoreConfig(newCfg);
                  }}
                  affiliates={affiliateList}
                  onUpdateAffiliates={(newList) => {
                    setAffiliateList(newList);
                    try {
                      localStorage.setItem("alraza_all_affiliates", JSON.stringify(newList));
                    } catch (e) {
                      console.warn("Affiliate storage:", e);
                    }
                  }}
                  showNotification={showNotification}
                />
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
