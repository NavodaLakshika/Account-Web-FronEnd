import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, RefreshCw } from 'lucide-react';

const PayBillBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Pay Bill"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all">
                        Pay Bill
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
            <div className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[85vh]">
                {/* 1. Top Header Configuration */}
                <div className="bg-white p-2 border border-gray-200 rounded-sm shadow-sm space-y-1.5">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-1.5 items-center">
                        {/* Voucher No row */}
                        <div className="col-span-4 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Voucher No</label>
                             <div className="flex-1 flex gap-1">
                                <input type="text" defaultValue="PAB001000020" className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[12px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm outline-none" />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        {/* Vendor row - shifted to right slightly in grid */}
                        <div className="col-span-6 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-16 shrink-0">Vender</label>
                             <div className="flex-1 flex gap-1 px-4">
                                <div className="w-16 h-7 border border-gray-300 rounded-sm bg-white" />
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none" />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                    <Search size={14} />
                                </button>
                             </div>
                        </div>

                        {/* Date - far right */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                             <label className="text-[12px] font-bold text-gray-700">Date</label>
                             <div className="flex items-center border border-gray-300 bg-white h-7 rounded-sm overflow-hidden">
                                <input type="text" defaultValue="13/03/2026" className="w-[100px] px-2 text-[12px] outline-none" />
                                <button className="h-full w-6 bg-gray-50 border-l border-gray-300 flex items-center justify-center">
                                    <Calendar size={12} className="text-gray-500" />
                                    <ChevronDown size={8} className="ml-0.5" />
                                </button>
                             </div>
                        </div>

                        {/* Cost Center row */}
                        <div className="col-span-4 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-20 shrink-0">Cost Center</label>
                             <div className="flex-1 relative">
                                <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-white rounded-sm appearance-none outline-none">
                                    <option value=""></option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                             </div>
                             <div className="flex items-center gap-1 ml-2">
                                <input type="checkbox" id="all" className="w-3 h-3" />
                                <label htmlFor="all" className="text-[11px] font-bold text-gray-600">All</label>
                             </div>
                        </div>

                        <div className="col-span-8 flex items-center gap-2">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0 text-right pr-2">Manual Vou. No</label>
                             <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none" />
                        </div>
                    </div>
                </div>

                {/* 2. Main Bills Table */}
                <div className="border border-gray-300 rounded-sm bg-white shadow-sm flex flex-col min-h-[200px]">
                    <div className="flex bg-white border-b border-gray-800 text-[11px] font-bold text-gray-700">
                        <div className="flex-[0.8] py-1.5 px-3 border-r border-gray-300">Date</div>
                        <div className="flex-[1.2] py-1.5 px-3 border-r border-gray-300">Doc No</div>
                        <div className="flex-[2] py-1.5 px-3 border-r border-gray-300">Vender</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Reff. No</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Amount</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Discount</div>
                        <div className="flex-[1] py-1.5 px-3 border-r border-gray-300">Set Of Use</div>
                        <div className="flex-[1.2] py-1.5 px-3 text-right">Amt. To Pay</div>
                    </div>
                    <div className="flex-1 bg-gray-50/10" />
                    <div className="flex border-t border-gray-400 bg-white text-[11px] font-bold text-gray-800">
                         <div className="flex-[5.6] py-1 px-4 text-center">Total</div>
                         <div className="flex-[1.2] py-1 px-4 text-right border-l border-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">0.00</div>
                    </div>
                </div>

                {/* 3. Summary Stats Section */}
                <div className="bg-blue-50/30 border border-[#0078d4]/20 p-2 rounded-sm space-y-2">
                    <div className="flex items-center justify-between text-[13px] font-bold">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 italic lowercase pr-10">balance</span>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-800">Total Amount</label>
                                <input type="text" defaultValue="0.00" className="w-32 h-7 bg-white border border-gray-300 text-right px-2 text-[#000080] rounded-sm outline-none" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <label className="text-gray-800">Total Returns / Over Payment</label>
                                <input type="text" defaultValue="0.00" className="w-32 h-7 bg-white border border-gray-300 text-right px-2 text-[#000080] rounded-sm outline-none" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-800">Total Outstanding</label>
                                <input type="text" defaultValue="0.00" className="w-32 h-7 bg-white border border-gray-300 text-right px-2 text-[#000080] rounded-sm outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[13px] font-bold text-gray-800 w-16 shrink-0">Memo</label>
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] bg-white rounded-sm outline-none" />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                        <ActionButton label="Select All Bill" />
                        <ActionButton label="Clear" />
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5">Bill Reference</span>
                            <ActionButton label="Go to Bill" />
                        </div>
                        <div className="flex flex-col items-center ml-10">
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5">Sugg. Discount <span className="text-black ml-2">0.00</span></span>
                            <ActionButton label="Set Discount" />
                        </div>
                        <div className="flex flex-col items-center ml-10">
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5">Sugg. Credit Setoff <span className="text-black ml-2">0.00</span></span>
                            <div className="flex items-center gap-1">
                                <ActionButton label="Set off Over Payment" />
                                <div className="w-24 h-7 bg-[#ffe6cc] border border-[#ffcc99] rounded-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Fine Grain Stats Grid */}
                <div className="bg-white border border-gray-200 p-2 rounded-sm">
                    <div className="grid grid-cols-12 gap-x-12 gap-y-2">
                        {/* Column 1 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Sum of Amount Due" value="0.00" />
                            <StatRow label="Sum of Discount Value" value="0.00" />
                        </div>
                        {/* Column 2 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Sum of Credit Setoff" value="0.00" />
                            <StatRow label="Sum of Total Value" value="0.00" emphasized />
                        </div>
                        {/* Column 3 */}
                        <div className="col-span-4 space-y-1.5">
                            <StatRow label="Number of Credits" value="" isEmpty />
                            <StatRow label="Total Credit Available" value="" isEmpty />
                        </div>
                    </div>
                </div>

                {/* 5. Payment Finalization */}
                <div className="bg-white p-2 border border-gray-200 rounded-sm space-y-1.5">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-1.5">
                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-28">Payment Method</label>
                             <div className="flex-1 relative">
                                <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-white rounded-sm appearance-none outline-none">
                                    <option value=""></option>
                                </select>
                                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                             </div>
                        </div>

                        <div className="col-span-8 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0">Payment Account</label>
                             <div className="flex-1 flex gap-1 items-center">
                                <div className="w-24 h-7 border border-gray-300 rounded-sm bg-white" />
                                <div className="flex-1 relative">
                                    <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-white rounded-sm appearance-none outline-none">
                                        <option value=""></option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                             </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-28">Payment Date</label>
                             <div className="flex-1 flex items-center border border-gray-300 bg-white h-7 rounded-sm overflow-hidden">
                                <input type="text" defaultValue="13/03/2026" className="flex-1 px-2 text-[12px] outline-none" />
                                <button className="h-full w-8 bg-gray-50 border-l border-gray-300 flex items-center justify-center">
                                    <Calendar size={13} className="text-gray-600" />
                                    <ChevronDown size={9} className="ml-0.5" />
                                </button>
                             </div>
                        </div>

                        <div className="col-span-8 flex items-center gap-3">
                             <label className="text-[12px] font-bold text-gray-700 w-32 shrink-0">Payment Cost Center</label>
                             <div className="flex-1 flex gap-1 items-center">
                                <div className="flex-1 relative">
                                    <select className="w-full h-7 border border-gray-300 px-2 text-[12px] bg-[#f0f0f0] rounded-sm appearance-none outline-none">
                                        <option value=""></option>
                                    </select>
                                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                                <div className="flex items-center gap-1 ml-4 pr-10">
                                    <input type="checkbox" id="check1" className="w-3 h-3" />
                                    <label htmlFor="check1" className="text-[11px] font-bold text-gray-600">checkBox1</label>
                                </div>
                             </div>
                        </div>

                        <div className="col-span-12 grid grid-cols-12 gap-x-4">
                             <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-700 w-28">Chque No</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input type="checkbox" className="w-4 h-4" />
                                    <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[12px] rounded-sm outline-none" />
                                    <button className="p-1 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 text-green-600">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                             </div>

                             <div className="col-span-8 flex items-center gap-x-6">
                                <div className="flex items-center gap-2 flex-1">
                                    <label className="text-[12px] font-bold text-gray-700 w-32 text-right">Ending Balance <span className="font-black text-gray-900 ml-1">Rs.</span></label>
                                    <input type="text" defaultValue="0.00" className="flex-1 h-7 border-b border-gray-300 px-2 text-[12px] text-right font-bold outline-none" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <label className="text-[12px] font-bold text-gray-700 w-32 text-right">Over Credit Value</label>
                                    <input type="text" defaultValue="0.00" className="flex-1 h-7 bg-white border border-gray-300 px-2 text-[12px] text-right rounded-sm outline-none" />
                                </div>
                             </div>

                             <div className="col-span-12 flex justify-center mt-1">
                                <div className="flex items-center gap-3 w-[350px]">
                                    <label className="text-[12px] font-bold text-gray-700 w-32 text-right">Amount</label>
                                    <input type="text" defaultValue="0.00" className="flex-1 h-7 bg-white border border-gray-300 px-2 text-[12px] text-right text-[#000080] font-bold rounded-sm outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const ActionButton = ({ label }) => (
    <button className="px-3 h-7 bg-white border border-gray-400 text-gray-700 text-[12px] font-bold rounded-sm hover:bg-gray-50 hover:border-gray-600 shadow-sm transition-all active:translate-y-0.5">
        {label}
    </button>
);

const StatRow = ({ label, value, isEmpty, emphasized }) => (
    <div className="flex items-center justify-between gap-4">
        <label className="text-[12px] font-bold text-gray-700 whitespace-nowrap">{label}</label>
        <input 
            type="text" 
            defaultValue={value}
            readOnly
            className={`
                w-32 h-6 border border-gray-200 px-2 text-[11px] text-right outline-none rounded-sm bg-gray-50/30
                ${emphasized ? 'font-black text-black border-gray-500 bg-white shadow-sm' : 'font-semibold text-gray-600'}
                ${isEmpty ? 'bg-white border-gray-300' : ''}
            `} 
        />
    </div>
);

export default PayBillBoard;
