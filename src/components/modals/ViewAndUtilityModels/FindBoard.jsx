import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Calendar, ChevronDown , X} from 'lucide-react';

const FindBoard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('General');

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Find"
            maxWidth="max-w-5xl"
            footer={
                <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-2">
                         <span className="text-[18px] font-bold text-gray-400 italic tracking-wider opacity-60">onimta IT</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center gap-2">
                            <Search size={14} /> Find
                        </button>
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center gap-2">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center gap-2">
                            <X size={14} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex bg-gray-100/50 p-1 rounded-sm gap-1 border-b border-gray-300">
                    <button 
                        onClick={() => setActiveTab('General')}
                        className={`px-8 py-1.5 text-[12px] font-bold rounded-t-sm transition-all border-x border-t ${
                            activeTab === 'General' 
                            ? 'bg-white text-blue-600 border-gray-300 -mb-[1px] shadow-sm' 
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                    >
                        General
                    </button>
                    <button 
                        onClick={() => setActiveTab('Advance')}
                        className={`px-8 py-1.5 text-[12px] font-bold rounded-t-sm transition-all border-x border-t ${
                            activeTab === 'Advance' 
                            ? 'bg-white text-blue-600 border-gray-300 -mb-[1px] shadow-sm' 
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                    >
                        Advance
                    </button>
                </div>

                {/* Search Criteria Box */}
                <div className="bg-white p-4 border border-gray-300 rounded-sm shadow-sm space-y-4">
                    <div className="grid grid-cols-12 gap-y-3 gap-x-6">
                        {/* Transaction Type */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-semibold text-gray-700 w-32 shrink-0">Transaction Type</label>
                            <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                                <option value=""></option>
                            </select>
                        </div>

                        {/* Radio Options */}
                        <div className="col-span-8 flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="criteria" className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">Location</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="criteria" className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">Payee</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="criteria" className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-600">Vender</span>
                            </label>
                            <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white min-w-[150px]">
                                <option value=""></option>
                            </select>
                        </div>

                        {/* Document No */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-semibold text-gray-700 w-32 shrink-0">Document No</label>
                            <input 
                                type="text"
                                className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                            />
                        </div>

                        {/* Amount */}
                        <div className="col-span-8 flex justify-end">
                            <div className="flex items-center gap-2 w-[350px]">
                                <label className="text-[12px] font-semibold text-gray-700 w-20 text-right">Amount</label>
                                <input 
                                    type="text"
                                    className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="col-span-12 flex items-center gap-4">
                            <label className="text-[12px] font-semibold text-gray-700 w-32 shrink-0">Date</label>
                            <div className="flex items-center border border-gray-300 bg-white">
                                <input 
                                    type="text" 
                                    defaultValue="13/03/2026"
                                    className="w-[140px] h-7 px-2 text-sm outline-none"
                                />
                                <button className="h-7 w-7 border-l border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-600">
                                    <Calendar size={13} />
                                    <ChevronDown size={11} className="ml-0.5" />
                                </button>
                            </div>
                            <span className="text-[12px] font-semibold text-gray-600 px-2">To</span>
                            <div className="flex items-center border border-gray-300 bg-white">
                                <input 
                                    type="text" 
                                    defaultValue="13/03/2026"
                                    className="w-[140px] h-7 px-2 text-sm outline-none"
                                />
                                <button className="h-7 w-7 border-l border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-600">
                                    <Calendar size={13} />
                                    <ChevronDown size={11} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden flex flex-col min-h-[350px] bg-white shadow-inner">
                    <div className="flex bg-gray-50 border-b border-gray-300 select-none">
                        <div className="w-24 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-r border-gray-300">Doc_No</div>
                        <div className="w-32 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-r border-gray-300">Date</div>
                        <div className="flex-1 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-r border-gray-300">Name</div>
                        <div className="w-32 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-r border-gray-300">Type</div>
                        <div className="flex-1 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-r border-gray-300">Memo</div>
                        <div className="w-32 px-3 py-1.5 text-[11px] font-bold text-gray-600 text-right">Amount</div>
                    </div>
                    <div className="flex-1 bg-[#a3a3a3]/10" />
                </div>
            </div>
        </SimpleModal>
    );
};

export default FindBoard;
