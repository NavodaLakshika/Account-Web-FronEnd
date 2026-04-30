import React from 'react';
import { X } from 'lucide-react';
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
            maxWidth="max-w-[650px]"
            // footer={
            //     <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl gap-3">
            //         <div className="flex gap-3">
            //             <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none">onimta IT</span>
            //         </div>
            //         <div className="flex gap-3">
            //             <button onClick={onClose} className="px-6 h-10 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-[5px] hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
            //                 <X size={14} /> EXIT
            //             </button>
            //         </div>
            //     </div>
            // }
        >
            <div className="p-1 font-['Tahoma',_sans-serif]">
                <div className="border border-gray-200 rounded-[5px] shadow-sm overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafd] border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/2">Name</th>
                                <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right w-1/2">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                    <td className="px-4 py-3 text-[12.5px] font-bold text-gray-700 border-r border-gray-100">{row.name}</td>
                                    <td className="px-4 py-3 text-[12.5px] font-bold text-right text-[#0285fd] font-mono">{row.balance}</td>
                                </tr>
                            ))}
                            {/* Empty rows to match the style */}
                            {[...Array(6)].map((_, i) => (
                                <tr key={`empty-${i}`} className={`${(data.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} h-[45px]`}>
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
