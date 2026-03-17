import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, RefreshCw } from 'lucide-react';

const PettyCashBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [rows, setRows] = useState([
        { account: '', costCenter: '', amount: '0.00', memo: '' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Petty Cash Entry"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex items-center justify-end w-full gap-2">
                    <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px] flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="text-[#0078d4]" />
                        Refresh
                    </button>
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
            }
        >
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Information Section */}
                <div className="grid grid-cols-12 gap-x-10 gap-y-2.5 bg-[#f8f9fa] p-5 border border-gray-200 rounded shadow-sm">
                    
                    {/* Left & Middle Column Fields */}
                    <div className="col-span-8 space-y-2.5">
                        {/* Doc No & Date row */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-24">Doc No</label>
                                <div className="flex gap-1 w-48">
                                    <input 
                                        type="text" 
                                        defaultValue="PTC001000011"
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] outline-none"
                                    />
                                    <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e]">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600">Date</label>
                                <div className="flex items-center border border-gray-300 bg-white h-7 w-44">
                                    <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                    <button className="h-full px-2 border-l border-gray-200 text-gray-400">
                                        <Calendar size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Account row */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Account</label>
                            <div className="flex-1 flex gap-2">
                                <select className="w-32 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white">
                                    <option></option>
                                </select>
                                <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white">
                                    <option></option>
                                </select>
                            </div>
                        </div>

                        {/* Vender row */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Vender</label>
                            <div className="flex-1 flex gap-2 items-center">
                                <input type="checkbox" className="w-4 h-4 border-gray-300 text-[#0078d4]" />
                                <div className="flex-1 flex gap-1">
                                    <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                                    <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                                    <button className="w-8 h-7 bg-gray-200 border border-gray-300 flex items-center justify-center">
                                        <Search size={14} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cost Center, Payee, Location, Memo */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Cost Center</label>
                            <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payee</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Location</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Memo</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                    </div>

                    {/* Right Column Fields */}
                    <div className="col-span-4 space-y-3.5 pl-4 border-l border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Balance</label>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 border-b border-gray-300 bg-transparent text-right text-[12px] outline-none font-bold" readOnly />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Vouch No</label>
                            <input type="text" className="w-40 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Bill Due Date</label>
                            <div className="flex items-center border border-gray-300 bg-white h-7 w-40">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400"><Calendar size={13} /></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Reference No</label>
                            <input type="text" className="w-40 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Vou. Amount</label>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 border border-gray-300 px-2 text-right text-[12px] font-bold text-[#0078d4] outline-none bg-blue-50/20" />
                        </div>
                    </div>
                </div>

                {/* 2. Tabs & Items Table Section */}
                <div className="space-y-0">
                    <div className="flex">
                        <button 
                            onClick={() => setSelectedTab('Expenses')}
                            className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t transition-all ${selectedTab === 'Expenses' ? 'bg-white border-gray-300 text-[#0078d4] z-10' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            Expenses
                        </button>
                        <button 
                            onClick={() => setSelectedTab('Cost Center')}
                            className={`px-8 py-2 text-[12px] font-bold border-t border-x rounded-t -ml-[1px] transition-all ${selectedTab === 'Cost Center' ? 'bg-white border-gray-300 text-[#0078d4] z-10' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            Cost Center
                        </button>
                    </div>

                    <div className="border border-gray-300 rounded-b shadow-inner bg-white overflow-hidden -mt-[1px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-2 border-r border-gray-300">Expense Account</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-64">Cost Center</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-44 text-right">Amount</th>
                                    <th className="px-3 py-2">Memo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/20">
                                        <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                        <td className="px-2 py-1 border-r border-gray-100"><select className="w-full h-6 text-[12px] outline-none bg-transparent"><option></option></select></td>
                                        <td className="px-2 py-1 border-r border-gray-100 text-right"><input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right outline-none" /></td>
                                        <td className="px-2 py-1"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50/30 h-32">
                                    <td colSpan={4}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Bottom Actions & Totals Area */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4 items-center">
                        <button className="text-[12px] font-bold text-blue-600 hover:underline">Add New Account..</button>
                        <button className="text-[12px] font-bold text-blue-600 hover:underline ml-4">Add New Customer</button>
                    </div>

                    <div className="flex items-center gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                            <span className="text-[12px] font-bold text-gray-600">To be print</span>
                        </label>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-black text-gray-700 uppercase">Difference</span>
                                <input type="text" defaultValue="0.00" className="w-32 h-7 border border-gray-300 bg-white px-2 text-right text-[12px] font-bold outline-none" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-black text-[#0078d4] uppercase">Total</span>
                                <div className="w-44 h-8 bg-blue-50 border-2 border-[#0078d4]/30 flex items-center px-3">
                                    <input type="text" defaultValue="0.00" className="w-full text-right text-[15px] font-black text-[#0078d4] outline-none bg-transparent" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default PettyCashBoard;
