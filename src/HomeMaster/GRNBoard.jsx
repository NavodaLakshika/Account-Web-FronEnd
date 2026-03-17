import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown } from 'lucide-react';

const GRNBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { id: '', name: '', unit: '', cost: '0.00', selling: '0.00', qty: '0', free: '0', amount: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Good Received Note"
            maxWidth="max-w-[1100px]"
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
                            Clear
                        </button>
                        <button className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Delete
                        </button>
                        <button onClick={onClose} className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Information Section */}
                <div className="grid grid-cols-12 gap-x-6 gap-y-2 bg-[#f8f9fa] p-4 border border-gray-200 rounded shadow-sm">
                    
                    {/* Top Row: Doc No, Date, Expected On */}
                    <div className="col-span-12 grid grid-cols-12 gap-4 border-b border-gray-100 pb-2 mb-1">
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Document No</label>
                            <div className="flex flex-1 gap-1">
                                <input 
                                    type="text" 
                                    defaultValue="GRN001000001"
                                    className="flex-1 h-7 border border-gray-300 px-2 text-[12px] font-bold text-[#0078d4] outline-none"
                                />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] transition-colors">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600">Date</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400">
                                    <Calendar size={13} />
                                </button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Expected On</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400">
                                    <Calendar size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Second Row: Supplier, PO Number, Payment */}
                    <div className="col-span-12 grid grid-cols-12 gap-4">
                        <div className="col-span-5 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Supplier</label>
                            <div className="flex-1 flex gap-1">
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" placeholder="Select" />
                                <button className="w-8 h-7 bg-gray-100 border border-gray-300 text-[#0078d4] flex items-center justify-center">
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">P.O. Number</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <select className="flex-1 px-1 text-[12px] outline-none bg-transparent">
                                    <option>Select PO</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-20">Payment</label>
                            <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                <select className="flex-1 px-1 text-[12px] outline-none bg-transparent">
                                    <option>Cash</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Third Row: Supplier Inv, Inv Amount, Checkboxes */}
                    <div className="col-span-12 grid grid-cols-12 gap-4 items-center mt-1">
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Supplier Inv.</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                        <div className="col-span-3 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600">Inv Amount</label>
                            <input type="text" defaultValue="0.00" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none text-right" />
                        </div>
                        <div className="col-span-5 flex items-center gap-6 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                <span className="text-[11px] font-bold text-gray-600">Consignment Basis</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                <span className="text-[11px] font-bold text-gray-600">Accept other Supp. Product</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. Main Items Table Section */}
                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 uppercase text-[11px] font-black tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-300 w-28">Prod. ID</th>
                                <th className="px-3 py-2 border-r border-gray-300">Product Name</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20">Unit</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-24 text-right">Cost</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-24 text-right">Selling</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20 text-right">Qty</th>
                                <th className="px-3 py-2 border-r border-gray-300 w-20 text-right">Free</th>
                                <th className="px-3 py-2 w-28 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/20">
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" defaultValue="0" className="w-full h-6 px-1 text-[12px] text-right outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" defaultValue="0" className="w-full h-6 px-1 text-[12px] text-right outline-none" /></td>
                                    <td className="px-2 py-1 text-right"><input type="text" defaultValue="0.00" className="w-full h-6 px-1 text-[12px] text-right font-bold text-gray-700 outline-none" readOnly /></td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/30 h-40">
                                <td colSpan={8}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. Bottom Information & Totals Area */}
                <div className="grid grid-cols-12 gap-4">
                    {/* Left: Remarks & Additional Charges */}
                    <div className="col-span-7 space-y-3">
                        <div className="w-full h-24 bg-white border border-gray-300 rounded-sm">
                             {/* Large display area from image */}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-24">Expence Ac.</label>
                                <div className="flex-1 flex items-center border border-gray-300 bg-white h-7">
                                    <select className="flex-1 px-1 text-[12px] outline-none bg-transparent">
                                        <option>Select Account</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600">Other Charges</label>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] text-right outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Calculations Totals */}
                    <div className="col-span-5 space-y-1 bg-[#f8f9fa] p-3 border border-gray-200 rounded">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Total</span>
                            <div className="flex gap-1 w-48">
                                <input type="text" defaultValue="0" className="w-16 h-7 text-center text-[12px] border border-gray-300 bg-white outline-none" placeholder="Qty" />
                                <input type="text" defaultValue="0" className="w-16 h-7 text-center text-[12px] border border-gray-300 bg-white outline-none" placeholder="Free" />
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" readOnly />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Discount</span>
                            <div className="flex gap-1 w-48">
                                <input type="text" defaultValue="0" className="w-12 h-7 text-center text-[12px] border border-gray-300 outline-none" />
                                <span className="flex items-center text-[12px] font-bold text-gray-400 px-1">%</span>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" readOnly />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Tax Amount</span>
                            <div className="flex gap-1 w-32">
                                <input type="text" defaultValue="0" className="w-12 h-7 text-center text-[12px] border border-gray-300 outline-none" />
                                <span className="flex items-center text-[12px] font-bold text-gray-400 px-1">%</span>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" readOnly />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">NBT</span>
                            <div className="flex gap-1 w-32">
                                <input type="text" defaultValue="0" className="w-12 h-7 text-center text-[12px] border border-gray-300 outline-none" />
                                <span className="flex items-center text-[12px] font-bold text-gray-400 px-1">%</span>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" readOnly />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Adjustment</span>
                            <div className="flex gap-1 w-48">
                                <select className="w-20 h-7 text-[11px] border border-gray-300 outline-none"><option></option></select>
                                <input type="text" defaultValue="0.00" className="flex-1 h-7 text-right text-[12px] border border-gray-300 bg-white px-2 outline-none" />
                            </div>
                        </div>
                        <div className="h-[1px] bg-gray-200 my-1" />
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#0078d4] uppercase tracking-tighter">Net Amount</span>
                            <div className="w-48 h-8 bg-blue-50 border-2 border-[#0078d4]/30 flex items-center px-2">
                                <input type="text" defaultValue="0.00" className="w-full text-right text-[15px] font-black text-[#0078d4] outline-none bg-transparent" readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default GRNBoard;
