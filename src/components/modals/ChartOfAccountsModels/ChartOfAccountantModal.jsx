import React from 'react';
import { X, PieChart, Plus, List, Landmark, RefreshCcw, TrendingUp, TrendingDown, FileText } from 'lucide-react';

const ChartOfAccountantModal = ({ isOpen, onClose, onCreateNewAccount, onOpenFixedAssets, onOpenLiability, onOpenDepreciation, onOpenFixedIncome, onOpenFixedExpenses }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: Plus, label: 'Create New Account', onClick: onCreateNewAccount },
        { icon: List, label: 'Fixed Assets Item List', onClick: onOpenFixedAssets },
        { icon: Landmark, label: 'Long Term Liability', onClick: onOpenLiability },
        { icon: RefreshCcw, label: 'Depreciation Procedure', onClick: onOpenDepreciation },
        { icon: TrendingUp, label: 'Fixed Income', onClick: onOpenFixedIncome },
        { icon: TrendingDown, label: 'Fixed Expenses', onClick: onOpenFixedExpenses },
        { icon: FileText, label: 'Create Sales Tax ID' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[320px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                    />
                    <div className="flex items-center gap-2">
                        <PieChart size={16} className="text-[#0078d4]" />
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Chart of Accounts</span>
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
                <div className="p-2 bg-white flex-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 group transition-all text-left"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors border border-gray-100">
                                        <Icon size={14} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[12px] font-mono font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight truncate">
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
            </div>
        </div>
    );
};

export default ChartOfAccountantModal;
