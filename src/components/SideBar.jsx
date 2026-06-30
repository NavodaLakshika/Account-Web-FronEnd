import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Mail, Calculator, Printer, PenLine, Settings, Power, ChevronLeft, ShieldCheck, Zap, Bell } from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const SidebarButton = ({ icon: Icon, color, label, onClick, badge }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center gap-1.5"
    >
        <div className="w-12 h-12 bg-white rounded-[3px] flex items-center justify-center shadow-sm border border-slate-200/60 hover:border-[#4f83ff]/30 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
            {badge && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    {badge}
                </div>
            )}
        </div>
        <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-700 uppercase tracking-widest transition-colors">
            {label}
        </span>
    </button>
);

const SideBar = ({ isOpen, onClose, onOpenCalculator, onOpenReminder, onOpenWord, onOpenExcel, onOpenEmail, onOpenNotepad, onOpenPrinter, isTopBarCollapsed }) => {
    const [isFocusMode, setIsFocusMode] = useState(false);

    if (!isOpen) return null;

    return (
        <div className={`fixed right-0 ${isTopBarCollapsed ? 'top-12' : 'top-[155px]'} bottom-0 w-[90px] z-[100] animate-in slide-in-from-right duration-500 ease-out flex flex-col bg-white/95 backdrop-blur-xl shadow-[-8px_0_25px_rgba(0,0,0,0.06)] border-l border-slate-200/40`}>
            {/* Top Accent Bar */}
            <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: accent }} />

            {/* Toggle Handle */}
            <button
                onClick={onClose}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-20 bg-white border border-slate-200/50 border-r-0 rounded-l-lg flex items-center justify-center hover:bg-slate-50 transition-all shadow-[-3px_0_10px_rgba(0,0,0,0.04)] group active:scale-90"
            >
                <ChevronLeft size={16} className="text-slate-400 group-hover:text-[#4f83ff] group-hover:translate-x-[-2px] transition-all" />
            </button>

            {/* Section Label */}
            <div className="px-3 pt-4 pb-2 shrink-0">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.25em] block text-center">Quick Tools</span>
            </div>

            {/* Icons Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center gap-5 px-3 py-4">
                {/* Office Document Group */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Office</span>
                    <SidebarButton icon={FileText} color="text-blue-600" label="Word" onClick={onOpenWord} />
                    <SidebarButton icon={FileSpreadsheet} color="text-blue-600" label="Excel" onClick={onOpenExcel} />
                    <SidebarButton icon={Mail} color="text-[#0285fd]" label="Email" badge="3" onClick={onOpenEmail} />
                </div>

                {/* Separator */}
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Utility Group */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Tools</span>
                    <SidebarButton icon={Calculator} color="text-slate-600" label="Calc" onClick={onOpenCalculator} />
                    <SidebarButton icon={PenLine} color="text-slate-600" label="Note" onClick={onOpenNotepad} />
                    <SidebarButton icon={Printer} color="text-slate-600" label="Print" onClick={onOpenPrinter} />
                </div>

                {/* Separator */}
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Reminder */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Alerts</span>
                    <SidebarButton icon={Bell} color="text-amber-500" label="Remind" onClick={onOpenReminder} />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-3 py-4 border-t border-slate-100 flex flex-col items-center gap-3 shrink-0 bg-slate-50/50">
                <div className="flex gap-3">
                    <button className="w-9 h-9 rounded-[3px] bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#4f83ff] hover:border-[#4f83ff]/30 hover:shadow-sm transition-all active:scale-90">
                        <ShieldCheck size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-[3px] bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#4f83ff] hover:border-[#4f83ff]/30 hover:shadow-sm transition-all active:scale-90">
                        <Settings size={16} />
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-[3px] bg-white border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-90 group"
                    title="Close Panel"
                >
                    <Power size={16} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default SideBar;
