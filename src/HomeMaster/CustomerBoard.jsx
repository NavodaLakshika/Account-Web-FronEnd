import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { ChevronDown, Printer, UserPlus, FileText, Calendar , X} from 'lucide-react';

const CustomerBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Customer Search');

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer Center"
            maxWidth="max-w-[1200px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-[750px] font-['Plus_Jakarta_Sans']">
                {/* 1. Integrated Ribbon Toolbar */}
                <div className="flex items-center gap-1 p-1.5 bg-gradient-to-r from-[#e0f2fe] to-white border-b border-blue-100 mb-4 rounded-t-lg">
                    <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/60 rounded transition-all group">
                        <div className="p-1 bg-blue-500 rounded text-white shadow-sm group-hover:bg-blue-600">
                            <UserPlus size={14} />
                        </div>
                        <span className="text-[12px] font-black text-[#0078d4] uppercase tracking-tighter flex items-center gap-1">
                            New Customer Account <ChevronDown size={12} />
                        </span>
                    </button>
                    <div className="w-[1px] h-6 bg-blue-200 mx-1" />
                    <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/60 rounded transition-all group">
                        <div className="p-1 bg-cyan-500 rounded text-white shadow-sm group-hover:bg-cyan-600">
                            <FileText size={14} />
                        </div>
                        <span className="text-[12px] font-black text-[#0078d4] uppercase tracking-tighter flex items-center gap-1">
                            New Transaction <ChevronDown size={12} />
                        </span>
                    </button>
                    <div className="w-[1px] h-6 bg-blue-200 mx-1" />
                    <button className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/60 rounded transition-all group">
                        <div className="p-1 bg-slate-500 rounded text-white shadow-sm group-hover:bg-slate-600">
                            <Printer size={14} />
                        </div>
                        <span className="text-[12px] font-black text-[#0078d4] uppercase tracking-tighter">Printer</span>
                    </button>
                </div>

                {/* 2. Main Content Split Panel */}
                <div className="flex flex-1 gap-4 px-1 min-h-0">
                    
                    {/* Left Side: Search & List (30%) */}
                    <div className="w-[320px] flex flex-col border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            {['Customer Search', 'Transaction'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${selectedTab === tab ? 'bg-white text-[#0078d4] border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-gray-500">Display</span>
                                <div className="relative w-40">
                                    <select className="w-full h-8 border border-gray-300 rounded px-2 text-[12px] appearance-none outline-none bg-white">
                                        <option>All Customer</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8faff] border-y border-blue-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-blue-50/30">Customer</th>
                                        <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-cyan-50/50 border-b border-blue-50 group hover:bg-blue-50 transition-colors cursor-pointer">
                                        <td className="px-4 py-3 text-[13px] font-bold text-[#0078d4] border-r border-blue-50/30">CASH SALES</td>
                                        <td className="px-4 py-3 text-[13px] font-black text-right text-gray-600">0.00</td>
                                    </tr>
                                    {[...Array(15)].map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50">
                                            <td className="px-4 py-3 border-r border-gray-50"></td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Side: Detailed Details (70%) */}
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        {/* Information Section */}
                        <div className="bg-[#f8faff] border border-blue-100 rounded-lg p-6 shadow-sm">
                            <h3 className="text-[14px] font-black text-[#0078d4] italic mb-6 border-b border-blue-100 pb-2">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Customer Name</span>
                                        <div className="w-[300px] h-8 bg-white border border-gray-200 rounded shadow-inner" />
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <span className="text-[12px] font-bold text-gray-500 pt-1">Address</span>
                                        <div className="w-[300px] h-16 bg-white border border-gray-200 rounded shadow-inner" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Opening Balance</span>
                                        <div className="w-[200px] h-8 bg-white border border-gray-200 rounded shadow-inner" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Contact Persion</span>
                                        <div className="w-[200px] h-8 bg-white border border-gray-200 rounded shadow-inner" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold text-gray-500">Phone Number</span>
                                        <div className="w-[200px] h-8 bg-white border border-gray-200 rounded shadow-inner" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-blue-50">
                                        <span className="text-[13px] font-black text-gray-700 uppercase tracking-tighter">Due Balance</span>
                                        <span className="text-[16px] font-black text-blue-600">0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction List Section */}
                        <div className="flex-1 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col overflow-hidden">
                            <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-start gap-8">
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-gray-500">Show</span>
                                    <div className="relative w-48">
                                        <select className="w-full h-8 border border-gray-300 rounded px-2 text-[12px] appearance-none outline-none bg-white font-bold text-gray-700">
                                            <option>All Transaction</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-gray-500">Date</span>
                                    <div className="flex items-center border border-gray-300 rounded h-8 px-2 bg-white shadow-sm w-40">
                                        <input type="text" defaultValue="17/03/2026" className="flex-1 text-[12px] font-bold text-gray-700 outline-none" />
                                        <button className="h-full pl-2 border-l border-gray-100 text-[#0078d4]">
                                            <Calendar size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8faff] border-b border-blue-50 sticky top-0 group">
                                        <tr>
                                            <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-blue-50/30">Doc No</th>
                                            <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-blue-50/30">Type</th>
                                            <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-blue-50/30">Date</th>
                                            <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-blue-50/30">Account</th>
                                            <th className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(20)].map((_, i) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px]"></td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px]"></td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px]"></td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px]"></td>
                                                <td className="px-4 py-2.5 text-right font-bold text-gray-700"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CustomerBoard;
