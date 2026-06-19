import React, { useEffect, useState } from 'react';
import { payBillService } from '../services/payBill.service';
import { showErrorToast } from '../utils/toastUtils';
import { X } from 'lucide-react';
import { getSessionData } from '../utils/session';

const PaymentDetailModal = ({ payDoc, preloadedData, onClose }) => {
  const [detail, setDetail] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const session = getSessionData() || {};

  useEffect(() => {
    if (preloadedData) return;
    const fetchDetail = async () => {
      try {
        const data = await payBillService.getPayment(payDoc);
        setDetail(data);
      } catch (err) {
        showErrorToast('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    if (payDoc) fetchDetail();
  }, [payDoc, preloadedData]);

  if (!payDoc && !preloadedData) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-[2px] transition-opacity p-4">
      {loading || !detail ? (
        <div className="bg-white p-8 rounded shadow-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077c5]"></div>
        </div>
      ) : (
        <div className="relative w-full max-w-[380px] flex flex-col items-center drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Main Receipt Body */}
          <div className="w-full bg-gradient-to-b from-white to-[#f4f6f9] pt-12 pb-6 px-10 relative overflow-hidden" 
               style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.02)' }}>
            
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 transition-colors bg-white/50 rounded-full hover:bg-gray-200">
                    <X size={18} />
                </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-[22px] font-mono tracking-[0.25em] text-[#5a677a]">RECEIPT</h2>
              <div className="text-[11px] font-mono text-[#829ab1] uppercase mt-1 tracking-wider">{session.companyName || 'Accounts Web'}</div>
            </div>
            
            <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-8 text-sm overflow-hidden whitespace-nowrap opacity-60">
                ***********************************
            </div>
            
            {/* Info */}
            <div className="w-full flex justify-between font-mono text-[#4a5568] mb-3 text-[13px]">
                <span className="uppercase tracking-wider">Vendor</span>
                <span className="text-right">{detail.vendorId}</span>
            </div>
            <div className="w-full flex justify-between font-mono text-[#4a5568] mb-3 text-[13px]">
                <span className="uppercase tracking-wider">Doc No</span>
                <span className="text-right">{detail.payDoc}</span>
            </div>
            <div className="w-full flex justify-between font-mono text-[#4a5568] mb-8 text-[13px]">
                <span className="uppercase tracking-wider">Pay Type</span>
                <span className="text-right">{detail.payType}</span>
            </div>
            
            {/* Items */}
            <div className="w-full flex flex-col gap-4 mb-8">
                {detail.bills.map((b, i) => (
                    <div key={i} className="w-full flex justify-between items-start font-mono text-[#4a5568] text-[14px]">
                        <span className="break-all pr-4 uppercase">{b.docNo}</span>
                        <span className="whitespace-nowrap">{parseFloat(b.toPay || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
                    </div>
                ))}
            </div>
            
            {/* Divider */}
            <div className="w-full border-t-[2px] border-dashed border-[#cbd5e0] mb-6 opacity-70"></div>
            
            {/* Total */}
            <div className="w-full flex justify-between items-end font-mono text-[#2d3748] mb-10">
                <span className="text-[16px] tracking-wider uppercase">Total</span>
                <span className="text-[20px] font-bold">
                    {detail.bills.reduce((sum, b) => sum + parseFloat(b.toPay || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                </span>
            </div>
            
            {/* Date */}
            <div className="w-full flex justify-between font-mono text-[#829ab1] text-[13px] mb-8">
                <span className="uppercase tracking-wider">Date</span>
                <span>{detail.payDate?.split('T')[0]?.split('-').reverse().join('.')}</span>
            </div>
            
            <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-4 text-sm overflow-hidden whitespace-nowrap opacity-60">
                ***********************************
            </div>

            {/* System Details footer */}
            <div className="w-full flex justify-between font-mono text-[#829ab1] text-[10px] mb-6">
                <span>REF: {detail.payDoc}</span>
                <span>USR: {session.userName || 'ADMIN'}</span>
            </div>
            
            <p className="font-mono text-[#5a677a] tracking-widest text-[13px] mb-2 text-center uppercase">
                Thank You For Payment
            </p>
          </div>

          {/* Scalloped Bottom Edge */}
          <div className="w-full h-[12px] shrink-0" style={{
              background: 'radial-gradient(circle at 50% 0, #f4f6f9 6px, transparent 6.5px) repeat-x',
              backgroundSize: '12px 12px',
              marginTop: '-1px'
          }} />
        </div>
      )}
    </div>
  );
};

export default PaymentDetailModal;
