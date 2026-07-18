import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
import TransactionFormWrapper from '../../TransactionFormWrapper';
import { 
    Trash2,
    ShieldCheck,
    X,
    Search,
    RotateCcw,
    LogOut,
    Lock,
    User as UserIcon,
    AlertCircle,
    CheckCircle,
    Table as TableIcon,
    ChevronDown,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { deleteAccountService } from '../../../services/deleteAccount.service';


import { getSessionData } from '../../../utils/session';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


const LookupSearchModal = ({ isOpen, onClose, onSelect, title, data, searchPlaceholder, idLabel, nameLabel, searchTitle }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        return data.filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-[700px]"
        >
            <div className="flex flex-col h-full font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">{searchTitle || 'Search Facility'}</span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                            <tr>
                                <th className="border-b px-5 py-3">{idLabel}</th>
                                <th className="border-b px-5 py-3">{nameLabel}</th>
                                <th className="border-b text-center w-24 px-5 py-3">Select</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="group hover:bg-blue-50/50 transition-all border-b border-gray-50 cursor-pointer"
                                        onClick={() => {
                                            onSelect(item);
                                            onClose();
                                        }}
                                    >
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3 text-center">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelect(item);
                                                    onClose();
                                                }}
                                                className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                            >
                                                SELECT
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, accountName, loading }) => {
    const [confirmText, setConfirmText] = useState('');
    const requiredText = "delete account";
    
    useEffect(() => {
        if (isOpen) setConfirmText('');
    }, [isOpen]);

    if (!isOpen) return null;
    
    const isMatched = confirmText.toLowerCase() === requiredText;

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center font-['Plus_Jakarta_Sans'] pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !loading && onClose()} />
            
            <div className={`relative w-full shadow-[0_10px_40px_rgb(0,0,0,0.3)] rounded-none overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col`}>
                {/* Top Section */}
                <div className={`bg-[#ea5b5b] py-10 px-6 relative overflow-hidden`}>
                    <X className="absolute right-0 -top-8 w-48 h-48 text-black opacity-10 rotate-12 pointer-events-none" strokeWidth={4} />
                    
                    <div className="max-w-7xl mx-auto w-full relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <h2 className="text-white text-[18px] font-medium tracking-wide">Delete Account?</h2>
                            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        
                        {/* Body Text */}
                        <div className="mt-2 pr-4">
                            <p className="text-white/90 text-[12px] leading-relaxed break-words font-['Tahoma']">
                                You'll permanently lose your data related to:<br/>
                                <span className="text-white font-bold">[{accountName}]</span>
                            </p>
                            <div className="mt-4 max-w-sm">
                                <p className="text-[12px] text-white/90 mb-1 font-['Tahoma']">Type "{requiredText}" to confirm</p>
                                <input 
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={requiredText}
                                    className="w-full border-none rounded-sm px-3 py-1.5 text-sm outline-none text-slate-800 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bg-white py-4 px-6 flex relative z-10">
                    <div className="max-w-7xl mx-auto w-full flex justify-end gap-2">
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-1.5 bg-[#d1d5db] hover:bg-[#9ca3af] text-white uppercase text-[11px] font-bold tracking-widest transition-colors rounded-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => isMatched && onConfirm()}
                            disabled={loading || !isMatched}
                            className={`px-6 py-1.5 text-white uppercase text-[11px] font-bold tracking-widest transition-colors rounded-sm flex items-center gap-2 ${isMatched && !loading ? 'bg-[#ea5b5b] hover:bg-[#d64545]' : 'bg-red-300 cursor-not-allowed'}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteAccountModal = ({ isOpen, onClose }) => {
    // Master Data
    const [accounts, setAccounts] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    // Form State
    const [selectedAccount, setSelectedAccount] = useState({ code: '', name: '' });
    const [selectedUser, setSelectedUser] = useState({ code: '', name: '' });
    const [password, setPassword] = useState('');
    const [note, setNote] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('READY');
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            setLoading(true);
            const session = getSessionData();
            const [accResp, empResp] = await Promise.all([
                deleteAccountService.getAccounts(session.companyCode),
                deleteAccountService.getEmployees(session.companyCode)
            ]);
            
            setAccounts(accResp.data);
            setEmployees(empResp.data);
        } catch (error) {
            showErrorToast('Failed to load system records.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedAccount.code) return showErrorToast('Select target account for deletion.');
        if (!selectedUser.code || !password) return showErrorToast('Security credentials required.');
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        setStatusMessage('VALIDATING & DELETING...');
        try {
            const session = getSessionData();
            const resp = await deleteAccountService.deleteAccount({
                accountCode: selectedAccount.code,
                companyCode: session.companyCode,
                userCode: selectedUser.code,
                password: password,
                note: note
            });
            
            showSuccessToast(resp.data.message);
            handleClear();
            setShowConfirmModal(false);
            fetchLookups(); // Refresh list
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Deletion failed.');
        } finally {
            setLoading(false);
            setStatusMessage('READY');
        }
    };

    const handleClear = () => {
        setSelectedAccount({ code: '', name: '' });
        setSelectedUser({ code: '', name: '' });
        setPassword('');
        setNote('');
    };

    return (
        <>
        <TransactionFormWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Account"
            subtitle="System Administration"
            icon={Trash2}
            maxWidth="max-w-xl"
            footer={
                <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3">
                        <button onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleDeleteClick} disabled={loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Trash2 size={14} /> DELETE ACCOUNT
                        </button>
                    </div>
                </div>
            }
        >
            <div className="font-['Tahoma']">
                <div className="bg-white p-5 border border-slate-200 rounded-[3px] space-y-4 shadow-sm">
                    <div className="space-y-4">
                        
                        {/* Account Row */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Select Account</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedAccount.name || selectedAccount.code || ''}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                    onClick={() => setShowAccountSearch(true)}
                                    placeholder="Search account..."
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                            </div>
                        </div>

                        {/* Authorize Row */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Authorized User</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedUser.name || selectedUser.code || ''}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                    onClick={() => setShowUserSearch(true)}
                                    placeholder="Search user..."
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                            </div>
                        </div>

                        {/* Password Row */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Authorization Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 pr-10 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Note Row */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Reason for Deletion</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add an optional note..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </TransactionFormWrapper>

            {/* Sub Modals */}
            <LookupSearchModal 
                isOpen={showAccountSearch}
                onClose={() => setShowAccountSearch(false)}
                onSelect={setSelectedAccount}
                title="Account Selection"
                data={accounts}
                searchPlaceholder="Filter accounts"
                idLabel="Code"
                nameLabel="Account Descriptor"
                searchTitle="Search Available Ledgers"
            />

            <LookupSearchModal 
                isOpen={showUserSearch}
                onClose={() => setShowUserSearch(false)}
                onSelect={setSelectedUser}
                title="User Selection"
                data={employees.map(emp => ({
                    ...emp,
                    code: emp.emp_Code || emp.empCode || emp.code,
                    name: emp.emp_Name || emp.empName || emp.name
                }))}
                searchPlaceholder="Filter users"
                idLabel="Code"
                nameLabel="User Description"
                searchTitle="Search Facility"
            />

            <DeleteConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleDeleteConfirm}
                accountName={selectedAccount.name}
                loading={loading}
            />
        </>
    );
};

export default DeleteAccountModal;
