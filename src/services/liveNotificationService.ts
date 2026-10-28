import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
} from "../lib/firebase";

export interface StoreNotification {
  id: string;
  type: "order" | "affiliate" | "wholesale" | "review" | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

/**
 * Web Audio API chime synthesizer for crisp, dependable audio notifications
 * Works without external MP3 files that could fail cross-origin or offline.
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First note: High chime (C6 -> E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note: Bright harmonic bell (G6 -> C7)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1567.98, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.25);
    gain2.gain.setValueAtTime(0.25, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.65);
  } catch {
    // Audio context may need initial user interaction
  }
}

/**
 * Create and push a new store notification to Firestore
 */
export async function createStoreNotification(
  payload: Omit<StoreNotification, "id" | "isRead" | "createdAt">
): Promise<StoreNotification> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const notif: StoreNotification = {
    ...payload,
    id: notifId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. Save to Firestore
    await setDoc(doc(db, "notifications", notifId), notif);

    // 2. Also keep a local cache in localStorage for instant access
    try {
      const saved = localStorage.getItem("alraza_live_notifications");
      const list: StoreNotification[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem("alraza_live_notifications", JSON.stringify([notif, ...list.slice(0, 49)]));
    } catch {}

    // 3. Play audio chime
    playNotificationChime();
  } catch (err) {
    console.warn("Firestore notification dispatch note:", err);
  }

  return notif;
}

/**
 * Subscribe to live notifications from Firestore
 */
export function subscribeLiveNotifications(
  onNotifications: (notifications: StoreNotification[]) => void,
  onNewArrival?: (newNotif: StoreNotification) => void
) {
  let initialLoad = true;
  let seenIds = new Set<string>();

  // Pre-load from localStorage first so user sees existing notifications immediately
  try {
    const saved = localStorage.getItem("alraza_live_notifications");
    if (saved) {
      const parsed: StoreNotification[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((n) => seenIds.add(n.id));
        onNotifications(parsed);
      }
    }
  } catch {}

  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StoreNotification[] = [];
      const newItems: StoreNotification[] = [];

      snapshot.forEach((d) => {
        const item = d.data() as StoreNotification;
        list.push(item);

        if (!initialLoad && !seenIds.has(item.id)) {
          newItems.push(item);
        }
        seenIds.add(item.id);
      });

      // Update localStorage cache
      try {
        localStorage.setItem("alraza_live_notifications", JSON.stringify(list));
      } catch {}

      onNotifications(list);

      // Trigger audio & toast for brand new real-time items arriving
      if (!initialLoad && newItems.length > 0) {
        const latest = newItems[0];
        playNotificationChime();
        if (onNewArrival) {
          onNewArrival(latest);
        }
      }

      initialLoad = false;
    },
    (err) => {
      console.warn("Notifications subscription fallback:", err.message);
    }
  );
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", id), { isRead: true });
  } catch {
    // fallback local
    try {
      const saved = localStorage.getItem("alraza_live_notifications");
      if (saved) {
        const list: StoreNotification[] = JSON.parse(saved);
        const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        localStorage.setItem("alraza_live_notifications", JSON.stringify(updated));
      }
    } catch {}
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(notifications: StoreNotification[]): Promise<void> {
  try {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) => updateDoc(doc(db, "notifications", n.id), { isRead: true }).catch(() => {}))
    );
  } catch {}

  try {
    const saved = localStorage.getItem("alraza_live_notifications");
    if (saved) {
      const list: StoreNotification[] = JSON.parse(saved);
      const updated = list.map((n) => ({ ...n, isRead: true }));
      localStorage.setItem("alraza_live_notifications", JSON.stringify(updated));
    }
  } catch {}
}

/**
 * Delete a notification from Firestore
 */
export async function deleteNotificationFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "notifications", id));
  } catch {}

  try {
    const saved = localStorage.getItem("alraza_live_notifications");
    if (saved) {
      const list: StoreNotification[] = JSON.parse(saved);
      const updated = list.filter((n) => n.id !== id);
      localStorage.setItem("alraza_live_notifications", JSON.stringify(updated));
    }
  } catch {}
}

/**
 * Save an affiliate to Firestore and trigger a live notification
 */
export async function saveAffiliateToFirestore(affiliate: any): Promise<void> {
  const affId = affiliate.id || `AFF-${Date.now()}`;
  const record = { ...affiliate, id: affId, createdAt: affiliate.createdAt || new Date().toISOString() };

  // 1. Save to affiliates collection
  try {
    await setDoc(doc(db, "affiliates", affId), record);
  } catch (e) {
    console.warn("Firestore affiliate save:", e);
  }

  // 2. Save in localStorage for offline resiliency
  try {
    const saved = localStorage.getItem("alraza_all_affiliates");
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem("alraza_all_affiliates", JSON.stringify([record, ...list]));
  } catch {}

  // 3. Create a real-time Notification document
  await createStoreNotification({
    type: "affiliate",
    title: `🤝 New Affiliate Partner: ${record.fullName}`,
    message: `${record.fullName} registered with referral code "${record.referralCode || 'AFF10'}". Phone: ${record.phone}`,
    data: record,
  });
}

/**
 * Save a wholesale inquiry to Firestore and trigger a live notification
 */
export async function saveWholesaleInquiryToFirestore(inquiry: any): Promise<void> {
  const inqId = inquiry.id || `INQ-${Date.now()}`;
  const record = { ...inquiry, id: inqId, createdAt: inquiry.createdAt || new Date().toISOString() };

  // 1. Save to wholesale_inquiries collection
  try {
    await setDoc(doc(db, "wholesale_inquiries", inqId), record);
  } catch (e) {
    console.warn("Firestore wholesale save:", e);
  }

  // 2. Save in localStorage
  try {
    const saved = localStorage.getItem("alraza_wholesale_inquiries");
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem("alraza_wholesale_inquiries", JSON.stringify([record, ...list]));
  } catch {}

  // 3. Create a real-time Notification document
  await createStoreNotification({
    type: "wholesale",
    title: `📦 New Wholesale Inquiry: ${record.businessName || record.contactPerson}`,
    message: `Requested ${record.estimatedQuantity} of ${record.category} in ${record.city}. Phone: ${record.phone}`,
    data: record,
  });
}
