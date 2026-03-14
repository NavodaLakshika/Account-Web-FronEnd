import React from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Calendar, Building2, Plus, Edit } from 'lucide-react';

const CompanyBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Company Profile"
            maxWidth="max-w-4xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Plus size={14} /> Add New
                    </button>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <Edit size={14} /> Edit
                    </button>
                    <button className="px-6 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center gap-2">
                        <Trash2 size={14} /> Delete
                    </button>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e]">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-4 min-h-[500px]">
                <div className="border-b border-gray-200 pb-2 mb-4">
                    <h2 className="text-sm font-bold text-gray-800">Enter New Company Details & Update</h2>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Company ID / Name</label>
                        <input type="text" className="w-[120px] h-7 border border-blue-400 px-2 text-sm focus:border-blue-500 outline-none" />
                        <div className="flex-1 flex gap-1">
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                            <button className="w-7 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>

                    <FormRow label="Legal Company Name">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                    </FormRow>

                    <FormRow label="Address 1">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                    </FormRow>

                    <FormRow label="Address 2">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                    </FormRow>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Country</label>
                            <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none">
                                <option>&lt; Select Country... &gt;</option>
                            </select>
                        </div>
                        <div className="w-[300px] flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 shrink-0">Phone No:</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <FormRow label="E-Mail Address">
                        <input type="email" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                    </FormRow>

                    <FormRow label="Web Site">
                        <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                    </FormRow>

                    <FormRow label="Industry">
                        <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none">
                            <option>&lt; Select Industry... &gt;</option>
                        </select>
                    </FormRow>

                    <FormRow label="Company Organized">
                        <select className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none">
                            <option>&lt; Select Company Organized... &gt;</option>
                        </select>
                    </FormRow>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Business Start Date</label>
                        <div className="w-[180px] h-7 border border-gray-300 bg-white flex items-center px-2">
                            <span className="flex-1 text-sm">13/03/2026</span>
                            <Calendar size={14} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Acc.Year</label>
                        <div className="flex items-center gap-4">
                            <div className="w-[180px] h-7 border border-gray-300 bg-white flex items-center px-2">
                                <span className="flex-1 text-sm">13/03</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">To</span>
                            <div className="w-[180px] h-7 border border-gray-300 bg-white flex items-center px-2">
                                <span className="flex-1 text-sm">13/03</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[150px] shrink-0">Company Reg. No</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0 text-right pr-2">Tax ID</label>
                            <input type="text" className="flex-1 h-7 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" />
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

export default CompanyBoard;
