import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Calendar } from 'lucide-react';

const LongTermLiabilityBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Long Term Liability"
            maxWidth="max-w-4xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e]">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Info Header */}
                <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-sm">
                    <p className="text-[13px] font-bold text-[#0369a1] text-center leading-relaxed">
                        Long term liability, The company being obliged to do something over one year<br />
                        duration time, such as Bank Loan, Lease, Third Party Loan.
                    </p>
                </div>

                {/* Main Section */}
                <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-sm space-y-3">
                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[160px] shrink-0">Liability Number/Name</label>
                        <div className="flex flex-1 gap-2">
                            <input 
                                type="text" 
                                className="w-40 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                                />
                                <button className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[160px] shrink-0">Liability Accounts of</label>
                        <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[160px] shrink-0">Lender</label>
                        <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[160px] shrink-0">Current Balance</label>
                        <input 
                            type="text" 
                            className="w-40 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="border border-gray-200 rounded-sm p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Description</label>
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </div>

                    <div className="grid grid-cols-12 gap-x-6 gap-y-3">
                        <div className="col-span-5 flex items-center gap-3">
                            <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Amount</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                            <label className="text-[12px] font-semibold text-gray-600 shrink-0">Term</label>
                            <input type="text" className="w-20 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12px] font-semibold text-gray-600 shrink-0">Payment Type</label>
                            <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none rounded-sm">
                                <option value=""></option>
                            </select>
                        </div>

                        <div className="col-span-5 flex items-center gap-3">
                            <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Origination Date</label>
                            <div className="flex-1 h-7 border border-gray-300 bg-white flex items-center px-2 rounded-sm cursor-pointer">
                                <span className="flex-1 text-sm">13/03/2026</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="col-span-7 flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <label className="text-[12px] font-semibold text-gray-600 shrink-0">No of Installment</label>
                                <label className="text-[12px] font-semibold text-gray-600 shrink-0 ml-auto">Monthly Installment</label>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="text" className="w-[180px] h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                        </div>

                        <div className="col-span-5 flex items-center gap-3">
                            <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Interest Rate</label>
                            <div className="flex-1 flex items-center gap-2">
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" defaultValue="0" />
                                <span className="text-sm font-bold text-gray-700">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[110px] shrink-0">Due Date of Payment</label>
                        <input 
                            type="number" 
                            className="w-24 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" 
                            defaultValue="1"
                        />
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default LongTermLiabilityBoard;
