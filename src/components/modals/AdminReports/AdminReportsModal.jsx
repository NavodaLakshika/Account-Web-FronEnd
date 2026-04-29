import React from 'react';
import { X, ChevronRight, BarChart3, ShieldAlert, FileText, ClipboardList, History, Trash2 } from 'lucide-react';
import StockReportModal from './StockReportModal';
import SystemLogReportModal from './SystemLogReportModal';
import TransactionLogReportModal from './TransactionLogReportModal';
import CancelledTransactionReportModal from './CancelledTransactionReportModal';

const AdminReportsModal = ({ isOpen, onClose }) => {
    const [showStockReport, setShowStockReport] = React.useState(false);
    const [showSystemLogReport, setShowSystemLogReport] = React.useState(false);
    const [showTransactionLogReport, setShowTransactionLogReport] = React.useState(false);
    const [showCancelledReport, setShowCancelledReport] = React.useState(false);

    if (!isOpen) return null;

    const menuItems = [
        { icon: ClipboardList, label: 'Stock report', action: 'stock' },
        { icon: History, label: 'System Log Report', action: 'systemLog' },
        { icon: FileText, label: 'Transaction Log Report', action: 'transactionLog' },
        { icon: Trash2, label: 'Cancelled Transaction Report', color: 'text-red-500', action: 'cancelled' },
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-5 duration-300">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                    />
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={14} className="text-[#0078d4]" />
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Admin Reports Center</span>
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
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item.action === 'stock') setShowStockReport(true);
                                    if (item.action === 'systemLog') setShowSystemLogReport(true);
                                    if (item.action === 'transactionLog') setShowTransactionLogReport(true);
                                    if (item.action === 'cancelled') setShowCancelledReport(true);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                                />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={16} className={`${item.color || 'text-slate-500 group-hover:text-[#0078d4]'} transition-colors`} />
                                    </div>
                                    <span className={`text-[14px] font-bold ${item.color || 'text-slate-700'} group-hover:text-slate-900 transition-colors`}>
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Style Decoration */}
                <div className="bg-slate-50 py-3 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center italic">
                        Secured Administrative Records Hub
                    </span>
                </div>
            </div>

            <StockReportModal 
                isOpen={showStockReport} 
                onClose={() => setShowStockReport(false)} 
            />

            <SystemLogReportModal 
                isOpen={showSystemLogReport} 
                onClose={() => setShowSystemLogReport(false)} 
            />

            <TransactionLogReportModal 
                isOpen={showTransactionLogReport} 
                onClose={() => setShowTransactionLogReport(false)} 
            />

            <CancelledTransactionReportModal 
                isOpen={showCancelledReport} 
                onClose={() => setShowCancelledReport(false)} 
            />
        </div>
    );
};

export default AdminReportsModal;
