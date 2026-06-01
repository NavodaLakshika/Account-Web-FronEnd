import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottiePlayer } from '@dotlottie/react-player';

import {
    LogOut,
    UserPlus,
    Users,
    Truck,
    FileText,
    CreditCard,
    PenTool,
    Wallet,
    ArrowDownLeft,
    BookOpen,
    RefreshCcw,
    BarChart2,
    Search,
    HelpCircle,
    Settings,
    ShieldCheck,
    ChevronRight,
    Building2,
    Menu,
    Bot,
    Calculator,
    LayoutDashboard,
    Bell,
    Receipt,
    PieChart,
    LayoutGrid,
    ShoppingCart,
    Package,
    FilePlus,
    RefreshCw,
    Box,
    Book,
    Megaphone,
    Star,
    Clock,
    Plus,
    X,
    Sparkles,
    SlidersHorizontal,
    Eye,
    EyeOff,
    Lock,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';

import { authService } from '../services/auth.service';
import { systemLocksService } from '../services/systemLocks.service';

import NewAccountBoard from './NewAccountBoard';
import CustomerMasterBoard from '../components/modals/MasterSubModal/CustomerMasterBoard';
import SupplierMasterBoard from '../components/modals/MasterSubModal/SupplierMasterBoard';
import EnterBillBoard from './EnterBillBoard';
import PayBillBoard from './PayBillBoard';
import WriteChequeBoard from './WriteChequeBoard';
import MakeDepositBoard from './MakeDepositBoard';
import JournalEntryBoard from './JournalEntryBoard';
import BankReconciliationBoard from './BankReconciliationBoard';
import TrialBalanceBoard from './TrialBalanceBoard';
import DocumentSearchBoard from './DocumentSearchBoard';
import PurchaseOrderBoard from '../HomeMaster/PurchaseOrderBoard';
import GRNBoard from '../HomeMaster/GRNBoard';
import BulkGRNBoard from '../HomeMaster/BulkGRNBoard';
import PettyCashBoard from '../HomeMaster/PettyCashBoard';
import SalesOrderBoard from '../HomeMaster/SalesOrderBoard';
import SalesReceiptBoard from '../HomeMaster/SalesReceiptBoard';
import ReceivePaymentBoard from '../HomeMaster/ReceivePaymentBoard';
import ChequeRegisterBoard from '../HomeMaster/ChequeRegisterBoard';

import MarketingToolBoard from '../HomeMaster/MarketingToolBoard';
import AccountBalanceBoard from '../HomeMaster/AccountBalanceBoard';
import ReminderBoard from '../HomeMaster/ReminderBoard';
import ReminderListBoard from '../HomeMaster/ReminderListBoard';
import SalesInvoiceBoard from '../HomeMaster/SalesInvoiceBoard';
import SystemSettingsBoard from '../HomeMaster/SystemSettingsBoard';
import MasterFileModal from '../components/modals/MasterFileModal';
import ViewUtilityModal from '../components/modals/ViewUtilityModal';
import TransactionModal from '../components/modals/TransactionModal';
import ReportsModal from '../components/modals/AdminReports/ReportsModal';
import SystemAdminModal from '../components/modals/SystemAdmin/SystemAdminModal';
import SideBar from '../components/SideBar';
import ChangePasswordBoard from '../components/modals/ChangePasswordBoard';
import ThankYouModal from '../components/modals/ThankYouModal';
import SoftwareAboutModal from '../components/modals/SoftwareAboutModal';
import AdvancePayBoard from './AdvancePayBoard';
import CustomerAdvanceBoard from './CustomerAdvanceBoard';
import CustomerInvoiceBoard from './CustomerInvoiceBoard';
import ReceivedPaymentBoard from './ReceivedPaymentBoard';
import CustomerReceiptBoard from './CustomerReceiptBoard';
import OpeningBalanceBoard from './OpeningBalanceBoard';
import MainCashBoard from './MainCashBoard';
import ReversalEntryBoard from './ReversalEntryBoard';
import PaymentSetoffBoard from './PaymentSetoffBoard';
import CollectionToDepositBoard from './CollectionToDepositBoard';
import DirectBankTransactionBoard from './DirectBankTransactionBoard';
import FundsTransferBoard from './FundsTransferBoard';
import ChequeCancelBoard from './ChequeCancelBoard';
import CustomerChequeReturnBoard from './CustomerChequeReturnBoard';

import ChequeBookEntryBoard from './ChequeBookEntryBoard';
import ChequeInHandBoard from './ChequeInHandBoard';
import NotPresentedChequesBoard from './NotPresentedChequesBoard';
import LogoutConfirmModal from '../components/modals/LogoutConfirmModal';
import AlarmAlertModal from '../components/modals/AlarmAlertModal';
import { reminderService } from '../services/reminder.service';

import AIChatbotBoard from './AIChatbotBoard';

import FeatureLockedModal from '../components/modals/FeatureLockedModal';
import ExpensesDashboardBoard from './ExpensesDashboardBoard';
import QuickLaunchGridModal from '../components/modals/QuickLaunchGridModal';
import DepartmentBoard from './DepartmentBoard';
import CalculatorBoard from '../components/modals/ViewAndUtilityModels/CalculatorBoard';
import EstimateBoard from './EstimateBoard';
import { Layers } from 'lucide-react';
import ReportTemplate from '../components/ReportTemplate';

import SubscriptionExpiredModal from '../components/modals/SubscriptionExpiredModal';
import SubmitReviewModal from '../components/modals/SubmitReviewModal';
import FirstTimeGuide from '../components/FirstTimeGuide';
import CompanyPromoBoard from '../components/CompanyPromoBoard';
import { showSuccessToast } from '../utils/toastUtils';
import SubscriptionAdminBoard from '../components/Admin/SubscriptionAdminBoard';
import { biDashboardService } from '../services/biDashboard.service';
import GetThingsDoneBoard from './GetThingsDoneBoard';


const Dashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Overview');

    const [showBiDashboardView, setShowBiDashboardView] = useState(false);

    const [showNewAccountModal, setShowNewAccountModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showEnterBillModal, setShowEnterBillModal] = useState(false);
    const [showPayBillModal, setShowPayBillModal] = useState(false);
    const [showWriteChequeModal, setShowWriteChequeModal] = useState(false);
    const [showMakeDepositModal, setShowMakeDepositModal] = useState(false);
    const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
    const [showBankRecModal, setShowBankRecModal] = useState(false);
    const [showTrialBalanceModal, setShowTrialBalanceModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showExpensesDashboardModal, setShowExpensesDashboardModal] = useState(false);
    const [showMarketingToolModal, setShowMarketingToolModal] = useState(false);
    const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
    const [showGRNModal, setShowGRNModal] = useState(false);
    const [showBulkGRNModal, setShowBulkGRNModal] = useState(false);
    const [showPettyCashModal, setShowPettyCashModal] = useState(false);
    const [showSalesOrderModal, setShowSalesOrderModal] = useState(false);
    const [showSalesReceiptModal, setShowSalesReceiptModal] = useState(false);
    const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
    const [showChequeRegisterModal, setShowChequeRegisterModal] = useState(false);

    const [topBarColor, setTopBarColor] = useState(localStorage.getItem('topBarColor') || '#1e3a5f');
    const [showAccountBalanceModal, setShowAccountBalanceModal] = useState(false);
    const [showAdvancePayModal, setShowAdvancePayModal] = useState(false);
    const [showCustomerAdvanceModal, setShowCustomerAdvanceModal] = useState(false);
    const [showCustomerInvoiceModal, setShowCustomerInvoiceModal] = useState(false);
    const [showReceivedPaymentModal, setShowReceivedPaymentModal] = useState(false);
    const [showCustomerReceiptModal, setShowCustomerReceiptModal] = useState(false);
    const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
    const [showMainCashModal, setShowMainCashModal] = useState(false);
    const [showReversalEntryModal, setShowReversalEntryModal] = useState(false);
    const [showPaymentSetoffModal, setShowPaymentSetoffModal] = useState(false);
    const [showCollectionToDepositModal, setShowCollectionToDepositModal] = useState(false);
    const [showDirectBankTransactionModal, setShowDirectBankTransactionModal] = useState(false);
    const [showFundsTransferModal, setShowFundsTransferModal] = useState(false);
    const [showChequeCancelModal, setShowChequeCancelModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showCustomerChequeReturnModal, setShowCustomerChequeReturnModal] = useState(false);

    const [showChequeBookEntryModal, setShowChequeBookEntryModal] = useState(false);
    const [showChequeInHandModal, setShowChequeInHandModal] = useState(false);
    const [showNotPresentedChequesModal, setShowNotPresentedChequesModal] = useState(false);
    const [showSalesInvoiceModal, setShowSalesInvoiceModal] = useState(false);
    const [showMasterFileModal, setShowMasterFileModal] = useState(false);
    const [showViewUtilityModal, setShowViewUtilityModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showSystemAdminModal, setShowSystemAdminModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showSystemSettingsModal, setShowSystemSettingsModal] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showCalculatorModal, setShowCalculatorModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showReminderListModal, setShowReminderListModal] = useState(false);
    const [showSoftwareAboutModal, setShowSoftwareAboutModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showEstimateModal, setShowEstimateModal] = useState(false);


    const [activeMenu, setActiveMenu] = useState(null);
    const menuTimeoutRef = useRef(null);

    const [showQuickLaunchModal, setShowQuickLaunchModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showDashboardLockedModal, setShowDashboardLockedModal] = useState(false);

    const [showAIChatbotModal, setShowAIChatbotModal] = useState(false);
    const [showItemsServicesReport, setShowItemsServicesReport] = useState(false);
    const [itemsServicesData, setItemsServicesData] = useState([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [showSubscriptionExpiredModal, setShowSubscriptionExpiredModal] = useState(false);




    const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [biData, setBiData] = useState(null);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isLoaderStopped, setIsLoaderStopped] = useState(false);
    const [depositData, setDepositData] = useState(null);

    const [ribbonIcons, setRibbonIcons] = useState(() => {
        const defaultIcons = [
            'logout', 'home', 'new_account', 'customer', 'vendor', 'enter_bill',
            'pay_bill', 'write_chq', 'petty_cash', 'make_deposit',
            'journal_entry', 'bank_rec', 'trial_balance', 'search',
            'ai_chat', 'dashboard'
        ];
        try {
            const saved = localStorage.getItem('ribbon_icons');
            if (saved) {
                let parsed = JSON.parse(saved);
                // Always ensure 'dashboard' is present after 'ai_chat'
                if (!parsed.includes('dashboard')) {
                    const aiIdx = parsed.indexOf('ai_chat');
                    if (aiIdx !== -1) {
                        parsed.splice(aiIdx + 1, 0, 'dashboard');
                    } else {
                        parsed.push('dashboard');
                    }
                    localStorage.setItem('ribbon_icons', JSON.stringify(parsed));
                }
                return parsed;
            }
        } catch { /* ignore */ }
        return defaultIcons;
    });

    // Reminder Alarm Logic
    const [activeAlarmTask, setActiveAlarmTask] = useState(null);
    const [pendingJobsCount, setPendingJobsCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Fetch BI dashboard summary
        const fetchBiData = async () => {
            try {
                const companyRaw = localStorage.getItem('selectedCompany');
                const company = companyRaw ? JSON.parse(companyRaw) : null;
                const companyCode = company?.Company_Id || company?.companyId || company?.code || company?.id || '';
                if (companyCode) {
                    const data = await biDashboardService.getSummary(companyCode);
                    setBiData(data);
                }
            } catch (err) {
                console.error('Failed to fetch BI dashboard data', err);
            }
        };
        fetchBiData();

        // Sync system locks from backend on dashboard mount
        const syncLocks = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const companyRaw = localStorage.getItem('selectedCompany');
                const company = companyRaw ? JSON.parse(companyRaw) : null;

                const empCode = currentUser?.EmpCode || currentUser?.empCode || currentUser?.emp_Code || currentUser?.id_No || currentUser?.Id_No || currentUser?.IdNo;
                const companyCode = company?.Company_Id || company?.code || company?.companyCode;
                const roleId = currentUser?.UserRoleId || currentUser?.userRoleId || currentUser?.role_Id || currentUser?.roleId;

                const locks = await systemLocksService.getAllLocks(empCode, companyCode, roleId);
                Object.entries(locks).forEach(([moduleId, isLocked]) => {
                    localStorage.setItem(moduleId, isLocked ? 'true' : 'false');
                });
            } catch (err) {
                console.error("Failed to sync system locks from server", err);
            }
        };
        syncLocks();

        const currentUser = authService.getCurrentUser();
        const company = localStorage.getItem('selectedCompany');
        const savedIcons = localStorage.getItem('ribbon_icons');

        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
            setSelectedCompany(company ? JSON.parse(company) : null);

            // Show first-time onboarding guide (per-user — only once per employee)
            const userId = currentUser?.EmpCode || currentUser?.empCode || currentUser?.emp_Code || currentUser?.id_No || currentUser?.Id_No || currentUser?.IdNo || currentUser?.username || currentUser?.EmpName;
            const onboardKey = `onboardingDone_${userId}`;
            if (!localStorage.getItem(onboardKey)) {
                setTimeout(() => setShowFirstTimeGuide(true), 1000);
            }

            const subEndDateStr = currentUser?.SubscriptionEndDate || currentUser?.subscriptionEndDate || currentUser?.subscription_End_Date;

            if (subEndDateStr) {
                const endDate = new Date(subEndDateStr);
                const now = new Date();
                if (now > endDate) {
                    setShowSubscriptionExpiredModal(true);
                }
            }

            if (savedIcons) {
                let parsed = JSON.parse(savedIcons);
                localStorage.setItem('ribbon_icons', JSON.stringify(parsed));
                setRibbonIcons(parsed);
            }
        }
    }, [navigate]);

    // Reset reminder states when user or company changes to prevent leaks across sessions
    useEffect(() => {
        setPendingJobsCount(0);
        setPendingSnoozeTask(null);
        setActiveAlarmTask(null);
        setSnoozedReminders({});
    }, [user?.id_No, user?.Id_No, selectedCompany?.id]);

    // Persistent set of task IDs that have already alerted today
    const [alertedTaskIds, setAlertedTaskIds] = useState(() => {
        const saved = localStorage.getItem('alertedReminders');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Filter out old alerts from previous days
                const now = new Date();
                const todayPrefix = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                const validAlerts = Object.keys(parsed)
                    .filter(key => key.startsWith(todayPrefix))
                    .reduce((obj, key) => {
                        obj[key] = parsed[key];
                        return obj;
                    }, {});
                return new Set(Object.values(validAlerts));
            } catch (e) { return new Set(); }
        }
        return new Set();
    });

    const [snoozedReminders, setSnoozedReminders] = useState({});
    const [pendingSnoozeTask, setPendingSnoozeTask] = useState(null);

    // Handle Alarm Close (Snooze 10 mins)
    const handleAlarmDismiss = (taskId) => {
        if (!taskId) {
            setActiveAlarmTask(null);
            return;
        }

        const snoozeUntil = new Date(new Date().getTime() + 30 * 60000); // 30 minutes from now
        setSnoozedReminders(prev => ({
            ...prev,
            [taskId]: snoozeUntil
        }));

        // Show persistent banner after dismissal
        setPendingSnoozeTask(activeAlarmTask);
        setActiveAlarmTask(null);
    };

    // Mark as permanently handled for today (Done)
    const handlePermanentDismiss = (taskId) => {
        setAlertedTaskIds(prev => {
            const newSet = new Set(prev);
            newSet.add(taskId);

            const now = new Date();
            const todayPrefix = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            const saved = localStorage.getItem('alertedReminders');
            let parsed = {};
            try { parsed = JSON.parse(saved) || {}; } catch (e) { }
            parsed[`${todayPrefix}-${taskId}`] = taskId;
            localStorage.setItem('alertedReminders', JSON.stringify(parsed));

            return newSet;
        });

        // Clear banner if this task was pending
        if (pendingSnoozeTask && (pendingSnoozeTask.id_No || pendingSnoozeTask.Id_No || pendingSnoozeTask.idNo) === taskId) {
            setPendingSnoozeTask(null);
        }

        setActiveAlarmTask(null);
    };

    // Show promo popup every 10 minutes (first after 8s)
    useEffect(() => {
        const showPromo = () => {
            const lastShown = localStorage.getItem('promoLastShown');
            const now = Date.now();
            if (!lastShown || now - parseInt(lastShown) > 10 * 60 * 1000) {
                setShowPromoModal(true);
                localStorage.setItem('promoLastShown', String(now));
            }
        };

        const onMount = setTimeout(showPromo, 8000);
        const interval = setInterval(showPromo, 10 * 60 * 1000);

        return () => { clearTimeout(onMount); clearInterval(interval); };
    }, []);

    // Listen to messages from other tabs (like SpendOverviewPage)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'LAUNCH_MODAL') {
                const modal = event.data.modal;
                if (modal === 'showEnterBillModal') setShowEnterBillModal(true);
                if (modal === 'showPayBillModal') setShowPayBillModal(true);
                if (modal === 'showWriteChequeModal') setShowWriteChequeModal(true);
                if (modal === 'showPettyCashModal') setShowPettyCashModal(true);
                if (modal === 'showJournalEntryModal') setShowJournalEntryModal(true);
                if (modal === 'showMakeDepositModal') setShowMakeDepositModal(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Check Reminders
    useEffect(() => {
        const checkReminders = async () => {
            try {
                const reminders = await reminderService.getReminders();
                const now = new Date();

                const dd = String(now.getDate()).padStart(2, '0');
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const yyyy = now.getFullYear();
                const todayStr = `${dd}/${mm}/${yyyy}`;

                const curH = now.getHours();
                const curM = now.getMinutes();

                const dueTask = reminders.find(r => {
                    const rId = r.id_No || r.Id_No || r.idNo;
                    const rDate = (r.date || r.Date || '').trim();
                    const rTime = (r.time || r.Time || '').trim();
                    const rExpire = (r.expire || r.Expire || 'F').trim();

                    if (rExpire !== 'F' || rDate !== todayStr || alertedTaskIds.has(rId)) return false;

                    // Snooze logic
                    if (snoozedReminders[rId] && now < snoozedReminders[rId]) return false;

                    try {
                        const timeMatch = rTime.match(/(\d+)[.:](\d+)\s*(AM|PM)/i);
                        if (!timeMatch) return false;

                        let h = parseInt(timeMatch[1]);
                        const m = parseInt(timeMatch[2]);
                        const p = timeMatch[3].toUpperCase();

                        if (p === 'PM' && h < 12) h += 12;
                        if (p === 'AM' && h === 12) h = 0;

                        // Mobile-Style alarm logic: Trigger ONLY if it is EXACTLY the same minute
                        // Allowing 5 second wiggle room (check interval is 5s)
                        if (curH === h && curM === m) {
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                    return false;
                });

                const allDueTasks = reminders.filter(r => {
                    const rId = r.id_No || r.Id_No || r.idNo;
                    const rDate = (r.date || r.Date || '').trim();
                    const rExpire = (r.expire || r.Expire || 'F').trim();
                    return rExpire === 'F' && rDate === todayStr && !alertedTaskIds.has(rId);
                });

                setPendingJobsCount(allDueTasks.length);

                // Ensure a task is always set for the bubble if we have pending jobs
                if (allDueTasks.length > 0 && !pendingSnoozeTask) {
                    setPendingSnoozeTask(allDueTasks[0]);
                } else if (allDueTasks.length === 0) {
                    setPendingSnoozeTask(null);
                }

                if (dueTask) {
                    setActiveAlarmTask(dueTask);
                }
            } catch (error) {
                console.error('Error checking reminders:', error);
            }
        };

        const interval = setInterval(checkReminders, 5000);
        return () => clearInterval(interval);
    }, [alertedTaskIds, snoozedReminders]);

    const handleCompleteAlarm = async (task) => {
        try {
            const taskId = task.id_No || task.Id_No || task.idNo;
            await reminderService.expireReminder(taskId);
            handlePermanentDismiss(taskId); // Mark as permanently alerted today
            showSuccessToast("Task marked as completed!");
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    const handleAIClick = () => {
        setIsAIThinking(true);
        setTimeout(() => {
            setIsAIThinking(false);
            setShowAIChatbotModal(true);
        }, 3000);
    };





    const handleCollectionComplete = (data) => {
        setDepositData(data);
        setShowCollectionToDepositModal(false);
        setShowMakeDepositModal(true);
    };

    const handleLogout = () => {
        setPendingSnoozeTask(null);
        authService.logout();
        localStorage.removeItem('selectedCompany');
        navigate('/login');
    };

    const handleOpenItemsServicesReport = () => {
        const companyId = selectedCompany?.Company_Id || selectedCompany?.companyId || 'COM001';
        const companyName = selectedCompany?.CompanyName || selectedCompany?.companyName || 'ONIMTA IT SOLUTIONS';
        window.open(`/report/items-services?company=${companyId}&name=${encodeURIComponent(companyName)}`, '_blank');
    };


    const dashboardGroups = [
        {
            category: "Overview",
            desc: "Default dashboard view",
            color: "bg-slate-500",
            textColor: "text-slate-600",
            items: [
                { icon: UserPlus, gif: '/icons/new account2.gif', label: 'Accounts', onClick: () => setShowNewAccountModal(true), color: '#0891b2' },
                { icon: Users, gif: '/icons/customer.gif', label: 'Customers', onClick: () => setShowCustomerModal(true), color: '#059669' },
                { icon: Truck, gif: '/icons/vendors.gif', label: 'Vendors', onClick: () => setShowVendorModal(true), color: '#d97706' },
                { icon: FileText, gif: '/icons/billing.gif', label: 'Billing', onClick: () => setShowEnterBillModal(true), color: '#dc2626' },
                { icon: CreditCard, gif: '/icons/paybill.gif', label: 'Pay Bills', onClick: () => setShowPayBillModal(true), color: '#ea580c' },
                { icon: PenTool, gif: '/icons/cheque.gif', label: 'Cheques', onClick: () => setShowWriteChequeModal(true), color: '#7c3aed' },
                { icon: Wallet, gif: '/icons/cash.gif', label: 'Cash', onClick: () => setShowPettyCashModal(true), color: '#16a34a' },
                { icon: ArrowDownLeft, gif: '/icons/deposit.gif', label: 'Deposit', onClick: () => setShowCollectionToDepositModal(true), color: '#2563eb' },
                { icon: BookOpen, gif: '/icons/journal.gif', label: 'Journal', onClick: () => setShowJournalEntryModal(true), color: '#9333ea' },
                { icon: RefreshCcw, gif: '/icons/cashflow.gif', label: 'Rec.', onClick: () => setShowBankRecModal(true), color: '#0d9488' },
                { icon: BarChart2, gif: '/icons/report.gif', label: 'Report', onClick: () => setShowTrialBalanceModal(true), color: '#4f46e5' },
                { icon: Search, label: 'Search', onClick: () => setShowSearchModal(true), color: '#64748b' },
            ]
        },
        {
            category: "Purchases",
            desc: "Manage orders and bills",
            color: "bg-blue-500",
            textColor: "text-blue-600",
            items: [
                { icon: ShoppingCart, label: 'Purchase Order', onClick: () => setShowPurchaseOrderModal(true), color: '#0285fd' },
                { icon: Package, label: 'GRN', onClick: () => setShowGRNModal(true), color: '#10b981' },
                { icon: Layers, label: 'Bulk GRN', onClick: () => setShowBulkGRNModal(true), color: '#059669' },
                { icon: FileText, label: 'Enter Bills', onClick: () => setShowEnterBillModal(true), color: '#f59e0b' },
                { icon: CreditCard, label: 'Pay Bills', onClick: () => setShowPayBillModal(true), color: '#ef4444' },
            ]
        },
        {
            category: "Sales",
            desc: "Manage sales and invoices",
            color: "bg-emerald-500",
            textColor: "text-emerald-600",
            items: [
                { icon: PenTool, label: 'Estimate', onClick: () => setShowEstimateModal(true), color: '#0285fd' },
                { icon: FileText, label: 'Sales Order', onClick: () => setShowSalesOrderModal(true), color: '#3b82f6' },
                { icon: FilePlus, label: 'Create Invoice', onClick: () => setShowSalesInvoiceModal(true), color: '#10b981' },
                { icon: Receipt, label: 'Sales Receipt', onClick: () => setShowSalesReceiptModal(true), color: '#06b6d4' },
            ]
        },
        {
            category: "Customers & Vendors",
            desc: "Manage relationships & payments",
            color: "bg-indigo-500",
            textColor: "text-indigo-600",
            items: [
                { icon: Users, label: 'Customers', onClick: () => setShowCustomerModal(true), color: '#3b82f6' },
                { icon: ArrowDownLeft, label: 'Receive Payment', onClick: () => setShowReceivePaymentModal(true), color: '#14b8a6' },
                { icon: Truck, label: 'Vendors', onClick: () => setShowVendorModal(true), color: '#f59e0b' },
            ]
        },
        {
            category: "Banking & Cash",
            desc: "Manage cashflow and cheques",
            color: "bg-purple-500",
            textColor: "text-purple-600",
            items: [
                { icon: Wallet, label: 'Petty Cash', onClick: () => setShowPettyCashModal(true), color: '#8b5cf6' },
                { icon: Box, label: 'Collection Deposit', onClick: () => setShowCollectionToDepositModal(true), color: '#14b8a6' },
                { icon: Book, label: 'Cheque Register', onClick: () => setShowChequeRegisterModal(true), color: '#6366f1' },
                { icon: PenTool, label: 'Write Cheque', onClick: () => setShowWriteChequeModal(true), color: '#ef4444' },
            ]
        },
        {
            category: "Accounting & Other",
            desc: "Journal entries, reports, and marketing",
            color: "bg-rose-500",
            textColor: "text-rose-600",
            items: [
                { icon: BookOpen, label: 'Journal Entry', onClick: () => setShowJournalEntryModal(true), color: '#6366f1' },
                { icon: PieChart, label: 'Acc.Balance', onClick: () => setShowAccountBalanceModal(true), color: '#10b981' },
                { icon: BarChart2, label: 'Reports', onClick: () => setShowTrialBalanceModal(true), color: '#4f46e5' },
                { icon: Megaphone, label: 'Marketing Tool', onClick: () => setShowMarketingToolModal(true), color: '#ec4899' },
            ]
        }
    ];

    const navItems = dashboardGroups.flatMap(group => group.items);

    const menuBar = [
        'Master File', 'View and Utility', 'Transaction', 'Reports', 'System Admin', 'Help', 'About'
    ];

    const menuDropdownItems = {
        'Master File': [
            { label: 'Open Company', onClick: () => setShowMasterFileModal(true) },
            { label: 'Cost Center Master', onClick: () => setShowMasterFileModal(true) },
            { label: 'Create Department', onClick: () => setShowMasterFileModal(true) },
            { label: 'Create Category', onClick: () => setShowMasterFileModal(true) },
            { label: 'Create Route', onClick: () => setShowMasterFileModal(true) },
            { label: 'Create Area', onClick: () => setShowMasterFileModal(true) },
            { label: 'Supplier Master', onClick: () => setShowMasterFileModal(true) },
            { label: 'Customer Master', onClick: () => setShowMasterFileModal(true) },
            { label: 'Customer Type Master', onClick: () => setShowMasterFileModal(true) },
            { label: 'Vendor Types', onClick: () => setShowMasterFileModal(true) },
            { label: 'Chart of Accountant', onClick: () => setShowMasterFileModal(true) },
            { label: 'Card Sale Commission', onClick: () => setShowMasterFileModal(true) },
            { label: 'User Profile Maintenance', onClick: () => setShowMasterFileModal(true) },
            { label: 'Change Password', onClick: () => setShowMasterFileModal(true) },
            { label: 'Log Off', onClick: () => setShowMasterFileModal(true) },
        ],
        'View and Utility': [
            { label: 'Customize Icon Bar', onClick: () => setShowViewUtilityModal(true) },
            { label: 'View Side Bar', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Change Background', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Send File', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Use E-Mail', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Open Office Document', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Reminder - To Do List', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Open Notepad', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Use Calculator', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Find', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Search', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Printer Setup', onClick: () => setShowViewUtilityModal(true) },
            { label: 'Prepare Letter with Envelopes', onClick: () => setShowViewUtilityModal(true) },
        ],
        'Transaction': [
            { label: 'Customer Center', onClick: () => setShowTransactionModal(true) },
            { label: 'Vendors Center', onClick: () => setShowTransactionModal(true) },
            { label: 'Accounting', onClick: () => setShowTransactionModal(true) },
            { label: 'Banking', onClick: () => setShowTransactionModal(true) },
        ],
        'Reports': [
            { label: 'Finance Management', onClick: () => setShowReportsModal(true) },
            { label: 'Accounting Reports', onClick: () => setShowReportsModal(true) },
            { label: 'Banking Reports', onClick: () => setShowReportsModal(true) },
            { label: 'Customer Center Reports', onClick: () => setShowReportsModal(true) },
            { label: 'Vendor Center Reports', onClick: () => setShowReportsModal(true) },
            { label: 'Admin Reports', onClick: () => setShowReportsModal(true) },
        ],
        'System Admin': [
            { label: 'Data Backup', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Stock Balance Update', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Inventory Download', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Delete Account', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Transaction Search', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Document Editor', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Transaction Editor', onClick: () => setShowSystemAdminModal(true) },
            { label: 'System Update', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Clear Temp Data', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Period Lock Facility', onClick: () => setShowSystemAdminModal(true) },
            { label: 'User & Role Management', onClick: () => setShowSystemAdminModal(true) },
            { label: 'Change Password', onClick: () => setShowSystemAdminModal(true) },
        ],
        'Help': [],
        'About': [
            { label: 'About Software', onClick: () => setShowSoftwareAboutModal(true) },
        ],
    };


    return (
        <div className="h-screen w-screen flex flex-col font-['Plus_Jakarta_Sans'] bg-white select-none text-slate-800 overflow-hidden">
            {/* 1. Modal Overlays */}

            <NewAccountBoard isOpen={showNewAccountModal} onClose={() => setShowNewAccountModal(false)} />
            <CustomerMasterBoard isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
            <SupplierMasterBoard isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
            <EnterBillBoard isOpen={showEnterBillModal} onClose={() => setShowEnterBillModal(false)} />
            <ExpensesDashboardBoard
                isOpen={showExpensesDashboardModal}
                onClose={() => setShowExpensesDashboardModal(false)}
                onEnterBill={() => { setShowExpensesDashboardModal(false); setShowEnterBillModal(true); }}
                onPayBill={() => { setShowExpensesDashboardModal(false); setShowPayBillModal(true); }}
                onWriteCheque={() => { setShowExpensesDashboardModal(false); setShowWriteChequeModal(true); }}
                onPettyCash={() => { setShowExpensesDashboardModal(false); setShowPettyCashModal(true); }}
            />
            <PayBillBoard isOpen={showPayBillModal} onClose={() => setShowPayBillModal(false)} />
            <EstimateBoard isOpen={showEstimateModal} onClose={() => setShowEstimateModal(false)} />
            <WriteChequeBoard isOpen={showWriteChequeModal} onClose={() => setShowWriteChequeModal(false)} />
            <MakeDepositBoard isOpen={showMakeDepositModal} onClose={() => { setShowMakeDepositModal(false); setDepositData(null); }} incomingData={depositData} />
            <JournalEntryBoard isOpen={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
            <BankReconciliationBoard isOpen={showBankRecModal} onClose={() => setShowBankRecModal(false)} />
            <ChequeCancelBoard isOpen={showChequeCancelModal} onClose={() => setShowChequeCancelModal(false)} />
            <CustomerChequeReturnBoard isOpen={showCustomerChequeReturnModal} onClose={() => setShowCustomerChequeReturnModal(false)} />

            <ChequeBookEntryBoard isOpen={showChequeBookEntryModal} onClose={() => setShowChequeBookEntryModal(false)} />
            <ChequeInHandBoard isOpen={showChequeInHandModal} onClose={() => setShowChequeInHandModal(false)} />
            <NotPresentedChequesBoard isOpen={showNotPresentedChequesModal} onClose={() => setShowNotPresentedChequesModal(false)} />
            <TrialBalanceBoard isOpen={showTrialBalanceModal} onClose={() => setShowTrialBalanceModal(false)} />
            
            {/* New BI Dashboard Modules */}
            <PurchaseOrderBoard isOpen={showPurchaseOrderModal} onClose={() => setShowPurchaseOrderModal(false)} />
            <GRNBoard isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} />
            <BulkGRNBoard isOpen={showBulkGRNModal} onClose={() => setShowBulkGRNModal(false)} />
            <SalesOrderBoard isOpen={showSalesOrderModal} onClose={() => setShowSalesOrderModal(false)} />
            <SalesReceiptBoard isOpen={showSalesReceiptModal} onClose={() => setShowSalesReceiptModal(false)} />
            <ReceivePaymentBoard isOpen={showReceivePaymentModal} onClose={() => setShowReceivePaymentModal(false)} />
            <SalesInvoiceBoard isOpen={showSalesInvoiceModal} onClose={() => setShowSalesInvoiceModal(false)} />
            <ChequeRegisterBoard isOpen={showChequeRegisterModal} onClose={() => setShowChequeRegisterModal(false)} />
            <MarketingToolBoard isOpen={showMarketingToolModal} onClose={() => setShowMarketingToolModal(false)} />
            <AccountBalanceBoard isOpen={showAccountBalanceModal} onClose={() => setShowAccountBalanceModal(false)} />

            <DocumentSearchBoard isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
            <MasterFileModal isOpen={showMasterFileModal} onClose={() => setShowMasterFileModal(false)} />
            <ViewUtilityModal
                isOpen={showViewUtilityModal}
                onClose={() => setShowViewUtilityModal(false)}
                onToggleSideBar={() => setShowSideBar(!showSideBar)}
                onOpenCalculator={() => window.open('ms-calculator:')}
                onOpenNotepad={() => fetch('/api/utility/open-notepad')}
                onOpenPrinter={() => fetch('/api/utility/open-printer')}
                onOpenReminder={() => setShowReminderModal(true)}
                currentTopBarColor={topBarColor}
                onColorSelect={(color) => {
                    setTopBarColor(color);
                    localStorage.setItem('topBarColor', color);
                }}
            />
            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                onOpenEnterBill={() => {
                    setShowEnterBillModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenPayBill={() => {
                    setShowPayBillModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenAdvancePay={() => {
                    setShowAdvancePayModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenSalesOrder={() => {
                    setShowSalesOrderModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenCustomerInvoice={() => {
                    setShowCustomerInvoiceModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenSalesReceipt={() => {
                    setShowCustomerReceiptModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenReceivePayment={() => {
                    setShowReceivePaymentModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenCustomerAdvance={() => {
                    setShowCustomerAdvanceModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenOpeningBalance={() => {
                    setShowOpeningBalanceModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenPettyCash={() => {
                    setShowPettyCashModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenMainCash={() => {
                    setShowMainCashModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenJournalEntry={() => {
                    setShowJournalEntryModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenReversalEntry={() => {
                    setShowReversalEntryModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenPaymentSetoff={() => {
                    setShowPaymentSetoffModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenCollectionDeposit={() => {
                    setShowCollectionToDepositModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenDirectBankTransaction={() => {
                    setShowDirectBankTransactionModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenFundsTransfer={() => {
                    setShowFundsTransferModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenBankReconciliation={() => {
                    setShowBankRecModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenChequeCancel={() => {
                    setShowChequeCancelModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenCustomerChequeReturn={() => {
                    setShowCustomerChequeReturnModal(true);
                    setShowTransactionModal(false);
                }}

                onOpenChequeBookEntry={() => {
                    setShowChequeBookEntryModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenChequeInHand={() => {
                    setShowChequeInHandModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenNotPresented={() => {
                    setShowNotPresentedChequesModal(true);
                    setShowTransactionModal(false);
                }}
                onOpenWriteCheque={() => {
                    setShowWriteChequeModal(true);
                    setShowTransactionModal(false);
                }}
            />
            <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} />
            <SubmitReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} currentUser={user} />
            <FirstTimeGuide isOpen={showFirstTimeGuide} onClose={() => setShowFirstTimeGuide(false)} onOpenMasterFile={() => setShowMasterFileModal(true)} onCloseMasterFile={() => setShowMasterFileModal(false)} user={user} />
            <CompanyPromoBoard isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} />
            <SystemAdminModal
                isOpen={showSystemAdminModal}
                onClose={() => setShowSystemAdminModal(false)}
                onOpenChangePassword={() => {
                    setShowSystemAdminModal(false);
                    setShowChangePasswordModal(true);
                }}
                onOpenSystemSettings={() => {
                    setShowSystemAdminModal(false);
                    setShowSystemSettingsModal(true);
                }}
            />
            <ChangePasswordBoard isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />

            {/* Subscription Management Modal */}
            {showSubscriptionModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowSubscriptionModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                        <SubscriptionAdminBoard />
                    </div>
                </div>
            )}
            <SystemSettingsBoard isOpen={showSystemSettingsModal} onClose={() => setShowSystemSettingsModal(false)} />
            <GRNBoard isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} />
            <BulkGRNBoard isOpen={showBulkGRNModal} onClose={() => setShowBulkGRNModal(false)} />
            <DepartmentBoard isOpen={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} />
            <CalculatorBoard isOpen={showCalculatorModal} onClose={() => setShowCalculatorModal(false)} />
            <ReminderBoard
                isOpen={showReminderModal}
                onClose={() => {
                    setShowReminderModal(false);
                    setEditingTask(null);
                }}
                onViewAll={() => {
                    setShowReminderModal(false);
                    setShowReminderListModal(true);
                }}
                taskToEdit={editingTask}
            />
            <ReminderListBoard
                isOpen={showReminderListModal}
                onClose={() => setShowReminderListModal(false)}
                onEditTask={(task) => {
                    setEditingTask(task);
                    setShowReminderListModal(false);
                    setShowReminderModal(true);
                }}
            />

            <LogoutConfirmModal
                isOpen={showLogoutConfirmModal}
                onClose={() => setShowLogoutConfirmModal(false)}
                onConfirm={() => {
                    setShowLogoutConfirmModal(false);
                    setShowThankYouModal(true);
                }}
            />

            {/* AI Thinking Overlay (Robot Animation centered) */}
            {isAIThinking && (() => {
                const FULL_TEXT = 'Assistant';
                const AITypingText = () => {
                    const [displayed, setDisplayed] = React.useState('');
                    React.useEffect(() => {
                        let i = 0;
                        setDisplayed('');
                        const iv = setInterval(() => {
                            i++;
                            setDisplayed(FULL_TEXT.slice(0, i));
                            if (i >= FULL_TEXT.length) { clearInterval(iv); }
                        }, 80);
                        return () => clearInterval(iv);
                    }, []);
                    return (
                        <span>
                            {displayed}
                            <span className="inline-block w-[2px] h-[14px] bg-[#0285fd] ml-1 align-middle animate-[blink_1s_step-end_infinite]" />
                        </span>
                    );
                };
                return (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-white transition-all duration-500 overflow-hidden">
                        {/* Giant ghost watermark text behind lottie */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span
                                className="text-[12vw] font-black uppercase tracking-[0.15em] text-[#0285fd]/[0.04] leading-none whitespace-nowrap"
                                style={{ fontFamily: 'Tahoma, sans-serif' }}
                            >
                                A&nbsp;&nbsp;I
                            </span>
                        </div>

                        {/* Subtle radial glow behind lottie */}
                        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#0285fd]/5 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col items-center z-10">
                            <DotLottiePlayer
                                src="/images/Ai Robot Vector Art.lottie"
                                autoplay
                                loop
                                className="w-[320px] h-[320px]"
                            />
                            <div className="mt-2 text-[#0285fd] text-[13px] font-black uppercase tracking-[0.55em] font-mono">
                                <AITypingText />
                            </div>
                        </div>

                        <style>{`
                            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
                        `}</style>
                    </div>
                );
            })()}








            <PurchaseOrderBoard isOpen={showPurchaseOrderModal} onClose={() => setShowPurchaseOrderModal(false)} />
            <GRNBoard isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} />
            <PettyCashBoard isOpen={showPettyCashModal} onClose={() => setShowPettyCashModal(false)} />
            <SalesOrderBoard isOpen={showSalesOrderModal} onClose={() => setShowSalesOrderModal(false)} />
            <SalesInvoiceBoard isOpen={showSalesInvoiceModal} onClose={() => setShowSalesInvoiceModal(false)} />
            <SalesReceiptBoard isOpen={showSalesReceiptModal} onClose={() => setShowSalesReceiptModal(false)} />
            <ReceivePaymentBoard isOpen={showReceivePaymentModal} onClose={() => setShowReceivePaymentModal(false)} />
            <ChequeRegisterBoard isOpen={showChequeRegisterModal} onClose={() => setShowChequeRegisterModal(false)} />

            <MarketingToolBoard isOpen={showMarketingToolModal} onClose={() => setShowMarketingToolModal(false)} />
            <AccountBalanceBoard isOpen={showAccountBalanceModal} onClose={() => setShowAccountBalanceModal(false)} />
            <AdvancePayBoard isOpen={showAdvancePayModal} onClose={() => setShowAdvancePayModal(false)} />
            <CustomerAdvanceBoard isOpen={showCustomerAdvanceModal} onClose={() => setShowCustomerAdvanceModal(false)} />
            <CustomerInvoiceBoard isOpen={showCustomerInvoiceModal} onClose={() => setShowCustomerInvoiceModal(false)} />
            <CustomerReceiptBoard isOpen={showCustomerReceiptModal} onClose={() => setShowCustomerReceiptModal(false)} />
            <OpeningBalanceBoard isOpen={showOpeningBalanceModal} onClose={() => setShowOpeningBalanceModal(false)} />
            <MainCashBoard isOpen={showMainCashModal} onClose={() => setShowMainCashModal(false)} />
            <JournalEntryBoard isOpen={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
            <ReversalEntryBoard isOpen={showReversalEntryModal} onClose={() => setShowReversalEntryModal(false)} />
            <PaymentSetoffBoard isOpen={showPaymentSetoffModal} onClose={() => setShowPaymentSetoffModal(false)} />
            <CollectionToDepositBoard isOpen={showCollectionToDepositModal} onClose={() => setShowCollectionToDepositModal(false)} onComplete={handleCollectionComplete} />
            <DirectBankTransactionBoard isOpen={showDirectBankTransactionModal} onClose={() => setShowDirectBankTransactionModal(false)} />
            <FundsTransferBoard isOpen={showFundsTransferModal} onClose={() => setShowFundsTransferModal(false)} />

            {/* Side Bar Component */}
            <SideBar
                isOpen={showSideBar}
                onClose={() => setShowSideBar(false)}
                onOpenCalculator={() => fetch('/api/utility/open-calculator')}
                onOpenWord={() => fetch('/api/utility/open-word')}
                onOpenExcel={() => fetch('/api/utility/open-excel')}
                onOpenEmail={() => fetch('/api/utility/open-outlook')}
                onOpenNotepad={() => fetch('/api/utility/open-notepad')}
                onOpenPrinter={() => fetch('/api/utility/open-printer')}
                onOpenReminder={() => setShowReminderModal(true)}
                isTopBarCollapsed={isTopBarCollapsed}
            />

            {/* 2. Accounting Website Style Header */}
            <header
                data-tour="main-menu"
                className={`z-50 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out ${isTopBarCollapsed ? 'h-12 overflow-hidden' : ''}`}
            >
                {/* Row 1: Logo + Centered Nav + User Area */}
                <div className={`flex items-center justify-between px-6 border-b border-slate-100 transition-all duration-300 ${isTopBarCollapsed ? 'h-full border-transparent' : 'h-14'}`}>
                    {/* Left: ONIMTA Logo & Greeting */}
                    <div className="flex items-center gap-3 shrink-0">
                        <img src="/onimta_logo-modified.png" alt="ONIMTA" className="h-9 w-auto object-contain" />
                        <div className="h-7 w-px bg-[#eceef1]" />
                        <div>
                            <div className="text-[16px] font-bold text-[#393a3d] leading-tight tracking-tight">Accounts</div>
                            <div className="text-[10px] font-bold text-[#6b6c72] uppercase tracking-wider">Enterprise Suite</div>
                        </div>
                        {/* Dynamic Greeting */}
                        <div className="ml-2 pl-4 border-l border-slate-200 hidden xl:block">
                            <h1 className="text-[14px] font-bold text-[#1e293b] leading-none">
                                {(() => {
                                    const h = new Date().getHours();
                                    if (h < 12) return 'Good morning';
                                    if (h < 17) return 'Good afternoon';
                                    return 'Good evening';
                                })()}, {user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'User'}!
                            </h1>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Here's what's happening with your business today.</p>
                        </div>
                    </div>

                    {/* Center: Main Navigation Tabs */}
                    <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {menuBar.map((item, idx) => {
                            const items = menuDropdownItems[item] || [];
                            return (
                                <div
                                    key={idx}
                                    className="relative"
                                    onMouseEnter={() => {
                                        clearTimeout(menuTimeoutRef.current);
                                        setActiveMenu(item);
                                    }}
                                    onMouseLeave={() => {
                                        menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
                                    }}
                                >
                                    <button
                                        className={`text-[13px] font-bold ${activeMenu === item ? 'text-[#0078d4] bg-[#f4f5f8]' : 'text-[#6b6c72]'} hover:text-[#0078d4] hover:bg-[#f4f5f8] px-4 py-2 rounded-lg transition-all whitespace-nowrap active:scale-95`}
                                    >
                                        {item}
                                    </button>
                                    {activeMenu === item && items.length > 0 && (
                                        <div
                                            className="absolute top-full left-0 mt-1 bg-white border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl py-2 z-[200] min-w-[230px] max-h-[65vh] overflow-y-auto"
                                            style={{ backdropFilter: 'blur(12px)' }}
                                            onMouseEnter={() => clearTimeout(menuTimeoutRef.current)}
                                            onMouseLeave={() => {
                                                menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
                                            }}
                                        >
                                            <div className="px-3 pb-1.5 pt-1">
                                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{item}</span>
                                            </div>
                                            <div className="h-px bg-slate-100 mx-3 mb-1" />
                                            {items.map((menuItem, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        menuItem.onClick();
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-[12.5px] font-semibold text-slate-600 hover:text-[#0078d4] hover:bg-blue-50/80 transition-all duration-150 flex items-center gap-2.5 group"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors shrink-0" />
                                                    {menuItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>

                    {/* Right: Company + User + Sparkles + Menu */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-[#d4d7dc] hover:border-[#0078d4] hover:shadow-sm px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                            <Building2 size={14} className="text-[#6b6c72]" />
                            <span className="text-[12px] font-bold text-[#393a3d]">{selectedCompany?.CompanyName || selectedCompany?.companyName || 'Enterprise'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-[#d4d7dc] hover:border-[#0078d4] hover:shadow-sm px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-[12px] font-bold text-[#393a3d]">{user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'User'}</span>
                        </div>
                        <button
                            onClick={() => setShowSideBar(!showSideBar)}
                            className={`p-2 rounded-lg transition-all ${showSideBar ? 'bg-[#f4f5f8] text-[#0078d4]' : 'text-[#6b6c72] hover:bg-[#f4f5f8] hover:text-[#0078d4]'}`}
                        >
                            <Menu size={18} />
                        </button>

                        {/* Sparkles AI Button */}
                        <button
                            onClick={() => setShowAIChatbotModal(!showAIChatbotModal)}
                            className="relative flex items-center justify-center w-9 h-9 rounded-full ml-1 group cursor-pointer"
                            title="AI Assistant"
                        >
                            <Sparkles size={18} className="z-10 text-blue-600 group-hover:text-blue-700" />
                            <div className="absolute inset-0 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors z-0"></div>
                            
                            <div className="absolute inset-[-4px] flex items-center justify-center pointer-events-none">
                                <div className="absolute w-full h-full border-[1.5px] border-blue-400/60 rounded-full animate-[spin_3s_linear_infinite]" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}></div>
                                <div className="absolute w-full h-full border-[1.5px] border-purple-400/60 rounded-full animate-[spin_4s_linear_infinite_reverse]" style={{ borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}></div>
                                <div className="absolute w-full h-full border-[1.5px] border-indigo-400/60 rounded-full animate-[spin_5s_linear_infinite]" style={{ borderRadius: '50% 60% 40% 50% / 50% 50% 50% 50%' }}></div>
                            </div>
                        </button>
                    </div>

                    {isTopBarCollapsed && (
                        <div className="flex items-center">
                            <ChevronRight size={18} className="text-slate-300 cursor-pointer hover:text-slate-500 transition-all transform rotate-90" onClick={() => { setIsTopBarCollapsed(false); setShowSideBar(false); }} />
                        </div>
                    )}
                </div>

                {/* Marquee Bar — directly after Row 1 */}
                {!isTopBarCollapsed && (
                    <div className="h-8 bg-[#0078d4] flex items-center px-6 gap-6 relative overflow-hidden">
                        <div className="flex-1 overflow-hidden relative h-full flex items-center">
                            <div className="absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-[#0078d4] to-transparent pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-[#0078d4] to-transparent pointer-events-none" />
                            <div className="whitespace-nowrap animate-marquee flex items-center gap-16" style={{ animationDuration: '180s' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <span key={i} className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                        ONIMTA INFORMATION TECHNOLOGY
                                        <span className="w-1 h-1 bg-white/50 rounded-full" />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert Bar */}
                {!isTopBarCollapsed && pendingJobsCount > 0 && (
                    <div className="h-[2px] w-full bg-red-100 overflow-hidden relative">
                        <div className="h-full w-1/3 bg-red-500 animate-[marquee_2s_linear_infinite]" />
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-row min-h-0 relative">
                {/* 3. Main Workspace Area */}
                <main className="flex-1 relative overflow-y-auto bg-[#f8fafc]">
                    {showBiDashboardView ? (
                    <div className="h-full w-full relative">
                        <GetThingsDoneBoard 
                            isOpen={true} 
                            isInline={true}
                            onClose={() => setShowBiDashboardView(false)}
                            user={user}
                            selectedCompany={selectedCompany}
                            onAction={(id) => {
                                switch(id) {
                                    case 'new_account': setShowNewAccountModal(true); break;
                                    case 'customer': setShowCustomerModal(true); break;
                                    case 'vendor': setShowVendorModal(true); break;
                                    case 'enter_bill':
                                    case 'record_expense': setShowEnterBillModal(true); break;
                                    case 'pay_bills':
                                    case 'pay_bill': setShowPayBillModal(true); break;
                                    case 'write_cheque': setShowWriteChequeModal(true); break;
                                    case 'make_deposit': setShowMakeDepositModal(true); break;
                                    case 'journal':
                                    case 'journal_entry': setShowJournalEntryModal(true); break;
                                    case 'bank_rec': setShowBankRecModal(true); break;
                                    case 'trial_balance': setShowTrialBalanceModal(true); break;
                                    case 'search': setShowSearchModal(true); break;
                                    case 'department': setShowDepartmentModal(true); break;
                                    case 'category': setShowCategoryModal(true); break;
                                    case 'reminder': setShowReminderModal(true); break;
                                    case 'petty_cash': setShowPettyCashModal(true); break;
                                    case 'purchase_order': setShowPurchaseOrderModal(true); break;
                                    case 'grn': setShowGRNModal(true); break;
                                    case 'bulk_grn': setShowBulkGRNModal(true); break;
                                    case 'sales_order': setShowSalesOrderModal(true); break;
                                    case 'sales_receipt': setShowSalesReceiptModal(true); break;
                                    case 'receive_payment': setShowReceivePaymentModal(true); break;
                                    case 'cheque_register': setShowChequeRegisterModal(true); break;
                                    case 'marketing': setShowMarketingToolModal(true); break;
                                    case 'account_balance': setShowAccountBalanceModal(true); break;
                                    case 'invoice': setShowSalesInvoiceModal(true); break;
                                    case 'reports':
                                    case 'profit_loss_detail':
                                    case 'expenses_detail': setShowReportsModal(true); break;
                                    case 'header_settings': setShowSystemAdminModal(true); break;
                                    case 'header_profile': setShowLogoutConfirmModal(true); break;
                                    case 'header_ai': handleAIClick(); break;
                                    case 'header_help': setShowSoftwareAboutModal(true); break;
                                    case 'add_customer': setShowCustomerModal(true); break;
                                    case 'customer_advance': setShowCustomerAdvanceModal(true); break;
                                    case 'customer_receipt': setShowCustomerReceiptModal(true); break;
                                    case 'estimate': setShowEstimateModal(true); break;
                                    case 'refunds_credit': setShowCustomerChequeReturnModal(true); break;
                                    case 'items': setShowViewUtilityModal(true); break;
                                    default:
                                        console.log("Action not mapped in Dashboard:", id);
                                        break;
                                }
                            }}
                        />
                    </div>
                ) : (
                <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">

                    {/* Header & BI Data Summary (QuickBooks Style) */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-2">
                        {/* Quick Actions Button in Body */}
                        <div
                            className="relative"
                            onMouseEnter={() => { clearTimeout(menuTimeoutRef.current); setShowQuickActions(true); }}
                            onMouseLeave={() => { menuTimeoutRef.current = setTimeout(() => setShowQuickActions(false), 200); }}
                        >
                            <button
                                className={`flex items-center gap-2 px-4 h-[36px] border rounded-xl transition-all font-bold text-[12.5px] group shadow-sm ${
                                    showQuickActions
                                        ? 'text-blue-600 border-blue-400 bg-blue-50 shadow-blue-100'
                                        : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/60'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                    showQuickActions ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-100'
                                }`}>
                                    <LayoutGrid size={11} className={showQuickActions ? 'text-white' : 'text-blue-600'} />
                                </div>
                                Quick Actions
                                <ChevronRight size={12} className={`ml-0.5 transition-transform duration-200 ${showQuickActions ? 'rotate-90 text-blue-600' : 'rotate-0 text-slate-400'}`} />
                            </button>

                            {showQuickActions && (
                                <div
                                    className="absolute top-full left-0 mt-1.5 w-[260px] max-h-[72vh] overflow-y-auto no-scrollbar bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.14)] rounded-2xl py-3 z-[200]"
                                    onMouseEnter={() => clearTimeout(menuTimeoutRef.current)}
                                    onMouseLeave={() => { menuTimeoutRef.current = setTimeout(() => setShowQuickActions(false), 200); }}
                                >
                                    <div className="px-4 pb-2 flex items-center justify-between">
                                        <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-3 mb-2" />
                                    {ribbonIcons.map((iconId) => {
                                        const iconData = {
                                            logout: { icon: LogOut, label: 'Logout', onClick: () => setShowLogoutConfirmModal(true), iconColor: '#dc2626', bg: '#fef2f2' },
                                            home: { icon: PieChart, label: 'Dashboard', onClick: () => window.open('/bi-dashboard', '_blank'), iconColor: '#1e3a5f', bg: '#f1f5f9' },
                                            new_account: { icon: UserPlus, label: 'New Account', onClick: () => setShowNewAccountModal(true), active: showNewAccountModal, iconColor: '#2563eb', bg: '#eff6ff' },
                                            customer: { icon: Users, label: 'Customers', onClick: () => setShowCustomerModal(true), active: showCustomerModal, iconColor: '#059669', bg: '#f0fdf4' },
                                            vendor: { icon: Truck, label: 'Vendors', onClick: () => setShowVendorModal(true), active: showVendorModal, iconColor: '#d97706', bg: '#fffbeb' },
                                            enter_bill: { icon: FileText, label: 'Enter Bill', onClick: () => setShowEnterBillModal(true), active: showEnterBillModal, iconColor: '#dc2626', bg: '#fef2f2' },
                                            pay_bill: { icon: CreditCard, label: 'Pay Bill', onClick: () => setShowPayBillModal(true), active: showPayBillModal, iconColor: '#ea580c', bg: '#fff7ed' },
                                            write_chq: { icon: PenTool, label: 'Write Cheque', onClick: () => setShowWriteChequeModal(true), active: showWriteChequeModal, iconColor: '#7c3aed', bg: '#faf5ff' },
                                            petty_cash: { icon: Wallet, label: 'Petty Cash', onClick: () => setShowPettyCashModal(true), active: showPettyCashModal, iconColor: '#16a34a', bg: '#f0fdf4' },
                                            make_deposit: { icon: ArrowDownLeft, label: 'Deposit', onClick: () => setShowMakeDepositModal(true), active: showMakeDepositModal, iconColor: '#2563eb', bg: '#eff6ff' },
                                            journal_entry: { icon: BookOpen, label: 'Journal', onClick: () => setShowJournalEntryModal(true), active: showJournalEntryModal, iconColor: '#9333ea', bg: '#fdf4ff' },
                                            bank_rec: { icon: RefreshCcw, label: 'Bank Rec', onClick: () => setShowBankRecModal(true), active: showBankRecModal, iconColor: '#0d9488', bg: '#f0fdfa' },
                                            trial_balance: { icon: BarChart2, label: 'Trial Balance', onClick: () => setShowTrialBalanceModal(true), active: showTrialBalanceModal, iconColor: '#4f46e5', bg: '#eef2ff' },
                                            search: { icon: Search, label: 'Search', onClick: () => setShowSearchModal(true), active: showSearchModal, iconColor: '#64748b', bg: '#f8fafc' },
                                            ai_chat: { icon: Bot, label: 'AI Chat', onClick: handleAIClick, active: showAIChatbotModal, iconColor: '#db2777', bg: '#fdf2f8' },
                                            department: { icon: Building2, label: 'Department', onClick: () => setShowDepartmentModal(true), active: showDepartmentModal, iconColor: '#1d4ed8', bg: '#eff6ff' },
                                            calculator: { icon: Calculator, label: 'Calculator', onClick: () => window.open('ms-calculator:'), iconColor: '#9333ea', bg: '#faf5ff' },
                                            help: { icon: HelpCircle, label: 'Help', onClick: () => {}, iconColor: '#64748b', bg: '#f8fafc' },
                                            category: { icon: Layers, label: 'Category', onClick: () => setShowCategoryModal(true), active: showCategoryModal, iconColor: '#ea580c', bg: '#fff7ed' },
                                            reminder: { icon: Bell, label: 'Reminder', onClick: () => setShowReminderModal(true), active: showReminderModal, iconColor: '#ca8a04', bg: '#fefce8' },
                                            dashboard: { icon: LayoutDashboard, label: 'BI Dashboard', onClick: () => setShowBiDashboardView(!showBiDashboardView), active: showBiDashboardView, iconColor: '#0891b2', bg: '#ecfeff' },
                                        }[iconId];
                                        if (!iconData) return null;
                                        const Icon = iconData.icon;
                                        const isActive = iconData.active;
                                        return (
                                            <button
                                                key={iconId}
                                                onClick={() => { iconData.onClick(); setShowQuickActions(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-150 group/item ${
                                                    isActive ? 'bg-blue-50/80 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110" style={{ backgroundColor: isActive ? '#dbeafe' : iconData.bg }}>
                                                    <Icon size={14} strokeWidth={2.2} style={{ color: isActive ? '#1d4ed8' : iconData.iconColor }} />
                                                </div>
                                                <span className="text-[12px] font-semibold flex-1 text-left">{iconData.label}</span>
                                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                    <div className="h-px bg-slate-100 mx-3 mt-2" />
                                    <div className="px-4 pt-2 pb-1"><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Hover to explore</span></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm active:scale-95 transition-all duration-200"
                            >
                                <Star size={14} />
                                Rate
                            </button>
                            <button
                                onClick={() => setShowSearchModal(true)}
                                className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm active:scale-95 transition-all duration-200"
                            >
                                <Search size={14} className="text-slate-400" />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quickbooks-style Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
                        {/* Bank Accounts */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">Bank accounts</h3>
                                <button className="text-[11px] text-[#0078d4] hover:underline font-bold">Connect</button>
                            </div>
                            {biData?.bankAccounts?.length > 0 ? (
                                <div className="space-y-3">
                                    {biData.bankAccounts.slice(0, 2).map((bank, i) => (
                                        <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                            <span className="text-[12px] font-semibold text-slate-600 truncate mr-2">{bank.name}</span>
                                            <span className="text-[13px] font-black text-slate-800 shrink-0">Rs {Number(bank.balance).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-[12px] text-slate-500 py-2 font-medium">No bank accounts linked.</div>
                            )}
                        </div>

                        {/* Invoices */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">Invoices</h3>
                                <button className="text-[11px] text-[#0078d4] hover:underline font-bold">New</button>
                            </div>
                            <div className="flex flex-col gap-2 mt-auto">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[12px] font-bold text-slate-500">Unpaid</span>
                                    <span className="text-[13px] font-black text-slate-800">Rs {(biData?.invoiceSummary?.totalUnpaid || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-[#0078d4] h-full rounded-full transition-all" style={{ width: `${Math.min(((biData?.invoiceSummary?.totalOverdue || 0) / (biData?.invoiceSummary?.totalUnpaid || 1)) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[12px] font-bold text-red-500">Overdue</span>
                                    <span className="text-[13px] font-black text-red-600">Rs {(biData?.invoiceSummary?.totalOverdue || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sales */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">Sales</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">YTD</span>
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-2xl font-black text-slate-800">Rs {(biData?.salesSummary?.totalSalesYTD || 0).toLocaleString()}</span>
                                <div className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                                    <BarChart2 size={12} strokeWidth={3} />
                                    <span>Trending upward</span>
                                </div>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">Expenses</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Payables</span>
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-2xl font-black text-slate-800">Rs {(biData?.accountsPayable?.total || 0).toLocaleString()}</span>
                                <div className="text-[11px] font-bold text-slate-500 mt-2">
                                    <span className="text-orange-500 mr-1">Overdue:</span>
                                    Rs {(biData?.accountsPayable?.aging91Plus || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Add widgets card */}
                        <div 
                            className="bg-[#f4f5f8] p-5 rounded-2xl border border-slate-200/80 hover:bg-[#eceef1] transition-colors cursor-pointer flex flex-col items-center justify-center text-center shadow-sm"
                            onClick={() => setShowBiDashboardView(true)}
                        >
                            <h3 className="text-[13px] font-bold text-[#393a3d] mb-4">Add widgets</h3>
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#d4d7dc] flex items-center justify-center mb-4 bg-white">
                                <Plus size={20} className="text-[#6b6c72]" />
                            </div>
                            <span className="text-[11px] font-bold text-[#6b6c72] flex items-center gap-1">
                                <Sparkles size={12} /> Smart suggestions
                            </span>
                        </div>
                    </div>



                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-4 border-b border-slate-200">
                        {dashboardGroups.map(group => (
                            <button
                                key={group.category}
                                onClick={() => setActiveCategory(group.category)}
                                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all shrink-0 border ${activeCategory === group.category ? 'bg-[#0078d4] text-white border-[#0078d4] shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:shadow-sm'}`}
                            >
                                {group.category}
                            </button>
                        ))}
                    </div>

                    {/* Render Active Category */}
                    {dashboardGroups.filter(g => g.category === activeCategory).map((group, groupIdx) => (
                        <div key={groupIdx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${group.color}`} />
                                    <span className={`text-[11px] font-bold ${group.textColor} uppercase tracking-wider`}>{group.category}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">— {group.desc}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">{group.items.length} modules</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <ModuleCard key={item.label} item={item} Icon={Icon} setIsLoaderStopped={setIsLoaderStopped} />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </main>

            <AIChatbotBoard 
                isOpen={showAIChatbotModal} 
                onClose={() => setShowAIChatbotModal(false)} 
                position="inline-right" 
            />
            </div>

            {/* Floating AI Assistant with Dynamic Positioning (Status-Based) */}
            <div className={`fixed bottom-16 z-[60] flex flex-col pointer-events-none transition-all duration-700 ease-in-out ${pendingSnoozeTask ? 'left-10 items-start' : 'right-10 items-end'}`}>
                {/* Minimalist Red Quote Frame Speech Bubble (Persistent Alert) */}
                {pendingJobsCount > 0 && pendingSnoozeTask && (
                    <div className="mb-4 ml-6 relative animate-in fade-in slide-in-from-bottom-2 duration-500 pointer-events-auto">

                        {/* The Quote Frame Bubble */}
                        <div className="bg-white/95 backdrop-blur-sm p-4 px-8 border-2 border-[#f05252] rounded-[18px] max-w-[420px] relative shadow-xl">

                            {/* Top Left Quote Marks */}
                            <div className="absolute -top-3 -left-1 bg-white px-1 flex gap-1">
                                <span className="text-[#f05252] text-xl font-black rotate-180">„</span>
                            </div>

                            {/* Bottom Right Quote Marks */}
                            <div className="absolute -bottom-4 -right-1 bg-white px-1 flex gap-1">
                                <span className="text-[#f05252] text-xl font-black">“</span>
                            </div>

                            {/* Content Inner */}
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 bg-[#f05252]/10 rounded-full flex items-center justify-center border border-[#f05252]/20">
                                            <Bell size={8} className="text-[#f05252]" />
                                        </div>
                                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#f05252]/80">System Reminder</p>
                                    </div>

                                    <p className="text-[13px] font-medium leading-none text-slate-800 whitespace-nowrap">
                                        Navoda, You have {pendingJobsCount} pending {pendingJobsCount === 1 ? 'job' : 'jobs'}.
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleCompleteAlarm(pendingSnoozeTask)}
                                    className="px-5 py-2.5 bg-[#f05252] text-white text-[9px] font-black rounded-lg uppercase tracking-[0.2em] hover:bg-[#d43f3f] transition-all active:scale-95 shadow-lg shadow-red-500/20 shrink-0 whitespace-nowrap"
                                >
                                    Finish Now
                                </button>
                            </div>

                            {/* Pointy Tail matching the Red Frame (Left-Side Pointing) */}
                            <div className="absolute -bottom-2.5 left-6 w-6 h-6 bg-white rotate-[45deg] border-r-2 border-b-2 border-[#f05252]" />

                        </div>
                    </div>
                )}
            </div>





            <ThankYouModal
                isOpen={showThankYouModal}
                onClose={() => setShowThankYouModal(false)}
            />

            <AlarmAlertModal
                isOpen={!!activeAlarmTask}
                onClose={() => handleAlarmDismiss(activeAlarmTask?.id_No || activeAlarmTask?.Id_No || activeAlarmTask?.idNo)}
                task={activeAlarmTask}
                onComplete={handleCompleteAlarm}
            />

            <style hmr-ignore="true">{`
                @keyframes ribbonGlow {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); border-color: rgba(16, 185, 129, 0.4); }
                    70% { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); border-color: rgba(16, 185, 129, 0.8); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); border-color: rgba(16, 185, 129, 0.4); }
                }
                .animate-ribbon-glow {
                    animation: ribbonGlow 2.5s infinite ease-in-out;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 40s linear infinite;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>
            <SoftwareAboutModal
                isOpen={showSoftwareAboutModal}
                onClose={() => setShowSoftwareAboutModal(false)}
            />

            <FeatureLockedModal
                isOpen={showDashboardLockedModal}
                onClose={() => setShowDashboardLockedModal(false)}
                title="Dashboard Locked"
                message="Please contact the administrator to unlock access."
            />

            <QuickLaunchGridModal
                isOpen={showQuickLaunchModal}
                onClose={() => setShowQuickLaunchModal(false)}
                items={navItems}
                onSearch={() => setShowSearchModal(true)}
                onAIClick={handleAIClick}
            />


        </div>
    );
};

// Custom Rectangular Bento Card Component
// Module Card Component
const ModuleCard = ({ item, Icon, setIsLoaderStopped }) => {
    const animatedLabels = ['Dashboard', 'Accounts', 'Customers', 'Vendors', 'Billing', 'Pay Bills', 'Cheques', 'Cash', 'Deposit', 'Journal', 'Rec.', 'Report'];
    const isAnimated = item.gif && animatedLabels.includes(item.label);
    const color = item.color || '#0078d4';

    const getDesc = (label) => {
        switch(label) {
            case 'Dashboard': return 'View key metrics and analytics';
            case 'Accounts': return 'Manage chart of accounts';
            case 'Customers': return 'Track customer profiles';
            case 'Vendors': return 'Manage vendor accounts';
            case 'Billing': return 'Create and manage bills';
            case 'Pay Bills': return 'Process vendor payments';
            case 'Cheques': return 'Write and print cheques';
            case 'Cash': return 'Manage petty cash';
            case 'Deposit': return 'Record bank deposits';
            case 'Journal': return 'Manual journal entries';
            case 'Rec.': return 'Reconcile bank statements';
            case 'Report': return 'Generate financial reports';
            default: return `Manage ${label.toLowerCase()} module`;
        }
    };

    return (
        <button
            onClick={() => { item.onClick(); setIsLoaderStopped(true); }}
            className="w-full flex flex-col items-center justify-center p-4 sm:p-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 hover:-translate-y-2 active:scale-95 transition-all duration-300 relative overflow-hidden h-auto min-h-[200px] group"
            style={{
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = color + '40';
                e.currentTarget.style.boxShadow = `0 12px 30px -8px ${color}30`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
        >
            <div className="relative z-10 transition-all duration-300 flex items-center justify-center mb-3">
                <div className={`${isAnimated ? 'w-20 h-20' : 'w-14 h-14'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    {item.gif ? (
                        <>
                            {isAnimated && (
                                <Icon size={48} strokeWidth={1.5} className="text-slate-400 group-hover:opacity-0 transition-opacity duration-300 absolute" />
                            )}
                            <img src={item.gif} alt={item.label} className={`object-contain transition-all duration-500 ${isAnimated ? 'w-20 h-20 opacity-0 group-hover:opacity-100' : 'w-12 h-12 opacity-100'}`} />
                        </>
                    ) : (
                        <Icon size={48} strokeWidth={1.5} className="transition-colors duration-300" style={{ color }} />
                    )}
                </div>
            </div>
            
            <span className="text-[14px] font-bold text-slate-700 transition-colors duration-300 text-center leading-tight group-hover:text-slate-900 mt-2">
                {item.label}
            </span>
            <span className="text-[11px] text-slate-400 text-center mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity px-1 pb-1">
                {getDesc(item.label)}
            </span>
        </button>
    );
};

const CustomCard = ({ icon: Icon, label, subtitle, onClick, className, iconSize = 32 }) => (
    <button
        onClick={onClick}
        className={`relative p-8 rounded-3xl border border-white/60 backdrop-blur-md flex flex-col justify-between items-start text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] active:scale-95 group overflow-hidden ${className}`}
    >
        {/* Decorative Background Element */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0078d4]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
            <Icon size={iconSize} strokeWidth={1.5} className="text-[#0078d4]" />
        </div>

        <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 group-hover:opacity-100 transition-opacity">
                {subtitle}
            </div>
            <div className="text-xl font-extrabold tracking-tighter truncate w-full">
                {label}
            </div>
        </div>

        <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-30 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
            <ChevronRight size={24} />
        </div>
    </button>
);

// Ribbon Button Component (Matches Legacy style)
const RibbonButton = ({ icon: Icon, label, onClick, active, hasBadge, isHighlighted, gif, iconColor }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center min-w-[75px] h-[75px] m-0.5 rounded-xl relative transition-all duration-300 group
            ${active
                ? 'bg-white/20 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm'
                : 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg'}
            ${isHighlighted ? 'bg-gradient-to-br from-emerald-500/20 via-green-600/30 to-emerald-500/10 text-white border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-ribbon-glow' : ''}
        `}
    >
        <div className="relative z-10">
            {gif ? (
                <img src={gif} alt={label} className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
            ) : (
                <Icon size={26} strokeWidth={1.8} className={`group-hover:scale-110 transition-all duration-300 ${iconColor || 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]'}`} />
            )}
        </div>

        <span className="text-[11px] font-bold mt-2 tracking-wide leading-none text-center relative z-10 px-1 opacity-90 group-hover:opacity-100">
            {label.length > 9 ? <>{label.split(' ')[0]}<br />{label.split(' ')[1]}</> : label}
        </span>

        {/* Premium Active Indicator */}
        {active && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        )}

        {/* Subtle Hover Glow Overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-300" />
    </button>
);

export default Dashboard;
