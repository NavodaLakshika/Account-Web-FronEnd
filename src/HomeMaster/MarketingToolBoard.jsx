import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { ChevronDown } from 'lucide-react';

const MarketingToolBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Sales Target');

    const targetRows = [
        { label: 'Day', showDropdown: true },
        { label: 'Week', showDropdown: true },
        { label: 'Month', showDropdown: true },
        { label: 'Quorter', showDropdown: true },
        { label: 'Year', showDropdown: true },
    ];

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Marketing Tool"
            maxWidth="max-w-[850px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Save
                        </button>
                        <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Clear
                        </button>
                        <button onClick={onClose} className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="p-1 font-['Plus_Jakarta_Sans']">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setSelectedTab('Sales Target')}
                        className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t transition-all ${selectedTab === 'Sales Target' ? 'bg-white border-gray-300 text-[#0078d4] -mb-[1px] z-10' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white'}`}
                    >
                        Sales Target
                    </button>
                    <button 
                        onClick={() => setSelectedTab('Commision Level')}
                        className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t transition-all -ml-[1px] ${selectedTab === 'Commision Level' ? 'bg-white border-gray-300 text-[#0078d4] -mb-[1px] z-10' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white'}`}
                    >
                        Commision Level
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-[#fcfcfc] border border-gray-100 rounded-lg p-8 shadow-inner min-h-[400px]">
                    {selectedTab === 'Sales Target' ? (
                        <div className="space-y-4">
                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-6 mb-2">
                                <div className="col-span-6"></div>
                                <div className="col-span-2 text-center text-[12px] font-black text-gray-600 uppercase tracking-widest">Target</div>
                                <div className="col-span-2 text-center text-[12px] font-black text-gray-600 uppercase tracking-widest">Forecast</div>
                                <div className="col-span-2"></div>
                            </div>

                            {/* Data Rows */}
                            {targetRows.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-6 items-center group">
                                    <div className="col-span-3 flex items-center gap-4">
                                        <span className="text-[13px] font-bold text-gray-700 w-24">Sales Target</span>
                                        <span className="text-[13px] font-black text-[#0078d4] italic">{row.label}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="h-9 border border-gray-300 rounded bg-white flex items-center px-1">
                                            <select className="flex-1 h-full outline-none text-[12px] bg-transparent appearance-none px-2">
                                                <option></option>
                                            </select>
                                            <ChevronDown size={14} className="text-gray-400 mr-2" />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="text" 
                                            className="w-full h-9 border border-gray-300 rounded bg-white px-3 text-[13px] text-right font-bold focus:border-[#0078d4] outline-none shadow-sm group-hover:shadow-md transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="text" 
                                            className="w-full h-9 border border-gray-300 rounded bg-white px-3 text-[13px] text-right font-bold focus:border-[#0078d4] outline-none shadow-sm group-hover:shadow-md transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button className="w-full h-9 border border-gray-300 rounded bg-white text-[12px] font-black text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all active:scale-95">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Top Search/Select Area */}
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-8 space-y-3">
                                    <div className="flex items-center gap-4">
                                        <label className="text-[13px] font-bold text-gray-600 w-32">Sales Comm. Level</label>
                                        <div className="flex-1 flex gap-2">
                                            <input type="text" className="w-32 h-8 border border-gray-300 rounded bg-white px-2 text-[12px] outline-none focus:border-[#0078d4]" />
                                            <input type="text" className="flex-1 h-8 border border-gray-300 rounded bg-white px-3 text-[12px] outline-none focus:border-[#0078d4]" />
                                            <div className="w-8 h-8 rounded border border-gray-200 bg-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-[13px] font-bold text-gray-600 w-32">Sales Target</label>
                                        <div className="w-40 h-8 border border-gray-300 rounded bg-white flex items-center px-1">
                                            <select className="flex-1 h-full outline-none text-[12px] bg-transparent appearance-none px-2">
                                                <option></option>
                                            </select>
                                            <ChevronDown size={14} className="text-gray-400 mr-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Configuration */}
                            <div className="flex gap-16 ml-4">
                                {/* Labels */}
                                <div className="space-y-7 pt-12">
                                    {['Level Start From', '2nd Level Start From', '3rd Level Start From', '4th Level Start From', '5th Level Start From'].map((label, i) => (
                                        <div key={i} className="text-[13px] font-bold text-gray-600 whitespace-nowrap">{label}</div>
                                    ))}
                                </div>

                                {/* Low Level Inputs */}
                                <div className="space-y-3">
                                    <div className="text-center text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">Low Level</div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <input key={i} type="text" className="w-40 h-9 border border-gray-300 rounded bg-white px-3 text-[13px] text-right font-bold focus:border-[#0078d4] outline-none shadow-sm" />
                                    ))}
                                </div>

                                {/* Connectors */}
                                <div className="space-y-7 pt-12">
                                    {['To', 'To', 'To', 'To', '<'].map((conn, i) => (
                                        <div key={i} className="text-[13px] font-black text-gray-700 italic text-center w-8">{conn}</div>
                                    ))}
                                </div>

                                {/* High Level Inputs */}
                                <div className="space-y-3">
                                    <div className="text-center text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">High Level</div>
                                    {[1, 2, 3, 4].map(i => (
                                        <input key={i} type="text" className="w-40 h-9 border border-gray-300 rounded bg-white px-3 text-[13px] text-right font-bold focus:border-[#0078d4] outline-none shadow-sm" />
                                    ))}
                                    <div className="h-9" /> {/* Space for the 5th level which has no High level in the image */}
                                </div>

                                {/* Equals Connectors */}
                                <div className="space-y-7 pt-12">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="text-[14px] font-black text-gray-400 text-center w-8">=</div>
                                    ))}
                                </div>

                                {/* Percentage Inputs */}
                                <div className="space-y-3">
                                    <div className="text-center text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">%</div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <input key={i} type="text" className="w-40 h-9 border border-gray-300 rounded bg-white px-3 text-[13px] text-right font-bold focus:border-[#0078d4] outline-none shadow-sm" />
                                    ))}
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
