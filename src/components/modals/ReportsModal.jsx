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
            <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                    />
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[#0078d4]" />
                        <span className="text-lg font-bold text-slate-800 tracking-tight">System Reports Hub</span>
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
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                                />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <Icon size={16} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                                
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all relative z-10" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;
