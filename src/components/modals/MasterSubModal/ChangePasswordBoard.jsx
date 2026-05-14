import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import ConfirmModal from '../ConfirmModal';
import { Search, Save, RotateCcw, X, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
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
                    <div className="bg-slate-50 px-6  w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
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
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1">
                    <div className="space-y-4">
                        {/* User Name */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">User Name</label>
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="text"
                                    value={formData.UserName}
                                    readOnly
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
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="password"
                                    value={formData.CurrentPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))}
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                                />
                                <div className="w-10" /> {/* Spacer to align with search button above */}
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">New Password</label>
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="password"
                                    value={formData.NewPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))}
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md"
                                />
                                <div className="w-10" /> {/* Spacer to align with search button above */}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Confirm Password</label>
                            <div className="flex-1 flex gap-3">
                                <input
                                    type="password"
                                    value={formData.ConfirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))}
                                    className={`flex-1 h-8 border ${formData.ConfirmPassword && formData.NewPassword === formData.ConfirmPassword ? 'border-green-500 bg-green-50/30' : 'border-gray-300 bg-white'} px-3 rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md`}
                                />
                                <div className="w-10" /> {/* Spacer to align with search button above */}
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* User Search Modal */}
            <SimpleModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="System Users Lookup"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Search Input Area */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <div className="flex items-center gap-2">
                            <Search size={14} className="text-gray-400" />
                            <span className="text-[10px] font-[900] text-gray-500 uppercase tracking-[0.2em] text-center">Search Facility</span>
                        </div>
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Find by Name or Code..." 
                                className="w-full h-9 border border-gray-300 px-3 text-xs rounded-md focus:border-[#0285fd] outline-none shadow-sm transition-all bg-white" 
                                value={userSearchQuery} 
                                onChange={(e) => setUserSearchQuery(e.target.value)} 
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#f8fafd] px-4 py-2.5 flex text-[10px] font-[900] text-gray-400 border-b border-gray-100 uppercase tracking-[0.15em]">
                            <span className="w-32 text-center">Employee ID</span>
                            <span className="flex-1 px-3">Identity Title</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            {filteredUsers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                                        {users.length === 0 ? 'Synchronizing User Data...' : 'No matching records found'}
                                    </p>
                                </div>
                            ) : (
                                filteredUsers.map((u, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleUserSelect(u)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-xs border-b border-gray-50 hover:bg-blue-50/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[12px] font-bold text-[#0078d4]">
                                                {u.emp_Code}
                                            </span>
                                            <span className="flex-1 px-3 font-bold text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {u.emp_Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-6 py-1.5 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-wider">Select</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmChange}
                title="Confirm Change"
                message={<>Are you sure you want to change the password for <span className="font-bold text-[#0078d4] uppercase">"{formData.UserName}"</span>?</>}
                loading={loading}
                confirmText="Change Password"
                cancelText="Cancel"
            />
        </>
    );
};

export default ChangePasswordBoard;
