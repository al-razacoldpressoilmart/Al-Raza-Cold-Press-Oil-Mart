import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Gift,
  Building2,
  Star,
  Sparkles,
  Clock,
  ShieldCheck,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  StoreNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationFromFirestore,
  createStoreNotification,
  playNotificationChime,
} from "../services/liveNotificationService";
import { StoreConfig } from "../data/storeConfig";

interface LiveNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StoreNotification[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  storeConfig: StoreConfig;
  onOpenOrderTracking?: (orderId: string) => void;
}

export const LiveNotificationCenterModal: React.FC<LiveNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  soundEnabled,
  onToggleSound,
  storeConfig,
  onOpenOrderTracking,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "order" | "affiliate" | "wholesale" | "review">("all");
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (activeFilter === "all" ? true : n.type === activeFilter));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      if (soundEnabled) playNotificationChime();
      await createStoreNotification({
        type: "order",
        title: `🚨 Test Order #AR-${Math.floor(1000 + Math.random() * 9000)} Received!`,
        message: `Verified Customer placed an order for Rs. 2,850 (Pure Sarson Oil 1L & Turmeric Powder).`,
        data: {
          customerName: "Test Customer",
          city: "Lahore",
          totalAmount: 2850,
        },
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case "affiliate":
        return <Gift className="w-5 h-5 text-purple-600" />;
      case "wholesale":
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case "review":
        return <Star className="w-5 h-5 text-amber-500 fill-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Live Store Notifications
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Firebase Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time alerts for orders, affiliate registrations, wholesale inquiries &amp; reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("order")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === "order"
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Orders ({notifications.filter((n) => n.type === "order").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("affiliate")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === "affiliate"
                  ? "bg-purple-700 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Affiliates ({notifications.filter((n) => n.type === "affiliate").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("wholesale")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === "wholesale"
                  ? "bg-amber-700 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Wholesale ({notifications.filter((n) => n.type === "wholesale").length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead(notifications)}
                className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={isSendingTest}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
              title="Send a sample notification to verify audio & Firebase live feed"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isSendingTest ? "Sending..." : "Test Notification"}</span>
            </button>
          </div>

        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-14 text-center max-w-sm mx-auto space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Notifications Yet</h3>
              <p className="text-xs text-slate-500">
                Whenever a customer places an order, signs up for the affiliate program, or sends a bulk wholesale inquiry, it will instantly pop up here and ring an audio chime!
              </p>
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Create Test Order Notification</span>
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.isRead
                    ? "bg-white border-slate-200"
                    : "bg-emerald-50/40 border-emerald-200 shadow-xs"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  {getIconForType(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                    {item.message}
                  </p>

                  {/* Contextual Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    {item.data?.customerPhone && (
                      <a
                        href={`https://wa.me/${String(item.data.customerPhone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${item.data.customerName || ""}! Thank you for contacting Al Raza Cold Press Oil Mart.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-700" />
                        <span>WhatsApp ({item.data.customerPhone})</span>
                      </a>
                    )}

                    {item.data?.phone && !item.data?.customerPhone && (
                      <a
                        href={`https://wa.me/${String(item.data.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${item.data.fullName || item.data.contactPerson || ""}! Al Raza Organic Mart confirms your inquiry.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-700" />
                        <span>WhatsApp ({item.data.phone})</span>
                      </a>
                    )}

                    {item.data?.orderId && onOpenOrderTracking && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenOrderTracking(item.data.orderId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Track Order #{item.data.orderId}</span>
                      </button>
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markNotificationAsRead(item.id)}
                        className="text-slate-500 hover:text-slate-800 font-semibold ml-auto cursor-pointer"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteNotificationFromFirestore(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors ml-auto cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Synced directly to store owner: <strong className="text-slate-800">tshirtsprintingworld@gmail.com</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
