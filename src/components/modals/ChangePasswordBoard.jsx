import React, { useState, useEffect } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, Save, RotateCcw, X, Loader2, Lock, User, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { userProfileService } from '../../services/userProfile.service';
import { toast } from 'react-hot-toast';

const ChangePasswordBoard = ({ isOpen, onClose }) => {
    const initialState = {
        EmpCode: '',
        UserName: '',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmPassword: '',
        LastModUser: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [showPass, setShowPass] = useState({ cur: false, new: false, con: false });
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    // Handle all potential property name variants
                    companyCode = parsed.companyCode || parsed.CompanyCode || parsed.company_Code || (typeof companyData === 'string' ? companyData : '');
                } catch (e) { 
                    companyCode = companyData; 
                }
            }

            setFormData(prev => ({
                ...prev,
                LastModUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
            
            if (companyCode) {
                fetchUsers(companyCode);
            } else {
                console.warn('No company code found for user fetch');
            }
        }
    }, [isOpen]);


    const fetchUsers = async (companyCode) => {
        try {
            const data = await userProfileService.searchUsers(companyCode);
            setUsers(data);
        } catch (error) {
            console.error('Fetch users error:', error);
        }
    };

    const handleUserSelect = (u) => {
        setFormData(prev => ({
            ...prev,
            EmpCode: u.emp_Code,
            UserName: u.emp_Name
        }));
        setShowUserModal(false);
    };

    const handleSave = () => {
        if (!formData.EmpCode) return toast.error('Please select a user');
        if (!formData.CurrentPassword) return toast.error('Current password is required');
        if (!formData.NewPassword) return toast.error('New password is required');
        if (formData.NewPassword !== formData.ConfirmPassword) return toast.error('Passwords do not match');
        
        setShowSaveConfirm(true);
    };

    const confirmChange = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            const response = await userProfileService.changePassword(formData);
            toast.success(response.message);
            handleClear();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : (error.message || 'Operation failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({ ...initialState, LastModUser: formData.LastModUser });
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Security - Change Password"
                maxWidth="max-w-md"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} 
                            Change Password
                        </button>
                        <button 
                            onClick={handleClear} 
                            className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4 font-['Plus_Jakarta_Sans']">
                    {/* User Profile Header */}
                    <div className="flex flex-col items-center bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-2">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-3 border-2 border-blue-200">
                             <User size={32} className="text-blue-600" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            {formData.UserName || "Select Employee"}
                        </h4>
                        <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                            {formData.EmpCode || "User Security Module"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {/* Select User */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Target User</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" value={formData.UserName} readOnly placeholder="Search system user..." className="flex-1 h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-lg outline-none font-medium cursor-pointer" onClick={() => setShowUserModal(true)} />
                                <button onClick={() => setShowUserModal(true)} className="w-9 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-lg shadow-sm">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Current Password</label>
                            <div className="flex-1 relative">
                                <input 
                                    type={showPass.cur ? "text" : "password"} 
                                    value={formData.CurrentPassword} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))}
                                    className="w-full h-9 border border-gray-300 px-3 pr-10 text-[12.5px] rounded-lg outline-none focus:border-blue-500 shadow-sm" 
                                    placeholder="••••••••"
                                />
                                <button onClick={() => setShowPass(p => ({ ...p, cur: !p.cur }))} className="absolute right-3 top-2 text-gray-400 hover:text-blue-600">
                                    {showPass.cur ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-4" />

                        {/* New Password */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">New Password</label>
                            <div className="flex-1 relative">
                                <input 
                                    type={showPass.new ? "text" : "password"} 
                                    value={formData.NewPassword} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))}
                                    className="w-full h-9 border border-gray-300 px-3 pr-10 text-[12.5px] rounded-lg outline-none focus:border-blue-500 shadow-sm font-bold text-blue-600" 
                                    placeholder="••••••••"
                                />
                                <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-2 text-gray-400 hover:text-blue-600">
                                    {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Verify Password</label>
                            <div className="flex-1">
                                <input 
                                    type="password" 
                                    value={formData.ConfirmPassword} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
                                    className={`w-full h-9 border ${formData.ConfirmPassword && formData.NewPassword === formData.ConfirmPassword ? 'border-green-500' : 'border-gray-300'} px-3 text-[12.5px] rounded-lg outline-none shadow-sm`}
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* User Selection Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUserModal(false)} />
                    <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[70vh] animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select System Employee</h3>
                            <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-white border-b border-gray-50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Quick search users..." className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} />
                            </div>
                        </div>
                        <div className="overflow-y-auto no-scrollbar">
                            {users.filter(u => u.emp_Name.toLowerCase().includes(userSearchQuery.toLowerCase())).map((u, i) => (
                                <button key={i} onClick={() => handleUserSelect(u)} className="w-full p-4 flex items-center gap-4 hover:bg-blue-50 border-b border-gray-50 transition-all text-left group">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white">
                                        {u.emp_Name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800 uppercase leading-none mb-1">{u.emp_Name}</div>
                                        <div className="text-[10px] font-bold text-blue-500/70 tracking-tighter">{u.emp_Code}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-sm">
                                <CheckCircle2 size={32} className="text-[#0078d4]" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-1">Apply Changes?</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-6">
                                Are you sure you want to change the password for <span className="font-bold text-blue-600 uppercase">"{formData.UserName}"</span>?
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSaveConfirm(false)} className="flex-1 h-10 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 text-xs transition-all active:scale-95">Cancel</button>
                                <button onClick={confirmChange} className="flex-1 h-10 bg-[#0078d4] text-white font-bold rounded-lg hover:bg-[#005a9e] text-xs transition-all active:scale-95 shadow-sm shadow-blue-200">
                                    Update Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChangePasswordBoard;
