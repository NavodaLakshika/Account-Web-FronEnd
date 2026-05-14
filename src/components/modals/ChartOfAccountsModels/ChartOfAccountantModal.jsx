import React from 'react';
import { X, PieChart, Plus, List, Landmark, RefreshCcw, TrendingUp, TrendingDown, FileText } from 'lucide-react';

const ChartOfAccountantModal = ({ isOpen, onClose, onCreateNewAccount, onOpenFixedAssets, onOpenLiability, onOpenDepreciation, onOpenFixedIncome, onOpenFixedExpenses }) => {
    if (!isOpen) return null;

    const currentTopBarColor = localStorage.getItem('topBarColor') || '#0285fd';

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
        <>
            {/* Modal Container Logic */}
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        {/* System Color Left Accent */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                            style={{ backgroundColor: currentTopBarColor }}
                        />
                        
                        <div className="flex items-center gap-2">
                            <PieChart size={14} className="text-[#0078d4]" />
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
                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
                        if (item.type === 'separator') {
                            return <div key={idx} className="my-1.5 h-[1px] bg-gray-200 mx-2" />;
                        }

                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: currentTopBarColor || '#0078d4' }}
                                />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={16} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[14px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    {item.shortcut && (
                                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {item.shortcut}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                    </div>              
                </div>
            </div>
        </>
    );
};

export default ChartOfAccountantModal;
