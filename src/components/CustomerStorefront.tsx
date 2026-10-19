import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  X, 
  Share2, 
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Staples & Atta',
  'Pulses & Dals',
  'Dairy & Bakery',
  'Spices & Oils',
  'Snacks & Beverages',
  'Personal & Home Care',
];

export const CustomerStorefront: React.FC = () => {
  const {
    products,
    storeProfile,
    customerCart,
    addToCustomerCart,
    updateCustomerCartQuantity,
    removeFromCustomerCart,
    clearCustomerCart,
    createBill,
    setSelectedReceiptBill,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Delivery Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Evening (5:00 PM - 8:00 PM)');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'cod' | 'upi'>('cod');

  // Confirmation state
  const [orderConfirmedBillId, setOrderConfirmedBillId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const cartItemCount = customerCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = customerCart.reduce(
    (sum, item) => sum + item.quantity * item.product.sellingPrice,
    0
  );
  const cartTotalMrp = customerCart.reduce(
    (sum, item) => sum + item.quantity * item.product.mrp,
    0
  );
  const totalSavings = Math.max(0, cartTotalMrp - cartSubtotal);

  const isFreeDelivery = cartSubtotal >= storeProfile.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery || cartSubtotal === 0 ? 0 : storeProfile.standardDeliveryFee;
  const grandTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerCart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    // Convert customerCart to CartItem[]
    const billItems = customerCart.map((item) => ({
      productId: item.product.id,
      product: item.product,
      quantity: item.quantity,
      selectedUnit: item.product.unit,
      unitPrice: item.product.sellingPrice,
      lineDiscount: 0,
    }));

    const newBill = createBill({
      orderType: 'online_delivery',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: deliveryAddress.trim(),
      deliverySlot,
      items: billItems,
      subtotal: cartSubtotal,
      taxTotal: 0,
      discountTotal: 0,
      grandTotal,
      paymentMethod: paymentChoice === 'upi' ? 'upi' : 'cash',
      paymentStatus: 'pending',
      cashierName: 'Online Web Store',
      notes: deliveryNotes.trim(),
    });

    // Generate WhatsApp link for customer
    const itemList = customerCart
      .map((i) => `• ${i.product.name} x ${i.quantity} ${i.product.unit} (₹${i.quantity * i.product.sellingPrice})`)
      .join('%0A');

    const waMessage = `*NEW ONLINE GROCERY ORDER*%0A` +
      `Order: #${newBill.billNumber}%0A` +
      `Customer: ${encodeURIComponent(customerName)} (${customerPhone})%0A` +
      `Address: ${encodeURIComponent(deliveryAddress || 'Local Area')}%0A` +
      `Slot: ${encodeURIComponent(deliverySlot)}%0A%0A` +
      `*ITEMS:*%0A${itemList}%0A%0A` +
      `*Total: ₹${grandTotal.toFixed(0)}* (Pay via: ${paymentChoice.toUpperCase()})%0A` +
      `Please confirm delivery timing. Thank you!`;

    const storeWhatsAppPhone = storeProfile.phone.replace(/[^0-9]/g, '');

    clearCustomerCart();
    setIsCartOpen(false);
    setOrderConfirmedBillId(newBill.billNumber);

    // Open WhatsApp in new tab
    if (storeWhatsAppPhone) {
      window.open(`https://wa.me/${storeWhatsAppPhone}?text=${waMessage}`, '_blank');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-50 overflow-y-auto">
      {/* Storefront Hero Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/src/assets/images/hero_kirana_storefront_1792418772830.jpg"
            alt="Storefront backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Accepting Instant Delivery Orders</span>
              <span>·</span>
              <span>30-45 Min Local Drop</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              {storeProfile.name}
            </h1>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {storeProfile.tagline}. Order pure chakki atta, pulses, fresh dairy, whole spices, and home provisions directly from your trusted neighborhood kirana.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{storeProfile.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Open Everyday: 7:30 AM – 10:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-emerald-600/90 text-white py-2 px-6 text-center text-xs font-semibold backdrop-blur-xs flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" />
          <span>FREE Home Delivery on all neighborhood orders above ₹{storeProfile.freeDeliveryThreshold}!</span>
        </div>
      </div>

      {/* Catalog Search & Filter Strip */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staples, atta, spices, biscuits..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cartItemCount})</span>
            {cartSubtotal > 0 && (
              <span className="font-mono tabular-nums bg-emerald-700 px-1.5 py-0.5 rounded">
                ₹{cartSubtotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-6 py-6 w-full flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const cartEntry = customerCart.find((i) => i.product.id === product.id);
            const isOut = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Product Card Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {product.mrp > product.sellingPrice && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                      {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
                    </div>
                  )}

                  {product.isPopular && (
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[9px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
                      Popular
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {product.category}
                    </div>
                    <h3 className="font-semibold text-xs text-slate-900 mt-0.5 leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    {product.hindiName && (
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {product.hindiName}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          ₹{product.sellingPrice}
                        </span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-xs line-through text-slate-400 font-mono tabular-nums">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        1 {product.unit}
                      </div>
                    </div>

                    {/* Stepper or Add button */}
                    {isOut ? (
                      <span className="text-[10px] font-semibold text-red-600 px-2 py-1 bg-red-50 rounded">
                        Sold Out
                      </span>
                    ) : cartEntry ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCustomerCartQuantity(product.id, cartEntry.quantity - 1)}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-emerald-900">
                          {cartEntry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCustomerCartQuantity(product.id, cartEntry.quantity + 1)}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCustomerCart(product, 1)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile */}
      {cartItemCount > 0 && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cartItemCount} Items Added</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono">₹{grandTotal}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Customer Slide-Over Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Your Grocery Basket</h3>
                <span className="text-xs text-slate-400">({cartItemCount} items)</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free delivery tracker */}
            <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-900">
              {isFreeDelivery ? (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You've unlocked FREE local delivery!</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Add ₹{storeProfile.freeDeliveryThreshold - cartSubtotal} more for FREE Delivery!</span>
                  <span className="font-mono font-bold">Standard fee: ₹{storeProfile.standardDeliveryFee}</span>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4">
              {customerCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Your basket is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Browse groceries from the aisle and add daily provisions.</p>
                </div>
              ) : (
                customerCart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">
                        {product.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ₹{product.sellingPrice} / {product.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateCustomerCartQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCustomerCartQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <div className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                        ₹{quantity * product.sellingPrice}
                      </div>
                      <button
                        onClick={() => removeFromCustomerCart(product.id)}
                        className="text-slate-400 hover:text-red-500 text-[10px] mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Delivery Details Form & Checkout Actions */}
            {customerCart.length > 0 && (
              <form onSubmit={handlePlaceOrder} className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Delivery Details
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile (10 digits) *"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Complete Delivery Address / House No. *"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Morning (8:00 AM - 11:00 AM)">Morning (8 AM - 11 AM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1 PM - 4 PM)</option>
                    <option value="Evening (5:00 PM - 8:00 PM)">Evening (5 PM - 8 PM)</option>
                  </select>

                  <select
                    value={paymentChoice}
                    onChange={(e) => setPaymentChoice(e.target.value as 'cod' | 'upi')}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="upi">UPI on Delivery</option>
                  </select>
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal</span>
                    <span className="font-mono tabular-nums">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-mono tabular-nums">
                      {deliveryFee === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Total Savings vs MRP</span>
                      <span className="font-mono tabular-nums">-₹{totalSavings}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-emerald-700 font-mono text-base tabular-nums">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send Order & Connect on WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmed Flash Notice */}
      {orderConfirmedBillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">Order #{orderConfirmedBillId}</p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Your grocery delivery request has been recorded and transmitted to {storeProfile.name}.
            </p>
            <button
              onClick={() => setOrderConfirmedBillId(null)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Back to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
