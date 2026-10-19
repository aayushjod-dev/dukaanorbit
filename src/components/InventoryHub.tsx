import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Download, 
  Edit2, 
  Trash2, 
  Barcode, 
  DollarSign, 
  Check, 
  X,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ProductUnit } from '../types';

const CATEGORIES: ProductCategory[] = [
  'Staples & Atta',
  'Pulses & Dals',
  'Dairy & Bakery',
  'Spices & Oils',
  'Snacks & Beverages',
  'Personal & Home Care',
];

export const InventoryHub: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, quickAdjustStock, resetToDefaults } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    hindiName: '',
    category: 'Staples & Atta',
    barcode: '',
    mrp: 100,
    sellingPrice: 90,
    costPrice: 75,
    stock: 20,
    unit: 'packet',
    unitStep: 1,
    lowStockThreshold: 10,
    image: '/src/assets/images/hero_kirana_storefront_1792418772830.jpg',
    hsnCode: '2106',
    taxRate: 5,
    description: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(q)) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'low'
          ? p.stock <= p.lowStockThreshold && p.stock > 0
          : p.stock <= 0;

      return matchesCat && matchesQuery && matchesStock;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  // Inventory KPI metrics
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      hindiName: '',
      category: 'Staples & Atta',
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      mrp: 100,
      sellingPrice: 90,
      costPrice: 75,
      stock: 25,
      unit: 'packet',
      unitStep: 1,
      lowStockThreshold: 10,
      image: '/src/assets/images/hero_kirana_storefront_1792418772830.jpg',
      hsnCode: '1905',
      taxRate: 5,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      hindiName: product.hindiName || '',
      category: product.category,
      barcode: product.barcode,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      unit: product.unit,
      unitStep: product.unitStep || 1,
      lowStockThreshold: product.lowStockThreshold,
      image: product.image,
      hsnCode: product.hsnCode,
      taxRate: product.taxRate,
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Hindi Name', 'Category', 'Barcode', 'MRP', 'Selling Price', 'Cost Price', 'Stock', 'Unit', 'Tax Rate', 'HSN'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.hindiName || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.barcode,
      p.mrp,
      p.sellingPrice,
      p.costPrice,
      p.stock,
      p.unit,
      p.taxRate,
      p.hsnCode,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanOrbit_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-50 overflow-hidden">
      {/* Top Inventory Summary KPI Strip */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Product Catalog & Stock Management
            </h2>
            <p className="text-xs text-slate-500">
              Manage items, track minimum stock thresholds, update prices, and replenish stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium">Total Products</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {products.length} <span className="text-xs font-normal text-slate-500 font-sans">SKUs</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium">Stock Value (Cost)</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              ₹{totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Low Stock Alerts</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-0.5 tabular-nums">
              {lowStockCount} <span className="text-xs font-normal text-amber-700 font-sans">items</span>
            </div>
          </div>

          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
            <div className="text-[11px] text-red-800 font-medium">Out of Stock</div>
            <div className="text-xl font-bold font-mono text-red-900 mt-0.5 tabular-nums">
              {outOfStockCount} <span className="text-xs font-normal text-red-700 font-sans">items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by product name, barcode, or category..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                stockFilter === 'low' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                stockFilter === 'out' ? 'bg-white text-red-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>

          <button
            onClick={resetToDefaults}
            title="Reset to default Kirana sample catalog"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Item & Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">MRP</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Quick Replenish</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const margin = product.sellingPrice - product.costPrice;
                const marginPercent = ((margin / product.sellingPrice) * 100).toFixed(0);
                const isLow = product.stock <= product.lowStockThreshold && product.stock > 0;
                const isOut = product.stock <= 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {product.hindiName && <span>{product.hindiName}</span>}
                            <span className="font-mono text-slate-400">{product.barcode}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span>{product.category}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      ₹{product.costPrice}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      ₹{product.sellingPrice}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      ₹{product.mrp}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className="text-emerald-700 font-semibold">
                        ₹{margin} ({marginPercent}%)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold tabular-nums text-xs ${
                            isOut
                              ? 'text-red-700'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {product.stock} {product.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-amber-700 font-medium">
                            · Low
                          </span>
                        )}
                        {isOut && (
                          <span className="text-[10px] text-red-700 font-semibold">
                            · Out
                          </span>
                        )}
                      </div>
                    </td>

                    {/* In-line Quick Stock Replenish */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => quickAdjustStock(product.id, -1)}
                          disabled={product.stock <= 0}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded disabled:opacity-30"
                          title="Reduce 1"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAdjustStock(product.id, 5)}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold border border-emerald-200"
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAdjustStock(product.id, 20)}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold border border-emerald-200"
                          title="Add 20"
                        >
                          +20
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No products found matching filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {editingProduct ? 'Edit Kirana Product' : 'Add New Grocery / Kirana Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fortune Kachi Ghani Mustard Oil"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hindi / Regional Name
                  </label>
                  <input
                    type="text"
                    value={formData.hindiName}
                    onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                    placeholder="e.g. सरसों का तेल"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / EAN *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                        })
                      }
                      className="px-2 py-1 text-[10px] bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 text-slate-700"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="packet">packet (pkt)</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="piece">piece (pc)</option>
                    <option value="litre">litre (L)</option>
                    <option value="ml">ml</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Threshold *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GST Tax Rate (%)
                  </label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  >
                    <option value="0">0% (Exempt Staples)</option>
                    <option value="5">5% (Edible Oils, Sugar, Tea)</option>
                    <option value="12">12% (Butter, Ghee, Noodles)</option>
                    <option value="18">18% (Soaps, Detergents, Toothpaste)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
