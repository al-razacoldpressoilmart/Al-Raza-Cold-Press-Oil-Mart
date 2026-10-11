import React from "react";
import { Star, ShieldCheck, Truck, Banknote, CheckCircle2, HeartHandshake } from "lucide-react";
import { ProductReview } from "../types";

interface ReviewsSectionProps {
  reviews?: ProductReview[];
}

const DEFAULT_REVIEWS = [
  {
    name: "Haji Abdul Rasheed",
    city: "Lahore",
    rating: 5,
    comment: "ماشاءاللہ سرسوں کا تیل بالکل خالص ہے، پیکنگ بہت زبردست تھی اور 2 دن میں کیش آن ڈیلیوری پارسل مل گیا۔",
    oil: "Cold Pressed Mustard Oil (سرسوں کا تیل)",
    date: "Verified Customer"
  },
  {
    name: "Dr. Fatima Zahra",
    city: "Islamabad",
    rating: 5,
    comment: "Kalonji and Olive oil are 100% natural and unrefined. I have tested them personally. Highly recommended for daily cooking and health.",
    oil: "Extra Virgin Olive & Kalonji Oil",
    date: "Verified Customer"
  },
  {
    name: "Muhammad Usman",
    city: "Karachi",
    rating: 5,
    comment: "First time I found genuine wood-pressed coconut and almond oil in Pakistan. Delivery was completely free and fast.",
    oil: "Sweet Almond & Coconut Oil",
    date: "Verified Customer"
  }
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews = [] }) => {
  const displayReviews = reviews.length > 0 
    ? reviews.slice(0, 3).map(r => ({
        name: r.userName,
        city: "Pakistan",
        rating: r.rating,
        comment: r.comment,
        oil: r.productName,
        date: r.date || "Verified Customer"
      }))
    : DEFAULT_REVIEWS;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b bg-stone-50 border-stone-200">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-stone-200">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">100% Pure & Organic</h4>
              <p className="text-[11px] text-stone-500">No chemicals or heating</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">Cash on Delivery</h4>
              <p className="text-[11px] text-stone-500">Pay when parcel arrives</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">Fast Home Delivery</h4>
              <p className="text-[11px] text-stone-500">2 to 3 days across Pakistan</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">Satisfaction Guarantee</h4>
              <p className="text-[11px] text-stone-500">Easy return & exchange</p>
            </div>
          </div>
        </div>

        {/* Reviews Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Customer Reviews / کسٹمرز کے تاثرات
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            What Our Customers Say
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            ہزاروں مطمئن کسٹمرز کا اعتماد — ہمارے خالص کولڈ پریس آئلز کے بارے میں ان کی رائے
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((rev, idx) => (
            <div 
              key={idx}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {rev.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-stone-900">{rev.name}</h5>
                  <span className="text-[11px] text-stone-500">{rev.city}</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-800 bg-stone-50 px-2 py-1 rounded-md">
                  {rev.oil}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
