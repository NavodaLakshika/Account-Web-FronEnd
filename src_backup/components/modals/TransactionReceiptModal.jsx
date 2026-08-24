import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Loader2, FileText, Download, Building2, User, MapPin, Phone, Mail, Calendar, Hash } from 'lucide-react';
import SimpleModal from '../SimpleModal';
import { enterBillService } from '../../services/enterBill.service';
import { getSessionData } from '../../utils/session';
import { showErrorToast } from '../../utils/toastUtils';
import html2pdf from 'html2pdf.js';
import api from '../../services/api';

const TransactionReceiptModal = ({ selectedTx, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [billDetails, setBillDetails] = useState(null);
  const receiptRef = useRef(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const session = getSessionData();
  const companyName = session?.companyName || 'ONIMTA INFORMATION TECHNOLOGY';
  const userName = session?.userName || 'System Admin';
  const [fullCompanyDetails, setFullCompanyDetails] = useState(session?.companyDetails || {});

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (session?.companyCode) {
        try {
          const response = await api.get(`/company/details/${session.companyCode}`);
          if (response.data) {
            setFullCompanyDetails(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch full company details:", error);
        }
      }
    };
    fetchCompanyDetails();
  }, [session?.companyCode]);

  const handleDownloadPdf = async () => {
    const element = receiptRef.current;
    if (!element) return;
    
    setIsPdfGenerating(true);
    try {
        const opt = {
          margin:       [10, 10, 10, 10],
          filename:     `${selectedTx?.docNo || 'Receipt'}_Receipt.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        showErrorToast('Failed to generate PDF');
    } finally {
        setIsPdfGenerating(false);
    }
  };

  useEffect(() => {
    const fetchBill = async () => {
      if (selectedTx?.type?.toUpperCase() === 'BILL' && selectedTx.docNo) {
        setLoading(true);
        try {
          const { companyCode } = getSessionData();
          const data = await enterBillService.getBill(selectedTx.docNo, companyCode);
          setBillDetails(data);
        } catch (error) {
          showErrorToast('Failed to load bill details');
        } finally {
          setLoading(false);
        }
      } else if (selectedTx?.details) {
        setBillDetails(selectedTx.details);
      }
    };
    if (selectedTx) {
      fetchBill();
    } else {
      setBillDetails(null);
    }
  }, [selectedTx]);

  useEffect(() => {
    if (selectedTx) {
      document.body.classList.add('printing-receipt');
      return () => {
        document.body.classList.remove('printing-receipt');
      };
    }
  }, [selectedTx]);

  if (!selectedTx) return null;

  const modalContent = (
      <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/40 backdrop-blur-sm transition-opacity print:p-0 print:bg-white p-4">
          <div className="relative w-full max-w-[700px] h-[95vh] flex flex-col bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:h-auto overflow-hidden font-['Tahoma'] select-none">
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 print:hidden shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-bold text-gray-800">Payment Receipt</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfGenerating}
                        className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-[3px] transition-colors ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPdfGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-[3px] transition-colors"
                    >
                        <Printer size={14} />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    <div className="w-px h-3 bg-gray-200 mx-1"></div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[3px] transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Main Receipt Body */}
            <div className="w-full bg-white p-4 sm:p-6 relative flex-1 overflow-y-auto print:p-0 no-scrollbar">
              <div ref={receiptRef} className="max-w-[800px] mx-auto bg-white flex flex-col min-h-full print:block text-slate-800">
                
                {/* Header Top: Title */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex-1 min-w-0 pr-4">
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight uppercase">
                            {companyName}
                        </h1>
                        <div className="mt-2 space-y-0.5">
                            {(fullCompanyDetails.Address1 || fullCompanyDetails.address1) && (
                                <div className="text-[11px] text-gray-500">{fullCompanyDetails.Address1 || fullCompanyDetails.address1}</div>
                            )}
                            {(fullCompanyDetails.Phone || fullCompanyDetails.phone) && (
                                <div className="text-[11px] text-gray-500">Tel: {fullCompanyDetails.Phone || fullCompanyDetails.phone}</div>
                            )}
                            {(fullCompanyDetails.Email || fullCompanyDetails.email) && (
                                <div className="text-[11px] text-gray-500">Email: {fullCompanyDetails.Email || fullCompanyDetails.email}</div>
                            )}
                        </div>
                    </div>
                    <div className="text-2xl font-light text-gray-300 tracking-widest uppercase shrink-0">
                        RECEIPT
                    </div>
                </div>

                {/* Metadata Block 1: DocNo, Date, Billed To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Receipt To</h3>
                        <div className="text-[12px] font-bold text-slate-900">{selectedTx.payee || selectedTx.category || '---'}</div>
                        {billDetails?.header?.address && (
                            <div className="text-[11px] text-gray-500 mt-1 whitespace-pre-line">
                                {billDetails.header.address}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Receipt No</h3>
                            <div className="text-[12px] font-bold text-slate-900">#{selectedTx.docNo}</div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h3>
                            <div className="text-[12px] font-bold text-slate-900">{selectedTx?.date ? selectedTx.date.split('T')[0] : '---'}</div>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="mb-6 min-h-[100px]">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 size={20} className="text-gray-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="w-full text-[11px] sm:text-[12px] text-left">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        {billDetails?.bills && billDetails.bills.length > 0 ? (
                                            <>
                                                <th className="py-2 font-bold text-gray-600 w-[40%]">Description</th>
                                                <th className="py-2 font-bold text-gray-600 w-[15%] text-right">Discount</th>
                                                <th className="py-2 font-bold text-gray-600 w-[20%] text-right">Set Offs</th>
                                                <th className="py-2 font-bold text-gray-600 w-[25%] text-right">Amount</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="py-2 font-bold text-gray-600 w-[60%]">Description</th>
                                                <th className="py-2 font-bold text-gray-600 w-[15%] text-center">Qty</th>
                                                <th className="py-2 font-bold text-gray-600 w-[25%] text-right">Amount</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {billDetails?.bills && billDetails.bills.length > 0 ? (
                                        billDetails.bills.map((bill, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-slate-700">{String(bill.docNo || 'Unknown').replace(/^,\s*/, '')}</td>
                                                <td className="py-2 text-slate-700 text-right">{parseFloat(bill.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-2 text-slate-700 text-right">{parseFloat(bill.setOfUse || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-2 text-slate-700 text-right font-bold">{parseFloat(bill.toPay || bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))
                                    ) : billDetails?.expenses && billDetails.expenses.length > 0 ? (
                                        billDetails.expenses.map((exp, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-slate-700">{String(exp.memo || exp.accCode || exp.acc_Code || 'Item').replace(/^,\s*/, '')}</td>
                                                <td className="py-2 text-slate-700 text-center">1</td>
                                                <td className="py-2 text-slate-700 text-right font-bold">{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="py-2 text-slate-700">{String(selectedTx.category || 'Payment').replace(/^,\s*/, '')}</td>
                                            <td className="py-2 text-slate-700 text-center">1</td>
                                            <td className="py-2 text-slate-700 text-right font-bold">{parseFloat(selectedTx.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Footer Bottom Block */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 mt-auto">
                    {/* Left side: Payment Method & User */}
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Info</h3>
                        <div className="text-[12px] font-bold text-slate-700 mb-0.5">{selectedTx.payType || selectedTx.paymentMethod || billDetails?.payType || 'Payment'}</div>
                        <div className="text-[11px] text-gray-500 mb-2">Ref: {selectedTx.chqNo || selectedTx.reference || billDetails?.chqNo || '---'}</div>
                        
                        {(selectedTx.memo || billDetails?.memo) && (
                            <div className="text-[11px] text-slate-600 italic mb-2">
                                "{selectedTx.memo || billDetails?.memo}"
                            </div>
                        )}

                        <div className="text-[10px] text-gray-400 mt-4">
                            Processed by {selectedTx.createUser || userName || 'System'}
                        </div>
                    </div>

                    {/* Right side: Totals */}
                    <div className="w-full sm:w-[250px] bg-slate-50 border border-slate-100 p-4">
                        <div className="space-y-2 mb-3">
                            {billDetails?.bills && billDetails.bills.length > 0 && (
                                <>
                                    <div className="flex justify-between text-[11px] text-gray-600">
                                        <span>Total Discount</span>
                                        <span>{billDetails.bills.reduce((sum, b) => sum + (parseFloat(b.discount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-gray-600">
                                        <span>Total Set Offs</span>
                                        <span>{billDetails.bills.reduce((sum, b) => sum + (parseFloat(b.setOfUse) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-[12px] font-bold text-slate-700">
                                <span>Subtotal</span>
                                <span>{parseFloat(selectedTx.total || billDetails?.bills?.reduce((s, b) => s + (parseFloat(b.toPay) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-3">
                            <span className="text-[13px] font-bold text-slate-900">Total Paid</span>
                            <span className="text-[14px] font-bold text-slate-900">
                                LKR {parseFloat(selectedTx.total || billDetails?.bills?.reduce((s, b) => s + (parseFloat(b.toPay) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

              </div>
            </div>
         </div>
      </div>
    );

    return createPortal(modalContent, document.body);
};

export default TransactionReceiptModal;
