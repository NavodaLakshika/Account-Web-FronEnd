import React from 'react';
import { X, PieChart, Plus, List, Landmark, RefreshCcw, TrendingUp, TrendingDown, FileText } from 'lucide-react';

const ChartOfAccountantModal = ({ isOpen, onClose, onCreateNewAccount, onOpenFixedAssets, onOpenLiability, onOpenDepreciation, onOpenFixedIncome, onOpenFixedExpenses }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Plus, label: 'Create New Account...', onClick: onCreateNewAccount },
        { icon: List, label: 'Fixed Assets Item List...', onClick: onOpenFixedAssets },
        { icon: Landmark, label: 'Long Term Liability...', onClick: onOpenLiability },
        { icon: RefreshCcw, label: 'Depreciation Procedure...', onClick: onOpenDepreciation },
        { icon: TrendingUp, label: 'Fixed Income...', onClick: onOpenFixedIncome },
        { icon: TrendingDown, label: 'Fixed Expenses...', onClick: onOpenFixedExpenses },
        { icon: FileText, label: 'Create Sales Tax ID...' },
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[280px] bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <PieChart size={14} className="text-[#0078d4]" />
                        <span className="text-xs font-bold text-gray-700">Chart of Accounts</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                    >
                        <X size={12} className="group-hover:stroke-white" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-1 bg-white m-1 border border-gray-300 flex-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
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
                <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-end">
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic font-sans">Account Structure</span>
                </div>
            </div>
        </div>
    );
};

export default ChartOfAccountantModal;
