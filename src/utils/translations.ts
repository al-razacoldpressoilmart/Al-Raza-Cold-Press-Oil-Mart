export type Language = "en" | "ur";

export interface Translations {
  // Brand & Top bar
  storeName: string;
  storeTagline: string;
  freeDeliveryNotice: string;
  callOrder: string;
  
  // Navigation
  home: string;
  allProducts: string;
  oilsSection: string;
  spicesSection: string;
  flourSection: string;
  wholesaleNav: string;
  affiliateNav: string;
  trackOrderNav: string;
  searchPlaceholder: string;
  cart: string;
  
  // Hero Banner
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaWholesale: string;
  heroCtaCatalog: string;
  badgeOrganic: string;
  badgeFreeDelivery: string;
  badgeCod: string;
  badgeReturn: string;
  
  // Categories
  catAll: string;
  catOils: string;
  catSpices: string;
  catFlour: string;
  catAllDesc: string;
  catOilsDesc: string;
  catSpicesDesc: string;
  catFlourDesc: string;
  
  // Product Card
  perBottle: string;
  rs: string;
  addToCart: string;
  buyNow: string;
  quickView: string;
  inStock: string;
  outOfStock: string;
  save: string;
  selectPackSize: string;
  pureGuarantee: string;
  
  // Footer & Trust
  deliveryAcrossPakistan: string;
  securePackaging: string;
  contactUs: string;
  address: string;
  phone: string;
  rightsReserved: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    storeName: "Al Raza Cold Press Oil Mart",
    storeTagline: "Cold-Pressed Oils, Fresh Ground Spices & Stone-Ground Chakki Atta",
    freeDeliveryNotice: "Free Delivery Across Pakistan on orders above Rs. 2,500!",
    callOrder: "Call / WhatsApp:",
    
    home: "Home",
    allProducts: "All Products",
    oilsSection: "Cold Pressed Oils",
    spicesSection: "Spices (Masalajat)",
    flourSection: "Flour & Chakki Atta",
    wholesaleNav: "Wholesale & Bulk",
    affiliateNav: "Affiliate Program",
    trackOrderNav: "Track Order",
    searchPlaceholder: "Search cold-pressed oil, spices, chakki atta...",
    cart: "Cart",
    
    heroBadge: "Cold Pressed, Natural & Chemical-Free",
    heroTitle: "Cold-Pressed Oils, Fresh Spices & Stone-Ground Atta",
    heroSubtitle: "Traditional stone-ground whole wheat atta, wood & cold-pressed virgin oils, and authentic ground spices delivered fresh to your doorstep with Cash on Delivery across Pakistan.",
    heroCtaWholesale: "Wholesale & Bulk Orders",
    heroCtaCatalog: "Browse Catalog",
    badgeOrganic: "Natural & Unadulterated",
    badgeFreeDelivery: "Free Delivery (Rs. 2500+)",
    badgeCod: "Cash on Delivery (COD)",
    badgeReturn: "Quality Guarantee",
    
    catAll: "All Products",
    catOils: "Cold Pressed Oils",
    catSpices: "Spices (Masalajat)",
    catFlour: "Flour & Chakki Atta",
    catAllDesc: "All natural cold pressed kitchen essentials",
    catOilsDesc: "Virgin cold-pressed mustard, olive, coconut, sesame & seed oils",
    catSpicesDesc: "Stone ground unadulterated turmeric, chili, coriander & spice blends",
    catFlourDesc: "Traditional stone-ground whole wheat atta, gram flour & natural grains",
    
    perBottle: "Pack",
    rs: "Rs.",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    quickView: "Quick View",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    save: "Save",
    selectPackSize: "Select Pack / Size:",
    pureGuarantee: "Fresh Natural Guarantee",
    
    deliveryAcrossPakistan: "Nationwide Express Delivery",
    securePackaging: "Hygienic Sealed Food-Grade Packaging",
    contactUs: "Contact Us:",
    address: "Address:",
    phone: "Phone:",
    rightsReserved: "All Rights Reserved.",
  },
  ur: {
    storeName: "الرضا کولڈ پریس اینڈ پیور مارٹ",
    storeTagline: "کولڈ پریس تیل، تازہ پسے مصالحہ جات اور پتھر چکی کا آٹا",
    freeDeliveryNotice: "پورے پاکستان میں 2,500 روپے سے زائد کے آرڈر پر فری ہوم ڈیلیوری!",
    callOrder: "فون / واٹس ایپ آرڈر:",
    
    home: "ہوم",
    allProducts: "تمام اشیاء",
    oilsSection: "خالص تیل جات",
    spicesSection: "خالص مصالحہ جات",
    flourSection: "چکی کا آٹا اور اناج",
    wholesaleNav: "ہول سیل بلک کوانٹٹی",
    affiliateNav: "ایفیلی ایٹ پروگرام",
    trackOrderNav: "آرڈر ٹریک کریں",
    searchPlaceholder: "سرسوں تیل، ہلدی، چکی آٹا تلاش کریں...",
    cart: "ٹوکری",
    
    heroBadge: "کولڈ پریس، ملاوٹ سے پاک اور قدرتی",
    heroTitle: "کولڈ پریس تیل، دیسی مصالحہ جات اور پتھر چکی کا آٹا",
    heroSubtitle: "کچی گھانی سے نکلا تیل، تازہ پسے ہوئے مصالحہ جات اور غذائیت سے بھرپور پتھر چکی کا آٹا — کیش آن ڈیلیوری پر۔",
    heroCtaWholesale: "ہول سیل بلک آرڈر",
    heroCtaCatalog: "اشیاء دیکھیں",
    badgeOrganic: "ملاوٹ سے پاک",
    badgeFreeDelivery: "فری ہوم ڈیلیوری (2500+)",
    badgeCod: "کیش آن ڈیلیوری (COD)",
    badgeReturn: "اطمینان بخش کوالٹی",
    
    catAll: "تمام اشیاء",
    catOils: "تیل جات (Oils)",
    catSpices: "مصالحہ جات (Spices)",
    catFlour: "چکی کا آٹا (Flour & Atta)",
    catAllDesc: "ہماری تمام قدرتی اشیاء",
    catOilsDesc: "کچی گھانی سے تازہ نکلا سرسوں، زیتون، ناریل اور دیگر تیل",
    catSpicesDesc: "بغیر کیمیکل و رنگ کے تازہ پسے ہوئے دیسی مصالحہ جات",
    catFlourDesc: "روایتی پتھر چکی کا بغیر چھنا گندم آٹا، بیسن، مکئی اور جو کا آٹا",
    
    perBottle: "پیک",
    rs: "روپے",
    addToCart: "ٹوکری میں ڈالیں",
    buyNow: "آرڈر کریں",
    quickView: "تفصیل دیکھیں",
    inStock: "دستیاب ہے",
    outOfStock: "ختم ہو گیا",
    save: "بچت",
    selectPackSize: "سائز منتخب کریں:",
    pureGuarantee: "قدرتی و تازہ گارنٹی",
    
    deliveryAcrossPakistan: "پورے پاکستان میں تیز رفتار ڈیلیوری",
    securePackaging: "محفوظ اور معیاری فوڈ گریڈ پیکنگ",
    contactUs: "رابطہ نمبر:",
    address: "پتہ:",
    phone: "فون:",
    rightsReserved: "تمام حقوق محفوظ ہیں۔",
  }
};
