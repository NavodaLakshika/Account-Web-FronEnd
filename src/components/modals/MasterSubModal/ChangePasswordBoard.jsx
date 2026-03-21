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
                            className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Change
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4 min-h-[120px]">
                    <div className="bg-gray-50/50 p-6 border border-gray-200 rounded-sm space-y-4">

                        {/* User Name */}
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">User Name</label>
                            <div className="flex-1 flex gap-1">
                                <input
                                    type="text"
                                    value={formData.UserName}
                                    readOnly
                                    placeholder="Click to search user..."
                                    onClick={() => setShowUserModal(true)}
                                    className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(true)}
                                    className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Current Password</label>
                            <input
                                type="password"
                                value={formData.CurrentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))}
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                                placeholder="Enter current password"
                            />
                        </div>

                        {/* New Password */}
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">New Password</label>
                            <input
                                type="password"
                                value={formData.NewPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))}
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-semibold text-gray-600 w-[120px] shrink-0">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.ConfirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
                                className={`flex-1 h-8 border ${formData.ConfirmPassword && formData.NewPassword === formData.ConfirmPassword ? 'border-green-500' : 'border-gray-300'} px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white`}
                                placeholder="Re-enter new password"
                            />
                        </div>

                    </div>
                </div>
            </SimpleModal>

            {/* User Search Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUserModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search System Users</h3>
                            <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <div className="p-4 bg-white border-b border-gray-100">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search by name or code..."
                                className="w-full h-10 border border-gray-300 px-3 text-sm rounded-md focus:border-blue-500 outline-none"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-500 font-bold uppercase text-[11px]">
                                    <tr>
                                        <th className="p-3 border-b">Emp Code</th>
                                        <th className="p-3 border-b">User Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-6 text-center text-gray-400 text-sm">
                                                {users.length === 0 ? 'Loading users...' : 'No users found'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, i) => (
                                            <tr key={i} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-3 border-b font-bold text-gray-600">{u.emp_Code}</td>
                                                <td className="p-3 border-b font-medium text-gray-700 uppercase">{u.emp_Name}</td>
                                                <td className="p-3 border-b text-center">
                                                    <button onClick={() => handleUserSelect(u)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold">SELECT</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
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
