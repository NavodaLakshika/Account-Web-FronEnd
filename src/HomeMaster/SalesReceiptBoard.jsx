import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar } from 'lucide-react';

const SalesReceiptBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { id: '', name: '', qty: '0', amount: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Sales Receipt"
            maxWidth="max-w-[900px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Save
                        </button>
                        <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Delete
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
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Information Section */}
                <div className="bg-[#f8f9fa] p-5 border border-gray-200 rounded shadow-sm space-y-3">
                    <div className="grid grid-cols-12 gap-x-8">
                        {/* Left Column */}
                        <div className="col-span-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-24">Document No</label>
                                <div className="flex flex-1 gap-1 max-w-[240px]">
                                    <input 
                                        type="text" 
                                        defaultValue="JOB001000001"
                                        className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] outline-none bg-white"
                                    />
                                    <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e]">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-24">Customer</label>
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none shadow-sm"
                                />
                                <div className="w-8 h-7 flex items-center justify-center opacity-30">
                                    <div className="w-4 h-4 rounded-full border-2 border-[#0078d4]" />
                                </div>
                                <input type="text" disabled className="w-20 h-7 border border-gray-300 px-2 text-[11px] bg-gray-50" />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-span-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-16">Date</label>
                                <div className="flex-1 flex items-center border border-gray-300 bg-white h-7 shadow-sm">
                                    <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                    <button className="h-full px-2 border-l border-gray-200 text-gray-400">
                                        <Calendar size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-16">Reference</label>
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Full Width Subject Row */}
                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-bold text-gray-600 w-24">Subject</label>
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                    </div>
                </div>

                {/* 2. Main Items Table Section */}
                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-300 w-32">Prod. ID</th>
                                <th className="px-3 py-2 border-r border-gray-300">Product Name</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-24 text-right">Qty</th>
                                <th className="px-3 py-2 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/20">
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] border-none outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] border-none outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right"><input type="text" defaultValue="0" className="w-full h-6 px-1 text-[12px] text-right border-none outline-none" /></td>
                                    <td className="px-2 py-1 text-right"><input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right font-bold text-gray-700 border-none outline-none" readOnly /></td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/30 h-48">
                                <td colSpan={4}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom display Area */}
                <div className="w-full h-20 bg-white border border-gray-300 rounded-sm"></div>
            </div>
        </SimpleModal>
    );
};

export default SalesReceiptBoard;
