import React from 'react';
import { X , FileText} from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const AccountBalanceBoard = ({ isOpen, onClose }) => {
    const data = [
        { name: 'Petty Cash', balance: '-3,000.00' },
        { name: 'Cash In Hand', balance: '-303,000.00' },
        { name: 'Current Account', balance: '' }
    ];

    return (
        <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
            isOpen={isOpen}
            onClose={onClose}
            title="Account Balance"
            maxWidth="max-w-[700px]"
            // footer={
            //     <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
            //         <div className="flex gap-3">
            //             <span className="text-[20px] font-black italic text-[#0285fd]/30 tracking-tighter select-none">onimta IT</span>
            //         </div>
            //         <div className="flex gap-3">
            //             <button onClick={onClose} className="px-6 h-10 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
            //                 <X size={14} /> EXIT
            //             </button>
            //         </div>
            //     </div>
            // }
        >
            <div className="p-1 font-['Tahoma',_sans-serif]">
                <div className="border border-gray-200 rounded-[3px] shadow-sm overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafd] border-b border-gray-200">
                            <tr>
                                <th className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Name</th>
                                <th className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Balance</th>
                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((row, idx) => (
                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                    <td className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{row.name}</td>
                                    <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">{row.balance}</td>
                                </tr>
                            ))}
                            {/* Empty rows to match the style */}
                            {[...Array(6)].map((_, i) => (
                                <tr key={`empty-${i}`} className={`${(data.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} h-[45px]`}>
                                    <td className="border-r border-gray-200"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TransactionFormWrapper>
    );
};

export default AccountBalanceBoard;




