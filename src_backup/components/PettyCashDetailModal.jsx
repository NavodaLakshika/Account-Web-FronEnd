import React, { useEffect, useState } from 'react';
import { pettyCashService } from '../services/pettyCash.service';
import { X, Printer } from 'lucide-react';
import { getSessionData } from '../utils/session';

const PettyCashDetailModal = ({ docNo, preloadedData, onClose }) => {
  const [detail, setDetail] = useState(preloadedData || null);
  const [loading, setLoading] = useState(!preloadedData);
  const session = getSessionData() || {};

  useEffect(() => {
    if (preloadedData) return;
    const fetchDetail = async () => {
      try {
        const data = await pettyCashService.getDraft(docNo, session.companyCode);
        setDetail(data);
      } catch (err) {
        console.error("Failed to load petty cash details", err);
      } finally {
        setLoading(false);
      }
    };
    if (docNo) fetchDetail();
  }, [docNo, preloadedData, session.companyCode]);

  if (!docNo && !preloadedData) return null;

  const displayData = detail || preloadedData;
  const header = displayData?.header || displayData;
  const items = displayData?.items || [];
  
  const expenses = items.filter(i => i.detailsType === 'Exp' || i.accCode);
  const purchases = items.filter(i => i.detailsType === 'ItP' || i.prodCode);

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-[#2d3748]/60 backdrop-blur-[2px] transition-opacity p-4 print:bg-white print:p-0">
      {loading && !displayData ? (
        <div className="bg-white p-8 rounded shadow-xl flex items-center justify-center print:hidden">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077c5]"></div>
        </div>
      ) : (
        <div className="relative w-full max-w-[450px] flex flex-col items-center drop-shadow-2xl animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full print:border-none mt-12">
          
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
          <div className="w-full bg-gradient-to-b from-white to-[#f4f6f9] pt-10 pb-6 px-10 relative overflow-hidden print:bg-white print:bg-none rounded-t-md print:rounded-none" 
               style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.02)' }}>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-[22px] font-mono tracking-[0.25em] text-[#5a677a] print:text-black">PETTY CASH VOUCHER</h2>
              <div className="text-[11px] font-mono text-[#829ab1] uppercase mt-1 tracking-wider print:text-black">{session.companyName || 'Accounts Web'}</div>
            </div>
            
            <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-8 text-sm overflow-hidden whitespace-nowrap opacity-60 print:text-black">
                ***********************************
            </div>
            
            {/* Info */}
            <div className="w-full flex justify-between font-mono text-[#4a5568] mb-3 text-[13px] print:text-black">
                <span className="uppercase tracking-wider">Voucher No</span>
                <span className="text-right">{header?.docNo || docNo}</span>
            </div>
            <div className="w-full flex justify-between font-mono text-[#4a5568] mb-3 text-[13px] print:text-black">
                <span className="uppercase tracking-wider">Date</span>
                <span className="text-right">{(header?.date || header?.postDate || new Date().toISOString())?.split('T')[0]}</span>
            </div>
            <div className="w-full flex justify-between items-start font-mono text-[#4a5568] mb-8 text-[13px] print:text-black">
                <span className="uppercase tracking-wider">Payee</span>
                <span className="text-right max-w-[200px] break-words">{header?.payee || header?.vendorId || 'Cash'}</span>
            </div>

            {header?.memo && (
                <div className="w-full mb-6 font-mono text-[12px] text-[#4a5568] print:text-black">
                    <span className="block uppercase tracking-wider mb-1 text-[#829ab1] print:text-black">Memo / Remarks</span>
                    <p className="italic">{header?.memo}</p>
                </div>
            )}

            {/* Line Items */}
            {(expenses.length > 0 || purchases.length > 0) && (
                <div className="w-full mb-6">
                    <div className="w-full border-b-[2px] border-dashed border-[#cbd5e0] mb-3 opacity-70 print:border-black"></div>
                    <span className="block font-mono text-[11px] text-[#829ab1] uppercase tracking-wider mb-2 print:text-black">Details</span>
                    
                    {expenses.length > 0 && (
                        <div className="mb-4">
                            <div className="font-mono text-[10px] text-[#5a677a] uppercase mb-1 font-bold print:text-black">Expenses</div>
                            {expenses.map((exp, idx) => (
                                <div key={idx} className="w-full flex justify-between font-mono text-[#4a5568] text-[12px] mb-1 print:text-black">
                                    <span className="truncate pr-2">{exp.code || exp.accCode} {exp.memo ? `- ${exp.memo}` : ''}</span>
                                    <span className="shrink-0 text-right">{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {purchases.length > 0 && (
                        <div className="mb-2">
                            <div className="font-mono text-[10px] text-[#5a677a] uppercase mb-1 font-bold print:text-black">Items</div>
                            {purchases.map((itm, idx) => (
                                <div key={idx} className="w-full flex justify-between font-mono text-[#4a5568] text-[12px] mb-1 print:text-black">
                                    <span className="truncate pr-2">{itm.code || itm.prodCode} x{itm.qty || 1}</span>
                                    <span className="shrink-0 text-right">{parseFloat((itm.qty || 1) * (itm.cost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Divider */}
            <div className="w-full border-t-[2px] border-dashed border-[#cbd5e0] mb-6 opacity-70 print:border-black"></div>
            
            {/* Total */}
            <div className="w-full flex justify-between items-end font-mono text-[#2d3748] mb-10 print:text-black">
                <span className="text-[16px] tracking-wider uppercase">Paid Amount</span>
                <span className="text-[20px] font-bold">
                    {parseFloat(header?.billAmount || header?.amount || header?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            
            <div className="text-[#a0aec0] font-mono text-center tracking-[0.2em] mb-4 text-sm overflow-hidden whitespace-nowrap opacity-60 print:text-black">
                ***********************************
            </div>

            {/* System Details footer */}
            <div className="w-full flex justify-between font-mono text-[#829ab1] text-[10px] mb-6 print:text-black">
                <span>REF: {header?.docNo || docNo}</span>
                <span>USR: {session.userName || 'ADMIN'}</span>
            </div>
            
            <div className="w-full flex justify-between font-mono text-[#5a677a] tracking-widest text-[13px] mb-2 uppercase print:text-black border-t border-b border-[#cbd5e0] py-4 print:border-black mt-8">
                <div className="flex flex-col items-center">
                    <div className="border-t border-[#829ab1] w-24 mb-1 pt-1 text-[10px] text-center print:border-black">Prepared By</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-[#829ab1] w-24 mb-1 pt-1 text-[10px] text-center print:border-black">Authorized By</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t border-[#829ab1] w-24 mb-1 pt-1 text-[10px] text-center print:border-black">Received By</div>
                </div>
            </div>
          </div>

          {/* Scalloped Bottom Edge */}
          <div className="w-full h-[12px] shrink-0 print:hidden" style={{
              background: 'radial-gradient(circle at 50% 0, #f4f6f9 6px, transparent 6.5px) repeat-x',
              backgroundSize: '12px 12px',
              marginTop: '-1px'
          }} />
        </div>
      )}
    </div>
  );
};

export default PettyCashDetailModal;
