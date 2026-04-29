import React from 'react';
import { X, ChevronUp, Globe, Monitor, ShieldCheck, Zap, Info, Building2 } from 'lucide-react';

const SoftwareAboutModal = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Soft Backdrop */}
            <div 
                className={`fixed inset-0 bg-[#001c3d]/10 backdrop-blur-sm z-[1100] transition-opacity duration-700 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Horizontal Banner Style Modal - Ultra Simple & Professional */}
            <div 
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[85%] max-w-[1100px] h-[200px] bg-white/95 backdrop-blur-[40px] z-[1200] rounded-[2px] border border-gray-100 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                    isOpen ? 'translate-y-0 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.1)]' : '-translate-y-[calc(100%+100px)] opacity-0 pointer-events-none'
                }`}
                style={{ fontFamily: "'Tahoma', sans-serif" }}
            >
                {/* Styled Collapse Handle at bottom */}
                {isOpen && (
                    <button 
                        onClick={onClose}
                        className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-28 h-6 bg-gradient-to-b from-white to-gray-50 shadow-[0_8px_20px_rgba(0,0,0,0.08)] rounded-[2px] flex items-center justify-center gap-2 text-gray-400 hover:text-[#0078d4] transition-all hover:scale-105 active:scale-95 z-[1220] border-x border-b border-gray-100 border-t-2 border-[#0078d4] group animate-in fade-in zoom-in duration-500 delay-300"
                    >
                        <span className="text-[8px] font-mono font-black tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Minimize</span>
                        <ChevronUp size={12} strokeWidth={4} className="group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                )}

                <div className="flex h-full w-full items-center px-12 gap-12 relative overflow-hidden">
                    
                    {/* Left Section: Core Product Identity */}
                    <div className="flex flex-col justify-center space-y-4 border-l-4 border-[#0078d4] pl-10 py-2 min-w-[380px]">
                        <div className="space-y-1">
                            <h1 className="text-[30px] font-black text-slate-800 tracking-tighter leading-none uppercase">
                                Merit <span className="text-[#0078d4]">Plus</span> Finance
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.3em]">Version 1.0.1.22</p>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Copyright © 2026</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[#ff3b30]">
                                <Building2 size={14} />
                                <span className="text-[13px] font-black uppercase tracking-[0.2em]">ONIMTA IT (PVT) LTD</span>
                            </div>
                            <div className="flex items-center gap-6 pt-1 opacity-60">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Secured</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Monitor size={12} className="text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Cloud Terminal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: System Narrative */}
                    <div className="flex-1 flex flex-col justify-center relative">
                        <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-[1px] h-24 bg-slate-100" />
                        <p className="text-[12px] leading-relaxed text-slate-500 font-medium tracking-tight">
                            This Software is architected to meet enterprise-scale financial requirements. 
                            It provides robust monitoring for expenses, invoice generation, and comprehensive reporting. 
                            <br /><br />
                            Integrated modules manage inventory, human resources, and vendor logistics 
                            to ensure a seamless operational workflow across all business nodes.
                        </p>
                    </div>

                    {/* Simple Top-Right Close */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-6 text-slate-300 hover:text-slate-500 transition-colors p-2 rounded-full hover:bg-slate-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Bottom Simple Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-100">
                    <div className="h-full bg-[#0078d4] shadow-[0_0_8px_rgba(0,120,212,0.3)]" style={{ width: '100%' }} />
                </div>
            </div>
        </>
    );
};

export default SoftwareAboutModal;
