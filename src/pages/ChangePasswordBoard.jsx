import React, { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, Lock, Key, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SimpleModal from '../components/SimpleModal';
import { userProfileService } from '../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

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
    const [showPass, setShowPass] = useState({ cur: false, new: false, con: false });

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.companyCode || parsed.CompanyCode || parsed.company_Code || (typeof companyData === 'string' ? companyData : '');
                } catch {
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
            const data = await userProfileService.searchUsers(companyCode);
            setUsers(data);
            if (data.length === 0 && companyCode) {
                showErrorToast(`No users found for company: ${companyCode}`);
            }
        } catch (error) {
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

    const filteredUsers = users.filter(u =>
        (u?.emp_Name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u?.emp_Code || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    return (
        <>
            <TransactionFormWrapper subtitle="Update system user account passwords" icon={null}
                isOpen={isOpen} onClose={onClose} title="Change Password"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} CHANGE PASSWORD</button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target User</label>
                                <div className="relative">
                                    <input type="text" value={formData.UserName} readOnly onClick={() => setShowUserModal(true)} placeholder="Search system user..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer" />
                                    <button onClick={() => setShowUserModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Search size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input type={showPass.cur ? "text" : "password"} value={formData.CurrentPassword} onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))} placeholder="••••••••" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10" />
                                    <button onClick={() => setShowPass(p => ({ ...p, cur: !p.cur }))} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">{showPass.cur ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input type={showPass.new ? "text" : "password"} value={formData.NewPassword} onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))} placeholder="••••••••" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10" />
                                    <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">{showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Verify Password</label>
                                <div className="relative">
                                    <input type={showPass.con ? "text" : "password"} value={formData.ConfirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))} placeholder="Re-enter password" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10" />
                                    <button onClick={() => setShowPass(p => ({ ...p, con: !p.con }))} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">{showPass.con ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="System Users Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find user..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">EMPLOYEE ID</th><th className=" px-5 py-3">USER NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((u, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleUserSelect(u)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{u.emp_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{u.emp_Name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                        {users.length === 0 ? 'Synchronizing User Data...' : 'No matching records found'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><Lock size={40} className="text-emerald-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Apply Changes?</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to change the password for <span className="font-bold text-slate-800 uppercase">"{formData.UserName}"</span>?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmChange} disabled={loading} className="flex-1 h-11 bg-[#0285fd] text-white text-[11px] font-black rounded-[3px] hover:bg-[#0073ff] shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Update Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChangePasswordBoard;
