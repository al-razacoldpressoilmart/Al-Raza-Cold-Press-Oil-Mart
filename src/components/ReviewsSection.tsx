import React from "react";
import { Star, ShieldCheck, Truck, Banknote, CheckCircle2, HeartHandshake } from "lucide-react";
import { ProductReview } from "../types";
import { Language } from "../utils/translations";

interface ReviewsSectionProps {
  reviews?: ProductReview[];
  language?: Language;
}

const DEFAULT_REVIEWS_UR = [
  {
    name: "حاجی عبدالرشید",
    city: "لاہور (Lahore)",
    rating: 5,
    comment: "ماشاءاللہ سرسوں کا تیل اور دیسی گندم کا آٹا بالکل خالص ہے۔ روٹیاں انتہائی نرم بنتی ہیں اور پیکنگ بھی بہت معیاری تھی۔",
    oil: "Cold Pressed Sarson Oil & Chakki Atta",
    date: "تصدیق شدہ کسٹمر"
  },
  {
    name: "ڈاکٹر فاطمہ زہرہ",
    city: "اسلام آباد (Islamabad)",
    rating: 5,
    comment: "کلونجی کا تیل اور ہلدی پاؤڈر بغیر کسی کیمیکل کے اصلی ہیں۔ مارکیٹ میں ایسی کوالٹی ملنا ناممکن ہے۔ پورے خاندان کے لیے یہیں سے منگواتی ہوں۔",
    oil: "Pure Haldi Powder & Kalonji Oil",
    date: "تصدیق شدہ کسٹمر"
  },
  {
    name: "محمد عثمان",
    city: "کراچی (Karachi)",
    rating: 5,
    comment: "پہلی دفعہ خالص چنے کا بیسن اور زیتون کا تیل منگوایا۔ پکوڑے اتنے کرسپی اور خوشبودار بنے کہ سب گھر والے تعریف کر رہے ہیں۔ کیش آن ڈیلیوری بھی وقت پر ملی۔",
    oil: "Pure Chana Besan & Olive Oil",
    date: "تصدیق شدہ کسٹمر"
  }
];

const DEFAULT_REVIEWS_EN = [
  {
    name: "Haji Abdul Rasheed",
    city: "Lahore, Punjab",
    rating: 5,
    comment: "Mashallah, the cold pressed mustard oil and stone-ground whole wheat atta are genuinely fresh and authentic. The rotis turn out exceptionally soft, and packaging was totally leak-proof.",
    oil: "Cold Pressed Sarson Oil & Chakki Atta",
    date: "Verified Customer"
  },
  {
    name: "Dr. Fatima Zahra",
    city: "Islamabad",
    rating: 5,
    comment: "Kalonji oil and pure turmeric powder have unmatched potency and aroma. Absolutely chemical-free and laboratory tested. I order our monthly pantry supply from Al Raza.",
    oil: "Pure Haldi Powder & Kalonji Oil",
    date: "Verified Customer"
  },
  {
    name: "Muhammad Usman",
    city: "Karachi, Sindh",
    rating: 5,
    comment: "First time ordered pure Chana Besan and Extra Virgin Olive Oil. Pakoras came out incredibly crispy and aromatic. Cash on delivery reached my doorstep right on time.",
    oil: "Pure Chana Besan & Olive Oil",
    date: "Verified Customer"
  }
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ 
  reviews = [],
  language = "en"
}) => {
  const isUrdu = language === "ur";

  const defaultList = isUrdu ? DEFAULT_REVIEWS_UR : DEFAULT_REVIEWS_EN;

  const displayReviews = reviews.length > 0 
    ? reviews.slice(0, 3).map(r => ({
        name: r.authorName,
        city: r.authorCity || "Pakistan",
        rating: r.rating,
        comment: r.comment,
        oil: r.productName,
        date: isUrdu ? "تصدیق شدہ کسٹمر" : "Verified Customer"
      }))
    : defaultList;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b bg-white border-slate-200">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-200">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {isUrdu ? "خالص اور قدرتی معیار" : "Artisanal & Natural"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isUrdu ? "کیمیکل اور ملاوٹ سے پاک" : "No chemicals or fillers"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {isUrdu ? "کیش آن ڈیلیوری" : "Cash on Delivery"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isUrdu ? "پارسل وصول کرنے پر رقم دیں" : "Pay rider upon delivery"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {isUrdu ? "فری ہوم ڈیلیوری" : "Free Delivery (2500+)"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isUrdu ? "2500 روپے سے زائد پر مفت" : "On orders Rs. 2,500+"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {isUrdu ? "اطمینان بخش کوالٹی" : "Guaranteed Purity"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isUrdu ? "ہزاروں مطمئن پاکستانی خاندان" : "Thousands of happy homes"}
              </p>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isUrdu ? "خریداروں کی آراء" : "Customer Testimonials"}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isUrdu ? "ہمارے مطمئن کسٹمرز کے تاثرات" : "Loved by Families Across Pakistan"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {isUrdu 
              ? "الرضا پیور مارٹ کی خالص اشیاء استعمال کرنے والے خاندانوں کے حقیقی تجربات۔"
              : "Read real feedback from customers who switched to our unadulterated kitchen essentials."
            }
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((rev, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {rev.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900">{rev.name}</h5>
                  <p className="text-[11px] text-slate-500">{rev.city}</p>
                </div>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
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
