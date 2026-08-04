import React, { useState, useEffect } from 'react';
import { User, RotateCcw, Save, Trash2, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CostCenterAuthModal from '../components/modals/MasterSubModal/CostCenterAuthModal';
import { userProfileService } from '../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const UserProfileMaintenanceBoard = ({ isOpen, onClose }) => {
    const [emp_Code, setEmp_Code] = useState('');
    const [emp_Name, setEmp_Name] = useState('');
    const [pass_Word, setPass_Word] = useState('');
    const [conpass_Word, setConpass_Word] = useState('');
    const [must_Change, setMust_Change] = useState('0');
    const [cant_Change, setCant_Change] = useState('0');
    const [acc_Desable, setAcc_Desable] = useState('0');
    const [member_Id, setMember_Id] = useState('');
    const [last_Modified_User, setLast_Modified_User] = useState('');
    const [exp_Date, setExp_Date] = useState('');

    const [usersList, setUsersList] = useState([]);
    const [showCostCenterAuth, setShowCostCenterAuth] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isEditing = emp_Code !== '';

    useEffect(() => {
        if (isOpen) {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (user) setLast_Modified_User(user.empName || user.emp_Name || '');
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        const companyData = localStorage.getItem('selectedCompany');
        let companyCode = '';
        if (companyData) {
            try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; }
        }
        try {
            const users = await userProfileService.searchUsers(companyCode, '');
            setUsersList(users || []);
        } catch (err) { showErrorToast('Failed to load users list'); }
    };

    const handleClear = () => {
        setEmp_Code(''); setEmp_Name(''); setPass_Word(''); setConpass_Word('');
        setMust_Change('0'); setCant_Change('0'); setAcc_Desable('0');
        setMember_Id(''); setShowPassword(false);
        setExp_Date('');
    };

    const handleUserSelect = async (selectedCode) => {
        if (!selectedCode) {
            handleClear();
            return;
        }
        setFetching(true);
        try {
            const profile = await userProfileService.getUserProfile(selectedCode);
            setEmp_Code(profile.emp_Code); setEmp_Name(profile.emp_Name || '');
            setPass_Word(profile.pass_Word || ''); setConpass_Word(profile.pass_Word || '');
            setMust_Change(profile.must_Change || '0'); setCant_Change(profile.cant_Change || '0');
            setAcc_Desable(profile.acc_Desable || '0');
            setMember_Id(profile.member_Id || '');
            setExp_Date(profile.exp_Date || '2099-12-31');
        } catch (error) { showErrorToast('Failed to load user profile'); } finally { setFetching(false); }
    };

    const handleSave = async () => {
        if (!emp_Code) return showErrorToast('Please select a user to update');
        setSaving(true);
        try {
            const payload = { emp_Code, emp_Name, pass_Word, must_Change, cant_Change, acc_Desable, exp_Date, member_Id, last_Modified_User };
            const result = await userProfileService.saveProfile(payload);
            showSuccessToast(result.message || 'User profile updated successfully');
            loadUsers();
        } catch (error) { showErrorToast(error.message || 'Failed to update user profile'); } finally { setSaving(false); }
    };

    const handleDelete = () => {
        if (!emp_Code) return showErrorToast('No user selected for deletion');
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await userProfileService.deleteUser(emp_Code);
            showSuccessToast('User profile deleted successfully');
            handleClear();
            setShowDeleteConfirm(false);
            loadUsers();
        } catch (error) { showErrorToast(error.message || 'Failed to delete user profile'); } finally { setDeleting(false); }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage system user access and profiles" icon={null}
                isOpen={isOpen} onClose={onClose} title="User Profile Maintenance"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <div className="flex gap-3">
                            {isEditing && <button onClick={handleDelete} disabled={deleting} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(deleting) ? 'opacity-50 cursor-not-allowed' : ''}`}>{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE</button>}
                            <button onClick={handleSave} disabled={saving || !isEditing} className={`px-6 h-10 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isEditing ? 'bg-[#0285fd] hover:bg-[#0073ff]' : 'bg-gray-400 cursor-not-allowed'}`}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} UPDATE</button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma'] p-4">
                    <div className="max-w-xl mx-auto space-y-4">
                        <div className="bg-white p-6 border border-gray-200 rounded-[3px] shadow-sm space-y-4">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                                <div className="col-span-12">
                                    <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">User Code</label>
                                    <select
                                        value={emp_Code}
                                        onChange={(e) => handleUserSelect(e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono cursor-pointer disabled:opacity-50"
                                        disabled={fetching}
                                    >
                                        <option value="">{fetching ? 'LOADING...' : 'Select user...'}</option>
                                        {usersList.map(u => (
                                            <option key={u.emp_Code} value={u.emp_Code}>{u.emp_Code} - {u.emp_Name}</option>
                                        ))}
                                    </select>
                                </div>
                                {emp_Code && (
                                    <div className="col-span-12 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0285fd] flex flex-col items-center justify-center font-black shadow-sm ring-4 ring-white">
                                            {emp_Name ? <span className="text-xl leading-none">{emp_Name.charAt(0).toUpperCase()}</span> : <User size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">{emp_Name}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                    User Role: {member_Id || 'N/A'}
                                                </span>
                                                {acc_Desable === '1' ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                        <AlertTriangle size={12} /> ACCOUNT DISABLED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                        <ShieldCheck size={12} /> ACCOUNT ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-gray-200 rounded-[3px] shadow-sm">
                            <div className="text-[13px] font-black text-slate-900 uppercase mb-4">Account Options</div>
                            <div className="bg-white border border-gray-200 rounded-[3px] p-5 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={must_Change === '1'} onChange={(e) => setMust_Change(e.target.checked ? '1' : '0')} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    <span className="text-[12.5px] font-bold text-slate-700 select-none">Must Change Password Next Login</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={cant_Change === '1'} onChange={(e) => setCant_Change(e.target.checked ? '1' : '0')} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                    <span className="text-[12.5px] font-bold text-slate-700 select-none">User Cannot Change Password</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={acc_Desable === '1'} onChange={(e) => setAcc_Desable(e.target.checked ? '1' : '0')} className="w-3.5 h-3.5 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                                    <span className="text-[12.5px] font-bold text-red-600 select-none">Account Disabled</span>
                                </label>
                                <div className="pt-4 border-t border-gray-200 mt-2 flex justify-start">
                                    <button onClick={() => setShowCostCenterAuth(true)} disabled={!emp_Code} className="px-8 h-10 bg-[#0285fd] text-white text-[11px] font-mono font-bold rounded-[3px] hover:bg-[#0073ff] shadow-sm transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest gap-2 disabled:opacity-40">
                                        <ShieldCheck size={16} /> Cost Center Authentication
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CostCenterAuthModal isOpen={showCostCenterAuth} onClose={() => setShowCostCenterAuth(false)} empCode={emp_Code} empName={emp_Name} userRole={member_Id} />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete user <span className="font-bold text-slate-800 uppercase">"{emp_Name || emp_Code}"</span>?<br />This action is permanent and cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(deleting) ? 'opacity-50 cursor-not-allowed' : ''}`}>Cancel</button>
                                <button onClick={confirmDelete} disabled={deleting} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(deleting) ? 'opacity-50 cursor-not-allowed' : ''}`}>{deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserProfileMaintenanceBoard;
