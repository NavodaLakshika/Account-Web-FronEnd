import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, RotateCcw, Save, Trash2 } from 'lucide-react';

const PettyCashBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses Allocation');

    return (
        <SimpleModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Petty Cash Entry"
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
                        <Save size={14} /> Save
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
                    <div className="col-span-12 lg:col-span-7 space-y-3">
                        <FormRow label="Reference ID">
                            <div className="flex flex-1 gap-1">
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 font-bold" defaultValue="PTC001000008" readOnly />
                                <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200">
                                    <Search size={14} />
                                </button>
                            </div>
                        </FormRow>

                        <FormRow label="Source Account">
                            <div className="flex flex-1 gap-1">
                                <select className="w-32 h-8 border border-gray-300 px-1 text-sm"><option>ACC-01</option></select>
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" defaultValue="PETTY CASH LIQUIDITY FUND" readOnly />
                            </div>
                        </FormRow>

                        <FormRow label="Vendor / Payee">
                            <div className="flex flex-1 gap-1">
                                <div className="flex items-center gap-2 mr-2">
                                    <input type="checkbox" id="is-vendor" className="w-4 h-4" />
                                    <label htmlFor="is-vendor" className="text-xs font-semibold">Vendor</label>
                                </div>
                                <input type="text" className="w-24 h-8 border border-gray-300 px-2 text-sm" placeholder="ID..." />
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" placeholder="Payee name..." />
                                <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200">
                                    <Search size={14} />
                                </button>
                            </div>
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Cost Center">
                                <select className="flex-1 h-8 border border-gray-300 px-1 text-sm"><option>Select...</option></select>
                            </FormRow>
                            <label className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-600">Recipient:</span>
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" />
                            </label>
                        </div>

                        <FormRow label="Memo">
                            <textarea className="flex-1 h-16 border border-gray-300 p-2 text-sm resize-none" placeholder="Enter notes..."></textarea>
                        </FormRow>
                    </div>

                    <div className="col-span-12 lg:col-span-5 bg-gray-50 p-6 border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase">Date</label>
                            <div className="w-40 h-8 border border-gray-300 bg-white flex items-center px-2">
                                <span className="flex-1 text-sm">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase">Due Date</label>
                            <div className="w-40 h-8 border border-gray-300 bg-white flex items-center px-2">
                                <span className="flex-1 text-sm text-gray-400">2026/03/12</span>
                                <Calendar size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase">Voucher No</label>
                            <input type="text" className="w-40 h-8 border border-gray-300 px-2 text-sm bg-gray-100" placeholder="Auto..." readOnly />
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <div className="text-right">
                                <label className="text-xs font-bold text-gray-500 block mb-1">VOUCHER VALUE</label>
                                <div className="text-3xl font-bold text-blue-800">0.00</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="border border-gray-300">
                    <div className="flex bg-gray-100 border-b border-gray-300">
                        {['Expenses Allocation', 'Structural Units'].map((tab) => (
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
                                    <th className="w-12 py-2 px-3 border-r border-gray-200">ID</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Account Name</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Cost Center</th>
                                    <th className="w-32 py-2 px-4 text-right border-r border-gray-200">Amount</th>
                                    <th className="py-2 px-4 text-left">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="p-2 text-center text-gray-500">1</td>
                                    <td className="p-1">
                                        <select className="w-full h-7 border border-gray-300 px-1 text-xs"><option>GENERAL EXPENSE</option></select>
                                    </td>
                                    <td className="p-1">
                                        <select className="w-full h-7 border border-gray-300 px-1 text-xs"><option>OFFICE MGMT</option></select>
                                    </td>
                                    <td className="p-1">
                                        <input type="text" className="w-full h-7 border border-gray-300 px-2 text-right text-sm" defaultValue="0.00" />
                                    </td>
                                    <td className="p-1">
                                        <input type="text" className="w-full h-7 border border-gray-300 px-2 text-xs" placeholder="Transaction details..." />
                                    </td>
                                </tr>
                                {[2, 3, 4].map(i => (
                                    <tr key={i} className="border-b border-gray-100 bg-gray-50/30">
                                        <td className="p-2 text-center text-gray-300">{i}</td>
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

                {/* Footer Totals */}
                <div className="flex justify-between items-end bg-gray-50 p-4 border border-gray-200">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-xs font-medium text-gray-700">Prepare Print Spool</span>
                        </label>
                        <button className="text-[10px] text-blue-600 hover:underline font-bold uppercase tracking-wider">Register Account Mapping</button>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block">Variance</span>
                            <div className="text-lg font-mono font-bold text-red-600">0.00</div>
                        </div>
                        <div className="text-right border-l border-gray-200 pl-8">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block">Total</span>
                            <div className="text-3xl font-bold text-gray-900 tracking-tight">0.00</div>
                        </div>
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

export default PettyCashBoard;
