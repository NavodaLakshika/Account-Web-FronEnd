import React from 'react';
import { X, Landmark, ArrowRightLeft, RefreshCw, Ban, Reply, Printer, Hash, PenTool, ClipboardCheck, Clock } from 'lucide-react';

const BankingSubModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Landmark, label: 'Make Deposits' },
        { icon: Landmark, label: 'Direct Bank Transaction' },
        { icon: ArrowRightLeft, label: 'Transfer Funds' },
        { icon: RefreshCw, label: 'Reconcile' },
        { icon: Ban, label: 'Cheque Cancel' },
        { icon: Reply, label: 'Customer Cheque Return' },
        { icon: Printer, label: 'Cheque Printing' },
        { icon: Hash, label: 'Enter Cheque Book Number' },
        { icon: PenTool, label: 'Cheque Writing' },
        { type: 'separator' },
        { icon: ClipboardCheck, label: 'Cheque In Hand' },
        { icon: Clock, label: 'Not Precented Cheques' },
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[280px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none">
                    <div className="flex items-center gap-2">
                        <Landmark size={14} className="text-[#0078d4]" />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">Banking Center</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full group outline-none"
                    >
                        <X size={12} className="group-hover:stroke-white" />
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
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={16} className={`text-gray-500 group-hover:text-white transition-colors`} />
                                    <span className={`text-[13px] font-medium text-gray-700 group-hover:text-white transition-colors`}>
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

export default BankingSubModal;
