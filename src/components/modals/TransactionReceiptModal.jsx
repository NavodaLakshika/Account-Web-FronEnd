import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Loader2, FileText, Download } from 'lucide-react';
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
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-[2px] transition-opacity p-4 print:p-0 print:bg-white">
          <div className="relative w-full max-w-[700px] flex flex-col bg-white drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200 receipt-printable print:shadow-none min-h-[600px] max-h-[90vh] overflow-y-auto">
            
            {/* Main Receipt Body */}
            <div ref={receiptRef} className="w-full bg-white pt-12 pb-12 px-12 relative flex-1 flex flex-col print:pt-0 print:px-0">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                  <div>
                      <div className="font-bold text-[16px] text-slate-800 uppercase tracking-widest">{companyName}</div>
                      {(fullCompanyDetails.Address1 || fullCompanyDetails.address1 || fullCompanyDetails.Phone || fullCompanyDetails.phone || fullCompanyDetails.Email || fullCompanyDetails.email) ? (
                          <div className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                              {(fullCompanyDetails.Address1 || fullCompanyDetails.address1) && <>{fullCompanyDetails.Address1 || fullCompanyDetails.address1}<br/></>}
                              {(fullCompanyDetails.Phone || fullCompanyDetails.phone) && <>{fullCompanyDetails.Phone || fullCompanyDetails.phone}<br/></>}
                              {(fullCompanyDetails.Email || fullCompanyDetails.email) && <>{fullCompanyDetails.Email || fullCompanyDetails.email}</>}
                          </div>
                      ) : (
                          <div className="text-[11px] text-slate-600 mt-2 leading-relaxed opacity-50 italic">
                              Contact details unavailable
                          </div>
                      )}
                  </div>
                  <div className="text-right">
                      <h1 className="text-[36px] font-bold text-[#0066cc] mb-6">Receipt</h1>
                      <div className="flex text-[11px] font-bold text-slate-800 mb-2">
                          <div className="w-[120px] text-center">Receipt Number</div>
                          <div className="w-[120px] text-center">Receipt Date</div>
                      </div>
                      <div className="flex text-[11px] text-slate-600 border-t-2 border-slate-100 pt-2">
                          <div className="w-[120px] text-center">{selectedTx.docNo}</div>
                          <div className="w-[120px] text-center">{selectedTx?.date ? selectedTx.date.split('T')[0] : '---'}</div>
                      </div>
                  </div>
              </div>

              {/* To Section */}
              <div className="mb-8">
                  <div className="font-bold text-[12px] text-slate-800 mb-1.5">To</div>
                  <div className="text-[11px] text-slate-800">
                      <span className="font-bold">Name:</span> {selectedTx.payee || selectedTx.category || '---'}
                  </div>
                  {billDetails?.header?.address && (
                      <div className="text-[11px] text-slate-800 mt-0.5">
                          <span className="font-bold">Address:</span> {billDetails.header.address}
                      </div>
                  )}
              </div>
              
              {loading ? (
                  <div className="flex justify-center items-center py-10">
                      <Loader2 size={24} className="text-blue-500 animate-spin" />
                  </div>
              ) : (
                  <>
                      {/* Table */}
                      <table className="w-full text-left text-[11px] mb-8 border-collapse">
                          <thead>
                              <tr className="text-[#0066cc] font-bold border-t-2 border-b-2 border-slate-100">
                                  <th className="py-3 px-2 w-[15%] text-center">Item#</th>
                                  <th className="py-3 px-2 w-[45%]">Item Description</th>
                                  <th className="py-3 px-2 w-[20%] text-center">Quantity</th>
                                  <th className="py-3 px-2 w-[20%] text-center bg-[#f5f8fc]">Total Amount Due</th>
                              </tr>
                          </thead>
                          <tbody>
                              {billDetails && billDetails.expenses && billDetails.expenses.length > 0 ? (
                                  billDetails.expenses.map((exp, idx) => (
                                      <tr key={idx} className="border-b border-slate-50">
                                          <td className="py-3 px-2 text-center">{idx + 1}</td>
                                          <td className="py-3 px-2">{exp.memo || exp.accCode || exp.acc_Code || 'Item'}</td>
                                          <td className="py-3 px-2 text-center">1</td>
                                          <td className="py-3 px-2 text-center">LKR {parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      </tr>
                                  ))
                              ) : (
                                  <tr className="border-b border-slate-50">
                                      <td className="py-3 px-2 text-center">1</td>
                                      <td className="py-3 px-2">{selectedTx.category || 'Payment'}</td>
                                      <td className="py-3 px-2 text-center">1</td>
                                      <td className="py-3 px-2 text-center">LKR {(selectedTx.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>

                      {/* Totals Section */}
                      <div className="flex justify-end mb-12">
                          <div className="w-[45%] bg-[#0066cc] text-white text-[11px] p-4">
                              <div className="flex justify-between py-1.5">
                                  <span>Subtotal</span>
                                  <span>LKR {(selectedTx.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between py-1.5">
                                  <span>Less: Amount Received</span>
                                  <span>LKR 0.00</span>
                              </div>
                              <div className="flex justify-between py-1.5 font-bold border-t border-white/20 mt-1.5 pt-2.5">
                                  <span>Total Balance Due</span>
                                  <span>LKR {(selectedTx.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                          </div>
                      </div>
                  </>
              )}
              
              <div className="text-center text-[10px] text-slate-500 mt-auto font-medium">
                  If you find any variances of this receipt, please report to us immediately. Thank you very much.
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200 print:hidden shrink-0">
                <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                    className={`flex items-center gap-2 px-5 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-bold text-[12px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isPdfGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Download
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2 bg-[#0066cc] text-white hover:bg-[#0052a3] font-bold text-[12px] uppercase tracking-widest rounded-[3px] shadow-sm transition-all active:scale-95"
                >
                    <Printer size={16} />
                    Print
                </button>
                <button
                    onClick={onClose}
                    className="px-5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-[12px] uppercase tracking-widest rounded-[3px] shadow-sm transition-all active:scale-95 ml-2"
                >
                    Close
                </button>
            </div>
         </div>
      </div>
    );

    return createPortal(modalContent, document.body);
};

export default TransactionReceiptModal;
