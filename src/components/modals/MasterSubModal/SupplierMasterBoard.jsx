import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Truck } from 'lucide-react';

const SupplierMasterBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Supplier Master File"
            maxWidth="max-w-4xl"
            footer={
                <>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button className="px-8 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center gap-2">
                        <Trash2 size={14} /> Delete
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
            <div className="space-y-4 min-h-[500px]">
                <div className="border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-[#0078d4]" />
                    <h2 className="text-sm font-bold text-gray-800">Enter New Supplier Details & Update</h2>
                </div>

                <div className="space-y-3">
                    {/* Supplier ID / Name */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Supplier ID / Name</label>
                        <input type="text" className="w-[120px] h-7 border border-blue-400 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-blue-50/10" placeholder="VND0001" />
                        <div className="flex-1 flex gap-1">
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            <button className="w-7 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm transition-colors">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>

                    <FormRow label="Distribution Company">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </FormRow>

                    <FormRow label="Address 1">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </FormRow>

                    <FormRow label="Address 2">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </FormRow>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Phone Number</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="w-[300px] flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[80px] shrink-0 text-center">Fax</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                    </div>

                    <FormRow label="E-Mail Address">
                        <input type="email" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </FormRow>

                    <FormRow label="Web Site">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                    </FormRow>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Contact Person</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="w-[300px] flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0 text-right pr-2">Credit Period</label>
                            <div className="flex-1 flex items-center gap-2">
                                <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                                <span className="text-xs font-bold text-gray-700">Days</span>
                            </div>
                        </div>
                    </div>

                    <FormRow label="Vendor Type">
                        <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none rounded-sm">
                            <option value=""></option>
                        </select>
                    </FormRow>

                    <FormRow label="Bank Detail">
                        <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none rounded-sm">
                            <option value=""></option>
                        </select>
                    </FormRow>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Branch</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0 text-right pr-2">A/C No</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">VAT Reg. No</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                        </div>
                        <div className="flex-1 flex justify-end">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" 
                                />
                                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                                    Supplier is Inactive
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center">
        <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">{label}</label>
        {children}
    </div>
);

export default SupplierMasterBoard;
