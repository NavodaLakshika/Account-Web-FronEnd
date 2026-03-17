import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Calendar, ChevronDown } from 'lucide-react';

const ChequeRegisterBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Enter New Cheque Book"
            maxWidth="max-w-[700px]"
        >
            <div className="flex gap-4 p-1 font-['Plus_Jakarta_Sans']">
                {/* Main Form Area */}
                <div className="flex-1 bg-white border border-gray-200 rounded p-5 space-y-4 shadow-sm">
                    {/* Account Row */}
                    <div className="flex items-center gap-4">
                        <label className="text-[12px] font-bold text-gray-600 w-32">Account</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded h-8 px-2 bg-white group focus-within:border-[#0078d4]">
                            <select className="flex-1 text-[12px] outline-none bg-transparent appearance-none cursor-pointer">
                                <option>&lt; Select Account &gt;</option>
                            </select>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                    </div>

                    {/* Cheque Book No & Date Row */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-32">Cheque Book No</label>
                            <input 
                                type="text" 
                                defaultValue="1"
                                className="flex-1 h-8 border border-gray-300 rounded px-2 text-[12px] outline-none focus:border-[#0078d4]"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-[220px]">
                            <label className="text-[12px] font-bold text-gray-600">Date</label>
                            <div className="flex-1 flex items-center border border-gray-300 rounded h-8 px-2 bg-white shadow-sm overflow-hidden">
                                <input type="text" defaultValue="17/03/2026" className="flex-1 text-[12px] outline-none" />
                                <button className="h-full pl-2 border-l border-gray-100 text-[#0078d4]">
                                    <Calendar size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Start & End Cheque No Row */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-600 w-32">Start Cheque No</label>
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 rounded px-2 text-[12px] outline-none focus:border-[#0078d4]"
                            />
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-600 w-28 text-right pr-2">End Cheque No</label>
                            <input 
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 rounded px-2 text-[12px] outline-none focus:border-[#0078d4]"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Bank of Action Buttons */}
                <div className="w-[120px] flex flex-col gap-2">
                    <button className="w-full h-8 bg-[#0078d4] text-white text-[12px] font-black uppercase tracking-wider rounded border border-[#005a9e] shadow-md hover:bg-[#005a9e] active:scale-95 transition-all">
                        OK
                    </button>
                    <button className="w-full h-8 bg-[#0078d4] text-white text-[12px] font-black uppercase tracking-wider rounded border border-[#005a9e] shadow-md hover:bg-[#005a9e] active:scale-95 transition-all">
                        Clear
                    </button>
                    <button onClick={onClose} className="w-full h-8 bg-[#0078d4] text-white text-[12px] font-black uppercase tracking-wider rounded border border-[#005a9e] shadow-md hover:bg-[#005a9e] active:scale-95 transition-all">
                        Exit
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ChequeRegisterBoard;
