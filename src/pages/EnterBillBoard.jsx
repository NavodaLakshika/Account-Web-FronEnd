import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown } from 'lucide-react';

const EnterBillBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [billType, setBillType] = useState('Bill');

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Enter Bill"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Save
                    </button>
                    <button className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Clear
                    </button>
                    <button onClick={onClose} className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-1.5">
                {/* Header Information Section */}
                <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-2">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-3">
                        {/* Row 1: Doc No, Bill/Credit, Date */}
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[13px] font-bold text-gray-700 w-20 shrink-0">Doc No</label>
                            <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    defaultValue="EBN001000020"
                                    className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[13px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm focus:border-[#0078d4] outline-none"
                                />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-4 flex items-center justify-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    checked={billType === 'Bill'}
                                    onChange={() => setBillType('Bill')}
                                    className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" 
                                />
                                <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Bill</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="type" 
                                    checked={billType === 'Credit'}
                                    onChange={() => setBillType('Credit')}
                                    className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" 
                                />
                                <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Credit</span>
                            </label>
                        </div>

                        <div className="col-span-4 flex items-center justify-end gap-3">
                            <label className="text-[13px] font-bold text-gray-700">Date</label>
                            <div className="flex items-center border border-gray-300 bg-white shadow-sm rounded-sm overflow-hidden h-7">
                                <input 
                                    type="text" 
                                    defaultValue="13/03/2026"
                                    className="w-[140px] px-2 text-[13px] outline-none text-gray-700"
                                />
                                <button className="h-full w-8 bg-gray-50 border-l border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600">
                                    <Calendar size={14} />
                                    <ChevronDown size={11} className="ml-0.5" />
                                </button>
                            </div>
                        </div>

                        {/* Bill Type Label Subheader */}
                        <div className="col-span-12 flex justify-center -mt-2">
                             <span className="text-[16px] font-black italic text-[#0078d4] tracking-tight py-0.5">{billType}</span>
                        </div>

                        {/* Left Column Fields */}
                        <div className="col-span-7 space-y-1.5">
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Vendor</label>
                                <div className="flex-1 flex gap-1">
                                    <input 
                                        type="text" 
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[13px] focus:border-blue-500 outline-none rounded-sm"
                                    />
                                    <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm transition-colors">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                <div className="flex-1 relative">
                                    <select className="w-full h-7 border border-gray-300 px-2 text-[13px] focus:border-blue-500 outline-none rounded-sm bg-white appearance-none">
                                        <option value=""></option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0 mt-1">Address</label>
                                <textarea 
                                    className="flex-1 h-12 border border-gray-300 p-2 text-[13px] focus:border-blue-500 outline-none rounded-sm bg-white resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Terms</label>
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Right Column Fields */}
                        <div className="col-span-5 space-y-1.5">
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">A/P Account</label>
                                <div className="flex-1 relative">
                                    <select className="w-full h-7 border border-gray-300 px-2 text-[13px] font-medium text-gray-600 bg-gray-50/50 appearance-none rounded-sm">
                                        <option>Account Payable</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill No</label>
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Reference No</label>
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Amount Due</label>
                                <input 
                                    type="text" 
                                    defaultValue="0.00"
                                    className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] font-bold text-right outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill Due Date</label>
                                <div className="flex-1 flex items-center border border-gray-300 bg-white h-7 rounded-sm overflow-hidden">
                                    <input 
                                        type="text" 
                                        defaultValue="13/03/2026"
                                        className="flex-1 px-2 text-[13px] outline-none"
                                    />
                                    <button className="h-full w-8 bg-gray-50 border-l border-gray-300 flex items-center justify-center hover:bg-gray-100">
                                        <Calendar size={14} className="text-gray-600" />
                                        <ChevronDown size={10} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details Table Section */}
                <div className="space-y-0">
                    {/* Tabs */}
                    <div className="flex gap-0.5 border-b border-gray-300 px-1">
                        <button 
                            onClick={() => setSelectedTab('Expenses')}
                            className={`px-12 py-2 text-[13px] font-bold rounded-t-sm border border-gray-300 border-b-0 transition-all ${
                                selectedTab === 'Expenses' 
                                ? 'bg-white text-[#0078d4] shadow-[0_-2px_0_#0078d4] -mb-[1px]' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            Expenses
                        </button>
                        <button 
                            onClick={() => setSelectedTab('Cost Centers')}
                            className={`px-12 py-2 text-[13px] font-bold rounded-t-sm border border-gray-300 border-b-0 transition-all ${
                                selectedTab === 'Cost Centers' 
                                ? 'bg-white text-[#0078d4] shadow-[0_-2px_0_#0078d4] -mb-[1px]' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            Cost Centers
                        </button>
                    </div>

                    {/* Table Body */}
                    <div className="border border-gray-300 rounded-b-sm bg-white shadow-sm flex flex-col min-h-[220px]">
                        <div className="flex bg-white border-b border-gray-800 text-[13px] font-bold text-gray-700">
                            <div className="flex-[2] py-2 px-4 border-r border-gray-300">Expense Account</div>
                            <div className="flex-[1.5] py-2 px-4 border-r border-gray-300">Cost Center</div>
                            <div className="flex-1 py-2 px-4 border-r border-gray-300">Amount</div>
                            <div className="flex-[2] py-2 px-4">Memo</div>
                        </div>
                        
                        {/* Empty spacing for data grid */}
                        <div className="flex-1 bg-gray-50/20" />

                        {/* Entry Input Row at bottom of table area as per image */}
                        <div className="flex border-t border-gray-300 bg-white p-1 gap-1">
                             <div className="w-10 h-7 bg-gray-100 border border-gray-300 rounded-sm" />
                             <div className="flex-[2] relative">
                                <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-white appearance-none rounded-sm outline-none focus:border-blue-500">
                                    <option value=""></option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                             </div>
                             <div className="flex-[1.5] relative">
                                <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-white appearance-none rounded-sm outline-none focus:border-blue-500">
                                    <option value=""></option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                             </div>
                             <div className="flex-1">
                                <input type="text" defaultValue="0.00" className="w-full h-7 border border-gray-300 px-2 text-[13px] text-right font-bold rounded-sm outline-none focus:border-blue-500" />
                             </div>
                             <div className="flex-[2]">
                                <input type="text" className="w-full h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none focus:border-blue-500" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default EnterBillBoard;
