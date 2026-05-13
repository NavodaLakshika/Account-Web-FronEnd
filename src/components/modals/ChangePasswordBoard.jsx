import React, { useState, useEffect } from 'react';
import SimpleModal from '../SimpleModal';
import { Search, Save, RotateCcw, X, Loader2, Lock, User, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { userProfileService } from '../../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
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
            
            fetchUsers(companyCode);
        }
    }, [isOpen]);


    const fetchUsers = async (companyCode) => {
        setLoading(true);
        try {
            console.log('Fetching users for company:', companyCode);
            const data = await userProfileService.searchUsers(companyCode);
            setUsers(data);
            if (data.length === 0 && companyCode) {
                toast.error(`No users found for company: ${companyCode}`);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            showErrorToast('Error loading employees: ' + (error.message || error));
        } finally {
            setLoading(false);
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
        if (!formData.EmpCode) return showErrorToast('Please select a user');
        if (!formData.CurrentPassword) return showErrorToast('Current password is required');
        if (!formData.NewPassword) return showErrorToast('New password is required');
        if (formData.NewPassword !== formData.ConfirmPassword) return showErrorToast('Passwords do not match');
        
        setShowSaveConfirm(true);
    };

    const confirmChange = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            const response = await userProfileService.changePassword(formData);
            showSuccessToast(response.message);
            handleClear();
        } catch (error) {
            showErrorToast(typeof error === 'string' ? error : (error.message || 'Operation failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({ ...initialState, LastModUser: formData.LastModUser });
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
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
            <SimpleModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="Select System Employee"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Search Section matching PurchaseOrderBoard style */}
                    <div className="flex items-center gap-4 bg-slate-50/80 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Global Archive Search</span>
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Filter by name or employee code..." 
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm transition-all"
                                value={userSearchQuery} 
                                onChange={(e) => setUserSearchQuery(e.target.value)} 
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={() => {
                                const companyData = localStorage.getItem('selectedCompany');
                                let companyCode = '';
                                if (companyData) {
                                    try {
                                        const parsed = JSON.parse(companyData);
                                        companyCode = parsed.companyCode || parsed.CompanyCode || parsed.company_Code || '';
                                    } catch (e) { companyCode = companyData; }
                                }
                                fetchUsers(companyCode);
                            }}
                            className="p-2 text-[#0285fd] hover:bg-blue-50 rounded-md transition-colors"
                            title="Reload Data"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {/* Table matching PurchaseOrderBoard style */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3 w-32">Reference ID</th>
                                    <th className="px-5 py-3">Full Name / Description</th>
                                    <th className="px-5 py-3 text-right">SELECT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.filter(u => u?.emp_Name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || u?.emp_Code?.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-20 text-gray-300 text-[12px] font-bold uppercase tracking-widest">
                                            {loading ? "Establishing database connection..." : "No matching employees found"}
                                        </td>
                                    </tr>
                                ) : (
                                    users.filter(u => u?.emp_Name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || u?.emp_Code?.toLowerCase().includes(userSearchQuery.toLowerCase())).map((u, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleUserSelect(u)}>
                                            <td className="px-5 py-3 font-mono text-[13px] font-bold text-gray-600 border-r border-gray-50/50">
                                                {u.emp_Code}
                                            </td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-600 uppercase group-hover:text-[#0285fd]">
                                                {u.emp_Name}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleUserSelect(u); }}
                                                    className="bg-[#e49e1b] hover:bg-[#cb9b34] text-white text-[10px] px-5 py-2 rounded-[5px] font-black shadow-md transition-all active:scale-95 uppercase tracking-wider"
                                                >
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between opacity-50 px-2 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Total Records: {users.length}</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${users.length > 0 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Onimta User Registry v1.0</span>
                        </div>
                    </div>
                </div>
            </SimpleModal>

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
