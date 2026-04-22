import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Mail, Calculator, Printer, PenLine, Settings, Power, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';

const SideBar = ({ isOpen, onClose, onOpenCalculator, onOpenReminder, onOpenWord, onOpenExcel, onOpenEmail, onOpenNotepad, onOpenPrinter, isTopBarCollapsed }) => {
    const [isFocusMode, setIsFocusMode] = useState(false);

    if (!isOpen) return null;

    return (
        <div className={`fixed right-0 ${isTopBarCollapsed ? 'top-12' : 'top-[155px]'} bottom-12 w-[85px] z-[100] animate-in slide-in-from-right duration-500 ease-out flex flex-col bg-white/80 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.08)] border-l border-white/40 ${isFocusMode ? 'brightness-[0.98]' : ''}`}>
            {/* 1. Toggle Handle - Modernized */}
            <button
                onClick={onClose}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-24 bg-white/90 backdrop-blur-md border border-white/50 border-r-0 rounded-l-2xl flex items-center justify-center hover:bg-white transition-all shadow-[-4px_0_15px_rgba(0,0,0,0.05)] group active:scale-90"
            >
                <ChevronLeft size={18} className="text-[#0078d4] group-hover:translate-x-[-2px] transition-transform" />
            </button>

            {/* 3. Icons Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-8 flex flex-col items-center gap-8">

                {/* Office Document Group */}
                <div className="flex flex-col items-center gap-6">
                    <SidebarButton icon={FileText} color="text-blue-600" label="Word" onClick={onOpenWord} />
                    <SidebarButton icon={FileSpreadsheet} color="text-green-600" label="Excel" onClick={onOpenExcel} />
                    <SidebarButton icon={Mail} color="text-[#0078d4]" label="Email" badge="3" onClick={onOpenEmail} />
                </div>

                {/* Glassy Separator */}
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />

                {/* Utility Group */}
                <div className="flex flex-col items-center gap-6">
                    <SidebarButton icon={Calculator} color="text-slate-600" label="Calc" onClick={onOpenCalculator} />
                    <SidebarButton icon={PenLine} color="text-slate-600" label="Note" onClick={onOpenNotepad} />
                    <SidebarButton icon={Printer} color="text-slate-600" label="Print" onClick={onOpenPrinter} />
                </div>
            </div>

            {/* 4. Bottom Actions - Premium Group */}
            <div className="p-5 border-t border-white/30 flex flex-col items-center gap-5 bg-white/10">
                <div className="flex gap-4">
                    <button className="text-slate-400 hover:text-[#0078d4] transition-all hover:scale-110 active:scale-90">
                        <ShieldCheck size={20} />
                    </button>
                    <button className="text-slate-400 hover:text-[#0078d4] transition-all hover:scale-110 active:scale-90">
                        <Settings size={20} />
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-red-50 rounded-xl text-[#ef1022] hover:bg-red-50 hover:text-red-600 transition-all shadow-[0_4px_12px_rgba(239,16,34,0.1)] hover:shadow-[0_6px_20px_rgba(239,16,34,0.2)] active:scale-95 group"
                    title="System Logout"
                >
                    <Power size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// Clean Sidebar Button Component
const SidebarButton = ({ icon: Icon, color, label, onClick, badge }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center gap-2"
    >
        <div className="w-12 h-12 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-xl hover:bg-white hover:border-[#0078d4]/40 hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <Icon size={22} className={`${color} group-hover:scale-110 transition-transform drop-shadow-sm`} />

            {badge && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#ef1022] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in duration-500">
                    {badge}
                </div>
            )}
        </div>
        <span className="text-[9px] font-extrabold text-slate-500 group-hover:text-slate-900 uppercase tracking-wider transition-colors">
            {label}
        </span>
    </button>
);

export default SideBar;
