import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, Edit2, LogOut } from 'lucide-react';

const DepreciationBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Assets Depreciation Rate"
            maxWidth="max-w-3xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Info Header */}
                <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-sm">
                    <p className="text-[13px] font-bold text-[#0369a1] text-center leading-relaxed">
                        Depreciation is a decline in value, especially the reduction in the value of<br />
                        a fixed asset charge as an expense when calculation profit and loss.
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-sm space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Assets Accounts of</label>
                        <select className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Depreciation Rate</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                className="w-48 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <span className="text-sm font-bold text-gray-700">%</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-300 rounded-sm overflow-hidden flex flex-col min-h-[250px] bg-white">
                    <div className="grid grid-cols-12 bg-white border-b border-gray-300">
                        <div className="col-span-10 px-3 py-1 text-[11px] font-bold text-gray-600 border-r border-gray-300">Account</div>
                        <div className="col-span-2 px-3 py-1 text-[11px] font-bold text-gray-600">Rate</div>
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
