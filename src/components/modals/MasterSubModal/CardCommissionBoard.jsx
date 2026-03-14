import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, LogOut } from 'lucide-react';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Card Sale Commission Rate"
            maxWidth="max-w-xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6 py-4">
                <div className="bg-gray-50 p-8 border border-gray-200 rounded-sm space-y-5">
                    {/* Bank Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-semibold text-gray-600 w-[140px] shrink-0">Bank</label>
                        <select className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    {/* Card Type Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-semibold text-gray-600 w-[140px] shrink-0">Card Type</label>
                        <select className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option value=""></option>
                        </select>
                    </div>

                    {/* Commission Rate Input */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-semibold text-gray-600 w-[140px] shrink-0">Commission Rate</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                className="w-40 h-8 border border-gray-300 px-2 text-sm text-right focus:border-blue-500 outline-none rounded-sm"
                                placeholder="0.0"
                            />
                            <span className="text-sm font-bold text-gray-700">%</span>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CardCommissionBoard;
