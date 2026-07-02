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
      <div className="fixed inset-0 z-[9999] flex justify-end bg-[#2d3748]/60 backdrop-blur-[2px] transition-opacity print:p-0 print:bg-white">
          <div className="relative w-full md:w-[350px] lg:w-1/3 h-full flex flex-col bg-white drop-shadow-2xl animate-in slide-in-from-right duration-300 receipt-printable print:shadow-none print:w-full print:h-auto overflow-y-auto font-['Tahoma'] select-none">
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-slate-50/50 print:hidden shrink-0">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#0285fd]" />
                    <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">Payment Receipt</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfGenerating}
                        className={`p-1.5 text-gray-500 hover:text-[#0285fd] hover:bg-blue-50 rounded-[3px] transition-colors ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Download PDF"
                    >
                        {isPdfGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-1.5 text-gray-500 hover:text-[#0285fd] hover:bg-blue-50 rounded-[3px] transition-colors"
                        title="Print"
                    >
                        <Printer size={16} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-[3px] transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Main Receipt Body */}
            <div className="w-full bg-[#f4f5f8] p-4 relative flex-1 overflow-y-auto print:p-0 print:bg-white">
              <div ref={receiptRef} className="bg-white border border-slate-200 flex-1 flex flex-col min-h-full print:border-none print:p-0 shadow-sm rounded-[3px] overflow-hidden">
                
                {/* Header Top: Title */}
                <div className="flex justify-between items-start p-6 sm:p-8 pb-4 gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="text-[18px] sm:text-[20px] font-black text-slate-800 tracking-tight uppercase leading-tight break-words">
                            {companyName}
                        </div>
                    </div>
                    <div className="text-[20px] sm:text-[26px] font-black text-[#0285fd] uppercase tracking-widest shrink-0 text-right">
                        RECEIPT
                    </div>
                </div>
                
                <div className="mx-6 sm:mx-8 h-px bg-slate-200"></div>

                {/* Metadata Block 1: DocNo, Date, Billed To */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 p-6 sm:p-8 pt-5 pb-5 bg-slate-50/30">
                    <div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 mb-1">Receipt no.</div>
                        <div className="text-[11px] sm:text-[12px] font-bold text-gray-700 font-mono">#{selectedTx.docNo}</div>
                    </div>
                    <div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 mb-1">Date</div>
                        <div className="text-[11px] sm:text-[12px] font-bold text-gray-700 font-mono">{selectedTx?.date ? selectedTx.date.split('T')[0] : '---'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 mb-1">Receipt to:</div>
                        <div className="text-[11px] sm:text-[12px] font-bold text-slate-800 uppercase">{selectedTx.payee || selectedTx.category || '---'}</div>
                        {billDetails?.header?.address && (
                            <div className="text-[10px] sm:text-[11px] text-gray-500 font-mono leading-tight mt-1">
                                {billDetails.header.address}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mx-6 sm:mx-8 h-px bg-slate-200"></div>

                {/* Metadata Block 2: Total Due & From Company Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 py-5 sm:py-6 bg-slate-50/60">
                    <div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-wide uppercase mb-1">TOTAL RECEIVED</div>
                        <div className="text-[18px] sm:text-[22px] font-black text-slate-900 font-mono tracking-tighter">LKR {parseFloat(selectedTx.total || billDetails?.bills?.reduce((s, b) => s + (parseFloat(b.toPay) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex flex-col gap-1.5 justify-center sm:items-start lg:items-end">
                        {(fullCompanyDetails.Address1 || fullCompanyDetails.address1) && (
                            <div className="flex items-start gap-2 text-[9px] sm:text-[10px] text-gray-600 font-mono leading-tight">
                                <MapPin size={12} className="shrink-0 text-slate-400 mt-0.5" />
                                <span>{fullCompanyDetails.Address1 || fullCompanyDetails.address1}</span>
                            </div>
                        )}
                        {(fullCompanyDetails.Phone || fullCompanyDetails.phone) && (
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-600 font-mono">
                                <Phone size={12} className="shrink-0 text-slate-400" />
                                <span>{fullCompanyDetails.Phone || fullCompanyDetails.phone}</span>
                            </div>
                        )}
                        {(fullCompanyDetails.Email || fullCompanyDetails.email) && (
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-600 font-mono">
                                <Mail size={12} className="shrink-0 text-slate-400" />
                                <span>{fullCompanyDetails.Email || fullCompanyDetails.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Area */}
                <div className="px-6 sm:px-8 pb-6 flex-1 flex flex-col">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 size={24} className="text-[#0285fd] animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden mb-8 mt-2">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-[#0285fd] text-[10px] sm:text-[11px] font-bold text-white leading-8 sm:leading-10">
                                        {billDetails?.bills && billDetails.bills.length > 0 ? (
                                            <tr>
                                                <th className="px-4 py-1 w-[40%]">Bill / Doc No</th>
                                                <th className="px-4 py-1 w-[15%] text-right">Discount</th>
                                                <th className="px-4 py-1 w-[20%] text-right">Set Offs</th>
                                                <th className="px-4 py-1 w-[25%] text-right">Total</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="px-4 py-1 w-[60%]">Item Description</th>
                                                <th className="px-4 py-1 w-[15%] text-center">Qty</th>
                                                <th className="px-4 py-1 w-[25%] text-right">Total</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {billDetails?.bills && billDetails.bills.length > 0 ? (
                                            billDetails.bills.map((bill, idx) => (
                                                <tr key={idx} className={`text-[11px] sm:text-[12px] font-bold text-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}`}>
                                                    <td className="px-4 py-3 font-mono text-slate-800 align-middle">{String(bill.docNo || 'Unknown').replace(/^,\s*/, '')}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-800 text-right align-middle">{parseFloat(bill.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-800 text-right align-middle">{parseFloat(bill.setOfUse || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-800 text-right align-middle">{parseFloat(bill.toPay || bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))
                                        ) : billDetails?.expenses && billDetails.expenses.length > 0 ? (
                                            billDetails.expenses.map((exp, idx) => (
                                                <tr key={idx} className={`text-[11px] sm:text-[12px] font-bold text-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}`}>
                                                    <td className="px-4 py-3 font-mono text-slate-800 align-middle">{String(exp.memo || exp.accCode || exp.acc_Code || 'Item').replace(/^,\s*/, '')}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-800 text-center align-middle">1</td>
                                                    <td className="px-4 py-3 font-mono text-slate-800 text-right align-middle">{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="bg-white text-[11px] sm:text-[12px] font-bold text-gray-700">
                                                <td className="px-4 py-3 font-mono text-slate-800 align-middle">{String(selectedTx.category || 'Payment').replace(/^,\s*/, '')}</td>
                                                <td className="px-4 py-3 font-mono text-slate-800 text-center align-middle">1</td>
                                                <td className="px-4 py-3 font-mono text-slate-800 text-right align-middle">{parseFloat(selectedTx.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Footer Bottom Block */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-auto">
                                {/* Left side: Payment Method & User */}
                                <div>
                                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 mb-2">Payment Details</div>
                                    <div className="mb-3">
                                        <div className="text-[11px] sm:text-[12px] font-bold text-slate-700 italic">{selectedTx.payType || selectedTx.paymentMethod || billDetails?.payType || 'Payment'}</div>
                                        <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono">Ref: {selectedTx.chqNo || selectedTx.reference || billDetails?.chqNo || '---'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 mb-1">Processed By</div>
                                        <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono">{selectedTx.createUser || userName || 'System'} • {selectedTx.accId || billDetails?.accId || 'Default Acc'}</div>
                                    </div>
                                    {(selectedTx.memo || billDetails?.memo) && (
                                        <div className="mt-3 text-[10px] text-gray-500 font-mono italic">
                                            {selectedTx.memo || billDetails?.memo}
                                        </div>
                                    )}
                                </div>

                                {/* Right side: Totals */}
                                <div className="flex flex-col justify-end ml-auto w-full sm:w-[250px]">
                                    <div className="space-y-2 mb-3 px-2 sm:px-4">
                                        {billDetails?.bills && billDetails.bills.length > 0 && (
                                            <>
                                                <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-700">
                                                    <span>Total Discount:</span>
                                                    <span className="font-mono text-slate-600">{billDetails.bills.reduce((sum, b) => sum + (parseFloat(b.discount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-700">
                                                    <span>Total Set Offs:</span>
                                                    <span className="font-mono text-slate-600">{billDetails.bills.reduce((sum, b) => sum + (parseFloat(b.setOfUse) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-700">
                                            <span>Sub Total:</span>
                                            <span className="font-mono text-slate-600">{parseFloat(selectedTx.total || billDetails?.bills?.reduce((s, b) => s + (parseFloat(b.toPay) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#0285fd] text-white px-2 sm:px-4 py-2.5 flex justify-between items-center rounded-[3px]">
                                        <span className="text-[11px] sm:text-[12px] font-bold">Grand Total</span>
                                        <span className="text-[13px] sm:text-[14px] font-bold font-mono tracking-tighter">LKR {parseFloat(selectedTx.total || billDetails?.bills?.reduce((s, b) => s + (parseFloat(b.toPay) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
              </div>
            </div>
         </div>
      </div>
    );

    return createPortal(modalContent, document.body);
};

export default TransactionReceiptModal;
