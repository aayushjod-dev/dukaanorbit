import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Bill, StoreProfile, CartItem, ProductUnit } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_PROFILE, INITIAL_BILLS } from '../data/seedData';

interface StoreContextType {
  products: Product[];
  bills: Bill[];
  storeProfile: StoreProfile;
  currentView: 'pos' | 'inventory' | 'bills' | 'storefront';
  setCurrentView: (view: 'pos' | 'inventory' | 'bills' | 'storefront') => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  quickAdjustStock: (id: string, delta: number) => void;
  
  // Billing actions
  createBill: (billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => Bill;
  updateStoreProfile: (profile: StoreProfile) => void;
  resetToDefaults: () => void;
  
  // POS Cart State
  posCart: CartItem[];
  addToPosCart: (product: Product, quantity?: number) => void;
  updatePosCartQuantity: (productId: string, quantity: number) => void;
  updatePosCartUnit: (productId: string, unit: ProductUnit) => void;
  updatePosCartDiscount: (productId: string, discount: number) => void;
  removeFromPosCart: (productId: string) => void;
  clearPosCart: () => void;
  
  // Customer Storefront Cart State
  customerCart: { product: Product; quantity: number }[];
  addToCustomerCart: (product: Product, quantity?: number) => void;
  updateCustomerCartQuantity: (productId: string, quantity: number) => void;
  removeFromCustomerCart: (productId: string) => void;
  clearCustomerCart: () => void;

  // Active selected bill for thermal receipt modal
  selectedReceiptBill: Bill | null;
  setSelectedReceiptBill: (bill: Bill | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'dukaanorbit_products_v2',
  BILLS: 'dukaanorbit_bills_v2',
  PROFILE: 'dukaanorbit_profile_v2',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_STORE_PROFILE;
    } catch {
      return INITIAL_STORE_PROFILE;
    }
  });

  const [currentView, setCurrentView] = useState<'pos' | 'inventory' | 'bills' | 'storefront'>('pos');
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [customerCart, setCustomerCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<Bill | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore quota exceeded
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    } catch {
      // ignore
    }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(storeProfile));
    } catch {
      // ignore
    }
  }, [storeProfile]);

  // Product operations
  const addProduct = (newProd: Omit<Product, 'id'>): Product => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now().toString().slice(-6)}`,
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const quickAdjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
  };

  // Bill creation & stock decrement
  const createBill = (billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>): Bill => {
    const nextBillCount = bills.length + 1001;
    const billNumber = `DO-${new Date().getFullYear()}-${nextBillCount}`;
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber,
      createdAt: new Date().toISOString(),
    };

    // Decrement stock for all items
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      for (const cartItem of billData.items) {
        const index = updated.findIndex((p) => p.id === cartItem.productId);
        if (index !== -1) {
          const currentStock = updated[index].stock;
          const deducted = Math.max(0, currentStock - cartItem.quantity);
          updated[index] = { ...updated[index], stock: deducted };
        }
      }
      return updated;
    });

    setBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  const updateStoreProfile = (newProfile: StoreProfile) => {
    setStoreProfile(newProfile);
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setBills(INITIAL_BILLS);
    setStoreProfile(INITIAL_STORE_PROFILE);
    setPosCart([]);
    setCustomerCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  };

  // POS Cart methods
  const addToPosCart = (product: Product, quantity = 1) => {
    setPosCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const current = next[existingIndex];
        const newQty = Math.min(product.stock, current.quantity + quantity);
        next[existingIndex] = {
          ...current,
          quantity: newQty,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity: Math.min(product.stock > 0 ? quantity : 1, Math.max(1, product.stock)),
          selectedUnit: product.unit,
          unitPrice: product.sellingPrice,
          lineDiscount: 0,
        },
      ];
    });
  };

  const updatePosCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPosCart(productId);
      return;
    }
    setPosCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const updatePosCartUnit = (productId: string, unit: ProductUnit) => {
    setPosCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, selectedUnit: unit } : item))
    );
  };

  const updatePosCartDiscount = (productId: string, discount: number) => {
    setPosCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, lineDiscount: Math.max(0, discount) } : item))
    );
  };

  const removeFromPosCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearPosCart = () => {
    setPosCart([]);
  };

  // Customer Cart methods
  const addToCustomerCart = (product: Product, quantity = 1) => {
    setCustomerCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCustomerCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCustomerCart(productId);
      return;
    }
    setCustomerCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCustomerCart = (productId: string) => {
    setCustomerCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCustomerCart = () => {
    setCustomerCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        bills,
        storeProfile,
        currentView,
        setCurrentView,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        createBill,
        updateStoreProfile,
        resetToDefaults,
        posCart,
        addToPosCart,
        updatePosCartQuantity,
        updatePosCartUnit,
        updatePosCartDiscount,
        removeFromPosCart,
        clearPosCart,
        customerCart,
        addToCustomerCart,
        updateCustomerCartQuantity,
        removeFromCustomerCart,
        clearCustomerCart,
        selectedReceiptBill,
        setSelectedReceiptBill,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
