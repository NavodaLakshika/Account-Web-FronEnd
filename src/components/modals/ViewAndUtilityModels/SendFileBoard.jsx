import React from 'react';
import { Send, Monitor, X, FileUp, Network, Search } from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const SendFileBoard = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Send size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Send File To Other...</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Network File Transfer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="select-none space-y-5">
                        <div className="bg-slate-50/50 p-5 border border-slate-100 rounded-xl space-y-5">
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px] shrink-0">File Name</label>
                                <div className="flex-1 flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm placeholder:text-slate-300"
                                            placeholder="Select file to send..."
                                        />
                                    </div>
                                    <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm text-slate-500 hover:text-[#4f83ff]">
                                        <FileUp size={16} />
                                    </button>
                                    <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm text-slate-500 hover:text-[#4f83ff]">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px] shrink-0">Send To</label>
                                <div className="flex-1 flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm placeholder:text-slate-300"
                                            placeholder="Select recipient computer..."
                                        />
                                    </div>
                                    <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm text-slate-500 hover:text-[#4f83ff]">
                                        <Network size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <Monitor size={16} className="text-[#4f83ff]" />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                                    View All Network Computers
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0 px-6 py-3">
                    <span className="text-[9px] text-slate-400 font-medium">Network Transfer Utility</span>
                    <button className="px-7 h-9 bg-[#4f83ff] text-white text-[11px] font-black rounded-[5px] shadow-md shadow-blue-200 hover:bg-[#3a6fdf] transition-all active:scale-95 flex items-center gap-2 border-none uppercase tracking-widest">
                        <Send size={13} /> Send File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendFileBoard;
