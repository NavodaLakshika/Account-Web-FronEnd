import React from 'react';import { X } from 'lucide-react';

import SimpleModal from '../components/SimpleModal';

const AccountBalanceBoard = ({ isOpen, onClose }) => {
    const data = [
        { name: 'Petty Cash', balance: '-3,000.00' },
        { name: 'Cash In Hand', balance: '-303,000.00' },
        { name: 'Current Account', balance: '' }
    ];

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Account Balance"
            maxWidth="max-w-[600px]"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 pl-4">
                        <span className="text-[24px] font-black italic text-[#0078d4]/30 tracking-tighter select-none">onimta IT</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                            <X size={14} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="p-1 font-['Plus_Jakarta_Sans']">
                <div className="border border-gray-300 rounded shadow-sm overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f3f5] border-b border-gray-300">
                            <tr>
                                <th className="px-4 py-2 text-[13px] font-black text-gray-600 border-r border-gray-300">Name</th>
                                <th className="px-4 py-2 text-[13px] font-black text-gray-600 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#e0f7fa]/30' : 'bg-white'} border-b border-gray-100 hover:bg-[#0078d4]/5 transition-colors`}>
                                    <td className="px-4 py-2.5 text-[13px] font-bold text-gray-700 border-r border-gray-200">{row.name}</td>
                                    <td className="px-4 py-2.5 text-[13px] font-bold text-right text-gray-700">{row.balance}</td>
                                </tr>
                            ))}
                            {/* Empty rows to match the style */}
                            {[...Array(8)].map((_, i) => (
                                <tr key={`empty-${i}`} className={`${(data.length + i) % 2 === 0 ? 'bg-[#e0f7fa]/30' : 'bg-white'} border-b border-gray-50 h-8`}>
                                    <td className="border-r border-gray-100"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

export default AccountBalanceBoard;
