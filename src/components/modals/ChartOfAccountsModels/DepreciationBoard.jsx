import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, Edit2, LogOut , X} from 'lucide-react';

const DepreciationBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Assets Depreciation Rate"
            maxWidth="max-w-3xl"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-6 h-10 bg-[#e49e1b] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-amber-200 hover:bg-[#ffb326] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-4">
                {/* Info Header */}
                <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px]">
                    <p className="text-[12.5px] font-bold text-[#0369a1] text-center leading-relaxed italic">
                        Depreciation is a decline in value, especially the reduction in the value of<br />
                        a fixed asset charge as an expense when calculation profit and loss.
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-white p-4 border border-gray-200 rounded-[5px] space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Assets Accounts of</label>
                        <select className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Depreciation Rate</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                className="w-48 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] font-bold text-blue-600 shadow-sm text-center"
                            />
                            <span className="text-sm font-black text-gray-600">%</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[250px] bg-white shadow-sm">
                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-300">
                        <div className="col-span-10 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Account</div>
                        <div className="col-span-2 px-4 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-center">Rate</div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white">
                        {/* Empty state for now */}
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default DepreciationBoard;
