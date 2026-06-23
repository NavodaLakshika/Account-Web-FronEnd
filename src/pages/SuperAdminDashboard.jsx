import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';
import toast from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
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
    Moon,
    Megaphone,
    Lock,
    Unlock,
    Sparkles
} from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';
import AlertModal from '../components/modals/AlertModal';
import AdminVerificationModal from '../components/modals/AdminVerificationModal';
import AdminConfigBoard from '../HomeMaster/AdminConfigBoard';
import SystemAnalyticsBoard from '../HomeMaster/SystemAnalyticsBoard';
import SecurityAuditBoard from '../HomeMaster/SecurityAuditBoard';
import IntegrationsBoard from '../HomeMaster/IntegrationsBoard';

import SystemAnalysisBoard from '../HomeMaster/SystemAnalysisBoard';
import SystemLogReportModal from '../components/modals/AdminReports/SystemLogReportModal';
import SubscriptionAdminBoard from '../components/Admin/SubscriptionAdminBoard';
import CompanyOverviewBoard from '../HomeMaster/CompanyOverviewBoard';
import AdminCompanyReportsBoard from '../HomeMaster/AdminCompanyReportsBoard';
import EngagementAdminBoard from '../components/Admin/EngagementAdminBoard';
import EmployeeMessageDropdown from '../components/Admin/EmployeeMessageDropdown';
import AdminAIChatbot from '../components/modals/AdminAIChatbot';
import AIAsterisk from '../components/AIAsterisk';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmps, setExpandedEmps] = useState({});
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const [currentUserCode, setCurrentUserCode] = useState('');

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
    const [seedingFunctions, setSeedingFunctions] = useState(false);

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
    const [showAIChatbot, setShowAIChatbot] = useState(false);

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

    // Feedback state
    const [feedbackData, setFeedbackData] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const fetchFeedback = async () => {
        setFeedbackLoading(true);
        try {
            const res = await api.get('/reportfeedback/all');
            setFeedbackData(res.data);
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setFeedbackLoading(false);
        }
    };

    useEffect(() => {
        if (activeMenu === 'User Feedback') {
            fetchFeedback();
        }
    }, [activeMenu]);

    const handleDeleteFeedback = (feedbackId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Feedback',
            message: `Are you sure you want to permanently delete this feedback record?`,
            loading: false,
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'feedback', feedbackId });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
            }
        });
    };

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const fetchAdminData = async () => {
        try {
            const [hierarchyRes, resetsRes, compRes, empRes, modRes, groupsRes] = await Promise.all([
                api.get('/SuperAdmin/hierarchy').catch(() => ({ data: [] })),
                api.get('/SuperAdmin/pending-resets').catch(() => ({ data: [] })),
                api.get('/SuperAdmin/companies').catch(() => ({ data: [] })),
                api.get('/SuperAdmin/employees').catch(() => ({ data: [] })),
                api.get('/SuperAdmin/modules').catch(() => ({ data: [] })),
                api.get('/UserGroup/all').catch(() => ({ data: [] }))
            ]);
            setHierarchy(hierarchyRes.data || []);
            setPendingResets(resetsRes.data || []);
            setAllCompanies(compRes.data || []);
            setAllEmployees(empRes.data || []);
            setAllModules(modRes.data?.data || modRes.data || []);
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
            const empCode = user.Emp_Code || user.empCode || 'unknown';
            setCurrentUserCode(empCode);

            if (String(user.userRoleId) !== "99" && String(user.UserRoleId) !== "99" && String(user.role) !== "99" && String(user.Role) !== "99") {
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

    const handleSeedFunctions = async () => {
        setSeedingFunctions(true);
        try {
            await api.post('/UserRole/seed-system-functions');
            await fetchRolePermissions(selectedRole);
        } catch (e) {
            console.error("Error seeding functions", e);
        } finally {
            setSeedingFunctions(false);
        }
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

    const handleToggleEmployeeLock = (e, empCode) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Toggle Employee Lock',
            message: `Are you sure you want to change the lock status for employee ${empCode}?`,
            loading: false,
            onConfirm: async () => {
                closeConfirm();
                try {
                    await api.put(`/SuperAdmin/employee/${empCode}/toggle-lock`);
                    showSuccessToast('Employee lock status updated.');
                    fetchAdminData();
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to toggle employee lock status.',
                        variant: 'warning'
                    });
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
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'company', companyCode, empCode });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
            }
        });
    };

    const handleToggleCompanyLock = (e, companyCode) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Toggle Company Lock',
            message: `Are you sure you want to change the lock status for company ${companyCode}?`,
            loading: false,
            onConfirm: async () => {
                closeConfirm();
                try {
                    await api.put(`/SuperAdmin/company/${companyCode}/toggle-lock`);
                    showSuccessToast('Company lock status updated.');
                    fetchAdminData();
                } catch (error) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to toggle company lock status.',
                        variant: 'warning'
                    });
                }
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
            } else if (action.type === 'feedback') {
                await api.delete(`/reportfeedback/${action.feedbackId}`);
                setFeedbackData(prev => prev.filter(f => f.id !== action.feedbackId));
                showSuccessToast('Feedback deleted successfully.');
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
        return <SystemLoader />;
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
        { name: 'Engagement', icon: Megaphone },
        { name: 'Subscriptions', icon: CalendarClock },
        { name: 'Database', icon: Database },
        { name: 'Security Audit', icon: ShieldCheck },
        { name: 'Integrations', icon: Puzzle },
        { name: 'App List', icon: AppWindow },
        { name: 'User Feedback', icon: MessageSquare }
    ];

    return (
        <div className="flex h-screen bg-[#f4f5f8] font-sans overflow-hidden">
            {/* Sidebar */}
            <aside id="tour-sidebar" className={`bg-white border-r border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col h-full hidden md:flex  transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} z-30`}>
                <div className={`flex items-center border-b border-slate-100 ${sidebarCollapsed ? 'h-16 justify-center px-0' : 'h-16 px-6'}`}>
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-8 w-auto object-contain rounded-[12px] shrink-0" />
                        <div className={sidebarCollapsed ? 'hidden' : ''}>
                            <h1 className="text-[16px] font-bold text-[#393a3d] tracking-tight leading-none">Accounts</h1>
                            <p className="text-[10px] text-[#6b6c72] uppercase tracking-wider font-bold leading-tight">Super Admin</p>
                        </div>
                    </div>
                </div>

                <nav className={`flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveMenu(item.name)}
                            className={`w-full flex items-center  rounded-[12px] transition-all ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} ${activeMenu === item.name
                                ? 'bg-blue-50 text-[#0078d4] font-bold'
                                : 'text-slate-600 hover:bg-[#f4f5f8] hover:text-[#0078d4] font-medium text-[13.5px]'
                                }`}
                            title={sidebarCollapsed ? item.name : undefined}
                        >
                            <item.icon className={`w-[18px] h-[18px] rounded-[12px] shrink-0 ${activeMenu === item.name ? 'text-[#0078d4]' : 'text-slate-400'}`} />
                            <span className={sidebarCollapsed ? 'hidden' : ''}>{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className={`p-3 mb-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center text-red-500 font-bold hover:bg-red-50  rounded-[12px] transition-all text-[13px] ${sidebarCollapsed ? 'justify-center p-2.5 w-auto' : 'w-full gap-3 px-3 py-2.5'}`}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut className="w-[18px] h-[18px] rounded-[12px] shrink-0" />
                        <span className={sidebarCollapsed ? 'hidden' : ''}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm dark:bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl animate-in slide-in-from-left duration-200">
                        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-8 w-auto object-contain" />
                                <div>
                                    <h1 className="text-[16px] font-bold text-[#393a3d] dark:text-white tracking-tight leading-none">Accounts</h1>
                                    <p className="text-[10px] text-[#6b6c72] dark:text-slate-400 uppercase tracking-wider font-bold leading-tight">Super Admin</p>
                                </div>
                            </div>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => { setActiveMenu(item.name); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5  rounded-[12px] transition-all ${activeMenu === item.name
                                        ? 'bg-blue-50 text-[#0078d4] font-bold'
                                        : 'text-slate-600 hover:bg-[#f4f5f8] hover:text-[#0078d4] font-medium text-[13.5px]'
                                        }`}
                                >
                                    <item.icon className={`w-[18px] h-[18px] ${activeMenu === item.name ? 'text-[#0078d4]' : 'text-slate-400'}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                        <div className="p-3 mb-3">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 font-bold hover:bg-red-50  rounded-[12px] transition-all text-[13px]">
                                <LogOut className="w-[18px] h-[18px]" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main id="tour-main-content" className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Topbar */}
                <header className="z-50 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]  shrink-0">
                    <div className="flex items-center justify-between px-6 border-b border-slate-100 h-14">
                        {/* Left: Menu Toggle + Branding */}
                        <div className="flex items-center gap-3 rounded-[12px] shrink-0">
                            <Menu className="w-5 h-5 text-slate-500 hover:text-[#0078d4] cursor-pointer rounded-[12px] transition-colors" onClick={() => { if (window.innerWidth < 768) { setSidebarOpen(true); } else { setSidebarCollapsed(prev => !prev); } }} />
                            <div className="h-7 w-px bg-[#eceef1]" />
                            {/* <img src="/onimta_logo-modified.png" alt="ONIMTA" className="h-7 w-auto object-contain" />
                            <div className="h-7 w-px bg-[#eceef1]" /> */}
                            {/* <div>
                                <div className="text-[16px] font-bold text-[#393a3d] leading-tight tracking-tight">Super Admin</div>
                                <div className="text-[10px] font-bold text-[#6b6c72] uppercase tracking-wider">System Owner</div>
                            </div> */}
                        </div>

                        {/* Center: Search */}
                        <div id="tour-topbar-search" className="relative hidden md:block w-[400px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 " />
                            <input
                                type="text"
                                placeholder="Search employees or companies..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-white rounded-[10px]  text-[13px] font-medium text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/30 focus:border-[#0078d4]/50 rounded-[12px] transition-all"
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDarkMode(prev => !prev)}
                                className="relative p-2  hover:bg-slate-100 text-slate-500 hover:text-[#0078d4] rounded-[12px] transition-colors"
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                            </button>
                            <div id="tour-topbar-messages" className="relative">
                                <button
                                    className="relative p-2  hover:bg-slate-100 text-slate-500 hover:text-[#0078d4] rounded-[12px] transition-colors"
                                    onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                                >
                                    <MessageSquare className="w-[18px] h-[18px]" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500  border-2 border-white"></span>
                                </button>
                                {showMessageDropdown && (
                                    <EmployeeMessageDropdown
                                        allEmployees={allEmployees}
                                        onClose={() => setShowMessageDropdown(false)}
                                    />
                                )}
                            </div>
                            <div id="tour-topbar-notifications" className="relative">
                                <button
                                    className="relative p-2  hover:bg-slate-100 text-slate-500 hover:text-[#0078d4] rounded-[12px] transition-colors"
                                    onClick={() => setShowResets(!showResets)}
                                >
                                    <Bell className="w-[18px] h-[18px]" />
                                    {pendingResets.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500  border-2 border-white"></span>
                                    )}
                                </button>

                                {showResets && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">Password Recovery Alerts</h3>
                                            <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 ">{pendingResets.length}</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-auto">
                                            {pendingResets.length === 0 ? (
                                                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                    No pending password resets.
                                                </div>
                                            ) : (
                                                pendingResets.map(req => (
                                                    <div key={req.empCode} className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-[12px] transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{req.empName}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{req.empCode}</p>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-red-500 uppercase">Action Req</p>
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-slate-700 p-2  flex items-center justify-between">
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
                                                                className="text-[#0078d4] hover:text-[#005a9e] text-xs font-bold uppercase tracking-wider"
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
                            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                                {/* <div className="text-right hidden sm:block">
                                    <p className="text-[13px] text-[#393a3d] font-bold">Super Admin</p>
                                    <p className="text-[10px] text-[#6b6c72] font-bold uppercase tracking-wider">System Owner</p>
                                </div> */}
                                <div className="w-[28px] h-[28px]  bg-[#4096ff] text-white flex items-center justify-center font-bold text-[14px] shadow-sm rounded-full">
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
                            {/* Greeting Header */}
                            <div className="flex flex-col mb-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <h1 className="text-[28px] font-extrabold text-[#1e293b] leading-tight tracking-tight">
                                    {(() => {
                                        const h = new Date().getHours();
                                        if (h < 12) return 'Good Morning';
                                        if (h < 18) return 'Good Afternoon';
                                        return 'Good Evening';
                                    })()}, Admin
                                </h1>
                                <p className="text-[14px] font-semibold text-slate-500 mt-1">
                                    Here's your system overview for {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white p-5 shadow-sm hover:shadow-md rounded-[12px] transition-all flex flex-col justify-between border border-slate-200/60 hover:border-[#0078d4]/20 ">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Employees</p>
                                        </div>
                                        <div className="w-9 h-9  bg-blue-50 flex items-center justify-center">
                                            <Users className="w-[18px] h-[18px] text-[#0078d4]" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-[32px] font-black text-slate-800 leading-none">{hierarchy.length}</span>
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 ">Active</span>
                                    </div>
                                </div>
                                <div className="bg-white p-5 shadow-sm hover:shadow-md rounded-[12px] transition-all flex flex-col justify-between border border-slate-200/60 hover:border-emerald-500/20 ">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Companies</p>
                                        </div>
                                        <div className="w-9 h-9  bg-emerald-50 flex items-center justify-center">
                                            <Building2 className="w-[18px] h-[18px] text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-[32px] font-black text-slate-800 leading-none">{totalCompanies}</span>
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 ">Registered</span>
                                    </div>
                                </div>
                                <div className="bg-white p-5 shadow-sm hover:shadow-md rounded-[12px] transition-all flex flex-col justify-between border border-slate-200/60 hover:border-purple-500/20 ">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Entities</p>
                                        </div>
                                        <div className="w-9 h-9  bg-purple-50 flex items-center justify-center">
                                            <Database className="w-[18px] h-[18px] text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-[32px] font-black text-slate-800 leading-none">{hierarchy.length + totalCompanies}</span>
                                        <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-1 ">Combined</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Table Card */}
                            <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden mb-6 ">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8  bg-blue-50 flex items-center justify-center">
                                            <LayoutDashboard className="w-4 h-4 text-[#0078d4]" />
                                        </div>
                                        <div>
                                            <h2 className="text-[15px] font-bold text-slate-800">System Overview</h2>
                                            <p className="text-[11px] text-slate-500 font-medium">Employee hierarchy & company assignments</p>
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white border border-slate-200  text-slate-400 hover:text-[#0078d4] hover:border-[#0078d4]/30 hover:bg-[#e8f2fb] rounded-[12px] transition-all" title="Refresh">
                                        <Search className="w-[18px] h-[18px]" />
                                    </button>
                                </div>

                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Role</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Last Login</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Login Count</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Companies</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHierarchy.map((emp) => (
                                                <React.Fragment key={emp.empCode}>
                                                    <tr className="border-b border-slate-50 hover:bg-slate-50/80 rounded-[12px] transition-colors cursor-pointer group" onClick={() => toggleEmp(emp.empCode)}>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9  bg-gradient-to-br from-[#0078d4] to-[#004a7c] text-white flex items-center justify-center font-bold text-sm shadow-sm rounded-[12px] shrink-0">
                                                                    {emp.empName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-slate-900">{emp.empName}</p>
                                                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{emp.empCode} <span className="text-slate-300 mx-1">•</span> {emp.email || 'No Email'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-1  text-[10px] uppercase tracking-widest font-bold ${emp.role === 99 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {emp.role === 99 ? 'Super Admin' : `Role ${emp.role}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className="text-[13px] font-medium text-slate-700">
                                                                {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-slate-400">Never</span>}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className="text-[13px] font-bold text-slate-700">{emp.loginCount || 0}</span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7  bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                                                    {emp.companies.length}
                                                                </span>
                                                                {expandedEmps[emp.empCode]
                                                                    ? <ChevronDown className="w-[18px] h-[18px] text-slate-400" />
                                                                    : <ChevronRight className="w-[18px] h-[18px] text-slate-400" />}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    className="p-2 text-slate-400 hover:text-[#0078d4] hover:bg-blue-50  rounded-[12px] transition-all"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingEmp(emp);
                                                                        setSelectedRoleId(emp.role);
                                                                        setSelectedGroupName(emp.memberId || 'Administrators');
                                                                    }}
                                                                    title="Edit User Role"
                                                                >
                                                                    <Edit className="w-[18px] h-[18px]" />
                                                                </button>
                                                                <button
                                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50  rounded-[12px] transition-all"
                                                                    onClick={(e) => handleDeleteEmployee(e, emp.empCode)}
                                                                    title="Delete Employee"
                                                                >
                                                                    <Trash2 className="w-[18px] h-[18px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Nested Companies */}
                                                    {expandedEmps[emp.empCode] && (
                                                        <tr className="bg-slate-50/50">
                                                            <td colSpan={6} className="p-0 border-b border-slate-100">
                                                                <div className="py-4 px-6">
                                                                    <div className="border-l-2 border-[#0078d4]/20 ml-3 pl-6 space-y-2">
                                                                        {emp.companies.length === 0 ? (
                                                                            <p className="text-[13px] text-slate-400 italic py-2">No companies assigned.</p>
                                                                        ) : (
                                                                            emp.companies.map((comp, idx) => (
                                                                                <div key={comp.companyCode} onClick={() => openTransactionsModal(comp)} className="group flex items-center justify-between p-3  hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-[12px] transition-all cursor-pointer">
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="w-9 h-9  bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 rounded-[12px] transition-colors border border-emerald-100/50">
                                                                                            <Building2 className="w-[18px] h-[18px] text-emerald-500" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-[13px] font-bold text-slate-800 group-hover:text-[#0078d4] rounded-[12px] transition-colors">{comp.companyName || 'Unknown Company'}</p>
                                                                                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{comp.companyCode}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Transactions</span>
                                                                                            <span className="text-[13px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 ">{comp.transactions}</span>
                                                                                        </div>
                                                                                        <button
                                                                                            className={`opacity-0 group-hover:opacity-100 p-1.5  rounded-[12px] transition-all ${comp.accDesable === 1 ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                                                                                            onClick={(e) => { e.stopPropagation(); handleToggleCompanyLock(e, comp.companyCode); }}
                                                                                            title={comp.accDesable === 1 ? "Unlock Company" : "Lock Company"}
                                                                                        >
                                                                                            {comp.accDesable === 1 ? <Lock className="w-[18px] h-[18px]" /> : <Unlock className="w-[18px] h-[18px]" />}
                                                                                        </button>
                                                                                        <button
                                                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50  rounded-[12px] transition-all"
                                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.companyCode, emp.empCode); }}
                                                                                            title="Remove Company Access"
                                                                                        >
                                                                                            <Trash2 className="w-[18px] h-[18px]" />
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
                        <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden  animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8  bg-emerald-50 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">All Registered Companies</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">Manage all company records</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 ">{allCompanies.length} Companies</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Company Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Company Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Phone</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCompanies.filter(c =>
                                            c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            c.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(comp => (
                                            <tr key={comp.code} onClick={() => setSelectedCompany(comp)} className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer rounded-[12px] transition-colors">
                                                <td className="py-3.5 px-6 font-mono text-[13px] text-slate-900 font-bold">{comp.code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-900 font-bold">{comp.comp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">{comp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">{comp.phone || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            className={`p-1.5  rounded-[12px] transition-all ${comp.acc_Desable === 1 ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                                                            onClick={(e) => handleToggleCompanyLock(e, comp.code)}
                                                            title={comp.acc_Desable === 1 ? "Unlock Company" : "Lock Company"}
                                                        >
                                                            {comp.acc_Desable === 1 ? <Lock className="w-[18px] h-[18px]" /> : <Unlock className="w-[18px] h-[18px]" />}
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50  rounded-[12px] transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.code, null); }} title="Delete Company">
                                                            <Trash2 className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </div>
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
                        <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden  animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8  bg-blue-50 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-[#0078d4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">All Employees</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">Manage employee accounts & roles</p>
                                    </div>
                                </div>
                                <span className="bg-blue-100 text-[#0078d4] text-[10px] font-bold px-2.5 py-1 ">{allEmployees.length} Employees</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Emp Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Role</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEmployees.filter(e =>
                                            e.emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            e.emp_Code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(emp => (
                                            <tr key={emp.emp_Code} onClick={() => setSelectedEmployeeView(emp)} className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer rounded-[12px] transition-colors">
                                                <td className="py-3.5 px-6 font-mono text-[13px] text-slate-900 font-bold">{emp.emp_Code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-900 font-bold">{emp.emp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">{emp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1  text-[10px] uppercase tracking-widest font-bold ${emp.userRole_Id === 99 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {emp.userRole_Id === 99 ? 'Super Admin' : `Role ${emp.userRole_Id}`}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-[#0078d4] hover:bg-blue-50  rounded-[12px] transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEmp(emp);
                                                                setSelectedRoleId(emp.userRole_Id);
                                                                setSelectedGroupName(emp.member_Id || 'Administrators');
                                                            }}
                                                            title="Edit Employee Role"
                                                        >
                                                            <Edit className="w-[18px] h-[18px]" />
                                                        </button>
                                                        <button
                                                            className={`p-1.5  rounded-[12px] transition-all ${emp.acc_Desable === "1" || emp.accDesable === "1" ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleEmployeeLock(e, emp.empCode || emp.emp_Code); }}
                                                            title={(emp.acc_Desable === "1" || emp.accDesable === "1") ? "Unlock Employee" : "Lock Employee"}
                                                        >
                                                            {(emp.acc_Desable === "1" || emp.accDesable === "1") ? <Lock className="w-[18px] h-[18px]" /> : <Unlock className="w-[18px] h-[18px]" />}
                                                        </button>
                                                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50  rounded-[12px] transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(e, emp.emp_Code); }} title="Delete Employee">
                                                            <Trash2 className="w-[18px] h-[18px]" />
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
                            <div className="bg-white shadow-sm border border-slate-200/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[12px] shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                                        <Database className="text-[#0078d4]" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">Database Management</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">Manage system backups, optimize performance, and monitor database health.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCreateBackup}
                                        disabled={creatingBackup}
                                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold shadow-md rounded-[12px] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {creatingBackup ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                        {creatingBackup ? 'Creating...' : 'Create Full Backup'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-[12px] shrink-0">
                                <div className="bg-white p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-500">
                                            <Database size={18} />
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Healthy</span>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Database Size</h3>
                                        <p className="text-2xl font-bold text-slate-900">N/A</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Users size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Records</h3>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {allCompanies.length + allEmployees.length + hierarchy.reduce((acc, emp) => acc + (emp.companies ? emp.companies.reduce((sum, comp) => sum + (comp.transactions || comp.Transactions || 0), 0) : 0), 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-orange-50 flex items-center justify-center text-orange-500">
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Connections</h3>
                                        <p className="text-2xl font-bold text-slate-900">{allEmployees.length || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-emerald-500">
                                            <CheckCircle size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Last Backup</h3>
                                        <p className="text-lg font-bold text-slate-900">
                                            {backups.length > 0 && backups[0].createdAt
                                                ? new Date(backups[backups.length - 1].createdAt || backups[0].createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
                                                : 'No Backups'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[12px] shrink-0">
                                <div className="bg-white border border-slate-200/60 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Maintenance Operations</h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Rebuild Indexes</h4>
                                                <p className="text-xs text-slate-500 mt-1">Improves database query performance by defragmenting indexes.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 hover:border-[#0078d4] hover:text-[#0078d4] text-slate-600 text-xs font-bold shadow-sm rounded-[12px] transition-all rounded-[12px] shrink-0">Run Now</button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Clear Query Cache</h4>
                                                <p className="text-xs text-slate-500 mt-1">Frees up memory by clearing the SQL server query plan cache.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-500 text-slate-600 text-xs font-bold shadow-sm rounded-[12px] transition-all rounded-[12px] shrink-0">Clear</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200/60 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Recent Backups</h3>
                                    <div className="flex flex-col gap-0 border border-slate-100 overflow-hidden">
                                        {(backups.length > 0 ? backups.slice().reverse().slice(0, 5) : []).map((b, i) => {
                                            const isFailed = b.status?.toLowerCase() === 'failed';
                                            return (
                                                <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 rounded-[12px] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 flex items-center justify-center rounded-[12px] shrink-0 ${isFailed ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                            {isFailed ? <X size={28} /> : <CheckCircle size={28} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800" title={b.backupPath}>
                                                                {b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : 'N/A'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{b.createdBy || 'Manual'} • {b.status}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-[#0078d4] hover:text-[#005a9e] text-xs font-bold px-3 py-1 bg-[#0078d4]/10 rounded-[12px] shrink-0">Restore</button>
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
                        <div className="bg-white shadow-sm border border-slate-200/60 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                        <ShieldAlert className="w-4 h-4 text-[#0078d4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">System Role Permission Master Editor</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">Configure default enabled/disabled features for each user role</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-start">
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions || loadingPermissions}
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-[12px] transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        {seedingFunctions ? (
                                            <><Loader2 className="animate-spin" size={13} />Seeding...</>
                                        ) : (
                                            <><Database size={14} />Seed Functions</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleAllowAllPermissions}
                                        disabled={loadingPermissions || !permissions.length}
                                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md rounded-[12px] transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <CheckCircle size={14} />
                                        Allow All
                                    </button>
                                    <button
                                        onClick={handleInitiateSavePermissions}
                                        disabled={savingPermissions || loadingPermissions || !permissions.length}
                                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold shadow-md rounded-[12px] transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        {savingPermissions ? (
                                            <><Loader2 className="animate-spin" size={13} />Saving Changes...</>
                                        ) : (
                                            'Save Role Permissions'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border border-slate-200/60 mx-6 flex flex-col gap-4">
                                <div className="bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                    <div className="flex flex-col w-full sm:w-auto">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Configuration Target</span>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="text-sm font-bold text-slate-700">
                                                {selectedPermEmployee ? allEmployees.find(e => e.emp_Code === selectedPermEmployee)?.empName || allEmployees.find(e => e.emp_Code === selectedPermEmployee)?.emp_Name || selectedPermEmployee : 'Global Employees'}
                                            </span>
                                            <span className="hidden sm:inline text-slate-300">/</span>
                                            <span className="text-sm font-bold text-[#0078d4]">
                                                {selectedPermCompany ? availablePermCompanies.find(c => c.code === selectedPermCompany || c.companyCode === selectedPermCompany)?.comp_Name || availablePermCompanies.find(c => c.code === selectedPermCompany || c.companyCode === selectedPermCompany)?.companyName || selectedPermCompany : 'Global Companies'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPermTargetModal(true)}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#0078d4] hover:text-[#0078d4] text-slate-600 text-xs font-bold uppercase tracking-wider shadow-sm rounded-[12px] transition-all"
                                    >
                                        Change Target
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-200 border-dashed">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Select Role:</span>
                                        {systemRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all ${selectedRole === role.id
                                                    ? 'bg-[#0078d4] text-white shadow-sm'
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
                                            className="pl-9 pr-4 py-1.5 border border-slate-200 bg-white text-xs w-full outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] rounded-[12px] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loadingPermissions ? (
                                <SystemLoader inline message="Fetching role permission matrix..." />
                            ) : !permissions.length ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 mx-6 border border-dashed border-slate-200">
                                    <Database size={40} className="text-slate-300" />
                                    <div className="text-center">
                                        <p className="text-[13px] font-bold text-slate-500 mb-1">No System Functions Found</p>
                                        <p className="text-[11px] text-slate-400 font-medium">The system permission table is empty. Seed default functions to get started.</p>
                                    </div>
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions}
                                        className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-[12px] transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-[#0078d4]/20"
                                    >
                                        {seedingFunctions ? (
                                            <><Loader2 className="animate-spin" size={14} />Seeding Functions...</>
                                        ) : (
                                            <><Database size={14} />Seed Default Functions & Reports</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-slate-200/80 overflow-hidden mx-6">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="px-4 py-3 w-1/3">Function Code</th>
                                                <th className="px-4 py-3 w-1/2">Description</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(() => {
                                                const filtered = permissions.filter(p => {
                                                    const code = (p.system_Fuction || p.systemFuction || p.System_Fuction || '').toLowerCase();
                                                    const desc = (p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || '').toLowerCase();
                                                    const term = permSearch.toLowerCase();
                                                    return code.includes(term) || desc.includes(term);
                                                });

                                                const categoryOrder = ['ACC_', 'MST_', 'TRN_', 'RPT_', 'SYS_'];
                                                const categoryLabels = {
                                                    ACC_: { label: 'General' },
                                                    MST_: { label: 'Master Data' },
                                                    TRN_: { label: 'Transactions' },
                                                    RPT_: { label: 'Reports' },
                                                    SYS_: { label: 'System Administration' },
                                                };

                                                const getCategory = (code) => {
                                                    const up = code.toUpperCase();
                                                    const prefix = categoryOrder.find(p => up.startsWith(p));
                                                    return prefix || 'OTHER';
                                                };

                                                const grouped = {};
                                                filtered.forEach(p => {
                                                    const code = p.system_Fuction || p.systemFuction || p.System_Fuction || '';
                                                    const cat = getCategory(code);
                                                    if (!grouped[cat]) grouped[cat] = [];
                                                    grouped[cat].push(p);
                                                });

                                                const rows = [];
                                                const renderItems = (items, label) => {
                                                    if (!items.length) return;
                                                    rows.push(
                                                        <tr key={`cat-${label}`} className="bg-slate-50/80 border-b border-slate-200">
                                                            <td colSpan={3} className="px-4 py-2.5">
                                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-[#0078d4] inline-block"></span>
                                                                    {label}
                                                                    <span className="text-[10px] font-normal text-slate-400 normal-case">({items.length} function{(items.length !== 1) ? 's' : ''})</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                    items.forEach(p => {
                                                        const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
                                                        const desc = p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || code;
                                                        const isAllowed = (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === 'T';
                                                        rows.push(
                                                            <tr key={code} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5">{code}</span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-xs text-slate-600 font-medium">{desc}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleInitiateToggle(code)}
                                                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[12px] transition-all ${isAllowed
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                                            }`}
                                                                    >
                                                                        {isAllowed ? 'Allowed' : 'Denied'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                };

                                                categoryOrder.forEach(prefix => {
                                                    renderItems(grouped[prefix] || [], categoryLabels[prefix].label);
                                                });
                                                renderItems(grouped['OTHER'] || [], 'Other');

                                                return rows;
                                            })()}
                                        </tbody>
                                    </table>
                                    {!permissions.filter(p => {
                                        const code = (p.system_Fuction || p.systemFuction || p.System_Fuction || '').toLowerCase();
                                        const desc = (p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || '').toLowerCase();
                                        const term = permSearch.toLowerCase();
                                        return code.includes(term) || desc.includes(term);
                                    }).length && (
                                            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                                                <Search size={16} />
                                                <span className="text-xs font-medium">No functions match your search.</span>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADMIN CONFIG VIEW */}
                    {activeMenu === 'Admin Config' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-[#0078d4]" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Admin Configuration</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">System-wide settings and preferences</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <AdminConfigBoard
                                    hierarchy={hierarchy}
                                    allEmployees={allEmployees}
                                />
                            </div>
                        </div>
                    )}

                    {/* SECURITY AUDIT VIEW */}
                    {activeMenu === 'Security Audit' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-50 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Security Audit</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">Monitor system access and security events</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <SecurityAuditBoard
                                    allEmployees={allEmployees}
                                    allCompanies={allCompanies}
                                    hierarchy={hierarchy}
                                />
                            </div>
                        </div>
                    )}

                    {/* INTEGRATIONS VIEW */}
                    {activeMenu === 'Integrations' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 flex items-center justify-center">
                                    <Puzzle className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Integrations</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">Connect external services and APIs</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <IntegrationsBoard />
                            </div>
                        </div>
                    )}

                    {/* REPORTS VIEW */}
                    {activeMenu === 'Reports' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-[#0078d4]" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Admin Reports</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">View system-wide reports and analytics</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <AdminCompanyReportsBoard
                                    hierarchy={hierarchy}
                                    allEmployees={allEmployees}
                                />
                            </div>
                        </div>
                    )}

                    {/* APP LIST VIEW */}
                    {activeMenu === 'App List' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                        <AppWindow className="w-4 h-4 text-[#0078d4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">App List Configuration</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">Manage approved applications and system modules.</p>
                                    </div>
                                </div>
                                <span className="bg-[#0078d4]/10 text-[#0078d4] text-[10px] font-bold px-2.5 py-1">{allCompanies.length + allEmployees.length} Entities</span>
                            </div>

                            <div className="px-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-[#0078d4]/5 to-transparent p-5 border border-[#0078d4]/10">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Active Employees</p>
                                        <p className="text-3xl font-black text-slate-900">{allEmployees.length}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500/5 to-transparent p-5 border border-emerald-500/10">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Registered Companies</p>
                                        <p className="text-3xl font-black text-slate-900">{allCompanies.length}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/5 to-transparent p-5 border border-purple-500/10">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">System Modules</p>
                                        <p className="text-3xl font-black text-slate-900">{allModules.length || (allCompanies.length * 8)}</p>
                                    </div>
                                </div>

                                <div className="border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="px-5 py-3.5">Module Name</th>
                                                <th className="px-5 py-3.5">Type</th>
                                                <th className="px-5 py-3.5">Companies Using</th>
                                                <th className="px-5 py-3.5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allModules.map((mod, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 rounded-[12px] transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{mod.icon}</span>
                                                            <span className="text-[13px] font-bold text-slate-800">{mod.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mod.type === 'Core' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {mod.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-[13px] font-bold text-slate-700">{mod.companiesUsing} / {mod.totalCompanies}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mod.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{mod.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBSCRIPTIONS VIEW */}
                    {activeMenu === 'Subscriptions' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-50 flex items-center justify-center">
                                    <CalendarClock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Subscription Management</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">Manage tenant subscriptions and billing</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <SubscriptionAdminBoard />
                            </div>
                        </div>
                    )}

                    {/* ENGAGEMENT VIEW */}
                    {activeMenu === 'Engagement' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-rose-50 flex items-center justify-center">
                                    <Megaphone className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800">Employee Engagement</h2>
                                    <p className="text-[11px] text-slate-500 font-medium">Track engagement and interaction metrics</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <EngagementAdminBoard />
                            </div>
                        </div>
                    )}

                    {/* USER FEEDBACK VIEW */}
                    {activeMenu === 'User Feedback' && (
                        <div className="bg-white shadow-sm border border-slate-200/60 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-[#0078d4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800">User Feedback</h2>
                                        <p className="text-[11px] text-slate-500 font-medium">View and manage feedback submitted from Report Builder</p>
                                    </div>
                                </div>
                                <span className="bg-blue-100 text-[#0078d4] text-[10px] font-bold px-2.5 py-1 ">{feedbackData.length} Records</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Date</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Employee Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Company</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Report Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Feedback</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Images</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbackLoading ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-400 text-[13px] font-medium">Loading feedback...</td>
                                            </tr>
                                        ) : feedbackData.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-400 text-[13px] font-medium">No feedback records found.</td>
                                            </tr>
                                        ) : (
                                            feedbackData.map((item) => (
                                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-600 whitespace-nowrap">
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[13px] text-slate-900 font-bold">
                                                        {item.employeeName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-600 font-mono">
                                                        {item.companyId || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] font-medium text-slate-800">
                                                        {item.reportName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-700 max-w-[250px] truncate" title={item.feedbackText}>
                                                        {item.feedbackText}
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        {(() => {
                                                            try {
                                                                if (!item.images || item.images === '[]') return <span className="text-[12px] text-slate-400">-</span>;
                                                                const imgs = JSON.parse(item.images);
                                                                if (!Array.isArray(imgs) || imgs.length === 0) return <span className="text-[12px] text-slate-400">-</span>;
                                                                return (
                                                                    <div className="flex gap-1.5 overflow-x-auto max-w-[120px] pb-1">
                                                                        {imgs.map((img, i) => (
                                                                            <div key={i} onClick={() => setFullScreenImage(img)} className="shrink-0 block cursor-pointer" title="Click to view full image">
                                                                                <img src={img} alt={`Attachment ${i+1}`} className="w-8 h-8 object-cover rounded shadow-sm border border-slate-200 hover:opacity-80 transition-opacity" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            } catch (e) {
                                                                return <span className="text-[12px] text-slate-400">Error</span>;
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-right">
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[12px] transition-all"
                                                            onClick={() => handleDeleteFeedback(item.id)}
                                                            title="Delete Feedback"
                                                        >
                                                            <Trash2 className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800  shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldAlert className="text-[#0078d4]" size={18} />
                                    Manage Employee Role
                                </h2>
                                <button onClick={() => setEditingEmp(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700  rounded-[12px] transition-all">
                                    <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Editing <span className="font-bold text-slate-700 dark:text-slate-300">{editingEmp.empName || editingEmp.emp_Name}</span> ({editingEmp.empCode || editingEmp.emp_Code})</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Employee Info Card */}
                            <div className="bg-slate-50 dark:bg-slate-700/50  p-4 border border-slate-200 dark:border-slate-600 flex items-center gap-3">
                                <div className="w-10 h-10  bg-[#0078d4]/10 text-[#0078d4] flex items-center justify-center font-bold text-sm rounded-[12px] shrink-0">
                                    {(editingEmp.empName || editingEmp.emp_Name || 'U')[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{editingEmp.empName || editingEmp.emp_Name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{editingEmp.empCode || editingEmp.emp_Code} • Current Role: {systemRoles.find(r => r.id === (editingEmp.role || editingEmp.userRole_Id))?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Role Level Select (Button Group like Role Features) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Role Level</label>
                                <div className="flex flex-wrap gap-2">
                                    {systemRoles.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={`px-3 py-1.5  text-xs font-bold rounded-[12px] transition-all ${selectedRoleId === role.id
                                                ? 'bg-[#0078d4] text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {role.name} ({role.id})
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">ID 99 = Super Admin portal access &bull; ID 1 = Tenant configuration access</p>
                            </div>

                            {/* Member Group Select (Button Group) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Member Group</label>
                                <div className="flex flex-wrap gap-2">
                                    {userGroups.map(g => (
                                        <button
                                            key={g.group_Id}
                                            onClick={() => setSelectedGroupName(g.group_Name)}
                                            className={`px-3 py-1.5  text-xs font-bold rounded-[12px] transition-all ${selectedGroupName === g.group_Name
                                                ? 'bg-[#0078d4] text-white shadow-sm'
                                                : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {g.group_Name}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-snug">Maps user to access control matrices defined in Master settings.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/80 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setEditingEmp(null)}
                                className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[#0078d4] text-slate-600 dark:text-slate-300 text-xs font-bold  rounded-[12px] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInitiateUpdateRole}
                                disabled={savingRole}
                                className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold  shadow-md rounded-[12px] transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                            >
                                {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                                {savingRole ? 'Saving...' : 'Save Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Details View Modal */}
            {selectedEmployeeView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800  shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col font-sans">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-[12px] shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12  bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Details</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedEmployeeView.emp_Name || selectedEmployeeView.empName || 'N/A'} ({selectedEmployeeView.emp_Code || selectedEmployeeView.empCode})</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployeeView(null)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700  rounded-[12px] transition-all">
                                <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-800/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries({
                                    ...selectedEmployeeView,
                                    'PASSWORD': selectedEmployeeView.pass_Word || selectedEmployeeView.password || selectedEmployeeView.Pass_Word || '•••••••• (Encrypted by Backend)'
                                }).map(([key, value]) => (
                                    <div key={key} className="bg-white dark:bg-slate-700 p-4  dark:border-slate-600 shadow-sm flex flex-col justify-center">
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white dark:bg-slate-800  shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 ">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900 dark:text-white">Select Target Scope</h3>
                            <button onClick={() => setShowPermTargetModal(false)} className="w-8 h-8 flex items-center justify-center  text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] transition-colors">
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
                                        className="w-full pl-9 pr-24 p-2 border border-slate-300 dark:border-slate-600  text-sm bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] rounded-[12px] transition-all"
                                    />
                                    <button
                                        onClick={() => setPermEmpSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-[#0078d4] hover:bg-[#005a9e] text-white text-[11px] font-bold uppercase tracking-wider  rounded-[12px] transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>

                                    {permEmpSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white dark:bg-slate-700 dark:border-slate-600  shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                            <div
                                                onClick={() => {
                                                    setSelectedPermEmployee('');
                                                    setPermEmpSearchText('-- All Employees (Global) --');
                                                    setPermEmpSearchTriggered(false);
                                                    setSelectedPermCompany('');
                                                    setPermCompSearchText('-- All Companies (Global) --');
                                                }}
                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer rounded-[12px] transition-all bg-[#0078d4]/5 text-[#0078d4] font-bold hover:bg-[#0078d4]/10"
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
                                                                    className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer rounded-[12px] transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium"
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
                                        className="w-full pl-9 pr-24 p-2 border border-slate-300 dark:border-slate-600  text-sm bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] rounded-[12px] transition-all"
                                    />
                                    <button
                                        onClick={() => setPermCompSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-[#0078d4] hover:bg-[#005a9e] text-white text-[11px] font-bold uppercase tracking-wider  rounded-[12px] transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>

                                    {permCompSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white dark:bg-slate-700 dark:border-slate-600  shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                            <div
                                                onClick={() => {
                                                    setSelectedPermCompany('');
                                                    setPermCompSearchText('-- All Companies (Global) --');
                                                    setPermCompSearchTriggered(false);
                                                }}
                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer rounded-[12px] transition-all bg-[#0078d4]/5 text-[#0078d4] font-bold hover:bg-[#0078d4]/10"
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
                                                                className="p-3 border-b border-slate-100 dark:border-slate-600 text-sm cursor-pointer rounded-[12px] transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium"
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

                            <button onClick={() => setShowPermTargetModal(false)} className="w-full py-3 mt-4 bg-[#0078d4] hover:bg-[#005a9e] text-white text-sm font-bold uppercase tracking-wider  shadow-md rounded-[12px] transition-all active:scale-[0.98] rounded-[12px] shrink-0">
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

            {/* Full Screen Image Modal */}
            {fullScreenImage && (
                <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-[12px] p-2 transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <img src={fullScreenImage} alt="Full screen preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-[12px]" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* AI Chatbot Trigger Button */}
            {!showAIChatbot && (
                <div className="fixed bottom-6 right-6 z-[9900] group">
                    <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-25"></div>
                    <button 
                        onClick={() => setShowAIChatbot(true)}
                        className="relative w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:scale-110 transition-all border border-slate-100"
                        title="Open Onimta Intelligence"
                    >
                        <AIAsterisk size={28} />
                    </button>
                </div>
            )}

            {/* AI Chatbot Component */}
            <AdminAIChatbot isOpen={showAIChatbot} onClose={() => setShowAIChatbot(false)} />
        </div>
    );
};

export default SuperAdminDashboard;
