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
                        className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
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
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                                />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={16} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[14px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
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
