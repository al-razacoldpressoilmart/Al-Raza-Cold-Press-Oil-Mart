import React, { useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  PackageX, 
  CheckCircle2, 
  Search, 
  Plus, 
  Minus, 
  Save, 
  RefreshCw, 
  Sparkles,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { Product } from "../../types";
import { ASSETS } from "../../assets/images";

interface OwnerInventoryManagerProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
}

export const OwnerInventoryManager: React.FC<OwnerInventoryManagerProps> = ({
  products,
  onSaveProduct,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "low_stock" | "out_of_stock">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Local inventory state mapping for fast in-place editing
  const [inventoryList, setInventoryList] = useState<Product[]>(products);

  // Keep inventoryList in sync if external products prop changes
  React.useEffect(() => {
    setInventoryList(products);
  }, [products]);

  // Update stock level for a specific product and size index
  const handleUpdateStock = (
    productId: string, 
    sizeIndex: number, 
    delta: number, 
    exactValue?: number
  ) => {
    const updated = inventoryList.map((p) => {
      if (p.id !== productId) return p;

      const newSizes = [...p.sizes];
      const targetSize = { ...newSizes[sizeIndex] };
      const currentQty = targetSize.stockQuantity ?? 10;

      let newQty = exactValue !== undefined ? Math.max(0, exactValue) : Math.max(0, currentQty + delta);
      targetSize.stockQuantity = newQty;
      targetSize.inStock = newQty > 0;
      newSizes[sizeIndex] = targetSize;

      const updatedProd = { ...p, sizes: newSizes };
      onSaveProduct(updatedProd);
      return updatedProd;
    });

    setInventoryList(updated);
    showNotice("Stock level updated successfully!");
  };

  // Update threshold for low stock alert
  const handleUpdateThreshold = (productId: string, sizeIndex: number, threshold: number) => {
    const updated = inventoryList.map((p) => {
      if (p.id !== productId) return p;

      const newSizes = [...p.sizes];
      const targetSize = { ...newSizes[sizeIndex] };
      targetSize.lowStockThreshold = Math.max(1, threshold);
      newSizes[sizeIndex] = targetSize;

      const updatedProd = { ...p, sizes: newSizes };
      onSaveProduct(updatedProd);
      return updatedProd;
    });

    setInventoryList(updated);
    showNotice("Low stock threshold updated!");
  };

  // Toggle inStock flag directly
  const handleToggleInStock = (productId: string, sizeIndex: number) => {
    const updated = inventoryList.map((p) => {
      if (p.id !== productId) return p;

      const newSizes = [...p.sizes];
      const targetSize = { ...newSizes[sizeIndex] };
      targetSize.inStock = !targetSize.inStock;
      if (targetSize.inStock && (targetSize.stockQuantity ?? 0) <= 0) {
        targetSize.stockQuantity = 10;
      }
      newSizes[sizeIndex] = targetSize;

      const updatedProd = { ...p, sizes: newSizes };
      onSaveProduct(updatedProd);
      return updatedProd;
    });

    setInventoryList(updated);
    showNotice("Product availability updated!");
  };

  // Bulk restock all variants by +25 units
  const handleBulkRestock = () => {
    const updated = inventoryList.map((p) => {
      const newSizes = p.sizes.map((s) => ({
        ...s,
        stockQuantity: (s.stockQuantity ?? 10) + 25,
        inStock: true,
      }));
      const updatedProd = { ...p, sizes: newSizes };
      onSaveProduct(updatedProd);
      return updatedProd;
    });

    setInventoryList(updated);
    showNotice("Bulk restocked +25 units to all products successfully!");
  };

  const showNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Filtered list based on search and low/out stock tabs
  const filteredProducts = inventoryList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nativeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === "low_stock") {
      return p.sizes.some((s) => {
        const q = s.stockQuantity ?? 10;
        return s.inStock && q > 0 && q <= (s.lowStockThreshold || 5);
      });
    }

    if (filterMode === "out_of_stock") {
      return p.sizes.some((s) => !s.inStock || (s.stockQuantity ?? 10) <= 0);
    }

    return true;
  });

  // Calculate totals
  let totalStockCount = 0;
  let lowStockAlertsCount = 0;
  let outOfStockAlertsCount = 0;

  inventoryList.forEach((p) => {
    p.sizes.forEach((s) => {
      const q = s.stockQuantity ?? 10;
      totalStockCount += q;
      if (!s.inStock || q <= 0) outOfStockAlertsCount++;
      else if (q <= (s.lowStockThreshold || 5)) lowStockAlertsCount++;
    });
  });

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{successNotice}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-900/10 p-4 rounded-2xl border border-amber-900/20">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Inventory & Stock Level Control
          </h3>
          <p className="text-xs text-amber-800/80">
            Set exact stock quantities, configure low-stock visual alert thresholds, and manage batch inventory.
          </p>
        </div>

        <button
          onClick={handleBulkRestock}
          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Restock All (+25 Units)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === "all"
                ? "bg-amber-900 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            <span>All Catalog Items</span>
            <span className="bg-amber-800/50 px-1.5 py-0.2 rounded-full text-[10px]">{inventoryList.length}</span>
          </button>

          <button
            onClick={() => setFilterMode("low_stock")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === "low_stock"
                ? "bg-amber-600 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock Alerts</span>
            <span className="bg-amber-800/50 px-1.5 py-0.2 rounded-full text-[10px]">{lowStockAlertsCount}</span>
          </button>

          <button
            onClick={() => setFilterMode("out_of_stock")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === "out_of_stock"
                ? "bg-rose-700 text-white"
                : "bg-amber-100/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            <PackageX className="w-3.5 h-3.5 text-rose-400" />
            <span>Out of Stock</span>
            <span className="bg-amber-800/50 px-1.5 py-0.2 rounded-full text-[10px]">{outOfStockAlertsCount}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-amber-700 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search oil variant..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Inventory Table / Cards */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-amber-200 text-xs text-amber-900">
            <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="font-bold">No products match your inventory filter.</p>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div 
              key={prod.id} 
              className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs space-y-4"
            >
              {/* Product Header */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-amber-100">
                <img
                  src={prod.heroImage && prod.heroImage.trim() !== "" ? prod.heroImage : ASSETS.olivePlasticBottle}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-amber-950">{prod.name}</h4>
                    <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Batch: {prod.batchNo}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 font-medium">{prod.nativeName} • {prod.woodType}</p>
                </div>
              </div>

              {/* Sizes and Stock Levels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prod.sizes.map((sizeOpt, sIdx) => {
                  const stock = sizeOpt.stockQuantity ?? 10;
                  const threshold = sizeOpt.lowStockThreshold || 5;
                  const isOut = !sizeOpt.inStock || stock <= 0;
                  const isLow = !isOut && stock <= threshold;

                  return (
                    <div
                      key={sIdx}
                      className={`p-3 rounded-xl border transition-all ${
                        isOut
                          ? "bg-rose-50/70 border-rose-200"
                          : isLow
                          ? "bg-amber-50 border-amber-300"
                          : "bg-amber-50/40 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <p className="font-bold text-xs text-amber-950">{sizeOpt.size}</p>
                          <p className="text-[11px] text-amber-700">Rs. {sizeOpt.price} (MRP: Rs. {sizeOpt.originalPrice})</p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isOut ? (
                            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <PackageX className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-stock-pulse">
                              <AlertTriangle className="w-3 h-3" /> Low Stock ({stock})
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock ({stock})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Quantity Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-amber-200/60 text-xs">
                        {/* Stock Counter Stepper */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                            Available Stock Units:
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStock(prod.id, sIdx, -5)}
                              className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-xs cursor-pointer"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleUpdateStock(prod.id, sIdx, -1)}
                              className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-xs cursor-pointer"
                              title="Decrease 1"
                            >
                              -1
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={stock}
                              onChange={(e) => handleUpdateStock(prod.id, sIdx, 0, parseInt(e.target.value) || 0)}
                              className="w-16 p-1 text-center font-bold text-xs bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
                            />
                            <button
                              onClick={() => handleUpdateStock(prod.id, sIdx, 1)}
                              className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-xs cursor-pointer"
                              title="Add 1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleUpdateStock(prod.id, sIdx, 5)}
                              className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-xs cursor-pointer"
                              title="Add 5"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        {/* Low Stock Alert Threshold & Active Toggle */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                            Alert Threshold (Units):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={threshold}
                              onChange={(e) => handleUpdateThreshold(prod.id, sIdx, parseInt(e.target.value) || 5)}
                              className="w-16 p-1 text-center font-bold text-xs bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-600"
                            />
                            <button
                              onClick={() => handleToggleInStock(prod.id, sIdx)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                sizeOpt.inStock
                                  ? "bg-emerald-700 text-white"
                                  : "bg-stone-300 text-stone-700"
                              }`}
                            >
                              {sizeOpt.inStock ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
