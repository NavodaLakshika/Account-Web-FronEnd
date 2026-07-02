import React, { useState, useEffect } from 'react';
import { User, Search, RotateCcw, Save, Trash2, Eye, EyeOff, Calendar, ShieldCheck, Users, Loader2, AlertTriangle } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import UserSearchModal from '../components/modals/UserSearchModal';
import UserGroupSearchModal from '../components/modals/UserGroupSearchModal';
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
    const [exp_Date, setExp_Date] = useState('');
    const [member_Id, setMember_Id] = useState('Administrators');
    const [last_Modified_User, setLast_Modified_User] = useState('SYSTEM');

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showCostCenterAuth, setShowCostCenterAuth] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isEditing = emp_Code !== '';

    useEffect(() => {
        if (isOpen) {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (user) setLast_Modified_User(user.empName || user.emp_Name || 'SYSTEM');
        }
    }, [isOpen]);

    const handleClear = () => {
        setEmp_Code(''); setEmp_Name(''); setPass_Word(''); setConpass_Word('');
        setMust_Change('0'); setCant_Change('0'); setAcc_Desable('0');
        setExp_Date(''); setMember_Id('Administrators'); setShowPassword(false);
    };

    const handleUserSelect = async (user) => {
        const selectedCode = user.emp_Code || user.Emp_Code;
        if (!selectedCode) return;
        setFetching(true);
        try {
            const profile = await userProfileService.getUserProfile(selectedCode);
            setEmp_Code(profile.emp_Code); setEmp_Name(profile.emp_Name || '');
            setPass_Word(profile.pass_Word || ''); setConpass_Word(profile.pass_Word || '');
            setMust_Change(profile.must_Change || '0'); setCant_Change(profile.cant_Change || '0');
            setAcc_Desable(profile.acc_Desable || '0'); setExp_Date(profile.exp_Date || '');
            setMember_Id(profile.member_Id || 'Administrators');
        } catch (error) { showErrorToast('Failed to load user profile'); } finally { setFetching(false); }
    };

    const handleSave = async () => {
        if (!emp_Name.trim()) return showErrorToast('Employee Name is required');
        if (!pass_Word.trim()) return showErrorToast('Password is required');
        if (pass_Word !== conpass_Word) return showErrorToast('Passwords do not match');
        setSaving(true);
        try {
            const payload = { emp_Code, emp_Name, pass_Word, must_Change, cant_Change, acc_Desable, exp_Date, member_Id, last_Modified_User };
            const result = await userProfileService.saveProfile(payload);
            if (!emp_Code && result.empCode) setEmp_Code(result.empCode);
            showSuccessToast(result.message || 'User profile saved successfully');
        } catch (error) { showErrorToast(error.message || 'Failed to save user profile'); } finally { setSaving(false); }
    };

    const handleDelete = () => {
        if (!emp_Code) return showErrorToast('No user selected for deletion');
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try { await userProfileService.deleteUser(emp_Code); showSuccessToast('User profile deleted successfully'); handleClear(); setShowDeleteConfirm(false); } catch (error) { showErrorToast(error.message || 'Failed to delete user profile'); } finally { setDeleting(false); }
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
                            {isEditing && <button onClick={handleDelete} disabled={deleting} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE</button>}
                            <button onClick={handleSave} disabled={saving} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isEditing ? 'UPDATE' : 'ADD USER'}</button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-gray-200 rounded-[3px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">User Code</label>
                                <div className="relative">
                                    <div className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 text-[#0285fd] font-mono flex items-center outline-none pr-10">{fetching ? 'LOADING...' : (emp_Code || '')}</div>
                                    <button onClick={() => setShowSearchModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Search size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">User Name</label>
                                <input type="text" value={emp_Name} onChange={(e) => setEmp_Name(e.target.value)} placeholder="Enter user name" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 uppercase" />
                            </div>
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={pass_Word} onChange={(e) => setPass_Word(e.target.value)} placeholder="Enter password" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10" />
                                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">Confirm Pwd</label>
                                <input type={showPassword ? "text" : "password"} value={conpass_Word} onChange={(e) => setConpass_Word(e.target.value)} placeholder="Confirm password" className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 ${conpass_Word && pass_Word === conpass_Word ? 'border-green-400 bg-blue-50/20' : ''}`} />
                            </div>
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">Member Group</label>
                                <div className="relative">
                                    <input type="text" value={member_Id} readOnly className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 text-gray-700 outline-none pr-10 cursor-default" />
                                    <button onClick={() => setShowGroupModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Users size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="text-[12.5px] font-bold text-gray-700 block mb-1.5">Expiry Date</label>
                                <div className="relative">
                                    <input type="text" value={exp_Date} readOnly onClick={() => setShowCalendar(true)} placeholder="Select date..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Calendar size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-gray-200 rounded-[3px] shadow-sm">
                        <div className="text-[13px] font-black text-slate-900 uppercase mb-3">Account Options</div>
                        <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
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
                            <div className="pt-3 border-t border-gray-200 mt-2">
                                <button onClick={() => setShowCostCenterAuth(true)} disabled={!emp_Code} className="w-full h-10 bg-[#0285fd] text-white text-[11px] font-mono font-bold rounded-[3px] hover:bg-[#0073ff] shadow-sm transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest gap-2 disabled:opacity-40">
                                    <ShieldCheck size={16} /> Cost Center Authentication
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <UserSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onSelect={handleUserSelect} />
            <UserGroupSearchModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} onSelect={setMember_Id} />
            <CostCenterAuthModal isOpen={showCostCenterAuth} onClose={() => setShowCostCenterAuth(false)} empCode={emp_Code} empName={emp_Name} userRole={member_Id} />
            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onSelectDate={(date) => { setExp_Date(date); setShowCalendar(false); }} initialDate={exp_Date} />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete user <span className="font-bold text-slate-800 uppercase">"{emp_Name || emp_Code}"</span>?<br />This action is permanent and cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={deleting} className="flex-1 h-11 bg-red-500 text-white text-[11px] font-black rounded-[3px] hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{deleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
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
