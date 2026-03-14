import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Calendar, Info } from 'lucide-react';

const FixedAssetsBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="New Fixed Assets Item"
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
                        Use for property you purchase, track, and may eventually sell. Fixed assets are<br />
                        long-lived assets, such as land, buildings, furniture, equipment, and vehicles.
                    </p>
                </div>

                {/* Top Section */}
                <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-sm space-y-3">
                    <div className="flex items-center gap-3">
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Asset Number / Name</label>
                        <div className="flex flex-1 gap-2">
                            <input 
                                type="text" 
                                className="w-32 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm"
                                defaultValue="1"
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
                        <label className="text-[12px] font-semibold text-gray-600 w-[140px] shrink-0">Asset Accounts of</label>
                        <select className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white">
                            <option>&lt; Select Account &gt;</option>
                        </select>
                    </div>
                </div>

                {/* Middle Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Purchase Information */}
                    <div className="border border-gray-200 rounded-sm p-3 relative pt-5">
                        <span className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">Purchase Information</span>
                        <div className="space-y-2.5">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 block mb-1">Purchase Information</label>
                                <input type="text" className="w-full h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="text-[11px] font-bold text-gray-600">Asset is</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="asset_state" className="w-3.5 h-3.5 text-blue-600 border-gray-300" />
                                    <span className="text-xs text-gray-700">New</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="asset_state" className="w-3.5 h-3.5 text-blue-600 border-gray-300" />
                                    <span className="text-xs text-gray-700">Used</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Date</label>
                                <div className="flex-1 h-7 border border-gray-300 bg-white flex items-center px-2 rounded-sm">
                                    <span className="flex-1 text-sm">13/03/2026</span>
                                    <Calendar size={14} className="text-gray-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Cost</label>
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Vender / Payee</label>
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Sales Information */}
                    <div className="border border-gray-200 rounded-sm p-3 relative pt-5">
                        <span className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">Sales Information</span>
                        <div className="space-y-2.5">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 block mb-1">Sales Description</label>
                                <input type="text" className="w-full h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div className="flex justify-end pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-blue-600" />
                                    <span className="text-xs font-bold text-gray-600">Asset is sold</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Sales Date</label>
                                <div className="flex-1 h-7 border border-gray-300 bg-white flex items-center px-2 rounded-sm">
                                    <span className="flex-1 text-sm">13/03/2026</span>
                                    <Calendar size={14} className="text-gray-400" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Sales Price</label>
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-600 w-24">Sales Expense</label>
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Information */}
                <div className="border border-gray-200 rounded-sm p-4 relative pt-5">
                    <span className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">Asset Information</span>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Asset Description</label>
                            <input type="text" className="w-full h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 block mb-1">Location</label>
                                <input type="text" className="w-full h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 block mb-1">Serial Number</label>
                                <input type="text" className="w-full h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 block mb-1">Warranty Expires</label>
                                <div className="w-full h-7 border border-gray-300 bg-white flex items-center px-2 rounded-sm">
                                    <span className="flex-1 text-sm text-gray-700">13/03/2026</span>
                                    <Calendar size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Note</label>
                            <textarea className="w-full h-16 border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none rounded-sm resize-none" />
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default FixedAssetsBoard;
