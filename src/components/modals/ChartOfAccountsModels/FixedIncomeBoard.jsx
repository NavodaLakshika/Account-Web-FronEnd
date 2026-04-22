import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, RotateCcw , X} from 'lucide-react';

const FixedIncomeBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Fixed Income"
            maxWidth="max-w-4xl"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-4">
                {/* Info Header */}
                <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px] shadow-sm">
                    <p className="text-[12.5px] font-bold text-[#0369a1] text-center leading-relaxed italic">
                        Money received regularly from doing work or investment for long term
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-white p-4 border border-gray-200 rounded-[5px] space-y-3 shadow-sm">
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Income Accounts of</label>
                        <select className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Buyer</label>
                        <input 
                            type="text" 
                            className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Date of Credit</label>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                className="w-48 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm"
                            />
                            <select className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Credit Amount</label>
                        <input 
                            type="text" 
                            className="w-48 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-blue-600 shadow-sm text-right"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[300px] bg-white shadow-sm">
                    <div className="flex bg-gray-50 border-b border-gray-300">
                        <div className="w-12 border-r border-gray-300 py-1" />
                        <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Buyer</div>
                        <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Income</div>
                        <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Date</div>
                        <div className="w-40 px-4 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-center">Amount</div>
                    </div>
                    <div className="flex-1 bg-slate-50/20" />
                </div>
            </div>
        </SimpleModal>
    );
};

export default FixedIncomeBoard;
