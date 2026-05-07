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
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                
                {/* Floating Modal Container - Completely Transparent & Borderless */}
                <div className="relative w-full max-w-5xl flex flex-col animate-in zoom-in-95 duration-500">
                    
                    {/* Header - Floating Pill with Gap */}
                    <div className="relative mb-12">
                        {/* Independent Close Button - Floating Further Outside */}
                        <button 
                            onClick={onClose} 
                            className="absolute -top-20 -right-20 w-10 h-10 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[14px] shadow-[0_12px_24px_rgba(255,59,48,0.4)] hover:shadow-[0_16px_32px_rgba(255,59,48,0.5)] transition-all active:scale-90 outline-none border-none group z-[300]"
                            title="Close"
                        >
                            <X size={24} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="bg-white px-8 py-6 flex items-center justify-center rounded-[14px] border-b border-gray-100/10 select-none relative overflow-hidden shadow-xl w-full">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            
                            <div className="flex items-center gap-3">
                                <PieChart size={22} className="text-[#0078d4] animate-pulse" />
                                <span className="text-[19px] font-[900] text-slate-900 uppercase tracking-[8px] font-mono truncate ml-2">Chart of Accounts</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Menu Grid - All in one line */}
                    <div className="p-12 flex-1 overflow-y-auto max-h-[80vh] no-scrollbar">
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
                            {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="flex flex-col items-center group">
                                        <button
                                            onClick={item.onClick}
                                            className="w-24 h-24 bg-white rounded-[14px] shadow-lg hover:shadow-2xl hover:-translate-y-3 active:scale-90 transition-all duration-500 flex items-center justify-center relative overflow-hidden"
                                        >
                                            {/* Subtle Gradient Backdrop */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            
                                            <Icon 
                                                size={32} 
                                                strokeWidth={1.5}
                                                className="text-slate-500 group-hover:text-[#0078d4] transition-all duration-500 group-hover:scale-110" 
                                            />

                                            {/* Decorative Corner Glow */}
                                            <div className="absolute -right-6 -top-6 w-12 h-12 bg-[#0078d4]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                                        </button>
                                        
                                        <span className="mt-5 text-[11px] font-[700] uppercase tracking-[0.25em] text-white group-hover:text-white/80 text-center leading-tight transition-all duration-300 font-['Inter',sans-serif]">
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChartOfAccountantModal;
