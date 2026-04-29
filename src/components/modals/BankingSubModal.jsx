import React from 'react';
import { X, Landmark, ArrowRightLeft, RefreshCw, Ban, Reply, Printer, Hash, PenTool, ClipboardCheck, Clock } from 'lucide-react';

const BankingSubModal = ({ isOpen, onClose, onOpenCollectionDeposit, onOpenDirectBankTransaction, onOpenFundsTransfer, onOpenBankReconciliation, onOpenChequeCancel, onOpenCustomerChequeReturn, onOpenChequePrint, onOpenChequeBookEntry, onOpenWriteCheque, onOpenChequeInHand, onOpenNotPresented }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Landmark, label: 'Make Deposits', action: onOpenCollectionDeposit },
        { icon: Landmark, label: 'Direct Bank Transaction', action: onOpenDirectBankTransaction },
        { icon: ArrowRightLeft, label: 'Transfer Funds', action: onOpenFundsTransfer },
        { icon: RefreshCw, label: 'Reconcile', action: onOpenBankReconciliation },
        { icon: Ban, label: 'Cheque Cancel', action: onOpenChequeCancel },
        { icon: Reply, label: 'Customer Cheque Return', action: onOpenCustomerChequeReturn },
        { icon: Printer, label: 'Cheque Printing', action: onOpenChequePrint },
        { icon: Hash, label: 'Enter Cheque Book Number', action: onOpenChequeBookEntry },
        { icon: PenTool, label: 'Cheque Writing', action: onOpenWriteCheque },
        { type: 'separator' },
        { icon: ClipboardCheck, label: 'Cheque In Hand', action: onOpenChequeInHand },
        { icon: Clock, label: 'Not Presented Cheques', action: onOpenNotPresented },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative w-full max-w-[280px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                    />
                    <div className="flex items-center gap-2">
                        <Landmark size={14} className="text-[#0078d4]" />
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Banking Center</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
                        if (item.type === 'separator') {
                            return <div key={idx} className="my-1.5 h-[1px] bg-gray-200 mx-2" />;
                        }

                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.action) {
                                        item.action();
                                        onClose();
                                    }
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={16} className={`text-gray-500 group-hover:text-white transition-colors`} />
                                    <span className={`text-[14px] font-bold text-gray-700 group-hover:text-white transition-colors`}>
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic font-sans">Cash Management</span>
                </div>
            </div>
        </div>
    );
};

const ChevronRight = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

export default BankingSubModal;
