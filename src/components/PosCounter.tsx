import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  QrCode, 
  Banknote, 
  CreditCard, 
  BookOpen, 
  RotateCcw, 
  User, 
  Phone, 
  Tag, 
  AlertCircle,
  Package
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ProductUnit } from '../types';
import { UpiPaymentModal } from './UpiPaymentModal';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Staples & Atta',
  'Pulses & Dals',
  'Dairy & Bakery',
  'Spices & Oils',
  'Snacks & Beverages',
  'Personal & Home Care',
];

export const PosCounter: React.FC = () => {
  const {
    products,
    posCart,
    addToPosCart,
    updatePosCartQuantity,
    updatePosCartUnit,
    updatePosCartDiscount,
    removeFromPosCart,
    clearPosCart,
    createBill,
    storeProfile,
    setSelectedReceiptBill,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  
  // Customer details for the bill
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Bill discount
  const [overallDiscount, setOverallDiscount] = useState<number>(0);

  // Cash payment calculation state
  const [cashTendered, setCashTendered] = useState<string>('');
  
  // UPI Modal state
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' or F2 to focus search
      if ((e.key === '/' || e.key === 'F2') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Esc to blur or clear
      if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('');
        else searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.name.toLowerCase().includes(q) ||
        (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
        item.barcode.includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode match (exact scan)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check exact barcode match first
    const exactBarcodeMatch = products.find(
      (p) => p.barcode === searchQuery.trim()
    );
    if (exactBarcodeMatch) {
      addToPosCart(exactBarcodeMatch, 1);
      setSearchQuery('');
      return;
    }

    // Otherwise if single item filtered, add it
    if (filteredProducts.length === 1) {
      addToPosCart(filteredProducts[0], 1);
      setSearchQuery('');
    }
  };

  // Calculations for active bill
  const subtotal = posCart.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice - (item.lineDiscount || 0);
  }, 0);

  const totalMrp = posCart.reduce((sum, item) => {
    return sum + item.quantity * item.product.mrp;
  }, 0);

  const totalTax = posCart.reduce((sum, item) => {
    const rate = item.product.taxRate || 0;
    const itemNet = item.quantity * item.unitPrice;
    return sum + (itemNet * rate) / 100;
  }, 0);

  const grandTotal = Math.max(0, subtotal - overallDiscount);
  const totalSavings = Math.max(0, totalMrp - grandTotal);

  const numericCashTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, numericCashTendered - grandTotal);

  // Complete bill handler
  const handleFinalizeBill = (paymentMethod: 'cash' | 'upi' | 'card' | 'udhar', upiTxnId?: string) => {
    if (posCart.length === 0) return;

    const newBill = createBill({
      orderType: 'pos_counter',
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'Walk-in',
      items: [...posCart],
      subtotal,
      taxTotal: totalTax,
      discountTotal: overallDiscount,
      grandTotal,
      cashTendered: paymentMethod === 'cash' ? (numericCashTendered || grandTotal) : undefined,
      changeDue: paymentMethod === 'cash' ? changeDue : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'udhar' ? 'credit' : 'paid',
      upiTxnId,
      cashierName: storeProfile.owner || 'Cashier 1',
    });

    // Clear cart and show thermal receipt
    clearPosCart();
    setCustomerPhone('');
    setCustomerName('');
    setCashTendered('');
    setOverallDiscount(0);
    setIsUpiModalOpen(false);
    setSelectedReceiptBill(newBill);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] bg-slate-100 overflow-hidden">
      {/* LEFT COLUMN: Product Catalog & Fast Item Scanner */}
      <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50 min-w-0">
        {/* Top Search & Barcode Bar */}
        <div className="p-4 bg-white border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Barcode (e.g. 8901030...) or search item name / Hindi name... (Press /)"
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400">
                <Barcode className="w-4 h-4" />
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-600 rounded">
                  /
                </kbd>
              </div>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear
              </button>
            )}
          </form>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / Rapid Clicker */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
            <span>Showing {filteredProducts.length} kirana items</span>
            <span>Click any item to add to bill</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.lowStockThreshold;
              const isOutOfStock = product.stock <= 0;
              const cartItem = posCart.find((i) => i.productId === product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToPosCart(product)}
                  className={`group relative bg-white border rounded-xl p-3 flex flex-col justify-between transition-all select-none text-left cursor-pointer ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : cartItem
                      ? 'border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Top image or visual thumb */}
                  <div className="w-full aspect-4/3 rounded-lg bg-slate-100 overflow-hidden mb-2 relative flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        // Fallback container
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
                      <Package className="w-6 h-6 opacity-30" />
                    </div>

                    {cartItem && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-md shadow-xs">
                        {cartItem.quantity} {cartItem.selectedUnit}
                      </div>
                    )}
                  </div>

                  {/* Product Title & Hindi Name */}
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-500 truncate mb-0.5">
                      {product.category}
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-2">
                      {product.name}
                    </h4>
                    {product.hindiName && (
                      <div className="text-[10px] text-slate-500 font-medium">
                        {product.hindiName}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Stock indicator */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm font-mono text-slate-900">
                          ₹{product.sellingPrice}
                        </span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-[10px] line-through text-slate-400 font-mono">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        per {product.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-semibold text-red-600">
                          Out of stock
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-mono tabular-nums ${
                            isLowStock ? 'text-amber-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">No items found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or scan a barcode</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Billing Counter & Payment Engine */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col bg-white border-l border-slate-200 h-full shadow-lg">
        {/* Customer Header Bar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-wide uppercase text-slate-300">
              Active Counter Register
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-emerald-400">
              {posCart.length} Items ({posCart.reduce((s, i) => s + i.quantity, 0)} units)
            </span>
          </div>

          {posCart.length > 0 && (
            <button
              onClick={clearPosCart}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Customer Phone & Name quick-entry */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Customer Phone (10 digits)"
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name (Optional)"
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Cart Item Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {posCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Barcode className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
              <div className="text-sm font-semibold text-slate-700">Billing Counter is Empty</div>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Scan items with barcode reader or select products from the left catalog to start billing.
              </p>
            </div>
          ) : (
            posCart.map((item) => {
              const lineTotal = item.quantity * item.unitPrice - item.lineDiscount;
              return (
                <div key={item.productId} className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg group">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {item.product.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums">₹{item.unitPrice}/{item.selectedUnit}</span>
                      {item.product.mrp > item.unitPrice && (
                        <>
                          <span>·</span>
                          <span className="line-through text-slate-400 font-mono">₹{item.product.mrp}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Unit Selector */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updatePosCartQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    <input
                      type="number"
                      step={item.product.unit === 'kg' ? '0.25' : '1'}
                      min="0.1"
                      value={item.quantity}
                      onChange={(e) => updatePosCartQuantity(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-12 py-0.5 text-center text-xs font-mono font-bold bg-white border border-slate-300 rounded focus:outline-hidden"
                    />

                    <button
                      type="button"
                      onClick={() => updatePosCartQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <select
                      value={item.selectedUnit}
                      onChange={(e) => updatePosCartUnit(item.productId, e.target.value as ProductUnit)}
                      className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-1 font-medium text-slate-700 focus:outline-hidden"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="packet">pkt</option>
                      <option value="piece">pc</option>
                      <option value="litre">L</option>
                    </select>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <div className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      ₹{lineTotal.toFixed(0)}
                    </div>
                    <button
                      onClick={() => removeFromPosCart(item.productId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM TOTALS & CHECKOUT CONSOLE */}
        {posCart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {/* Tally Breakdown */}
            <div className="space-y-1.5 text-xs pb-3 border-b border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({posCart.length} items)</span>
                <span className="font-mono tabular-nums">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {totalTax > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Estimated GST (CGST+SGST)</span>
                  <span className="font-mono tabular-nums">₹{totalTax.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>Special Discount:</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 text-right font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium text-[11px] pt-0.5">
                  <span>Customer Savings vs MRP:</span>
                  <span className="font-mono tabular-nums">₹{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Cash Tendered & Change Due Panel */}
            <div className="py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <Banknote className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={`Cash Received (e.g. ₹${Math.ceil(grandTotal)})`}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Cash preset pills */}
              <div className="flex items-center gap-1 shrink-0">
                {[100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt.toString())}
                    className="px-2 py-1 text-[10px] font-mono font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {numericCashTendered > 0 && (
              <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <span>Change to return:</span>
                <span className="font-bold font-mono text-sm tabular-nums">₹{changeDue.toFixed(2)}</span>
              </div>
            )}

            {/* Payment Method Action Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Cash Button */}
              <button
                type="button"
                onClick={() => handleFinalizeBill('cash')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Bill</span>
              </button>

              {/* UPI QR Button */}
              <button
                type="button"
                onClick={() => setIsUpiModalOpen(true)}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>UPI QR Code</span>
              </button>

              {/* Store Udhar / Credit Button */}
              <button
                type="button"
                onClick={() => handleFinalizeBill('udhar')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Khata / Udhar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UPI QR Payment Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onPaymentSuccess={(upiRef) => handleFinalizeBill('upi', upiRef)}
        amount={grandTotal}
        billNumber={`DO-${Date.now().toString().slice(-4)}`}
        storeProfile={storeProfile}
      />
    </div>
  );
};
