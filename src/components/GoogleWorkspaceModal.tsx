import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  HardDrive,
  Send,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  signInWithGoogleWorkspace,
  signOutWorkspace,
  getWorkspaceAccessToken,
  fetchGmailProfile,
  sendGmailEmail,
  listGmailMessages,
  listGoogleDriveFiles,
  uploadFileToGoogleDrive,
  deleteFileFromGoogleDrive,
  GmailProfile,
  DriveFileItem,
} from "../lib/googleWorkspace";
import { StoreConfig } from "../data/storeConfig";
import { Product } from "../types";

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  products: Product[];
  storeConfig: StoreConfig;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  storeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<"gmail" | "drive">("gmail");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gmail states
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailTo, setEmailTo] = useState(storeConfig.notificationEmail || "tshirtsprintingworld@gmail.com");
  const [emailSubject, setEmailSubject] = useState("Al Raza Oil Mart - Store Notification");
  const [emailBody, setEmailBody] = useState("");

  // Drive states
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [isFetchingDrive, setIsFetchingDrive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = getWorkspaceAccessToken();
      setAccessToken(token);
      if (token) {
        loadWorkspaceData(token);
      }
    }
  }, [isOpen]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (!res) {
        // User closed or dismissed the popup window without completing sign-in
        return;
      }
      const { user, accessToken: token } = res;
      setCurrentUser(user);
      setAccessToken(token);
      showStatus("success", `Connected as ${user.email}`);
      await loadWorkspaceData(token);
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.message?.includes("popup-closed-by-user") ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      showStatus("error", err.message || "Failed to sign in with Google Workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutWorkspace();
      setCurrentUser(null);
      setAccessToken(null);
      setGmailProfile(null);
      setGmailMessages([]);
      setDriveFiles([]);
      showStatus("success", "Disconnected from Google Workspace.");
    } catch (err: any) {
      showStatus("error", err.message || "Error signing out.");
    }
  };

  const loadWorkspaceData = async (token: string) => {
    // Load Gmail Profile & Messages
    try {
      const profile = await fetchGmailProfile(token);
      setGmailProfile(profile);
      const messages = await listGmailMessages("Al Raza", 6, token);
      setGmailMessages(messages);
    } catch (e: any) {
      console.warn("Gmail load issue:", e.message);
    }

    // Load Drive Files
    try {
      setIsFetchingDrive(true);
      const files = await listGoogleDriveFiles(15, token);
      setDriveFiles(files);
    } catch (e: any) {
      console.warn("Drive load issue:", e.message);
    } finally {
      setIsFetchingDrive(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      showStatus("error", "Please fill in recipient email, subject, and message content.");
      return;
    }

    setIsSendingEmail(true);
    try {
      const htmlFormatted = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #047857; margin-top: 0;">${storeConfig.storeName || "Al Raza Pure Organic Mart"}</h2>
          <p style="color: #475569; font-size: 14px;"><strong>Official Store Notification</strong></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <div style="color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
            ${emailBody.replace(/\n/g, "<br>")}
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            Al Raza Cold Press Oil & Natural Products Mart<br>
            Phone: ${storeConfig.storePhone || "0329-2832225"} | Email: ${storeConfig.notificationEmail || "tshirtsprintingworld@gmail.com"}
          </p>
        </div>
      `;

      await sendGmailEmail({
        to: emailTo,
        subject: emailSubject,
        bodyHtml: htmlFormatted,
      });

      showStatus("success", `Email sent successfully to ${emailTo} via Gmail!`);
      setEmailBody("");
      // Refresh messages list
      if (accessToken) {
        listGmailMessages("Al Raza", 6, accessToken).then(setGmailMessages).catch(() => {});
      }
    } catch (err: any) {
      showStatus("error", err.message || "Failed to send email via Gmail.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExportOrdersToDrive = async () => {
    if (!accessToken) {
      showStatus("error", "Please connect to Google Workspace first.");
      return;
    }

    setIsUploadingToDrive(true);
    try {
      // Build CSV
      const headers = ["Order ID", "Customer Name", "Phone", "Email", "Address", "City", "Total Amount (PKR)", "Items", "Date"];
      const rows = orders.map((o) => {
        const itemsStr = Array.isArray(o.items)
          ? o.items.map((i: any) => `${i.product?.name || "Product"} (${i.quantity}x)`).join(" | ")
          : "";
        return [
          `"${o.orderId || o.id || ""}"`,
          `"${o.customerName || ""}"`,
          `"${o.customerPhone || ""}"`,
          `"${o.customerEmail || ""}"`,
          `"${(o.deliveryAddress || "").replace(/"/g, '""')}"`,
          `"${o.city || ""}"`,
          `"${o.totalAmount || 0}"`,
          `"${itemsStr.replace(/"/g, '""')}"`,
          `"${o.date || o.createdAt || new Date().toISOString()}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Al_Raza_Store_Orders_${dateStr}.csv`;

      const uploaded = await uploadFileToGoogleDrive({
        fileName,
        fileContent: csvContent,
        mimeType: "text/csv",
        description: `Al Raza Mart Customer Orders Export as of ${dateStr} (${orders.length} total orders)`,
      });

      showStatus("success", `File "${fileName}" saved to your Google Drive!`);
      // Reload drive files list
      const files = await listGoogleDriveFiles(15, accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      showStatus("error", err.message || "Failed to upload orders CSV to Google Drive.");
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleExportCatalogToDrive = async () => {
    if (!accessToken) {
      showStatus("error", "Please connect to Google Workspace first.");
      return;
    }

    setIsUploadingToDrive(true);
    try {
      const headers = ["Product ID", "Name", "Category", "Subcategory", "Base Price (PKR)", "Sizes & Pricing", "Purity Rating", "In Stock"];
      const rows = products.map((p) => {
        const sizesStr = p.sizes.map((s) => `${s.size}: Rs.${s.price} (Stock: ${s.stockQuantity ?? 10})`).join(" | ");
        return [
          `"${p.id}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          `"${p.subcategory || ""}"`,
          `"${p.price}"`,
          `"${sizesStr.replace(/"/g, '""')}"`,
          `"${p.purityPercentage || 100}%"`,
          `"${p.inStock ? "Yes" : "No"}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Al_Raza_Product_Catalog_${dateStr}.csv`;

      await uploadFileToGoogleDrive({
        fileName,
        fileContent: csvContent,
        mimeType: "text/csv",
        description: `Al Raza Mart Complete Product Catalog Export (${products.length} items)`,
      });

      showStatus("success", `Catalog "${fileName}" saved to your Google Drive!`);
      const files = await listGoogleDriveFiles(15, accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      showStatus("error", err.message || "Failed to upload catalog to Google Drive.");
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleDeleteDriveFile = async (file: DriveFileItem) => {
    try {
      const deleted = await deleteFileFromGoogleDrive(file.id, file.name, accessToken || undefined);
      if (deleted) {
        showStatus("success", `Deleted "${file.name}" from Google Drive.`);
        setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
      }
    } catch (err: any) {
      showStatus("error", err.message || "Failed to delete file.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 p-1">
              <Mail className="w-4 h-4 text-rose-500" />
              <HardDrive className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                Google Workspace Integration
              </h2>
              <p className="text-xs text-slate-500">
                Official Gmail & Google Drive Cloud Services for Al Raza Mart
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Status Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-3 text-xs sm:text-sm font-medium flex items-center gap-2 border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Authentication Top Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {accessToken ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected {gmailProfile?.emailAddress ? `(${gmailProfile.emailAddress})` : ""}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Connect with your Google account to send Gmail notifications and backup data to Google Drive.</span>
            </div>
          )}

          {!accessToken && (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading ? "Signing in..." : "Sign In with Google"}</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("gmail")}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "gmail"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail Communications</span>
            {gmailProfile && (
              <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {gmailProfile.messagesTotal} msgs
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "drive"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive Storage</span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {driveFiles.length} files
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!accessToken ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                <HardDrive className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Connect Google Workspace</h3>
              <p className="text-sm text-slate-500">
                Authorize your Google account to send real order receipts, affiliate approvals, and store dispatches directly through Gmail, and save automated CSV backups to Google Drive.
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Connect Account Now</span>
              </button>
            </div>
          ) : activeTab === "gmail" ? (
            <div className="space-y-6">
              {/* Profile Card */}
              {gmailProfile && (
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-rose-800 font-semibold uppercase tracking-wider">Active Sender Account</p>
                    <p className="text-base font-bold text-slate-900">{gmailProfile.emailAddress}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-800">{gmailProfile.threadsTotal}</span> Threads
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{gmailProfile.messagesTotal}</span> Total Messages
                    </div>
                  </div>
                </div>
              )}

              {/* Compose & Send Form */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Send Official Gmail Notification</span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailTo("tshirtsprintingworld@gmail.com");
                        setEmailSubject("Al Raza Mart - Store Test Notification");
                        setEmailBody("This is an official verification email confirming that Gmail dispatch is configured correctly for Al Raza Cold Press Oil Mart.");
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      Fill Test Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject("Your Al Raza Cold Press Order is Confirmed!");
                        setEmailBody("Dear Customer,\n\nThank you for choosing Al Raza Cold Press Oil Mart. Your order is confirmed and currently being freshly extracted at our facility.\n\nFree Delivery on orders above Rs. 1500 across Pakistan.\n\nWarm regards,\nAl Raza Team");
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      Order Template
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">To (Recipient Email)</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject line"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Body Content</label>
                    <textarea
                      rows={4}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your official email message..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingEmail ? "Sending via Gmail..." : "Send Gmail Message"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Recent Store Messages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Recent Store Messages</h3>
                  <button
                    type="button"
                    onClick={() => accessToken && listGmailMessages("Al Raza", 6, accessToken).then(setGmailMessages)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {gmailMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No recent messages found with query "Al Raza".</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                    {gmailMessages.map((msg) => (
                      <div key={msg.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                          <span className="truncate max-w-[260px] sm:max-w-md">{msg.subject || "(No Subject)"}</span>
                          <span className="text-[11px] text-slate-400">{msg.date ? new Date(msg.date).toLocaleDateString() : ""}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] truncate">{msg.snippet || msg.from}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Drive Backup Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Backup Customer Orders</h4>
                      <p className="text-xs text-slate-500">{orders.length} orders currently recorded</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportOrdersToDrive}
                    disabled={isUploadingToDrive}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isUploadingToDrive ? "Uploading to Drive..." : "Backup Orders to Google Drive"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-amber-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Export Product Catalog</h4>
                      <p className="text-xs text-slate-500">{products.length} live products with stock & pricing</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCatalogToDrive}
                    disabled={isUploadingToDrive}
                    className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isUploadingToDrive ? "Uploading to Drive..." : "Save Catalog to Google Drive"}</span>
                  </button>
                </div>
              </div>

              {/* Google Drive Files Explorer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>Files on Google Drive</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => accessToken && loadWorkspaceData(accessToken)}
                    disabled={isFetchingDrive}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingDrive ? "animate-spin" : ""}`} />
                    <span>Refresh Files</span>
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    No files found on Google Drive. Click one of the backup buttons above to save your first export.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {file.createdTime ? new Date(file.createdTime).toLocaleString() : "Recently uploaded"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDriveFile(file)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete File from Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Project ID: <strong className="text-slate-700">supple-cycle-56shk</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
