import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Landmark, RotateCcw, Save, Trash2, Send } from 'lucide-react';

const WriteChequeBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses Portfolio');

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Write Cheque"
            maxWidth="max-w-6xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button className="px-6 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center gap-2">
                        <Trash2 size={14} /> Void
                    </button>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Send size={14} /> Commit Cheque
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7 space-y-3">
                        <FormRow label="Document ID">
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 border border-blue-100 rounded-sm">WCH001000004</span>
                        </FormRow>

                        <FormRow label="Settlement Bank">
                            <div className="flex flex-1 relative items-center">
                                <Landmark size={14} className="absolute left-3 text-gray-400" />
                                <select className="w-full h-8 border border-gray-300 pl-9 pr-6 text-sm bg-white focus:border-blue-500 outline-none appearance-none">
                                    <option>Select Bank Account...</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 text-gray-400 pointer-events-none" />
                            </div>
                        </FormRow>

                        <FormRow label="Cost Center">
                            <select className="flex-1 h-8 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none">
                                <option>Select Cost Center...</option>
                            </select>
                        </FormRow>

                        <div className="bg-gray-50 p-4 border border-gray-200 space-y-3 rounded-sm">
                            <FormRow label="Pay to order">
                                <div className="flex flex-1 gap-1">
                                    <input type="text" className="w-24 h-8 border border-gray-300 px-2 text-sm bg-gray-100" defaultValue="VEN-14" readOnly />
                                    <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" placeholder="Payee name..." />
                                    <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>
                            <FormRow label="Endorsement">
                                <div className="flex items-center gap-4 flex-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Registered Payee</span>
                                    </label>
                                    <select className="flex-1 h-8 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none">
                                        <option>Select...</option>
                                    </select>
                                </div>
                            </FormRow>
                        </div>

                        <FormRow label="Postal Address">
                            <textarea className="flex-1 h-20 border border-gray-300 p-2 text-sm resize-none focus:border-blue-500 outline-none" placeholder="Delivery address..."></textarea>
                        </FormRow>
                    </div>

                    <div className="col-span-12 lg:col-span-5 bg-gray-50 p-6 border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase">Cheque Date</label>
                            <div className="w-40 h-8 border border-gray-300 bg-white flex items-center px-2">
                                <span className="flex-1 text-sm">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-5 h-5 border border-gray-300 rounded-sm" />
                                <span className="text-xs font-bold text-gray-700 uppercase">Electronic Submission</span>
                            </label>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Cheque No</label>
                                    <input type="checkbox" className="w-4 h-4" />
                                </div>
                                <input type="text" className="w-40 h-8 border border-gray-300 px-2 text-sm font-mono" placeholder="XXXX-XXXX" />
                            </div>
                        </div>

                        <div className="pt-6 border-t font-medium border-gray-200">
                            <div className="text-right">
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">TOTAL AMOUNT</label>
                                <div className="text-4xl font-bold text-gray-900 tracking-tighter">0.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounting Table */}
                <div className="border border-gray-300">
                    <div className="flex bg-gray-100 border-b border-gray-300">
                        {['Expenses Portfolio', 'Regional Cost Centers'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-6 py-2 text-xs font-bold border-r border-gray-300 transition-colors ${selectedTab === tab ? 'bg-white text-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-300 text-gray-700 font-bold uppercase">
                                <tr>
                                    <th className="w-12 py-2 px-3 border-r border-gray-200">#</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200 w-1/3">Ledger Account</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Cost Center</th>
                                    <th className="w-40 py-2 px-4 text-right border-r border-gray-200">Net Valuation</th>
                                    <th className="py-2 px-4 text-left">Description / Transcript</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="p-2 text-center text-gray-400 font-medium">1</td>
                                    <td className="p-1">
                                        <select className="w-full h-8 border border-gray-300 px-1 text-xs"><option>Select Account...</option></select>
                                    </td>
                                    <td className="p-1">
                                        <select className="w-full h-8 border border-gray-300 px-1 text-xs"><option>Select Center...</option></select>
                                    </td>
                                    <td className="p-1">
                                        <input type="text" className="w-full h-8 border border-gray-300 px-2 text-right text-sm font-bold" defaultValue="0.00" />
                                    </td>
                                    <td className="p-1">
                                        <input type="text" className="w-full h-8 border border-gray-300 px-2 text-xs italic" placeholder="Transaction details..." />
                                    </td>
                                </tr>
                                {[2, 3].map(i => (
                                    <tr key={i} className="border-b border-gray-100 bg-gray-50/30 h-10">
                                        <td className="p-2 text-center text-gray-300"></td>
                                        <td className="p-1"></td>
                                        <td className="p-1"></td>
                                        <td className="p-1"></td>
                                        <td className="p-1"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Delta / Comparison */}
                <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-200">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 uppercase">Account Delta:</span>
                        <div className="w-40 h-8 border border-gray-300 bg-white flex items-center justify-end px-3 font-bold text-gray-700">0.00</div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center">
        <label className="text-xs font-semibold text-gray-600 w-[120px] shrink-0">{label}</label>
        {children}
    </div>
);

export default WriteChequeBoard;
