import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Loader2, AlertTriangle, Key, User, Search, Eye, EyeOff } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import api from '../../../services/api';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';
import ConfirmModal from '../ConfirmModal';



const ChangePasswordBoard = ({ isOpen, onClose }) => {
    const initialState = { EmpCode: '', UserName: '', CurrentPassword: '', NewPassword: '', ConfirmPassword: '', LastModUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showPass, setShowPass] = useState({ cur: false, new: false, con: false });

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
                maxWidth="max-w-[700px]"
                isEditMode={false}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                saveLabel="CHANGE"
                customFooter={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 py-3 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CHANGE PASSWORD
                            </button>
                        </div>
                    </div>
                }
            >
                <MasterFieldRow label="User Name" colSpan="col-span-6">
                    <MasterLookupInput value={formData.UserName} onSearchClick={() => setShowUserModal(true)} placeholder="Select user..." />
                </MasterFieldRow>
                <MasterFieldRow label="Current Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput 
                            type={showPass.cur ? "text" : "password"} 
                            name="CurrentPassword" 
                            value={formData.CurrentPassword} 
                            onChange={handleInputChange} 
                            placeholder="Enter current password" 
                            className="pr-8"
                        />
                        <button type="button" onClick={() => setShowPass(p => ({ ...p, cur: !p.cur }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D1FF] outline-none">
                            {showPass.cur ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </MasterFieldRow>
                <MasterFieldRow label="New Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput type={showPass.new ? "text" : "password"} name="NewPassword" value={formData.NewPassword} onChange={handleInputChange} placeholder="Enter new password" className="pr-8" />
                        <button type="button" onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D1FF] outline-none">
                            {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </MasterFieldRow>
                <MasterFieldRow label="Confirm Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput type={showPass.con ? "text" : "password"} name="ConfirmPassword" value={formData.ConfirmPassword} onChange={handleInputChange} placeholder="Confirm new password" className="pr-8" />
                        <button type="button" onClick={() => setShowPass(p => ({ ...p, con: !p.con }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D1FF] outline-none">
                            {showPass.con ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
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

            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmChange}
                title="Apply Changes?"
                message={`Are you sure you want to change the password for "${formData.UserName}"?`}
                loading={loading}
                confirmText="UPDATE NOW"
                cancelText="CANCEL"
                variant="primary"
            />
        </>
    );
};

export default ChangePasswordBoard;
