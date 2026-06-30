import React, { useState, useEffect } from 'react';
import { User, Key, Calendar, ShieldCheck, Save, Trash2, Search, RotateCcw, Loader2, Users, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import UserSearchModal from '../UserSearchModal';
import UserGroupSearchModal from '../UserGroupSearchModal';
import CostCenterAuthModal from './CostCenterAuthModal';
import { userProfileService } from '../../../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput } from '../../MasterFormComponents';

const UserProfileBoard = ({ isOpen, onClose }) => {
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
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="User Profile Maintenance"
                icon={User}
                maxWidth="max-w-[700px]"
                isEditMode={isEditing}
                loading={saving}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
                customFooter={
                    <div className="flex items-center justify-end gap-3 w-full">
                        <button onClick={handleClear} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                        {isEditing && (
                            <button onClick={handleDelete} disabled={!isEditing || deleting} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 shadow-md shadow-red-100">
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE
                            </button>
                        )}
                        <button onClick={handleSave} disabled={saving} className={`px-6 py-3 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 shadow-md ${isEditing ? 'bg-[#00adff] hover:bg-[#0099e6] shadow-blue-100' : 'bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100'}`}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : (isEditing ? <Save size={14} /> : <Save size={14} />)}
                            {isEditing ? 'UPDATE' : 'ADD USER'}
                        </button>
                    </div>
                }
            >
                <MasterFieldRow label="User Code" colSpan="col-span-6">
                    <div className="flex-1 flex gap-1 min-w-0 items-center">
                        <div className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-[#0285fd] bg-slate-50 rounded outline-none flex items-center">{fetching ? 'LOADING...' : (emp_Code || '')}</div>
                        <button onClick={() => setShowSearchModal(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"><Search size={14} /></button>
                    </div>
                </MasterFieldRow>
                <MasterFieldRow label="User Name" colSpan="col-span-6">
                    <MasterInput name="emp_Name" value={emp_Name} onChange={(e) => setEmp_Name(e.target.value)} placeholder="Enter user name" className="uppercase" />
                </MasterFieldRow>
                <MasterFieldRow label="Password" colSpan="col-span-6">
                    <div className="flex-1 flex gap-1 min-w-0 items-center">
                        <input type={showPassword ? "text" : "password"} value={pass_Word} onChange={(e) => setPass_Word(e.target.value)} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all" placeholder="Enter password" />
                        <button onClick={() => setShowPassword(!showPassword)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                </MasterFieldRow>
                <MasterFieldRow label="Confirm Pwd" colSpan="col-span-6">
                    <input type={showPassword ? "text" : "password"} value={conpass_Word} onChange={(e) => setConpass_Word(e.target.value)} className={`flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all ${conpass_Word && pass_Word === conpass_Word ? 'border-green-400 bg-blue-50/20' : ''}`} placeholder="Confirm password" />
                </MasterFieldRow>
                <MasterFieldRow label="Member Group" colSpan="col-span-6">
                    <div className="flex-1 flex gap-1 min-w-0 items-center">
                        <input type="text" value={member_Id} readOnly className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-default" />
                        <button onClick={() => setShowGroupModal(true)} className="w-8 h-8 bg-[#e49e1b] text-white flex items-center justify-center hover:bg-[#cb9b34] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"><Users size={14} /></button>
                    </div>
                </MasterFieldRow>
                <MasterFieldRow label="Expiry Date" colSpan="col-span-6">
                    <div className="flex-1 flex gap-1 min-w-0 items-center">
                        <input type="text" value={exp_Date} readOnly onClick={() => setShowCalendar(true)} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all" placeholder="Select date..." />
                        <button onClick={() => setShowCalendar(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"><Calendar size={14} /></button>
                    </div>
                </MasterFieldRow>

                <div className="col-span-12 mt-4">
                    <div className="text-[11px] font-bold text-gray-500 uppercase mb-3">Account Options</div>
                    <div className="bg-white border border-slate-200 rounded-[3px] p-4 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer h-8">
                            <input type="checkbox" checked={must_Change === '1'} onChange={(e) => setMust_Change(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#00D1FF]" />
                            <span className="text-[12px] font-bold text-slate-600 select-none">Must Change Password Next Login</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer h-8">
                            <input type="checkbox" checked={cant_Change === '1'} onChange={(e) => setCant_Change(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#00D1FF]" />
                            <span className="text-[12px] font-bold text-slate-600 select-none">User Cannot Change Password</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer h-8">
                            <input type="checkbox" checked={acc_Desable === '1'} onChange={(e) => setAcc_Desable(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                            <span className="text-[12px] font-bold text-red-600 select-none">Account Disabled</span>
                        </label>
                        <div className="pt-2 border-t border-slate-200">
                            <button onClick={() => setShowCostCenterAuth(true)} disabled={!emp_Code} className="w-full h-9 bg-[#0285fd] text-white text-[10px] font-mono font-bold rounded-[3px] hover:bg-[#0073ff] shadow-sm transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest gap-2 disabled:opacity-40">
                                <ShieldCheck size={14} /> Cost Center Authentication
                            </button>
                        </div>
                    </div>
                </div>
            </MasterFormWrapper>

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

export default UserProfileBoard;
