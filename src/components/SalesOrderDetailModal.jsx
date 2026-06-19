import React, { useEffect, useState } from 'react';
import { salesOrderService } from '../services/salesOrder.service';
import { showErrorToast } from '../utils/toastUtils';
import { X } from 'lucide-react';
import { getSessionData } from '../utils/session';

const SalesOrderDetailModal = ({ docNo, preloadedData, onClose }) => {
  const [detail, setDetail] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const session = getSessionData() || {};

  useEffect(() => {
    if (preloadedData) return;
    const fetchDetail = async () => {
      try {
        const data = await salesOrderService.getOrder(docNo, session.companyCode);
        setDetail(data);
      } catch (err) {
        showErrorToast('Failed to load sales order details');
      } finally {
        setLoading(false);
      }
    };
    if (docNo) fetchDetail();
  }, [docNo, preloadedData, session.companyCode]);

  if (!docNo && !preloadedData) return null;

  const h = detail?.header || detail || {};
  const items = detail?.details || [];

  const taxPercentage = h.taxPer || h.taxper || "0";
  const subTotal = items.reduce((sum, item) => sum + parseFloat(item.amount || item.totalAmount || 0), 0);
  const discValue = parseFloat(h.discValue || h.headerDiscount || h.disc_per || 0) || 0;
  const taxValue = subTotal * parseFloat(taxPercentage) / 100;
  const adjValue = parseFloat(h.adjValue || h.adj_Value || 0) || 0;
  const adjType = h.adjType || h.adj_Type || 'Add';
  const netAmount = h.netAmount || h.net_Amount || h.totalAmount || (subTotal - discValue + taxValue + (adjType === 'Add' ? adjValue : -adjValue));

  const customerName = h.custName || h.customerName || h.vendor_Id || h.custCode || 'Walk-in Customer';
  const customerId = h.custCode || h.vendor_Id || 'N/A';
  const orderDate = (h.date || h.post_Date || h.docDate || '').split('T')[0] || '';
  const dueDate = (h.dueDate || h.expected_Date || '').split('T')[0] || '';
  const orderDocNo = docNo || h.docNo || h.doc_No || '';

  return (
    <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-sm transition-opacity p-4 font-sans">
      {loading || !detail ? (
        <div className="bg-white p-8 rounded shadow-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a365d]"></div>
        </div>
      ) : (
        <div className="relative w-full max-w-[750px] max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10 p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
            </button>

            <div className="flex-1 p-12 text-[#1e293b] overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-[22px] font-bold text-[#1a365d] tracking-wide uppercase">
                        {session.companyName || 'Accounts Web'}
                    </h2>
                    <div className="text-[12px] text-gray-500 mt-1 font-medium">
                        Branch/Code: {session.companyCode || 'Colombo'} <span className="mx-2">•</span> Prepared by: {session.userName || 'Admin'}
                    </div>
                </div>

                <div className="w-full h-[2px] bg-[#1a365d] mb-8"></div>

                <h1 className="text-center text-[28px] font-bold text-[#1a365d] tracking-[0.15em] mb-8">
                    SALES ORDER
                </h1>

                <div className="flex justify-between items-start mb-10 text-[12px] leading-relaxed">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#1a365d] mb-1">Customer:</span>
                        <span className="font-semibold text-gray-800 text-[14px]">
                            {customerName}
                        </span>
                        <span className="text-gray-500 text-[11px] mb-2">
                            ID: {customerId}
                        </span>

                        <span className="text-gray-500 mt-4 mb-1 font-bold text-[#1a365d]">Reference:</span>
                        <span className="text-gray-700 max-w-[250px] mb-2">{h.refNo || h.reference || 'N/A'}</span>

                        <span className="text-gray-500 mt-2 mb-1 font-bold text-[#1a365d]">Sales Assistant:</span>
                        <span className="text-gray-700 max-w-[250px] mb-2">{h.salesRef || h.sales_Ref || 'N/A'}</span>

                        {(h.comment || h.jobNo || h.remarks) && (
                            <>
                                <span className="text-gray-500 mt-2 mb-1 font-bold text-[#1a365d]">Remarks:</span>
                                <span className="text-gray-700 max-w-[250px]">{h.comment || h.jobNo || h.remarks}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Date:</span>
                            <span className="text-gray-700">{orderDate || new Date().toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Order #:</span>
                            <span className="text-gray-700">{orderDocNo}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Due Date:</span>
                            <span className="text-gray-700">{dueDate || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2 mb-1">
                            <span className="font-bold text-[#1a365d]">Payment:</span>
                            <span className="text-gray-700">{h.payType || h.pay_Type || 'Cash'}</span>
                        </div>
                        {taxPercentage !== "0" && (
                            <div className="flex gap-2 mt-1">
                                <span className="font-bold text-[#1a365d]">Tax %:</span>
                                <span className="text-gray-700">{taxPercentage}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full mb-10">
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr className="bg-[#1a365d] text-white">
                                <th className="py-3 px-4 text-left font-semibold border-r border-[#2d4a7a]">Description</th>
                                <th className="py-3 px-4 text-center font-semibold w-24 border-r border-[#2d4a7a]">Qty</th>
                                <th className="py-3 px-4 text-right font-semibold w-32 border-r border-[#2d4a7a]">Unit Price</th>
                                <th className="py-3 px-4 text-right font-semibold w-24 border-r border-[#2d4a7a]">Disc %</th>
                                <th className="py-3 px-4 text-right font-semibold w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-800 font-medium">{item.prodName || item.itemCode || item.prodCode || item.item_Code || 'Item'}</td>
                                    <td className="py-3 px-4 text-center text-gray-600">{item.qty || item.quantity || 0}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {parseFloat(item.selling || item.sellingPrice || item.selling_Price || item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {parseFloat(item.disc || item.discPer || item.disc_per || item.discount || 0).toFixed(2)}%
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                                        {parseFloat(item.amount || item.totalAmount || item.line_Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-end mb-12">
                    <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                        <span className="font-medium text-[13px]">Subtotal</span>
                        <span className="font-semibold text-[14px]">
                            {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {discValue > 0 && (
                        <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                            <span className="font-medium text-[13px]">Discount</span>
                            <span className="font-semibold text-[14px] text-red-500">
                                -{discValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {taxPercentage !== "0" && (
                        <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                            <span className="font-medium text-[13px]">Tax ({taxPercentage}%)</span>
                            <span className="font-semibold text-[14px]">
                                {taxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {adjValue > 0 && (
                        <div className="flex items-center justify-between px-6 py-2 min-w-[350px] text-[#1a365d]">
                            <span className="font-medium text-[13px]">Adjustment ({adjType})</span>
                            <span className={`font-semibold text-[14px] ${adjType === 'Add' ? 'text-green-500' : 'text-red-500'}`}>
                                {adjType === 'Add' ? '+' : '-'}{adjValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    <div className="bg-[#1a365d] text-white flex items-center justify-between px-6 py-3 min-w-[350px] mt-2">
                        <span className="font-semibold text-[14px]">Total Order Amount</span>
                        <span className="font-bold text-[18px]">
                            {parseFloat(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col mt-auto">
                    <div className="w-full text-[10px] text-gray-500 mb-8 pt-4 flex gap-2">
                        <span className="font-bold text-[#1a365d] shrink-0">Terms & Conditions: </span>
                        <span>{h.terms || h.payType || h.pay_Type || 'Standard terms apply.'}</span>
                    </div>
                    <div className="w-full text-center">
                        <p className="text-[12px] font-medium text-[#1a365d] italic">
                            Thank you for your order!
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderDetailModal;
