import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Save, Trash2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import CostCenterAuthModal from './CostCenterAuthModal';
import { userProfileService } from '../../../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterSelect } from '../../MasterFormComponents';
import ConfirmModal from '../ConfirmModal';

const UserProfileBoard = ({ isOpen, onClose }) => {
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
    const [showPassword, setShowPassword] = useState(false);

    const [showCostCenterAuth, setShowCostCenterAuth] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [usersList, setUsersList] = useState([]);
    const [groupsList, setGroupsList] = useState([]);

    const isEditing = emp_Code !== '';

    useEffect(() => {
        if (isOpen) {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (user) setLast_Modified_User(user.empName || user.emp_Name || '');
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        const companyData = localStorage.getItem('selectedCompany');
        let companyCode = '';
        if (companyData) {
            try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; }
        }
        try {
            const [users, groups] = await Promise.all([
                userProfileService.searchUsers(companyCode, ''),
                userProfileService.getUserGroups()
            ]);
            setUsersList(users || []);
            setGroupsList(groups || []);
        } catch (err) { showErrorToast('Failed to load user data'); }
    };

    const handleClear = () => {
        setEmp_Code(''); setEmp_Name(''); setPass_Word(''); setConpass_Word('');
        setMust_Change('0'); setCant_Change('0'); setAcc_Desable('0');
        setMember_Id(''); setShowPassword(false);
        setExp_Date('');
    };

    const handleUserSelect = async (code) => {
        if (!code) { handleClear(); return; }
        setFetching(true);
        try {
            const profile = await userProfileService.getUserProfile(code);
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
            loadData();
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
            loadData();
        } catch (error) { showErrorToast(error.message || 'Failed to delete user profile'); } finally { setDeleting(false); }
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="User Profile Maintenance"
                icon={User}
                maxWidth="max-w-[500px]"
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
                            <button onClick={handleDelete} disabled={!isEditing || deleting} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(!isEditing || deleting) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE
                            </button>
                        )}
                        <button onClick={handleSave} disabled={saving || !isEditing} className={`px-6 py-3 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 shadow-md ${isEditing ? 'bg-[#00adff] hover:bg-[#0099e6] shadow-blue-100' : 'bg-gray-400 cursor-not-allowed text-gray-200 shadow-none'}`}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            UPDATE
                        </button>
                    </div>
                }
            >
                <MasterFieldRow label="User Code" colSpan="col-span-12">
                    <div className="flex-1 flex gap-1 min-w-0 items-center">
                        {fetching ? (
                            <div className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-sm font-mono font-bold text-gray-400 bg-slate-50 rounded outline-none flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> LOADING...</div>
                        ) : (
                            <MasterSelect
                                name="emp_Code"
                                value={emp_Code}
                                onChange={(e) => handleUserSelect(e.target.value)}
                                placeholder="Select user..."
                                options={usersList.map(u => ({ value: u.emp_Code, label: `${u.emp_Code} - ${u.emp_Name}` }))}
                            />
                        )}
                    </div>
                </MasterFieldRow>

                {emp_Code && (
                    <div className="col-span-12 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0285fd] flex flex-col items-center justify-center font-black shadow-sm ring-4 ring-white">
                            {emp_Name ? <span className="text-xl leading-none">{emp_Name.charAt(0).toUpperCase()}</span> : <User size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-wide truncate">{emp_Name}</h4>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                        <div className="pt-3 border-t border-slate-200 mt-2 flex justify-start">
                            <button onClick={() => setShowCostCenterAuth(true)} disabled={!emp_Code} className="px-8 h-9 bg-[#0285fd] text-white text-[10px] font-mono font-bold rounded-[3px] hover:bg-[#0073ff] shadow-sm transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest gap-2 disabled:opacity-40">
                                <ShieldCheck size={14} /> Cost Center Authentication
                            </button>
                        </div>
                    </div>
                </div>
            </MasterFormWrapper >

            <CostCenterAuthModal isOpen={showCostCenterAuth} onClose={() => setShowCostCenterAuth(false)} empCode={emp_Code} empName={emp_Name} userRole={member_Id} />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete user "${emp_Name || emp_Code}"?\n\nThis action is permanent and cannot be undone.`}
                loading={deleting}
                confirmText="Delete Now"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
};

export default UserProfileBoard;
