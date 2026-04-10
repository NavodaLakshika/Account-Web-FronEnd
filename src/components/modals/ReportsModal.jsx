import React from 'react';
import { X, ChevronRight, BarChart3, PieChart, Landmark, ClipboardList, UserSquare, Users, ShieldAlert } from 'lucide-react';

const ReportsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const menuItems = [
        { icon: ClipboardList, label: 'Accounting Reports', hasSubmenu: true },
        { icon: Landmark, label: 'Banking Reports', hasSubmenu: true },
        { icon: PieChart, label: 'Finance Management', hasSubmenu: true },
        { icon: UserSquare, label: 'Vender Center Reports', hasSubmenu: true },
        { icon: Users, label: 'Customer Center Reports', hasSubmenu: true },
        { icon: ShieldAlert, label: 'Admin Reports', hasSubmenu: true },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[300px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[#0078d4]" />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">System Reports</span>
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
                <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                    {menuItems.map((item, idx) => {
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
                                
                                <ChevronRight size={14} className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-medium">{menuItems.length} Items</span>
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Analytics</span>
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;
