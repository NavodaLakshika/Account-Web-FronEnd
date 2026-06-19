import React, { useEffect, useState } from 'react';
import { quotationService } from '../services/quotation.service';
import { showErrorToast } from '../utils/toastUtils';
import { X, Building2 } from 'lucide-react';
import { getSessionData } from '../utils/session';

const QuotationDetailModal = ({ docNo, preloadedData, onClose }) => {
  const [detail, setDetail] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const session = getSessionData() || {};

  useEffect(() => {
    if (preloadedData) return;
    const fetchDetail = async () => {
      try {
        const data = await quotationService.getAppliedDoc(docNo, session.companyCode);
        setDetail(data);
      } catch (err) {
        showErrorToast('Failed to load quotation details');
      } finally {
        setLoading(false);
      }
    };
    if (docNo) fetchDetail();
  }, [docNo, preloadedData, session.companyCode]);

  if (!docNo && !preloadedData) return null;

  const taxPercentage = detail ? (detail.taxPer || detail.header?.taxPer || detail.header?.taxper || "0") : "0";
  const subTotal = detail ? (detail.items || detail.details || []).reduce((sum, item) => sum + parseFloat(item.amount || item.totalAmount || 0), 0) : 0;
  const calculatedTax = subTotal * parseFloat(taxPercentage) / 100;
  const netAmount = detail ? (detail.header?.netAmount || detail.header?.net_Amount || detail.netAmount || detail.totalAmount || detail.total || detail.header?.total_Amount || (subTotal + calculatedTax)) : 0;

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-sm transition-opacity p-4 font-sans">
      {loading || !detail ? (
        <div className="bg-white p-8 rounded shadow-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a365d]"></div>
        </div>
      ) : (
        <div className="relative w-full max-w-[750px] max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10 p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
            </button>

            <div className="flex-1 p-12 text-[#1e293b] overflow-y-auto no-scrollbar">
                {/* Header (Company Info) */}
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#1a365d] tracking-wide uppercase">
                        {session.companyName || 'Accounts Web'}
                    </h2>
                    <div className="text-[12px] text-gray-500 mt-1 font-medium">
                        Branch/Code: {session.companyCode || 'Colombo'} <span className="mx-2">•</span> Prepared by: {session.userName || 'Admin'}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[2px] bg-[#1a365d] mb-8"></div>

                {/* Title */}
                <h1 className="text-center text-[28px] font-bold text-[#1a365d] tracking-[0.15em] mb-8">
                    QUOTATION
                </h1>

                {/* Info Section */}
                <div className="flex justify-between items-start mb-10 text-[12px] leading-relaxed">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#1a365d] mb-1">Quotation for:</span>
                        <span className="font-semibold text-gray-800 text-[14px]">
                            {detail.header?.customerName || detail.customerName || detail.vendorId || detail.customerId || detail.header?.vendor_Id || 'Walk-in Customer'}
                        </span>
                        <span className="text-gray-500 text-[11px] mb-2">
                            ID: {detail.vendorId || detail.customerId || detail.header?.vendor_Id || 'N/A'}
                        </span>

                        <span className="text-gray-500 mt-4 mb-1 font-bold text-[#1a365d]">Description of Service:</span>
                        <span className="text-gray-700 max-w-[250px] mb-2">{detail.remarks || detail.header?.remarks || 'General Services / Products'}</span>
                        
                        {(detail.comment || detail.header?.comment) && (
                            <>
                                <span className="text-gray-500 mt-2 mb-1 font-bold text-[#1a365d]">Comments:</span>
                                <span className="text-gray-700 max-w-[250px]">{detail.comment || detail.header?.comment}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Date:</span>
                            <span className="text-gray-700">{(detail.postDate || detail.header?.post_Date)?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Quotation #:</span>
                            <span className="text-gray-700">{docNo}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-[#1a365d]">Valid until:</span>
                            <span className="text-gray-700">{(detail.expectedDate || detail.header?.expected_Date)?.split('T')[0] || 'N/A'}</span>
                        </div>
                        {taxPercentage !== "0" && (
                            <div className="flex gap-2 mt-1">
                                <span className="font-bold text-[#1a365d]">Tax %:</span>
                                <span className="text-gray-700">{taxPercentage}</span>
                            </div>
                        )}
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
                            {(detail.items || detail.details || []).map((item, i) => (
                                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-800 font-medium">{item.prodName || item.itemCode || item.prodCode || item.item_Code || 'Item'}</td>
                                    <td className="py-3 px-4 text-center text-gray-600">{item.qty || item.quantity || 1}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {parseFloat(item.price || item.sellingPrice || item.selling_Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                                        {parseFloat(item.amount || item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Row */}
                <div className="flex flex-col items-end mb-12">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                        <span className="font-medium text-[13px]">Subtotal</span>
                        <span className="font-semibold text-[14px]">
                            {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Tax */}
                    {taxPercentage !== "0" && (
                        <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                            <span className="font-medium text-[13px]">Tax ({taxPercentage}%)</span>
                            <span className="font-semibold text-[14px]">
                                {calculatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {/* Total */}
                    <div className="bg-[#1a365d] text-white flex items-center justify-between px-6 py-3 min-w-[350px] mt-2">
                        <span className="font-semibold text-[14px]">Total Quoted Amount</span>
                        <span className="font-bold text-[18px]">
                            {parseFloat(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col mt-auto">
                    <div className="w-full text-[10px] text-gray-500 mb-8 pt-4 flex gap-2">
                        <span className="font-bold text-[#1a365d] shrink-0">Terms & Conditions: </span>
                        <span>{detail.terms || detail.paymentTerms || detail.header?.pay_Type || '50% deposit to begin. Balance payable upon completion. Price includes labor and materials. Work completion estimated at 3 days.'}</span>
                    </div>
                    <div className="w-full text-center">
                        <p className="text-[12px] font-medium text-[#1a365d] italic">
                            Thank you for considering our business!
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetailModal;
