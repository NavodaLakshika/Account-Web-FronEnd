import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown } from 'lucide-react';

const ReceivePaymentBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { chk: false, dateDue: '', docNo: '', refNo: '', invAmount: '0.00', discount: '0.00', setOff: '0.00', balance: '0.00', payment: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Customer Receipt"
            maxWidth="max-w-[1200px]"
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
                        <button onClick={onClose} className="px-10 h-8 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] border border-gray-300 text-[13px] font-bold text-gray-700 rounded shadow-sm hover:from-white hover:to-[#ebf8ff] transition-all min-w-[100px]">
                            Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 p-1 font-['Plus_Jakarta_Sans']">
                {/* 1. Header Information Section */}
                <div className="grid grid-cols-12 gap-x-10 gap-y-2 bg-[#f8f9fa] p-4 border border-gray-200 rounded shadow-sm">
                    
                    {/* Left & Middle Column Fields */}
                    <div className="col-span-8 space-y-2">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Doc No</label>
                            <input 
                                type="text" 
                                defaultValue="CPY001000007"
                                className="w-48 h-7 border border-gray-300 px-2 text-[12px] font-black text-[#0078d4] outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Received From</label>
                            <div className="flex-1 flex gap-2">
                                <select className="w-32 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option>All</option></select>
                                <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                                <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Amount</label>
                            <input type="text" defaultValue="0.00" className="w-48 h-7 border border-gray-300 px-2 text-right text-[12px] font-bold outline-none" />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Payment Type</label>
                            <select className="w-64 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Bank</label>
                            <div className="flex-1 flex gap-2">
                                <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                                <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Cost Center</label>
                            <select className="flex-1 h-7 border border-gray-300 px-1 text-[12px] outline-none bg-white"><option></option></select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Cheque No</label>
                            <input type="text" className="w-64 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-24">Memo</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>
                    </div>

                    {/* Right Column Fields */}
                    <div className="col-span-4 space-y-2 pl-4 border-l border-gray-200">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Date</label>
                            <div className="flex items-center border border-gray-300 bg-white h-7 w-48">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400 font-bold"><Calendar size={13} /></button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Outstanding Balance</label>
                            <div className="flex gap-1">
                                <span className="text-[12px] font-bold text-gray-500">Rs.</span>
                                <input type="text" defaultValue="0.00" className="w-40 h-7 border-b border-gray-300 bg-transparent text-right text-[12px] outline-none font-bold" readOnly />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Reference</label>
                            <input type="text" className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Branch</label>
                            <input type="text" className="w-48 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                        </div>

                        <div className="mt-10 flex items-center justify-between">
                            <label className="text-[12px] font-bold text-gray-600">Cheque Date</label>
                            <div className="flex items-center border border-gray-300 bg-white h-7 w-48">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full px-2 border-l border-gray-200 text-gray-400 font-bold"><Calendar size={13} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Items Table Section */}
                <div className="border border-gray-300 rounded shadow-inner bg-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-12 text-center">Chk</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-28">Date_Due</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-32">Doc_No</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-32">Ref_No</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-28 text-right">Inv_Amount</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-24 text-right">Discount</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-24 text-right">SetOff</th>
                                <th className="px-3 py-1.5 border-r border-gray-300 w-28 text-right">Balance</th>
                                <th className="px-3 py-1.5 w-32 text-right">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/20">
                                    <td className="px-2 py-1 border-r border-gray-100 text-center"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100"><input type="text" className="w-full h-6 px-1 text-[12px] outline-none" /></td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right font-bold text-gray-700">0.00</td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right">0.00</td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right">0.00</td>
                                    <td className="px-2 py-1 border-r border-gray-100 text-right font-bold text-gray-700">0.00</td>
                                    <td className="px-2 py-1 text-right font-bold text-[#0078d4]">0.00</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/30 h-32">
                                <td colSpan={9}></td>
                            </tr>
                            <tr className="bg-[#f8f9fa] border-t border-gray-300 font-black text-gray-700 text-[12px]">
                                <td colSpan={4} className="px-4 py-1 text-center italic">Total</td>
                                <td className="px-2 py-1 text-right">0.00</td>
                                <td className="px-2 py-1 text-right"></td>
                                <td className="px-2 py-1 text-right"></td>
                                <td className="px-2 py-1 text-right">0.00</td>
                                <td className="px-2 py-1 text-right">0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. Bottom Actions & Totals Area */}
                <div className="grid grid-cols-12 gap-x-8 items-start">
                    {/* Left: Set off details */}
                    <div className="col-span-7 space-y-4">
                        <div className="flex items-center gap-4">
                            <button className="h-7 px-8 border border-gray-400 bg-white text-[12px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 flex items-center justify-center">
                                Set off Over
                            </button>
                            <div className="flex-1 h-16 border border-gray-300 bg-white rounded-sm"></div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200">
                                <span className="text-[12px] font-bold text-gray-600">Over Payment</span>
                                <input type="text" defaultValue="0.00" className="w-24 h-7 text-right text-[12px] font-bold text-[#0078d4] bg-transparent outline-none" readOnly />
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[12px] font-bold text-gray-600">Over Debit Value</span>
                                <input type="text" className="w-24 h-7 border border-gray-300 px-2 text-[12px] outline-none" />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[11px] font-bold text-gray-600">Print Debit Note</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right: Calculations Totals */}
                    <div className="col-span-5 space-y-1.5 bg-[#f8f9fa] p-4 border border-gray-200 rounded">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Number Of Debit</span>
                            <input type="text" className="w-40 h-7 border border-gray-300 bg-white px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Total Debit Available</span>
                            <input type="text" className="w-40 h-7 border border-gray-300 bg-white px-2 text-[12px] outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Total Amount Due</span>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 text-right text-[12px] font-bold text-gray-700 outline-none" readOnly />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Payament Received</span>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 text-right text-[12px] font-bold text-gray-700 outline-none" readOnly />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Discount Applied</span>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 text-right text-[12px] font-bold text-gray-700 outline-none" readOnly />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-600">Debit Applied</span>
                            <input type="text" defaultValue="0.00" className="w-40 h-7 text-right text-[12px] font-bold text-gray-700 outline-none" readOnly />
                        </div>
                        <div className="h-[1px] bg-gray-300 my-1.5" />
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#0078d4] uppercase tracking-tighter">Ending Balance Rs.</span>
                            <div className="w-40 h-8 bg-blue-50 border-2 border-[#0078d4]/30 flex items-center px-3">
                                <input type="text" defaultValue="0.00" className="w-full text-right text-[15px] font-black text-[#0078d4] outline-none bg-transparent" readOnly />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ReceivePaymentBoard;
