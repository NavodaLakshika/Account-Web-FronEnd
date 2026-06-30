import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, Shield, Mail, Phone, Lock, Loader2, Search, List, Save, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import ConfirmModal from '../ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const CompanyUsersModal = ({ isOpen, onClose }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
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
        e.preventDefault();
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
            setShowAddForm(false);
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
 <div className="relative w-full max-w-[900px] bg-white shadow-2xl rounded-[3px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-400">
                
                {/* Custom Header similar to original but refined */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 select-none">
                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-[#0285fd]" />
                        <span className="text-[14px] font-bold text-slate-800 uppercase tracking-widest font-mono">
                            USER & ROLE MANAGEMENT
                        </span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-[3px] transition-all outline-none border-none group"
                        title="Close"
                    >
                        <X size={28} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="p-5 bg-white flex-1 overflow-y-auto max-h-[75vh] space-y-5">
                    {/* Toolbar / Add Form */}
                    <div>
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-6 h-8 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono text-[11px] font-bold rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-widest"
                            >
                                <UserPlus size={14} /> ADD NEW EMPLOYEE USER
                            </button>
                        ) : (
                            <div className="bg-[#f8fafd] border border-blue-100/50 rounded-[3px] p-5 shadow-sm relative overflow-hidden animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100 relative z-10">
                                    <div className="flex items-center gap-2 text-[#0285fd]">
                                        <Shield size={16} />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest">Register System User</h4>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddForm(false)}
                                        className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-all flex items-center gap-1 border border-red-100 hover:bg-red-50 px-3 py-1 rounded"
                                    >
                                        <X size={28} /> CANCEL
                                    </button>
                                </div>

                                <form onSubmit={handleAddUser} className="grid grid-cols-12 gap-x-5 gap-y-4 relative z-10">
                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username *</label>
                                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 bg-white rounded-[3px] outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all" required />
                                    </div>
                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password *</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 bg-white rounded-[3px] outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" required />
                                    </div>
                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 bg-white rounded-[3px] outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all" />
                                    </div>
                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 bg-white rounded-[3px] outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" />
                                    </div>

                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Role *</label>
                                        <div className="flex gap-1 h-8">
                                            <input type="text" readOnly value={roleOptions.find(o => o.id === roleId)?.name || 'Select Role'} onClick={() => setShowRoleModal(true)} className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-bold text-[#0285fd] bg-white rounded-[3px] outline-none cursor-pointer focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all uppercase" />
                                            <button type="button" onClick={() => setShowRoleModal(true)} className="w-10 h-8 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 flex items-center justify-center hover:bg-[#0099e6] rounded-[3px] transition-all active:scale-95 border-none">
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Group Access</label>
                                        <input type="text" value={groupName} disabled className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-400 bg-slate-50 rounded-[3px] cursor-not-allowed outline-none uppercase" />
                                    </div>

                                    <div className="col-span-12 mt-2">
                                        <button type="submit" disabled={submitting} className={`px-6 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono text-[11px] font-bold rounded-[3px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-widest ${submitting ? 'opacity-70' : ''}`}>
                                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CREATE ACCOUNT
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-[3px] overflow-hidden">
                        {loading ? (
                            <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Loader2 size={24} className="animate-spin text-[#00adff]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse bg-white">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 border-r border-slate-200">Employee ID</th>
                                        <th className="px-4 py-2 border-r border-slate-200">Details</th>
                                        <th className="px-4 py-2 border-r border-slate-200 text-center">System Role</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.map((emp) => {
                                        const roleName = roleOptions.find(o => o.id === emp.userRole_Id || o.id === emp.UserRole_Id)?.name || 'Custom';
                                        const code = emp.emp_Code || emp.empCode;
                                        return (
                                            <tr key={code} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-2 border-r border-slate-100">
                                                    <div className="text-[12px] font-bold text-slate-700 uppercase">{emp.emp_Name || emp.empName}</div>
                                                    <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">{code}</div>
                                                </td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-[11px] font-mono text-slate-600">
                                                    {emp.email && <div className="flex items-center gap-2"><Mail size={10} className="text-slate-400"/> {emp.email}</div>}
                                                    {emp.phone_Number && <div className="flex items-center gap-2 mt-0.5"><Phone size={10} className="text-slate-400"/> {emp.phone_Number}</div>}
                                                    {!emp.email && !emp.phone_Number && <span className="text-slate-400 italic font-sans text-[10px]">N/A</span>}
                                                </td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[3px] border text-[9px] font-black uppercase tracking-wider ${
                                                        emp.userRole_Id === 1 || emp.UserRole_Id === 1 ? 'bg-blue-50 border-blue-200 text-[#0285fd]' : 'bg-slate-50 border-slate-200 text-slate-500'
                                                    }`}>
                                                        {roleName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {emp.userRole_Id !== 1 && emp.UserRole_Id !== 1 ? (
                                                        <button
                                                            onClick={() => requestDeleteUser(code)}
                                                            className="w-7 h-7 inline-flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-all border border-transparent hover:border-red-100"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Protected</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Role Search Modal styled to match */}
            {showRoleModal && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
 <div className="relative w-full max-w-[500px] bg-white shadow-2xl rounded-[3px] overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="bg-[#f8fafd] px-4 py-3 flex justify-between items-center border-b border-slate-200">
                            <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Select User Role</span>
                            <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-red-500"><X size={28}/></button>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="SEARCH ROLES..."
                                    className="w-full h-8 pl-9 pr-3 border border-slate-200 rounded-[3px] text-[11px] font-bold outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all uppercase placeholder-slate-300"
                                    value={roleSearchTerm}
                                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="border border-slate-200 rounded-[3px] max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2 border-r border-slate-200">Code</th>
                                            <th className="px-4 py-2 border-r border-slate-200">Role Name</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {roleOptions.filter(r => (r.name || '').toLowerCase().includes(roleSearchTerm.toLowerCase())).map(role => (
                                            <tr key={role.id} className="hover:bg-blue-50/30">
                                                <td className="px-4 py-2 border-r border-slate-100 font-mono text-[11px] font-bold text-slate-500">{role.id}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-[11px] font-bold text-slate-700 uppercase">{role.name}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button onClick={() => handleSelectRole(role)} className="px-3 py-1 bg-[#0285fd] hover:bg-[#0073ff] text-white text-[9px] font-black rounded-[3px] uppercase tracking-widest">Select</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default CompanyUsersModal;
