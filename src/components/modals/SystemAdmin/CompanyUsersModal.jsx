import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trash2, Shield, Mail, Phone, Lock, Loader2, Search, List } from 'lucide-react';
import api from '../../../services/api';
import SimpleModal from '../../SimpleModal';
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
    const [roleId, setRoleId] = useState(2); // Default to Accountant
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
        const fetchRoles = async () => {
            try {
                const res = await api.get('/UserRole/system-roles');
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
        fetchRoles();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        let activeCompany = '';
        const selectedCompanyStr = localStorage.getItem('selectedCompany');
        if (selectedCompanyStr) {
            try {
                const companyObj = JSON.parse(selectedCompanyStr);
                activeCompany = companyObj?.companyCode || companyObj?.CompanyCode || '';
            } catch (e) {
                console.error('Error parsing company from localStorage', e);
            }
        }

        // Fallback to raw values if object parsing failed
        if (!activeCompany) {
            activeCompany = localStorage.getItem('activeCompany') || localStorage.getItem('company') || '';
        }

        setCompanyCode(activeCompany);

        if (activeCompany) {
            fetchEmployees(activeCompany);
        } else {
            setLoading(false);
        }
    }, [isOpen]);

    const fetchEmployees = async (compCode) => {
        setLoading(true);
        try {
            const res = await api.get(`/Company/employees?companyCode=${compCode}`);
            setEmployees(res.data || []);
        } catch (err) {
            console.error('Error fetching company employees', err);
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
            
            // Reset form
            setUsername('');
            setPassword('');
            setEmail('');
            setPhone('');
            
            // Default back to Accountant
            const accountantOpt = roleOptions.find(o => o.id === 2);
            if (accountantOpt) {
                setRoleId(2);
                setGroupName(accountantOpt.group);
            } else if (roleOptions.length > 0) {
                setRoleId(roleOptions[0].id);
                setGroupName(roleOptions[0].group);
            }
            setShowAddForm(false);

            // Refresh list
            fetchEmployees(companyCode);
        } catch (err) {
            console.error('Error creating user', err);
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
            console.error('Error removing user', err);
            showErrorToast(err.response?.data?.message || 'Failed to remove user.');
        } finally {
            setDeleteLoading(false);
            setDeletingEmpCode(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 font-['Tahoma']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Body */}
            <div className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-white px-6 h-14 flex items-center border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                    />
                    
                    <div className="flex-grow flex items-center">
                        <span className="text-[15px] font-[650] text-slate-900 uppercase tracking-[2px] font-sans truncate">
                            User & Role Management
                        </span>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 active:scale-90 border-none outline-none"
                        title="Close"
                    >
                        <X size={16} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-6">
                    {/* Add New User Toggle Section */}
                    <div>
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-4 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white text-xs font-bold rounded-[5px] transition-all shadow-md active:scale-95 uppercase"
                            >
                                <UserPlus size={14} />
                                Add New Employee User
                            </button>
                        ) : (
                            <form onSubmit={handleAddUser} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">New User Profile</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddForm(false)}
                                        className="text-xs font-black text-red-500 hover:text-red-750 uppercase tracking-wider transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Username */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">Username *</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder=""
                                            className="w-full h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">Password *</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder=""
                                            className="w-full h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder=""
                                            className="w-full h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]"
                                        />
                                    </div>

                                    {/* User Role Modal Picker */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">User Role *</label>
                                        <div className="flex gap-1 h-8 min-w-0">
                                            <div 
                                                onClick={() => setShowRoleModal(true)} 
                                                className="flex-grow min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer flex items-center justify-between overflow-hidden"
                                            >
                                                <span className="truncate">{roleOptions.find(o => o.id === roleId)?.name || 'Select Role'}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setShowRoleModal(true)} 
                                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                            >
                                                <List size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Group Display */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12.5px] font-bold text-gray-700">User Group Membership</label>
                                        <input
                                            type="text"
                                            value={groupName}
                                            disabled
                                            className="w-full h-8 border border-gray-200 px-3 text-[12px] font-bold text-gray-400 bg-gray-50 rounded-[5px] cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-2 self-end px-6 h-8 bg-[#2bb744] hover:bg-[#259b3a] text-white text-xs font-black rounded-[5px] shadow-md transition-all active:scale-95 flex items-center gap-2 border-none uppercase disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Creating User...
                                        </>
                                    ) : (
                                        'Create User Account'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Employee Directory List */}
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Employees & Users</span>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                                <Loader2 className="animate-spin text-[#0285fd]" size={28} />
                                <span className="text-xs font-bold">Loading employee directory...</span>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center justify-center text-center px-4 bg-slate-50/50">
                                <Users className="text-slate-350 mb-2.5" size={32} />
                                <p className="text-xs font-bold text-gray-600">No employees registered yet.</p>
                                <p className="text-[11px] text-gray-400 mt-1 max-w-sm">Use the form above to register staff accounts with custom features and access permissions.</p>
                            </div>
                        ) : (
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-100 text-[10.5px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-4 py-3 border-r border-gray-50">Employee</th>
                                            <th className="px-4 py-3 border-r border-gray-50">Contact Details</th>
                                            <th className="px-4 py-3 border-r border-gray-50">Assigned Role</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {employees.map((emp) => {
                                            const roleName = roleOptions.find(o => o.id === emp.userRole_Id || o.id === emp.UserRole_Id)?.name || 'Custom';
                                            const code = emp.emp_Code || emp.empCode;
                                            return (
                                                <tr key={code} className="hover:bg-blue-50/40 transition-colors group cursor-default">
                                                    <td className="px-4 py-3 border-r border-gray-50">
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-xs font-bold text-slate-800 uppercase">{emp.emp_Name || emp.empName}</span>
                                                            <span className="text-[9px] font-mono text-slate-400 font-bold mt-0.5">{code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-50">
                                                        <div className="flex flex-col gap-0.5 text-[11px] text-slate-655 font-bold text-left">
                                                            {emp.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail size={10} className="text-slate-400" />
                                                                    <span>{emp.email}</span>
                                                                </div>
                                                            )}
                                                            {emp.phone_Number && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone size={10} className="text-slate-400" />
                                                                    <span>{emp.phone_Number}</span>
                                                                </div>
                                                            )}
                                                            {!emp.email && !emp.phone_Number && (
                                                                <span className="text-slate-400 italic">No contact info</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-gray-50">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                            emp.userRole_Id === 1 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            <Shield size={10} />
                                                            {roleName}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {emp.userRole_Id !== 1 && emp.UserRole_Id !== 1 ? (
                                                            <button
                                                                onClick={() => requestDeleteUser(code)}
                                                                className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-750 rounded-lg transition-colors"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-bold italic pr-2">Master Admin</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Role selection lookup modal */}
            {showRoleModal && (
                <SimpleModal 
                    isOpen={showRoleModal} 
                    onClose={() => setShowRoleModal(false)}
                    title="User Role Directory Lookup"
                    maxWidth="max-w-[600px]"
                >
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-lg border border-gray-150 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                    value={roleSearchTerm}
                                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Code / ID</th>
                                            <th className="px-5 py-3">Role Designation</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {roleOptions
                                            .filter(r => (r.name || '').toLowerCase().includes(roleSearchTerm.toLowerCase()))
                                            .map(role => (
                                                <tr 
                                                    key={role.id} 
                                                    className="group hover:bg-blue-50/50 cursor-pointer transition-all" 
                                                    onClick={() => handleSelectRole(role)}
                                                >
                                                    <td className="px-5 py-3 font-mono text-[11px] font-bold text-gray-600">{role.id}</td>
                                                    <td className="px-5 py-3 text-[11px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">
                                                        {role.name}
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button 
                                                            type="button"
                                                            className="bg-[#e49e1b] text-white text-[9px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase"
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        {roleOptions.filter(r => (r.name || '').toLowerCase().includes(roleSearchTerm.toLowerCase())).length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-5 py-8 text-center text-xs text-gray-400 italic">
                                                    No matching roles found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Confirm user deletion modal */}
            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => !deleteLoading && setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    title="Remove Employee User"
                    message="Are you sure you want to remove this user from the company? This action will disable their credentials and login access."
                    loading={deleteLoading}
                    confirmText="Remove User"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default CompanyUsersModal;
