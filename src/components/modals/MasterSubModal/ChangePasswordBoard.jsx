import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Loader2, AlertTriangle, Key, User, Search } from 'lucide-react';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const api = axios.create({ baseURL: '/api' });

const ChangePasswordBoard = ({ isOpen, onClose }) => {
    const initialState = { EmpCode: '', UserName: '', CurrentPassword: '', NewPassword: '', ConfirmPassword: '', LastModUser: '' };

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
                try { const p = JSON.parse(companyRaw); companyCode = p.companyCode || p.CompanyCode || p.company_Code || ''; } catch { companyCode = companyRaw; }
            }
            setFormData(prev => ({ ...prev, LastModUser: user?.emp_Name || user?.Emp_Name || user?.empName || 'SYSTEM' }));
            loadUsers(companyCode);
        }
    }, [isOpen]);

    const loadUsers = async (companyCode) => {
        try {
            const res = await api.get('/searchUsers', { params: { companyCode, query: '' } });
            setUsers(res.data);
        } catch (err) { console.error('Load users failed:', err); showErrorToast('Could not load user list'); }
    };

    const handleUserSelect = (u) => {
        setFormData(prev => ({ ...prev, EmpCode: u.emp_Code, UserName: u.emp_Name }));
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
            const res = await api.post('/changePassword', { EmpCode: formData.EmpCode, UserName: formData.UserName, CurrentPassword: formData.CurrentPassword, NewPassword: formData.NewPassword, LastModUser: formData.LastModUser });
            showSuccessToast(res.data?.message || 'Password changed successfully');
            setFormData({ ...initialState, LastModUser: formData.LastModUser });
        } catch (err) { showErrorToast(err.response?.data?.message || err.message || 'Failed to change password'); } finally { setLoading(false); }
    };

    const handleClear = () => {
        setFormData({ ...initialState, LastModUser: formData.LastModUser });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Change Password"
                subtitle="Update system user account passwords"
                icon={Key}
                maxWidth="max-w-xl"
                isEditMode={false}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                saveLabel="CHANGE"
                customFooter={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CHANGE PASSWORD
                            </button>
                        </div>
                    </div>
                }
            >
                <MasterFieldRow label="User Name" colSpan="col-span-12">
                    <MasterLookupInput value={formData.UserName} onSearchClick={() => setShowUserModal(true)} placeholder="Select user..." />
                </MasterFieldRow>
                <MasterFieldRow label="Current Password" colSpan="col-span-12">
                    <MasterInput type="password" name="CurrentPassword" value={formData.CurrentPassword} onChange={handleInputChange} placeholder="Enter current password" />
                </MasterFieldRow>
                <MasterFieldRow label="New Password" colSpan="col-span-12">
                    <MasterInput type="password" name="NewPassword" value={formData.NewPassword} onChange={handleInputChange} placeholder="Enter new password" />
                </MasterFieldRow>
                <MasterFieldRow label="Confirm Password" colSpan="col-span-12">
                    <MasterInput type="password" name="ConfirmPassword" value={formData.ConfirmPassword} onChange={handleInputChange} placeholder="Confirm new password" />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="System Users Lookup"
                columns={[
                    { label: 'EMPLOYEE ID', key: 'emp_Code', isId: true, width: 'w-[120px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.emp_Code}</span> },
                    { label: 'USER NAME', key: 'emp_Name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.emp_Name}</span> },
                ]}
                items={users.filter(u => (u.emp_Name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.emp_Code || '').toLowerCase().includes(userSearchQuery.toLowerCase()))}
                onSelect={handleUserSelect}
                emptyMsg={users.length === 0 ? 'Synchronizing User Data...' : 'No matching records found'}
                searchQuery={userSearchQuery}
                setSearchQuery={setUserSearchQuery}
            />

            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowSaveConfirm(false)} />
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-blue-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Change</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">
                                Are you sure you want to change the password for <span className="font-bold text-[#0285fd] uppercase">"{formData.UserName}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmChange} disabled={loading} className="flex-1 h-11 bg-blue-500 text-white text-[11px] font-black rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Change Password'}</button>
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
