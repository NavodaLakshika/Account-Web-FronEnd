import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';
import toast from 'react-hot-toast';
import { showSuccessToast } from '../utils/toastUtils';
import api from '../services/api';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
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
    Sparkles,
    Plus
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
import DatabaseAdminBoard from '../components/Admin/DatabaseAdminBoard';
import EmployeeMessageDropdown from '../components/Admin/EmployeeMessageDropdown';
import AdminAIChatbot from '../components/modals/AdminAIChatbot';
import AIAsterisk from '../components/AIAsterisk';
import AnimatedBackground from '../components/AnimatedBackground';
import SuperAdminSettingsModal from '../components/modals/SuperAdminSettingsModal';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('saDefaultView') || 'Dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmps, setExpandedEmps] = useState({});
    
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const [currentUserCode, setCurrentUserCode] = useState('');

    // Flat Lists State
    const [allCompanies, setAllCompanies] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [stats, setStats] = useState({ totalAdmins: 0, totalCompanies: 0, totalEmployees: 0, activeSubscriptions: 0 });

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('saDarkMode');
        return saved ? saved === 'true' : true; // Default to Dark Mode for Super Admin
    });
    
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [animationsEnabled, setAnimationsEnabled] = useState(() => {
        const saved = localStorage.getItem('saAnimationsEnabled');
        return saved ? saved === 'true' : true;
    });
    const [compactMode, setCompactMode] = useState(() => {
        const saved = localStorage.getItem('saCompactMode');
        return saved ? saved === 'true' : false;
    });
    const [sessionTimeout, setSessionTimeout] = useState(() => {
        return localStorage.getItem('saSessionTimeout') || 'never';
    });
    const [defaultView, setDefaultView] = useState(() => {
        return localStorage.getItem('saDefaultView') || 'Dashboard';
    });
    const [autoRefresh, setAutoRefresh] = useState(() => {
        const saved = localStorage.getItem('saAutoRefresh');
        return saved ? saved === 'true' : false;
    });
    const [showAIChatbot, setShowAIChatbot] = useState(false);
    const [showAITyping, setShowAITyping] = useState(false);
    const [aiTypingText, setAiTypingText] = useState('');

    const handleAIAction = (actionKey) => {
        setShowAIChatbot(false);
        const menuMap = {
            'dashboard': 'Dashboard',
            'companies': 'Companies',
            'employees': 'Employees',
            'roles': 'Role Features',
            'reports': 'Reports',
            'engagement': 'Engagement',
            'subscriptions': 'Subscriptions',
            'plans': 'Subscriptions',
            'pricing': 'Subscriptions',
            'database': 'Database',
            'backup': 'Database',
            'security': 'Security Audit',
            'audit': 'Security Audit',
            'integrations': 'Integrations',
            'feedback': 'User Feedback',
            'reviews': 'Engagement',
            'ads': 'Engagement',
            'logs': 'Dashboard',
            'config': 'Dashboard',
            'settings': 'Dashboard',
            'messaging': 'Employees',
            'sms': 'Employees',
            'resets': 'Dashboard',
            'stats': 'Dashboard',
        };
        const menu = menuMap[actionKey];
        if (menu) setActiveMenu(menu);
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('saDarkMode', darkMode);
    }, [darkMode]);

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

    // Profile Menu State
    const [showProfileMenu, setShowProfileMenu] = useState(false);



    // Role Permissions Editor State
    const [selectedRole, setSelectedRole] = useState(2); // Default to Accountant
    const [systemRoles, setSystemRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);

    
    // Create Role State
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [creatingRole, setCreatingRole] = useState(false);
    const [permSearch, setPermSearch] = useState('');
    const [seedingFunctions, setSeedingFunctions] = useState(false);

    // Employee Detail View State
    const [selectedEmployeeView, setSelectedEmployeeView] = useState(null);

    // User Role Management State
    const [editingUserRole, setEditingUserRole] = useState(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDesc, setEditRoleDesc] = useState('');
    const [savingUserRole, setSavingUserRole] = useState(false);

    // Company Detail View State
    const [selectedCompanyView, setSelectedCompanyView] = useState(null);

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
    const [showSystemLogReport, setShowSystemLogReport] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);// Delete flow state (confirm → password → execute)
    const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
    const [deletePasswordInput, setDeletePasswordInput] = useState('');
    const [pendingDeleteAction, setPendingDeleteAction] = useState(null);

    // Save Permissions flow state
    const [showSavePermissionsPasswordModal, setShowSavePermissionsPasswordModal] = useState(false);
    const [savePermissionsPasswordInput, setSavePermissionsPasswordInput] = useState('');

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

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchData();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    useEffect(() => {
        if (sessionTimeout === 'never') return;
        const timeoutMs = parseInt(sessionTimeout) * 60 * 1000;
        if (isNaN(timeoutMs)) return;
        let timeoutId;
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }, timeoutMs);
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        resetTimer();
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, [sessionTimeout, navigate]);

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
                api.get('/SuperAdmin/module-usage').catch(() => ({ data: [] })),
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
        if (!autoRefresh) return;
        const intervalId = setInterval(() => {
            fetchAdminData();
            fetchSystemRoles();
        }, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [autoRefresh]);

    useEffect(() => {
        if (!sessionTimeout || sessionTimeout.toString().toLowerCase() === 'never') return;
        
        const timeoutMs = parseInt(sessionTimeout) * 60 * 1000;
        let timeoutId;
        
        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleLogout();
            }, timeoutMs);
        };
        
        resetTimeout();
        
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleUserActivity = () => {
            resetTimeout();
        };

        events.forEach(event => {
            window.addEventListener(event, handleUserActivity);
        });

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [sessionTimeout]);

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

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            setAlertConfig({ isOpen: true, title: 'Validation Error', message: 'Role Name is required.', variant: 'warning' });
            return;
        }
        setCreatingRole(true);
        try {
            await api.post('/UserGroup/create', { Group_Name: newRoleName, Description: newRoleDescription });
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Role created successfully.', variant: 'success' });
            setShowCreateRoleModal(false);
            setNewRoleName('');
            setNewRoleDescription('');
            await fetchSystemRoles();
            await fetchAdminData();
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to create role.', variant: 'danger' });
        } finally {
            setCreatingRole(false);
        }
    };

    const fetchRolePermissions = async (roleId) => {
        setLoadingPermissions(true);
        try {
            const res = await api.get('/UserRole/system-permissions', { params: { userRoleId: roleId } });
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
        setSavePermissionsPasswordInput('');
        setShowSavePermissionsPasswordModal(true);
    };

    const handleSavePermissions = async () => {
        if (!savePermissionsPasswordInput) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Super Admin password is required to save role permissions.',
                variant: 'warning'
            });
            return;
        }
        setShowSavePermissionsPasswordModal(false);
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

    const handleToggleEmployeeLock = (e, empCode, isCurrentlyLocked) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: isCurrentlyLocked ? 'Unlock Employee' : 'Lock Employee',
            message: `Are you sure you want to ${isCurrentlyLocked ? 'unlock' : 'lock'} employee ${empCode}?`,
            loading: false,
            confirmText: isCurrentlyLocked ? 'Yes, Unlock' : 'Yes, Lock',
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
            } else if (action.type === 'userrole') {
                await api.delete(`/UserGroup/delete/${action.roleId}`);
                showSuccessToast('User role deleted successfully.');
                await fetchAdminData();
                await fetchSystemRoles();
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

    const handleDeleteUserRole = (e, roleId) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Delete User Role',
            message: `Are you sure you want to delete role ID ${roleId}? This action cannot be undone and may affect users assigned to this role.`,
            loading: false,
            onConfirm: () => {
                closeConfirm();
                setPendingDeleteAction({ type: 'userrole', roleId });
                setDeletePasswordInput('');
                setShowDeletePasswordModal(true);
            }
        });
    };

    const handleUpdateUserRole = async () => {
        if (!editRoleName.trim()) {
            setAlertConfig({ isOpen: true, title: 'Validation Error', message: 'Role Name is required.', variant: 'warning' });
            return;
        }
        setSavingUserRole(true);
        try {
            await api.put(`/UserGroup/update/${editingUserRole.group_Id}`, { Group_Name: editRoleName, Description: editRoleDesc });
            setAlertConfig({ isOpen: true, title: 'Success', message: 'User role updated successfully.', variant: 'success' });
            setEditingUserRole(null);
            await fetchAdminData();
            await fetchSystemRoles();
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to update user role.', variant: 'warning' });
        } finally {
            setSavingUserRole(false);
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
        { name: 'Reports', icon: FileText },
        { name: 'Engagement', icon: Megaphone },
        { name: 'Subscriptions', icon: CalendarClock },
        { name: 'Database', icon: Database },
        { name: 'Security Audit', icon: ShieldCheck },
        { name: 'Integrations', icon: Puzzle },
        { name: 'User Feedback', icon: MessageSquare }
    ];

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''} ${compactMode ? 'sa-compact-mode' : ''}`}>
            <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans h-screen flex overflow-hidden">
                <AnimatedBackground isPaused={!animationsEnabled} />
            {/* Sidebar */}
            <aside id="tour-sidebar" className={`relative overflow-hidden group bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-gray-800 shadow-[4px_0_15px_rgba(0,0,0,0.2)] flex flex-col h-full hidden md:flex transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-[80px]' : 'w-[80px] hover:w-[260px]'} z-40 ${showAIChatbot ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                    <AnimatedBackground isPaused={!animationsEnabled} />
                </div>
                
                <div className={`relative z-10 flex items-center border-b border-slate-200 dark:border-gray-800/60 h-20 pl-[24px]`}>
                    <div className="flex items-center w-full overflow-hidden">
                        <div className="w-[32px] flex justify-center shrink-0">
                            <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-10 w-auto object-contain rounded-[10px]" />
                        </div>
                        <div className={`transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap flex flex-col justify-center ml-3 ${sidebarCollapsed ? 'hidden' : ''}`}>
                            <h1 className="text-[18px] font-bold text-slate-800 dark:text-white tracking-tight leading-none mt-1">Accounts</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold leading-tight mt-1">Super Admin</p>
                        </div>
                    </div>
                </div>

                <nav className="relative z-10 flex-1 py-6 overflow-y-auto overflow-x-hidden no-scrollbar menu-content">
                    <ul className="flex flex-col w-full">
                        {menuItems.map((item) => (
                            <li key={item.name} className="w-[90%] mb-[20px]">
                                <button
                                    onClick={() => setActiveMenu(item.name)}
                                    className={`w-full flex items-center transition-all duration-300 pl-[24px] py-[12px] rounded-r-[50px] ${activeMenu === item.name
                                        ? 'bg-slate-50 dark:bg-[#0c0c0c] text-slate-800 dark:text-white shadow-md'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-[#0c0c0c] hover:text-slate-800 dark:text-white'
                                        }`}
                                    title={sidebarCollapsed ? item.name : undefined}
                                >
                                    <div className="w-[32px] flex justify-center shrink-0">
                                        <item.icon className={`w-[22px] h-[22px] transition-colors ${activeMenu === item.name ? 'text-[#3b82f6]' : 'text-slate-500 dark:text-slate-400'}`} />
                                    </div>
                                    <span className={`transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap font-medium text-[14.5px] ml-3 ${sidebarCollapsed ? 'hidden' : ''}`}>
                                        {item.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/30 backdrop-blur-sm dark:bg-slate-100 dark:bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl animate-in slide-in-from-left duration-200">
                        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-8 w-auto object-contain" />
                                <div>
                                    <h1 className="text-[16px] font-bold text-[#393a3d] dark:text-slate-800 dark:text-white tracking-tight leading-none">Accounts</h1>
                                    <p className="text-[10px] text-[#6b6c72] dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold leading-tight">Super Admin</p>
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
                                    <item.icon className={`w-[18px] h-[18px] ${activeMenu === item.name ? 'text-[#0078d4]' : 'text-slate-500 dark:text-slate-400'}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main id="tour-main-content" className={`flex-1 flex flex-col h-full overflow-hidden transition-opacity duration-300 ${showAIChatbot ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                {/* Topbar */}
                <header className="z-50 bg-white dark:bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center justify-between px-6 h-14">
                        {/* Left: Branding */}
                        <div className="flex items-center gap-3 rounded-[12px] shrink-0">
                            {/* <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-md" /> */}
                        </div>

                        {/* Center: Search */}
                        <div id="tour-topbar-search" className="relative hidden md:block w-[600px]">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 " />
                            <input
                                type="text"
                                placeholder="Search employees or companies..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-[#0d1117]/80 hover:bg-slate-200 dark:hover:bg-black rounded-[5px] text-[13px] font-medium text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-600 border border-slate-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="relative p-2 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-[12px] transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-[18px] h-[18px]" />
                            </button>
                            <button
                                onClick={() => setDarkMode(prev => !prev)}
                                className="relative p-2 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-[12px] transition-colors"
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                            </button>
                            <div id="tour-topbar-messages" className="relative">
                                <button
                                    className="relative p-2 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-[12px] transition-colors"
                                    onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                                >
                                    <MessageSquare className="w-[18px] h-[18px]" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white dark:border-[#161b22] rounded-full"></span>
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
                                    className="relative p-2 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-[12px] transition-colors"
                                    onClick={() => setShowResets(!showResets)}
                                >
                                    <Bell className="w-[18px] h-[18px]" />
                                    {pendingResets.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border border-white dark:border-[#161b22] rounded-full"></span>
                                    )}
                                </button>

                                {showResets && createPortal(
                                    <div className="fixed inset-0 z-[9999] bg-black/20 animate-in fade-in duration-200" onClick={() => setShowResets(false)}>
                                        <div 
                                            className="absolute top-6 bottom-6 right-6 w-1/4 min-w-[320px] bg-white dark:bg-[#1e293b]/80 backdrop-blur-xl border border-slate-200 dark:border-[#334155] border-l-[6px] border-l-amber-500 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="p-5 border-b border-slate-200 dark:border-[#334155] bg-transparent">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                                                        <Bell size={18} className="text-amber-500" />
                                                        Password Recovery Alerts
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded">{pendingResets.length}</span>
                                                        <button onClick={() => setShowResets(false)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors">
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-3 no-scrollbar bg-transparent">
                                                {pendingResets.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-500 text-sm mt-10">
                                                        No pending password resets.
                                                    </div>
                                                ) : (
                                                    pendingResets.map(req => (
                                                        <div key={req.empCode} className="p-4 mb-2 bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-[#334155] hover:border-amber-500/50 rounded transition-all shadow-sm">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{req.empName}</p>
                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{req.empCode}</p>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Action Req</p>
                                                            </div>
                                                            <div className="bg-white dark:bg-[#0f172a]/80 p-2.5 rounded border border-slate-200 dark:border-[#334155]/50 flex items-center justify-between">
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
                                                                    className="text-amber-500 hover:text-amber-400 text-xs font-bold uppercase tracking-wider px-2 py-1 hover:bg-amber-500/10 rounded transition-colors"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative flex items-center gap-2 pl-3 border-l border-gray-700 ml-1">
                                <button 
                                    onClick={() => setShowProfileMenu(prev => !prev)}
                                    className="w-[28px] h-[28px] bg-blue-600 text-white flex items-center justify-center font-bold text-[14px] shadow-sm rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none"
                                >
                                    A
                                </button>
                                
                                {showProfileMenu && (
                                    <>
                                        {/* Invisible overlay to close dropdown */}
                                        <div className="fixed inset-0 z-[90]" onClick={() => setShowProfileMenu(false)} />
                                        
                                        <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-2xl rounded-none z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0f172a]/50 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center font-bold text-lg rounded-none shadow-sm shrink-0">
                                                    A
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">Super Admin</h3>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">admin@accounts.lk</p>
                                                </div>
                                            </div>
                                            
                                            <div className="p-2">
                                                <div className="px-3 py-2">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System Access</p>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-500 dark:text-slate-400">Role ID</span>
                                                            <span className="font-bold text-slate-800 dark:text-white bg-white dark:bg-[#0f172a] px-1.5 py-0.5 border border-slate-200 dark:border-[#334155]">99</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-500 dark:text-slate-400">Portal</span>
                                                            <span className="font-bold text-slate-800 dark:text-white">Full Access</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="h-px bg-[#334155] my-2" />
                                                
                                                <button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs font-bold text-left"
                                                >
                                                    <LogOut className="w-[14px] h-[14px]" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
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
                            <div className="flex flex-col mb-6 animate-in fade-in slide-in-from-bottom-1 duration-300 relative z-10">
                                <h1 className="text-[42px] font-mono text-slate-800 dark:text-white leading-tight tracking-tight drop-shadow-sm">
                                    {(() => {
                                        const h = new Date().getHours();
                                        if (h < 12) return 'Good Morning';
                                        if (h < 18) return 'Good Afternoon';
                                        return 'Good Evening';
                                    })()}, Admin
                                </h1>
                                <p className="text-[15px]  text-slate-500 dark:text-slate-400 mt-1">
                                    Here's your system overview for {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Metric Card 1 */}
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-l-[6px] border-l-blue-500 p-5 shadow-sm hover:shadow-md rounded-none transition-all flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Employees</p>
                                        </div>
                                        <div className="w-8 h-8 bg-blue-500/10 rounded-none flex items-center justify-center border border-blue-500/20">
                                            <Users className="w-4 h-4 text-blue-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{hierarchy.length}</span>
                                        <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded-none uppercase tracking-wider">Active</span>
                                    </div>
                                </div>

                                {/* Metric Card 2 */}
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-l-[6px] border-l-emerald-500 p-5 shadow-sm hover:shadow-md rounded-none transition-all flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Companies</p>
                                        </div>
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-none flex items-center justify-center border border-emerald-500/20">
                                            <Building2 className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{totalCompanies}</span>
                                        <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-1 rounded-none uppercase tracking-wider">Registered</span>
                                    </div>
                                </div>

                                {/* Metric Card 3 */}
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-l-[6px] border-l-amber-500 p-5 shadow-sm hover:shadow-md rounded-none transition-all flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Entities</p>
                                        </div>
                                        <div className="w-8 h-8 bg-amber-500/10 rounded-none flex items-center justify-center border border-amber-500/20">
                                            <Database className="w-4 h-4 text-amber-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{hierarchy.length + totalCompanies}</span>
                                        <span className="text-[10px] font-bold text-white bg-amber-600 px-2 py-1 rounded-none uppercase tracking-wider">Combined</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Table Card */}
                            <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] overflow-hidden mb-6 rounded-none">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-[8px] border border-blue-400/30">
                                            <LayoutDashboard className="w-4 h-4 text-blue-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">System Overview</h2>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Employee hierarchy & company assignments</p>
                                        </div>
                                    </div>
                                    <div className="relative w-[200px] md:w-[250px]">
                                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search overview..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white rounded-[6px] text-[12px] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1e293b]/50">
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Employee</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Role</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Last Login</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Login Count</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Companies</th>
                                                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHierarchy.map((emp) => (
                                                <React.Fragment key={emp.empCode}>
                                                    <tr className="border-b border-slate-200 dark:border-white/5 hover:bg-white dark:bg-[#1e293b]/50 transition-colors cursor-pointer group" onClick={() => toggleEmp(emp.empCode)}>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-sm shadow-sm rounded-none border border-slate-300 dark:border-slate-600 shrink-0">
                                                                    {emp.empName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-slate-800 dark:text-white">{emp.empName}</p>
                                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-0.5">{emp.empCode} <span className="text-slate-500 dark:text-slate-400 mx-1">•</span> {emp.email || 'No Email'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-none ${emp.role === 99 ? 'bg-indigo-600 text-white border border-indigo-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600'}`}>
                                                                {emp.role === 99 ? 'Super Admin' : `Role ${emp.role}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className="text-[13px] font-medium text-slate-800 dark:text-white">
                                                                {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-slate-500 dark:text-slate-400">Never</span>}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <span className="text-[13px] font-bold text-slate-800 dark:text-white">{emp.loginCount || 0}</span>
                                                        </td>
                                                        <td className="py-3.5 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white flex items-center justify-center text-[11px] font-bold rounded-none">
                                                                    {emp.companies.length}
                                                                </span>
                                                                {expandedEmps[emp.empCode]
                                                                    ? <ChevronDown className="w-[18px] h-[18px] text-slate-800 dark:text-white" />
                                                                    : <ChevronRight className="w-[18px] h-[18px] text-slate-800 dark:text-white" />}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 shadow-sm rounded-none transition-all flex items-center gap-1.5"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingEmp(emp);
                                                                        setSelectedRoleId(emp.role);
                                                                        setSelectedGroupName(emp.memberId || 'Administrators');
                                                                    }}
                                                                    title="Edit User Role"
                                                                >
                                                                    <Edit className="w-[14px] h-[14px]" /> Edit
                                                                </button>
                                                                <button
                                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 shadow-sm rounded-none transition-all flex items-center gap-1.5"
                                                                    onClick={(e) => handleDeleteEmployee(e, emp.empCode)}
                                                                    title="Delete Employee"
                                                                >
                                                                    <Trash2 className="w-[14px] h-[14px]" /> Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Nested Companies */}
                                                    {expandedEmps[emp.empCode] && (
                                                        <tr className="bg-white dark:bg-[#1e293b]/50 backdrop-blur-sm">
                                                            <td colSpan={6} className="p-0 border-b border-slate-200 dark:border-[#334155]">
                                                                <div className="py-4 px-6">
                                                                    <div className="border-l-2 border-slate-200 dark:border-white/20 ml-3 pl-6 space-y-2">
                                                                        {emp.companies.length === 0 ? (
                                                                            <p className="text-[13px] text-slate-500 dark:text-slate-400 italic py-2">No companies assigned.</p>
                                                                        ) : (
                                                                            emp.companies.map((comp, idx) => (
                                                                                <div key={comp.companyCode} onClick={() => openTransactionsModal(comp)} className="group flex items-center justify-between p-3 hover:bg-slate-200 dark:bg-white/10 hover:shadow-sm border border-transparent hover:border-white/20 rounded-none transition-all cursor-pointer">
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-none transition-colors">
                                                                                            <Building2 className="w-[18px] h-[18px] text-slate-800 dark:text-white" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-[13px] font-bold text-slate-800 dark:text-white transition-colors">{comp.companyName || 'Unknown Company'}</p>
                                                                                            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 mt-0.5">{comp.companyCode}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-0.5">Transactions</span>
                                                                                            <span className="text-[13px] font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded-none">{comp.transactions}</span>
                                                                                        </div>
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                className={`opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-none transition-all flex items-center gap-1.5 ${comp.accDesable === 1 ? 'bg-red-600 hover:bg-red-700 border border-red-700' : 'bg-orange-500 hover:bg-orange-600 border border-orange-600'}`}
                                                                                                onClick={(e) => { e.stopPropagation(); handleToggleCompanyLock(e, comp.companyCode); }}
                                                                                                title={comp.accDesable === 1 ? "Unlock Company" : "Lock Company"}
                                                                                            >
                                                                                                {comp.accDesable === 1 ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                                                                                {comp.accDesable === 1 ? "Unlock" : "Lock"}
                                                                                            </button>
                                                                                            <button
                                                                                                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 shadow-sm rounded-none transition-all flex items-center gap-1.5"
                                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.companyCode, emp.empCode); }}
                                                                                                title="Remove Company Access"
                                                                                            >
                                                                                                <Trash2 className="w-[14px] h-[14px]" /> Remove
                                                                                            </button>
                                                                                        </div>
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
                        <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] overflow-hidden mb-6 rounded-none">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/20 flex items-center justify-center rounded-[8px] border border-emerald-400/30">
                                        <Building2 className="w-4 h-4 text-emerald-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">All Registered Companies</h2>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Manage all company records</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-[6px]">{allCompanies.length} Companies</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1e293b]/50">
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Company Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Company Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Phone</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allCompanies.filter(c =>
                                            c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            c.code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(comp => (
                                            <tr key={comp.code} onClick={() => setSelectedCompany(comp)} className="border-b border-slate-200 dark:border-white/5 hover:bg-white dark:bg-[#1e293b]/50 cursor-pointer transition-colors group">
                                                <td className="py-3.5 px-6 font-mono text-[13px] text-slate-800 dark:text-white font-bold">{comp.code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-800 dark:text-white font-bold">{comp.comp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-600 dark:text-slate-300 font-medium">{comp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-600 dark:text-slate-300 font-medium">{comp.phone || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-none transition-all flex items-center gap-1.5 ${comp.acc_Desable === 1 ? 'bg-red-600 hover:bg-red-700 border border-red-700' : 'bg-orange-500 hover:bg-orange-600 border border-orange-600'}`}
                                                            onClick={(e) => handleToggleCompanyLock(e, comp.code)}
                                                            title={comp.acc_Desable === 1 ? "Unlock Company" : "Lock Company"}
                                                        >
                                                            {comp.acc_Desable === 1 ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                                            {comp.acc_Desable === 1 ? "Unlock" : "Lock"}
                                                        </button>
                                                        <button
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 shadow-sm rounded-none transition-all flex items-center gap-1.5"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.code, null); }}
                                                            title="Delete Company"
                                                        >
                                                            <Trash2 className="w-[14px] h-[14px]" /> Delete
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
                        <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] overflow-hidden mb-6 rounded-none">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-[8px] border border-blue-400/30">
                                        <Users className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">All Employees</h2>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Manage employee accounts & roles</p>
                                    </div>
                                </div>
                                <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-[6px]">{allEmployees.length} Employees</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1e293b]/50">
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Emp Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Employee Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap">Role</th>
                                            <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEmployees.filter(e =>
                                            e.emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            e.emp_Code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(emp => (
                                            <tr key={emp.emp_Code} onClick={() => setSelectedEmployeeView(emp)} className="border-b border-slate-200 dark:border-white/5 hover:bg-white dark:bg-[#1e293b]/50 cursor-pointer transition-colors group">
                                                <td className="py-3.5 px-6 font-mono text-[13px] text-slate-800 dark:text-white font-bold">{emp.emp_Code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-800 dark:text-white font-bold">{emp.emp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-600 dark:text-slate-300 font-medium">{emp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-none ${emp.userRole_Id === 99 ? 'bg-indigo-600 text-white border border-indigo-700' : 'bg-[#0078d4] text-white border border-[#005a9e]'}`}>
                                                        {systemRoles.find(r => r.id === emp.userRole_Id || r.id?.toString() === emp.userRole_Id?.toString())?.name || (emp.userRole_Id === 99 ? 'Super Admin' : `Role ${emp.userRole_Id}`)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 shadow-sm rounded-none transition-all flex items-center gap-1.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEmp(emp);
                                                                setSelectedRoleId(emp.userRole_Id);
                                                                setSelectedGroupName(emp.member_Id || 'Administrators');
                                                            }}
                                                            title="Edit Employee Role"
                                                        >
                                                            <Edit className="w-[14px] h-[14px]" /> Edit
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-none transition-all flex items-center gap-1.5 ${emp.acc_Desable === "1" || emp.accDesable === "1" ? 'bg-red-600 hover:bg-red-700 border border-red-700' : 'bg-orange-500 hover:bg-orange-600 border border-orange-600'}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleEmployeeLock(e, emp.empCode || emp.emp_Code, (emp.acc_Desable === "1" || emp.accDesable === "1")); }}
                                                            title={(emp.acc_Desable === "1" || emp.accDesable === "1") ? "Unlock Employee" : "Lock Employee"}
                                                        >
                                                            {(emp.acc_Desable === "1" || emp.accDesable === "1") ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                                            {(emp.acc_Desable === "1" || emp.accDesable === "1") ? "Unlock" : "Lock"}
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-none transition-all flex items-center gap-1.5 ${emp.userRole_Id == 99 ? 'bg-gray-500 cursor-not-allowed border-gray-600' : 'bg-red-600 hover:bg-red-700 border border-red-700'}`}
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (emp.userRole_Id != 99) handleDeleteEmployee(e, emp.emp_Code); 
                                                            }}
                                                            title={emp.userRole_Id == 99 ? "Super Admin cannot be deleted" : "Delete Employee"}
                                                            disabled={emp.userRole_Id == 99}
                                                        >
                                                            <Trash2 className="w-[14px] h-[14px]" /> Delete
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
                        <DatabaseAdminBoard />
                    )}

                    {/* USER ROLES VIEW REMOVED */}

                    {/* ROLE FEATURES VIEW */}
                    {activeMenu === 'Role Features' && (
                        <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-slate-50 dark:bg-[#0c0c0c]/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-none">
                                        <ShieldAlert className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">System Role Permission Master Editor</h2>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Configure default enabled/disabled features for each user role</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-start">
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions || loadingPermissions}
                                        className="px-4 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-none transition-all flex items-center gap-2"
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
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm rounded-none transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <CheckCircle size={14} />
                                        Allow All
                                    </button>
                                    <button
                                        onClick={handleInitiateSavePermissions}
                                        disabled={savingPermissions || loadingPermissions || !permissions.length}
                                        className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold shadow-sm rounded-none transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {savingPermissions ? (
                                            <><Loader2 className="animate-spin" size={13} />Saving Changes...</>
                                        ) : (
                                            'Save Role Permissions'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#0c0c0c] p-4 border border-slate-200 dark:border-[#334155] mx-6 flex flex-col gap-4 rounded-none shadow-inner">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-2">Select Role:</span>
                                        {systemRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${selectedRole === role.id
                                                    ? 'bg-[#0078d4] text-white shadow-sm border border-[#0078d4]'
                                                    : 'bg-white dark:bg-[#1e293b]/50 hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setShowCreateRoleModal(true)}
                                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 rounded-none transition-all flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Add Role
                                        </button>
                                        {selectedRole && selectedRole !== 1 && selectedRole !== 99 && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        const group = userGroups.find(g => g.group_Id === selectedRole);
                                                        if(group) {
                                                            setEditingUserRole(group);
                                                            setEditRoleName(group.group_Name);
                                                            setEditRoleDesc(group.description || '');
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 rounded-none transition-all flex items-center gap-1"
                                                >
                                                    <Edit size={12} /> Edit Role
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteUserRole(e, selectedRole)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 rounded-none transition-all flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Delete Role
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search functions..."
                                            value={permSearch}
                                            onChange={e => setPermSearch(e.target.value)}
                                            className="pl-9 pr-4 py-1.5 border border-slate-200 dark:border-white/20 bg-white dark:bg-[#1e293b]/50 text-slate-800 dark:text-white text-xs w-full outline-none focus:border-[#0078d4] focus:bg-slate-200 dark:bg-white/10 rounded-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loadingPermissions ? (
                                <SystemLoader inline message="Fetching role permission matrix..." />
                            ) : !permissions.length ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500 mx-6 border border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#1e293b]/50">
                                    <Database size={40} className="text-slate-600" />
                                    <div className="text-center">
                                        <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-1">No System Functions Found</p>
                                        <p className="text-[11px] text-slate-500 font-medium">The system permission table is empty. Seed default functions to get started.</p>
                                    </div>
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions}
                                        className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-none transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        {seedingFunctions ? (
                                            <><Loader2 className="animate-spin" size={14} />Seeding Functions...</>
                                        ) : (
                                            <><Database size={14} />Seed Default Functions & Reports</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-slate-200 dark:border-[#334155] overflow-hidden mx-6 bg-white dark:bg-[#1e293b]/50 rounded-none shadow-sm relative">
                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                                        <AnimatedBackground isPaused={!animationsEnabled} />
                                    </div>
                                    <div className="relative z-10">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white dark:bg-[#0f172a]/80 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                                                    <th className="px-4 py-3 w-1/3">Function Code</th>
                                                    <th className="px-4 py-3 w-1/2">Description</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
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
                                                        <tr key={`cat-${label}`} className="bg-slate-200/50 dark:bg-black/40 border-b border-white/5">
                                                            <td colSpan={3} className="px-4 py-2.5">
                                                                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-[#0078d4] inline-block"></span>
                                                                    {label}
                                                                    <span className="text-[10px] font-normal text-slate-500 normal-case">({items.length} function{(items.length !== 1) ? 's' : ''})</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                    items.forEach(p => {
                                                        const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
                                                        const desc = p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || code;
                                                        const isAllowed = (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === 'T';
                                                        rows.push(
                                                            <tr key={code} className="hover:bg-white dark:bg-[#1e293b]/50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155] px-2 py-0.5 rounded-none">{code}</span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{desc}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleTogglePermission(code)}
                                                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-none transition-all ${isAllowed
                                                                            ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500'
                                                                            : 'bg-red-600 text-white shadow-sm border border-red-500'
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
                                            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                                                <Search size={16} />
                                                <span className="text-xs font-medium">No functions match your search.</span>
                                            </div>
                                        )}
                                    </div>
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
                        <SecurityAuditBoard
                            allEmployees={allEmployees}
                            allCompanies={allCompanies}
                            hierarchy={hierarchy}
                        />
                    )}

                    {/* INTEGRATIONS VIEW */}
                    {activeMenu === 'Integrations' && (
                        <IntegrationsBoard />
                    )}

                    {/* REPORTS VIEW */}
                    {activeMenu === 'Reports' && (
                        <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center gap-3 bg-slate-50 dark:bg-[#0c0c0c]/50">
                                <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-none">
                                    <FileText className="w-4 h-4 text-blue-300" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Admin Reports</h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">View system-wide reports and analytics</p>
                                </div>
                            </div>
                            <div className="px-6">
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
                        <SubscriptionAdminBoard />
                    )}

                    {/* Create Role Modal */}
            {showCreateRoleModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-none">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
                            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Create New Role</h3>
                            <button onClick={() => setShowCreateRoleModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-white/10 transition-colors rounded-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Role Name *</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    placeholder="e.g. HR Manager"
                                    className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-white dark:bg-[#1e293b]/50 transition-all rounded-none placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newRoleDescription}
                                    onChange={e => setNewRoleDescription(e.target.value)}
                                    placeholder="Optional description"
                                    className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-white dark:bg-[#1e293b]/50 transition-all rounded-none placeholder:text-slate-600"
                                />
                            </div>
                            <div className="mt-4 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowCreateRoleModal(false)}
                                    className="px-5 py-2.5 bg-white dark:bg-[#1e293b]/50 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-[#334155] transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRole}
                                    disabled={creatingRole}
                                    className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all rounded-none flex items-center gap-2 disabled:opacity-50"
                                >
                                    {creatingRole ? (
                                        <><Loader2 className="animate-spin" size={14} /> Creating...</>
                                    ) : (
                                        'Create Role'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

                    {/* ENGAGEMENT VIEW */}
                    {activeMenu === 'Engagement' && (
                        <EngagementAdminBoard />
                    )}

                    {/* USER FEEDBACK VIEW */}
                    {activeMenu === 'User Feedback' && (
                        <div className="bg-white dark:bg-[#0f172a]/50 shadow-inner border border-slate-200 dark:border-[#334155] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-none overflow-hidden mb-6 min-h-[500px]">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-slate-50 dark:bg-[#0c0c0c]/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#0078d4]/20 flex items-center justify-center rounded-none">
                                        <MessageSquare className="w-4 h-4 text-[#0078d4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">User Feedback</h2>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">View and manage feedback submitted from Report Builder</p>
                                    </div>
                                </div>
                                <span className="bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#334155] shadow-inner text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-none">{feedbackData.length} Records</span>
                            </div>
                            
                            <div className="border border-slate-200 dark:border-[#334155] overflow-hidden mx-6 bg-white dark:bg-[#1e293b]/50 rounded-none shadow-sm flex-1 flex flex-col mb-4">
                                <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-[#0c0c0c]/80 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Employee Name</th>
                                            <th className="px-4 py-3">Company</th>
                                            <th className="px-4 py-3">Report Name</th>
                                            <th className="px-4 py-3">Feedback</th>
                                            <th className="px-4 py-3">Images</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbackLoading ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-500 text-[13px] font-medium">Loading feedback...</td>
                                            </tr>
                                        ) : feedbackData.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-500 text-[13px] font-medium">No feedback records found.</td>
                                            </tr>
                                        ) : (
                                            feedbackData.map((item) => (
                                                <tr key={item.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white dark:bg-[#1e293b]/50 transition-colors">
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[13px] text-slate-800 dark:text-gray-200 font-bold">
                                                        {item.employeeName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-500 dark:text-slate-400 font-mono">
                                                        {item.companyId || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                                                        {item.reportName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={item.feedbackText}>
                                                        {item.feedbackText}
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        {(() => {
                                                            try {
                                                                if (!item.images || item.images === '[]') return <span className="text-[12px] text-slate-500">-</span>;
                                                                const imgs = JSON.parse(item.images);
                                                                if (!Array.isArray(imgs) || imgs.length === 0) return <span className="text-[12px] text-slate-500">-</span>;
                                                                return (
                                                                    <div className="flex gap-1.5 overflow-x-auto max-w-[120px] pb-1">
                                                                        {imgs.map((img, i) => (
                                                                            <div key={i} onClick={() => setFullScreenImage(img)} className="shrink-0 block cursor-pointer" title="Click to view full image">
                                                                                <img src={img} alt={`Attachment ${i+1}`} className="w-8 h-8 object-cover rounded shadow-sm border border-slate-200 dark:border-[#334155] hover:opacity-80 transition-opacity" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            } catch (e) {
                                                                return <span className="text-[12px] text-slate-500">Error</span>;
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end">
                                                            <button
                                                                className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-none transition-all bg-red-600 text-white shadow-sm border border-red-500 hover:bg-red-500 flex items-center gap-1"
                                                                onClick={() => handleDeleteFeedback(item.id)}
                                                                title="Delete Feedback"
                                                            >
                                                                <Trash2 size={10} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 font-sans rounded-none">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0f172a]/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <ShieldAlert className="text-blue-400" size={18} />
                                    Manage Employee Role
                                </h2>
                                <button onClick={() => setEditingEmp(null)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-[#334155]/50 transition-all rounded-none">
                                    <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Editing <span className="font-bold text-slate-800 dark:text-white">{editingEmp.empName || editingEmp.emp_Name}</span> ({editingEmp.empCode || editingEmp.emp_Code})</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6 bg-transparent">
                            {/* Employee Info Card */}
                            <div className="bg-white dark:bg-[#0f172a]/50 p-4 border border-slate-200 dark:border-[#334155] flex items-center gap-3 rounded-none">
                                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20 rounded-none">
                                    {(editingEmp.empName || editingEmp.emp_Name || 'U')[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{editingEmp.empName || editingEmp.emp_Name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{editingEmp.empCode || editingEmp.emp_Code} • Current Role: {systemRoles.find(r => r.id === (editingEmp.role || editingEmp.userRole_Id))?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Assign Role</label>
                                <div className="flex flex-wrap gap-2">
                                    {systemRoles.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => {
                                                setSelectedRoleId(role.id);
                                                const matchedGroup = userGroups.find(g => g.group_Name?.toLowerCase() === role.name?.toLowerCase());
                                                setSelectedGroupName(matchedGroup ? matchedGroup.group_Name : role.name);
                                            }}
                                            className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-none ${selectedRoleId === role.id
                                                ? 'bg-blue-600 border-blue-500 text-slate-800 dark:text-white shadow-sm'
                                                : 'bg-white dark:bg-[#0f172a]/50 hover:bg-[#334155]/50 border-slate-200 dark:border-[#334155] hover:border-blue-500/50 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {role.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none">
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                        <span className="font-bold text-slate-600 dark:text-slate-300">Simplified Assignment:</span> Clicking a role automatically assigns both the Role Level (ID {selectedRoleId || '?'}) and maps the user to the correct Member Group (<span className="text-blue-400 font-mono">{selectedGroupName || '?'}</span>).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white dark:bg-[#0f172a]/80 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#334155]">
                            <button
                                onClick={() => setEditingEmp(null)}
                                className="px-5 py-2.5 bg-transparent border border-slate-200 dark:border-[#334155] hover:bg-[#334155]/50 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all rounded-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInitiateUpdateRole}
                                disabled={savingRole}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-800 dark:text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 rounded-none"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col font-sans">
                        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/30 flex items-center justify-center rounded-none">
                                    <Users className="w-6 h-6 text-blue-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Employee Details</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{selectedEmployeeView.emp_Name || selectedEmployeeView.empName || 'N/A'} ({selectedEmployeeView.emp_Code || selectedEmployeeView.empCode})</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployeeView(null)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-slate-200 dark:bg-white/10 rounded-none transition-all">
                                <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-transparent">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries({
                                    ...selectedEmployeeView,
                                    'PASSWORD': selectedEmployeeView.pass_Word || selectedEmployeeView.password || selectedEmployeeView.Pass_Word || '•••••••• (Encrypted by Backend)'
                                })
                                .filter(([key, value]) => typeof value !== 'object' && key !== 'companies' && key !== 'pass_Word' && key !== 'password' && key !== 'Pass_Word')
                                .map(([key, value], index, array) => (
                                    <div key={key} className={`bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] p-4 shadow-sm flex flex-col justify-center rounded-none ${key === 'PASSWORD' && array.length % 2 !== 0 ? 'md:col-span-2' : ''}`}>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{key.replace(/_/g, ' ')}</h3>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white break-all">{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-500 font-normal italic">Empty</span>}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit User Role Modal */}
            {editingUserRole && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-none">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
                            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Edit User Role</h3>
                            <button onClick={() => setEditingUserRole(null)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-white/10 transition-colors rounded-none">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Role Name *</label>
                                <input
                                    type="text"
                                    value={editRoleName}
                                    onChange={e => setEditRoleName(e.target.value)}
                                    placeholder="e.g. HR Manager"
                                    className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-white dark:bg-[#1e293b]/50 transition-all rounded-none placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={editRoleDesc}
                                    onChange={e => setEditRoleDesc(e.target.value)}
                                    placeholder="Optional description"
                                    className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-white dark:bg-[#1e293b]/50 transition-all rounded-none placeholder:text-slate-600"
                                />
                            </div>
                            <div className="mt-4 flex gap-3 justify-end">
                                <button
                                    onClick={() => setEditingUserRole(null)}
                                    className="px-5 py-2.5 bg-white dark:bg-[#1e293b]/50 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-[#334155] transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUserRole}
                                    disabled={savingUserRole}
                                    className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all rounded-none flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingUserRole ? (
                                        <><Loader2 className="animate-spin" size={14} /> Updating...</>
                                    ) : (
                                        'Update Role'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                loading={confirmConfig.loading}
                variant="danger"
                confirmText={confirmConfig.confirmText || "Yes, Delete"}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
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

            {/* Password Confirm Modal for Save Permissions */}
            <AdminVerificationModal
                isOpen={showSavePermissionsPasswordModal}
                onClose={() => setShowSavePermissionsPasswordModal(false)}
                onVerify={handleSavePermissions}
                message="PLEASE CONFIRM YOUR PASSWORD TO SAVE ROLE PERMISSIONS"
                verifyButtonText="VERIFY & SAVE"
                value={savePermissionsPasswordInput}
                onChange={setSavePermissionsPasswordInput}
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

            {/* System Log Report Modal */}
            <SystemLogReportModal
                isOpen={showSystemLogReport}
                onClose={() => setShowSystemLogReport(false)}
            />

            {/* Full Screen Image Modal */}
            {fullScreenImage && (
                <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-6 right-6 text-slate-800 dark:text-white/70 hover:text-slate-800 dark:text-white bg-black/50 hover:bg-black/80 rounded-[12px] p-2 transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <img src={fullScreenImage} alt="Full screen preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-[12px]" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* AI Chatbot Trigger Button */}
            {!showAIChatbot && !showAITyping && (
                <div className="fixed bottom-6 right-6 z-[9900] group">
                    <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-25"></div>
                    <button 
                        onClick={() => {
                            setShowAITyping(true);
                            setAiTypingText('');
                            const fullText = "Hello! I'm ONIMTA Intelligence. How can I assist you today?";
                            let idx = 0;
                            const typeInterval = setInterval(() => {
                                idx++;
                                setAiTypingText(fullText.slice(0, idx));
                                if (idx >= fullText.length) {
                                    clearInterval(typeInterval);
                                    setTimeout(() => {
                                        setShowAITyping(false);
                                        setShowAIChatbot(true);
                                    }, 800);
                                }
                            }, 45);
                        }}
                        className="w-20 h-20 flex items-center justify-center hover:scale-110 transition-all"
                        title="Open Onimta Intelligence"
                    >
                        <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '120%', height: '120%' }} />
                    </button>
                </div>
            )}

            {/* AI Typing Animation Overlay */}
            {showAITyping && (
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-8 max-w-2xl px-8">
                        <div className="w-32 h-32 flex items-center justify-center">
                            <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div className="h-16 flex items-center justify-center">
                            <span className="text-white/90 text-2xl md:text-3xl font-light tracking-wide">
                                {aiTypingText}
                                <span className="animate-pulse ml-0.5 text-indigo-400">|</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Chatbot Component */}
            <AdminAIChatbot isOpen={showAIChatbot} onClose={() => setShowAIChatbot(false)} onAction={handleAIAction} />

            {/* Settings Modal */}
            <SuperAdminSettingsModal 
                isOpen={showSettingsModal} 
                onClose={() => setShowSettingsModal(false)}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                animationsEnabled={animationsEnabled}
                setAnimationsEnabled={setAnimationsEnabled}
                compactMode={compactMode}
                setCompactMode={setCompactMode}
                sessionTimeout={sessionTimeout}
                setSessionTimeout={setSessionTimeout}
                defaultView={defaultView}
                setDefaultView={setDefaultView}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                currentUserCode={currentUserCode}
            />
        </div>
        </div>
    );
};

export default SuperAdminDashboard;












