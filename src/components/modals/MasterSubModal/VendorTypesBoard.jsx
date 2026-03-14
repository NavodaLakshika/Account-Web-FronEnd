import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Save, RotateCcw, Trash2 } from 'lucide-react';

const VendorTypesBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Vendor Types"
            maxWidth="max-w-2xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button className="px-8 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center gap-2">
                        <Trash2 size={14} /> Delete
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4 py-4 min-h-[120px]">
                <div className="bg-gray-50/50 p-6 border border-gray-200 rounded-sm space-y-4">
                    {/* Vendor Field */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[100px] shrink-0">Vendor</label>
                        <div className="flex-1 flex gap-1">
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Account Field */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-semibold text-gray-600 w-[100px] shrink-0">Account</label>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                className="w-32 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                            />
                            <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                                />
                                <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default VendorTypesBoard;
