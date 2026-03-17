import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Package, Plus, Trash2, HelpCircle } from 'lucide-react';

const PurchaseOrderBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { id: '', name: '', unit: '', price: '0.00', qty: '0', amount: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Purchase Order"
            maxWidth="max-w-[1000px]"
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
                <div className="grid grid-cols-12 gap-x-6 gap-y-3 bg-[#f8f9fa] p-4 border border-gray-200 rounded shadow-sm">
                    
                    {/* Left Column: Doc No & Supplier */}
                    <div className="col-span-8 space-y-3">
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Document No</label>
                            <div className="flex flex-1 gap-1 max-w-[280px]">
                                <input 
                                    type="text" 
                                    defaultValue="PON001000003"
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] bg-white outline-none focus:border-[#0078d4]"
                                />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] transition-colors">
                                    <Search size={14} />
                                </button>
                            </div>

                            <label className="text-[12px] font-bold text-gray-600 ml-4">Date</label>
                            <div className="flex items-center border border-gray-300 bg-white h-7 w-[160px]">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400 hover:text-[#0078d4]">
                                    <Calendar size={13} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Supplier</label>
                            <div className="flex flex-1 gap-1">
                                <input 
                                    type="text" 
                                    placeholder="Select Supplier"
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none focus:border-[#0078d4]"
                                />
                                <button className="w-8 h-7 bg-gray-100 border border-gray-300 text-[#0078d4] flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    <ChevronDown size={14} />
                                </button>
                                <input 
                                    type="text" 
                                    disabled
                                    className="w-[150px] h-7 border border-gray-300 px-2 text-[12px] bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Expected & Payment */}
                    <div className="col-span-4 space-y-3 pl-4 border-l border-gray-200">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Expected On</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400">
                                    <Calendar size={13} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payment</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <select className="flex-1 px-1 text-[12px] outline-none bg-transparent">
                                    <option>Cash</option>
                                    <option>Credit</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Remarks & Shift To - Full Width */}
                    <div className="col-span-12 space-y-2 mt-1">
                        <div className="flex items-start gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-24 pt-1">Remarks</label>
                            <input 
                                type="text" 
                                className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none focus:border-[#0078d4]"
                            />
                        </div>
                        <div className="flex items-start gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-24 pt-1">Shift To</label>
                            <input 
                                type="text" 
                                className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none focus:border-[#0078d4]"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Main Items Table Section */}
                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300">
                            <tr>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 border-r border-gray-300 w-32">Prod. ID</th>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 border-r border-gray-300">Product Name</th>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 border-r border-gray-300 w-24">Unit</th>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 border-r border-gray-300 w-28 text-right">Purch. Price</th>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 border-r border-gray-300 w-24 text-right">Qty</th>
                                <th className="px-3 py-2 text-[12px] font-bold text-gray-600 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                    <td className="px-2 py-1 border-r border-gray-100">
                                        <input type="text" className="w-full h-6 px-1 text-[12px] border border-transparent focus:border-blue-300 outline-none" />
                                    </td>
                                    <td className="px-2 py-1 border-r border-gray-100">
                                        <input type="text" className="w-full h-6 px-1 text-[12px] border border-transparent focus:border-blue-300 outline-none" />
                                    </td>
                                    <td className="px-2 py-1 border-r border-gray-100">
                                        <input type="text" className="w-full h-6 px-1 text-[12px] border border-transparent focus:border-blue-300 outline-none" />
                                    </td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right">
                                        <input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right border border-transparent focus:border-blue-300 outline-none" />
                                    </td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right">
                                        <input type="text" defaultValue="0" className="w-full h-6 px-1 text-[12px] text-right border border-transparent focus:border-blue-300 outline-none" />
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right font-bold text-gray-700 outline-none" readOnly />
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/50">
                                <td colSpan={6} className="h-40"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. Bottom Totals Section */}
                <div className="flex justify-end pt-2">
                    <div className="w-[300px] space-y-1.5 bg-gray-50/50 p-3 rounded-sm border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Total</span>
                            <div className="w-32 h-7 bg-white border border-gray-300 flex items-center px-2">
                                <input type="text" defaultValue="0.00" className="w-full text-right text-[12px] font-bold outline-none" readOnly />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Tax Amount</span>
                            <div className="flex gap-1 w-32">
                                <input type="text" defaultValue="0" className="w-10 h-7 text-center text-[12px] border border-gray-300 outline-none focus:border-blue-400" />
                                <div className="flex-1 h-7 bg-white border border-gray-300 flex items-center px-2">
                                    <input type="text" defaultValue="0.00" className="w-full text-right text-[12px] outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">NBT</span>
                            <div className="flex gap-1 w-32">
                                <input type="text" defaultValue="0" className="w-10 h-7 text-center text-[12px] border border-gray-300 outline-none focus:border-blue-400" />
                                <div className="flex-1 h-7 bg-white border border-gray-300 flex items-center px-2">
                                    <input type="text" defaultValue="0.00" className="w-full text-right text-[12px] outline-none" readOnly />
                                </div>
                            </div>
                        </div>
                        <div className="h-[1px] bg-gray-300 mx-1 my-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#0078d4]">Net Amount</span>
                            <div className="w-32 h-8 bg-blue-50 border-2 border-[#0078d4]/30 flex items-center px-2">
                                <input type="text" defaultValue="0.00" className="w-full text-right text-[14px] font-black text-[#0078d4] outline-none bg-transparent" readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default PurchaseOrderBoard;
