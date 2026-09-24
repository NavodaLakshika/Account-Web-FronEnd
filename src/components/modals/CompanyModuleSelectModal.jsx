import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, 
    Briefcase, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    X, 
    Info, 
    ShieldCheck, 
    Check,
    Boxes,
    Layers
} from 'lucide-react';

const MAIN_ACCOUNTS = [
    { code: '10000', name: 'Assets', type: 'Asset', isCostOfSales: false },
    { code: '20000', name: 'Liabilities', type: 'Liability', isCostOfSales: false },
    { code: '30000', name: 'Equity', type: 'Equity', isCostOfSales: false },
    { code: '40000', name: 'Income', type: 'Revenue', isCostOfSales: false },
    { code: '50000', name: 'Cost of Sales', type: 'Direct Cost', isCostOfSales: true },
    { code: '60000', name: 'Expenses', type: 'Expense', isCostOfSales: false },
    { code: '70000', name: 'Other Income', type: 'Revenue', isCostOfSales: false },
    { code: '80000', name: 'Other Expenses', type: 'Expense', isCostOfSales: false }
];

const CompanyModuleSelectModal = ({ 
    isOpen, 
    onClose, 
    onBack, 
    onConfirm, 
    initialModule = 'Sales' 
}) => {
    const [selectedModule, setSelectedModule] = useState(initialModule || 'Sales');

    useEffect(() => {
        if (isOpen) {
            setSelectedModule(initialModule || 'Sales');
        }
    }, [isOpen, initialModule]);

    if (!isOpen) return null;

    const visibleAccounts = MAIN_ACCOUNTS.filter(acc => {
        if (selectedModule === 'Service' && acc.isCostOfSales) {
            return false;
        }
        return true;
    });

    const handleContinue = () => {
        onConfirm(selectedModule);
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center font-['Arial'] overflow-y-auto">
            {/* Backdrop with soft blur */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={onClose}
            />

            {/* Full-width Modal Strip Centered on Page */}
            <div className="relative w-full z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-y border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
                
                {/* Content Container spanning the wide view */}
                <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-7 relative">
                    
                    {/* Dismiss X Button Top Right */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-6 sm:right-10 text-slate-400 hover:text-slate-600 p-1.5 transition-colors rounded-[3px] hover:bg-slate-100"
                        title="Close"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 pr-12">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-[3px] flex items-center justify-center text-[#00acee] shadow-xs shrink-0">
                            <Boxes size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-tahoma">
                                Select Business Operating Module
                            </h2>
                            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                                Define the operating module for your company accounts before entering profile details.
                            </p>
                        </div>
                    </div>

                    {/* Main Grid: Left (Module Options & Presets) / Right (Configuration Details & Guidelines) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column (5 cols) - Operating Module Selection */}
                        <div className="lg:col-span-5 space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest font-sans">
                                        Operating Module <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-sans">
                                        Select One
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    {/* Sales Module Card */}
                                    <div
                                        onClick={() => setSelectedModule('Sales')}
                                        className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start gap-3 ${
                                            selectedModule === 'Sales'
                                                ? 'border-[#00acee] bg-blue-50/40 ring-1 ring-[#00acee]/30 shadow-xs'
                                                : 'border-slate-300 bg-white hover:border-[#00acee]/60 hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-[3px] flex items-center justify-center shrink-0 transition-colors ${
                                            selectedModule === 'Sales'
                                                ? 'bg-[#00acee] text-white shadow-xs'
                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                            <ShoppingCart size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-800 font-tahoma">Sales Module</span>
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded uppercase tracking-wider">
                                                        Trading &amp; Inventory
                                                    </span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                                    selectedModule === 'Sales'
                                                        ? 'border-[#00acee] bg-[#00acee] text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}>
                                                    {selectedModule === 'Sales' && <Check size={11} strokeWidth={3} />}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                For trading, retail &amp; manufacturing with inventory, Cost of Goods Sold (50000), POs &amp; GRN.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Service Module Card */}
                                    <div
                                        onClick={() => setSelectedModule('Service')}
                                        className={`p-3 rounded-[3px] border cursor-pointer transition-all flex items-start gap-3 ${
                                            selectedModule === 'Service'
                                                ? 'border-[#00acee] bg-blue-50/40 ring-1 ring-[#00acee]/30 shadow-xs'
                                                : 'border-slate-300 bg-white hover:border-[#00acee]/60 hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-[3px] flex items-center justify-center shrink-0 transition-colors ${
                                            selectedModule === 'Service'
                                                ? 'bg-[#00acee] text-white shadow-xs'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                        }`}>
                                            <Briefcase size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-800 font-tahoma">Service Module</span>
                                                    <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold rounded uppercase tracking-wider">
                                                        Services &amp; Consulting
                                                    </span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                                    selectedModule === 'Service'
                                                        ? 'border-[#00acee] bg-[#00acee] text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}>
                                                    {selectedModule === 'Service' && <Check size={11} strokeWidth={3} />}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                For consulting, agencies, legal &amp; IT services without physical merchandise. Cost of Sales (50000) is hidden.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Presets */}
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                                    Quick Presets:
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedModule('Sales')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-[2px] border transition-colors ${
                                            selectedModule === 'Sales'
                                                ? 'bg-blue-50 text-[#00acee] border-[#00acee]'
                                                : 'bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        Sales (Standard)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedModule('Service')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-[2px] border transition-colors ${
                                            selectedModule === 'Service'
                                                ? 'bg-blue-50 text-[#00acee] border-[#00acee]'
                                                : 'bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        Service (No COGS)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (7 cols) - Module Configuration & Model Accounts View */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Module Configuration Details Card */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[3px]">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3">
                                    <ShieldCheck size={16} className="text-[#00acee]" />
                                    <span>Module Configuration</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                        <span className="text-slate-500">Operating Model</span>
                                        <span className="font-bold text-slate-800">{selectedModule} Module</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                        <span className="text-slate-500">Cost of Sales (50000)</span>
                                        <span className={`font-mono font-bold ${selectedModule === 'Service' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {selectedModule === 'Service' ? 'Hidden (Inactive)' : 'Active (Included)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                        <span className="text-slate-500">Database Column</span>
                                        <span className="font-mono font-bold text-[#00acee]">
                                            Acc_Company.Model
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-500">Setup Status</span>
                                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 size={13} /> Active &amp; Ready
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Model Accounts View Card */}
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[3px]">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                                        <Layers size={16} className="text-[#0078d4]" />
                                        <span>Model Accounts ({visibleAccounts.length})</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0078d4] uppercase">
                                        {selectedModule}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 max-h-[145px] overflow-y-auto pr-0.5">
                                    {MAIN_ACCOUNTS.map((acc) => {
                                        const isHidden = selectedModule === 'Service' && acc.isCostOfSales;
                                        return (
                                            <div 
                                                key={acc.code} 
                                                className={`p-1.5 rounded-[2px] border text-[11px] flex items-center justify-between transition-all ${
                                                    isHidden 
                                                        ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-60' 
                                                        : 'bg-white border-blue-100/80 shadow-2xs text-slate-700'
                                                }`}
                                            >
                                                <div className="truncate mr-1">
                                                    <span className="font-mono text-[10px] text-slate-400 mr-1">{acc.code}</span>
                                                    <span className={`font-bold text-[11px] ${isHidden ? 'line-through text-slate-400' : 'text-slate-800'}`}>{acc.name}</span>
                                                </div>
                                                <span className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 uppercase tracking-tight ${
                                                    isHidden 
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200/60' 
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                }`}>
                                                    {isHidden ? 'Hidden' : 'Active'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Bar with Step Note and Action Buttons */}
                    <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-center">
                            <Info size={15} className="text-[#00acee] shrink-0" />
                            <span>
                                Selected: <strong className="text-slate-700 font-bold">{selectedModule} Module</strong> ({selectedModule === 'Sales' ? 'Trading & Inventory' : 'Services & Consulting'}). Next step: Fill out company registration, address, and industry details.
                            </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={onBack || onClose}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-[3px] text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                                <ArrowLeft size={15} /> Back
                            </button>
                            <button
                                type="button"
                                onClick={handleContinue}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-[3px] bg-[#00acee] hover:bg-[#0092cc] text-white text-sm font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-[#00acee]/30"
                            >
                                Continue to Create Company <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompanyModuleSelectModal;
