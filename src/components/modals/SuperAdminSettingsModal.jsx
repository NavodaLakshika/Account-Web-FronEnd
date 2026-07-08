import React, { useState } from 'react';

import { 
    X, Moon, Sun, Sparkles, Bell, ShieldAlert,
    Save, KeyRound, LayoutDashboard, Clock, Monitor, RefreshCw,
    Palette, Type, CalendarDays, CircleDollarSign, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AlertModal from './AlertModal';

const SuperAdminSettingsModal = ({ 
    isOpen, 
    onClose, 
    darkMode, 
    setDarkMode, 
    animationsEnabled, 
    setAnimationsEnabled,
    compactMode,
    setCompactMode,
    sessionTimeout,
    setSessionTimeout,
    defaultView,
    setDefaultView,
    autoRefresh,
    setAutoRefresh,
    currentUserCode 
}) => {
    const [activeTab, setActiveTab] = useState('appearance');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem('saNotificationsEnabled');
        return saved ? saved === 'true' : true;
    });

    const [themeColor, setThemeColor] = useState(() => localStorage.getItem('saThemeColor') || 'blue');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('saFontSize') || 'normal');
    const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('saDateFormat') || 'DD/MM/YYYY');
    const [currencyFormat, setCurrencyFormat] = useState(() => localStorage.getItem('saCurrencyFormat') || 'USD');
    const [auditLogEnabled, setAuditLogEnabled] = useState(() => {
        const saved = localStorage.getItem('saAuditLogEnabled');
        return saved ? saved === 'true' : true;
    });
    
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
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false); // Used for Email OTP verify
    const [is2FAAppModalOpen, setIs2FAAppModalOpen] = useState(false); // Used for App OTP verify
    const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
    const [disable2FAPassword, setDisable2FAPassword] = useState('');

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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full md:w-[450px] lg:w-[450px] h-full bg-slate-50 dark:bg-[#0f172a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-gray-800">
                
                {/* Header */}
                <div className="h-14 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 bg-white dark:bg-[#1e293b] sticky top-0 z-10">
                    <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-[#0285fd]" />
                        Settings
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-[3px] transition-colors ml-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-gray-800 px-2 shrink-0 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'appearance' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}
                    >
                        <Sparkles size={16} /> Appearance
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}
                    >
                        <ShieldAlert size={16} /> Security
                    </button>
                    <button 
                        onClick={() => setActiveTab('preferences')}
                        className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'preferences' ? 'border-[#0285fd] text-[#0285fd]' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}
                    >
                        <Bell size={16} /> Preferences
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 md:p-6 overflow-y-auto">
                    {activeTab === 'appearance' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="text-[16px] font-bold text-slate-800 dark:text-white mb-4">Appearance</h3>
                            
                            <div className="space-y-0">
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Dark Mode</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Toggle system theme</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Background Animations</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Animated particles in the background</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={animationsEnabled} onChange={(e) => {
                                            setAnimationsEnabled(e.target.checked);
                                            localStorage.setItem('saAnimationsEnabled', e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Compact Mode</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Tighter layout for tables</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={compactMode} onChange={(e) => {
                                            setCompactMode(e.target.checked);
                                            localStorage.setItem('saCompactMode', e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Theme Color</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Primary dashboard color</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={themeColor}
                                        onChange={(e) => {
                                            setThemeColor(e.target.value);
                                            localStorage.setItem('saThemeColor', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="blue">Blue (Default)</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="violet">Violet</option>
                                        <option value="rose">Rose</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Font Size</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Global text scaling</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={fontSize}
                                        onChange={(e) => {
                                            setFontSize(e.target.value);
                                            localStorage.setItem('saFontSize', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="small">Small</option>
                                        <option value="normal">Normal</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Security</h3>
                            
                            <div className="space-y-0 mb-6">
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Session Timeout</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Auto-logout duration</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={sessionTimeout}
                                        onChange={(e) => {
                                            setSessionTimeout(e.target.value);
                                            localStorage.setItem('saSessionTimeout', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                        <option value="never">Never Logout</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Two-Factor Auth</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Require 2FA for Super Admin</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={is2FAEnabled} onChange={handleToggle2FA} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Activity Audit Log</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Track all admin actions</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={auditLogEnabled} onChange={(e) => {
                                            setAuditLogEnabled(e.target.checked);
                                            localStorage.setItem('saAuditLogEnabled', e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>
                            </div>
                            
                            <form onSubmit={handlePasswordChange} className="space-y-4 flex-1 mt-4">
                                <div className="py-5 border-t border-slate-100 dark:border-gray-800 space-y-4">
                                    <div className="flex items-center gap-3 mb-4 text-slate-800 dark:text-white font-medium text-lg">
                                        <KeyRound size={20} className="text-[#0285fd]" /> Change Password
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[13px] font-medium text-slate-600 dark:text-gray-400 mb-1.5">Current Password</label>
                                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2.5 outline-none focus:border-[#0285fd] transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-slate-600 dark:text-gray-400 mb-1.5">New Password</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2.5 outline-none focus:border-[#0285fd] transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-slate-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2.5 outline-none focus:border-[#0285fd] transition-colors" required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={isChangingPassword} className="flex items-center gap-2 bg-[#0285fd] hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-none text-[14px] font-bold transition-all shadow-md">
                                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Preferences</h3>
                            
                            <div className="space-y-0">
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Default View</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Initial page after login</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={defaultView}
                                        onChange={(e) => {
                                            setDefaultView(e.target.value);
                                            localStorage.setItem('saDefaultView', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="Dashboard">Dashboard</option>
                                        <option value="Companies">Companies</option>
                                        <option value="Employees">Employees</option>
                                        <option value="Database">Database</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Auto-Refresh Data</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Refresh every 5 minutes</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={autoRefresh} onChange={(e) => {
                                            setAutoRefresh(e.target.checked);
                                            localStorage.setItem('saAutoRefresh', e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>
                                
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Push Notifications</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Receive alerts for important events</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={(e) => {
                                            setNotificationsEnabled(e.target.checked);
                                            localStorage.setItem('saNotificationsEnabled', e.target.checked);
                                        }} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0285fd]"></div>
                                    </label>
                                </div>
                                
                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Language</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Dashboard localization</p>
                                        </div>
                                    </div>
                                    <select 
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Date Format</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">System-wide date display</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={dateFormat}
                                        onChange={(e) => {
                                            setDateFormat(e.target.value);
                                            localStorage.setItem('saDateFormat', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-slate-800 dark:text-white">Currency</h4>
                                            <p className="text-[13px] text-slate-500 dark:text-gray-400">Default currency symbol</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={currencyFormat}
                                        onChange={(e) => {
                                            setCurrencyFormat(e.target.value);
                                            localStorage.setItem('saCurrencyFormat', e.target.value);
                                        }}
                                        className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-3 py-1.5 outline-none focus:border-[#0285fd] transition-colors"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="LKR">LKR (Rs)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
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

            {/* Enter Email for 2FA Sub-Modal */}
            {is2FAEmailModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIs2FAEmailModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-none">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Set up Email 2FA</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                            Please enter your email address. We will send you a 6-digit verification code.
                        </p>
                        <div>
                            <input 
                                type="email" 
                                value={setupEmail} 
                                onChange={(e) => setSetupEmail(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2 outline-none focus:border-[#0285fd] mb-4" 
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAEmailModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-none text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleSendSetupEmail} disabled={!setupEmail || !setupEmail.includes('@')} className="px-4 py-2 bg-[#0285fd] text-white rounded-none text-sm font-medium hover:bg-blue-600 disabled:opacity-50">Send Code</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enable 2FA Verify OTP Sub-Modal */}
            {is2FAModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIs2FAModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-none">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Verify Email</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                            We've sent a verification code to <span className="font-semibold">{setupEmail}</span>.
                        </p>
                        <div>
                            <label className="block text-[13px] font-medium text-slate-600 dark:text-gray-400 mb-1.5">Enter 6-digit code</label>
                            <input 
                                type="text" 
                                value={twoFAOTP} 
                                onChange={(e) => setTwoFAOTP(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2 outline-none focus:border-[#0285fd] text-center tracking-widest font-mono mb-4" 
                                maxLength={6}
                                placeholder="000000"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-none text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleEnable2FAEmail} disabled={twoFAOTP.length !== 6} className="px-4 py-2 bg-[#0285fd] text-white rounded-none text-sm font-medium hover:bg-blue-600 disabled:opacity-50">Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Select 2FA Method Modal */}
            {is2FAMethodModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIs2FAMethodModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-none">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Choose 2FA Method</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">
                            How would you like to receive your verification codes?
                        </p>
                        <div className="flex flex-col gap-3 mb-4">
                            <button 
                                onClick={() => handleSelect2FAMethod('APP')} 
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-[#1e293b] dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-none transition-colors"
                            >
                                <span className="block font-bold text-slate-800 dark:text-white mb-1">Authenticator App</span>
                                <span className="block text-xs text-slate-500">Google Authenticator, Authy, etc.</span>
                            </button>
                            <button 
                                onClick={() => handleSelect2FAMethod('EMAIL')} 
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-[#1e293b] dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-none transition-colors"
                            >
                                <span className="block font-bold text-slate-800 dark:text-white mb-1">Email Verification</span>
                                <span className="block text-xs text-slate-500">Receive a 6-digit code via email.</span>
                            </button>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setIs2FAMethodModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-none text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enable 2FA Verify APP Sub-Modal */}
            {is2FAAppModalOpen && twoFASetupData && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIs2FAAppModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-none">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Set up Authenticator App</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                            Scan the QR code below with your authenticator app (like Google Authenticator).
                        </p>
                        <div className="flex justify-center mb-4 bg-white p-2 border border-slate-200">
                            <img src={twoFASetupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <div className="mb-4 text-center">
                            <span className="text-xs text-slate-500 dark:text-gray-400">Or enter this code manually:</span>
                            <div className="font-mono bg-slate-100 dark:bg-gray-800 p-2 mt-1 text-slate-800 dark:text-white text-sm select-all">
                                {twoFASetupData.secret}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-slate-600 dark:text-gray-400 mb-1.5">Enter 6-digit code</label>
                            <input 
                                type="text" 
                                value={twoFAOTP} 
                                onChange={(e) => setTwoFAOTP(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2 outline-none focus:border-[#0285fd] text-center tracking-widest font-mono mb-4" 
                                maxLength={6}
                                placeholder="000000"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIs2FAAppModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-none text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleEnable2FAApp} disabled={twoFAOTP.length !== 6} className="px-4 py-2 bg-[#0285fd] text-white rounded-none text-sm font-medium hover:bg-blue-600 disabled:opacity-50">Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable 2FA Sub-Modal */}
            {isDisable2FAModalOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDisable2FAModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 shadow-2xl animate-in zoom-in-95 duration-200 rounded-none">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Disable 2FA</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                            Please enter your password to disable Two-Factor Authentication.
                        </p>
                        <div>
                            <input 
                                type="password" 
                                value={disable2FAPassword} 
                                onChange={(e) => setDisable2FAPassword(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-[14px] rounded-none px-4 py-2 outline-none focus:border-[#0285fd] mb-4" 
                                placeholder="Your password"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsDisable2FAModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-none text-sm font-medium hover:bg-slate-300 dark:hover:bg-gray-700">Cancel</button>
                            <button onClick={handleDisable2FA} disabled={!disable2FAPassword} className="px-4 py-2 bg-red-500 text-white rounded-none text-sm font-medium hover:bg-red-600 disabled:opacity-50">Disable 2FA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSettingsModal;
