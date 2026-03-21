import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { BarChart3, ChevronDown, Check, Info, FileText, Calendar, RotateCcw, Printer, Download , X} from 'lucide-react';

const TrialBalanceBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Trial Balance Report"
            maxWidth="max-w-7xl"
            footer={
                <>
                    <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                        <Printer size={14} /> Print Report
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                        <X size={14} /> Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Filter Controls */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
                    <div className="grid grid-cols-12 gap-6 items-end">
                        <div className="col-span-12 lg:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Report Date From</label>
                            <div className="flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm">
                                <span className="flex-1 text-sm">2026/01/01</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Report Date To</label>
                            <div className="flex items-center px-3 h-9 border border-gray-300 bg-white shadow-sm rounded-sm">
                                <span className="flex-1 text-sm">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Cost Center Unit</label>
                            <div className="relative">
                                <select className="w-full h-9 border border-gray-300 px-3 text-sm bg-white focus:border-blue-500 outline-none appearance-none rounded-sm">
                                    <option>GLOBAL COST REPOSITORY</option>
                                    <option>Headquarters (HQ)</option>
                                    <option>Regional Branch</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-2">
                            <button className="w-full h-9 bg-[#0078d4] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#005a9e] shadow-sm">
                                Run Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trial Balance Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden bg-white">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase">
                            <tr>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Account Code</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Account Nomenclature</th>
                                <th className="py-2 px-4 text-left border-r border-gray-200">Category</th>
                                <th className="py-2 px-4 text-right border-r border-gray-200">Debit (Current)</th>
                                <th className="py-2 px-4 text-right">Credit (Current)</th>
                            </tr>
                        </thead>
                        <tbody>
                             <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-100 font-medium">10100</td>
                                <td className="p-2 border-r border-gray-100">Main Operating Account</td>
                                <td className="p-2 border-r border-gray-100 text-gray-500">Asset</td>
                                <td className="p-2 border-r border-gray-100 text-right font-mono text-blue-700">12,450.00</td>
                                <td className="p-2 text-right font-mono text-gray-400">0.00</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-2 border-r border-gray-100 font-medium">20100</td>
                                <td className="p-2 border-r border-gray-100">Accounts Payable</td>
                                <td className="p-2 border-r border-gray-100 text-gray-500">Liability</td>
                                <td className="p-2 border-r border-gray-100 text-right font-mono text-gray-400">0.00</td>
                                <td className="p-2 text-right font-mono text-red-700">5,200.00</td>
                            </tr>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="border-b border-gray-50 h-8 bg-gray-50/10">
                                    <td className="border-r border-gray-100"></td>
                                    <td className="border-r border-gray-100"></td>
                                    <td className="border-r border-gray-100"></td>
                                    <td className="border-r border-gray-100"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold uppercase tracking-tight text-[11px] text-gray-700">
                            <tr>
                                <td colSpan="3" className="p-3 text-right">Consolidated Totals</td>
                                <td className="p-3 text-right font-mono text-blue-700 text-sm">12,450.00</td>
                                <td className="p-3 text-right font-mono text-red-700 text-sm">5,200.00</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>Precision: 2 Decimal Places</span>
                    <span>System Time: 2026-03-12 10:45:22</span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default TrialBalanceBoard;
