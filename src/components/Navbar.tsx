import React, { useState } from 'react';
import { 
  Store, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Globe, 
  Settings, 
  AlertTriangle 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StoreSettingsModal } from './StoreSettingsModal';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, products, customerCart, storeProfile } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const customerCartCount = customerCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="h-[65px] bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 select-none">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
            D
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              Dukaan Orbit
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
              {storeProfile.name}
            </div>
          </div>
        </div>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('pos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === 'pos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Billing Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory & Stock</span>
            {lowStockCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-amber-100 text-amber-800 rounded font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('bills')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === 'bills'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Sales & Bills</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('storefront')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              currentView === 'storefront'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
            {customerCartCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-emerald-800 text-white rounded font-bold">
                {customerCartCount}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile Navigation Selector */}
        <div className="flex md:hidden items-center gap-1">
          <select
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value as any)}
            className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800"
          >
            <option value="pos">POS Counter</option>
            <option value="inventory">Inventory ({products.length})</option>
            <option value="bills">Sales History</option>
            <option value="storefront">Online Store</option>
          </select>
        </div>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Store & UPI Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
