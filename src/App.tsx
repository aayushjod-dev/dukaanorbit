/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  ExternalLink, 
  RotateCw, 
  Globe, 
  Store, 
  ArrowRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { PosCounter } from './components/PosCounter';
import { InventoryHub } from './components/InventoryHub';
import { SalesOrdersHub } from './components/SalesOrdersHub';
import { CustomerStorefront } from './components/CustomerStorefront';
import { ThermalReceipt } from './components/ThermalReceipt';

const DUKAAN_ORBIT_LIVE_URL = 'https://dukaanorbit-1.ai.studio';

const MainLayout: React.FC = () => {
  const { currentView, selectedReceiptBill, setSelectedReceiptBill, storeProfile } = useStore();
  
  // Default to 'embed' mode as explicitly requested by the user: "just display this app"
  const [activeMode, setActiveMode] = useState<'embed' | 'local'>('embed');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefreshIframe = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 overflow-hidden">
      {/* Top Universal Mode Switcher & Status Bar */}
      <div className="h-11 bg-slate-900 text-white px-4 flex items-center justify-between gap-4 shrink-0 text-xs select-none border-b border-slate-800 z-30">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[11px]">
            D
          </div>
          <span className="font-bold tracking-tight text-slate-100">DukaanOrbit</span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] truncate hidden sm:inline">
            {activeMode === 'embed' ? DUKAAN_ORBIT_LIVE_URL : 'Local Offline Kirana POS Engine'}
          </span>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveMode('embed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeMode === 'embed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Live App</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('local')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeMode === 'local'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Local POS Suite</span>
            </button>
          </div>

          {activeMode === 'embed' && (
            <>
              <button
                type="button"
                onClick={handleRefreshIframe}
                title="Reload Live App"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={DUKAAN_ORBIT_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new window"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex items-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {activeMode === 'embed' ? (
        /* LIVE APP EMBED VIEW */
        <div className="relative flex-1 w-full h-[calc(100vh-44px)] bg-slate-100 flex flex-col">
          {iframeLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                Loading {DUKAAN_ORBIT_LIVE_URL}...
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={DUKAAN_ORBIT_LIVE_URL}
            title="DukaanOrbit Live Application"
            className="w-full flex-1 border-0 bg-white"
            allow="clipboard-read; clipboard-write; camera; geolocation"
            onLoad={() => setIframeLoading(false)}
          />

          {/* Quick Info bar at bottom */}
          <div className="h-6 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
              <span>Displaying live production instance: {DUKAAN_ORBIT_LIVE_URL}</span>
            </span>
            <div className="flex items-center gap-3">
              <a
                href={DUKAAN_ORBIT_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-800 underline inline-flex items-center gap-0.5"
              >
                Open directly <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>·</span>
              <button
                onClick={() => setActiveMode('local')}
                className="hover:text-emerald-700 font-semibold text-slate-600"
              >
                Switch to Local POS Engine &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* LOCAL POS & STOREFRONT ENGINE */
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          <main className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'pos' && <PosCounter />}
            {currentView === 'inventory' && <InventoryHub />}
            {currentView === 'bills' && <SalesOrdersHub />}
            {currentView === 'storefront' && <CustomerStorefront />}
          </main>

          {/* Global Thermal Receipt Modal */}
          {selectedReceiptBill && (
            <ThermalReceipt
              bill={selectedReceiptBill}
              storeProfile={storeProfile}
              onClose={() => setSelectedReceiptBill(null)}
              onNewSale={() => setSelectedReceiptBill(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
