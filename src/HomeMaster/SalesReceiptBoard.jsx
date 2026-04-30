import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RefreshCw, X, Save, Loader2, Trash2 } from 'lucide-react';

const SalesReceiptBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { id: '', name: '', qty: '0', amount: '0.00' }
    ]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Sales Receipt"
            maxWidth="max-w-[1000px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl gap-3">
                    <div className="flex gap-3">
                        <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none"></span>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 h-10 bg-[#ff3b30] text-white text-sm font-bold rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Trash2 size={14} /> DELETE
                        </button>
                        <button className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <RefreshCw size={14} /> CLEAR FORM
                        </button>
                        <button className="px-6 h-10 bg-[#2bb744] text-white text-sm font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Save size={14} /> SAVE RECEIPT
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 p-1 font-['Tahoma',_sans-serif] text-slate-700 overflow-y-auto max-h-[80vh] no-scrollbar">
                {/* 1. Header Information Section */}
                <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                        
                        {/* Document No */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document No</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" defaultValue="JOB001000001" readOnly className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-[#0285fd] bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly defaultValue="17/03/2026" className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm" />
                                <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Empty Space for Grid Alignment */}
                        <div className="col-span-4"></div>

                        {/* Customer */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Customer</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input type="text" readOnly placeholder="Select Customer..." className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer" />
                                <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Reference */}
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Reference</label>
                            <input type="text" className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>

                        {/* Empty Space for Grid Alignment */}
                        <div className="col-span-4"></div>

                        {/* Subject */}
                        <div className="col-span-8 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Subject</label>
                            <input type="text" className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>

                    </div>
                </div>

                {/* 2. Main Items Table Section */}
                <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden mt-4">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafd] border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2.5 border-r border-gray-200 w-40">Prod. ID</th>
                                <th className="px-3 py-2.5 border-r border-gray-200">Product Name</th>
                                <th className="px-3 py-2.5 border-r border-gray-200 w-28 text-right">Qty</th>
                                <th className="px-3 py-2.5 w-36 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                    <td className="px-2 py-1.5 border-r border-gray-100">
                                        <div className="flex gap-1">
                                            <input type="text" className="w-full h-7 px-2 text-[12px] font-mono text-[#0285fd] font-bold bg-transparent outline-none border border-transparent focus:border-blue-300 rounded-[3px]" />
                                            <button className="w-7 h-7 bg-[#0285fd]/10 text-[#0285fd] flex items-center justify-center hover:bg-[#0285fd] hover:text-white rounded-[3px] transition-all">
                                                <Search size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-gray-100">
                                        <input type="text" className="w-full h-7 px-2 text-[12px] font-bold text-gray-700 bg-transparent outline-none border border-transparent focus:border-blue-300 rounded-[3px]" />
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-gray-100">
                                        <input type="number" defaultValue="0" className="w-full h-7 px-2 text-[12px] text-right font-bold text-gray-700 bg-transparent outline-none border border-transparent focus:border-blue-300 rounded-[3px]" />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <input type="text" defaultValue="0.00" className="w-full h-7 px-2 text-[12px] text-right font-bold text-gray-700 bg-transparent outline-none" readOnly />
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/10 h-[180px]">
                                <td colSpan={4}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom display Area */}
                <div className="w-full h-24 bg-white border border-gray-200 rounded-[5px] shadow-sm"></div>
            </div>
        </SimpleModal>
    );
};

export default SalesReceiptBoard;
