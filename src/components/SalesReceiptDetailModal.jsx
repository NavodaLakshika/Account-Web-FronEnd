import React, { useEffect, useState } from 'react';
import { salesReceiptService } from '../services/salesReceipt.service';
import { showErrorToast } from '../utils/toastUtils';
import { X } from 'lucide-react';
import { getSessionData } from '../utils/session';

const SalesReceiptDetailModal = ({ docNo, preloadedData, onClose }) => {
  const [detail, setDetail] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const session = getSessionData() || {};

  useEffect(() => {
    if (preloadedData) return;
    const fetchDetail = async () => {
      try {
        const data = await salesReceiptService.getJob(docNo, session.companyCode);
        setDetail(data);
      } catch (err) {
        showErrorToast('Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    };
    if (docNo) fetchDetail();
  }, [docNo, preloadedData, session.companyCode]);

  if (!docNo && !preloadedData) return null;

  const header = detail?.header || {};
  const items = detail?.details || [];

  const subTotal = items.reduce((sum, item) => sum + parseFloat(item.amount || item.totalAmount || 0), 0);
  const netAmount = subTotal; // In sales receipt, usually there is no direct tax/discount in header based on current implementation

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-sm transition-opacity p-4 font-sans overflow-y-auto">
      {loading || !detail ? (
        <div className="bg-white p-8 rounded shadow-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a365d]"></div>
        </div>
      ) : (
        <div className="relative w-full max-w-[750px] flex flex-col items-center drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full print:border-none my-12">
          
          {/* Action Buttons */}
          <div className="absolute -top-12 right-0 flex gap-3 print:hidden">
              <button onClick={handlePrint} className="text-white hover:text-blue-200 p-2 transition-colors bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md" title="Print Receipt">
                  <Printer size={20} />
              </button>
              <button onClick={onClose} className="text-white hover:text-red-200 p-2 transition-colors bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md">
                  <X size={22} />
              </button>
          </div>

          {/* Main Receipt Body */}
          <div className="w-full bg-gradient-to-b from-white to-[#f4f6f9] px-12 pb-12 pt-10 text-[#1e293b] shadow-2xl rounded-sm print:bg-white print:bg-none print:shadow-none">
                {/* Header (Company Info) */}
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#1a365d] tracking-wide uppercase">
                        {session.companyName || 'Accounts Web'}
                    </h2>
                    <div className="text-[12px] text-gray-500 mt-1 font-medium">
                        Branch/Code: {session.companyCode || 'Colombo'} <span className="mx-2">•</span> Prepared by: {header.create_User || header.createUser || session.userName || 'Admin'}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[2px] bg-[#1a365d] mb-8"></div>

                {/* Title */}
                <h1 className="text-center text-[28px] font-bold text-[#1a365d] tracking-[0.15em] mb-8">
                    SALES RECEIPT
                </h1>

                {/* Info Section */}
                <div className="flex justify-between items-start mb-10 text-[12px] leading-relaxed">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#1a365d] mb-1">Receipt for:</span>
                        <span className="font-semibold text-gray-800 text-[14px]">
                            {header.customerName || header.cust_Code || 'Walk-in Customer'}
                        </span>
                        <span className="text-gray-500 text-[11px] mb-2">
                            ID: {header.cust_Code || 'N/A'}
                        </span>

                        <span className="text-gray-500 mt-4 mb-1 font-bold text-[#1a365d]">Subject / Remarks:</span>
                        <span className="text-gray-700 max-w-[250px] mb-2">{header.subject || header.comment || 'N/A'}</span>
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Date:</span>
                            <span className="text-gray-700">{(header.cur_Date || header.post_Date)?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Receipt #:</span>
                            <span className="text-gray-700">{docNo}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Reference:</span>
                            <span className="text-gray-700">{header.reference || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full mb-10">
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr className="bg-[#1a365d] text-white">
                                <th className="py-3 px-4 text-left font-semibold border-r border-[#2d4a7a]">Description</th>
                                <th className="py-3 px-4 text-center font-semibold w-24 border-r border-[#2d4a7a]">Qty</th>
                                <th className="py-3 px-4 text-right font-semibold w-32 border-r border-[#2d4a7a]">Unit Price</th>
                                <th className="py-3 px-4 text-right font-semibold w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-800 font-medium">{item.prod_Name || item.prod_Code || 'Item'}</td>
                                    <td className="py-3 px-4 text-center text-gray-600">{item.qty || 1}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {parseFloat(item.selling_Price || item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                                        {parseFloat(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Row */}
                <div className="flex flex-col items-end mb-12">
                    {/* Total */}
                    <div className="bg-[#1a365d] text-white flex items-center justify-between px-6 py-3 min-w-[350px] mt-2">
                        <span className="font-semibold text-[14px]">Net Amount</span>
                        <span className="font-bold text-[18px]">
                            LKR {parseFloat(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col mt-auto">
                    <div className="w-full text-center">
                        <p className="text-[12px] font-medium text-[#1a365d] italic">
                            Thank you for your business!
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesReceiptDetailModal;
