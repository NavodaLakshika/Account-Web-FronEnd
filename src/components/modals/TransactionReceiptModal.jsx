import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Loader2, FileText, Download } from 'lucide-react';
import SimpleModal from '../SimpleModal';
import { enterBillService } from '../../services/enterBill.service';
import { getSessionData } from '../../utils/session';
import { showErrorToast } from '../../utils/toastUtils';
import html2pdf from 'html2pdf.js';

const TransactionReceiptModal = ({ selectedTx, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [billDetails, setBillDetails] = useState(null);
  const receiptRef = useRef(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const session = getSessionData();
  const companyName = session?.companyName || 'ONIMTA INFORMATION TECHNOLOGY';
  const userName = session?.username || 'System Admin';

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

  return (
      <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-[2px] transition-opacity p-4">
          <div className="relative w-full max-w-[480px] flex flex-col items-center drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200 receipt-printable print:bg-white print:shadow-none mt-12">
            {/* Action Buttons */}
            <div className="absolute -top-12 right-0 flex gap-3 print:hidden">
                <button onClick={handleDownloadPdf} disabled={isPdfGenerating} className={`text-white hover:text-blue-200 p-2 transition-colors bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`} title="Download PDF">
                    {isPdfGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                </button>
                <button onClick={() => window.print()} className="text-white hover:text-blue-200 p-2 transition-colors bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md" title="Print Receipt">
                    <Printer size={20} />
                </button>
                <button onClick={onClose} className="text-white hover:text-red-200 p-2 transition-colors bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md">
                    <X size={22} />
                </button>
            </div>

            {/* Main Receipt Body */}
            <div ref={receiptRef} className="w-full bg-gradient-to-b from-white to-[#f4f6f9] pt-8 pb-10 px-10 relative overflow-hidden min-h-[550px]" 
                 style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.02)' }}>
              
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-[20px] font-mono tracking-[0.25em] text-[#5a677a] mb-1">{selectedTx.type}</h2>
                <div className="text-[12px] font-black text-[#2d3748] uppercase tracking-widest leading-tight">{companyName}</div>
                <div className="text-[9px] font-mono text-[#829ab1] uppercase mt-1 tracking-wider">Transaction Details</div>
              </div>
              
              <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-4 text-xs overflow-hidden whitespace-nowrap opacity-60">
                  ***********************************
              </div>
              
              {loading ? (
                  <div className="flex justify-center items-center py-6">
                      <Loader2 size={20} className="text-blue-500 animate-spin" />
                  </div>
              ) : (
                  <>
                      {/* Info */}
                      <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                          <span className="uppercase tracking-wider shrink-0">Payee</span>
                          <span className="text-right ml-2 break-all">{selectedTx.payee || selectedTx.category || '---'}</span>
                      </div>
                      <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                          <span className="uppercase tracking-wider">Doc No</span>
                          <span className="text-right">{selectedTx.docNo}</span>
                      </div>

                      {billDetails?.header?.customerCode && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Cust Code</span>
                              <span className="text-right">{billDetails.header.customerCode}</span>
                          </div>
                      )}
                      
                      {(billDetails?.header?.ref_No || billDetails?.header?.refNo) && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Ref No</span>
                              <span className="text-right">{billDetails.header.ref_No || billDetails.header.refNo}</span>
                          </div>
                      )}
                      {(billDetails?.header?.bill_No || billDetails?.header?.billNo) && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Bill No</span>
                              <span className="text-right">{billDetails.header.bill_No || billDetails.header.billNo}</span>
                          </div>
                      )}
                      {billDetails?.header?.terms && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Terms</span>
                              <span className="text-right">{billDetails.header.terms}</span>
                          </div>
                      )}
                      {(billDetails?.header?.post_Date || billDetails?.header?.postDate) && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Post Date</span>
                              <span className="text-right">{(billDetails.header.post_Date || billDetails.header.postDate).split('T')[0]}</span>
                          </div>
                      )}
                      {(billDetails?.header?.bill_Due_Date || billDetails?.header?.billDueDate) && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Due Date</span>
                              <span className="text-right">{(billDetails.header.bill_Due_Date || billDetails.header.billDueDate).split('T')[0]}</span>
                          </div>
                      )}
                      {billDetails?.header?.memo && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Memo</span>
                              <span className="text-right break-words max-w-[150px]">{billDetails.header.memo}</span>
                          </div>
                      )}
                      {billDetails?.header?.payType && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Pay Mode</span>
                              <span className="text-right">{billDetails.header.payType}</span>
                          </div>
                      )}
                      {billDetails?.header?.bank && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Bank</span>
                              <span className="text-right break-words max-w-[150px]">{billDetails.header.bank}</span>
                          </div>
                      )}
                      {billDetails?.header?.branch && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Branch</span>
                              <span className="text-right break-words max-w-[150px]">{billDetails.header.branch}</span>
                          </div>
                      )}
                      {billDetails?.header?.chequeNo && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Cheque No</span>
                              <span className="text-right">{billDetails.header.chequeNo}</span>
                          </div>
                      )}
                      {billDetails?.header?.chequeDate && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Cheque Date</span>
                              <span className="text-right">{billDetails.header.chequeDate.split('T')[0]}</span>
                          </div>
                      )}
                      {(billDetails?.header?.costCenter || billDetails?.header?.cost_Center) && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Cost Center</span>
                              <span className="text-right break-words max-w-[150px]">{billDetails.header.costCenter || billDetails.header.cost_Center}</span>
                          </div>
                      )}
                      {billDetails?.header?.grossAmount && (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Gross Amt</span>
                              <span className="text-right">{billDetails.header.grossAmount}</span>
                          </div>
                      )}
                      {billDetails?.header?.discountAmount && parseFloat(billDetails.header.discountAmount) > 0 ? (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Discount</span>
                              <span className="text-right">{billDetails.header.discountAmount}</span>
                          </div>
                      ) : null}
                      {billDetails?.header?.setOff && parseFloat(billDetails.header.setOff) > 0 ? (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Debit SetOff</span>
                              <span className="text-right">{billDetails.header.setOff}</span>
                          </div>
                      ) : null}
                      {billDetails?.header?.overPayment && parseFloat(billDetails.header.overPayment) > 0 ? (
                          <div className="w-full flex justify-between font-mono text-[#4a5568] mb-1.5 text-[12px]">
                              <span className="uppercase tracking-wider">Over Payment</span>
                              <span className="text-right">{billDetails.header.overPayment}</span>
                          </div>
                      ) : null}

                      <div className="w-full flex justify-between font-mono text-[#4a5568] mb-4 text-[12px]">
                          <span className="uppercase tracking-wider">Status</span>
                          <span className="text-right uppercase">{selectedTx.status || 'RECORDED'}</span>
                      </div>

                      {billDetails && billDetails.expenses && billDetails.expenses.length > 0 && (
                          <div className="w-full mb-4">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pb-1 border-b border-dashed border-[#cbd5e0]">Line Items</div>
                              {billDetails.expenses.map((exp, idx) => (
                                  <div key={idx} className="flex flex-col mb-2 leading-normal">
                                      <div className="flex justify-between font-mono text-[11px] text-[#4a5568]">
                                          <span className="break-words max-w-[180px] uppercase py-0.5">{exp.accCode || exp.acc_Code}</span>
                                          <span className="py-0.5">{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                      {exp.memo && <span className="font-mono text-[9px] text-[#829ab1] italic break-words mt-0.5 leading-snug">{exp.memo}</span>}
                                      {(exp.costCenter || exp.cost_Center) && <span className="font-mono text-[9px] text-[#829ab1] break-words mt-0.5 leading-snug">CC: {exp.costCenter || exp.cost_Center}</span>}
                                  </div>
                              ))}
                          </div>
                      )}
                      
                      {/* Divider */}
                      <div className="w-full border-t-[2px] border-dashed border-[#cbd5e0] mb-3 opacity-70"></div>
                      
                      {/* Total */}
                      <div className="w-full flex justify-between items-end font-mono text-[#2d3748] mb-4">
                          <span className="text-[14px] tracking-wider uppercase">Total</span>
                          <span className="text-[18px] font-bold">
                              {(selectedTx?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                      </div>
                  </>
              )}
              
              {/* Date */}
              <div className="w-full flex justify-between font-mono text-[#829ab1] text-[11px] mb-3">
                  <span className="uppercase tracking-wider">Date</span>
                  <span>{selectedTx?.date ? selectedTx.date.split('T')[0].split('-').reverse().join('.') : '---'}</span>
              </div>
              
              <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-2 text-xs overflow-hidden whitespace-nowrap opacity-60">
                  ***********************************
              </div>

              <div className="w-full flex justify-between font-mono text-[#829ab1] text-[9px] mb-2">
                  <span>REF: {selectedTx.docNo}</span>
                  <span>TYPE: {selectedTx.type.split(' ')[0]}</span>
              </div>
              <div className="w-full flex justify-center font-mono text-[#829ab1] text-[8px] mt-4 opacity-70">
                  <span>SERVED BY: {userName.toUpperCase()}</span>
              </div>
            </div>

            {/* Scalloped Bottom Edge */}
            <div className="w-full h-[12px] shrink-0" style={{
                background: 'radial-gradient(circle at 50% 0, #f4f6f9 6px, transparent 6.5px) repeat-x',
                backgroundSize: '12px 12px',
                marginTop: '-1px'
            }} />

         </div>
      </div>
    );
};

export default TransactionReceiptModal;
