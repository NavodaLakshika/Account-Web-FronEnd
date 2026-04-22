import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Save, RotateCcw, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({ baseURL: '/api/UserProfile', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const companyRaw = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyRaw) {
                try {
                    const parsed = JSON.parse(companyRaw);
                    companyCode = parsed.companyCode || parsed.CompanyCode || parsed.company_Code || '';
                } catch { companyCode = companyRaw; }
            }
            setFormData(prev => ({
                ...prev,
                LastModUser: user?.emp_Name || user?.Emp_Name || user?.empName || 'SYSTEM'
            }));
            loadUsers(companyCode);
        }
    }, [isOpen]);

    const loadUsers = async (companyCode) => {
        try {
            const res = await api.get('/searchUsers', { params: { companyCode, query: '' } });
            setUsers(res.data);
        } catch (err) {
            console.error('Load users failed:', err);
            toast.error('Could not load user list');
        }
    };

    const handleUserSelect = (u) => {
        setFormData(prev => ({ ...prev, EmpCode: u.emp_Code, UserName: u.emp_Name }));
        setShowUserModal(false);
        setUserSearchQuery('');
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
            const res = await api.post('/changePassword', {
                EmpCode: formData.EmpCode,
                UserName: formData.UserName,
                CurrentPassword: formData.CurrentPassword,
                NewPassword: formData.NewPassword,
                LastModUser: formData.LastModUser
            });
            toast.success(res.data?.message || 'Password changed successfully');
            setFormData({ ...initialState, LastModUser: formData.LastModUser });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({ ...initialState, LastModUser: formData.LastModUser });
    };

    const filteredUsers = users.filter(u =>
        u.emp_Name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.emp_Code?.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Change Password"
                maxWidth="max-w-xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Change
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-4 min-h-[300px]">
                    <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-center">
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">System Security & Password Update</h2>
                    </div>

                    <div className="space-y-4">
                        {/* User Name */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">User Name</label>
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="text"
                                    value={formData.UserName}
                                    readOnly
                                    placeholder="Click to search user..."
                                    onClick={() => setShowUserModal(true)}
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-blue-600 shadow-sm cursor-pointer transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Current Password</label>
                            <input
                                type="password"
                                value={formData.CurrentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))}
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md max-w-[280px]"
                                placeholder="Enter current password"
                            />
                        </div>

                        {/* New Password */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={formData.NewPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))}
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md max-w-[280px]"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.ConfirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
                                className={`flex-1 h-8 border ${formData.ConfirmPassword && formData.NewPassword === formData.ConfirmPassword ? 'border-green-500 bg-green-50/30' : 'border-gray-300 bg-white'} px-3 rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md max-w-[280px]`}
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* User Search Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUserModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Search size={16} />
                                <span className="text-sm font-bold uppercase tracking-tight">System Users Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Name or Code..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={userSearchQuery} 
                                onChange={(e) => setUserSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-32 text-center">Emp Code</span>
                                <span className="flex-1 px-3">User Name</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">
                                        {users.length === 0 ? 'Loading users...' : 'No users found'}
                                    </div>
                                ) : (
                                    filteredUsers.map((u, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleUserSelect(u)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                    {u.emp_Code}
                                                </span>
                                                <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                    {u.emp_Name}
                                                </span>
                                            </div>
                                            <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{filteredUsers.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD INFRASTRUCTURE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <CheckCircle2 size={40} className="text-[#0078d4]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Change</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Are you sure you want to change the password for{' '}
                                <span className="font-bold text-[#0078d4] uppercase">"{formData.UserName}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                                <button onClick={confirmChange} className="flex-1 h-12 bg-[#0078d4] text-white font-bold rounded-xl hover:bg-[#005a9e] shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Change Password
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
