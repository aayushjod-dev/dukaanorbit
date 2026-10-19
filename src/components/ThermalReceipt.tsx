import React, { useState } from 'react';
import { Printer, Share2, Check, X, ArrowRight, Phone } from 'lucide-react';
import { Bill, StoreProfile } from '../types';

interface ThermalReceiptProps {
  bill: Bill;
  storeProfile: StoreProfile;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  bill,
  storeProfile,
  onClose,
  onNewSale,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Calculate total savings compared to MRP
  const totalMrp = bill.items.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - bill.grandTotal);

  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getWhatsAppReceiptUrl = () => {
    const itemList = bill.items
      .map(
        (i) =>
          `• ${i.product.name} (${i.quantity} ${i.selectedUnit}) = ₹${(
            i.quantity * i.unitPrice -
            i.lineDiscount
          ).toFixed(0)}`
      )
      .join('%0A');

    const msg = `*TAX INVOICE - ${encodeURIComponent(storeProfile.name)}*%0A` +
      `Bill No: ${bill.billNumber}%0A` +
      `Date: ${formattedDate} ${formattedTime}%0A` +
      `Customer: ${encodeURIComponent(bill.customerName || 'Customer')} (${bill.customerPhone})%0A%0A` +
      `*ITEMS:*%0A${itemList}%0A%0A` +
      `*Total Amount: ₹${bill.grandTotal.toFixed(2)}*%0A` +
      `Payment: ${bill.paymentMethod.toUpperCase()}%0A` +
      (totalSavings > 0 ? `*You Saved: ₹${totalSavings.toFixed(2)}*%0A` : '') +
      `Thank you for shopping with us!`;

    const phone = bill.customerPhone.replace(/[^0-9]/g, '');
    const fullPhone = phone.length === 10 ? `91${phone}` : phone;
    return `https://wa.me/${fullPhone}?text=${msg}`;
  };

  const copyReceiptText = () => {
    const text = `${storeProfile.name}
Bill: ${bill.billNumber} | ${formattedDate}
Items:
${bill.items.map((i) => `${i.product.name} x ${i.quantity} = ₹${i.quantity * i.unitPrice}`).join('\n')}
Grand Total: ₹${bill.grandTotal.toFixed(2)} (${bill.paymentMethod.toUpperCase()})
Thank you!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-8">
        {/* Header Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Tax Invoice & Thermal Receipt</span>
            <span className="text-xs text-slate-400 font-mono">#{bill.billNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Thermal (80mm)</span>
          </button>

          {bill.customerPhone && (
            <a
              href={getWhatsAppReceiptUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            onClick={copyReceiptText}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Copy'}
          </button>
        </div>

        {/* The Printable 80mm Receipt Body */}
        <div className="p-6 bg-slate-100/70 flex justify-center max-h-[60vh] overflow-y-auto">
          <div
            id="thermal-receipt-print-area"
            className="w-[320px] bg-white p-5 shadow-xs border border-slate-200 font-mono text-[11px] leading-tight text-slate-900"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="font-bold text-sm tracking-tight text-black uppercase mb-0.5">
                {storeProfile.name}
              </div>
              <div className="text-[10px] text-slate-600 mb-1">{storeProfile.tagline}</div>
              <div className="text-[10px] text-slate-600">{storeProfile.address}</div>
              <div className="text-[10px] text-slate-600 flex items-center justify-center gap-1 mt-0.5">
                <Phone className="w-2.5 h-2.5 inline" /> {storeProfile.phone}
              </div>
              {storeProfile.gstin && (
                <div className="text-[10px] text-slate-700 mt-1 font-semibold">
                  GSTIN: {storeProfile.gstin}
                </div>
              )}
              {storeProfile.fssai && (
                <div className="text-[9px] text-slate-500">
                  FSSAI Lic: {storeProfile.fssai}
                </div>
              )}
            </div>

            {/* Bill Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE: #{bill.billNumber}</span>
                <span>DATE: {formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME: {formattedTime}</span>
                <span>CASHIER: {bill.cashierName}</span>
              </div>
              <div className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                <span>CUSTOMER: {bill.customerName || 'Walk-in Customer'}</span>
                <span>{bill.customerPhone}</span>
              </div>
              {bill.orderType !== 'pos_counter' && (
                <div className="mt-1 text-slate-600">
                  TYPE: {bill.orderType === 'online_delivery' ? 'Home Delivery' : 'Store Pickup'}
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 font-bold pb-1 text-[10px] border-b border-slate-200 text-slate-700">
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-right">QTY</span>
                <span className="col-span-2 text-right">RATE</span>
                <span className="col-span-2 text-right">AMT</span>
              </div>
              <div className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice - item.lineDiscount;
                  return (
                    <div key={idx} className="py-1 text-[10.5px]">
                      <div className="font-medium truncate text-black">
                        {item.product.name}
                      </div>
                      <div className="grid grid-cols-12 text-slate-600 text-[10px]">
                        <span className="col-span-6 text-[9.5px] text-slate-400">
                          HSN: {item.product.hsnCode || 'N/A'}
                        </span>
                        <span className="col-span-2 text-right tabular-nums">
                          {item.quantity} {item.selectedUnit}
                        </span>
                        <span className="col-span-2 text-right tabular-nums">
                          ₹{item.unitPrice}
                        </span>
                        <span className="col-span-2 text-right font-semibold text-black tabular-nums">
                          ₹{lineTotal.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tally Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Items:</span>
                <span className="tabular-nums font-semibold">{bill.items.length} ({bill.items.reduce((s, i) => s + i.quantity, 0)} units)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sub Total:</span>
                <span className="tabular-nums">₹{bill.subtotal.toFixed(2)}</span>
              </div>
              {bill.taxTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>CGST + SGST:</span>
                  <span className="tabular-nums">₹{bill.taxTotal.toFixed(2)}</span>
                </div>
              )}
              {bill.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="tabular-nums">-₹{bill.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-slate-300">
                <span>GRAND TOTAL:</span>
                <span className="tabular-nums">₹{bill.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
              <div className="flex justify-between font-semibold">
                <span>PAYMENT MODE:</span>
                <span className="uppercase text-black">{bill.paymentMethod}</span>
              </div>
              {bill.paymentMethod === 'cash' && bill.cashTendered !== undefined && (
                <>
                  <div className="flex justify-between text-slate-600 mt-0.5">
                    <span>Cash Tendered:</span>
                    <span className="tabular-nums">₹{bill.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Change Due:</span>
                    <span className="tabular-nums font-bold text-black">₹{(bill.changeDue || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
              {bill.paymentMethod === 'upi' && bill.upiTxnId && (
                <div className="flex justify-between text-slate-600 mt-0.5 text-[9px]">
                  <span>UPI Ref:</span>
                  <span className="font-mono">{bill.upiTxnId}</span>
                </div>
              )}
            </div>

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <div className="py-1.5 my-2 text-center bg-slate-100 rounded text-[11px] font-bold text-slate-900 border border-slate-200">
                🎉 YOU SAVED ₹{totalSavings.toFixed(2)} TODAY!
              </div>
            )}

            {/* Barcode & Footer Note */}
            <div className="pt-3 text-center text-slate-500 text-[9px] space-y-1">
              <div className="font-mono tracking-widest text-slate-700 font-bold text-xs">
                |||||| | |||| ||| ||||||| ||| |||||
              </div>
              <div>{bill.billNumber}</div>
              <div className="pt-1">Goods once sold can be returned within 3 days with bill.</div>
              <div className="font-semibold text-slate-800">*** Thank You, Visit Again! ***</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {onNewSale && (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next Sale / Clear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
