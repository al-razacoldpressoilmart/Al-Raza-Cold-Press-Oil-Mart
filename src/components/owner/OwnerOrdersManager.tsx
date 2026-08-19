import React, { useState } from "react";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  FileSpreadsheet,
  Download,
  Search,
  MessageCircle,
  Edit,
  Save,
  X,
  Package,
  Droplet,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { TrackableOrder } from "../OrderTrackingModal";
import { StoreConfig } from "../../data/storeConfig";

interface OwnerOrdersManagerProps {
  orders: any[];
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, updatedOrder: any) => void;
  storeConfig: StoreConfig;
  showNotification: (msg: string) => void;
}

export const OwnerOrdersManager: React.FC<OwnerOrdersManagerProps> = ({
  orders,
  onDeleteOrder,
  onUpdateOrderStatus,
  storeConfig,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Tracking & Status Edit Modal
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>("confirmed");
  const [courierName, setCourierName] = useState<string>("TCS");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord: any) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (ord.orderId || ord.id || "").toLowerCase().includes(q) ||
      (ord.customerName || "").toLowerCase().includes(q) ||
      (ord.phone || ord.customerPhone || "").toLowerCase().includes(q) ||
      (ord.tidNumber || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "has_tid" && (ord.tidNumber || ord.screenshotUrl)) ||
      (statusFilter === "cod" && (ord.paymentMethod === "cod" || !ord.tidNumber)) ||
      (statusFilter === ord.status);

    return matchesSearch && matchesStatus;
  });

  const handleOpenEditTracking = (ord: any) => {
    setEditingOrder(ord);
    setNewStatus(ord.status || "confirmed");
    setCourierName(ord.courierName || "TCS");
    setTrackingNumber(ord.trackingNumber || "");
  };

  const handleSaveOrderTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const ordId = editingOrder.orderId || editingOrder.id;
    const updated = {
      ...editingOrder,
      status: newStatus,
      courierName: courierName.trim(),
      trackingNumber: trackingNumber.trim(),
      dispatchedAt: newStatus === "dispatched" ? new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : editingOrder.dispatchedAt,
      deliveredAt: newStatus === "delivered" ? new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : editingOrder.deliveredAt,
    };

    // Update in parent / localStorage
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(ordId, updated);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem("alraza_orders") || "[]");
        const newArr = saved.map((o: any) => ((o.orderId || o.id) === ordId ? updated : o));
        localStorage.setItem("alraza_orders", JSON.stringify(newArr));
      } catch (err) {
        console.warn("Order local storage sync:", err);
      }
    }

    setEditingOrder(null);
    showNotification(`Order #${ordId} status updated to "${newStatus.toUpperCase()}".`);
  };

  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      showNotification("No orders to export.");
      return;
    }

    const headers = [
      "Order ID", "Date", "Customer Name", "Phone", "Address", "City",
      "Payment Mode", "TID Number", "Fulfillment Status", "Courier Partner", "Courier Tracking #",
      "Subtotal", "Delivery Fee", "Total Amount"
    ];

    const rows = orders.map((ord: any) => [
      `"${ord.orderId || ord.id || ""}"`,
      `"${ord.date || ord.createdAt || ""}"`,
      `"${ord.customerName || ""}"`,
      `"${ord.phone || ord.customerPhone || ""}"`,
      `"${ord.address || ord.shippingAddress || ""}"`,
      `"${ord.city || "Karachi"}"`,
      `"${ord.paymentMethod || "cod"}"`,
      `"${ord.tidNumber || "N/A"}"`,
      `"${ord.status || "confirmed"}"`,
      `"${ord.courierName || "Standard Dispatch"}"`,
      `"${ord.trackingNumber || "N/A"}"`,
      `"${ord.subtotal || ""}"`,
      `"${ord.deliveryFee ?? 0}"`,
      `"${ord.totalAmount || 0}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AlRaza_Orders_Live_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Exported ${orders.length} orders successfully.`);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 sm:p-5 rounded-2xl border border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-200">
              Orders, TID Verification & Dispatch Tracking
            </h3>
            <p className="text-xs text-stone-400">
              Verify customer transaction receipts, update cold-pressing & courier dispatch status, and manage shipments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-800 flex items-center gap-1.5 cursor-pointer shadow transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Orders CSV</span>
          </button>
          
          <span className="text-xs font-bold text-amber-400 bg-stone-900 px-3 py-2 rounded-xl border border-stone-800">
            Total: <strong>{orders.length}</strong> Orders
          </span>
        </div>
      </div>

      {/* Quick Financial Summary */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Total Revenue</span>
            <strong className="text-emerald-400 font-mono text-sm">
              Rs. {orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString()}
            </strong>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Online Paid (TID Verified)</span>
            <strong className="text-amber-300 font-mono text-sm">
              {orders.filter((o: any) => o.tidNumber || o.screenshotUrl).length} Orders
            </strong>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Dispatched / In Transit</span>
            <strong className="text-sky-400 font-mono text-sm">
              {orders.filter((o: any) => o.status === "dispatched").length} Shipments
            </strong>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Delivered & Completed</span>
            <strong className="text-emerald-300 font-mono text-sm">
              {orders.filter((o: any) => o.status === "delivered").length} Orders
            </strong>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Order ID (e.g. AR-849201), Customer, Phone, or TID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
          {[
            { id: "all", label: "All Orders" },
            { id: "has_tid", label: "Online TID" },
            { id: "dispatched", label: "Dispatched" },
            { id: "delivered", label: "Delivered" },
            { id: "cod", label: "COD" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-amber-600 text-white border-amber-500 shadow"
                  : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-400 space-y-2">
            <ShoppingBag className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="font-bold text-stone-300">No customer orders found.</p>
            <p className="text-[11px] text-stone-500">Orders placed by clients in checkout will appear here for live tracking and status updates.</p>
          </div>
        ) : (
          filteredOrders.map((ord: any) => {
            const ordId = ord.orderId || ord.id;
            const deliveryCharge = ord.deliveryFee ?? 0;

            return (
              <div
                key={ordId}
                className="p-4 sm:p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-3.5 hover:border-amber-900/60 transition-all text-xs"
              >
                {/* Top Row: Order ID, Date, Amount, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Order #{ordId}</span>
                      <button
                        onClick={() => handleCopyOrderId(ordId)}
                        className="text-stone-400 hover:text-white"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === ordId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                    <span className="text-stone-500">({ord.date || ord.createdAt || "Today"})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-amber-300 text-sm">
                      Rs. {ord.totalAmount}
                    </span>
                    <span className="bg-stone-900 text-stone-300 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {ord.paymentMethod || "Online"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ord.status === "delivered"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : ord.status === "dispatched"
                          ? "bg-sky-950 text-sky-300 border-sky-700"
                          : ord.status === "processing"
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : "bg-stone-900 text-stone-300 border-stone-700"
                      }`}
                    >
                      {ord.status || "CONFIRMED"}
                    </span>
                  </div>
                </div>

                {/* Details Grid: Customer, Destination, Breakdown, Proof */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Customer Info */}
                  <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Customer Information</span>
                    <p className="font-bold text-white text-xs">{ord.customerName}</p>
                    <p className="text-stone-300 font-mono">{ord.phone || ord.customerPhone}</p>
                    <p className="text-stone-400 text-[11px] line-clamp-2">
                      {ord.address || ord.shippingAddress || ord.deliveryAddress}, {ord.city || "Pakistan"}
                    </p>
                  </div>

                  {/* Delivery Charge & Item Summary */}
                  <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Charges & Pricing</span>
                    <div className="flex justify-between text-stone-300">
                      <span>Delivery Fee:</span>
                      <span className={`font-bold ${deliveryCharge === 0 ? "text-emerald-400" : "text-white"}`}>
                        {deliveryCharge === 0 ? "FREE" : `Rs. ${deliveryCharge}`}
                      </span>
                    </div>
                    {ord.courierName && (
                      <div className="pt-1 text-[11px] text-sky-300 border-t border-stone-800">
                        <span>Courier: <strong>{ord.courierName}</strong></span>
                        {ord.trackingNumber && <span className="font-mono ml-1.5">({ord.trackingNumber})</span>}
                      </div>
                    )}
                  </div>

                  {/* TID Verification & Receipt Screenshot */}
                  <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Payment Verification</span>
                    <p className="text-amber-400 font-bold flex items-center justify-between">
                      <span>TID:</span>
                      <code className="text-white font-mono bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        {ord.tidNumber || "N/A"}
                      </code>
                    </p>
                    {ord.screenshotUrl && (
                      <a
                        href={ord.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 font-semibold"
                      >
                        <span>View Attached Payment Proof Receipt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                </div>

                {/* Actions: Live Tracking Updater, WhatsApp Notify, Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
                  
                  {/* WhatsApp Quick Dispatch Notification */}
                  <a
                    href={`https://wa.me/${(ord.phone || ord.customerPhone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Salam ${ord.customerName}! 🌿\n\nYour Al Raza Pure Cold Pressed Oil Order is updated:\n*Order ID:* ${ordId}\n*Status:* ${(ord.status || "CONFIRMED").toUpperCase()}\n*Courier:* ${ord.courierName || "TCS Express"}\n*Tracking Number:* ${ord.trackingNumber || "Assigned"}\n\nTrack your order anytime on our website using your Order ID!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send Tracking Update on WhatsApp</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditTracking(ord)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Update Status & Tracking #</span>
                    </button>

                    {confirmDeleteId === ordId ? (
                      <div className="flex items-center gap-1 bg-rose-950 p-0.5 rounded border border-rose-600">
                        <span className="text-[10px] text-rose-200 font-bold px-1">Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteOrder(ordId);
                            setConfirmDeleteId(null);
                            showNotification(`Order #${ordId} deleted.`);
                          }}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(ordId)}
                        className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Order Tracking & Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-950 text-stone-100 border border-amber-900/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-stone-900 p-4 border-b border-stone-800 flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Update Order Tracking #{editingOrder.orderId || editingOrder.id}</span>
              </h4>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderTracking} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">
                  Order Status (Live Client Tracking Stepper)
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white font-semibold"
                >
                  <option value="confirmed">1. Confirmed & Booking Logged</option>
                  <option value="processing">2. Fresh Cold Extraction & Quality Inspection</option>
                  <option value="dispatched">3. Bottled, Sealed & Dispatched with Courier</option>
                  <option value="delivered">4. Delivered to Customer Doorstep</option>
                  <option value="cancelled">5. Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Assigned Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. TCS / Leopards / Trax / Swyft"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Consignment / Tracking Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 7894561230"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-[11px] text-stone-400">
                <span>When you update this, clients can track this order in real time by clicking "Track Order" on the website and entering their Order ID #{editingOrder.orderId || editingOrder.id}.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg shadow"
                >
                  Save & Update Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
