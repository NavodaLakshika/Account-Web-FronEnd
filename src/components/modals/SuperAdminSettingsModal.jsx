import React, { useState } from 'react';
import {
    X, Bell, ShieldAlert, Settings,
    Save, KeyRound, LayoutDashboard, Clock, RefreshCw,
    Palette, Type, CalendarDays, CircleDollarSign, Activity, Server
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AlertModal from './AlertModal';

const SuperAdminSettingsModal = ({
    isOpen,
    onClose,
    sessionTimeout: externalSessionTimeout,
    setSessionTimeout: externalSetSessionTimeout,
    defaultView: externalDefaultView,
    setDefaultView: externalSetDefaultView,
    autoRefresh: externalAutoRefresh,
    setAutoRefresh: externalSetAutoRefresh,
    notificationsEnabled: externalNotifications,
    setNotificationsEnabled: externalSetNotifications,
    currentUserCode,
    maintenanceMode: externalMaintenance,
    setMaintenanceMode: externalSetMaintenance,
    debugLogging: externalDebug,
    setDebugLogging: externalSetDebug,
    dataRetention: externalRetention,
    setDataRetention: externalSetRetention,
    systemLanguage: externalLanguage,
    setSystemLanguage: externalSetLanguage,
    timezone: externalTimezone,
    setTimezone: externalSetTimezone,
    ipWhitelisting: externalIp,
    setIpWhitelisting: externalSetIp,
    strictPassword: externalStrict,
    setStrictPassword: externalSetStrict,
    auditLogEnabled: externalAudit,
    setAuditLogEnabled: externalSetAudit
}) => {
    const [activeTab, setActiveTab] = useState('security');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success'
    });

    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [twoFASetupData, setTwoFASetupData] = useState(null);
    const [twoFAOTP, setTwoFAOTP] = useState('');
    const [setupEmail, setSetupEmail] = useState('');
    const [is2FAMethodModalOpen, setIs2FAMethodModalOpen] = useState(false);
    const [is2FAEmailModalOpen, setIs2FAEmailModalOpen] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [is2FAAppModalOpen, setIs2FAAppModalOpen] = useState(false);
    const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
    const [disable2FAPassword, setDisable2FAPassword] = useState('');

    const [internalSessionTimeout, setInternalSessionTimeout] = useState(externalSessionTimeout || localStorage.getItem('saSessionTimeout') || '30');
    const [internalDefaultView, setInternalDefaultView] = useState(externalDefaultView || localStorage.getItem('saDefaultView') || 'Dashboard');
    const [internalAutoRefresh, setInternalAutoRefresh] = useState(externalAutoRefresh !== undefined ? externalAutoRefresh : localStorage.getItem('saAutoRefresh') === 'true');
    const [internalNotifications, setInternalNotifications] = useState(externalNotifications !== undefined ? externalNotifications : localStorage.getItem('saNotificationsEnabled') === 'true');
    const [internalMaintenance, setInternalMaintenance] = useState(externalMaintenance !== undefined ? externalMaintenance : localStorage.getItem('saMaintenanceMode') === 'true');
    const [internalDebug, setInternalDebug] = useState(externalDebug !== undefined ? externalDebug : localStorage.getItem('saDebugLogging') === 'true');
    const [internalRetention, setInternalRetention] = useState(externalRetention || localStorage.getItem('saDataRetention') || '90');
    const [internalLanguage, setInternalLanguage] = useState(externalLanguage || localStorage.getItem('saSystemLanguage') || 'en');
    const [internalTimezone, setInternalTimezone] = useState(externalTimezone || localStorage.getItem('saTimezone') || 'local');
    const [internalIp, setInternalIp] = useState(externalIp !== undefined ? externalIp : localStorage.getItem('saIpWhitelisting') === 'true');
    const [internalStrict, setInternalStrict] = useState(externalStrict !== undefined ? externalStrict : localStorage.getItem('saStrictPassword') === 'true');
    const [internalAudit, setInternalAudit] = useState(externalAudit !== undefined ? externalAudit : localStorage.getItem('saAuditLogEnabled') === 'true');

    const sessionTimeout = externalSessionTimeout !== undefined ? externalSessionTimeout : internalSessionTimeout;
    const defaultView = externalDefaultView !== undefined ? externalDefaultView : internalDefaultView;
    const autoRefresh = externalAutoRefresh !== undefined ? externalAutoRefresh : internalAutoRefresh;
    const notificationsEnabled = externalNotifications !== undefined ? externalNotifications : internalNotifications;
    const maintenanceMode = externalMaintenance !== undefined ? externalMaintenance : internalMaintenance;
    const debugLogging = externalDebug !== undefined ? externalDebug : internalDebug;
    const dataRetention = externalRetention !== undefined ? externalRetention : internalRetention;
    const systemLanguage = externalLanguage !== undefined ? externalLanguage : internalLanguage;
    const timezone = externalTimezone !== undefined ? externalTimezone : internalTimezone;
    const ipWhitelisting = externalIp !== undefined ? externalIp : internalIp;
    const strictPassword = externalStrict !== undefined ? externalStrict : internalStrict;
    const auditLogEnabled = externalAudit !== undefined ? externalAudit : internalAudit;

    const handleSessionTimeout = (val) => {
        setInternalSessionTimeout(val);
        localStorage.setItem('saSessionTimeout', val);
        if (externalSetSessionTimeout) externalSetSessionTimeout(val);
    };

    const handleDefaultView = (val) => {
        setInternalDefaultView(val);
        localStorage.setItem('saDefaultView', val);
        if (externalSetDefaultView) externalSetDefaultView(val);
    };

    const handleAutoRefresh = (val) => {
        setInternalAutoRefresh(val);
        localStorage.setItem('saAutoRefresh', val);
        if (externalSetAutoRefresh) externalSetAutoRefresh(val);
    };

    const handleNotifications = (val) => {
        setInternalNotifications(val);
        localStorage.setItem('saNotificationsEnabled', val);
        if (externalSetNotifications) externalSetNotifications(val);
    };

    const handleMaintenance = (val) => {
        setInternalMaintenance(val);
        localStorage.setItem('saMaintenanceMode', val);
        if (externalSetMaintenance) externalSetMaintenance(val);
    };

    const handleDebug = (val) => {
        setInternalDebug(val);
        localStorage.setItem('saDebugLogging', val);
        if (externalSetDebug) externalSetDebug(val);
    };

    const handleRetention = (val) => {
        setInternalRetention(val);
        localStorage.setItem('saDataRetention', val);
        if (externalSetRetention) externalSetRetention(val);
    };

    const handleLanguage = (val) => {
        setInternalLanguage(val);
        localStorage.setItem('saSystemLanguage', val);
        if (externalSetLanguage) externalSetLanguage(val);
    };

    const handleTimezone = (val) => {
        setInternalTimezone(val);
        localStorage.setItem('saTimezone', val);
        if (externalSetTimezone) externalSetTimezone(val);
    };

    const handleIp = (val) => {
        setInternalIp(val);
        localStorage.setItem('saIpWhitelisting', val);
        if (externalSetIp) externalSetIp(val);
    };

    const handleStrict = (val) => {
        setInternalStrict(val);
        localStorage.setItem('saStrictPassword', val);
        if (externalSetStrict) externalSetStrict(val);
    };

    const handleAudit = (val) => {
        setInternalAudit(val);
        localStorage.setItem('saAuditLogEnabled', val);
        if (externalSetAudit) externalSetAudit(val);
    };

    React.useEffect(() => {
        if (isOpen && currentUserCode) {
            fetch2FAStatus();
        }
    }, [isOpen, currentUserCode]);

    const fetch2FAStatus = async () => {
        try {
            const res = await api.get(`/UserProfile/2fa-status/${currentUserCode}`);
            setIs2FAEnabled(res.data.is2FAEnabled);
        } catch (error) {
            console.error("Failed to fetch 2FA status", error);
        }
    };

    const handleToggle2FA = async () => {
        if (is2FAEnabled) {
            setIsDisable2FAModalOpen(true);
        } else {
            setIs2FAMethodModalOpen(true);
        }
    };

    const handleSelect2FAMethod = async (method) => {
        setIs2FAMethodModalOpen(false);
        if (method === 'EMAIL') {
            setIs2FAEmailModalOpen(true);
        } else if (method === 'APP') {
            try {
                const res = await api.post('/UserProfile/2fa-setup-app', { EmpCode: currentUserCode });
                setTwoFASetupData(res.data);
                setIs2FAAppModalOpen(true);
            } catch (error) {
                setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to initiate 2FA setup.', variant: 'warning' });
            }
        }
    };

    const handleSendSetupEmail = async () => {
        if (!setupEmail || !setupEmail.includes('@')) {
            setAlertConfig({ isOpen: true, title: 'Error', message: 'Please enter a valid email address.', variant: 'warning' });
            return;
        }
        try {
            await api.post('/UserProfile/2fa-setup-email', { EmpCode: currentUserCode, Email: setupEmail });
            setIs2FAEmailModalOpen(false);
            setIs2FAModalOpen(true);
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Verification code sent to your email!', variant: 'success' });
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to send verification code.', variant: 'warning' });
        }
    };

    const handleEnable2FAEmail = async () => {
        try {
            await api.post('/UserProfile/2fa-enable-email', {
                EmpCode: currentUserCode,
                Email: setupEmail,
                Code: twoFAOTP
            });
            setIs2FAEnabled(true);
            setIs2FAModalOpen(false);
            setTwoFAOTP('');
            setSetupEmail('');
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Two-Factor Authentication (Email) enabled successfully!', variant: 'success' });
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Invalid code.', variant: 'warning' });
        }
    };

    const handleEnable2FAApp = async () => {
        try {
            await api.post('/UserProfile/2fa-enable-app', {
                EmpCode: currentUserCode,
                Secret: twoFASetupData.secret,
                Code: twoFAOTP
            });
            setIs2FAEnabled(true);
            setIs2FAAppModalOpen(false);
            setTwoFAOTP('');
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Two-Factor Authentication (App) enabled successfully!', variant: 'success' });
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Invalid code.', variant: 'warning' });
        }
    };

    const handleDisable2FA = async () => {
        try {
            await api.post('/UserProfile/2fa-disable', {
                EmpCode: currentUserCode,
                Password: disable2FAPassword
            });
            setIs2FAEnabled(false);
            setIsDisable2FAModalOpen(false);
            setDisable2FAPassword('');
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Two-Factor Authentication disabled.', variant: 'success' });
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Invalid password.', variant: 'warning' });
        }
    };

    if (!isOpen) return null;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setAlertConfig({ isOpen: true, title: 'Error', message: 'New passwords do not match.', variant: 'warning' });
            return;
        }
        if (newPassword.length < 6) {
            setAlertConfig({ isOpen: true, title: 'Error', message: 'Password must be at least 6 characters.', variant: 'warning' });
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.post('/UserProfile/changePassword', {
                EmpCode: currentUserCode,
                CurrentPassword: currentPassword,
                NewPassword: newPassword,
                LastModUser: currentUserCode
            });
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Password changed successfully!', variant: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || "Failed to change password", variant: 'warning' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

            <div className="relative w-full md:w-[450px] lg:w-[450px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 font-['Tahoma']">

                {/* Header */}
                <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white sticky top-0 z-10">
                    <h2 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2">
                        <Settings size={16} className="text-[#0285fd]" /> Settings
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors ml-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-white border-b border-gray-200 px-2 shrink-0 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'preferences' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Preferences
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'system' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        System
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 md:p-6 overflow-y-auto">
                    {activeTab === 'security' && (
                        <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-[16px] font-bold text-gray-800 mb-4">Security</h3>

                            <div className="space-y-0">
                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Session Timeout</h4>
                                            <p className="text-[13px] text-gray-500">Auto-logout duration</p>
                                        </div>
                                    </div>
                                    <select
                                        value={sessionTimeout}
                                        onChange={(e) => handleSessionTimeout(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-[14px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors"
                                    >
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="never">Never Logout</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Two-Factor Auth</h4>
                                            <p className="text-[13px] text-gray-500">Require 2FA for Super Admin</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={is2FAEnabled} onChange={handleToggle2FA} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Activity Audit Log</h4>
                                            <p className="text-[13px] text-gray-500">Track all admin actions</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={auditLogEnabled} onChange={(e) => handleAudit(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">IP Whitelisting</h4>
                                            <p className="text-[13px] text-gray-500">Restrict access to known IPs</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={ipWhitelisting} onChange={(e) => handleIp(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Strict Password Policy</h4>
                                            <p className="text-[13px] text-gray-500">Require complex passwords globally</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={strictPassword} onChange={(e) => handleStrict(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                                <div className="py-5 border-t border-gray-200 space-y-4">
                                    <div className="flex items-center gap-3 mb-4 text-gray-800 font-medium text-lg">
                                        <KeyRound size={20} className="text-[#0285fd]" /> Change Password
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Current Password</label>
                                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" required />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">New Password</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" required />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={isChangingPassword} className="flex items-center gap-2 bg-[#0285fd] hover:bg-[#0073ff] disabled:opacity-50 text-white px-6 py-2.5 rounded-[3px] text-[14px] font-bold transition-all shadow-sm">
                                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div>
                            <h3 className="text-[16px] font-bold text-gray-800 mb-4">Preferences</h3>

                            <div className="space-y-0">
                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Default View</h4>
                                            <p className="text-[13px] text-gray-500">Initial page after login</p>
                                        </div>
                                    </div>
                                    <select
                                        value={defaultView}
                                        onChange={(e) => handleDefaultView(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-[14px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors"
                                    >
                                        <option value="Dashboard">Dashboard</option>
                                        <option value="Companies">Companies</option>
                                        <option value="Employees">Employees</option>
                                        <option value="Database">Database</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Auto-Refresh Data</h4>
                                            <p className="text-[13px] text-gray-500">Refresh every 5 minutes</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={autoRefresh} onChange={(e) => handleAutoRefresh(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Push Notifications</h4>
                                            <p className="text-[13px] text-gray-500">Receive alerts for important events</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={(e) => handleNotifications(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Language</h4>
                                            <p className="text-[13px] text-gray-500">Dashboard localization</p>
                                        </div>
                                    </div>
                                    <select
                                        value={systemLanguage}
                                        onChange={(e) => handleLanguage(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-[14px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Timezone</h4>
                                            <p className="text-[13px] text-gray-500">System time display format</p>
                                        </div>
                                    </div>
                                    <select
                                        value={timezone}
                                        onChange={(e) => handleTimezone(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-[14px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors"
                                    >
                                        <option value="local">Local System Time</option>
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="EST">EST (Eastern Standard Time)</option>
                                        <option value="PST">PST (Pacific Standard Time)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div>
                            <h3 className="text-[16px] font-bold text-gray-800 mb-4">System & Advanced</h3>

                            <div className="space-y-0">
                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Maintenance Mode</h4>
                                            <p className="text-[13px] text-gray-500">Disable non-admin logins globally</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={(e) => handleMaintenance(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Debug Logging</h4>
                                            <p className="text-[13px] text-gray-500">Enable verbose frontend logging</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={debugLogging} onChange={(e) => handleDebug(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-gray-200 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-gray-800">Data Retention Policy</h4>
                                            <p className="text-[13px] text-gray-500">Keep audit logs and backups for</p>
                                        </div>
                                    </div>
                                    <select
                                        value={dataRetention}
                                        onChange={(e) => handleRetention(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-[14px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors"
                                    >
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days</option>
                                        <option value="180">6 Months</option>
                                        <option value="365">1 Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />

            {/* 2FA Sub-Modals */}
            {is2FAEmailModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-sm bg-white p-6 shadow-2xl rounded-[3px]">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-2">Set up Email 2FA</h3>
                        <p className="text-[13px] text-gray-500 mb-4">Enter your email to receive a 6-digit verification code.</p>
                        <input
                            type="email"
                            value={setupEmail}
                            onChange={(e) => setSetupEmail(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] mb-4 text-gray-700 placeholder:text-gray-400"
                            placeholder="your.email@example.com"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAEmailModalOpen(false)} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all">Cancel</button>
                            <button onClick={handleSendSetupEmail} disabled={!setupEmail || !setupEmail.includes('@')} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all disabled:opacity-50">Send Code</button>
                        </div>
                    </div>
                </div>
            )}

            {is2FAModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-sm bg-white p-6 shadow-2xl rounded-[3px]">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-2">Verify Email</h3>
                        <p className="text-[13px] text-gray-500 mb-4">Code sent to <span className="font-semibold">{setupEmail}</span>.</p>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Enter 6-digit code</label>
                        <input
                            type="text"
                            value={twoFAOTP}
                            onChange={(e) => setTwoFAOTP(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] text-center tracking-widest font-mono mb-4 text-gray-700"
                            maxLength={6}
                            placeholder="000000"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAModalOpen(false)} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all">Cancel</button>
                            <button onClick={handleEnable2FAEmail} disabled={twoFAOTP.length !== 6} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all disabled:opacity-50">Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}

            {is2FAMethodModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-sm bg-white p-6 shadow-2xl rounded-[3px]">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-2">Choose 2FA Method</h3>
                        <p className="text-[13px] text-gray-500 mb-4">How would you like to receive verification codes?</p>
                        <div className="flex flex-col gap-3 mb-4">
                            <button
                                onClick={() => handleSelect2FAMethod('APP')}
                                className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#0285fd] rounded-[3px] transition-colors"
                            >
                                <span className="block font-bold text-gray-800 mb-1">Authenticator App</span>
                                <span className="block text-[12px] text-gray-500">Google Authenticator, Authy, etc.</span>
                            </button>
                            <button
                                onClick={() => handleSelect2FAMethod('EMAIL')}
                                className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:border-[#0285fd] rounded-[3px] transition-colors"
                            >
                                <span className="block font-bold text-gray-800 mb-1">Email Verification</span>
                                <span className="block text-[12px] text-gray-500">Receive a 6-digit code via email.</span>
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={() => setIs2FAMethodModalOpen(false)} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {is2FAAppModalOpen && twoFASetupData && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-sm bg-white p-6 shadow-2xl rounded-[3px]">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-2">Set up Authenticator App</h3>
                        <p className="text-[13px] text-gray-500 mb-4">Scan the QR code with your authenticator app.</p>
                        <div className="flex justify-center mb-4 bg-white p-2 border border-gray-200 rounded-[3px]">
                            <img src={twoFASetupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <div className="mb-4 text-center">
                            <span className="text-[12px] text-gray-500">Or enter this code manually:</span>
                            <div className="font-mono bg-gray-50 border border-gray-200 p-2 mt-1 text-gray-700 text-sm select-all rounded-[3px]">
                                {twoFASetupData.secret}
                            </div>
                        </div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Enter 6-digit code</label>
                        <input
                            type="text"
                            value={twoFAOTP}
                            onChange={(e) => setTwoFAOTP(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] text-center tracking-widest font-mono mb-4 text-gray-700"
                            maxLength={6}
                            placeholder="000000"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAAppModalOpen(false)} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all">Cancel</button>
                            <button onClick={handleEnable2FAApp} disabled={twoFAOTP.length !== 6} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all disabled:opacity-50">Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}

            {isDisable2FAModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-sm bg-white p-6 shadow-2xl rounded-[3px]">
                        <h3 className="text-[16px] font-bold text-gray-800 mb-2">Disable 2FA</h3>
                        <p className="text-[13px] text-gray-500 mb-4">Enter your password to disable Two-Factor Authentication.</p>
                        <input
                            type="password"
                            value={disable2FAPassword}
                            onChange={(e) => setDisable2FAPassword(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] mb-4 text-gray-700 placeholder:text-gray-400"
                            placeholder="Your password"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsDisable2FAModalOpen(false)} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all">Cancel</button>
                            <button onClick={handleDisable2FA} disabled={!disable2FAPassword} className="px-6 h-10 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all disabled:opacity-50">Disable 2FA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSettingsModal;
