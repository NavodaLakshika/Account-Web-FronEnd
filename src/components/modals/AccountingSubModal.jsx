import React from 'react';
import { X, Scale, Wallet, Coins, BookOpen, History, Calculator } from 'lucide-react';

const AccountingSubModal = ({ isOpen, onClose, onOpenOpeningBalance, onOpenPettyCash, onOpenMainCash, onOpenJournalEntry, onOpenReversalEntry, onOpenPaymentSetoff }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Scale, label: 'Opening Balance', action: onOpenOpeningBalance },
        { icon: Coins, label: 'Petty Cash Entry', action: onOpenPettyCash },
        { icon: Wallet, label: 'Main Cash', action: onOpenMainCash },
        { icon: BookOpen, label: 'Make General Journal Entries', action: onOpenJournalEntry },
        { type: 'separator' },
        { icon: History, label: 'Reversal Entry Form', action: onOpenReversalEntry },
        { icon: Calculator, label: 'Payment Setoff', action: onOpenPaymentSetoff },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[280px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                    />
                    <div className="flex items-center gap-2">
                        <Calculator size={14} className="text-[#0078d4]" />
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Accounting Center</span>
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
                <div className="p-6 bg-white flex-1 overflow-y-auto no-scrollbar">
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
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic font-sans">General Ledger</span>
                </div>
            </div>
        </div>
    );
};

export default AccountingSubModal;
