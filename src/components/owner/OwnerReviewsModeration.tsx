import React, { useState } from "react";
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  Reply, 
  Search, 
  Check, 
  AlertCircle,
  Filter,
  UserCheck
} from "lucide-react";
import { ProductReview } from "../../types";

interface OwnerReviewsModerationProps {
  reviews: ProductReview[];
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onToggleFeatureReview: (reviewId: string) => void;
  onSaveOwnerReply: (reviewId: string, replyText: string) => void;
}

export const OwnerReviewsModeration: React.FC<OwnerReviewsModerationProps> = ({
  reviews,
  onApproveReview,
  onRejectReview,
  onDeleteReview,
  onToggleFeatureReview,
  onSaveOwnerReply,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleStartReply = (review: ProductReview) => {
    setReplyingReviewId(review.id);
    setReplyText(review.ownerReply || "");
  };

  const handleSaveReply = (reviewId: string) => {
    onSaveOwnerReply(reviewId, replyText.trim());
    setReplyingReviewId(null);
    setReplyText("");
    showNotice("Owner reply saved and published!");
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (review: ProductReview) => {
    onDeleteReview(review.id);
    setConfirmDeleteId(null);
    showNotice(`Review by "${review.authorName}" was deleted.`);
  };

  // Metrics
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved" || r.status === undefined).length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "pending") return r.status === "pending";
    if (filterStatus === "approved") return r.status === "approved" || r.status === undefined;
    if (filterStatus === "rejected") return r.status === "rejected";
    return true;
  });

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-900/10 p-4 rounded-2xl border border-amber-900/20">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            Customer Feedback & Review Moderation
          </h3>
          <p className="text-xs text-amber-800/80">
            Moderate submitted customer reviews, approve authentic feedback, reply as store owner, and feature top ratings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
            Total {totalCount} Reviews ({pendingCount} Pending)
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "all"
                ? "bg-amber-900 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            All Reviews ({totalCount})
          </button>

          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            Pending Moderation ({pendingCount})
          </button>

          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "approved"
                ? "bg-emerald-700 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === "rejected"
                ? "bg-rose-700 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-amber-700 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search author or review..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-amber-200 text-xs text-amber-900">
            <MessageSquare className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="font-bold">No customer reviews found in this filter category.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isApproved = rev.status === "approved" || rev.status === undefined;
            const isPending = rev.status === "pending";
            const isRejected = rev.status === "rejected";

            return (
              <div 
                key={rev.id}
                className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs space-y-3 transition-all hover:border-amber-400"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-amber-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-amber-950">{rev.authorName}</span>
                      {rev.authorCity && (
                        <span className="text-xs text-amber-700">({rev.authorCity})</span>
                      )}
                      {rev.verifiedPurchase && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-0.5 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Buyer
                        </span>
                      )}
                      <span className="text-[10px] text-amber-800/60 ml-1">{rev.date}</span>
                    </div>

                    <p className="text-xs text-amber-800 font-semibold mt-0.5">
                      Product: <span className="text-amber-950 font-bold">{rev.productName}</span>
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Pending Moderation
                      </span>
                    )}
                    {isApproved && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        ✓ Approved (Live)
                      </span>
                    )}
                    {isRejected && (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        ✕ Rejected (Hidden)
                      </span>
                    )}
                    {rev.isFeatured && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Review text */}
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-1.5">{rev.rating}.0 / 5.0</span>
                  </div>

                  {rev.title && (
                    <p className="font-bold text-xs text-amber-950 mb-1">"{rev.title}"</p>
                  )}

                  <p className="text-xs text-amber-900/90 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    {rev.comment}
                  </p>
                </div>

                {/* Existing Owner Reply */}
                {rev.ownerReply && replyingReviewId !== rev.id && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                    <p className="font-bold text-[11px] text-emerald-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Published Owner Response:
                    </p>
                    <p className="text-[11px] text-emerald-900/90 mt-0.5">{rev.ownerReply}</p>
                  </div>
                )}

                {/* Reply Form if active */}
                {replyingReviewId === rev.id && (
                  <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 space-y-2 text-xs animate-fadeIn">
                    <label className="block font-bold text-amber-950">Write Official Store Response:</label>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Thank the customer or explain batch extraction details..."
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setReplyingReviewId(null)}
                        className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveReply(rev.id)}
                        className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save & Publish Reply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Moderation Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Approve button */}
                    {!isApproved && (
                      <button
                        onClick={() => {
                          onApproveReview(rev.id);
                          showNotice(`Review by ${rev.authorName} approved and published.`);
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Reject button */}
                    {!isRejected && (
                      <button
                        onClick={() => {
                          onRejectReview(rev.id);
                          showNotice(`Review by ${rev.authorName} hidden from storefront.`);
                        }}
                        className="px-3 py-1 bg-amber-700/80 hover:bg-amber-800 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Feature on top */}
                    <button
                      onClick={() => {
                        onToggleFeatureReview(rev.id);
                        showNotice(`Toggled featured status for ${rev.authorName}.`);
                      }}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                        rev.isFeatured
                          ? "bg-amber-200 text-amber-950 border border-amber-300"
                          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{rev.isFeatured ? "Unfeature" : "Feature on Top"}</span>
                    </button>

                    {/* Owner reply toggle */}
                    <button
                      onClick={() => handleStartReply(rev)}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{rev.ownerReply ? "Edit Reply" : "Reply as Owner"}</span>
                    </button>
                  </div>

                  {/* Active Delete Action with Confirmation */}
                  {confirmDeleteId === rev.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-100 p-1 rounded-lg border border-rose-300">
                      <span className="text-[11px] font-bold text-rose-900 px-1">Delete review?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(rev)}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[10px] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(rev.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="Permanently Delete Customer Review"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Review</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
