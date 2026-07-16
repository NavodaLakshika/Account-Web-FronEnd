import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';
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
    Megaphone,
    Lock,
    Unlock,
    Plus
} from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import ConfirmModal from '../components/modals/ConfirmModal';
import AlertModal from '../components/modals/AlertModal';
import AdminVerificationModal from '../components/modals/AdminVerificationModal';
import AdminConfigBoard from '../HomeMaster/AdminConfigBoard';
import SystemAnalyticsBoard from '../HomeMaster/SystemAnalyticsBoard';
import SecurityAuditBoard from '../HomeMaster/SecurityAuditBoard';


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
    const [selectedEmpForCompanies, setSelectedEmpForCompanies] = useState(null);

    // Flat Lists State
    const [allCompanies, setAllCompanies] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [stats, setStats] = useState({ totalAdmins: 0, totalCompanies: 0, totalEmployees: 0, activeSubscriptions: 0 });

    const [showSettingsModal, setShowSettingsModal] = useState(false);
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };
    const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

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
            let hData = hierarchyRes.data || [];
            let cData = compRes.data || [];
            let eData = empRes.data || [];

            // Add mock data for demonstration
            const mockHierarchy = [
                {
                    empCode: 'EMP00003',
                    empName: 'JOHN DOE',
                    email: 'john.doe@company.com',
                    role: 2,
                    lastLogin: '2026-07-14T08:30:00Z',
                    loginCount: 142,
                    department: 'Engineering',
                    status: 'Active',
                    companies: [
                        { companyCode: 'COM002', companyName: 'Global Tech Solutions', transactions: 150 },
                        { companyCode: 'COM003', companyName: 'Apex Innovations', transactions: 45 }
                    ]
                },
                {
                    empCode: 'EMP00004',
                    empName: 'SARAH SMITH',
                    email: 'sarah.s@company.com',
                    role: 1,
                    lastLogin: '2026-07-13T10:15:00Z',
                    loginCount: 89,
                    department: 'Sales',
                    status: 'Suspended',
                    companies: [
                        { companyCode: 'COM004', companyName: 'Nexus Corp', transactions: 210 }
                    ]
                }
            ];

            const mockCompanies = [
                { code: 'COM002', comp_Name: 'Global Tech Solutions', email: 'contact@globaltech.com', phone: '+1 800 555 0199', acc_Desable: 0 },
                { code: 'COM003', comp_Name: 'Apex Innovations', email: 'info@apexinnovations.com', phone: '+1 800 555 0200', acc_Desable: 0 },
                { code: 'COM004', comp_Name: 'Nexus Corp', email: 'support@nexuscorp.com', phone: '+1 800 555 0201', acc_Desable: 1 }
            ];

            const mockEmployees = [
                { emp_Code: 'EMP00003', emp_Name: 'JOHN DOE', email: 'john.doe@company.com', userRole_Id: 2 },
                { emp_Code: 'EMP00004', emp_Name: 'SARAH SMITH', email: 'sarah.s@company.com', userRole_Id: 1 }
            ];

            // Only append mock data if it's not already in the array
            if (!hData.some(h => h.empCode === 'EMP00003')) hData = [...hData, ...mockHierarchy];
            if (!cData.some(c => c.code === 'COM002')) cData = [...cData, ...mockCompanies];
            if (!eData.some(e => e.emp_Code === 'EMP00003')) eData = [...eData, ...mockEmployees];

            setHierarchy(hData);
            setPendingResets(resetsRes.data || []);
            setAllCompanies(cData);
            setAllEmployees(eData);
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
            confirmText: 'Yes, Toggle Lock',
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

        { name: 'User Feedback', icon: MessageSquare }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-['Tahoma'] text-gray-700">
            {/* Sidebar */}
            <aside className="peer fixed left-0 top-0 overflow-hidden group bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex transition-all duration-300 ease-in-out w-[80px] hover:w-[260px] z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="relative z-10 flex items-center border-b border-gray-100 h-[72px] px-[12px] group-hover:px-[20px] transition-all overflow-hidden">
                    <div className="flex items-center w-full">
                        <div className="w-[56px] flex items-center justify-center shrink-0">
                            <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-12 w-12 object-contain" />
                        </div>
                        <div className="flex items-center gap-3 transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap ml-2">
                            <div className="h-8 w-px bg-slate-200" />
                            <div>
                                <h1 className="text-[17px] font-black text-slate-800 tracking-tight leading-none">Accounts</h1>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-tight mt-0.5">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="relative z-10 flex-1 pt-10 pb-4 overflow-y-auto overflow-x-hidden no-scrollbar menu-content">
                    <ul className="flex flex-col w-full space-y-4 px-3">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => { setActiveMenu(item.name); setSelectedEmpForCompanies(null); }}
                                    className={`w-full flex items-center transition-all duration-300 px-3 py-3 rounded-[3px] group/btn ${activeMenu === item.name
                                        ? 'bg-[#0285fd] text-white font-bold shadow-md shadow-blue-500/20'
                                        : 'text-slate-900 hover:bg-[#0285fd] hover:text-white font-bold'
                                        }`}
                                    title={sidebarCollapsed ? item.name : undefined}
                                >
                                    <div className="w-[32px] flex justify-center shrink-0">
                                        <item.icon className={`w-[20px] h-[20px] transition-colors ${activeMenu === item.name ? 'text-white' : 'text-slate-700 group-hover/btn:text-white'}`} />
                                    </div>
                                    <span className="transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap text-[13.5px] ml-2">
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
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-2xl flex flex-col">
                        <div className="h-[72px] flex items-center px-[20px] border-b border-gray-100 shrink-0 overflow-hidden">
                            <div className="flex items-center w-full">
                                <div className="w-[56px] flex items-center justify-center shrink-0">
                                    <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-12 w-12 object-contain" />
                                </div>
                                <div className="flex items-center gap-3 whitespace-nowrap ml-2">
                                    <div className="h-8 w-px bg-slate-200" />
                                    <div>
                                        <h1 className="text-[17px] font-black text-slate-800 tracking-tight leading-none">Accounts</h1>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-tight mt-0.5">Super Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <nav className="flex-1 px-3 pt-10 pb-4 space-y-4 overflow-y-auto no-scrollbar">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => { setActiveMenu(item.name); setSelectedEmpForCompanies(null); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[3px] transition-all text-[13.5px] font-bold group/btn ${activeMenu === item.name
                                        ? 'bg-[#0285fd] text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-900 hover:bg-[#0285fd] hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-[20px] h-[20px] transition-colors ${activeMenu === item.name ? 'text-white' : 'text-slate-700 group-hover/btn:text-white'}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="ml-[80px] peer-hover:ml-[260px] transition-all duration-300 ease-in-out flex flex-col h-screen overflow-hidden">

                {/* Topbar */}
                <header className="bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] shrink-0 relative z-30">
                    <div className="flex items-center justify-between px-8 h-[72px]">
                        {/* Left */}
                        <div className="flex flex-col justify-center flex-1">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors">
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="hidden md:block">
                                    <h1 className="text-[17px] font-bold text-gray-800 tracking-tight leading-none mb-1">
                                        {getGreeting()}, Admin
                                    </h1>
                                    <p className="text-[11px] font-medium text-gray-500">
                                        Here's your system overview for {currentDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Center: Search */}
                        <div className="relative hidden md:block w-full max-w-[600px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search employees or companies..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-[3px] text-[13px] font-bold text-slate-700 placeholder-slate-400 border border-transparent focus:border-[#0285fd] focus:outline-none focus:ring-2 focus:ring-[#0285fd]/20 transition-all"
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="relative w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full transition-all"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <button
                                    className="relative w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full transition-all"
                                    onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                </button>
                                {showMessageDropdown && (
                                    <EmployeeMessageDropdown
                                        allEmployees={allEmployees}
                                        onClose={() => setShowMessageDropdown(false)}
                                    />
                                )}
                            </div>
                            <div className="relative">
                                <button
                                    className="relative w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full transition-all"
                                    onClick={() => setShowResets(!showResets)}
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingResets.length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 border-2 border-white rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {showResets && createPortal(
                                    <div className="fixed inset-0 z-[99999] flex justify-end">
                                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowResets(false)}></div>
                                        <div 
                                            className="relative w-full md:w-[450px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 font-['Tahoma']"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white">
                                                <h3 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2">
                                                    <Bell size={16} className="text-amber-500" />
                                                    Password Recovery Alerts
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-[3px]">{pendingResets.length}</span>
                                                    <button onClick={() => setShowResets(false)} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-5 md:p-6">
                                                {pendingResets.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                                        <Bell size={40} className="text-gray-300 mb-3" />
                                                        <p className="text-gray-800 font-bold text-sm mb-1">No Pending Resets</p>
                                                        <p className="text-xs text-gray-500">All password recovery requests have been handled.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {pendingResets.map(req => (
                                                            <div key={req.empCode} className="bg-white border border-gray-200 rounded-[3px] p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <p className="text-[14px] font-bold text-gray-800">{req.empName}</p>
                                                                        <p className="text-[12px] text-gray-500 font-mono mt-0.5">{req.empCode}</p>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-[3px] uppercase tracking-wider">Action Req</span>
                                                                </div>
                                                                <div className="bg-gray-50 border border-gray-200 rounded-[3px] p-2.5 flex items-center justify-between">
                                                                    <code className="text-[12px] text-gray-600 font-mono truncate mr-2">{req.token}</code>
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
                                                                        className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-[3px] transition-colors shrink-0"
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative flex items-center gap-2 pl-3 border-l border-gray-200 ml-1">
                                <button 
                                    onClick={() => setShowProfileMenu(prev => !prev)}
                                    className="w-[28px] h-[28px] bg-[#0285fd] text-white flex items-center justify-center font-bold text-[14px] shadow-sm rounded-[3px] hover:ring-2 hover:ring-[#0285fd]/50 transition-all focus:outline-none"
                                >
                                    A
                                </button>
                                
                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setShowProfileMenu(false)} />
                                        
                                        <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-200 shadow-2xl rounded-[3px] z-[100]">
                                            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#0285fd] text-white flex items-center justify-center font-bold text-lg rounded-[3px] shadow-sm shrink-0">
                                                    A
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-gray-800 text-sm truncate">Super Admin</h3>
                                                    <p className="text-[11px] text-gray-500 font-mono truncate">admin@accounts.lk</p>
                                                </div>
                                            </div>
                                            
                                            <div className="p-2">
                                                <div className="px-3 py-2">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">System Access</p>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">Role ID</span>
                                                            <span className="font-bold text-gray-800 bg-gray-50 px-1.5 py-0.5 border border-gray-200 rounded-[3px]">99</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">Portal</span>
                                                            <span className="font-bold text-gray-800">Full Access</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="h-px bg-gray-200 my-2" />
                                                
                                                <button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-[3px] transition-colors text-xs font-bold text-left"
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
                <div className="flex-1 overflow-auto p-4 md:p-8 pb-10">

                    {/* DASHBOARD VIEW */}
                    {activeMenu === 'Dashboard' && (
                        <>


                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Metric Card 1 */}
                                <div className="bg-gradient-to-br from-[#0285fd] to-indigo-600 py-10 px-6 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 rounded-[3px] flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/15 rounded-[3px] flex items-center justify-center shrink-0">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-0.5">Total Employees</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-white">{hierarchy.length}</span>
                                            <span className="text-[9px] font-bold text-[#0285fd] bg-white px-2 py-0.5 rounded-[3px] uppercase tracking-wider shadow-sm">Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metric Card 2 */}
                                <div className="bg-gradient-to-br from-emerald-400 to-teal-600 py-10 px-6 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 rounded-[3px] flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/15 rounded-[3px] flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-0.5">Total Companies</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-white">{totalCompanies}</span>
                                            <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-[3px] uppercase tracking-wider shadow-sm">Registered</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metric Card 3 */}
                                <div className="bg-gradient-to-br from-orange-400 to-rose-500 py-10 px-6 shadow-md hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300 rounded-[3px] flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-[3px] flex items-center justify-center shrink-0">
                                        <Database className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-0.5">Total Entities</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-white">{hierarchy.length + totalCompanies}</span>
                                            <span className="text-[9px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-[3px] uppercase tracking-wider shadow-sm">Combined</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Table Card */}
                            <div className="bg-white border border-gray-200 overflow-hidden mb-6 rounded-[3px] shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                            <LayoutDashboard className="w-4 h-4 text-[#0285fd]" />
                                        </div>
                                        <div>
                                            <h2 className="text-[15px] font-bold text-gray-800">System Overview</h2>
                                            <p className="text-[11px] text-gray-500 font-medium">Employee hierarchy & company assignments</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8fafc] border-b border-gray-100">
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Employee</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Role</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Status</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Last Login</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Login Count</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Companies</th>
                                                <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredHierarchy.map((emp) => (
                                                <React.Fragment key={emp.empCode}>
                                                    <tr className="border-b border-gray-50 hover:bg-blue-50/50 transition-all group cursor-pointer" onClick={() => { setActiveMenu('Companies'); setSelectedEmpForCompanies(emp); }}>
                                                    <td className="py-3.5 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shadow-sm rounded-[3px] shrink-0">
                                                                {emp.empName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-700 uppercase group-hover:text-[#0285fd] transition-colors">{emp.empName}</p>
                                                                <p className="text-[11px] text-slate-500 font-mono font-semibold mt-0.5">{emp.empCode} <span className="text-gray-400 font-normal mx-1">•</span> <span className="text-gray-500 font-normal">{emp.email || 'No Email'}</span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-[3px] shadow-sm ${emp.role === 99 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                            {emp.role === 99 ? 'Super Admin' : `Role ${emp.role}`}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className={`inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-[3px] shadow-sm border ${emp.status === 'Suspended' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                            {emp.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className="text-[13px] font-medium text-gray-700">
                                                            {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-gray-400">Never</span>}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <span className="text-[13px] font-bold text-gray-800">{emp.loginCount || 0}</span>
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-7 h-7 bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center text-[11px] font-bold rounded-[3px]">
                                                                {emp.companies.length}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#0285fd] hover:bg-[#0073ff] rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
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
                                                                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(e, emp.empCode); }}
                                                                title="Delete Employee"
                                                            >
                                                                <Trash2 className="w-[14px] h-[14px]" /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
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
                        <div className="bg-white border border-gray-200 overflow-hidden mb-6 rounded-[3px] shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center rounded-[3px]">
                                        <Building2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-gray-800">{selectedEmpForCompanies ? `Companies for ${selectedEmpForCompanies.empName}` : 'All Registered Companies'}</h2>
                                        <p className="text-[11px] text-gray-500 font-medium">Manage all company records</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedEmpForCompanies && (
                                        <button onClick={() => setSelectedEmpForCompanies(null)} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-bold rounded-[3px] transition-all">
                                            <X className="w-3 h-3" /> Clear Employee Filter
                                        </button>
                                    )}
                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-[3px]">{allCompanies.filter(c => selectedEmpForCompanies ? selectedEmpForCompanies.companies.some(ec => ec.companyCode === c.code) : true).length} Companies</span>
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8fafc] border-b border-gray-100">
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Company Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Company Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Phone</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allCompanies.filter(c => {
                                            const matchesSearch = c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesEmp = selectedEmpForCompanies ? selectedEmpForCompanies.companies.some(ec => ec.companyCode === c.code) : true;
                                            return matchesSearch && matchesEmp;
                                        }).map(comp => (
                                            <tr key={comp.code} onClick={() => setSelectedCompany(comp)} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                                <td className="py-3.5 px-6 text-[12px] text-blue-600 font-mono font-bold">{comp.code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-700 font-bold uppercase group-hover:text-blue-600 transition-colors">{comp.comp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-gray-500 font-medium">{comp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-gray-500 font-medium">{comp.phone || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-[3px] transition-all flex items-center justify-center w-[90px] gap-1.5 ${comp.acc_Desable === 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                                            onClick={(e) => handleToggleCompanyLock(e, comp.code)}
                                                            title={comp.acc_Desable === 1 ? "Unlock Company" : "Lock Company"}
                                                        >
                                                            {comp.acc_Desable === 1 ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                                            {comp.acc_Desable === 1 ? "Unlock" : "Lock"}
                                                        </button>
                                                        <button
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
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
                        <div className="bg-white border border-gray-200 overflow-hidden mb-6 rounded-[3px] shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                        <Users className="w-4 h-4 text-[#0285fd]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-gray-800">All Employees</h2>
                                        <p className="text-[11px] text-gray-500 font-medium">Manage employee accounts & roles</p>
                                    </div>
                                </div>
                                <span className="bg-blue-50 border border-blue-200 text-[#0285fd] text-[10px] font-bold px-2.5 py-1 rounded-[3px]">{allEmployees.length} Employees</span>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8fafc] border-b border-gray-100">
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Emp Code</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Employee Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Email</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Role</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allEmployees.filter(e =>
                                            e.emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            e.emp_Code?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(emp => (
                                            <tr key={emp.emp_Code} onClick={() => setSelectedEmployeeView(emp)} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                                <td className="py-3.5 px-6 text-[12px] text-blue-600 font-mono font-bold">{emp.emp_Code}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-slate-700 font-bold uppercase group-hover:text-blue-600 transition-colors">{emp.emp_Name || 'N/A'}</td>
                                                <td className="py-3.5 px-6 text-[13px] text-gray-500 font-medium">{emp.email || 'N/A'}</td>
                                                <td className="py-3.5 px-6">
                                                    <span className={`inline-flex items-center justify-center w-[110px] px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-[3px] ${emp.userRole_Id === 99 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                                                        {systemRoles.find(r => r.id === emp.userRole_Id || r.id?.toString() === emp.userRole_Id?.toString())?.name || (emp.userRole_Id === 99 ? 'Super Admin' : `Role ${emp.userRole_Id}`)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0285fd] hover:bg-[#0073ff] rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
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
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-[3px] transition-all flex items-center justify-center w-[90px] gap-1.5 ${emp.acc_Desable === "1" || emp.accDesable === "1" ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleEmployeeLock(e, emp.empCode || emp.emp_Code, (emp.acc_Desable === "1" || emp.accDesable === "1")); }}
                                                            title={(emp.acc_Desable === "1" || emp.accDesable === "1") ? "Unlock Employee" : "Lock Employee"}
                                                        >
                                                            {(emp.acc_Desable === "1" || emp.accDesable === "1") ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                                            {(emp.acc_Desable === "1" || emp.accDesable === "1") ? "Unlock" : "Lock"}
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1.5 text-xs font-bold text-white shadow-sm rounded-[3px] transition-all flex items-center justify-center w-[90px] gap-1.5 ${emp.userRole_Id == 99 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
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
                    )}

                    {/* DATABASE VIEW */}
                    {activeMenu === 'Database' && (
                        <DatabaseAdminBoard />
                    )}

                    {/* ROLE FEATURES VIEW */}
                    {activeMenu === 'Role Features' && (
                        <div className="bg-white border border-gray-200 flex flex-col gap-6 pb-6 rounded-[3px] overflow-hidden mb-6 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                        <ShieldAlert className="w-4 h-4 text-[#0285fd]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-gray-800">System Role Permission Master Editor</h2>
                                        <p className="text-[11px] text-gray-500 font-medium">Configure default enabled/disabled features for each user role</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-start">
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions || loadingPermissions}
                                        className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-[3px] transition-all flex items-center gap-2"
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
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <CheckCircle size={14} />
                                        Allow All
                                    </button>
                                    <button
                                        onClick={handleInitiateSavePermissions}
                                        disabled={savingPermissions || loadingPermissions || !permissions.length}
                                        className="px-5 py-2.5 bg-[#0285fd] hover:bg-[#0073ff] text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {savingPermissions ? (
                                            <><Loader2 className="animate-spin" size={13} />Saving Changes...</>
                                        ) : (
                                            'Save Role Permissions'
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 border border-gray-200 mx-6 flex flex-col gap-4 rounded-[3px] shadow-inner">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest mr-2">Select Role:</span>
                                        {systemRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all ${selectedRole === role.id
                                                    ? 'bg-[#0285fd] text-white shadow-sm'
                                                    : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setShowCreateRoleModal(true)}
                                            className="px-3 py-1.5 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[3px] transition-all flex items-center gap-1"
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
                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-50 border border-blue-200 text-blue-600 rounded-[3px] transition-all flex items-center gap-1"
                                                >
                                                    <Edit size={12} /> Edit Role
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteUserRole(e, selectedRole)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-red-50 border border-red-200 text-red-600 rounded-[3px] transition-all flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Delete Role
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search functions..."
                                            value={permSearch}
                                            onChange={e => setPermSearch(e.target.value)}
                                            className="pl-9 pr-4 py-1.5 border border-gray-200 bg-white text-gray-700 text-xs w-full outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] rounded-[3px] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loadingPermissions ? (
                                <SystemLoader inline message="Fetching role permission matrix..." />
                            ) : !permissions.length ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500 mx-6 border border-dashed border-gray-200 bg-white rounded-[3px]">
                                    <Database size={40} className="text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-[13px] font-bold text-gray-500 mb-1">No System Functions Found</p>
                                        <p className="text-[11px] text-gray-500 font-medium">The system permission table is empty. Seed default functions to get started.</p>
                                    </div>
                                    <button
                                        onClick={handleSeedFunctions}
                                        disabled={seedingFunctions}
                                        className="px-6 py-2.5 bg-[#0285fd] hover:bg-[#0073ff] text-white text-xs font-bold rounded-[3px] transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        {seedingFunctions ? (
                                            <><Loader2 className="animate-spin" size={14} />Seeding Functions...</>
                                        ) : (
                                            <><Database size={14} />Seed Default Functions & Reports</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-gray-200 overflow-hidden mx-6 bg-white rounded-[3px] shadow-sm">
                                    <div className="relative z-10">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f8fafc] border-b border-gray-100">
                                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap w-1/3">Function Code</th>
                                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap w-1/2">Description</th>
                                                    <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
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
                                                        <tr key={`cat-${label}`} className="bg-gray-100 border-b border-gray-200">
                                                            <td colSpan={3} className="px-4 py-2.5">
                                                                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-[#0285fd] inline-block rounded-[2px]"></span>
                                                                    {label}
                                                                    <span className="text-[10px] font-normal text-gray-500 normal-case">({items.length} function{(items.length !== 1) ? 's' : ''})</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                    items.forEach(p => {
                                                        const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
                                                        const desc = p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || code;
                                                        const isAllowed = (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === 'T';
                                                        rows.push(
                                                            <tr key={code} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all group">
                                                                <td className="py-3.5 px-6">
                                                                    <span className="font-mono text-[12px] font-bold text-blue-600">{code}</span>
                                                                </td>
                                                                <td className="py-3.5 px-6">
                                                                    <span className="text-[13px] text-slate-700 font-bold uppercase group-hover:text-blue-600 transition-colors">{desc}</span>
                                                                </td>
                                                                <td className="py-3.5 px-6 text-center">
                                                                    <button
                                                                        onClick={() => handleTogglePermission(code)}
                                                                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all ${isAllowed
                                                                            ? 'bg-emerald-600 text-white shadow-sm'
                                                                            : 'bg-red-600 text-white shadow-sm'
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
                                            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
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
                        <div className="bg-white border border-gray-200 rounded-[3px] shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
                                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                    <Settings className="w-4 h-4 text-[#0285fd]" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-gray-800">Admin Configuration</h2>
                                    <p className="text-[11px] text-gray-500 font-medium">System-wide settings and preferences</p>
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

                    {/* REPORTS VIEW */}
                    {activeMenu === 'Reports' && (
                        <div className="bg-white border border-gray-200 flex flex-col gap-6 pb-6 rounded-[3px] overflow-hidden mb-6 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
                                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                    <FileText className="w-4 h-4 text-[#0285fd]" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold text-gray-800">Admin Reports</h2>
                                    <p className="text-[11px] text-gray-500 font-medium">View system-wide reports and analytics</p>
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

                    {/* SUBSCRIPTIONS VIEW */}
                    {activeMenu === 'Subscriptions' && (
                        <SubscriptionAdminBoard />
                    )}

                    {/* Create Role Modal */}
            {showCreateRoleModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-md rounded-[3px] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="text-[15px] font-bold text-gray-800">Create New Role</h3>
                            <button onClick={() => setShowCreateRoleModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[3px] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role Name *</label>
                                    <input
                                        type="text"
                                        value={newRoleName}
                                        onChange={e => setNewRoleName(e.target.value)}
                                        placeholder="e.g. HR Manager"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={newRoleDescription}
                                        onChange={e => setNewRoleDescription(e.target.value)}
                                        placeholder="Optional description"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => setShowCreateRoleModal(false)}
                                    className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRole}
                                    disabled={creatingRole}
                                    className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
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
                        <div className="bg-white border border-gray-200 flex flex-col gap-6 pb-6 rounded-[3px] overflow-hidden mb-6 shadow-sm min-h-[500px]">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-[3px]">
                                        <MessageSquare className="w-4 h-4 text-[#0285fd]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-gray-800">User Feedback</h2>
                                        <p className="text-[11px] text-gray-500 font-medium">View and manage feedback submitted from Report Builder</p>
                                    </div>
                                </div>
                                <span className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-[3px]">{feedbackData.length} Records</span>
                            </div>
                            
                            <div className="border border-gray-200 overflow-hidden mx-6 bg-white rounded-[3px] shadow-sm flex-1 flex flex-col mb-4">
                                <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8fafc] border-b border-gray-100">
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Date</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Employee Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Company</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Report Name</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Feedback</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap">Images</th>
                                            <th className="py-3.5 px-6 text-[11px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {feedbackLoading ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-gray-500 text-[13px] font-medium">Loading feedback...</td>
                                            </tr>
                                        ) : feedbackData.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-gray-500 text-[13px] font-medium">No feedback records found.</td>
                                            </tr>
                                        ) : (
                                            feedbackData.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all group">
                                                    <td className="py-3.5 px-6 text-[12px] text-gray-500 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[13px] text-slate-700 font-bold uppercase group-hover:text-blue-600 transition-colors">
                                                        {item.employeeName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-blue-600 font-mono font-bold">
                                                        {item.companyId || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] font-medium text-gray-600">
                                                        {item.reportName || '-'}
                                                    </td>
                                                    <td className="py-3.5 px-6 text-[12px] text-gray-500 max-w-[250px] truncate" title={item.feedbackText}>
                                                        {item.feedbackText}
                                                    </td>
                                                    <td className="py-3.5 px-6">
                                                        {(() => {
                                                            try {
                                                                if (!item.images || item.images === '[]') return <span className="text-[12px] text-gray-500">-</span>;
                                                                const imgs = JSON.parse(item.images);
                                                                if (!Array.isArray(imgs) || imgs.length === 0) return <span className="text-[12px] text-gray-500">-</span>;
                                                                return (
                                                                    <div className="flex gap-1.5 overflow-x-auto max-w-[120px] pb-1">
                                                                        {imgs.map((img, i) => (
                                                                            <div key={i} onClick={() => setFullScreenImage(img)} className="shrink-0 block cursor-pointer" title="Click to view full image">
                                                                                <img src={img} alt={`Attachment ${i+1}`} className="w-8 h-8 object-cover rounded shadow-sm border border-gray-200 hover:opacity-80 transition-opacity" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            } catch (e) {
                                                                return <span className="text-[12px] text-gray-500">Error</span>;
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end">
                                                            <button
                                                                className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all bg-red-600 text-white shadow-sm hover:bg-red-500 flex items-center gap-1"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden rounded-[3px]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldAlert className="text-[#0285fd]" size={18} />
                                    Manage Employee Role
                                </h2>
                                <button onClick={() => setEditingEmp(null)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[3px] transition-all">
                                    <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[12px] text-gray-500 mt-1">Editing <span className="font-bold text-gray-800">{editingEmp.empName || editingEmp.emp_Name}</span> ({editingEmp.empCode || editingEmp.emp_Code})</p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {/* Employee Info Card */}
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-50 text-[#0285fd] flex items-center justify-center font-bold text-sm shrink-0 rounded-[3px]">
                                    {(editingEmp.empName || editingEmp.emp_Name || 'U')[0]}
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-gray-800">{editingEmp.empName || editingEmp.emp_Name}</p>
                                    <p className="text-[12px] text-gray-500">{editingEmp.empCode || editingEmp.emp_Code} • Current Role: {systemRoles.find(r => r.id === (editingEmp.role || editingEmp.userRole_Id))?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Assign Role</label>
                                    <div className="flex flex-wrap gap-2">
                                        {systemRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => {
                                                    setSelectedRoleId(role.id);
                                                    const matchedGroup = userGroups.find(g => g.group_Name?.toLowerCase() === role.name?.toLowerCase());
                                                    setSelectedGroupName(matchedGroup ? matchedGroup.group_Name : role.name);
                                                }}
                                                className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-[3px] ${selectedRoleId === role.id
                                                    ? 'bg-[#0285fd] border-[#0285fd] text-white shadow-sm'
                                                    : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-[#0285fd]/50 text-gray-600'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-[3px]">
                                    <p className="text-[11px] text-gray-500 leading-snug">
                                        <span className="font-bold text-gray-600">Simplified Assignment:</span> Clicking a role automatically assigns both the Role Level (ID {selectedRoleId || '?'}) and maps the user to the correct Member Group (<span className="text-[#0285fd] font-mono">{selectedGroupName || '?'}</span>).
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setEditingEmp(null)}
                                    className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleInitiateUpdateRole}
                                    disabled={savingRole}
                                    className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {savingRole ? 'Saving...' : 'Save Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Details View Modal */}
            {selectedEmployeeView && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3px] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-[3px] shadow-sm">
                                    <Users className="w-6 h-6 text-[#0285fd]" />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-slate-800">Employee Details</h2>
                                    <p className="text-[12px] font-bold text-slate-500 mt-0.5">{selectedEmployeeView.emp_Name || selectedEmployeeView.empName || 'N/A'} <span className="text-blue-600 font-mono">({selectedEmployeeView.emp_Code || selectedEmployeeView.empCode})</span></p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployeeView(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
                                <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {Object.entries({
                                    ...selectedEmployeeView,
                                    'PASSWORD': selectedEmployeeView.pass_Word || selectedEmployeeView.password || selectedEmployeeView.Pass_Word || '•••••••• (Encrypted by Backend)'
                                })
                                .filter(([key, value]) => typeof value !== 'object' && key !== 'companies' && key !== 'pass_Word' && key !== 'password' && key !== 'Pass_Word')
                                .map(([key, value], index, array) => (
                                    <div key={key} className={`${key === 'PASSWORD' && array.length % 2 !== 0 ? 'md:col-span-2' : ''}`}>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{key.replace(/_/g, ' ')}</label>
                                        <div className="w-full min-h-[42px] border border-slate-200 bg-slate-50 rounded-[3px] px-4 py-2.5 flex items-center shadow-sm group hover:border-[#0285fd]/40 transition-colors">
                                            <span className="text-[14px] font-bold text-slate-700 break-all">{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-400 font-normal italic">Empty</span>}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                            <button onClick={() => setSelectedEmployeeView(null)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-[3px] shadow-sm hover:bg-slate-50 transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit User Role Modal */}
            {editingUserRole && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-md rounded-[3px] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="text-[15px] font-bold text-gray-800">Edit User Role</h3>
                            <button onClick={() => setEditingUserRole(null)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[3px] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role Name *</label>
                                    <input
                                        type="text"
                                        value={editRoleName}
                                        onChange={e => setEditRoleName(e.target.value)}
                                        placeholder="e.g. HR Manager"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                    <input
                                        type="text"
                                        value={editRoleDesc}
                                        onChange={e => setEditRoleDesc(e.target.value)}
                                        placeholder="Optional description"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => setEditingUserRole(null)}
                                    className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUserRole}
                                    disabled={savingUserRole}
                                    className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
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
                <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-[3px] p-2 transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <img src={fullScreenImage} alt="Full screen preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-[3px]" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* AI Chatbot Trigger Button */}
            {!showAIChatbot && !showAITyping && (
                <div className="fixed bottom-6 right-6 z-[9900]">
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
                        className="flex items-center justify-center drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300 hover:scale-105"
                        title="Open Onimta Intelligence"
                    >
                        <div className="w-20 h-20">
                            <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '100%', height: '100%' }} />
                        </div>
                    </button>
                </div>
            )}

            {/* AI Typing Animation Overlay */}
            {showAITyping && (
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-8 max-w-2xl px-8">
                        <div className="w-16 h-16 border-4 border-[#0285fd] border-t-transparent rounded-full animate-spin"></div>
                        <div className="h-16 flex items-center justify-center">
                            <span className="text-white/90 text-2xl md:text-3xl font-light tracking-wide">
                                {aiTypingText}
                                <span className="animate-pulse ml-0.5 text-[#0285fd]">|</span>
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
                sessionTimeout={sessionTimeout}
                setSessionTimeout={setSessionTimeout}
                defaultView={defaultView}
                setDefaultView={setDefaultView}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                currentUserCode={currentUserCode}
            />
        </div>
    );
};

export default SuperAdminDashboard;
