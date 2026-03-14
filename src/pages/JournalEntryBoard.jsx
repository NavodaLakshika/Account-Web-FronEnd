import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { BookOpen, Search, RotateCcw, Save, Trash2, Calendar, Plus } from 'lucide-react';

const JournalEntryBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Journal Entry"
            maxWidth="max-w-6xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Submit Entry
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-4 space-y-3">
                        <FormRow label="Entry ID">
                            <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 font-bold" defaultValue="GEN-001" readOnly />
                        </FormRow>
                        <FormRow label="Entry Date">
                            <div className="flex flex-1 items-center px-2 h-8 border border-gray-300 bg-white shadow-sm">
                                <span className="flex-1 text-sm font-medium">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </FormRow>
                    </div>

                    <div className="col-span-12 lg:col-span-8">
                        <FormRow label="Internal Note">
                            <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" placeholder="Describe the purpose of this entry..." />
                        </FormRow>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase">
                            <tr>
                                <th className="w-10 py-2 px-3 border-r border-gray-200">#</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Account Nomenclature</th>
                                <th className="w-40 py-2 px-4 text-right border-r border-gray-200">Debit Vol.</th>
                                <th className="w-40 py-2 px-4 text-right border-r border-gray-200">Credit Vol.</th>
                                <th className="py-2 px-4 text-left">Record Memo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-2 text-center text-gray-400 font-medium">01</td>
                                <td className="p-1">
                                    <div className="flex gap-1">
                                        <select className="flex-1 h-8 border border-gray-300 px-1 text-xs"><option>Select Account...</option></select>
                                        <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-right text-sm font-bold text-blue-700 font-mono" defaultValue="0.00" />
                                </td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-right text-sm font-bold text-gray-400 font-mono" defaultValue="0.00" />
                                </td>
                                <td className="p-1">
                                    <input type="text" className="w-full h-8 border border-gray-300 px-2 text-xs italic" placeholder="..." />
                                </td>
                            </tr>
                            {[1, 2, 3, 4].map(i => (
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
                            <Plus size={12} /> New Line Item
                        </button>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 p-6 border border-gray-200 rounded-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-20">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Debit</span>
                                <div className="text-4xl font-bold text-gray-900 tracking-tighter">0.00</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Credit</span>
                                <div className="text-4xl font-bold text-gray-900 tracking-tighter">0.00</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <label className="text-xs font-bold text-blue-600 uppercase block mb-1">Entry Status</label>
                            <div className="inline-flex px-4 py-1.5 bg-white border border-gray-300 rounded-sm text-[10px] font-bold tracking-widest uppercase text-gray-400">
                                Out of Balance
                            </div>
                        </div>
                    </div>
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

export default JournalEntryBoard;
