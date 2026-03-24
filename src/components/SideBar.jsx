import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Mail, Calculator, Printer, PenLine, Settings, Power, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';

const SideBar = ({ isOpen, onClose, onOpenCalculator, onOpenReminder, onOpenWord, onOpenExcel, onOpenEmail, onOpenNotepad, onOpenPrinter, isTopBarCollapsed }) => {
    const [isFocusMode, setIsFocusMode] = useState(false);

    if (!isOpen) return null;

    return (
        <div className={`fixed right-0 ${isTopBarCollapsed ? 'top-8' : 'top-[120px]'} bottom-9 w-[80px] z-[100] animate-in slide-in-from-right duration-300 ease-out flex flex-col bg-white shadow-[-5px_0_20px_rgba(0,0,0,0.1)] border-l border-gray-200 ${isFocusMode ? 'brightness-[0.98]' : ''}`}>
            {/* 1. Toggle Handle */}
            <button
                onClick={onClose}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-20 bg-white border border-gray-200 border-r-0 rounded-l-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-[-2px_0_5px_rgba(0,0,0,0.05)] group"
            >
                <ChevronLeft size={16} className="text-[#0078d4] group-hover:translate-x-[-1px] transition-transform" />
            </button>

            {/* 3. Icons Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-6 flex flex-col items-center gap-6">

                {/* Office Document Group */}
                <div className="flex flex-col items-center gap-5">
                    <SidebarButton icon={FileText} color="text-blue-600" label="Word" onClick={onOpenWord} />
                    <SidebarButton icon={FileSpreadsheet} color="text-green-600" label="Excel" onClick={onOpenExcel} />
                    <SidebarButton icon={Mail} color="text-[#0078d4]" label="Email" badge="3" onClick={onOpenEmail} />
                </div>

                {/* Separator */}
                <div className="w-10 h-[1px] bg-gray-100" />

                {/* Utility Group */}
                <div className="flex flex-col items-center gap-5">
                    <SidebarButton icon={Calculator} color="text-gray-600" label="Calc" onClick={onOpenCalculator} />
                    <SidebarButton icon={PenLine} color="text-gray-600" label="Note" onClick={onOpenNotepad} />
                    <SidebarButton icon={Printer} color="text-gray-600" label="Print" onClick={onOpenPrinter} />
                </div>

                {/* Focus Mode Switch (Minimalist) */}
                {/* <div className="mt-4 flex flex-col items-center gap-1.5 pt-4 border-t border-gray-100 w-full">
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`w-8 h-4 rounded-full transition-all relative ${isFocusMode ? 'bg-[#0078d4]' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isFocusMode ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Focus</span>
                </div> */}
            </div>

            {/* 4. Bottom Actions */}
            <div className="p-4 border-t border-gray-100 flex flex-col items-center gap-4 bg-gray-50/50">
                <button className="text-gray-400 hover:text-[#0078d4] transition-colors group">
                    <ShieldCheck size={20} className="group-active:scale-90 transition-transform" />
                </button>
                <button className="text-gray-400 hover:text-[#0078d4] transition-colors">
                    <Settings size={20} />
                </button>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-red-100 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm active:scale-95 group"
                >
                    <Power size={18} />
                </button>
            </div>
        </div>
    );
};

// Clean Sidebar Button Component
const SidebarButton = ({ icon: Icon, color, label, onClick, badge }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center gap-1.5"
    >
        <div className="w-11 h-11 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md hover:border-[#0078d4]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />

            {badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300">
                    {badge}
                </div>
            )}
        </div>
        <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#0078d4] uppercase tracking-tighter transition-colors">
            {label}
        </span>
    </button>
);

export default SideBar;
