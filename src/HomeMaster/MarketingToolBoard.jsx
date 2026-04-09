import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { ChevronDown, X, Save, RotateCcw, Target, Percent, TrendingUp, Search } from 'lucide-react';

const MarketingToolBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Sales Target');

    const targetRows = [
        { label: 'Day', showDropdown: true },
        { label: 'Week', showDropdown: true },
        { label: 'Month', showDropdown: true },
        { label: 'Quarter', showDropdown: true },
        { label: 'Year', showDropdown: true },
    ];

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
             <div className="flex-1 flex items-center gap-2 opacity-30 select-none">
                <span className="text-[20px] font-black  text-[#0078d4] tracking-tighter">onimta IT</span>
            </div>
            <button className="px-6 h-9 bg-[#2bb744] text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tighter">
                <Save size={15} /> SAVE CONFIG
            </button>
            <button className="px-6 h-9 bg-[#00adff] text-white text-[12px] font-black rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-tighter">
                <RotateCcw size={15} /> RESET FORM
            </button>
        </div>
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Business Intelligence & Marketing Intelligence Tool"
            maxWidth="max-w-[1000px]"
            footer={footer}
        >
            <div className="p-1 font-['Tahoma',_sans-serif]">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
                    <button 
                        onClick={() => setSelectedTab('Sales Target')}
                        className={`px-4 py-2 text-[12.5px] font-black uppercase tracking-widest transition-all rounded-[3px] ${selectedTab === 'Sales Target' ? 'bg-[#e49e1b] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        Sales Target
                    </button>
                    <button 
                        onClick={() => setSelectedTab('Commision Level')}
                        className={`px-4 py-2 text-[12.5px] font-black uppercase tracking-widest transition-all rounded-[3px] ${selectedTab === 'Commision Level' ? 'bg-[#e49e1b] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        Commission Level
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-[5px] p-6 shadow-sm min-h-[400px]">
                    {selectedTab === 'Sales Target' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-4 bg-[#0285fd] rounded-full" />
                                    <h3 className="text-[15px] font-mono font-black text-slate-800 uppercase tracking-tight">Sales Milestone Definitions</h3>
                                </div>
                            </div>

                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-4 mb-2 pb-2">
                                <div className="col-span-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Segment Identifier</div>
                                <div className="col-span-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Value</div>
                                <div className="col-span-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Forecast</div>
                                <div className="col-span-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</div>
                            </div>

                            {/* Data Rows */}
                            {targetRows.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center group hover:bg-slate-50/50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-100 shadow-sm mb-1 bg-white">
                                    <div className="col-span-5 flex items-center">
                                        <div className="w-32 font-bold text-slate-700 text-[12.5px] uppercase">Sales Target</div>
                                        <div className="flex-1 flex items-center justify-center h-9 bg-slate-50 rounded-[5px] border border-gray-200 shadow-inner px-4">
                                            <span className="text-[12px] font-black text-[#0285fd] uppercase tracking-[0.2em]">{row.label}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 relative">
                                        <input 
                                            type="text" 
                                            placeholder="0.00"
                                            className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-slate-800 text-right text-[13px] outline-none shadow-sm bg-white focus:border-[#0285fd] transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="text" 
                                            placeholder="0.00"
                                            className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#2bb744] text-right text-[13px] outline-none shadow-sm bg-gray-50/50 focus:border-[#2bb744] transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button className="w-full h-9 bg-[#0285fd] text-white text-[11px] font-black uppercase tracking-widest rounded-[5px] hover:bg-[#0073ff] transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5">
                                            <Save size={14} /> COMMIT
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500 pb-6">
                            {/* Commission Level Header */}
                            <div className="bg-slate-50 p-6 border border-gray-200 rounded-[8px] shadow-inner space-y-4">
                                <div className="flex items-center">
                                    <label className="w-48 font-bold text-slate-700 text-[12.5px] uppercase">Sales Commission Level</label>
                                    <div className="flex-1 flex gap-2">
                                        <input type="text" className="w-32 h-9 border border-gray-200 rounded-[5px] px-3 font-mono font-bold text-slate-500 bg-gray-100 text-[12.5px] outline-none select-none shadow-inner" readOnly value="LVL-SEQ-01" />
                                        <input type="text" className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-slate-800 text-[13px] outline-none shadow-sm focus:border-[#0285fd]" placeholder="Enter Level Description..." />
                                        <button className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="w-48 font-bold text-slate-700 text-[12.5px] uppercase">Associated Milestone</label>
                                    <div className="w-56 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] flex items-center justify-between shadow-sm bg-white hover:border-[#0285fd] transition-all cursor-pointer">
                                        <span>MONTHLY TARGET</span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Logic Grid Configuration */}
                            <div className="overflow-x-auto no-scrollbar pt-4">
                                <div className="flex gap-10 min-w-[900px]">
                                    {/* Labels Column */}
                                    <div className="space-y-8 pt-12">
                                        {['Milestone Floor', 'Intermediate Floor', 'Advanced Floor', 'Mastery Floor', 'Executive Floor'].map((label, i) => (
                                            <div key={i} className="text-[12.5px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap h-9 flex items-center">{label}</div>
                                        ))}
                                    </div>

                                    {/* Floor Inputs */}
                                    <div className="space-y-3">
                                        <div className="text-center text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-4 py-1 border-b border-gray-100">Low Level</div>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <input key={i} type="text" className="w-40 h-9 border border-gray-300 rounded-[5px] px-4 font-mono font-black text-slate-800 text-right text-[13.5px] outline-none shadow-sm focus:border-[#0285fd] bg-white" placeholder="0.00" />
                                        ))}
                                    </div>

                                    {/* Connectors */}
                                    <div className="space-y-8 pt-12">
                                        {['→', '→', '→', '→', 'MAX'].map((conn, i) => (
                                            <div key={i} className="text-[14px] font-black text-[#0285fd] text-center w-8 h-9 flex items-center justify-center">{conn}</div>
                                        ))}
                                    </div>

                                    {/* Cap Inputs */}
                                    <div className="space-y-3">
                                        <div className="text-center text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-4 py-1 border-b border-gray-100">High Level</div>
                                        {[1, 2, 3, 4].map(i => (
                                            <input key={i} type="text" className="w-40 h-9 border border-gray-300 rounded-[5px] px-4 font-mono font-black text-slate-800 text-right text-[13.5px] outline-none shadow-sm focus:border-[#0285fd] bg-white" placeholder="∞" />
                                        ))}
                                        <div className="h-9 w-40 bg-slate-50 border border-dashed border-gray-200 rounded-[5px] flex items-center justify-center text-[10px] font-black text-gray-300 italic uppercase">Terminal Value</div>
                                    </div>

                                    {/* Calculation Operators */}
                                    <div className="space-y-8 pt-12">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="text-[18px] font-light text-gray-300 text-center w-8 h-9 flex items-center justify-center">×</div>
                                        ))}
                                    </div>

                                    {/* Payout % Inputs */}
                                    <div className="space-y-3">
                                        <div className="text-center text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-4 py-1 border-b border-gray-100 italic font-mono">% Share</div>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="relative">
                                                <input type="text" className="w-24 h-9 border-b-2 border-gray-300 px-2 font-mono font-black text-[#2bb744] text-center text-[15px] outline-none focus:border-[#2bb744] bg-transparent" placeholder="0" />
                                                <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-300">%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SimpleModal>
    );
};

export default MarketingToolBoard;
