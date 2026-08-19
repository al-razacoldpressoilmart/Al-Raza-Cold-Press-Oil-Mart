import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  Check,
  Sparkles,
  Copy,
  Download,
  Search,
  ExternalLink,
  Gift,
  CheckCircle2,
  X,
  Phone,
  Wallet,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { StoreConfig } from "../../data/storeConfig";
import { AffiliatePartner } from "../AffiliateModal";

interface OwnerAffiliateManagerProps {
  storeConfig: StoreConfig;
  onSaveStoreConfig: (newConfig: StoreConfig) => void;
  affiliates: AffiliatePartner[];
  onUpdateAffiliates: (newAffiliates: AffiliatePartner[]) => void;
  showNotification: (msg: string) => void;
}

export const OwnerAffiliateManager: React.FC<OwnerAffiliateManagerProps> = ({
  storeConfig,
  onSaveStoreConfig,
  affiliates,
  onUpdateAffiliates,
  showNotification,
}) => {
  const [form, setForm] = useState<StoreConfig>({ ...storeConfig });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal / Form state for Add/Edit Partner
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Partner Form State
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerPaymentMethod, setPartnerPaymentMethod] = useState("EasyPaisa");
  const [partnerAccountDetails, setPartnerAccountDetails] = useState("");
  const [partnerPlatform, setPartnerPlatform] = useState("Social Influencer");

  const commissionRate = form.affiliateCommissionRate ?? 10;
  const buyerDiscount = form.affiliateBuyerDiscount ?? 10;

  const filteredAffiliates = affiliates.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.referralCode.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q))
    );
  });

  const handleSaveProgramSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    const updated: StoreConfig = {
      ...form,
      affiliateCommissionRate: Number(form.affiliateCommissionRate) || 10,
      affiliateBuyerDiscount: Number(form.affiliateBuyerDiscount) || 10,
      enableAffiliateProgram: form.enableAffiliateProgram ?? true,
    };

    setTimeout(() => {
      onSaveStoreConfig(updated);
      setIsSavingConfig(false);
      showNotification("Affiliate program commission (10%) & discount settings updated in Firestore!");
    }, 400);
  };

  const handleOpenAddPartner = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerPhone("");
    setPartnerEmail("");
    setPartnerCode("VIP" + Math.floor(100 + Math.random() * 900));
    setPartnerPaymentMethod("EasyPaisa");
    setPartnerAccountDetails("");
    setPartnerPlatform("Health Practitioner");
    setIsAddModalOpen(true);
  };

  const handleOpenEditPartner = (partner: AffiliatePartner) => {
    setEditingPartner(partner);
    setPartnerName(partner.name);
    setPartnerPhone(partner.phone);
    setPartnerEmail(partner.email || "");
    setPartnerCode(partner.referralCode);
    setPartnerPaymentMethod(partner.paymentMethod);
    setPartnerAccountDetails(partner.accountDetails);
    setPartnerPlatform(partner.platform || "Promoter");
    setIsAddModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerPhone.trim() || !partnerCode.trim()) {
      showNotification("Please fill required fields (Name, Phone, Referral Code).");
      return;
    }

    const cleanCode = partnerCode.trim().toUpperCase();

    if (editingPartner) {
      // Update existing
      const updatedList = affiliates.map((a) =>
        a.id === editingPartner.id
          ? {
              ...a,
              name: partnerName.trim(),
              phone: partnerPhone.trim(),
              email: partnerEmail.trim(),
              referralCode: cleanCode,
              paymentMethod: partnerPaymentMethod,
              accountDetails: partnerAccountDetails.trim(),
              platform: partnerPlatform.trim(),
              customDiscount: `${buyerDiscount}% Off`,
            }
          : a
      );
      onUpdateAffiliates(updatedList);
      showNotification(`Affiliate partner "${partnerName}" updated successfully.`);
    } else {
      // Create new
      const newPartner: AffiliatePartner = {
        id: `AFF-${Date.now()}`,
        name: partnerName.trim(),
        phone: partnerPhone.trim(),
        email: partnerEmail.trim(),
        referralCode: cleanCode,
        paymentMethod: partnerPaymentMethod,
        accountDetails: partnerAccountDetails.trim(),
        platform: partnerPlatform.trim(),
        customDiscount: `${buyerDiscount}% Off`,
        createdAt: new Date().toLocaleDateString(),
        status: "active",
      };
      const updatedList = [newPartner, ...affiliates];
      onUpdateAffiliates(updatedList);
      showNotification(`New affiliate partner "${partnerName}" registered!`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeletePartner = (id: string, name: string) => {
    const updated = affiliates.filter((a) => a.id !== id);
    onUpdateAffiliates(updated);
    setConfirmDeleteId(null);
    showNotification(`Partner "${name}" removed.`);
  };

  const handleCopyPartnerCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(code);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleExportAffiliatesCSV = () => {
    if (affiliates.length === 0) {
      showNotification("No affiliate partners to export.");
      return;
    }

    const headers = ["Partner ID", "Name", "Phone", "Email", "Referral Code", "Commission Rate", "Payout Mode", "Account Details", "Category", "Joined Date"];
    const rows = affiliates.map((a) => [
      `"${a.id}"`,
      `"${a.name}"`,
      `"${a.phone}"`,
      `"${a.email || ""}"`,
      `"${a.referralCode}"`,
      `"${commissionRate}% per product"`,
      `"${a.paymentMethod}"`,
      `"${a.accountDetails}"`,
      `"${a.platform || ""}"`,
      `"${a.createdAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AlRaza_Affiliates_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Exported ${affiliates.length} affiliate partners as CSV.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 sm:p-5 rounded-2xl border border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-200">
                Affiliate Program & Partner Management
              </h3>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                10% Earning per product
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Manage commission rates, coupon codes, doctor/blogger promoter accounts, and weekly payouts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportAffiliatesCSV}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>Export CSV</span>
          </button>
          
          <button
            type="button"
            onClick={handleOpenAddPartner}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Affiliate Partner</span>
          </button>
        </div>
      </div>

      {/* Program Global Rates Configuration Card */}
      <form onSubmit={handleSaveProgramSettings} className="p-5 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
        <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Global Commission & Buyer Discount Settings</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Commission Rate */}
          <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
            <label className="block font-bold text-stone-200">
              Affiliate Earning Commission (% per Product) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={form.affiliateCommissionRate ?? 10}
                onChange={(e) => setForm({ ...form, affiliateCommissionRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">
              Standard: 10% on every pure oil bottle sold.
            </p>
          </div>

          {/* Buyer Discount Rate */}
          <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
            <label className="block font-bold text-stone-200">
              Buyer Discount with Referral Code (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={form.affiliateBuyerDiscount ?? 10}
                onChange={(e) => setForm({ ...form, affiliateBuyerDiscount: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Discount applied automatically when customer uses affiliate code.
            </p>
          </div>

          {/* Toggle Program Active */}
          <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 flex flex-col justify-between">
            <div>
              <span className="block font-bold text-stone-200">Affiliate Program Status</span>
              <p className="text-[11px] text-stone-400 mt-1">
                Show affiliate signup button and banner on header/footer.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-300 font-semibold">
                {(form.enableAffiliateProgram ?? true) ? "Active & Accepting Partners" : "Paused"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableAffiliateProgram ?? true}
                  onChange={(e) => setForm({ ...form, enableAffiliateProgram: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSavingConfig}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isSavingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Affiliate Program Settings</span>
          </button>
        </div>
      </form>

      {/* Partners List & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search affiliate partners by name, code, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs font-bold text-stone-400 shrink-0">
            Showing {filteredAffiliates.length} of {affiliates.length} Partners
          </span>
        </div>

        {filteredAffiliates.length === 0 ? (
          <div className="p-8 text-center bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-400 space-y-2">
            <Users className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="font-bold text-stone-300">No affiliate partners found matching search.</p>
            <p className="text-[11px] text-stone-500">Click "Add Affiliate Partner" above to manually add an influencer or promoter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAffiliates.map((partner) => (
              <div
                key={partner.id}
                className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 hover:border-amber-900/60 transition-all text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{partner.name}</span>
                    <span className="bg-amber-950 text-amber-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                      <span>Code: {partner.referralCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPartnerCode(partner.referralCode)}
                        className="text-amber-400 hover:text-white ml-0.5"
                        title="Copy Code"
                      >
                        {copiedCodeId === partner.referralCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-800">
                      {commissionRate}% Commission
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Joined: {partner.createdAt}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-stone-400">
                  <p>
                    <strong>Contact:</strong> <span className="text-stone-200">{partner.phone}</span> {partner.email && `• ${partner.email}`}
                  </p>
                  <p>
                    <strong>Payout Mode:</strong> <span className="text-stone-200">{partner.paymentMethod}</span> ({partner.accountDetails})
                  </p>
                  <p>
                    <strong>Category / Platform:</strong> <span className="text-stone-200">{partner.platform || "Promoter"}</span>
                  </p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                  <a
                    href={`https://wa.me/${partner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Salam ${partner.name}! 🌿\n\nYour Al Raza Affiliate Code is active:\n*Referral Code:* ${partner.referralCode}\n*Commission:* ${commissionRate}% per product\n*Buyer Discount:* ${buyerDiscount}%\n\nThank you for partnering with Al Raza Oil Mart!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp Partner</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPartner(partner)}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-stone-400" />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId === partner.id ? (
                      <div className="flex items-center gap-1 bg-rose-950 p-0.5 rounded border border-rose-600">
                        <span className="text-[10px] text-rose-200 font-bold px-1">Confirm?</span>
                        <button
                          onClick={() => handleDeletePartner(partner.id, partner.name)}
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
                        onClick={() => setConfirmDeleteId(partner.id)}
                        className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-950 text-stone-100 border border-amber-900/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-stone-900 p-4 border-b border-stone-800 flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{editingPartner ? "Edit Affiliate Partner" : "Add New Affiliate Partner"}</span>
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Partner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ayesha Nutritionist"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Referral Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AYESHA10"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. partner@example.com"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Payout Method</label>
                  <select
                    value={partnerPaymentMethod}
                    onChange={(e) => setPartnerPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  >
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="HBL Bank">HBL Bank</option>
                    <option value="Bank Alfalah">Bank Alfalah</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="Cash / Manual">Cash / Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">Platform / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. YouTube Food Blogger / Clinic"
                    value={partnerPlatform}
                    onChange={(e) => setPartnerPlatform(e.target.value)}
                    className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Payout Account Details / IBAN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300 1234567 - Title: Ayesha Khan"
                  value={partnerAccountDetails}
                  onChange={(e) => setPartnerAccountDetails(e.target.value)}
                  className="w-full p-2 bg-stone-900 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
