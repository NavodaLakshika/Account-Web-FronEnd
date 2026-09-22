import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { accountService } from '../services/account.service';
import { getSessionData } from '../utils/session';

const AccountBalanceBoard = ({ isOpen, onClose }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const { companyCode } = getSessionData();
            setLoading(true);
            accountService.getParentAccounts('Assets', companyCode)
                .then((res) => {
                    const accounts = (res || []).map(a => ({
                        name: a.name || a.Name || a.sub_Acc_Name || a.Sub_Acc_Name || '',
                        balance: a.balance || a.Balance || '0.00'
                    })).filter(a => a.name);
                    setData(accounts);
                })
                .catch(() => setData([]))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    return (
        <TransactionFormWrapper boardName="AccountBalanceBoard" icon={FileText}
            isOpen={isOpen}
            onClose={onClose}
            title="Account Balance"
            maxWidth="max-w-[700px]"
        >
            <div className="p-1 font-['Tahoma',_sans-serif]">
                <div className="border border-gray-200 rounded-[3px] shadow-sm overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafd] border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2.5 text-slate-700 text-xs font-bold border-r border-gray-200">Account Name</th>
                                <th className="px-4 py-2.5 text-slate-700 text-xs font-bold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.length > 0 ? (
                                data.map((row, idx) => (
                                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                        <td className="px-4 py-2.5 text-slate-700 text-xs font-medium border-r border-gray-200">{row.name}</td>
                                        <td className="px-4 py-2.5 text-slate-800 text-xs font-mono font-bold text-right">{row.balance}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-8 text-center text-xs text-slate-400">
                                        {loading ? 'Loading account balances...' : 'No accounts found'}
                                    </td>
                                </tr>
                            )}
                            {data.length > 0 && [...Array(Math.max(0, 5 - data.length))].map((_, i) => (
                                <tr key={`empty-${i}`} className="h-[38px]">
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




