import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';
import toast from 'react-hot-toast';
import { showSuccessToast } from '../utils/toastUtils';
import api from '../services/api';
import { authService } from '../services/auth.service';
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
    ChevronRight,
    ChevronsLeft,
    Edit,
    Trash2,
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
    Plus,
    User,
    UserCog,
    Clock,
    Layers
} from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import ConfirmModal from '../components/modals/ConfirmModal';
import AlertModal from '../components/modals/AlertModal';
import AdminVerificationModal from '../components/modals/AdminVerificationModal';
import AdminConfigBoard from '../HomeMaster/AdminConfigBoard';
import SystemAnalyticsBoard from '../HomeMaster/SystemAnalyticsBoard';
import SecurityAuditBoard from '../HomeMaster/SecurityAuditBoard';
import CompaniesView from './SuperAdmin/CompaniesView';
import EmployeesView from './SuperAdmin/EmployeesView';
import RoleFeaturesView from './SuperAdmin/RoleFeaturesView';
import UserFeedbackView from './SuperAdmin/UserFeedbackView';
import AccountTablesView from './SuperAdmin/AccountTablesView';


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
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const CustomYAxisTick = (props) => {
    const { x, y, payload } = props;
    const text = payload.value || '';

    let line1 = text;
    let line2 = '';

    if (text.length > 14) {
        const splitIndex = text.lastIndexOf(' ', 14);
        if (splitIndex !== -1) {
            line1 = text.substring(0, splitIndex);
            line2 = text.substring(splitIndex + 1);
        } else {
            const nextSpace = text.indexOf(' ', 14);
            if (nextSpace !== -1) {
                line1 = text.substring(0, nextSpace);
                line2 = text.substring(nextSpace + 1);
            }
        }

        if (line2.length > 20) {
            line2 = line2.substring(0, 17) + '...';
        }
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-140} y={line2 ? -4 : 4} textAnchor="start" fill="#64748b" fontSize={11} fontWeight={500}>
                {line1}
            </text>
            {line2 && (
                <text x={-140} y={9} textAnchor="start" fill="#64748b" fontSize={11} fontWeight={500}>
                    {line2}
                </text>
            )}
        </g>
    );
};


const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('saDefaultView') || 'Dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmps, setExpandedEmps] = useState({});

    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const [currentUserCode, setCurrentUserCode] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');
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
            'database': 'Companies',
            'backup': 'Companies',
            'accounts': 'Account Tables',
            'account tables': 'Account Tables',
            'chart of accounts': 'Account Tables',
            'security': 'Role Features',
            'audit': 'Role Features',
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
    const [selectedRole, setSelectedRole] = useState(1); // Default to Admin
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
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [createCompanyForm, setCreateCompanyForm] = useState({ CompanyName: '', Country: '', Industry: '', Address: '', Phone: '', Email: '' });
    const [creatingCompany, setCreatingCompany] = useState(false);

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

    // --- Role Features State ---
    const [targetCompany, setTargetCompany] = useState('');
    const [targetEmployee, setTargetEmployee] = useState('');

    const [showAdminConfig, setShowAdminConfig] = useState(false);
    const [showSystemLogReport, setShowSystemLogReport] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('saSidebarCollapsed') === 'true');

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
            fetchAdminData();
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
            let hData = Array.isArray(hierarchyRes.data) ? hierarchyRes.data : (hierarchyRes.data?.data || []);
            let cData = Array.isArray(compRes.data) ? compRes.data : (compRes.data?.data || []);
            let eData = Array.isArray(empRes.data) ? empRes.data : (empRes.data?.data || []);

            // Always use real data from the API

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

    const verifySuperAdminPassword = async (password) => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return false;
            const user = JSON.parse(userStr);
            const empName = user.EmpName || user.empName || user.Emp_Name || user.Email || user.email || user.EmpCode;

            const res = await api.post('/Auth/verify-password', {
                Emp_Name: empName,
                Pass_Word: password
            });
            return res.data.success;
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Security Error',
                message: error.response?.data?.message || 'Password verification failed.',
                variant: 'danger'
            });
            return false;
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

        const isValid = await verifySuperAdminPassword(rolePasswordInput);
        if (!isValid) return;

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
                message: error.response?.data?.message || 'Failed to update employee role..',
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
            const empCode = user.Emp_Code || user.empCode || user.EmpCode || user.id_No || 'unknown';
            setCurrentUserCode(empCode);
            setCurrentUserName(user.Emp_Name || user.empName || user.EmpName || user.emp_Name || user.Full_Name || user.username || 'Admin');
            setCurrentUserEmail(user.Email || user.email || user.Email_Address || `${empCode}@accounts.lk`);

            if (!authService.isSuperAdmin(user)) {
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
        authService.logout();
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login', { replace: true });
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
            if (!allCompanies || allCompanies.length === 0 || !allEmployees || allEmployees.length === 0) {
                fetchAdminData();
            }
        }
    }, [activeMenu]);

    useEffect(() => {
        if (activeMenu === 'Role Features' && selectedRole) {
            fetchRolePermissions(selectedRole, targetCompany, targetEmployee);
        } else {
            setPermissions([]);
        }
    }, [activeMenu, selectedRole, targetCompany, targetEmployee]);

    const fetchSystemRoles = async () => {
        try {
            const res = await api.get('/UserRole/system-roles', { hideLoader: true });
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

    const fetchRolePermissions = async (roleId, compCode = targetCompany, empCode = targetEmployee) => {
        setLoadingPermissions(true);
        try {
            const res = await api.get('/UserRole/system-permissions', { 
                params: { 
                    userRoleId: roleId,
                    companyCode: compCode || undefined,
                    empCode: empCode || undefined
                }, 
                hideLoader: true 
            });
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
                const currentAllow = p.allow_Fuction !== undefined ? p.allow_Fuction : (p.allowFuction !== undefined ? p.allowFuction : p.Allow_Fuction);

                let newAllow;
                if (typeof currentAllow === 'boolean') {
                    newAllow = !currentAllow;
                } else {
                    newAllow = currentAllow === 'T' ? 'F' : 'T';
                }

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
        setPermissions(prev => prev.map(p => {
            const currentAllow = p.allow_Fuction !== undefined ? p.allow_Fuction : (p.allowFuction !== undefined ? p.allowFuction : p.Allow_Fuction);
            const isBool = typeof currentAllow === 'boolean';
            return {
                ...p,
                allow_Fuction: isBool ? true : 'T',
                allowFuction: isBool ? true : 'T',
                Allow_Fuction: isBool ? true : 'T'
            };
        }));
    };

    const handleSeedFunctions = async () => {
        setSeedingFunctions(true);
        try {
            await api.post('/UserRole/seed-system-functions', {}, { hideLoader: true });
            await fetchRolePermissions(selectedRole, targetCompany, targetEmployee);
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

        const isValid = await verifySuperAdminPassword(savePermissionsPasswordInput);
        if (!isValid) return;

        setShowSavePermissionsPasswordModal(false);
        setSavingPermissions(true);
        try {
            const payload = {
                userRoleId: selectedRole ? selectedRole.toString() : "",
                companyCode: targetCompany || undefined,
                empCode: targetEmployee || undefined,
                permissions: permissions.map(p => {
                    const allowVal = p.allow_Fuction !== undefined ? p.allow_Fuction : (p.allowFuction !== undefined ? p.allowFuction : p.Allow_Fuction);
                    return {
                        system_Fuction: p.system_Fuction || p.systemFuction || p.System_Fuction,
                        allow_Fuction: allowVal
                    };
                })
            };
            await api.post('/UserRole/system-permissions', payload, { hideLoader: true });
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

        if (!password) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Super Admin password is required to delete record.',
                variant: 'warning'
            });
            return;
        }

        const isValid = await verifySuperAdminPassword(password);
        if (!isValid) return;

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

    const totalActiveSubscriptions = allCompanies.filter(c => {
        const daysLeft = c.daysLeft ?? c.DaysLeft ?? c.days_Left ?? null;
        const status = c.status ?? c.Status ?? c.subscription_Status ?? null;
        if (typeof status === 'string') return !/expir|suspend|cancel|inactiv|trial_ended|ended/i.test(status);
        if (daysLeft !== null && daysLeft !== undefined) return Number(daysLeft) > 0;
        return true;
    }).length;

    const totalSuperAdmins = hierarchy.filter(e => e.role === 99 || e.userRole_Id === 99 || e.Role === 99).length;

    const roleDistribution = (() => {
        const counts = {};
        hierarchy.forEach(e => {
            const isSuper = e.role === 99 || e.userRole_Id === 99 || e.Role === 99;
            const label = isSuper ? 'System Admins' : `Role ${e.role ?? e.userRole_Id ?? 'Staff'}`;
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    const topCompanyAssignments = hierarchy
        .filter(e => (e.companies?.length || 0) > 0)
        .sort((a, b) => (b.companies?.length || 0) - (a.companies?.length || 0))
        .slice(0, 8)
        .map(e => ({
            name: (e.empName || e.emp_Code || 'Unknown').length > 9 ? (e.empName || e.emp_Code || 'Unknown').slice(0, 8) + '…' : (e.empName || e.emp_Code || 'Unknown'),
            companies: e.companies?.length || 0
        }))
        .reverse();

    const companyStatusData = (() => {
        let active = 0, locked = 0;
        allCompanies.forEach(c => {
            const isLocked = c.acc_Desable === 1 || c.acc_Desable === '1' || c.acc_Desable === true || /locked|suspend|disabled/i.test(c.status || c.Status || '');
            if (isLocked) locked++; else active++;
        });
        return [
            { name: 'Active', value: active },
            { name: 'Locked', value: locked }
        ];
    })();

    const moduleUsageData = (() => {
        const list = Array.isArray(allModules) ? allModules : [];
        return list.slice(0, 8).map(m => ({
            name: String(m.module_Name || m.moduleName || m.name || m.module || m.ModuleName || 'Module'),
            count: Number(m.usage_Count || m.usageCount || m.count || m.usage || m.total || m.value || 0)
        }));
    })();

    const CHART_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#0ea5e9', '#14b8a6', '#6366f1'];

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Companies', icon: Building2 },
        { name: 'Employees', icon: Users },
        { name: 'Account Tables', icon: Layers },
        { name: 'Role Features', icon: ShieldAlert },
        { name: 'Reports', icon: FileText },
        { name: 'Engagement', icon: Megaphone },
        { name: 'Subscriptions', icon: CalendarClock },

        { name: 'User Feedback', icon: MessageSquare }
    ];

    return (
        <div className="min-h-screen bg-[#f6f8fa] font-sans text-gray-700">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 z-40 hidden md:flex flex-col h-full bg-white border-r border-slate-200 transition-[width] duration-300 ${sidebarCollapsed ? 'w-[76px]' : 'w-[260px]'}`}>
                <div className={`flex items-center gap-3 h-[76px] border-b border-slate-200 shrink-0 ${sidebarCollapsed ? 'justify-center px-2' : 'px-5'}`}>
                    <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-10 w-10 object-contain shrink-0" />
                    <div className={`min-w-0 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        <h1 className="text-[20px] font-bold text-[#2563eb] tracking-tight leading-none">Onimta</h1><p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Accounting Admin Panel</p>

                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-5">
                    <p className={`px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>Main Menu</p>
                    <ul className="flex flex-col space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    onClick={() => { setActiveMenu(item.name); setSelectedEmpForCompanies(null); }}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`w-full flex items-center gap-3 rounded-[10px] text-[13px] font-semibold transition-all ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'} ${activeMenu === item.name
                                        ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200/60'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${activeMenu === item.name ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>{item.name}</span>
                                    {!sidebarCollapsed && item.name === 'Dashboard' && pendingResets.length > 0 && (
                                        <span className="ml-auto w-2 h-2 bg-[#2563eb]mber-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>


                <div className={`mx-3 mb-4 mt-auto rounded-xl bg-blue-50 border border-blue-100 shrink-0 transition-all hover:shadow-sm ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
                    <div className={`flex items-center gap-2 mb-3 ${sidebarCollapsed ? 'justify-center mb-0' : ''}`}>
                        <div className="bg-blue-600 text-white w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-[13px] shadow-sm shrink-0">A</div>
                        <span className={`text-[13px] font-bold text-gray-800 whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Accounting Backend</span>
                    </div>
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => { setActiveMenu('Subscriptions'); setSelectedEmpForCompanies(null); }}
                            className="w-full bg-white border border-gray-200 text-gray-700 font-bold text-xs py-2 rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span>Upgrade plan</span>
                        </button>
                    )}
                </div>
                <div className={`${sidebarCollapsed ? 'px-2' : 'px-3'} pb-5 pt-3 border-t border-slate-200`}>
                    <button
                        onClick={handleLogout}
                        title={sidebarCollapsed ? 'Logout' : undefined}

                        className={`w-full flex items-center rounded-[10px] text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}`}
                    >
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                        <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col">
                        <div className="flex items-center gap-3 px-5 h-[76px] border-b border-slate-200 shrink-0">
                            <img src="/onimta_logo-modified.png" alt="Onimta Logo" className="h-10 w-10 object-contain" />
                            <div className="min-w-0">
                                <h1 className="text-[20px] font-bold text-[#2563eb] tracking-tight leading-none">Onimta</h1><p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Accounting Admin Panel</p>

                            </div>
                        </div>
                        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => { setActiveMenu(item.name); setSelectedEmpForCompanies(null); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all text-[13px] font-semibold ${activeMenu === item.name
                                        ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200/60'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${activeMenu === item.name ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span className="whitespace-nowrap">{item.name}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mx-3 mb-4 mt-auto rounded-xl bg-blue-50 border border-blue-100 p-4 shrink-0 transition-all hover:shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-blue-600 text-white w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-[13px] shadow-sm">A</div>
                                <span className="text-[13px] font-bold text-gray-800">Accounting Backend</span>
                            </div>
                            <button
                                onClick={() => { setActiveMenu('Subscriptions'); setSelectedEmpForCompanies(null); setSidebarOpen(false); }}
                                className="w-full bg-white border border-gray-200 text-gray-700 font-bold text-xs py-2 rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <span>Upgrade plan</span>
                            </button>
                        </div>

                        <div className="px-3 pb-5 pt-3 border-t border-slate-200">
                            <button
                                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-[18px] h-[18px]" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex flex-col h-screen overflow-hidden transition-[margin] duration-300 ${sidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-[260px]'}`}>


                {/* Topbar */}
                <header className="bg-white border-b border-gray-100 shrink-0 relative z-30 h-[76px] flex items-center px-4 md:px-8">
                    <div className="flex items-center justify-between w-full">
                        {/* Left */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-[10px] transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setSidebarCollapsed(prev => {
                                    const next = !prev;
                                    localStorage.setItem('saSidebarCollapsed', String(next));
                                    return next;
                                })}
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                className="hidden md:flex w-9 h-9 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-[10px] transition-colors"
                            >
                                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
                            </button>
                            <div className="hidden sm:block">
                                <h1 className="text-[20px] font-bold text-gray-800 tracking-tight leading-none mb-1">
                                    {activeMenu === 'Dashboard' ? `${getGreeting()}, ${currentUserName || 'System Admin'}!` : activeMenu}
                                </h1>
                                <p className="text-[12px] text-gray-500 font-medium">
                                    {activeMenu === 'Dashboard' ? `Today is ${currentDate}` : `View, search for and manage ${activeMenu.toLowerCase()}`}
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions & Filters */}
                        <div className="flex items-center gap-3 justify-end h-full">

                            {/* Dashboard Filters */}
                            {activeMenu === 'Dashboard' && (
                                <div className="hidden lg:flex items-center gap-2">
                                    <button onClick={() => {
                                        showSuccessToast("Preparing dashboard snapshot...");
                                        setTimeout(() => showSuccessToast("Dashboard snapshot exported successfully!"), 1500);
                                    }} className="flex items-center gap-2 px-3 py-2 border border-blue-600/20 bg-blue-50 hover:bg-blue-100 rounded-lg text-[13px] font-bold text-blue-700 transition-all shadow-sm">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                        Export CSV
                                    </button>
                                </div>
                            )}

                            {/* Notifications / Messages */}
                            {!activeMenu.includes('Dashboard') && (
                                <div className="relative hidden md:block w-full max-w-[280px] mr-4">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white rounded-[10px] text-[13px] font-semibold text-slate-700 placeholder-slate-400 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    />
                                </div>
                            )}

                            <div className="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>

                            {/* Profile User Info */}
                            <div className="relative flex items-center gap-3 cursor-pointer select-none" onClick={() => setShowProfileMenu(prev => !prev)}>
                                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 border-2 border-blue-100 flex items-center justify-center font-bold text-[14px] shadow-sm rounded-full overflow-hidden shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="hidden xl:block text-left">
                                    <p className="text-[14px] font-bold text-gray-800 leading-tight truncate max-w-[120px]">{currentUserName || 'System Admin'}</p>
                                    <p className="text-[12px] font-medium text-gray-500 leading-tight">System Administrator</p>
                                </div>

                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); }} />

                                        <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 shadow-2xl rounded-[10px] z-[100] overflow-hidden">
                                            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 border-2 border-blue-100 flex items-center justify-center font-bold text-[14px] shadow-sm rounded-full overflow-hidden shrink-0">
                                                    <ShieldCheck className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-gray-800 text-sm truncate">{currentUserName || 'System Admin'}</h3>
                                                    <p className="text-[11px] text-gray-500 font-medium truncate">{currentUserEmail || 'meaghan@orlando.io'}</p>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowProfileMenu(false);
                                                        setShowSettingsModal(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-[8px] transition-colors text-xs font-bold text-left mb-1"
                                                >
                                                    <Settings className="w-[14px] h-[14px]" />
                                                    Settings
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowProfileMenu(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors text-xs font-bold text-left"
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
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

                            {/* Top 4 KPI Cards */}
                            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Card 1: Staff */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[28px] font-bold text-gray-800 leading-tight">{allEmployees.length || hierarchy.length}</h3>
                                        <p className="text-[13px] font-medium text-gray-500 mb-4">Total System Users</p>
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-500">
                                            <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                            </div>
                                            12 new this quarter
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Applications */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[28px] font-bold text-gray-800 leading-tight">{allCompanies.length}</h3>
                                        <p className="text-[13px] font-medium text-gray-500 mb-4">Registered Companies / Branches</p>
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-500">
                                            <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                            </div>
                                            99.9% uptime
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Projects */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[28px] font-bold text-gray-800 leading-tight">{totalSuperAdmins}</h3>
                                        <p className="text-[13px] font-medium text-gray-500 mb-4">User Roles Configured</p>
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-500">
                                            <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                            </div>
                                            4 newly configured
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4: Departments */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <AppWindow className="w-4 h-4 text-[#2563eb]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[28px] font-bold text-gray-800 leading-tight">{totalActiveSubscriptions || 8}</h3>
                                        <p className="text-[13px] font-medium text-gray-500 mb-4">Active Users</p>
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                                            <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center mr-1">
                                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            Stable Status
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Middle 3 Charts */}
                            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart 1: Donut */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[16px] font-bold text-gray-800">User Role Distribution</h3>
                                        <button className="text-gray-400 hover:text-gray-600"><Settings className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={80} paddingAngle={4} stroke="none" cornerRadius={4}>
                                                    {roleDistribution.map((entry, idx) => (
                                                        <Cell key={idx} fill={idx === 0 ? '#2563eb' : idx === 1 ? '#ef4444' : '#f59e0b'} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center Text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[22px] font-bold text-gray-800">{hierarchy.length}</span>
                                            <span className="text-[10px] uppercase font-semibold text-gray-500 mt-1">SYSTEM USERS</span>
                                        </div>
                                    </div>
                                    {/* Legend styling to match bottom blocks */}
                                    <div className="flex justify-between mt-4 border-t border-gray-100 pt-5 px-2">
                                        <div className="flex flex-col border-l-4 border-[#2563eb] pl-2">
                                            <span className="text-sm font-bold text-gray-800">{roleDistribution[0]?.value || 0}</span>
                                            <span className="text-xs font-semibold text-gray-500">{roleDistribution[0]?.name || 'System Admins'}</span>
                                        </div>
                                        <div className="flex flex-col border-l-4 border-red-500 pl-2">
                                            <span className="text-sm font-bold text-gray-800">{roleDistribution[1]?.value || 0}</span>
                                            <span className="text-xs font-semibold text-gray-500">{roleDistribution[1]?.name || 'Managers'}</span>
                                        </div>
                                        <div className="flex flex-col border-l-4 border-amber-500 pl-2">
                                            <span className="text-sm font-bold text-gray-800">{roleDistribution[2]?.value || 0}</span>
                                            <span className="text-xs font-semibold text-gray-500">{roleDistribution[2]?.name || 'Users'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 2: Stacked Bar */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[16px] font-bold text-gray-800">System Configuration Status</h3>
                                        <button className="text-gray-400 hover:text-gray-600"><Settings className="w-4 h-4" /></button>
                                    </div>
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topCompanyAssignments.length > 0 ? topCompanyAssignments.map(d => ({ name: d.name, val1: d.companies * 10, val2: d.companies * 5, val3: d.companies * 3 })) : [{ name: '30 Sep', val1: 400, val2: 120, val3: 80 }, { name: '10 Oct', val1: 400, val2: 0, val3: 110 }, { name: '20 Oct', val1: 300, val2: 24, val3: 120 }, { name: '30 Oct', val1: 450, val2: 50, val3: 100 }, { name: '10 Nov', val1: 400, val2: 0, val3: 90 }]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => val + 'k'} />
                                                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                                <Bar dataKey="val1" stackId="a" fill="#2563eb" radius={[0, 0, 4, 4]} />
                                                <Bar dataKey="val2" stackId="a" fill="#ef4444" />
                                                <Bar dataKey="val3" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center gap-4 mt-6">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-sm"></div><span className="text-[11px] font-semibold text-gray-500">Stored Items</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#2563eb] rounded-sm"></div><span className="text-[11px] font-semibold text-gray-500">Ledger Accounts</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-sm"></div><span className="text-[11px] font-semibold text-gray-500">User Accounts</span></div>
                                    </div>
                                </div>

                                {/* Chart 3: Area */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-[16px] font-bold text-gray-800">System Activity Index</h3>
                                            <h1 className="text-[24px] font-extrabold text-gray-900 mt-2">{(moduleUsageData.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0).toLocaleString()} <span className="text-[12px] text-gray-500 font-medium">interactions</span></h1>
                                            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-500 mt-1">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                                Active across {moduleUsageData.length} core modules
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600"><Settings className="w-4 h-4" /></button>
                                    </div>
                                    <div className="h-[180px] w-full mt-auto">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={moduleUsageData.length > 0 ? moduleUsageData.map(d => ({ name: d.name, uv: d.count })) : [{ name: 'Accounts', uv: 140 }, { name: 'Customers', uv: 120 }, { name: 'Vendors', uv: 95 }, { name: 'Billing', uv: 85 }, { name: 'Pay Bills', uv: 70 }]} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <Area type="monotone" dataKey="uv" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                                                <RechartsTooltip cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-[4px] shadow-sm transform -translate-y-8">
                                                                {payload[0].value.toLocaleString()} interactions
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Bottom 2 Widgets */}
                            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                                {/* Widget 1: Recent Employee Access */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[16px] font-bold text-gray-800">Recent Employee Access</h3>
                                        <button onClick={() => setActiveMenu('Employees')} className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-xl border border-transparent hover:border-blue-200" title="Manage Employees">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 flex-1">
                                        {hierarchy.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400">No active sessions found.</div>
                                        ) : hierarchy.slice(0, 4).map((emp, idx) => (
                                            <div key={emp.empCode} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100/60 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-100 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-[12px] text-indigo-600 uppercase shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                        {(emp.empName || 'U')[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-gray-800 leading-tight">{emp.empName}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">{emp.empCode}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-sm ${emp.status === 'Suspended' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        }`}>
                                                        {emp.status || 'Active'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('en-GB') : 'Never'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Widget 2: Company Overview */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[16px] font-bold text-gray-800">Company Registries</h3>
                                        <button onClick={() => setActiveMenu('Companies')} className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-xl border border-transparent hover:border-blue-200" title="Manage Companies">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3 flex-1">
                                        {allCompanies.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400">No registries found.</div>
                                        ) : allCompanies.slice(0, 4).map((comp, idx) => (
                                            <div key={comp.code} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100/60 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-100 transition-all group">
                                                <div className="flex items-center gap-3 w-[65%]">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-[12px] text-blue-600 uppercase shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                                                        {(comp.comp_Name || 'C').slice(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[13px] font-bold text-gray-800 leading-tight truncate">{comp.comp_Name || 'Unknown Entity'}</span>
                                                        <span className="text-[11px] font-medium text-gray-500 truncate">{comp.email || 'No Contact'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-sm ${comp.acc_Desable === 1 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        }`}>
                                                        {comp.acc_Desable === 1 ? 'Locked' : 'Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>
                    )}

                    {/* COMPANIES VIEW */}
                    {activeMenu === 'Companies' && (
                        <CompaniesView
                            isCreatingCompany={isCreatingCompany}
                            setIsCreatingCompany={setIsCreatingCompany}
                            createCompanyForm={createCompanyForm}
                            setCreateCompanyForm={setCreateCompanyForm}
                            creatingCompany={creatingCompany}
                            setCreatingCompany={setCreatingCompany}
                            currentUserName={currentUserName}
                            fetchCompanies={fetchAdminData}
                            setAlertConfig={setAlertConfig}
                            selectedEmpForCompanies={selectedEmpForCompanies}
                            setSelectedEmpForCompanies={setSelectedEmpForCompanies}
                            allCompanies={allCompanies}
                            searchTerm={searchTerm}
                            setSelectedCompany={setSelectedCompany}
                            handleToggleCompanyLock={handleToggleCompanyLock}
                            handleDeleteCompany={handleDeleteCompany}
                        />
                    )}

                    {/* EMPLOYEES VIEW */}
                    {activeMenu === 'Employees' && (
                        <EmployeesView
                            allEmployees={allEmployees}
                            searchTerm={searchTerm}
                            systemRoles={systemRoles}
                            setSelectedEmployeeView={setSelectedEmployeeView}
                            setEditingEmp={setEditingEmp}
                            setSelectedRoleId={setSelectedRoleId}
                            setSelectedGroupName={setSelectedGroupName}
                            handleToggleEmployeeLock={handleToggleEmployeeLock}
                            handleDeleteEmployee={handleDeleteEmployee}
                        />
                    )}

                    {/* DATABASE VIEW */}
                    {activeMenu === 'Database' && (
                        <DatabaseAdminBoard />
                    )}

                    {/* ACCOUNT TABLES VIEW */}
                    {activeMenu === 'Account Tables' && (
                        <AccountTablesView allCompanies={allCompanies} />
                    )}

                    {/* ROLE FEATURES VIEW */}
                    {activeMenu === 'Role Features' && (
                        <RoleFeaturesView
                            handleSeedFunctions={handleSeedFunctions}
                            seedingFunctions={seedingFunctions}
                            loadingPermissions={loadingPermissions}
                            handleAllowAllPermissions={handleAllowAllPermissions}
                            permissions={permissions}
                            handleInitiateSavePermissions={handleInitiateSavePermissions}
                            savingPermissions={savingPermissions}
                            systemRoles={systemRoles}
                            selectedRole={selectedRole}
                            setSelectedRole={setSelectedRole}
                            targetCompany={targetCompany}
                            setTargetCompany={setTargetCompany}
                            targetEmployee={targetEmployee}
                            setTargetEmployee={setTargetEmployee}
                            allCompanies={allCompanies}
                            allEmployees={allEmployees}
                            hierarchy={hierarchy}
                            setShowCreateRoleModal={setShowCreateRoleModal}
                            userGroups={userGroups}
                            setEditingUserRole={setEditingUserRole}
                            setEditRoleName={setEditRoleName}
                            setEditRoleDesc={setEditRoleDesc}
                            handleDeleteUserRole={handleDeleteUserRole}
                            permSearch={permSearch}
                            setPermSearch={setPermSearch}
                            handleTogglePermission={handleTogglePermission}
                        />
                    )}

                    {/* ADMIN CONFIG VIEW */}
                    {activeMenu === 'Admin Config' && (
                        <div className="bg-white border border-gray-200 rounded-[3px] shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-[3px] bg-blue-50 flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-gray-800">Admin Configuration</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">System-wide settings and preferences</p>
                                </div>
                            </div>
                            <div>
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
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">Admin Reports</h3>
                                    <p className="text-[12px] text-gray-500 font-medium">View system-wide reports and analytics data</p>
                                </div>
                            </div>
                            <div>
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
                                <div>
                                    <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role Name *</label>
                                            <input
                                                type="text"
                                                value={newRoleName}
                                                onChange={e => setNewRoleName(e.target.value)}
                                                placeholder="e.g. HR Manager"
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-700"
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
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-700"
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
                                            className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
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
                        <UserFeedbackView
                            feedbackData={feedbackData}
                            feedbackLoading={feedbackLoading}
                            handleDeleteFeedback={handleDeleteFeedback}
                            setFullScreenImage={setFullScreenImage}
                        />
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
                                <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldAlert className="text-blue-600" size={18} />
                                    Manage Employee Role
                                </h3>
                                <button onClick={() => setEditingEmp(null)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[3px] transition-all">
                                    <X size={28} strokeWidth={1.5} className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[12px] text-gray-500 mt-1">Editing <span className="font-bold text-gray-800">{editingEmp.empName || editingEmp.emp_Name}</span> ({editingEmp.empCode || editingEmp.emp_Code})</p>
                        </div>

                        {/* Body */}
                        <div>
                            {/* Employee Info Card */}
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 rounded-[3px]">
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
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                    : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-600/50 text-gray-600'
                                                    }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-[3px]">
                                    <p className="text-[11px] text-gray-500 leading-snug">
                                        <span className="font-bold text-gray-600">Simplified Assignment:</span> Clicking a role automatically assigns both the Role Level (ID {selectedRoleId || '?'}) and maps the user to the correct Member Group (<span className="text-blue-600 font-mono">{selectedGroupName || '?'}</span>).
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
                                    className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
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
                    <div className="bg-white border border-gray-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-xl shadow-sm">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-black text-gray-800">Employee Details</h3>
                                    <p className="text-[12px] font-bold text-gray-500 mt-0.5">{selectedEmployeeView.emp_Name || selectedEmployeeView.empName || 'N/A'} <span className="text-blue-600 font-mono">({selectedEmployeeView.emp_Code || selectedEmployeeView.empCode})</span></p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployeeView(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
                                <X size={28} strokeWidth={2} className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {Object.entries({
                                    ...selectedEmployeeView,
                                    'PASSWORD': selectedEmployeeView.pass_Word || selectedEmployeeView.password || selectedEmployeeView.Pass_Word || '•••••••• (Encrypted by Backend)'
                                })
                                    .filter(([key, value]) => typeof value !== 'object' && key !== 'companies' && key !== 'pass_Word' && key !== 'password' && key !== 'Pass_Word')
                                    .map(([key, value], index, array) => (
                                        <div key={key} className={`${key === 'PASSWORD' && array.length % 2 !== 0 ? 'md:col-span-2' : ''}`}>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">{key.replace(/_/g, ' ')}</label>
                                            <div className="w-full min-h-[44px] border border-gray-200 bg-white rounded-xl px-4 py-2.5 flex items-center shadow-sm group hover:border-blue-400 hover:shadow-md transition-all">
                                                <span className="text-[14px] font-bold text-gray-700 break-all">{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-gray-400 font-normal italic">Empty</span>}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-white flex justify-end shrink-0">
                            <button onClick={() => setSelectedEmployeeView(null)} className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-[13px] rounded-xl shadow-sm hover:bg-gray-100 hover:text-gray-900 transition-all">
                                Close Window
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
                        <div>
                            <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role Name *</label>
                                    <input
                                        type="text"
                                        value={editRoleName}
                                        onChange={e => setEditRoleName(e.target.value)}
                                        placeholder="e.g. HR Manager"
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-gray-700"
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
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-gray-700"
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
                                    className="px-6 h-10 bg-[#2563eb] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"
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
                            <DotLottiePlayer worker={false} src="/lottiefile/AI loading.lottie?v=1" autoplay loop style={{ width: '100%', height: '100%' }} />
                        </div>
                    </button>
                </div>
            )}

            {/* AI Typing Animation Overlay */}
            {showAITyping && (
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-8 max-w-2xl px-8">
                        <div className="w-16 h-16 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
                        <div className="h-16 flex items-center justify-center">
                            <span className="text-white/90 text-2xl md:text-[#2563eb]xl font-light tracking-wide">
                                {aiTypingText}
                                <span className="animate-pulse ml-0.5 text-[#2563eb]">|</span>
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




