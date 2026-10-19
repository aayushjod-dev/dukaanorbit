# Dukaan Orbit — Smart Retail & Kirana Commerce

Dukaan Orbit is a modern retail operating system built for independent grocers, kirana stores, and retail merchants. It integrates a cashier speed-billing POS counter, barcode scanner, dynamic UPI QR code generator, real-time inventory management hub with low-stock alerts, and a customer-facing digital online storefront.

---

## Key Features

- **Cashier POS Counter**: Keyboard shortcuts (`/` for instant barcode/name search), quantity steppers, unit selectors (`kg`, `g`, `packet`, `piece`, `litre`), cash change calculation, and thermal receipt generation.
- **Dynamic UPI QR Generator**: Real-time generation of NPCI-compliant payment QR codes with exact bill amount and merchant VPA.
- **Thermal Receipt Printing**: Formatted 80mm tax invoices with GSTIN, FSSAI, itemized HSN breakdown, customer savings, and one-click WhatsApp sharing.
- **Inventory & Stock Management**: High-density SKU table, low-stock alerts, one-click replenishment (`+5`, `+20`, `-1`), and profit margin calculations.
- **Customer Online Storefront**: Clean digital grocery catalog with delivery address collection and direct WhatsApp order dispatch.

---

## Setup & Local Development

### 1. Prerequisites
- Node.js (version 18 or later)
- npm or bun

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/YOUR_ORGANIZATION/dukaan-orbit.git
cd dukaan-orbit
npm install
```

### 3. Environment Configuration
Copy the placeholder environment file:
```bash
cp .env.example .env
```

Open `.env` and verify your settings. Only placeholder values are needed for basic local development:
```env
# Optional Gemini API Key for server-side AI features
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Canonical URL of your applet
APP_URL="http://localhost:3000"
```

> **Security Note**: Never commit your `.env` file to source control. It is ignored by `.gitignore`.

### 4. Running the Application
Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Production Build
To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## Security & Responsible Disclosure
Please refer to [SECURITY.md](./SECURITY.md) for our vulnerability disclosure policy and security design standards.
