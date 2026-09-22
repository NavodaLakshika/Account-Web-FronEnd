import React from 'react';
import { X, PieChart, Plus, List, Landmark, RefreshCcw, TrendingUp, TrendingDown, FileText, Lock } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { showErrorToast } from '../../../utils/toastUtils';

const ChartOfAccountantModal = ({ isOpen, onClose, onCreateNewAccount, onOpenFixedAssets, onOpenLiability, onOpenDepreciation, onOpenFixedTransactions, deniedFunctions = [] }) => {
    if (!isOpen) return null;

    const currentTopBarColor = localStorage.getItem('topBarColor') || '#0285fd';
    const currentUser = authService.getCurrentUser();
    const isSuperAdmin = authService.isSuperAdmin(currentUser);

    const hasPermission = (code) => {
        if (!code) return true;
        if (isSuperAdmin) return true;
        return !deniedFunctions.includes(code);
    };

    const menuItems = [
        { icon: Plus, label: 'Create New Account', onClick: onCreateNewAccount },
        { icon: List, label: 'Fixed Assets Item List', onClick: onOpenFixedAssets },
        { icon: Landmark, label: 'Long Term Liability', onClick: onOpenLiability, locked: !hasPermission('MST_LONG_TERM_LIAB') },
        { icon: RefreshCcw, label: 'Depreciation Procedure', onClick: onOpenDepreciation, locked: !hasPermission('MST_DEPRECIATION') },
        { icon: TrendingUp, label: 'Fixed Transactions', onClick: onOpenFixedTransactions },
        { icon: FileText, label: 'Create Sales Tax ID', locked: !hasPermission('MST_SALES_TAX_ID') },
    ].filter(item => !item.locked);

    return (
        <>
            {/* Modal Container Logic */}
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-white rounded-[3px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    


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
                                    if (item.locked) {
                                        showErrorToast('This feature is restricted by your role permissions.');
                                        return;
                                    }
                                    item.onClick && item.onClick(); 
                                    onClose(); 
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-[3px] transition-all relative overflow-hidden text-left border ${
                                    item.locked 
                                    ? 'opacity-70 cursor-not-allowed bg-slate-50/50 border-slate-100' 
                                    : 'hover:bg-slate-50 group border-transparent hover:border-slate-200'
                                }`}
                            >
                                {/* Hover Indicator Bar */}
                                {!item.locked && (
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: currentTopBarColor || '#0078d4' }}
                                />
                                )}

                                <div className="flex items-center gap-3 relative z-10">
 <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={14} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-slate-600 group-hover:text-[#0078d4] transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    {item.locked && (
                                        <Lock size={14} className="text-slate-400" />
                                    )}
                                    {item.shortcut && (
                                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-widest">
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
