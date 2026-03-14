import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { Landmark, Search, RotateCcw, Save, Trash2, Calendar, Plus } from 'lucide-react';

const MakeDepositBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Make Deposit"
            maxWidth="max-w-5xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Submit Deposit
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <FormRow label="Deposit To">
                            <div className="flex flex-1 relative items-center">
                                <Landmark size={14} className="absolute left-3 text-gray-400" />
                                <select className="w-full h-8 border border-gray-300 pl-9 pr-6 text-sm bg-white focus:border-blue-500 outline-none appearance-none">
                                    <option>Select Bank Account...</option>
                                    <option>Checking Account</option>
                                    <option>Business Savings</option>
                                </select>
                            </div>
                        </FormRow>
                        <FormRow label="Deposit Date">
                            <div className="flex flex-1 items-center px-2 h-8 border border-gray-300 bg-white shadow-sm">
                                <span className="flex-1 text-sm font-medium">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </FormRow>
                    </div>

                    <div className="space-y-3">
                        <FormRow label="Memo / Ref">
                            <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" placeholder="Deposit source description..." />
                        </FormRow>
                        <div className="bg-green-50 p-4 border border-green-100 rounded-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-green-700 uppercase">Total Deposit Amount:</span>
                                <span className="text-2xl font-bold text-green-900">0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deposit Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase">
                            <tr>
                                <th className="w-10 py-2 px-3 border-r border-gray-200">#</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Received From</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Account Mapping</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Memo / Details</th>
                                <th className="w-40 py-2 px-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-2 text-center text-gray-400 font-medium">01</td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-xs" placeholder="Payer name..." />
                                </td>
                                <td className="p-1">
                                    <select className="w-full h-8 border border-gray-300 px-1 text-xs"><option>Select Account...</option></select>
                                </td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-xs italic" placeholder="..." />
                                </td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-right text-sm font-bold" defaultValue="0.00" />
                                </td>
                            </tr>
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="border-b border-gray-100 bg-gray-50/30 h-8">
                                    <td className="p-1 border-r border-gray-100"></td>
                                    <td className="p-1 border-r border-gray-100"></td>
                                    <td className="p-1 border-r border-gray-100"></td>
                                    <td className="p-1 border-r border-gray-100"></td>
                                    <td className="p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <button className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 text-[10px] font-bold uppercase rounded-sm hover:bg-gray-100 flex items-center gap-2">
                            <Plus size={12} /> Add Line Entry
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-xs font-semibold text-gray-700">Print deposit confirmation</span>
                    </label>
                </div>
            </div>
        </SimpleModal>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center">
        <label className="text-xs font-semibold text-gray-600 w-[120px] shrink-0 font-medium">{label}</label>
        {children}
    </div>
);

export default MakeDepositBoard;
