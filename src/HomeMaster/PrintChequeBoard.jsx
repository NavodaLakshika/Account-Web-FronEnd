import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown , X} from 'lucide-react';

const PrintChequeBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { selected: false, chqNo: '', date: '', payee: '', amount: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Print Cheque"
            maxWidth="max-w-[800px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                            Print
                        </button>
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                            Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                            <X size={14} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Filter Section */}
                <div className="bg-[#f8f9fa] p-5 border border-gray-200 rounded shadow-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-600 w-32">Payment Account</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded h-8 px-2 bg-white">
                            <select className="flex-1 text-[12px] outline-none bg-transparent appearance-none">
                                <option></option>
                            </select>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-x-8 items-start">
                        <div className="col-span-8 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                <span className="text-[12px] font-bold text-gray-600">To be Printed All</span>
                            </label>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 w-40">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[12px] font-bold text-gray-600">Cheque Number</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-500">From</span>
                                    <input type="text" className="w-28 h-7 border border-gray-300 rounded px-2 text-[12px] outline-none" />
                                    <span className="text-[11px] font-bold text-gray-500">To</span>
                                    <input type="text" className="w-28 h-7 border border-gray-300 rounded px-2 text-[12px] outline-none" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 w-40">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[12px] font-bold text-gray-600">Date</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-500">From</span>
                                    <div className="flex items-center border border-gray-300 rounded h-7 w-32 bg-white overflow-hidden">
                                        <input type="text" defaultValue="17/03/2026" className="flex-1 px-1.5 text-[11px] outline-none" />
                                        <button className="h-full px-1.5 border-l border-gray-100 text-gray-400"><Calendar size={12} /></button>
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500">To</span>
                                    <div className="flex items-center border border-gray-300 rounded h-7 w-32 bg-white overflow-hidden">
                                        <input type="text" defaultValue="17/03/2026" className="flex-1 px-1.5 text-[11px] outline-none" />
                                        <button className="h-full px-1.5 border-l border-gray-100 text-gray-400"><Calendar size={12} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 w-40">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[12px] font-bold text-gray-600">Payee</span>
                                </div>
                                <div className="flex-1 flex items-center border border-gray-300 rounded h-8 px-2 bg-white">
                                    <select className="flex-1 text-[12px] outline-none bg-transparent appearance-none">
                                        <option></option>
                                    </select>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-4 flex justify-end pt-2">
                            <button className="px-6 h-10 bg-[#0078d4]/10 text-[#0078d4] text-sm font-bold rounded-md hover:bg-[#0078d4]/20 transition-all active:scale-95 border-none transition-all uppercase tracking-wider">
                                View
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Main List Table Section */}
                <div className="space-y-1">
                    <label className="text-[12px] font-bold text-gray-600 ml-1 italic">Select Cheques to Print,</label>
                    <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-2 border-r border-gray-300 w-16 text-center">Sele</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-24">Chq.No</th>
                                    <th className="px-3 py-2 border-r border-gray-300 w-28">Date</th>
                                    <th className="px-3 py-2 border-r border-gray-300">Payee</th>
                                    <th className="px-3 py-2 w-28 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/20">
                                        <td className="px-2 py-1 border-r border-gray-100 text-center"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" /></td>
                                        <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                        <td className="px-2 py-1 border-r border-gray-100 text-center"><span className="text-[12px] text-gray-500">17/03/2026</span></td>
                                        <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                        <td className="px-2 py-1 text-right font-bold text-gray-700">0.00</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50/30 h-40">
                                    <td colSpan={5}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default PrintChequeBoard;
