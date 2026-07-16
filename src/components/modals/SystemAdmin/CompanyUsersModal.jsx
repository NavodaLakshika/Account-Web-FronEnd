import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, Shield, Mail, Phone, Lock, Loader2, Search, List, Save, AlertCircle, RotateCcw } from 'lucide-react';
import api from '../../../services/api';
import ConfirmModal from '../ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import TransactionFormWrapper from '../../TransactionFormWrapper';
import SimpleModal from '../../SimpleModal';

const CompanyUsersModal = ({ isOpen, onClose }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [companyCode, setCompanyCode] = useState('');

    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roleId, setRoleId] = useState(2); 
    const [groupName, setGroupName] = useState('Accountants');
    const [roleOptions, setRoleOptions] = useState([]);

    // Modal selectors
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleSearchTerm, setRoleSearchTerm] = useState('');

    // Delete Confirmation Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingEmpCode, setDeletingEmpCode] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let activeCompany = '';
        const selectedCompanyStr = localStorage.getItem('selectedCompany');
        if (selectedCompanyStr) {
            try {
                const companyObj = JSON.parse(selectedCompanyStr);
                activeCompany = companyObj?.companyCode || companyObj?.CompanyCode || companyObj?.code || companyObj?.Code || companyObj?.Company_Id || '';
            } catch (e) {
                activeCompany = selectedCompanyStr;
            }
        }
        if (!activeCompany) activeCompany = localStorage.getItem('activeCompany') || localStorage.getItem('company') || '';
        
        setCompanyCode(activeCompany);

        const fetchRoles = async () => {
            try {
                // Pass the active company code so the backend can filter roles correctly
                const res = await api.get(`/UserRole/system-roles?companyCode=${activeCompany}`);
                const mapped = (res.data || []).map(r => ({
                    id: r.id || r.Id,
                    name: r.name || r.Name,
                    group: r.name || r.Name
                }));
                setRoleOptions(mapped);
                if (mapped.length > 0) {
                    const accountantOpt = mapped.find(o => o.id === 2);
                    if (accountantOpt) {
                        setRoleId(2);
                        setGroupName(accountantOpt.group);
                    } else {
                        setRoleId(mapped[0].id);
                        setGroupName(mapped[0].group);
                    }
                }
            } catch (err) {
                console.error('Error loading roles', err);
                setRoleOptions([]);
            }
        };

        if (isOpen) {
            fetchRoles();
            if (activeCompany) fetchEmployees(activeCompany);
            else setLoading(false);
        }
    }, [isOpen]);

    const fetchEmployees = async (compCode) => {
        setLoading(true);
        try {
            const res = await api.get(`/Company/employees?companyCode=${compCode}`);
            let data = res.data || [];
            if (compCode) {
                data = data.filter(e => {
                    const empComp = e.company_Code || e.CompanyCode || e.companyCode || e.Company_Code;
                    return !empComp || empComp === compCode;
                });
            }
            setEmployees(data);
        } catch (err) {
            showErrorToast('Failed to load company employees.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role) => {
        setRoleId(role.id);
        setGroupName(role.group);
        setShowRoleModal(false);
    };

    const handleAddUser = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!username || !password) {
            showErrorToast('Username and password are required.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/Auth/admin-create-user', {
                emp_Name: username,
                pass_Word: password,
                company_Code: companyCode,
                userRole_Id: roleId,
                member_Id: groupName,
                email: email,
                phone_Number: phone
            });
            showSuccessToast(`User ${username} created successfully!`);
            setUsername(''); setPassword(''); setEmail(''); setPhone('');
            fetchEmployees(companyCode);
        } catch (err) {
            showErrorToast(err.response?.data?.message || 'Failed to create user.');
        } finally {
            setSubmitting(false);
        }
    };

    const requestDeleteUser = (empCode) => {
        setDeletingEmpCode(empCode);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingEmpCode) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/Company/employee/${deletingEmpCode}?companyCode=${companyCode}`);
            showSuccessToast('User removed successfully.');
            setEmployees(prev => prev.filter(e => e.emp_Code !== deletingEmpCode && e.empCode !== deletingEmpCode));
            setShowDeleteConfirm(false);
        } catch (err) {
            showErrorToast(err.response?.data?.message || 'Failed to remove user.');
        } finally {
            setDeleteLoading(false);
            setDeletingEmpCode(null);
        }
    };

    if (!isOpen) return null;

    return (
        <TransactionFormWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="User & Role Management"
            subtitle="System Administration"
            icon={Users}
            maxWidth="max-w-5xl"
            footer={
                <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3">
                        <button type="button" onClick={() => {setUsername(''); setPassword(''); setEmail(''); setPhone('');}} disabled={submitting} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={handleAddUser} disabled={submitting} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-70' : ''}`}>
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CREATE ACCOUNT
                        </button>
                    </div>
                </div>
            }
        >
            <div className="select-none font-['Tahoma'] space-y-4">
                
                {/* Add User Form Section */}
                <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-2">
                        <div className="h-4 w-1.5 bg-[#0285fd] rounded"></div>
                        <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-widest leading-none">
                            Register System User
                        </h4>
                    </div>

                    <form id="addUserForm" onSubmit={handleAddUser} className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                        <div className="col-span-12 lg:col-span-6 space-y-3.5">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Username *</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" required />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password *</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" required />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">User Role *</label>
                                <div className="relative">
                                    <input type="text" readOnly value={roleOptions.find(o => o.id === roleId)?.name || 'Select Role'} onClick={() => setShowRoleModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer uppercase appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-6 space-y-3.5">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Group Access</label>
                                <input type="text" value={groupName} disabled className="w-full h-10 border border-gray-200 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none text-gray-500 uppercase cursor-not-allowed" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[300px]">
                    <div className="flex items-center gap-3 mb-2 px-4 py-3 border-b border-gray-200">
                        <button className="text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all border-blue-600 text-blue-600 leading-none">
                            System Users List
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                <tr>
                                    <th className="px-4 h-10 border-r border-slate-200">Employee ID</th>
                                    <th className="px-4 h-10 border-r border-slate-200">Details</th>
                                    <th className="px-4 h-10 border-r border-slate-200 text-center">System Role</th>
                                    <th className="px-4 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="4" className="h-[120px] align-middle text-center text-gray-300 font-black text-[11px] uppercase tracking-widest animate-pulse">Loading Users...</td>
                                    </tr>
                                )}
                                {!loading && employees.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="h-[120px] align-middle text-center text-gray-300 font-black text-[11px] uppercase tracking-widest">No users found.</td>
                                    </tr>
                                )}
                                {!loading && employees.map((emp) => {
                                    const roleName = roleOptions.find(o => o.id === emp.userRole_Id || o.id === emp.UserRole_Id)?.name || 'Custom';
                                    const code = emp.emp_Code || emp.empCode;
                                    return (
                                        <tr key={code} className="border-b border-gray-50 text-[12px] text-gray-700 hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-3 border-r border-slate-100">
                                                <div className="font-bold text-slate-700 uppercase">{emp.emp_Name || emp.empName}</div>
                                                <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">{code}</div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-slate-100 text-[11px] font-mono text-slate-600">
                                                {emp.email && <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400"/> {emp.email}</div>}
                                                {emp.phone_Number && <div className="flex items-center gap-2 mt-1"><Phone size={12} className="text-slate-400"/> {emp.phone_Number}</div>}
                                                {!emp.email && !emp.phone_Number && <span className="text-slate-400 italic font-sans text-[10px]">N/A</span>}
                                            </td>
                                            <td className="px-4 py-3 border-r border-slate-100 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-[3px] border text-[9px] font-black uppercase tracking-wider ${
                                                    emp.userRole_Id === 1 || emp.UserRole_Id === 1 ? 'bg-blue-50 border-blue-200 text-[#0285fd]' : 'bg-slate-50 border-slate-200 text-slate-500'
                                                }`}>
                                                    {roleName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {emp.userRole_Id !== 1 && emp.UserRole_Id !== 1 ? (
                                                    <button
                                                        onClick={() => requestDeleteUser(code)}
                                                        className="w-7 h-7 inline-flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-all border border-transparent hover:border-red-100"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                ) : (
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1"><Lock size={10} /> Protected</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Role Search Modal styled to match */}
            <SimpleModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Select User Role">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Roles</span>
                        <input
                            type="text"
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1 uppercase"
                            value={roleSearchTerm}
                            onChange={(e) => setRoleSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Role Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {roleOptions.filter(r => (r.name || '').toLowerCase().includes(roleSearchTerm.toLowerCase())).map((role, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50 transition-all border-b border-gray-50 cursor-pointer">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{role.id}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3 uppercase">{role.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3 text-center">
                                            <button onClick={() => handleSelectRole(role)} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Warning alerts styled like ConfirmModal */}
            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => !deleteLoading && setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    title="Remove Employee Access"
                    message="Are you sure you want to revoke this user's system access?"
                    loading={deleteLoading}
                    confirmText="Remove Access"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </TransactionFormWrapper>
    );
};

export default CompanyUsersModal;
