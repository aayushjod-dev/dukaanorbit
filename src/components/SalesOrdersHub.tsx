import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Calendar, 
  Banknote, 
  QrCode, 
  Truck, 
  Store, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Bill } from '../types';

export const SalesOrdersHub: React.FC = () => {
  const { bills, setSelectedReceiptBill } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.billNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q);

      const matchesPayment = paymentFilter === 'all' || b.paymentMethod === paymentFilter;
      const matchesType = typeFilter === 'all' || b.orderType === typeFilter;

      return matchesSearch && matchesPayment && matchesType;
    });
  }, [bills, searchQuery, paymentFilter, typeFilter]);

  // Aggregate metrics
  const totalSales = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const cashSales = bills.filter((b) => b.paymentMethod === 'cash').reduce((s, b) => s + b.grandTotal, 0);
  const upiSales = bills.filter((b) => b.paymentMethod === 'upi').reduce((s, b) => s + b.grandTotal, 0);
  const creditSales = bills.filter((b) => b.paymentMethod === 'udhar').reduce((s, b) => s + b.grandTotal, 0);
  const totalItemsSold = bills.reduce(
    (sum, b) => sum + b.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const handleExportCSV = () => {
    const headers = ['Bill Number', 'Date', 'Type', 'Customer', 'Phone', 'Items Count', 'Payment Method', 'Status', 'Grand Total'];
    const rows = bills.map((b) => [
      b.billNumber,
      `"${new Date(b.createdAt).toLocaleString()}"`,
      b.orderType,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      b.customerPhone,
      b.items.length,
      b.paymentMethod,
      b.paymentStatus,
      b.grandTotal,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanOrbit_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-50 overflow-hidden">
      {/* Top Header & Summary Stats */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sales Ledger & Invoices Audit
            </h2>
            <p className="text-xs text-slate-500">
              Track daily collections, payment mode breakdowns, customer invoices, and re-print receipts.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sales CSV</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] text-slate-500 font-medium">Total Revenue</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              ₹{totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{bills.length} Total Bills</div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <Banknote className="w-3 h-3 text-emerald-600" />
              <span>Cash In Drawer</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-0.5 tabular-nums">
              ₹{cashSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Physical Tender</div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="text-[11px] text-blue-800 font-medium flex items-center gap-1">
              <QrCode className="w-3 h-3 text-blue-600" />
              <span>UPI Settlements</span>
            </div>
            <div className="text-xl font-bold font-mono text-blue-900 mt-0.5 tabular-nums">
              ₹{upiSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">Direct to Bank VPA</div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="text-[11px] text-amber-800 font-medium">Khata / Udhar Due</div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-0.5 tabular-nums">
              ₹{creditSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Customer Ledger</div>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, customer, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Order Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Channels</option>
            <option value="pos_counter">POS Counter Bills</option>
            <option value="online_delivery">Online Deliveries</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="udhar">Khata / Udhar</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => {
                const date = new Date(bill.createdAt);
                const formattedDate = date.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                });
                const formattedTime = date.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {bill.billNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{formattedDate}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{formattedTime}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {bill.customerName || 'Walk-in'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {bill.customerPhone}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {bill.orderType === 'pos_counter' ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            <span>Counter</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivery</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-mono font-medium">
                        {bill.items.length} items ({bill.items.reduce((s, i) => s + i.quantity, 0)} units)
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 uppercase font-mono font-semibold text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            bill.paymentMethod === 'upi'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : bill.paymentMethod === 'cash'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {bill.paymentMethod}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceiptBill(bill)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="View & Re-print Thermal Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBills.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No invoices found matching criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
