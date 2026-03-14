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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[300px] bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-[#0078d4]" />
                        <span className="text-xs font-bold text-gray-700">System Reports Center</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                    >
                        <X size={12} className="group-hover:stroke-white" />
                    </button>
                </div>

                {/* Menu Content */}
                <div className="p-1 bg-white m-1 border border-gray-300 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
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
                <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-medium">{menuItems.length} Items</span>
                    <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Analytics</span>
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;
