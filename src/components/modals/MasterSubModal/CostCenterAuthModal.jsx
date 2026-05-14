import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Shield, ShieldCheck, ShieldAlert, Loader2, Save, X, CheckSquare, Square } from 'lucide-react';
import api from '../../../services/api';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const CostCenterAuthModal = ({ isOpen, onClose, empCode, empName, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [costCenters, setCostCenters] = useState([]); 
    const [transactions, setTransactions] = useState([]); 
    const [authMatrix, setAuthMatrix] = useState([]); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userRole) {
            fetchMatrix();
        }
    }, [isOpen, userRole]);

    const fetchMatrix = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/CostCenterAuth/matrix/${userRole}`);
            console.log('Matrix Data:', response.data); // Helpful for debugging
            
            setCostCenters(response.data.costCenters || []);
            setTransactions(response.data.transactions || []);
            setAuthMatrix(response.data.authMatrix || []);
        } catch (error) {
            console.error('Failed to fetch matrix:', error);
            showErrorToast('Failed to load authorization matrix');
        } finally {
            setLoading(false);
        }
    };

    const isChecked = (mId, ccCode) => {
        if (!mId || !ccCode) return false;
        return authMatrix.some(a => {
            const rowId = (a.menuId || a.MenuId || '').toString().trim();
            const colCode = (a.costCenterCode || a.CostCenterCode || '').toString().trim();
            return rowId === mId.toString().trim() && colCode === ccCode.toString().trim() && (a.isChecked || a.IsChecked);
        });
    };

    const handleToggle = async (mId, ccCode) => {
        if (!mId || !ccCode) return;
        const currentlyChecked = isChecked(mId, ccCode);
        const newChecked = !currentlyChecked;

        // Update local state first
        setAuthMatrix(prev => {
            const exists = prev.some(a => {
                const rowId = (a.menuId || a.MenuId || '').toString().trim();
                const colCode = (a.costCenterCode || a.CostCenterCode || '').toString().trim();
                return rowId === mId.toString().trim() && colCode === ccCode.toString().trim();
            });

            if (exists) {
                return prev.map(a => {
                    const rowId = (a.menuId || a.MenuId || '').toString().trim();
                    const colCode = (a.costCenterCode || a.CostCenterCode || '').toString().trim();
                    if (rowId === mId.toString().trim() && colCode === ccCode.toString().trim()) {
                        return { ...a, isChecked: newChecked, IsChecked: newChecked };
                    }
                    return a;
                });
            } else {
                return [...prev, { menuId: mId, costCenterCode: ccCode, isChecked: newChecked }];
            }
        });

        try {
            await api.post('/CostCenterAuth/toggle', {
                userRole: userRole,
                menuId: mId,
                costCenterCode: ccCode,
                isChecked: newChecked
            });
        } catch (error) {
            console.error('Failed to toggle:', error);
            showErrorToast('Failed to save change');
            fetchMatrix(); // Revert by refetching
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (!t) return false;
        const name = (t.menuName || t.MenuName || '').toString().toLowerCase();
        const id = (t.menuId || t.MenuId || '').toString().toLowerCase();
        const search = (searchTerm || '').toLowerCase();
        return name.includes(search) || id.includes(search);
    });

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Cost Center Access Matrix: ${empName || 'New User'} (${userRole})`}
            maxWidth="max-w-[95%] w-[1200px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={onClose} className="px-10 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Save size={16} /> Finish & Apply
                    </button>
                    <button onClick={onClose} className="px-10 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <X size={16} /> Cancel
                    </button>
                </div>
            }
        >
            <div className="p-1 space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        <span className="text-[10px] font-[900] text-gray-500 uppercase tracking-[0.2em]">Find Transaction</span>
                    </div>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Filter transactions..."
                            className="w-full h-9 border border-gray-300 px-3 text-xs rounded-md focus:border-[#0285fd] outline-none shadow-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafd] border-b border-gray-100">
                                    <th className="sticky left-0 bg-[#f8fafd] z-10 p-3 text-left text-[10px] font-[900] text-gray-400 uppercase tracking-[0.15em] border-r border-gray-100 min-w-[250px]">
                                        Transaction / Menu Item
                                    </th>
                                    {costCenters.map((cc, i) => (
                                        <th key={i} className="p-3 text-center text-[10px] font-[900] text-gray-400 uppercase tracking-[0.15em] min-w-[120px]">
                                            {cc.costCenterName || cc.CostCenterName || 'UNNAMED'}
                                            <div className="text-[8px] opacity-40">({cc.costCenterCode || cc.CostCenterCode})</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={costCenters.length + 1} className="py-20 text-center">
                                            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Building Matrix...</span>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((trans, ti) => {
                                        const mName = (trans.menuName || trans.MenuName || 'UNKNOWN').toString().trim();
                                        const mId = (trans.menuId || trans.MenuId || '').toString().trim();
                                        return (
                                            <tr key={ti} className="hover:bg-blue-50/20 transition-all group">
                                                <td className="sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 p-3 text-[12px] font-bold text-slate-700 uppercase border-r border-gray-50 group-hover:text-blue-600 transition-colors">
                                                    {mName}
                                                    <div className="text-[8px] opacity-40 font-normal group-hover:text-blue-400">ID: {mId}</div>
                                                </td>
                                                {costCenters.map((cc, ci) => {
                                                    const ccCode = (cc.costCenterCode || cc.CostCenterCode || '').toString().trim();
                                                    const checked = isChecked(mId, ccCode);
                                                    return (
                                                        <td key={ci} className="p-2 text-center">
                                                            <button
                                                                onClick={() => handleToggle(mId, ccCode)}
                                                                className={`p-2 rounded-md transition-all duration-200 ${
                                                                    checked 
                                                                    ? 'text-emerald-500 bg-emerald-50 shadow-sm border border-emerald-100' 
                                                                    : 'text-slate-200 hover:text-slate-300'
                                                                }`}
                                                            >
                                                                {checked ? <CheckSquare size={20} /> : <Square size={20} />}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={costCenters.length + 1} className="py-20 text-center text-gray-300 italic">
                                            <Shield size={40} className="mb-4 opacity-10 mx-auto" />
                                            <span className="text-[12px] font-bold uppercase tracking-widest">No matching transactions found</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CostCenterAuthModal;
