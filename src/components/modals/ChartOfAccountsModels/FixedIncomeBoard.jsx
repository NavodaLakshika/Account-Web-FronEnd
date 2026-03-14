import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, RotateCcw } from 'lucide-react';

const FixedIncomeBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Fixed Income"
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
                        Money received regularly from doing work or investment for long term
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-sm space-y-3">
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Income Accounts of</label>
                        <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Buyer</label>
                        <input 
                            type="text" 
                            className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Date of Credit</label>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                className="w-48 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Credit Amount</label>
                        <input 
                            type="text" 
                            className="w-48 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-300 rounded-sm overflow-hidden flex flex-col min-h-[300px] bg-white">
                    <div className="flex bg-[#f8f9fa] border-b border-gray-300">
                        <div className="w-12 border-r border-gray-300 py-1" />
                        <div className="flex-1 px-3 py-1 text-[11px] font-bold text-gray-600 border-r border-gray-300">Buyer</div>
                        <div className="flex-1 px-3 py-1 text-[11px] font-bold text-gray-600 border-r border-gray-300">Income</div>
                        <div className="flex-1 px-3 py-1 text-[11px] font-bold text-gray-600 border-r border-gray-300">Date</div>
                        <div className="w-40 px-3 py-1 text-[11px] font-bold text-gray-600">Amount</div>
                    </div>
                    <div className="flex-1 bg-[#a3a3a3]/20" />
                </div>
            </div>
        </SimpleModal>
    );
};

export default FixedIncomeBoard;
