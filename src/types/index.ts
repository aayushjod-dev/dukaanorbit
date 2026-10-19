export type ProductCategory = 
  | 'Staples & Atta'
  | 'Pulses & Dals'
  | 'Dairy & Bakery'
  | 'Spices & Oils'
  | 'Snacks & Beverages'
  | 'Personal & Home Care';

export type ProductUnit = 'kg' | 'g' | 'packet' | 'piece' | 'litre' | 'ml';

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: ProductCategory;
  barcode: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  unit: ProductUnit;
  unitStep?: number; // e.g., 0.25 for 250g increments, 1 for packets
  lowStockThreshold: number;
  image: string;
  hsnCode: string;
  taxRate: number; // percentage, e.g. 0, 5, 12, 18
  isPopular?: boolean;
  description?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedUnit: ProductUnit;
  unitPrice: number;
  lineDiscount: number; // in INR
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'udhar';
export type OrderType = 'pos_counter' | 'online_delivery' | 'online_pickup';

export interface Bill {
  id: string;
  billNumber: string;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliverySlot?: string;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  cashTendered?: number;
  changeDue?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'credit';
  upiTxnId?: string;
  createdAt: string;
  cashierName: string;
  notes?: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  owner: string;
  phone: string;
  address: string;
  gstin: string;
  upiVpa: string;
  fssai: string;
  currency: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
}
