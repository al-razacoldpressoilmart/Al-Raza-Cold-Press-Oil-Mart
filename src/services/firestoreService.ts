import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType
} from "../lib/firebase";
import { StoreConfig } from "../data/storeConfig";
import { Product, ProductReview } from "../types";
import { sanitizeFirestorePayload } from "../utils/imageCompressor";

export interface FirestoreOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  totalAmount: number;
  paymentMethod: "cod" | "easypaisa" | "jazzcash" | "bank_transfer" | "nayapay" | "sadapay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled";
  itemsSummary: string;
  specialInstructions?: string;
  createdAt: string;
}

export interface FirestoreCustomBlend {
  id: string;
  blendName: string;
  creatorName?: string;
  targetConcern: string;
  ingredients: string;
  bottleSize?: string;
  totalPrice: number;
  createdAt: string;
}

// 1. ORDERS SERVICE
export async function saveOrderToFirestore(order: FirestoreOrder): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const cleanOrder = sanitizeFirestorePayload(order);
    await setDoc(doc(db, "orders", order.id), cleanOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, "orders", orderId));
  } catch (error) {
    console.warn("Firestore delete order note:", error);
    // Don't crash local UI if offline or permission fails
  }
}

export function subscribeOrders(
  onOrders: (orders: FirestoreOrder[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: FirestoreOrder[] = [];
      snapshot.forEach((d) => {
        orders.push(d.data() as FirestoreOrder);
      });
      onOrders(orders);
    },
    (error) => {
      console.warn("Orders subscription fallback to local:", error.message);
      if (onError) onError(error);
    }
  );
}

// 2. STORE MASTER CONFIG SERVICE
export async function saveStoreConfigToFirestore(config: StoreConfig): Promise<void> {
  const path = "store_config/main_settings";
  try {
    // Sanitize config ensuring no oversized base64 strings violate the 1MB Firestore limit
    const cleanConfig = sanitizeFirestorePayload(config);
    const payload = {
      ...cleanConfig,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "store_config", "main_settings"), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeStoreConfig(
  onConfig: (config: StoreConfig) => void,
  onError?: (err: any) => void
) {
  const configDoc = doc(db, "store_config", "main_settings");
  return onSnapshot(
    configDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        onConfig(snapshot.data() as StoreConfig);
      }
    },
    (error) => {
      console.warn("Store config subscription note:", error.message);
      if (onError) onError(error);
    }
  );
}

// 3. REVIEWS SERVICE
export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const cleanReview = sanitizeFirestorePayload(review);
    await setDoc(doc(db, "reviews", review.id), cleanReview);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
  } catch (error) {
    console.warn("Firestore delete review note:", error);
  }
}

export function subscribeReviews(
  onReviews: (reviews: ProductReview[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, "reviews"), limit(200));
  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: ProductReview[] = [];
      snapshot.forEach((d) => {
        reviews.push(d.data() as ProductReview);
      });
      if (reviews.length > 0) {
        onReviews(reviews);
      }
    },
    (error) => {
      console.warn("Reviews live subscription note:", error.message);
      if (onError) onError(error);
    }
  );
}

// 4. CUSTOM BLENDS SERVICE
export async function saveCustomBlendToFirestore(blend: FirestoreCustomBlend): Promise<void> {
  const path = `custom_blends/${blend.id}`;
  try {
    const cleanBlend = sanitizeFirestorePayload(blend);
    await setDoc(doc(db, "custom_blends", blend.id), cleanBlend);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomBlendFromFirestore(blendId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "custom_blends", blendId));
  } catch (error) {
    console.warn("Firestore delete custom blend note:", error);
  }
}

// 5. PRODUCTS CATALOG SERVICE
export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const cleanProduct = sanitizeFirestorePayload(product);
    await setDoc(doc(db, "products", product.id), cleanProduct);
  } catch (error) {
    console.warn("Firestore save product error:", error);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    console.warn("Firestore delete product error:", error);
  }
}

export function subscribeProducts(
  onProducts: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, "products"), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((d) => {
        prods.push(d.data() as Product);
      });
      onProducts(prods);
    },
    (error) => {
      console.warn("Products live subscription fallback to local:", error.message);
      if (onError) onError(error);
    }
  );
}

