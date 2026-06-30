import React, { useState } from 'react';
import { Search, RotateCcw, Calendar, X, Filter, FileText, Hash } from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const FindBoard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('General');
    const [docNo, setDocNo] = useState('');
    const [amount, setAmount] = useState('');
    const [dateFrom, setDateFrom] = useState('13/03/2026');
    const [dateTo, setDateTo] = useState('13/03/2026');
    const [results] = useState([]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-5xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[3px] bg-[#4f83ff]/10 flex items-center justify-center">
                            <Search size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Document Find</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Search & Retrieval</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-[3px] bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="select-none space-y-4">
                        <div className="flex bg-slate-100/50 p-1 rounded-[3px] gap-1">
                            {['General', 'Advance'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 h-9 rounded-[8px] text-[11px] font-black tracking-widest transition-all uppercase ${
                                        activeTab === tab
                                            ? 'bg-white text-[#4f83ff] shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-50/50 p-5 border border-slate-100 rounded-[3px] space-y-4">
                            <div className="grid grid-cols-12 gap-y-4 gap-x-6">
                                <div className="col-span-4 flex items-center gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Trans Type</label>
                                    <select className="flex-1 h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm">
                                        <option value="">All Types</option>
                                    </select>
                                </div>

                                <div className="col-span-8 flex items-center gap-6">
                                    {['Location', 'Payee', 'Vendor'].map(opt => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="criteria" className="w-3.5 h-3.5 accent-[#4f83ff]" />
                                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-[#4f83ff] transition-colors uppercase tracking-wider">{opt}</span>
                                        </label>
                                    ))}
                                    <select className="flex-1 h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm min-w-[150px]">
                                        <option value=""></option>
                                    </select>
                                </div>

                                <div className="col-span-4 flex items-center gap-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Doc No</label>
                                    <input
                                        type="text"
                                        value={docNo}
                                        onChange={(e) => setDocNo(e.target.value)}
                                        className="flex-1 h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm"
                                        placeholder="Document number..."
                                    />
                                </div>

                                <div className="col-span-8 flex justify-end">
                                    <div className="flex items-center gap-3 w-[350px]">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 text-right">Amount</label>
                                        <input
                                            type="text"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-12 flex items-center gap-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 shrink-0">Date Range</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={dateFrom}
                                                readOnly
                                                className="w-[130px] h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 shadow-sm transition-all"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</span>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={dateTo}
                                                readOnly
                                                className="w-[130px] h-8 px-3 border border-slate-200 rounded-[3px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 shadow-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

 <div className=" rounded-sm overflow-hidden flex flex-col shadow-sm bg-white">
                            <div className="flex bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest select-none">
                                <div className="w-28 px-4 py-3 border-r border-slate-700">Doc No</div>
                                <div className="w-32 px-4 py-3 border-r border-slate-700">Date</div>
                                <div className="flex-1 px-4 py-3 border-r border-slate-700">Name</div>
                                <div className="w-28 px-4 py-3 border-r border-slate-700">Type</div>
                                <div className="flex-1 px-4 py-3 border-r border-slate-700">Memo</div>
                                <div className="w-28 px-4 py-3 text-right">Amount</div>
                            </div>
                            <div className="min-h-[250px] flex items-center justify-center bg-slate-50/30">
                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                    <Search size={40} strokeWidth={1} />
                                    <p className="text-[11px] font-black uppercase tracking-[3px]">Apply filters and press find</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6 py-4 rounded-b-[5px]">
                    <span className="text-[12px] font-black text-slate-300 italic tracking-wider opacity-50">onimta IT</span>
                    <div className="flex gap-4">
                        <button className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Search size={14} strokeWidth={3} /> FIND
                        </button>
                        <button className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindBoard;
