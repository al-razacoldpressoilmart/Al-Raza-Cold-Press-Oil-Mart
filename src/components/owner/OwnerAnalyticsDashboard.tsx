import React, { useMemo } from "react";
import { 
  ResponsiveContainer, 
  ComposedChart,
  Area, 
  Line,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Clock, 
  Star,
  Users
} from "lucide-react";
import { Product, ProductReview } from "../../types";

interface OwnerAnalyticsDashboardProps {
  orders: any[];
  products: Product[];
  reviews: ProductReview[];
}

export const OwnerAnalyticsDashboard: React.FC<OwnerAnalyticsDashboardProps> = ({
  orders,
  products,
  reviews,
}) => {
  // Aggregate KPI metrics
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let verifiedCount = 0;
    let pendingCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current30DaysRevenue = 0;
    let previous30DaysRevenue = 0;

    orders.forEach((o) => {
      const amt = Number(o.totalAmount || 0);
      totalRevenue += isNaN(amt) ? 0 : amt;
      if (o.status === "verified" || o.status === "completed" || o.status === "dispatched") {
        verifiedCount++;
      } else {
        pendingCount++;
      }

      if (o.createdAt || o.date) {
        const orderDate = new Date(o.createdAt || o.date);
        orderDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - orderDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          current30DaysRevenue += isNaN(amt) ? 0 : amt;
        } else if (diffDays > 30 && diffDays <= 60) {
          previous30DaysRevenue += isNaN(amt) ? 0 : amt;
        }
      }
    });

    let revenueGrowthPct = 0;
    if (previous30DaysRevenue > 0) {
      revenueGrowthPct = ((current30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100;
    } else if (current30DaysRevenue > 0) {
      revenueGrowthPct = 100; // 100% growth if there was 0 previous revenue but there is current revenue
    }

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      p.sizes.forEach((s) => {
        const qty = s.stockQuantity ?? 10;
        totalStockUnits += qty;
        if (!s.inStock || qty <= 0) {
          outOfStockCount++;
        } else if (qty <= (s.lowStockThreshold || 5)) {
          lowStockCount++;
        }
      });
    });

    const approvedReviews = reviews.filter((r) => r.status === "approved");
    const avgRating =
      approvedReviews.length > 0
        ? (
            approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
          ).toFixed(1)
        : "5.0";

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      verifiedCount,
      pendingCount,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      reviewsCount: approvedReviews.length,
      avgRating,
      revenueGrowthPct,
    };
  }, [orders, products, reviews]);

  // Daily Trend Data for the last 30 days
  const orderTrendsData = useMemo(() => {
    const data: Record<string, { day: string; dateObj: Date; revenue: number; orders: number }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize the last 30 days with zero data
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[key] = { day: dayLabel, dateObj: d, revenue: 0, orders: 0 };
    }

    // Populate with actual order data
    orders.forEach(order => {
      if (order.createdAt || order.date) {
        const orderDate = new Date(order.createdAt || order.date);
        orderDate.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays <= 30 && orderDate <= today) {
           const key = orderDate.toISOString().split("T")[0];
           if (data[key]) {
             const amt = Number(order.totalAmount || 0);
             data[key].revenue += isNaN(amt) ? 0 : amt;
             data[key].orders += 1;
           }
        }
      }
    });

    return Object.values(data).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [orders]);

  // Product popularity & stock distribution data
  const productStockData = useMemo(() => {
    return products.map((p) => {
      const totalUnits = p.sizes.reduce((sum, s) => sum + (s.stockQuantity ?? 10), 0);
      return {
        name: p.name.replace("Cold Pressed ", "").replace(" Oil", "").slice(0, 12),
        stock: totalUnits,
        rating: p.rating,
        price: p.sizes[0]?.price || 300,
      };
    });
  }, [products]);

  // Stock status pie data
  const stockHealthPieData = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let out = 0;

    products.forEach((p) => {
      p.sizes.forEach((s) => {
        const qty = s.stockQuantity ?? 10;
        if (!s.inStock || qty <= 0) out++;
        else if (qty <= (s.lowStockThreshold || 5)) low++;
        else healthy++;
      });
    });

    return [
      { name: "In Stock (Healthy)", value: healthy, color: "#10b981" },
      { name: "Low Stock Alert", value: low, color: "#f59e0b" },
      { name: "Out of Stock", value: out, color: "#ef4444" },
    ];
  }, [products]);

  // Order status pie data
  const orderStatusPieData = useMemo(() => {
    let verified = 0;
    let pending = 0;
    let dispatched = 0;

    orders.forEach((o) => {
      if (o.status === "dispatched" || o.status === "completed") dispatched++;
      else if (o.status === "verified") verified++;
      else pending++;
    });

    // Default sample if no orders placed yet
    if (orders.length === 0) {
      return [
        { name: "TID Verified", value: 4, color: "#10b981" },
        { name: "Pending Verification", value: 2, color: "#f59e0b" },
        { name: "Dispatched & Delivered", value: 3, color: "#3b82f6" },
      ];
    }

    return [
      { name: "TID Verified", value: verified || 1, color: "#10b981" },
      { name: "Pending Verification", value: pending || 1, color: "#f59e0b" },
      { name: "Dispatched", value: dispatched || 1, color: "#3b82f6" },
    ];
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-900/10 p-4 rounded-2xl border border-amber-900/20">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Executive Store Analytics & Order Trends
          </h3>
          <p className="text-xs text-amber-800/80">
            Real-time daily & weekly revenue curves, inventory health, and customer satisfaction metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Storefront Sync
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-serif font-bold text-amber-950 mt-0.5">Rs. {kpis.totalRevenue.toLocaleString()}</p>
            <p className={`text-[10px] font-semibold ${kpis.revenueGrowthPct >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {kpis.revenueGrowthPct > 0 ? "+" : ""}{kpis.revenueGrowthPct.toFixed(1)}% vs prev 30d
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-serif font-bold text-slate-900 mt-0.5">{kpis.totalOrders} Orders</p>
            <p className="text-[10px] text-amber-700 font-semibold">Avg: Rs. {kpis.avgOrderValue} / order</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Units in Stock</p>
            <p className="text-xl font-serif font-bold text-emerald-950 mt-0.5">{kpis.totalStockUnits} Bottles</p>
            <p className="text-[10px] text-rose-600 font-semibold">
              {kpis.lowStockCount} Low • {kpis.outOfStockCount} Out
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Store Rating</p>
            <p className="text-xl font-serif font-bold text-amber-950 mt-0.5">{kpis.avgRating} ★</p>
            <p className="text-[10px] text-emerald-700 font-semibold">{kpis.reviewsCount} Verified Reviews</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Revenue & Orders Area Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm text-amber-950">Last 30 Days Sales Trend</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${kpis.revenueGrowthPct >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {kpis.revenueGrowthPct > 0 ? "+" : ""}{kpis.revenueGrowthPct.toFixed(1)}% vs prev
                </span>
              </div>
              <p className="text-xs text-amber-800/70">30-Day Total Revenue & Volume Performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Revenue (Rs. )
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Orders
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={orderTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" vertical={false} />
                <XAxis dataKey="day" stroke="#78350f" fontSize={11} />
                <YAxis yAxisId="left" stroke="#78350f" fontSize={11} tickFormatter={(val) => `Rs. ${val / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === "revenue" ? `Rs. ${Number(value).toLocaleString()}` : `${value} orders`,
                    name === "revenue" ? "Total Revenue" : "Order Volume"
                  ]}
                  contentStyle={{ backgroundColor: "#291305", color: "#fef3c7", borderRadius: "10px", fontSize: "12px" }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#b45309" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Status Donut Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-serif font-bold text-sm text-amber-950">Inventory Health Breakdown</h4>
            <p className="text-xs text-amber-800/70">Stock level distribution across all size variants</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockHealthPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stockHealthPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#291305", color: "#fef3c7", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-amber-100 text-xs">
            {stockHealthPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-amber-950 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-amber-900">{item.value} variants</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Product Stock Level Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-sm text-amber-950">Stock Available by Oil Variety</h4>
            <p className="text-xs text-amber-800/70">Total units bottled and ready in cold press storage</p>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
            Total {kpis.totalStockUnits} Units
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productStockData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" vertical={false} />
              <XAxis dataKey="name" stroke="#78350f" fontSize={11} />
              <YAxis stroke="#78350f" fontSize={11} />
              <Tooltip 
                formatter={(val: any) => [`${val} Units Available`, "Stock Level"]}
                contentStyle={{ backgroundColor: "#291305", color: "#fef3c7", borderRadius: "10px", fontSize: "12px" }}
              />
              <Bar dataKey="stock" fill="#d97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
