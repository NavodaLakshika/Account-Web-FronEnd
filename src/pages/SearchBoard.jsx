import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Database, User, Truck, Hash, FileSearch, Trash2, RotateCcw, Download } from 'lucide-react';

const SearchBoard = ({ isOpen, onClose }) => {
    const [entityType, setEntityType] = useState('Customer');

    return (
        <SimpleModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Archive Retrieval & Search"
            maxWidth="max-w-[95vw]"
            footer={
                <>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <RotateCcw size={14} /> Clear Search
                    </button>
                    <button className="px-6 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2">
                        <Download size={14} /> Export Results
                    </button>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Search Filters */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Transaction Params */}
                        <div className="col-span-12 lg:col-span-3 space-y-3">
                            <FormRow label="Stream">
                                <select className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white focus:border-blue-500 outline-none">
                                    <option>Commercial Sale</option>
                                    <option>Procurement / Purchase</option>
                                </select>
                            </FormRow>
                            <FormRow label="Doc ID">
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm" placeholder="ID-0000..." />
                            </FormRow>
                        </div>

                        {/* Entity Selection */}
                        <div className="col-span-12 lg:col-span-5 space-y-3 border-x border-gray-200 px-6">
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={entityType === 'Customer'} onChange={() => setEntityType('Customer')} className="w-4 h-4" />
                                    <span className="text-xs font-bold text-gray-600">Customer</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={entityType === 'Supplier'} onChange={() => setEntityType('Supplier')} className="w-4 h-4" />
                                    <span className="text-xs font-bold text-gray-600">Supplier</span>
                                </label>
                            </div>
                            <div className="flex gap-1">
                                <input type="text" className="w-20 h-8 border border-gray-300 px-2 text-xs bg-gray-100" defaultValue="S-001" readOnly />
                                <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" placeholder="Search entity name..." />
                                <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200">
                                    <Search size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Valuation</label>
                                    <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-right text-sm" defaultValue="0.00" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Unit</label>
                                    <select className="flex-1 h-8 border border-gray-300 px-1 text-xs bg-white"><option>GLOBAL</option></select>
                                </div>
                            </div>
                        </div>

                        {/* Date Range & Action */}
                        <div className="col-span-12 lg:col-span-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                                    <div className="flex items-center px-2 h-8 border border-gray-300 bg-white">
                                        <span className="flex-1 text-xs">2026/01/01</span>
                                        <Calendar size={14} className="text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                                    <div className="flex items-center px-2 h-8 border border-gray-300 bg-white">
                                        <span className="flex-1 text-xs">2026/03/12</span>
                                        <Calendar size={14} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <button className="w-full h-10 bg-[#0078d4] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#005a9e] shadow-sm flex items-center justify-center gap-2">
                                <FileSearch size={16} /> Search Archive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] whitespace-nowrap">
                            <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase">
                                <tr>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Entry Date</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Doc ID</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Entity Details</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Reference</th>
                                    <th className="py-2 px-4 text-left border-r border-gray-200">Inst. No</th>
                                    <th className="py-2 px-4 text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer">
                                    <td className="p-2 border-r border-gray-100 text-gray-600">2026/01/21</td>
                                    <td className="p-2 border-r border-gray-100 font-bold text-blue-700">INV01000001</td>
                                    <td className="p-2 border-r border-gray-100">CASH SALES REVENUE</td>
                                    <td className="p-2 border-r border-gray-100 text-gray-400 italic">SYSTEM-MIGRATED</td>
                                    <td className="p-2 border-r border-gray-100">---</td>
                                    <td className="p-2 text-right font-bold text-gray-900">9,000.00</td>
                                </tr>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <tr key={i} className="border-b border-gray-50 h-9 bg-gray-50/10">
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
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
        </SimpleModal>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center">
        <label className="text-[10px] font-bold text-gray-500 w-[70px] shrink-0 uppercase">{label}</label>
        {children}
    </div>
);

export default SearchBoard;
