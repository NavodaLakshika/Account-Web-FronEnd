import React, { useState, useEffect } from 'react';
import { Search, Save, RotateCcw, X, Loader2, Lock, User, Key, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { userProfileService } from '../../services/userProfile.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../MasterFormComponents';
import ConfirmModal from './ConfirmModal';


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
                    // Handle all potential property name variants
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
            console.log('Fetching users for company:', companyCode);
            const data = await userProfileService.searchUsers(companyCode);
            setUsers(data);
            if (data.length === 0 && companyCode) {
                showErrorToast(`No users found for company: ${companyCode}`);
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
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Security - Change Password"
                subtitle="Update system user account passwords"
                icon={Key}
                maxWidth="max-w-[800px]"
                isEditMode={false}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                saveLabel="CHANGE"
                customFooter={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                        <button 
                            onClick={handleClear} 
                            className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> CLEAR FORM
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} CHANGE PASSWORD
                        </button>
                    </div>
                }
            >
                <MasterFieldRow label="Target User" colSpan="col-span-6">
                    <MasterLookupInput value={formData.UserName} onSearchClick={() => setShowUserModal(true)} placeholder="Search system user..." />
                </MasterFieldRow>

                <MasterFieldRow label="Current Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput 
                            type={showPass.cur ? "text" : "password"} 
                            name="CurrentPassword" 
                            value={formData.CurrentPassword} 
                            onChange={(e) => setFormData(prev => ({ ...prev, CurrentPassword: e.target.value }))} 
                            placeholder="••••••••" 
                            className="pr-8"
                        />
                        <button type="button" onClick={() => setShowPass(p => ({ ...p, cur: !p.cur }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D1FF] outline-none">
                            {showPass.cur ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </MasterFieldRow>

                <MasterFieldRow label="New Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput 
                            type={showPass.new ? "text" : "password"} 
                            name="NewPassword" 
                            value={formData.NewPassword} 
                            onChange={(e) => setFormData(prev => ({ ...prev, NewPassword: e.target.value }))} 
                            placeholder="••••••••" 
                            className="pr-8"
                        />
                        <button type="button" onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00D1FF] outline-none">
                            {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </MasterFieldRow>

                <MasterFieldRow label="Verify Password" colSpan="col-span-6">
                    <div className="relative flex-1 flex">
                        <MasterInput 
                            type={showPass.con ? "text" : "password"} 
                            name="ConfirmPassword" 
                            value={formData.ConfirmPassword} 
                            onChange={(e) => setFormData(prev => ({ ...prev, ConfirmPassword: e.target.value }))} 
                            placeholder="Re-enter password" 
                            className="pr-8"
                        />
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
                items={users.filter(u => (u?.emp_Name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u?.emp_Code || '').toLowerCase().includes(userSearchQuery.toLowerCase()))}
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
