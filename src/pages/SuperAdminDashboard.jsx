import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    LayoutDashboard,
    Building2,
    Users,
    LogOut,
    Database,
    Search,
    Loader2,
    Bell,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    Edit,
    Trash2,
    Activity,
    Menu,
    ShieldAlert
} from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';
import AlertModal from '../components/modals/AlertModal';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmps, setExpandedEmps] = useState({});

    // Flat Lists State
    const [allCompanies, setAllCompanies] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);

    // User Groups & Editing State
    const [userGroups, setUserGroups] = useState([]);
    const [editingEmp, setEditingEmp] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(1);
    const [selectedGroupName, setSelectedGroupName] = useState('Administrators');
    const [savingRole, setSavingRole] = useState(false);

    // Transaction Modal State
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(false);

    // Password Resets State
    const [pendingResets, setPendingResets] = useState([]);
    const [showResets, setShowResets] = useState(false);

    // Role Permissions Editor State
    const [selectedRole, setSelectedRole] = useState(2); // Default to Accountant
    const [systemRoles, setSystemRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [permSearch, setPermSearch] = useState('');

    // Confirm Modal State
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        loading: false
    });

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success'
    });

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const fetchAdminData = async () => {
        try {
            const [hierarchyRes, resetsRes, compRes, empRes, groupsRes] = await Promise.all([
                api.get('/SuperAdmin/hierarchy'),
                api.get('/SuperAdmin/pending-resets'),
                api.get('/SuperAdmin/companies'),
                api.get('/SuperAdmin/employees'),
                api.get('/UserGroup/all').catch(() => ({ data: [] }))
            ]);
            setHierarchy(hierarchyRes.data);
            setPendingResets(resetsRes.data);
            setAllCompanies(compRes.data);
            setAllEmployees(empRes.data);
            setUserGroups(groupsRes.data || []);
        } catch (err) {
            console.error("Super Admin fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!editingEmp) return;
        setSavingRole(true);
        try {
            await api.put(`/SuperAdmin/employee/${editingEmp.emp_Code || editingEmp.empCode}/role`, {
                userRole_Id: parseInt(selectedRoleId),
                member_Id: selectedGroupName
            });

            setAllEmployees(prev => prev.map(e => {
                const targetCode = editingEmp.emp_Code || editingEmp.empCode;
                if (e.emp_Code === targetCode) {
                    return { ...e, userRole_Id: parseInt(selectedRoleId), member_Id: selectedGroupName };
                }
                return e;
            }));

            setHierarchy(prev => prev.map(e => {
                const targetCode = editingEmp.emp_Code || editingEmp.empCode;
                if (e.empCode === targetCode) {
                    return { ...e, role: parseInt(selectedRoleId), memberId: selectedGroupName };
                }
                return e;
            }));

            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: 'Employee role updated successfully.',
                variant: 'success'
            });
            setEditingEmp(null);
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update employee role.',
                variant: 'warning'
            });
        } finally {
            setSavingRole(false);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.userRoleId !== "99" && user.UserRoleId !== "99") {
                navigate('/dashboard');
            } else {
                fetchAdminData();
            }
        } catch (e) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        if (activeMenu === 'Role Features') {
            fetchSystemRoles();
        }
    }, [activeMenu]);

    useEffect(() => {
        if (activeMenu === 'Role Features' && selectedRole) {
            fetchRolePermissions(selectedRole);
        }
    }, [activeMenu, selectedRole]);

    const fetchSystemRoles = async () => {
        try {
            const res = await api.get('/UserRole/system-roles');
            const roles = (res.data || []).map(r => ({
                id: r.id || r.Id,
                name: r.name || r.Name
            }));
            setSystemRoles(roles);
            if (roles.length > 0 && !selectedRole) {
                setSelectedRole(roles[0].id);
            }
        } catch (e) {
            console.error("Error loading system roles", e);
            setSystemRoles([]);
        }
    };

    const fetchRolePermissions = async (roleId) => {
        setLoadingPermissions(true);
        try {
            const res = await api.get(`/UserRole/system-permissions?userRoleId=${roleId}`);
            setPermissions(res.data || []);
        } catch (e) {
            console.error("Error fetching permissions", e);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load system permissions for the selected role.',
                variant: 'warning'
            });
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleTogglePermission = (funcCode) => {
        setPermissions(prev => prev.map(p => {
            const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
            if (code === funcCode) {
                const currentAllow = p.allow_Fuction || p.allowFuction || p.Allow_Fuction;
                const newAllow = currentAllow === 'T' ? 'F' : 'T';
                return {
                    ...p,
                    allow_Fuction: newAllow,
                    allowFuction: newAllow,
                    Allow_Fuction: newAllow
                };
            }
            return p;
        }));
    };

    const handleSavePermissions = async () => {
        setSavingPermissions(true);
        try {
            const payload = {
                userRoleId: selectedRole.toString(),
                permissions: permissions.map(p => ({
                    system_Fuction: p.system_Fuction || p.systemFuction || p.System_Fuction,
                    allow_Fuction: p.allow_Fuction || p.allowFuction || p.Allow_Fuction
                }))
            };
            await api.post('/UserRole/system-permissions', payload);
            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: 'System role permissions updated successfully and propagated to all companies.',
                variant: 'success'
            });
        } catch (e) {
            console.error("Error saving permissions", e);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to update system role permissions.',
                variant: 'warning'
            });
        } finally {
            setSavingPermissions(false);
        }
    };

    const toggleEmp = (empCode) => {
        setExpandedEmps(prev => ({ ...prev, [empCode]: !prev[empCode] }));
    };

    const handleDeleteEmployee = (e, empCode) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Employee',
            message: `Are you sure you want to completely delete employee ${empCode}? This action cannot be undone.`,
            loading: false,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, loading: true }));
                try {
                    await api.delete(`/SuperAdmin/employee/${empCode}`);
                    setHierarchy(prev => prev.filter(emp => emp.empCode !== empCode));
                    closeConfirm();
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete employee.',
                        variant: 'warning'
                    });
                    console.error(error);
                    setConfirmConfig(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const handleDeleteCompany = (e, companyCode, empCode) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Company',
            message: `Are you sure you want to completely delete company ${companyCode}? All associated data will be removed.`,
            loading: false,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, loading: true }));
                try {
                    await api.delete(`/SuperAdmin/company/${companyCode}`);
                    setHierarchy(prev => prev.map(emp => {
                        if (emp.empCode === empCode) {
                            return { ...emp, companies: emp.companies.filter(c => c.companyCode !== companyCode) };
                        }
                        return emp;
                    }));
                    closeConfirm();
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete company.',
                        variant: 'warning'
                    });
                    console.error(error);
                    setConfirmConfig(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const openTransactionsModal = async (company) => {
        setSelectedCompany(company);
        setLoadingTx(true);
        try {
            const res = await api.get(`/SuperAdmin/company/${company.companyCode}/transactions`);
            setTransactions(res.data);
        } catch (e) {
            console.error("Error fetching txs", e);
        } finally {
            setLoadingTx(false);
        }
    };

    const handleDeleteTransaction = (docNo) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Transaction',
            message: `Are you sure you want to delete transaction ${docNo}? This will permanently erase the record.`,
            loading: false,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, loading: true }));
                try {
                    await api.delete(`/SuperAdmin/company/${selectedCompany.companyCode}/transaction/${docNo}`);
                    setTransactions(prev => prev.filter(t => t.docNo !== docNo));

                    setHierarchy(prev => prev.map(emp => {
                        const newComps = emp.companies.map(c => {
                            if (c.companyCode === selectedCompany.companyCode) {
                                return { ...c, transactions: c.transactions - 1 };
                            }
                            return c;
                        });
                        return { ...emp, companies: newComps };
                    }));
                    closeConfirm();
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete transaction.',
                        variant: 'warning'
                    });
                    console.error(error);
                    setConfirmConfig(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#00acee] animate-spin" />
            </div>
        );
    }

    const filteredHierarchy = hierarchy.filter(e =>
        e.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.empCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let totalCompanies = 0;
    hierarchy.forEach(e => { totalCompanies += e.companies.length; });

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Companies', icon: Building2 },
        { name: 'Employees', icon: Users },
        { name: 'Role Features', icon: ShieldAlert },
        { name: 'Analytics', icon: Activity },
        { name: 'Database', icon: Database },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex">
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img src="/logo-removebg.png" alt="Onimta Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-slate-900 font-bold tracking-widest uppercase leading-none mt-1">ONIMTA</h1>
                            <p className="text-[9px] text-[#00acee] tracking-[0.2em] uppercase font-bold mt-1">Super Admin</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveMenu(item.name)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeMenu === item.name
                                    ? 'bg-[#00acee]/10 text-[#00acee] font-bold'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeMenu === item.name ? 'text-[#00acee]' : 'text-slate-500'}`} />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Menu className="w-6 h-6 text-slate-900 md:hidden cursor-pointer" />
                        <h2 className="text-slate-900 text-xl font-bold hidden sm:block">Super Admin Portal</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search employees or companies..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-full text-sm text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee]/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="relative">
                                <button 
                                    className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors"
                                    onClick={() => setShowResets(!showResets)}
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingResets.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                                
                                {showResets && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900">Password Recovery Alerts</h3>
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{pendingResets.length}</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-auto">
                                            {pendingResets.length === 0 ? (
                                                <div className="p-6 text-center text-slate-500 text-sm">
                                                    No pending password resets.
                                                </div>
                                            ) : (
                                                pendingResets.map(req => (
                                                    <div key={req.empCode} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{req.empName}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{req.empCode}</p>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-red-500 uppercase">Action Req</p>
                                                        </div>
                                                        <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-between">
                                                            <code className="text-xs text-slate-600 font-mono truncate mr-2">{req.token}</code>
                                                            <button 
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(req.token);
                                                                    setAlertConfig({
                                                                        isOpen: true,
                                                                        title: 'Token Copied!',
                                                                        message: 'Give this token to the employee so they can securely reset their password.',
                                                                        variant: 'success'
                                                                    });
                                                                }}
                                                                className="text-[#00acee] hover:text-[#0082b3] text-xs font-bold uppercase tracking-wider"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500 font-medium">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00acee] to-[#0082b3] flex items-center justify-center text-white font-bold shadow-md">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-auto p-8">

                    {/* DASHBOARD VIEW */}
                    {activeMenu === 'Dashboard' && (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Total Employees</p>
                                        <h3 className="text-4xl font-bold text-slate-900">{hierarchy.length}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-[#00acee]/10 flex items-center justify-center">
                                        <Users className="w-7 h-7 text-[#00acee]" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Total Companies</p>
                                        <h3 className="text-4xl font-bold text-slate-900">{totalCompanies}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-1">Total Entities</p>
                                        <h3 className="text-4xl font-bold text-slate-900">{hierarchy.length + totalCompanies}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Database className="w-7 h-7 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                    {/* Main Table Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">System Overview</h2>
                            <button className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee</th>
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Role</th>
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Last Login</th>
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Login Count</th>
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Companies</th>
                                        <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHierarchy.map((emp) => (
                                        <React.Fragment key={emp.empCode}>
                                            <tr className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => toggleEmp(emp.empCode)}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00acee] to-[#0082b3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {emp.empName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{emp.empName}</p>
                                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{emp.empCode} • {emp.email || 'No Email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${emp.role === 99 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        {emp.role === 99 ? 'Super Admin' : `Role ${emp.role}`}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-700 font-medium">
                                                    {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-700 font-medium">
                                                    {emp.loginCount || 0}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                                            {emp.companies.length}
                                                        </span>
                                                        {expandedEmps[emp.empCode] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEmp(emp);
                                                                setSelectedRoleId(emp.role);
                                                                setSelectedGroupName(emp.memberId || 'Administrators');
                                                            }}
                                                            title="Edit User Role"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={(e) => handleDeleteEmployee(e, emp.empCode)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Nested Companies */}
                                            {expandedEmps[emp.empCode] && (
                                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                                    <td colSpan={6} className="py-6 px-8">
                                                        {emp.companies.length === 0 ? (
                                                            <p className="text-sm text-slate-500 italic text-center py-4 bg-white border border-slate-200 rounded-xl">No companies assigned.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                {emp.companies.map(comp => (
                                                                    <div key={comp.companyCode} onClick={() => openTransactionsModal(comp)} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-[#00acee] hover:shadow-md transition-all cursor-pointer group">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-[#00acee]/10 transition-colors">
                                                                                <Building2 className="w-6 h-6 text-emerald-500 group-hover:text-[#00acee] transition-colors" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-bold text-slate-900">{comp.companyName || 'Unknown Company'}</p>
                                                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{comp.companyCode}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-6">
                                                                            <div className="text-right">
                                                                                <p className="text-[10px] tracking-widest uppercase text-slate-400 font-bold mb-1">Transactions</p>
                                                                                <p className="text-lg font-bold text-slate-900 leading-none">{comp.transactions}</p>
                                                                            </div>
                                                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={(e) => handleDeleteCompany(e, comp.companyCode, emp.empCode)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        </div>
                    </>
                    )}

                    {/* COMPANIES VIEW */}
                    {activeMenu === 'Companies' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">All Registered Companies</h2>
                                <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">{allCompanies.length} Companies</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Company Code</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Company Name</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Phone</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCompanies.filter(c => 
                                            c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            c.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(comp => (
                                            <tr key={comp.code} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6 font-mono text-sm text-slate-900 font-bold">{comp.code}</td>
                                                <td className="py-4 px-6 text-sm text-slate-900 font-bold">{comp.comp_Name || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500">{comp.email || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500">{comp.phone || 'N/A'}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={(e) => handleDeleteCompany(e, comp.code, null)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* EMPLOYEES VIEW */}
                    {activeMenu === 'Employees' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">All Employees</h2>
                                <span className="bg-[#00acee]/10 text-[#00acee] text-xs font-bold px-3 py-1 rounded-full">{allEmployees.length} Employees</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Emp Code</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee Name</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Role</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEmployees.filter(e => 
                                            e.emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            e.emp_Code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(emp => (
                                            <tr key={emp.emp_Code} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6 font-mono text-sm text-slate-900 font-bold">{emp.emp_Code}</td>
                                                <td className="py-4 px-6 text-sm text-slate-900 font-bold">{emp.emp_Name || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500">{emp.email || 'N/A'}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${emp.userRole_Id === 99 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                        {emp.userRole_Id === 99 ? 'Super Admin' : `Role ${emp.userRole_Id}`}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                            onClick={() => {
                                                                setEditingEmp(emp);
                                                                setSelectedRoleId(emp.userRole_Id);
                                                                setSelectedGroupName(emp.member_Id || 'Administrators');
                                                            }}
                                                            title="Edit User Role"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={(e) => handleDeleteEmployee(e, emp.emp_Code)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}                    {/* DATABASE VIEW */}
                    {activeMenu === 'Database' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="w-20 h-20 bg-[#00acee]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Database className="w-10 h-10 text-[#00acee]" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Database Management</h2>
                            <p className="text-slate-550 max-w-md mx-auto">Raw database access and query execution tools are restricted. Please use the administrative panels to manage data.</p>
                        </div>
                    )}

                    {/* ROLE FEATURES VIEW */}
                    {activeMenu === 'Role Features' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 max-h-[82vh] overflow-y-auto no-scrollbar">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <ShieldAlert className="text-[#00acee]" size={20} />
                                        System Role Permission Master Editor
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">Configure default enabled/disabled features for each user role. Changes propagate globally to all tenant companies.</p>
                                </div>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={savingPermissions || loadingPermissions}
                                    className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 self-start"
                                >
                                    {savingPermissions ? (
                                        <>
                                            <Loader2 className="animate-spin" size={13} />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        'Save Role Permissions'
                                    )}
                                </button>
                            </div>

                            {/* Role Select pills and search bar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-black text-slate-550 uppercase tracking-widest mr-2">Select Role:</span>
                                    {systemRoles.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRole(role.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                selectedRole === role.id 
                                                    ? 'bg-[#00acee] text-white shadow-sm'
                                                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {role.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search functions..."
                                        value={permSearch}
                                        onChange={e => setPermSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-slate-250 bg-white rounded-xl text-xs w-full outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Loading State */}
                            {loadingPermissions ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                                    <Loader2 className="animate-spin text-[#00acee]" size={32} />
                                    <span className="text-xs font-bold">Fetching role permission matrix...</span>
                                </div>
                            ) : (
                                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                                <th className="px-4 py-3 w-1/3">Function Code</th>
                                                <th className="px-4 py-3 w-1/2">Description</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {permissions
                                                .filter(p => {
                                                    const code = (p.system_Fuction || p.systemFuction || p.System_Fuction || '').toLowerCase();
                                                    const desc = (p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || '').toLowerCase();
                                                    const term = permSearch.toLowerCase();
                                                    return code.includes(term) || desc.includes(term);
                                                })
                                                .map(p => {
                                                    const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
                                                    const desc = p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || code;
                                                    const isAllowed = (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === 'T';
                                                    return (
                                                        <tr key={code} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                                    {code}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-xs text-slate-600 font-medium">{desc}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() => handleTogglePermission(code)}
                                                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${
                                                                        isAllowed 
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                            : 'bg-red-50 text-red-750 border border-red-200'
                                                                    }`}
                                                                >
                                                                    {isAllowed ? 'Allowed' : 'Denied'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS VIEW */}
                    {activeMenu === 'Analytics' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Activity className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">System Analytics</h2>
                            <p className="text-slate-500 max-w-md mx-auto">Advanced usage statistics, traffic charts, and audit logs will appear here in the next update.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Transactions Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#00acee]/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-[#00acee]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Company Overview</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">{selectedCompany.companyName} ({selectedCompany.companyCode})</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCompany(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50">
                        {/* Company Details Section */}
                        <div className="bg-white p-6 border-b border-slate-200">
                            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Email</p>
                                    <p className="text-sm text-slate-900 font-medium">{selectedCompany.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p>
                                    <p className="text-sm text-slate-900 font-medium">{selectedCompany.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Address</p>
                                    <p className="text-sm text-slate-900 font-medium">{selectedCompany.address1 || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Country</p>
                                    <p className="text-sm text-slate-900 font-medium">{selectedCompany.country || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-4">Transaction History</h3>
                            {loadingTx ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="w-8 h-8 text-[#00acee] animate-spin" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Database className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-900 font-bold text-lg mb-1">No Transactions Found</p>
                                    <p className="text-sm text-slate-500">This company has no recorded transactions in the system.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Doc No</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Type</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Account</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Date</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Amount</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(tx => (
                                                <tr key={tx.docNo} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 font-mono text-sm text-slate-900 font-bold">{tx.docNo}</td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{tx.payType || 'N/A'}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">{tx.account || 'System'}</td>
                                                    <td className="py-4 px-6 text-sm text-slate-500">{tx.postDate || 'N/A'}</td>
                                                    <td className="py-4 px-6 text-sm font-bold text-[#00acee] text-right">{tx.amount ? `Rs ${tx.amount.toFixed(2)}` : 'Rs 0.00'}</td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => setAlertConfig({
                                                                isOpen: true,
                                                                title: 'Coming Soon',
                                                                message: 'Edit transaction feature requires form modal. Coming soon!',
                                                                variant: 'info'
                                                            })} className="p-2 text-slate-400 hover:text-[#00acee] hover:bg-[#00acee]/10 rounded-lg transition-all">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteTransaction(tx.docNo)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Edit Role Modal */}
            {editingEmp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Manage Employee Role</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Editing {editingEmp.empName || editingEmp.emp_Name} ({editingEmp.empCode || editingEmp.emp_Code})</p>
                            </div>
                            <button onClick={() => setEditingEmp(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            {/* Role level select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role Level (ID)</label>
                                <select 
                                    value={selectedRoleId} 
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee] transition-all"
                                >
                                    <option value="1">Admin / Tenant Owner (1)</option>
                                    <option value="99">Super Admin (99)</option>
                                    <option value="2">Custom Role (2)</option>
                                    <option value="3">Custom Role (3)</option>
                                    <option value="4">Custom Role (4)</option>
                                    <option value="5">Custom Role (5)</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">Note: ID 99 grants full access to the Super Admin portal. ID 1 grants access to tenant configuration.</p>
                            </div>

                            {/* Member group select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Member Group Name</label>
                                <select 
                                    value={selectedGroupName} 
                                    onChange={(e) => setSelectedGroupName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee] transition-all"
                                >
                                    <option value="Administrators">Administrators</option>
                                    {userGroups.filter(g => g.group_Name !== 'Administrators').map(g => (
                                        <option key={g.group_Id} value={g.group_Name}>{g.group_Name}</option>
                                    ))}
                                    <option value="Finance Team">Finance Team</option>
                                    <option value="Sales Team">Sales Team</option>
                                    <option value="HR Manager">HR Manager</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">Maps user to access control matrices defined in Master settings.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                            <button 
                                onClick={() => setEditingEmp(null)} 
                                className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-200/60 rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateRole}
                                disabled={savingRole}
                                className="px-6 py-2 bg-[#00acee] hover:bg-[#0082b3] text-white font-bold rounded-xl transition-all shadow-md shadow-sky-100 flex items-center gap-2 text-sm disabled:opacity-70"
                            >
                                {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                loading={confirmConfig.loading}
                variant="danger"
                confirmText="Yes, Delete"
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </div>
    );
};

export default SuperAdminDashboard;
