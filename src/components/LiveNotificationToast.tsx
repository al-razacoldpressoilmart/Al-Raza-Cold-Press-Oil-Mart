import React, { useEffect } from "react";
import {
  Bell,
  X,
  ShoppingBag,
  Gift,
  Building2,
  Star,
  ExternalLink,
} from "lucide-react";
import { StoreNotification } from "../services/liveNotificationService";

interface LiveNotificationToastProps {
  notification: StoreNotification | null;
  onClose: () => void;
  onOpenCenter: () => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  notification,
  onClose,
  onOpenCenter,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7500);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "order":
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case "affiliate":
        return <Gift className="w-5 h-5 text-purple-600" />;
      case "wholesale":
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case "review":
        return <Star className="w-5 h-5 text-amber-500 fill-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              New Notification
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {notification.title}
          </h4>

          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
            {notification.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCenter();
              }}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Open Notifications</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
