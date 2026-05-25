import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showSuccessToast } from '../utils/toastUtils';
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
    Server,
    Menu,
    ShieldAlert,
    Settings,
    CheckCircle,
    X,
    FileText,
    ShieldCheck,
    Puzzle,
    AppWindow,
    CalendarClock,
    Sun,
    Moon
} from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';
import AlertModal from '../components/modals/AlertModal';
import AdminVerificationModal from '../components/modals/AdminVerificationModal';
import SystemSettingsBoard from '../HomeMaster/SystemSettingsBoard';
import SystemAnalyticsBoard from '../HomeMaster/SystemAnalyticsBoard';
import SecurityAuditBoard from '../HomeMaster/SecurityAuditBoard';
import IntegrationsBoard from '../HomeMaster/IntegrationsBoard';

import SystemAnalysisBoard from '../HomeMaster/SystemAnalysisBoard';
import SystemLogReportModal from '../components/modals/AdminReports/SystemLogReportModal';
import SubscriptionAdminBoard from '../components/Admin/SubscriptionAdminBoard';
import CompanyOverviewBoard from '../HomeMaster/CompanyOverviewBoard';
import AdminCompanyReportsBoard from '../HomeMaster/AdminCompanyReportsBoard';

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
    const [allModules, setAllModules] = useState([]);

    // User Groups & Editing State
    const [userGroups, setUserGroups] = useState([]);
    const [editingEmp, setEditingEmp] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(1);
    const [selectedGroupName, setSelectedGroupName] = useState('Administrators');
    const [savingRole, setSavingRole] = useState(false);
    const [showRolePasswordModal, setShowRolePasswordModal] = useState(false);
    const [rolePasswordInput, setRolePasswordInput] = useState('');

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
    const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [showTogglePasswordModal, setShowTogglePasswordModal] = useState(false);
    const [togglePasswordInput, setTogglePasswordInput] = useState('');
    const [pendingToggleFunc, setPendingToggleFunc] = useState(null);
    const [permSearch, setPermSearch] = useState('');
    const [selectedPermEmployee, setSelectedPermEmployee] = useState('');
    const [selectedPermCompany, setSelectedPermCompany] = useState('');
    const [showPermTargetModal, setShowPermTargetModal] = useState(false);
    const [permEmpSearchText, setPermEmpSearchText] = useState('');
    const [permCompSearchText, setPermCompSearchText] = useState('');
    const [permEmpSearchTriggered, setPermEmpSearchTriggered] = useState(false);
    const [permCompSearchTriggered, setPermCompSearchTriggered] = useState(false);

    // Employee Detail View State
    const [selectedEmployeeView, setSelectedEmployeeView] = useState(null);

    // Company Detail View State
    const [selectedCompanyView, setSelectedCompanyView] = useState(null);

    // Filter companies based on selected employee for Permissions Editor
    const fetchBackups = async () => {
        try {
            const res = await api.get('/Backup/history');
            if (res.data) setBackups(res.data);
        } catch (error) {
            console.error("Failed to fetch backups", error);
        }
    };

    useEffect(() => {
        if (activeMenu === 'Database') {
            fetchBackups();
        }
    }, [activeMenu]);

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            // Get default path
            let defaultPath = "C:\\Backup";
            try {
                const pathRes = await api.get('/Backup/default-path');
                if (pathRes.data?.path) defaultPath = pathRes.data.path;
            } catch (e) { }

            const res = await api.post('/Backup/create', {
                DatabaseName: 'Acc_Web',
                BackupPath: defaultPath,
                UserName: 'SuperAdmin'
            });

            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: res.data?.message || 'Backup created successfully',
                variant: 'success'
            });
            fetchBackups(); // Refresh list
        } catch (error) {
            console.error("Backup failed", error);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create backup',
                variant: 'warning'
            });
        } finally {
            setCreatingBackup(false);
        }
    };

    const getAvailablePermCompanies = () => {
        if (!selectedPermEmployee) return allCompanies;
        const empNode = hierarchy.find(h => h.empCode === selectedPermEmployee || h.emp_Code === selectedPermEmployee);
        if (empNode && empNode.companies) {
            return empNode.companies.map(c => ({
                code: c.companyCode || c.company_Code,
                comp_Name: c.companyName || c.company_Name
            }));
        }
        return [];
    };

    const availablePermCompanies = getAvailablePermCompanies();

    useEffect(() => {
        if (selectedPermCompany && !availablePermCompanies.find(c => c.code === selectedPermCompany)) {
            setSelectedPermCompany('');
        }
    }, [selectedPermEmployee, availablePermCompanies, selectedPermCompany]);

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

    const [showAdminConfig, setShowAdminConfig] = useState(false);
    const [backups, setBackups] = useState([]);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [showSystemLogReport, setShowSystemLogReport] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('saDarkMode', darkMode);
    }, [darkMode]);

    // Delete flow state (confirm → password → execute)
    const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
    const [deletePasswordInput, setDeletePasswordInput] = useState('');
    const [pendingDeleteAction, setPendingDeleteAction] = useState(null);

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const fetchAdminData = async () => {
        try {
            const [hierarchyRes, resetsRes, compRes, empRes, modRes, groupsRes] = await Promise.all([
                api.get('/SuperAdmin/hierarchy'),
                api.get('/SuperAdmin/pending-resets'),
                api.get('/SuperAdmin/companies'),
                api.get('/SuperAdmin/employees'),
                api.get('/SuperAdmin/modules'),
                api.get('/UserGroup/all').catch(() => ({ data: [] }))
            ]);
            setHierarchy(hierarchyRes.data);
            setPendingResets(resetsRes.data);
            setAllCompanies(compRes.data);
            setAllEmployees(empRes.data);
            setAllModules(modRes.data?.data || []);
            setUserGroups(groupsRes.data || []);
        } catch (err) {
            console.error("Super Admin fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateUpdateRole = () => {
        setRolePasswordInput('');
        setShowRolePasswordModal(true);
    };

    const handleUpdateRole = async () => {
        if (!editingEmp) return;

        if (!rolePasswordInput) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Super Admin password is required to update employee role.',
                variant: 'warning'
            });
            return;
        }

        setShowRolePasswordModal(false);
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
                fetchSystemRoles();
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
        if (activeMenu === 'Role Features' && selectedRole && !showPermTargetModal) {
            fetchRolePermissions(selectedRole);
        }
    }, [activeMenu, selectedRole, showPermTargetModal]);

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
            const params = { userRoleId: roleId };
            if (selectedPermEmployee) params.empCode = selectedPermEmployee;
            if (selectedPermCompany) params.companyCode = selectedPermCompany;

            const res = await api.get('/UserRole/system-permissions', { params });
            const data = res.data || [];

            // Remove duplicates from UI
            const uniquePerms = Array.from(new Map(data.map(item => [item.system_Fuction || item.systemFuction || item.System_Fuction, item])).values());

            setPermissions(uniquePerms);
        } catch (e) {
            console.error("Error fetching permissions", e);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load system permissions for the selected role and target.',
                variant: 'warning'
            });
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleInitiateToggle = (funcCode) => {
        setPendingToggleFunc(funcCode);
        setTogglePasswordInput('');
        setShowTogglePasswordModal(true);
    };

    const confirmAndTogglePermission = () => {
        if (!togglePasswordInput) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Super Admin password is required to toggle permission.',
                variant: 'warning'
            });
            return;
        }

        setPermissions(prev => prev.map(p => {
            const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
            if (code === pendingToggleFunc) {
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

        setShowTogglePasswordModal(false);
        setPendingToggleFunc(null);
    };

    const handleAllowAllPermissions = () => {
        setPermissions(prev => prev.map(p => ({
            ...p,
            allow_Fuction: 'T',
            allowFuction: 'T',
            Allow_Fuction: 'T'
        })));
    };

    const handleInitiateSavePermissions = () => {
        setConfirmPasswordInput('');
        setShowPasswordConfirmModal(true);
    };

    const confirmAndSavePermissions = async () => {
        if (!confirmPasswordInput) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Super Admin password is required to save permissions.',
                variant: 'warning'
            });
            return;
        }

        setShowPasswordConfirmModal(false);
        setSavingPermissions(true);
        try {
            const payload = {
                userRoleId: selectedRole.toString(),
                empCode: selectedPermEmployee || null,
                companyCode: selectedPermCompany || null,
                permissions: permissions.map(p => ({
                    system_Fuction: p.system_Fuction || p.systemFuction || p.System_Fuction,
                    allow_Fuction: p.allow_Fuction || p.allowFuction || p.Allow_Fuction
                }))
            };
            await api.post('/UserRole/system-permissions', payload);
            setAlertConfig({
                isOpen: true,
                title: 'Success',
                message: 'System role permissions updated successfully for the selected target.',
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
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'employee', empCode });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
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
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'company', companyCode, empCode });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
            }
        });
    };

    const confirmDeleteAction = async (password) => {
        if (!pendingDeleteAction) return;
        const action = pendingDeleteAction;
        setPendingDeleteAction(null);
        setShowDeletePasswordModal(false);

        try {
            if (action.type === 'employee') {
                await api.delete(`/SuperAdmin/employee/${action.empCode}`);
                setHierarchy(prev => prev.filter(emp => emp.empCode !== action.empCode));
                showSuccessToast('Employee deleted successfully.');
            } else if (action.type === 'company') {
                await api.delete(`/SuperAdmin/company/${action.companyCode}`);
                setHierarchy(prev => prev.map(emp => {
                    if (emp.empCode === action.empCode) {
                        return { ...emp, companies: emp.companies.filter(c => c.companyCode !== action.companyCode) };
                    }
                    return emp;
                }));
                showSuccessToast('Company deleted successfully.');
            } else if (action.type === 'transaction') {
                await api.delete(`/SuperAdmin/company/${action.companyCode}/transaction/${action.docNo}`);
                setTransactions(prev => prev.filter(t => t.docNo !== action.docNo));
                setHierarchy(prev => prev.map(emp => {
                    const newComps = emp.companies.map(c => {
                        if (c.companyCode === action.companyCode) {
                            return { ...c, transactions: c.transactions - 1 };
                        }
                        return c;
                    });
                    return { ...emp, companies: newComps };
                }));
                showSuccessToast('Transaction deleted successfully.');
            }
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: `Failed to delete ${action.type}.`,
                variant: 'warning'
            });
            console.error(error);
        }
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
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'transaction', docNo, companyCode: selectedCompany.companyCode });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
        { name: 'Admin Config', icon: Settings },
        { name: 'Reports', icon: FileText },

        { name: 'Subscriptions', icon: CalendarClock },
        { name: 'Analytics', icon: Activity },
        { name: 'System Analysis', icon: Server },
        { name: 'Database', icon: Database },
        { name: 'Security Audit', icon: ShieldCheck },
        { name: 'Integrations', icon: Puzzle },
        { name: 'App List', icon: AppWindow }

    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">

            {/* Sidebar */}
            <aside className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                <div className={`h-20 flex items-center border-b border-slate-100 dark:border-slate-700 ${sidebarCollapsed ? 'justify-center px-0' : 'px-8'}`}>
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <img src="/logo-removebg.png" alt="Onimta Logo" className="w-10 h-10 object-contain shrink-0" />
                        <div className={sidebarCollapsed ? 'hidden' : ''}>
                            <h1 className="text-slate-900 dark:text-white font-bold tracking-widest uppercase leading-none">ONIMTA</h1>
                            <p className="text-[9px] text-[#00acee] tracking-[0.2em] uppercase font-bold leading-tight">Super Admin</p>
                        </div>
                    </div>
                </div>

                <nav className={`flex-1 py-6 space-y-2 overflow-y-auto no-scrollbar ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveMenu(item.name)}
                            className={`w-full flex items-center rounded-xl transition-all ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-4 px-4 py-3'} ${activeMenu === item.name
                                ? 'bg-[#00acee]/10 text-[#00acee] font-bold'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium'
                            }`}
                            title={sidebarCollapsed ? item.name : undefined}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${activeMenu === item.name ? 'text-[#00acee]' : 'text-slate-500 dark:text-slate-400'}`} />
                            <span className={sidebarCollapsed ? 'hidden' : ''}>{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className={`p-4 mb-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all ${sidebarCollapsed ? 'justify-center p-3 w-auto' : 'w-full gap-4 px-4 py-3'}`}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={sidebarCollapsed ? 'hidden' : ''}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl animate-in slide-in-from-left duration-200">
                        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <img src="/logo-removebg.png" alt="Onimta Logo" className="w-10 h-10 object-contain" />
                                <div>
                                    <h1 className="text-slate-900 dark:text-white font-bold tracking-widest uppercase leading-none">ONIMTA</h1>
                                    <p className="text-[9px] text-[#00acee] tracking-[0.2em] uppercase font-bold leading-tight">Super Admin</p>
                                </div>
                            </div>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => { setActiveMenu(item.name); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeMenu === item.name
                                        ? 'bg-[#00acee]/10 text-[#00acee] font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 ${activeMenu === item.name ? 'text-[#00acee]' : 'text-slate-500 dark:text-slate-400'}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 mb-4">
                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Topbar */}
                <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Menu className="w-6 h-6 text-slate-900 dark:text-white cursor-pointer" onClick={() => { if (window.innerWidth < 768) { setSidebarOpen(true); } else { setSidebarCollapsed(prev => !prev); } }} />
                        <h2 className="text-slate-900 dark:text-white text-[16px] font-bold hidden sm:block uppercase">
                            {(() => {
                                const h = new Date().getHours();
                                if (h < 12) return 'Good Morning, ADMIN';
                                if (h < 18) return 'Good Afternoon, ADMIN';
                                return 'Good Evening, ADMIN';
                            })()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block w-96">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search employees or companies..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee]/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDarkMode(prev => !prev)}
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <MessageSquare className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="relative">
                                <button
                                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    onClick={() => setShowResets(!showResets)}
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingResets.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {showResets && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white">Password Recovery Alerts</h3>
                                            <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">{pendingResets.length}</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-auto">
                                            {pendingResets.length === 0 ? (
                                                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                    No pending password resets.
                                                </div>
                                            ) : (
                                                pendingResets.map(req => (
                                                    <div key={req.empCode} className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{req.empName}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{req.empCode}</p>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-red-500 uppercase">Action Req</p>
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex items-center justify-between">
                                                            <code className="text-xs text-slate-600 dark:text-slate-300 font-mono truncate mr-2">{req.token}</code>
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
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00acee] to-[#0082b3] flex items-center justify-center text-white font-bold shadow-md">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 pb-10 md:pb-10">

                    {/* DASHBOARD VIEW */}
                    {activeMenu === 'Dashboard' && (
                        <>
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Employees</p>
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{hierarchy.length}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-[#00acee]/10 flex items-center justify-center">
                                        <Users className="w-7 h-7 text-[#00acee]" />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Companies</p>
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{totalCompanies}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Building2 className="w-7 h-7 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Total Entities</p>
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{hierarchy.length + totalCompanies}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Database className="w-7 h-7 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Main Table Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Overview</h2>
                                    <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Employee</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Role</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Last Login</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Login Count</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Companies</th>
                                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHierarchy.map((emp) => (
                                                <React.Fragment key={emp.empCode}>
                                                    <tr className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group" onClick={() => toggleEmp(emp.empCode)}>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00acee] to-[#0082b3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                                    {emp.empName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.empName}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{emp.empCode} • {emp.email || 'No Email'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${emp.role === 99 ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                                {emp.role === 99 ? 'Super Admin' : `Role ${emp.role}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString() : 'Never'}
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            {emp.loginCount || 0}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                                                                    {emp.companies.length}
                                                                </span>
                                                                {expandedEmps[emp.empCode] ? <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
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
                                                                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" onClick={(e) => handleDeleteEmployee(e, emp.empCode)}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Nested Companies */}
                                                    {expandedEmps[emp.empCode] && (
                                                        <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                                                            <td colSpan={6} className="p-0 border-b border-slate-100 dark:border-slate-700">
                                                                <div className="pl-16 pr-8 py-4 bg-gradient-to-r from-transparent via-slate-50/50 dark:via-slate-800/30 to-transparent">
                                                                    <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-6 space-y-3 relative before:absolute before:top-0 before:-left-[2px] before:w-[2px] before:h-4 before:bg-gradient-to-b before:from-slate-200 dark:before:from-slate-700 before:to-transparent">
                                                                        {emp.companies.length === 0 ? (
                                                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No companies assigned.</p>
                                                                        ) : (
                                                                            emp.companies.map((comp, idx) => (
                                                                                <div key={comp.companyCode} onClick={() => openTransactionsModal(comp)} className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer">
                                                                                    {/* Tree branch line */}
                                                                                    <div className="absolute top-1/2 -left-6 w-4 h-[2px] bg-slate-200 dark:bg-slate-700 -translate-y-1/2"></div>
                                                                                    
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="w-10 h-10 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors border border-emerald-100/50 dark:border-emerald-500/10">
                                                                                            <Building2 className="w-5 h-5 text-emerald-500" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#00acee] transition-colors">{comp.companyName || 'Unknown Company'}</p>
                                                                                            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{comp.companyCode}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-6">
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Transactions</span>
                                                                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{comp.transactions}</span>
                                                                                        </div>
                                                                                        <button 
                                                                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" 
                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.companyCode, emp.empCode); }}
                                                                                            title="Remove Company Access"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Registered Companies</h2>
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">{allCompanies.length} Companies</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Company Code</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Company Name</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Phone</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCompanies.filter(c =>
                                            c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            c.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(comp => (
                                            <tr key={comp.code} onClick={() => setSelectedCompany(comp)} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                                <td className="py-4 px-6 font-mono text-sm text-slate-900 dark:text-white font-bold">{comp.code}</td>
                                                <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-bold">{comp.comp_Name || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{comp.email || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{comp.phone || 'N/A'}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.code, null); }}>
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Employees</h2>
                                <span className="bg-[#00acee]/10 text-[#00acee] text-xs font-bold px-3 py-1 rounded-full">{allEmployees.length} Employees</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Emp Code</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Employee Name</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">Role</th>
                                            <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEmployees.filter(e =>
                                            e.emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            e.emp_Code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(emp => (
                                            <tr key={emp.emp_Code} onClick={() => setSelectedEmployeeView(emp)} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                                <td className="py-4 px-6 font-mono text-sm text-slate-900 dark:text-white font-bold">{emp.emp_Code}</td>
                                                <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-bold">{emp.emp_Name || 'N/A'}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{emp.email || 'N/A'}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${emp.userRole_Id === 99 ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                        {emp.userRole_Id === 99 ? 'Super Admin' : `Role ${emp.userRole_Id}`}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEmp(emp);
                                                                setSelectedRoleId(emp.userRole_Id);
                                                                setSelectedGroupName(emp.member_Id || 'Administrators');
                                                            }}
                                                            title="Edit User Role"
                                                        >
                                                        </button>
                                                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(e, emp.emp_Code); }}>
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
                        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full pb-10">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Database className="text-[#00acee]" size={20} />
                                        Database Management
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage system backups, optimize performance, and monitor database health.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCreateBackup}
                                        disabled={creatingBackup}
                                        className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {creatingBackup ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                        {creatingBackup ? 'Creating...' : 'Create Full Backup'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Database size={18} />
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">Healthy</span>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Database Size</h3>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">N/A</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                                            <Users size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Records</h3>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {allCompanies.length + allEmployees.length + hierarchy.reduce((acc, emp) => acc + (emp.companies ? emp.companies.reduce((sum, comp) => sum + (comp.transactions || comp.Transactions || 0), 0) : 0), 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Active Connections</h3>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{allEmployees.length || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Last Backup</h3>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {backups.length > 0 && backups[0].createdAt
                                                ? new Date(backups[backups.length - 1].createdAt || backups[0].createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
                                                : 'No Backups'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Maintenance Operations</h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rebuild Indexes</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Improves database query performance by defragmenting indexes.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0">Run Now</button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Clear Query Cache</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Frees up memory by clearing the SQL server query plan cache.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-orange-500 hover:text-orange-500 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0">Clear</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Recent Backups</h3>
                                    <div className="flex flex-col gap-0 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                                        {(backups.length > 0 ? backups.slice().reverse().slice(0, 5) : []).map((b, i) => {
                                            const isFailed = b.status?.toLowerCase() === 'failed';
                                            return (
                                                <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isFailed ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'}`}>
                                                            {isFailed ? <X size={14} /> : <CheckCircle size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200" title={b.backupPath}>
                                                                {b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : 'N/A'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{b.createdBy || 'Manual'} • {b.status}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-[#00acee] hover:text-[#009adb] text-xs font-bold px-3 py-1 bg-[#00acee]/10 rounded-lg shrink-0">Restore</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROLE FEATURES VIEW */}
                    {activeMenu === 'Role Features' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldAlert className="text-[#00acee]" size={20} />
                                        System Role Permission Master Editor
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Configure default enabled/disabled features for each user role. Changes propagate globally to all tenant companies.</p>
                                </div>
                                <div className="flex items-center gap-3 self-start">
                                    <button
                                        onClick={handleAllowAllPermissions}
                                        disabled={loadingPermissions}
                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <CheckCircle size={14} />
                                        Allow All
                                    </button>
                                    <button
                                        onClick={handleInitiateSavePermissions}
                                        disabled={savingPermissions || loadingPermissions}
                                        className="px-5 py-2.5 bg-[#00acee] hover:bg-[#009adb] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
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
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-4">
                                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="flex flex-col w-full sm:w-auto">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Configuration Target</span>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {selectedPermEmployee ? allEmployees.find(e => e.emp_Code === selectedPermEmployee)?.empName || allEmployees.find(e => e.emp_Code === selectedPermEmployee)?.emp_Name || selectedPermEmployee : 'Global Employees'}
                                            </span>
                                            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
                                            <span className="text-sm font-bold text-[#00acee]">
                                                {selectedPermCompany ? availablePermCompanies.find(c => c.code === selectedPermCompany || c.companyCode === selectedPermCompany)?.comp_Name || availablePermCompanies.find(c => c.code === selectedPermCompany || c.companyCode === selectedPermCompany)?.companyName || selectedPermCompany : 'Global Companies'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPermTargetModal(true)}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all"
                                    >
                                        Change Target
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700 border-dashed">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-slate-550 uppercase tracking-widest mr-2">Select Role:</span>
                                        {systemRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRole === role.id
                                                        ? 'bg-[#00acee] text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search functions..."
                                            value={permSearch}
                                            onChange={e => setPermSearch(e.target.value)}
                                            className="pl-9 pr-4 py-1.5 border border-slate-250 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-xs w-full outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loadingPermissions ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500">
                                    <Loader2 className="animate-spin text-[#00acee]" size={32} />
                                    <span className="text-xs font-bold">Fetching role permission matrix...</span>
                                </div>
                            ) : (
                                <div className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                                <th className="px-4 py-3 w-1/3">Function Code</th>
                                                <th className="px-4 py-3 w-1/2">Description</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
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
                                                        <tr key={code} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                                    {code}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{desc}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() => handleInitiateToggle(code)}
                                                                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${isAllowed
                                                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                                                            : 'bg-red-50 dark:bg-red-500/10 text-red-750 dark:text-red-400 border border-red-200 dark:border-red-500/20'
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
                        <div className="h-full w-full">
                            <SystemAnalyticsBoard
                                allEmployees={allEmployees}
                                allCompanies={allCompanies}
                                hierarchy={hierarchy}
                                pendingResets={pendingResets}
                            />
                        </div>
                    )}

                    {/* ADMIN CONFIG VIEW */}
                    {activeMenu === 'Admin Config' && (
                        <SystemSettingsBoard isInline={true} />
                    )}

                    {/* SECURITY AUDIT VIEW */}
                    {activeMenu === 'Security Audit' && (
                        <div className="h-full w-full">
                            <SecurityAuditBoard
                                allEmployees={allEmployees}
                                allCompanies={allCompanies}
                                hierarchy={hierarchy}
                            />
                        </div>
                    )}

                    {/* INTEGRATIONS VIEW */}
                    {activeMenu === 'Integrations' && (
                        <div className="h-full w-full">
                            <IntegrationsBoard />
                        </div>
                    )}

                    {/* SYSTEM ANALYSIS VIEW */}
                    {activeMenu === 'System Analysis' && (
                        <div className="h-full w-full">
                            <SystemAnalysisBoard />
                        </div>
                    )}

                    {/* REPORTS VIEW */}
                    {activeMenu === 'Reports' && (
                        <div className="pb-10">
                            <AdminCompanyReportsBoard
                                hierarchy={hierarchy}
                                allEmployees={allEmployees}
                            />
                        </div>
                    )}

                    {/* APP LIST VIEW */}
                    {activeMenu === 'App List' && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <AppWindow className="text-[#00acee]" size={20} />
                                        App List Configuration
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage approved applications and system modules.</p>
                                </div>
                                <span className="bg-[#00acee]/10 text-[#00acee] text-xs font-bold px-3 py-1 rounded-full">{allCompanies.length + allEmployees.length} Entities</span>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-[#00acee]/5 to-transparent p-5 rounded-xl border border-[#00acee]/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Active Employees</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{allEmployees.length}</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500/5 to-transparent p-5 rounded-xl border border-emerald-500/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Registered Companies</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{allCompanies.length}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/5 to-transparent p-5 rounded-xl border border-purple-500/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">System Modules</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{allModules.length || (allCompanies.length * 8)}</p>
                                </div>
                            </div>

                            {/* Apps/Modules Table */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="px-5 py-3">Module Name</th>
                                            <th className="px-5 py-3">Type</th>
                                            <th className="px-5 py-3">Companies Using</th>
                                            <th className="px-5 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {allModules.map((mod, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{mod.icon}</span>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{mod.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${mod.type === 'Core' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                                                        {mod.type}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{mod.companiesUsing} / {mod.totalCompanies}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${mod.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>{mod.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SUBSCRIPTIONS VIEW */}
                    {activeMenu === 'Subscriptions' && (
                        <SubscriptionAdminBoard />
                    )}


                </div>
            </main>

            {/* Transactions Modal */}
            {selectedCompany && (
                <CompanyOverviewBoard
                    company={selectedCompany}
                    onClose={() => setSelectedCompany(null)}
                    onTransactionDeleted={() => {
                        setHierarchy(prev => prev.map(emp => {
                            const newComps = (emp.companies || []).map(c => {
                                if (c.companyCode === selectedCompany.companyCode) {
                                    return { ...c, transactions: Math.max(0, (c.transactions || 0) - 1) };
                                }
                                return c;
                            });
                            return { ...emp, companies: newComps };
                        }));
                    }}
                />
            )}

            {/* Edit Role Modal */}
            {editingEmp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Employee Role</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Editing {editingEmp.empName || editingEmp.emp_Name} ({editingEmp.empCode || editingEmp.emp_Code})</p>
                            </div>
                            <button onClick={() => setEditingEmp(null)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Role level select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Role Level (ID)</label>
                                <div className="relative">
                                    <select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
className="w-full appearance-none px-4 py-1.5 pr-10 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee] transition-colors cursor-pointer"
                                     >
                                         <option value="" disabled>Select a role...</option>
                                        {systemRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name} ({role.id})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug">Note: ID 99 grants full access to the Super Admin portal. ID 1 grants access to tenant configuration.</p>
                            </div>

                            {/* Member group select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Member Group Name</label>
                                <div className="relative">
                                    <select
                                        value={selectedGroupName}
                                        onChange={(e) => setSelectedGroupName(e.target.value)}
className="w-full appearance-none px-4 py-1.5 pr-10 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#00acee]/50 focus:border-[#00acee] transition-colors cursor-pointer"
                                     >
                                         <option value="" disabled>Select a member group...</option>
                                        {userGroups.map(g => (
                                            <option key={g.group_Id} value={g.group_Name}>{g.group_Name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug">Maps user to access control matrices defined in Master settings.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setEditingEmp(null)}
                                className="px-5 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200/60 dark:hover:bg-slate-700/50 rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInitiateUpdateRole}
                                disabled={savingRole}
                                className="px-6 py-2 bg-[#00acee] hover:bg-[#0082b3] text-white font-bold rounded-xl transition-all shadow-md shadow-sky-100 dark:shadow-sky-900/30 flex items-center gap-2 text-sm disabled:opacity-70"
                            >
                                {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Details View Modal */}
            {selectedEmployeeView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col font-sans">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Details</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedEmployeeView.emp_Name || selectedEmployeeView.empName || 'N/A'} ({selectedEmployeeView.emp_Code || selectedEmployeeView.empCode})</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployeeView(null)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries({
                                    ...selectedEmployeeView,
                                    'PASSWORD': selectedEmployeeView.pass_Word || selectedEmployeeView.password || selectedEmployeeView.Pass_Word || '•••••••• (Encrypted by Backend)'
                                }).map(([key, value]) => (
                                    <div key={key} className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col justify-center">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{key.replace(/_/g, ' ')}</h3>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-all">{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-300 dark:text-slate-500 font-normal italic">Empty</span>}</p>
                                    </div>
                                ))}
                            </div>
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

            {/* Password Confirm Modal for Permissions */}
            <AdminVerificationModal
                isOpen={showPasswordConfirmModal}
                onClose={() => setShowPasswordConfirmModal(false)}
                onVerify={confirmAndSavePermissions}
                message="PLEASE CONFIRM YOUR PASSWORD TO APPLY PERMISSION CHANGES"
                verifyButtonText="VERIFY & SAVE"
                value={confirmPasswordInput}
                onChange={setConfirmPasswordInput}
            />

            {/* Password Confirm Modal for Individual Toggle */}
            <AdminVerificationModal
                isOpen={showTogglePasswordModal}
                onClose={() => { setShowTogglePasswordModal(false); setPendingToggleFunc(null); }}
                onVerify={confirmAndTogglePermission}
                message="PLEASE CONFIRM YOUR PASSWORD TO TOGGLE THIS PERMISSION"
                verifyButtonText="VERIFY & TOGGLE"
                value={togglePasswordInput}
                onChange={setTogglePasswordInput}
            />

            {/* Password Confirm Modal for Role Updates */}
            <AdminVerificationModal
                isOpen={showRolePasswordModal}
                onClose={() => setShowRolePasswordModal(false)}
                onVerify={handleUpdateRole}
                message="PLEASE CONFIRM YOUR PASSWORD TO UPDATE EMPLOYEE ROLE"
                verifyButtonText="VERIFY & UPDATE"
                value={rolePasswordInput}
                onChange={setRolePasswordInput}
            />

            {/* Password Confirm Modal for Delete Actions */}
            <AdminVerificationModal
                isOpen={showDeletePasswordModal}
                onClose={() => { setShowDeletePasswordModal(false); setPendingDeleteAction(null); }}
                onVerify={confirmDeleteAction}
                message="PLEASE CONFIRM YOUR PASSWORD TO DELETE THIS RECORD"
                verifyButtonText="VERIFY & DELETE"
                value={deletePasswordInput}
                onChange={setDeletePasswordInput}
            />

            {/* Target Selection Sub-Modal for Role Features */}
            {showPermTargetModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-t-2xl">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900 dark:text-white">Select Target Scope</h3>
                            <button onClick={() => setShowPermTargetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5 h-full max-h-[70vh] overflow-visible">

                            <div className="flex flex-col gap-4 relative z-20">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Search & Select Employee</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Employee..."
                                        value={permEmpSearchText}
                                        onChange={e => {
                                            setPermEmpSearchText(e.target.value);
                                            setPermEmpSearchTriggered(false);
                                        }}
                                        onKeyDown={e => e.key === 'Enter' && setPermEmpSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                    />
                                    <button
                                        onClick={() => setPermEmpSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>

                                    {permEmpSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                            <div
                                                onClick={() => {
                                                    setSelectedPermEmployee('');
                                                    setPermEmpSearchText('-- All Employees (Global) --');
                                                    setPermEmpSearchTriggered(false);
                                                    setSelectedPermCompany('');
                                                    setPermCompSearchText('-- All Companies (Global) --');
                                                }}
                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                            >
                                                -- All Employees (Global) --
                                            </div>
                                            {(() => {
                                                const filteredEmployees = allEmployees.filter(e => (e.emp_Name || e.empName || '').toLowerCase().includes(permEmpSearchText.toLowerCase()) || (e.emp_Code || '').toLowerCase().includes(permEmpSearchText.toLowerCase()));
                                                return (
                                                    <>
                                                        {filteredEmployees.map(e => {
                                                            const roleName = systemRoles.find(r => r.id === e.userRole_Id || r.id === e.role)?.name || 'No Role';
                                                            return (
                                                                <div
                                                                    key={e.emp_Code}
                                                                    onClick={() => {
                                                                        setSelectedPermEmployee(e.emp_Code);
                                                                        setPermEmpSearchText(e.emp_Name || e.empName);
                                                                        setPermEmpSearchTriggered(false);

                                                                        // Auto-load & auto-select company
                                                                        const empNode = hierarchy.find(h => h.empCode === e.emp_Code || h.emp_Code === e.emp_Code);
                                                                        if (empNode && empNode.companies && empNode.companies.length === 1) {
                                                                            setSelectedPermCompany(empNode.companies[0].companyCode || empNode.companies[0].company_Code);
                                                                            setPermCompSearchText(empNode.companies[0].companyName || empNode.companies[0].company_Name);
                                                                        } else {
                                                                            setSelectedPermCompany('');
                                                                            setPermCompSearchText('');
                                                                        }
                                                                    }}
                                                                    className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium"
                                                                >
                                                                    {e.emp_Name || e.empName} <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">[{roleName}]</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10 mt-2">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Search & Select Company</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Company..."
                                        value={permCompSearchText}
                                        onChange={e => {
                                            setPermCompSearchText(e.target.value);
                                            setPermCompSearchTriggered(false);
                                        }}
                                        onKeyDown={e => e.key === 'Enter' && setPermCompSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                    />
                                    <button
                                        onClick={() => setPermCompSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>

                                    {permCompSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                            <div
                                                onClick={() => {
                                                    setSelectedPermCompany('');
                                                    setPermCompSearchText('-- All Companies (Global) --');
                                                    setPermCompSearchTriggered(false);
                                                }}
                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                            >
                                                -- All Companies (Global) --
                                            </div>
                                            {(() => {
                                                const filteredCompanies = availablePermCompanies.filter(c => (c.comp_Name || c.companyName || c.code || '').toLowerCase().includes(permCompSearchText.toLowerCase()));
                                                return (
                                                    <>
                                                        {filteredCompanies.map(c => (
                                                            <div
                                                                key={c.code}
                                                                onClick={() => {
                                                                    setSelectedPermCompany(c.code);
                                                                    setPermCompSearchText(c.comp_Name || c.companyName || c.code);
                                                                    setPermCompSearchTriggered(false);
                                                                }}
                                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium"
                                                            >
                                                                {c.comp_Name || c.companyName || c.code}
                                                            </div>
                                                        ))}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => setShowPermTargetModal(false)} className="w-full py-3 mt-4 bg-[#00acee] hover:bg-[#009adb] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0">
                                Apply Target Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* System Log Report Modal */}
            <SystemLogReportModal
                isOpen={showSystemLogReport}
                onClose={() => setShowSystemLogReport(false)}
            />
        </div>
    );
};

export default SuperAdminDashboard;
