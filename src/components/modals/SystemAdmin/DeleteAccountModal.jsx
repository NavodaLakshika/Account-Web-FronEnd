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
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';

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
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{searchTitle || 'Search Facility'}</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">{idLabel}</th>
                                    <th className="px-5 py-3">{nameLabel}</th>
                                    <th className="px-5 py-3 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr 
                                            key={item.code} 
                                            className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                onSelect(item);
                                                onClose();
                                            }}
                                        >
                                            <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{item.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase">{item.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest ml-auto">
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No records found</td>
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
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="CONFIRM DELETION"
            maxWidth="max-w-[400px]"
            showHeaderClose={false}
        >
            <div className="p-4 flex flex-col items-center text-center space-y-6 font-['Tahoma']">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                    <Trash2 size={40} strokeWidth={2.5} className="animate-pulse" />
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-wider">Permanent Action</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-bold">
                        Are you sure you want to delete <span className="text-red-600">[{accountName}]</span>? This process cannot be undone.
                    </p>
                </div>

                <div className="w-full flex gap-3 pt-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 h-11 bg-[#ff3b30] text-white text-[12px] font-black rounded-[5px] shadow-lg shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'PROCESSING...' : 'YES, DELETE'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 bg-white text-slate-400 text-[12px] font-black rounded-[5px] border border-gray-200 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </SimpleModal>
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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
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
                maxWidth="max-w-[500px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end items-center gap-3 border-t border-gray-100 rounded-b-xl font-['Tahoma']">
                        <button
                            onClick={handleDeleteClick}
                            disabled={loading}
                            className="px-6 h-10 bg-[#ff3b30] text-white text-sm font-black rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none uppercase tracking-widest group"
                        >
                            <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> DELETE 
                        </button>
                         <button
                            onClick={handleClear}
                            className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none uppercase tracking-widest shadow-md group"
                        >
                            <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" /> CLEAR 
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm space-y-6">
                        <div className="grid grid-cols-12 gap-y-5">
                            
                            {/* Account Row */}
                            <div className="col-span-12 flex flex-col gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700">Account</label>
                                <div className="flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedAccount.code || ''}
                                        className="w-24 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none cursor-pointer"
                                        onClick={() => setShowAccountSearch(true)}
                                        placeholder=""
                                    />
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedAccount.name || ''}
                                        className="flex-1 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none cursor-pointer truncate"
                                        onClick={() => setShowAccountSearch(true)}
                                        placeholder=" "
                                    />
                                    <button onClick={() => setShowAccountSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Authorize Row */}
                            <div className="col-span-12 flex flex-col gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700">Authorize</label>
                                <div className="flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedUser.name || ''}
                                        className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 bg-white outline-none cursor-pointer"
                                        onClick={() => setShowUserSearch(true)}
                                        placeholder=""
                                    />
                                    <button onClick={() => setShowUserSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="col-span-12 flex flex-col gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-8 border border-gray-300 rounded-[5px] pl-3 pr-10 text-[12px] font-bold text-slate-700 bg-white outline-none shadow-sm focus:border-[#0285fd] transition-colors"
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
