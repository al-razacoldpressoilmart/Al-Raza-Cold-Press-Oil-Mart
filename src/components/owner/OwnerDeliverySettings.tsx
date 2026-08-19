import React, { useState } from "react";
import {
  Truck,
  DollarSign,
  Save,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Package,
  HelpCircle
} from "lucide-react";
import { StoreConfig } from "../../data/storeConfig";

interface OwnerDeliverySettingsProps {
  storeConfig: StoreConfig;
  onSaveStoreConfig: (newConfig: StoreConfig) => void;
  showNotification: (msg: string) => void;
}

export const OwnerDeliverySettings: React.FC<OwnerDeliverySettingsProps> = ({
  storeConfig,
  onSaveStoreConfig,
  showNotification,
}) => {
  const [form, setForm] = useState<StoreConfig>({ ...storeConfig });
  const [isSaving, setIsSaving] = useState(false);

  // Test Calculator State
  const [testCartAmount, setTestCartAmount] = useState<number>(2000);

  const deliveryFee = Number(form.deliveryFee) || 0;
  const threshold = Number(form.freeDeliveryThreshold) || 2500;
  const isFreeEnabled = form.enableFreeDeliveryAboveThreshold ?? true;

  const testFee = (isFreeEnabled && testCartAmount >= threshold) || testCartAmount === 0 ? 0 : deliveryFee;
  const testTotal = testCartAmount + testFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: StoreConfig = {
      ...form,
      deliveryFee: Number(form.deliveryFee) || 0,
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 2500,
      enableFreeDeliveryAboveThreshold: form.enableFreeDeliveryAboveThreshold ?? true,
      deliveryEstimatedDays: form.deliveryEstimatedDays?.trim() || "2-3 Working Days",
      deliveryPolicyNote: form.deliveryPolicyNote?.trim() || "100% Unbroken Glass Safe Delivery Guarantee",
    };

    setTimeout(() => {
      onSaveStoreConfig(updated);
      setIsSaving(false);
      showNotification("Delivery charges & shipping settings saved successfully to Firestore!");
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 sm:p-5 rounded-2xl border border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Truck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-200">
              Delivery Charges & Shipping Management
            </h3>
            <p className="text-xs text-stone-400">
              Configure flat delivery rates, free delivery thresholds, dispatch timelines, and packaging guarantees.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Checkout Sync</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Pricing Settings Card */}
        <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Delivery Fee & Free Delivery Threshold</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Standard Delivery Charge */}
            <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
              <label className="block text-xs font-bold text-stone-200">
                Standard Door Delivery Charge (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-mono font-bold">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  max="5000"
                  step="10"
                  value={form.deliveryFee ?? 150}
                  onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                This exact amount will be shown separately to clients in their cart & checkout breakdown.
              </p>
            </div>

            {/* Free Delivery Order Minimum */}
            <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
              <label className="block text-xs font-bold text-stone-200">
                Free Delivery Order Minimum (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-mono font-bold">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  max="50000"
                  step="50"
                  value={form.freeDeliveryThreshold ?? 2500}
                  onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Orders with cart total at or above this amount will automatically qualify for 100% FREE delivery.
              </p>
            </div>

          </div>

          {/* Free Delivery Toggle */}
          <div className="p-4 bg-stone-900/70 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-white block">
                Enable Free Delivery Meter on Cart Drawer & Checkout
              </span>
              <p className="text-[11px] text-stone-400">
                Encourages customers to add more cold-pressed bottles to unlock free shipping.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableFreeDeliveryAboveThreshold ?? true}
                onChange={(e) => setForm({ ...form, enableFreeDeliveryAboveThreshold: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Timelines & Delivery Quality Guarantee */}
        <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Estimated Shipping Time & Customer Notice</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-300">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={form.deliveryEstimatedDays || "2-3 Working Days"}
                onChange={(e) => setForm({ ...form, deliveryEstimatedDays: e.target.value })}
                placeholder="e.g. 2-3 Working Days (Karachi 24h, Other Cities 2-3 Days)"
                className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-stone-300">
                Packaging & Breakage Guarantee Note
              </label>
              <input
                type="text"
                value={form.deliveryPolicyNote || "100% Unbroken Glass Safe Delivery Guarantee"}
                onChange={(e) => setForm({ ...form, deliveryPolicyNote: e.target.value })}
                placeholder="e.g. 100% Leak-Proof & Unbroken Glass Bottle Safe Guarantee"
                className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Interactive Delivery Preview Simulator */}
        <div className="p-5 bg-stone-950 rounded-2xl border border-amber-800/50 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Live Checkout Customer Fee Simulator</span>
            </span>
            <span className="text-[11px] text-stone-400 font-mono">Test calculation</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300">Test Customer Cart Subtotal:</span>
              <span className="font-mono font-bold text-white text-sm">Rs. {testCartAmount}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={testCartAmount}
              onChange={(e) => setTestCartAmount(Number(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-center">
            <div className="p-2 bg-stone-950 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Cart Value</span>
              <strong className="text-white font-mono">Rs. {testCartAmount}</strong>
            </div>
            <div className="p-2 bg-stone-950 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Delivery Charge Shown</span>
              <strong className={`font-mono ${testFee === 0 ? "text-emerald-400" : "text-amber-300"}`}>
                {testFee === 0 ? "FREE (0 PKR)" : `Rs. ${testFee}`}
              </strong>
            </div>
            <div className="p-2 bg-stone-950 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Total Client Pays</span>
              <strong className="text-emerald-300 font-mono text-sm">Rs. {testTotal}</strong>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Delivery Charges & Shipping Policy</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
