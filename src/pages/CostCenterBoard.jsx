import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, X } from 'lucide-react';

const CostCenterBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Cost Center Master"
            maxWidth="max-w-2xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6 py-4">
                <div className="bg-gray-50 p-6 border border-gray-200 rounded-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0">Cost center</label>
                        <div className="flex flex-1 gap-2">
                            <input 
                                type="text" 
                                className="w-32 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="ID"
                            />
                            <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Cost Center Name"
                                />
                                <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm transition-colors">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pr-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" 
                            />
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                                Cost Center Inactive
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CostCenterBoard;
