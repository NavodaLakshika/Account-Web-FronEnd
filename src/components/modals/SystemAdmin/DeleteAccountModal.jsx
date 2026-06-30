import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
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
    EyeOff
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
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{searchTitle || 'Search Facility'}</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className=" px-5 py-3">{idLabel}</th>
                                    <th className=" px-5 py-3">{nameLabel}</th>
                                    <th className="text-right px-5 py-3">ACTION</th>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr 
                                            key={item.code} 
                                            className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                            onClick={() => {
                                                onSelect(item);
                                                onClose();
                                            }}
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.name}</td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">
                                                    SELECT
                                                </button>
                                            </td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
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
            const [accResp, empResp] = await Promise.all([
                deleteAccountService.getAccounts(),
                deleteAccountService.getEmployees()
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
                password: password
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
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Delete Account"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-center items-center gap-3 border-t border-slate-200 rounded-b-xl">
                        <button onClick={handleDeleteClick} disabled={loading} className={`px-6 py-3 bg-white text-[#ff3b30] border-2 border-[#ff3b30] hover:bg-red-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                            <Trash2 size={14} /> DELETE
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="bg-slate-50/50 p-6 border border-slate-200 rounded-[3px] relative overflow-hidden space-y-6">
                        <div className="grid grid-cols-12 gap-y-5 relative z-10">
                            
                            {/* Account Row */}
                            <div className="col-span-12 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Account</label>
                                <div className="flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedAccount.code || ''}
                                        className="w-24 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[3px] outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowAccountSearch(true)}
                                        placeholder=""
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedAccount.name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[3px] outline-none cursor-pointer truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowAccountSearch(true)}
                                        placeholder=" "
                                    />
                                    <button onClick={() => setShowAccountSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Authorize Row */}
                            <div className="col-span-12 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Authorize</label>
                                <div className="flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedUser.name || ''}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[3px] outline-none cursor-pointer truncate transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowUserSearch(true)}
                                        placeholder=""
                                    />
                                    <button onClick={() => setShowUserSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="col-span-12 flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-8 border border-slate-200 px-3 pr-10 text-[12px] font-bold text-slate-700 bg-white rounded-[3px] outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Sub Modals */}
            <LookupSearchModal 
                isOpen={showAccountSearch}
                onClose={() => setShowAccountSearch(false)}
                onSelect={setSelectedAccount}
                title="Account Selection"
                data={accounts}
                searchPlaceholder=""
                idLabel="REFERENCE ID"
                nameLabel="Account Description"
                searchTitle="Global Account Search"
            />

            <LookupSearchModal 
                isOpen={showUserSearch}
                onClose={() => setShowUserSearch(false)}
                onSelect={setSelectedUser}
                title="User Selection"
                data={employees}
                searchPlaceholder=""
                idLabel="USER ID"
                nameLabel="User Description"
                searchTitle="Global User Search"
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
