import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { Landmark, ChevronDown, Check, Info, ArrowRightCircle, Calendar, RotateCcw, Save } from 'lucide-react';

const BankReconciliationBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Bank Reconciliation"
            maxWidth="max-w-7xl"
            footer={
                <>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Reset Work
                    </button>
                    <button className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center gap-2">
                        <Save size={14} /> Finish Now
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Selection Header */}
                <div className="grid grid-cols-12 gap-6 bg-gray-50 p-4 border border-gray-200">
                    <div className="col-span-12 lg:col-span-4 space-y-3">
                        <FormRow label="Statement Bank">
                            <div className="flex flex-1 relative items-center">
                                <Landmark size={14} className="absolute left-3 text-gray-400" />
                                <select className="w-full h-8 border border-gray-300 pl-9 pr-6 text-sm bg-white focus:border-blue-500 outline-none appearance-none">
                                    <option>Select Bank Account...</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 text-gray-400 pointer-events-none" />
                            </div>
                        </FormRow>
                        <FormRow label="Statement Date">
                            <div className="flex flex-1 items-center px-2 h-8 border border-gray-300 bg-white shadow-sm">
                                <span className="flex-1 text-sm font-medium">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </FormRow>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex flex-col justify-end gap-2">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-white border border-gray-300 p-2 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Statement Ending Balance</span>
                                <input type="text" className="w-full text-xl font-bold text-blue-800 outline-none" defaultValue="0.00" />
                            </div>
                            <div className="flex-1 bg-white border border-gray-300 p-2 space-y-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Cleared Balance</span>
                                <div className="text-xl font-bold text-gray-700 tracking-tight">0.00</div>
                            </div>
                            <div className="flex-1 bg-white border border-gray-300 p-2 space-y-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Reconciliation Delta</span>
                                <div className="text-2xl font-bold text-gray-900 tracking-tighter">0.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dual Ledger Portfolios */}
                <div className="grid grid-cols-2 gap-8 h-[400px]">
                    {/* Debit Column */}
                    <div className="flex flex-col border border-gray-300 bg-white rounded-sm overflow-hidden text-sm">
                        <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Debit Instrument Portfolio</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">0.00 Total</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                                    <tr>
                                        <th className="w-8 p-2 border-r border-gray-100">√</th>
                                        <th className="p-2 text-left border-r border-gray-100">Date</th>
                                        <th className="p-2 text-left border-r border-gray-100">Reference</th>
                                        <th className="p-2 text-right">Valuation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-blue-50/50 cursor-pointer border-b border-gray-100">
                                        <td className="p-2 text-center border-r border-gray-100"><input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" /></td>
                                        <td className="p-2 border-r border-gray-100 text-gray-600 font-medium">2026/03/10</td>
                                        <td className="p-2 border-r border-gray-100 font-bold text-gray-700 lowercase">DEP-00412</td>
                                        <td className="p-2 text-right font-bold text-gray-900">1,250.00</td>
                                    </tr>
                                    {[1, 2, 3].map(i => (
                                        <tr key={i} className="bg-gray-50/20 h-10 border-b border-gray-50">
                                            <td className="border-r border-gray-100"></td>
                                            <td className="border-r border-gray-100"></td>
                                            <td className="border-r border-gray-100"></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Credit Column */}
                    <div className="flex flex-col border border-gray-300 bg-white rounded-sm overflow-hidden text-sm">
                        <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Credit Instrument Portfolio</span>
                            <span className="text-[10px] font-bold text-[#d13438] bg-red-50 px-2 py-0.5 rounded-sm border border-red-100">0.00 Total</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                                    <tr>
                                        <th className="w-8 p-2 border-r border-gray-100">√</th>
                                        <th className="p-2 text-left border-r border-gray-100">Date</th>
                                        <th className="p-2 text-left border-r border-gray-100">Reference</th>
                                        <th className="p-2 text-right">Valuation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-red-50/50 cursor-pointer border-b border-gray-100">
                                        <td className="p-2 text-center border-r border-gray-100"><input type="checkbox" className="w-3.5 h-3.5 accent-[#d13438]" /></td>
                                        <td className="p-2 border-r border-gray-100 text-gray-600 font-medium">2026/03/08</td>
                                        <td className="p-2 border-r border-gray-100 font-bold text-gray-700 lowercase">ACH-REF-14</td>
                                        <td className="p-2 text-right font-bold text-gray-900">450.00</td>
                                    </tr>
                                    {[1, 2, 3].map(i => (
                                        <tr key={i} className="bg-gray-50/20 h-10 border-b border-gray-50">
                                            <td className="border-r border-gray-100"></td>
                                            <td className="border-r border-gray-100"></td>
                                            <td className="border-r border-gray-100"></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Comparison */}
                <div className="bg-gray-50 p-6 border border-gray-200 flex justify-between items-center rounded-sm">
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded-sm accent-blue-600" />
                            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700">Mass reconcile all unmatched portfolio items</span>
                        </label>
                    </div>
                    <div className="text-right">
                        <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Status Protocol</label>
                        <div className="text-xs font-bold italic text-gray-400">
                            * Ensure the Reconciliation Delta is zero before finalizing the statement protocol.
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

export default BankReconciliationBoard;
