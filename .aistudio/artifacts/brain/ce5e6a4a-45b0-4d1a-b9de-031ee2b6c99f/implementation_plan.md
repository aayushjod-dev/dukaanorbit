# Dukaan Orbit — Smart Kirana POS & Retail Commerce Engine

Dukaan Orbit is an end-to-end retail operating system tailored specifically for Kirana, grocery, and general provision merchants. It pairs a rapid-fire Cashier POS billing counter (with keyboard-driven barcode/SKU search, dynamic UPI QR code generator, and thermal receipt printing) with a real-time Inventory Management Hub and a responsive Customer-Facing Online Storefront.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product scope and workflow priorities have been confirmed based on your selections:

- **Store Type**: Kirana, grocery, and packaged consumer goods (staples, dairy, spices, snacks, pulses, household essentials).
- **Default Home View**: Cashier POS Billing Screen with ultra-responsive keyboard shortcuts, barcode/name search, customer phone lookup, and fast item tallying.
- **Key Core Features**:
  1. **POS Billing Counter**: Quick item lookup, unit switcher (kg, g, pc, pkt, L), automatic tax & discounts, live dynamic UPI QR modal (PayTM/PhonePe/GPay compliant), and instant printable thermal receipt.
  2. **Product Catalog & Inventory**: Real-time stock decrement, low-stock threshold badges, category filtering (Staples, Dairy & Bakery, Spices & Masala, Snacks & Beverages, Personal & Home Care), and rapid add/edit product modal.
  3. **Customer-Facing Digital Storefront**: Toggleable preview allowing customers to browse the live shop catalog, filter aisles, add groceries to cart, and place pickup/home delivery orders with order receipts and WhatsApp confirmation.
  4. **Sales & Orders Ledger**: Real-time transaction history, daily revenue summaries, and cash vs. UPI breakdown.

---

### 1. Overview & Core Concept

- **What It Does**: Empowers Indian and global neighbourhood grocers (kirana shop owners and cashiers) to ring up counter orders in seconds, accept UPI or cash payments with zero latency, monitor low-stock inventory, and share a digital catalog with neighborhood customers for direct ordering.
- **Target Audience / Persona**: Kirana shop owners, cashier staff at mini-marts/supermarkets, and local neighborhood customers ordering daily groceries.
- **Key Value**: Replaces slow manual paper registers and fragmented tools with a unified, offline-resilient, lightning-fast POS with real-time stock sync.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Cashier Speed-Billing Flow (Default View)**:
   - Cashier scans or types product name / barcode in the top search bar (`/` or `F2`).
   - Matching kirana goods appear with stock status and unit price. Clicking or hitting enter adds the item to the active billing bill.
   - Cashier adjusts quantity, selects unit (e.g., 500g vs 1kg for loose grains/sugar), or adds a custom line discount.
   - Cashier enters customer mobile number (for invoice SMS/WhatsApp & loyalty tracking).
   - Cashier clicks "Pay & Bill" -> selects Cash or UPI.
   - For UPI: Instant live UPI QR code is rendered with merchant VPA (`dukaanorbit@upi`), bill total, and transaction reference.
   - Once completed, a standard 80mm/58mm thermal receipt preview pops up with one-click print or digital share, and stock counts decrement immediately.
2. **Inventory & Catalog Management Flow**:
   - Store manager navigates to "Inventory & Products".
   - Views a high-density, tabular data grid of all SKUs with stock level, cost price, MRP, selling price, and stock health indicator.
   - Filters by category, sorts by low stock, or searches by barcode.
   - Quick-edit in-line for stock replenishment and modal for creating new grocery items with image, unit options, and GST rates.
3. **Customer Online Storefront View**:
   - One-click navigation or preview toggle to test the customer-facing shopping experience.
   - Clean, modern grocery aisle layout with clear item photography, pack sizes, instant "Add" stepper, and a floating shopping bag.
   - Streamlined checkout collecting delivery address, delivery slot, and payment choice (Cash on Delivery or UPI).
4. **Orders & Reports View**:
   - Audit trail of today's counter receipts and online delivery orders with status progression (Pending, Packed, Completed, Cancelled).

#### B. Visual Identity & Theme
- **Aesthetic Direction**: High-efficiency, modern utilitarian commerce suite — inspired by Square Register, Shopify POS, and modern Indian retail platforms (Blinkit / Zepto seller hubs).
- **Color Palette & Discipline (60-30-10 Rule)**:
  - **60% Dominant Neutral Canvas**: Crisp clean canvas (`bg-slate-50` / `bg-white` with dark mode `bg-slate-950`).
  - **30% Structural Surfaces**: Clean borders (`border-slate-200 dark:border-slate-800`), crisp panel cards, high-density table rows, and quiet slate labels (`text-slate-500`).
  - **10% High-Intent Accent**: Forest Emerald (`#059669` / `text-emerald-600` / `bg-emerald-600`) symbolizing freshness and retail prosperity, paired with Indigo Slate (`#3B82F6`) for checkout actions and Amber (`#D97706`) for low-stock alerts.
- **Zero-Pill Discipline**:
  - No static pill badges on product names or cards. Metadata uses clean unboxed text separated by subtle bullets: `Staples · 1 kg pack · Stock: 42 units`.
  - Filter bars and mode switchers are styled as clean, segmented control buttons.
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` for crisp, contemporary authority.
  - Body & UI: `Plus Jakarta Sans` / `DM Sans` for high legibility at 12–14px.
  - Financial & Barcode Data: Strictly tabular numbers with monospace numerals (`font-mono tabular-nums`) for currency amounts, quantities, bill numbers, and timestamps.
- **Top Bar Contract**:
  - Zone 1 (Brand): `Dukaan Orbit` with small grocery store identifier.
  - Zone 2 (Navigation): 4 clean single-line links: `POS Counter`, `Inventory & Stock`, `Sales & Bills`, `Customer Storefront`.
  - Zone 3 (Action): Active Register Status & Quick Cash Drawer summary.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-time Reactive Local Storage with Seed Data**:
  - *Chosen Approach*: Persistent browser storage with comprehensive, authentic Kirana seed catalog (over 25 authentic Indian grocery items: Aashirvaad Atta, Fortune Mustard Oil, Tata Salt, Amul Butter, Maggi, Britannia Good Day, Toor Dal, Basmati Rice, Surf Excel, Dettol, etc.).
  - *Why*: Kirana operations require zero-latency, offline billing where internet dropouts never halt checkout queues. Provides full add/edit/delete/reset capabilities.
  - *Alternatives Considered*: Cloud database requiring login screens; introduces cold-start latency and network failure risk at the checkout counter.
- **Decision 2: Dynamic UPI QR Code Generation**:
  - *Chosen Approach*: Real-time UPI standard payload generation (`upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`) rendered into an instant scannable QR code canvas.
  - *Why*: Allows any customer using Google Pay, PhonePe, Paytm, or BHIM to scan and pay instantly with the exact bill amount embedded.
- **Decision 3: Dual-Mode Architecture (Cashier POS + Customer Storefront)**:
  - *Chosen Approach*: Seamless switcher in top navigation allowing the user to view the app as the cashier ringing up counter sales OR preview the live customer shopping experience.
  - *Why*: Fulfills the user's explicit request for both the POS billing counter and the customer-facing online storefront without forcing separate logins or fragmented codebases.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Dukaan Orbit                              │
│                      (App State & Storage Hub)                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  Cashier POS Engine  │ │  Inventory Hub & SKU │ │ Customer Storefront  │
│  - Barcode Scanner   │ │  - Stock Levels      │ │  - Grocery Aisle Nav │
│  - Cart Calculator   │ │  - Low Stock Alerts  │ │  - Customer Cart     │
│  - Unit Switcher     │ │  - Category Manager  │ │  - Delivery Details  │
│  - UPI QR & Cash     │ │  - Add/Edit Product  │ │  - Order Placement   │
│  - Thermal Receipt   │ │  - Cost & Profit Calc│ │  - WhatsApp Share    │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Unified Local Storage & Event Bus                    │
│   • products (SKUs, stock, pricing, units, category, tax)              │
│   • orders & bills (id, items, subtotal, tax, paymentMethod, status)   │
│   • storeSettings (storeName, vpaUpi, phone, address, taxRate)         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities:
1. `Product`: `id`, `name`, `hindiName`, `category`, `barcode`, `mrp`, `sellingPrice`, `costPrice`, `stock`, `unit` (`kg`, `g`, `litre`, `ml`, `packet`, `piece`), `lowStockAlert`, `image`, `description`.
2. `CartItem`: `product`, `quantity`, `selectedUnit`, `price`, `discount`.
3. `Bill / Order`: `id`, `orderNumber`, `type` (`pos_counter` | `online_delivery` | `online_pickup`), `customerName`, `customerPhone`, `items`, `subtotal`, `taxAmount`, `discountAmount`, `total`, `paymentMethod` (`cash` | `upi` | `card` | `udhar`), `paymentStatus` (`paid` | `pending`), `createdAt`, `notes`.
4. `StoreProfile`: `storeName`, `tagline`, `ownerName`, `phone`, `address`, `gstin`, `upiVpa`, `currencySymbol`.
