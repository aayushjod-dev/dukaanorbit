import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { StoreProfile } from '../types';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (upiRef: string) => void;
  amount: number;
  billNumber: string;
  storeProfile: StoreProfile;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  billNumber,
  storeProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const upiRefNumber = useRef(`UPI/${Date.now().toString().slice(-8)}/AXIS`);

  // Construct standard NPCI / UPI payment link
  const upiPayload = `upi://pay?pa=${storeProfile.upiVpa}&pn=${encodeURIComponent(
    storeProfile.name
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Bill ${billNumber} - ${storeProfile.name}`
  )}`;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        upiPayload,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Failed to render UPI QR canvas');
        }
      );
    }
  }, [isOpen, upiPayload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Dynamic UPI QR Code</h3>
              <p className="text-xs text-slate-400 font-mono">Invoice #{billNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="text-xs text-slate-500 mb-1">Total Amount Payable</div>
          <div className="text-3xl font-bold font-mono text-slate-900 mb-4">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-xs mb-4">
            <canvas ref={canvasRef} className="w-[220px] h-[220px] block" />
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500">Merchant VPA:</span>
              <span className="font-mono font-medium text-slate-800">{storeProfile.upiVpa}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Payee Name:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">{storeProfile.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-6">
            <span>GPay</span>
            <span>·</span>
            <span>PhonePe</span>
            <span>·</span>
            <span>Paytm</span>
            <span>·</span>
            <span>BHIM</span>
            <span>·</span>
            <span>Cred</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md mb-6 border border-emerald-100">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero-fee instant settlement to linked merchant account</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel / Change Mode
            </button>
            <button
              type="button"
              onClick={() => onPaymentSuccess(upiRefNumber.current)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Paid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
