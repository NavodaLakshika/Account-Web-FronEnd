import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { User, Key, Calendar, ShieldCheck, ShieldAlert, Save, Trash2, Search, RotateCcw, Loader2, Users, Eye, EyeOff } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import UserSearchModal from '../UserSearchModal';
import UserGroupSearchModal from '../UserGroupSearchModal';
import CostCenterAuthModal from './CostCenterAuthModal';
import { userProfileService } from '../../../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const UserProfileBoard = ({ isOpen, onClose }) => {
    // Individual states for each field
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

    const isEditing = emp_Code !== '';

    useEffect(() => {
        if (isOpen) {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (user) {
                setLast_Modified_User(user.empName || user.emp_Name || 'SYSTEM');
            }
        }
    }, [isOpen]);

    const handleClear = () => {
        setEmp_Code('');
        setEmp_Name('');
        setPass_Word('');
        setConpass_Word('');
        setMust_Change('0');
        setCant_Change('0');
        setAcc_Desable('0');
        setExp_Date('');
        setMember_Id('Administrators');
        setShowPassword(false);
    };

    const handleUserSelect = async (user) => {
        const selectedCode = user.emp_Code || user.Emp_Code;
        if (!selectedCode) return;
        
        setFetching(true);
        try {
            const profile = await userProfileService.getUserProfile(selectedCode);
            setEmp_Code(profile.emp_Code);
            setEmp_Name(profile.emp_Name || '');
            setPass_Word(profile.pass_Word || '');
            setConpass_Word(profile.pass_Word || '');
            setMust_Change(profile.must_Change || '0');
            setCant_Change(profile.cant_Change || '0');
            setAcc_Desable(profile.acc_Desable || '0');
            setExp_Date(profile.exp_Date || '');
            setMember_Id(profile.member_Id || 'Administrators');
        } catch (error) {
            showErrorToast('Failed to load user profile');
        } finally {
            setFetching(false);
        }
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
        } catch (error) {
            showErrorToast(error.message || 'Failed to save user profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!emp_Code) return showErrorToast('No user selected for deletion');
        if (!window.confirm('Do you really want to delete this user?')) return;

        setDeleting(true);
        try {
            await userProfileService.deleteUser(emp_Code);
            showSuccessToast('User profile deleted successfully');
            handleClear();
        } catch (error) {
            showErrorToast(error.message || 'Failed to delete user profile');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="User Profile Maintenance"
                maxWidth="max-w-[550px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={saving} className="px-8 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-100 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEditing ? 'Update' : 'Add User'}
                        </button>
                        <button onClick={handleDelete} disabled={!isEditing || deleting} className="px-8 h-10 bg-[#ff3b30] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#e03127] shadow-md shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <Trash2 size={16} /> Delete
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <RotateCcw size={16} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="py-4 select-none font-['Tahoma'] space-y-4 text-[12.5px]">
                    
                    {/* User Code */}
                    <div className="flex items-center gap-3 px-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">User Code</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <div className="w-[275px] h-8 border border-gray-300 px-3 bg-white rounded-[5px] flex items-center font-bold text-[#0078d4] shadow-sm">
                                {fetching ? 'LOADING...' : (emp_Code || '')}
                            </div>
                            <button onClick={() => setShowSearchModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 flex-shrink-0">
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* User Name */}
                    <div className="flex items-center gap-3 px-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">User Name</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <input type="text" value={emp_Name} onChange={(e) => setEmp_Name(e.target.value)} className="w-[275px] h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold uppercase shadow-sm" />
                            <div className="w-10 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Member Group */}
                    <div className="flex items-center gap-3 px-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">Member Group</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <input type="text" value={member_Id} readOnly className="w-[275px] h-8 border border-gray-300 px-3 bg-slate-50 text-slate-500 rounded-[5px] font-bold uppercase" />
                            <button onClick={() => setShowGroupModal(true)} className="w-10 h-8 bg-[#e49e1b] text-white flex items-center justify-center hover:bg-[#cb9b34] rounded-[5px] transition-all shadow-md active:scale-95 flex-shrink-0">
                                <Users size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-3 px-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">Password</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={pass_Word} 
                                onChange={(e) => setPass_Word(e.target.value)} 
                                className="w-[275px] h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" 
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="w-10 h-8 bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 rounded-[5px] transition-all active:scale-95 flex-shrink-0 border border-slate-200"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex items-center gap-3 px-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">Confirm Pwd</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={conpass_Word} 
                                onChange={(e) => setConpass_Word(e.target.value)} 
                                className={`w-[275px] h-8 border ${conpass_Word && pass_Word === conpass_Word ? 'border-green-500 bg-green-50/20' : 'border-gray-300 bg-white'} px-3 rounded-[5px] outline-none focus:border-blue-400 shadow-sm`} 
                            />
                            <div className="w-10 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="flex items-center gap-3 px-2 pt-2">
                        <label className="w-32 font-bold text-gray-700 uppercase">Expiry Date</label>
                        <div className="w-[325px] flex items-center gap-2">
                            <input type="text" value={exp_Date} readOnly onClick={() => setShowCalendar(true)} className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] font-bold text-slate-700 shadow-sm cursor-pointer" placeholder="DD/MM/YYYY" />
                            <button onClick={() => setShowCalendar(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 flex-shrink-0">
                                <Calendar size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Checkboxes Area */}
                    <div className="flex flex-col gap-2.5 ml-[10px] pt-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={must_Change === '1'} onChange={(e) => setMust_Change(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-[#0285fd]" />
                            <span className="font-bold text-gray-600 uppercase text-[11px]">Must Change Password Next Login</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={cant_Change === '1'} onChange={(e) => setCant_Change(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-[#0285fd]" />
                            <span className="font-bold text-gray-600 uppercase text-[11px]">User Cannot Change Password</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-red-600">
                            <input type="checkbox" checked={acc_Desable === '1'} onChange={(e) => setAcc_Desable(e.target.checked ? '1' : '0')} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                            <span className="font-bold uppercase text-[11px]">Account Disabled</span>
                        </label>
                    </div>

                    {/* Advanced Actions */}
                    <div className="pt-4 border-t border-gray-100 flex justify-center">
                        <button onClick={() => setShowCostCenterAuth(true)} className="px-10 h-8 bg-[#0078d4] text-white text-[10px] font-black rounded-[5px] hover:bg-[#005a9e] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center uppercase tracking-[0.1em]">
                            Cost Center Authentication
                        </button>
                    </div>

                    {/* Status Info */}
                    <div className="pt-2 text-[9px] font-bold text-slate-400 flex items-center gap-2 justify-center italic uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        Last Modified By: {last_Modified_User}
                    </div>
                </div>
            </SimpleModal>

            {/* Sub Modals */}
            <UserSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onSelect={handleUserSelect} />
            <UserGroupSearchModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} onSelect={setMember_Id} />
            <CostCenterAuthModal isOpen={showCostCenterAuth} onClose={() => setShowCostCenterAuth(false)} empCode={emp_Code} empName={emp_Name} userRole={member_Id} />
            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onSelectDate={(date) => { setExp_Date(date); setShowCalendar(false); }} initialDate={exp_Date} />
        </>
    );
};

export default UserProfileBoard;
