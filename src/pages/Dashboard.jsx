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
import SubscriptionModal from '../components/modals/SubscriptionModal';
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

// Master File specific boards
import CompanyBoard from '../components/modals/MasterSubModal/CompanyBoard';
import CostCenterBoard from '../components/modals/MasterSubModal/CostCenterBoard';
import CategoryBoard from '../components/modals/MasterSubModal/CategoryBoard';
import RouteBoard from '../components/modals/MasterSubModal/RouteBoard';
import AreaBoard from '../components/modals/MasterSubModal/AreaBoard';
import CardCommissionBoard from '../components/modals/MasterSubModal/CardCommissionBoard';
import UserProfileBoard from '../components/modals/MasterSubModal/UserProfileBoard';
import VendorTypesBoard from '../components/modals/MasterSubModal/VendorTypesBoard';
import CustomerTypeBoard from '../components/modals/MasterSubModal/CustomerTypeBoard';
import ChartOfAccountantModal from '../components/modals/ChartOfAccountsModels/ChartOfAccountantModal';


// View and Utility Boards
import LetterEnvelopesModal from '../components/modals/LetterEnvelopesModal';
import OfficeDocumentModal from '../components/modals/OfficeDocumentModal';
import ToDoListBoard from '../components/modals/ViewAndUtilityModels/ToDoListBoard';
import SendFileBoard from '../components/modals/ViewAndUtilityModels/SendFileBoard';
import FindBoard from '../components/modals/ViewAndUtilityModels/FindBoard';
import DocumentSearchModal from '../components/modals/ViewAndUtilityModels/DocumentSearchModal';
import CustomizeIconBarBoard from '../components/modals/ViewAndUtilityModels/CustomizeIconBarBoard';
import ChangeBackgroundBoard from '../components/modals/ViewAndUtilityModels/ChangeBackgroundBoard';

// System Admin Boards
import DatabaseBackupModal from '../components/modals/SystemAdmin/DatabaseBackupModal';
import StockBalanceUpdateModal from '../components/modals/SystemAdmin/StockBalanceUpdateModal';
import InventoryDownloadModal from '../components/modals/SystemAdmin/InventoryDownloadModal';
import DeleteAccountModal from '../components/modals/SystemAdmin/DeleteAccountModal';
import TransactionSearchModal from '../components/modals/SystemAdmin/TransactionSearchModal';
import SystemUpdateModal from '../components/modals/SystemAdmin/SystemUpdateModal';
import ClearTempDataModal from '../components/modals/SystemAdmin/ClearTempDataModal';
import PeriodLockModal from '../components/modals/SystemAdmin/PeriodLockModal';
import JournalEntryEditorModal from '../components/modals/SystemAdmin/JournalEntryEditorModal';
import TransactionEditorModal from '../components/modals/SystemAdmin/TransactionEditorModal';
import CompanyUsersModal from '../components/modals/SystemAdmin/CompanyUsersModal';

// Reports Modals
import AdminReportsModal from '../components/modals/AdminReports/AdminReportsModal';
import AccountingReportsModal from '../components/modals/AdminReports/AccountingReportsModal';
import BankingReportsModal from '../components/modals/AdminReports/BankingReportsModal';
import FinanceManagementModal from '../components/modals/AdminReports/FinanceManagementModal';
import VendorCenterReportsModal from '../components/modals/AdminReports/VendorCenterReportsModal';
import CustomerCenterReportsModal from '../components/modals/AdminReports/CustomerCenterReportsModal';

const Dashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Overview');

    const [showBiDashboardView, setShowBiDashboardView] = useState(false);

    // Master File states
    const [showCompanyBoard, setShowCompanyBoard] = useState(false);
    const [showCostCenterBoard, setShowCostCenterBoard] = useState(false);
    const [showCategoryBoard, setShowCategoryBoard] = useState(false);
    const [showRouteBoard, setShowRouteBoard] = useState(false);
    const [showAreaBoard, setShowAreaBoard] = useState(false);
    const [showSupplierMasterBoard, setShowSupplierMasterBoard] = useState(false);
    const [showCustomerMasterBoard, setShowCustomerMasterBoard] = useState(false);
    const [showCustomerTypeBoard, setShowCustomerTypeBoard] = useState(false);
    const [showVendorTypesBoard, setShowVendorTypesBoard] = useState(false);
    const [showCardCommissionBoard, setShowCardCommissionBoard] = useState(false);
    const [showUserProfileBoard, setShowUserProfileBoard] = useState(false);
    const [showChangePasswordBoard, setShowChangePasswordBoard] = useState(false);
    const [showChartOfAccountantModal, setShowChartOfAccountantModal] = useState(false);
    // View and Utility States
    const [showLetterEnvelopesModal, setShowLetterEnvelopesModal] = useState(false);
    const [showOfficeDocumentModal, setShowOfficeDocumentModal] = useState(false);
    const [showToDoListBoard, setShowToDoListBoard] = useState(false);
    const [showSendFileBoard, setShowSendFileBoard] = useState(false);
    const [showFindBoard, setShowFindBoard] = useState(false);
    const [showDocSearchModal, setShowDocSearchModal] = useState(false);
    const [showCustomizeIconBarBoard, setShowCustomizeIconBarBoard] = useState(false);
    const [showChangeBackgroundBoard, setShowChangeBackgroundBoard] = useState(false);

    // System Admin States
    const [showDatabaseBackupModal, setShowDatabaseBackupModal] = useState(false);
    const [showStockBalanceUpdateModal, setShowStockBalanceUpdateModal] = useState(false);
    const [showInventoryDownloadModal, setShowInventoryDownloadModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showTransactionSearchModal, setShowTransactionSearchModal] = useState(false);
    const [showSystemUpdateModal, setShowSystemUpdateModal] = useState(false);
    const [showClearTempDataModal, setShowClearTempDataModal] = useState(false);
    const [showPeriodLockModal, setShowPeriodLockModal] = useState(false);
    const [showJournalEntryEditorModal, setShowJournalEntryEditorModal] = useState(false);
    const [showTransactionEditorModal, setShowTransactionEditorModal] = useState(false);
    const [showCompanyUsersModal, setShowCompanyUsersModal] = useState(false);

    // Reports States
    const [showAdminReportsModal, setShowAdminReportsModal] = useState(false);
    const [showAccountingReportsModal, setShowAccountingReportsModal] = useState(false);
    const [showBankingReportsModal, setShowBankingReportsModal] = useState(false);
    const [showFinanceManagementModal, setShowFinanceManagementModal] = useState(false);
    const [showVendorCenterReportsModal, setShowVendorCenterReportsModal] = useState(false);
    const [showCustomerCenterReportsModal, setShowCustomerCenterReportsModal] = useState(false);


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
    const [showPricingPlansModal, setShowPricingPlansModal] = useState(false);
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true);

    useEffect(() => {
        let timeout;
        if (showSubscriptionBanner) {
            // Hide after 30 seconds
            timeout = setTimeout(() => {
                setShowSubscriptionBanner(false);
            }, 30 * 1000);
        } else {
            // Show after 10 minutes
            timeout = setTimeout(() => {
                setShowSubscriptionBanner(true);
            }, 30 * 1000);
        }
        return () => clearTimeout(timeout);
    }, [showSubscriptionBanner]);


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

    // --- Notification Tips Panel ---
    const notificationTips = [
        {
            id: 'bank_connect',
            title: 'Have you connected your bank yet?',
            body: 'Connecting your bank unlocks real-time insights and saves hours of manual admin. Not sure where to start? Book in with our experts or organise a callback, and we\'ll guide you step by step.',
            action: 'Get help connecting today',
            onAction: () => setShowNewAccountModal(true),
            image: '/bank_connect.png',
            color: '#0078d4',
        },
        {
            id: 'invite_team',
            title: 'Invite your team members',
            body: 'Collaborate better by inviting your accountant, bookkeeper, or team. Each user gets their own secure login with role-based permissions.',
            action: 'Invite a team member',
            onAction: () => setShowCompanyUsersModal(true),
            image: '/invite_team.png',
            color: '#7c3aed',
        },
        {
            id: 'reconcile',
            title: 'Reconcile your accounts regularly',
            body: 'Stay on top of your finances by reconciling your bank accounts monthly. It only takes a few minutes and keeps your books accurate and audit-ready.',
            action: 'Start reconciling',
            onAction: () => setShowBankRecModal(true),
            image: '/reconcile.png',
            color: '#16a34a',
        },
        {
            id: 'trial_balance',
            title: 'Check your Trial Balance',
            body: 'Your trial balance gives you a quick snapshot of all account balances. It\'s a great way to spot any errors or discrepancies before they become problems.',
            action: 'View Trial Balance',
            onAction: () => setShowTrialBalanceModal(true),
            image: '/trial_balance.png',
            color: '#4f46e5',
        },
        {
            id: 'backup',
            title: 'Back up your data today',
            body: 'Don\'t risk losing your valuable accounting data. Create a backup now to protect your records from unexpected hardware failures or data corruption.',
            action: 'Create a backup',
            onAction: () => setShowDatabaseBackupModal(true),
            image: '/backup.png',
            color: '#0891b2',
        },
        {
            id: 'subscription',
            title: 'Unlock the full power of Accounts',
            body: 'You are on a limited plan. Upgrade now to get unlimited users, multiple companies, priority support, and access to all premium features — all in one place.',
            action: 'View Subscription Plans',
            onAction: () => setShowPricingPlansModal(true),
            image: '/subscription.png',
            color: '#d97706',
        },
        {
            id: 'journal',
            title: 'Use Journal Entries for adjustments',
            body: 'Need to make a manual correction? Journal entries let you directly debit and credit any account. Perfect for accruals, prepayments, and corrections.',
            action: 'Create a Journal Entry',
            onAction: () => setShowJournalEntryModal(true),
            image: '/journal.png',
            color: '#0ea5e9',
        },
    ];

    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [showNotificationTip, setShowNotificationTip] = useState(false);
    const [tipProgress, setTipProgress] = useState(0); // 0-100 for the progress bar
    const [dismissedTips, setDismissedTips] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dismissedTips') || '[]'); } catch { return []; }
    });
    const tipTimerRef = useRef(null);
    const tipProgressRef = useRef(null);

    // Find next undismissed tip starting from a given index
    const findNextTip = (fromIdx, dismissed) => {
        for (let i = fromIdx; i < notificationTips.length; i++) {
            if (!dismissed.includes(notificationTips[i].id)) return i;
        }
        // Wrap around
        for (let i = 0; i < fromIdx; i++) {
            if (!dismissed.includes(notificationTips[i].id)) return i;
        }
        return -1;
    };

    const startTipAutoHide = (duration = 30000) => {
        clearTimeout(tipTimerRef.current);
        clearInterval(tipProgressRef.current);
        setTipProgress(0);
        const startTime = Date.now();
        tipProgressRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / duration) * 100, 100);
            setTipProgress(pct);
            if (pct >= 100) clearInterval(tipProgressRef.current);
        }, 100);
        tipTimerRef.current = setTimeout(() => {
            setShowNotificationTip(false);
        }, duration);
    };

    useEffect(() => {
        // Show first undismissed tip after 15 seconds
        const idx = findNextTip(0, dismissedTips);
        if (idx === -1) return;
        setCurrentTipIndex(idx);
        const timer = setTimeout(() => {
            setShowNotificationTip(true);
        }, 15000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When a tip becomes visible, start auto-hide timer
    useEffect(() => {
        if (showNotificationTip) {
            startTipAutoHide(30000);
        } else {
            clearTimeout(tipTimerRef.current);
            clearInterval(tipProgressRef.current);
            setTipProgress(0);
        }
        return () => {
            clearTimeout(tipTimerRef.current);
            clearInterval(tipProgressRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNotificationTip, currentTipIndex]);

    const dismissTip = (id, scheduleNext = true) => {
        setShowNotificationTip(false);
        clearTimeout(tipTimerRef.current);
        clearInterval(tipProgressRef.current);
        const updated = [...dismissedTips, id];
        setDismissedTips(updated);
        localStorage.setItem('dismissedTips', JSON.stringify(updated));
        if (!scheduleNext) return;
        // Show next tip after 3 minutes
        const nextIdx = findNextTip(currentTipIndex + 1, updated);
        if (nextIdx !== -1) {
            setTimeout(() => {
                setCurrentTipIndex(nextIdx);
                setShowNotificationTip(true);
            }, 3 * 60 * 1000);
        }
    };



    const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [biData, setBiData] = useState(null);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isLoaderStopped, setIsLoaderStopped] = useState(false);
    const [depositData, setDepositData] = useState(null);

    const [ribbonIcons, setRibbonIcons] = useState(() => {
        const defaultIcons = [
            'home', 'new_account', 'customer', 'vendor', 'enter_bill',
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
            setShowPromoModal(true);
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
            {
                group: 'Company Setup',
                items: [
                    { label: 'Open Company', onClick: () => setShowCompanyBoard(true) },
                    { label: 'Cost Center Master', onClick: () => setShowCostCenterBoard(true) },
                ]
            },
            {
                group: 'Organization Structure',
                items: [
                    { label: 'Create Department', onClick: () => setShowDepartmentModal(true) },
                    { label: 'Create Category', onClick: () => setShowCategoryBoard(true) },
                    { label: 'Create Route', onClick: () => setShowRouteBoard(true) },
                    { label: 'Create Area', onClick: () => setShowAreaBoard(true) },
                ]
            },
            {
                group: 'Business Partners',
                items: [
                    { label: 'Supplier Master', onClick: () => setShowSupplierMasterBoard(true) },
                    { label: 'Customer Master', onClick: () => setShowCustomerMasterBoard(true) },
                    { label: 'Customer Type Master', onClick: () => setShowCustomerTypeBoard(true) },
                    { label: 'Vendor Types', onClick: () => setShowVendorTypesBoard(true) },
                ]
            },
            {
                group: 'Finance & Accounting',
                items: [
                    { label: 'Chart of Accountant', onClick: () => setShowChartOfAccountantModal(true) },
                    { label: 'Card Sale Commission', onClick: () => setShowCardCommissionBoard(true) },
                ]
            },
            {
                group: 'System Administration',
                items: [
                    { label: 'User Profile Maintenance', onClick: () => setShowUserProfileBoard(true) },
                    { label: 'Change Password', onClick: () => setShowChangePasswordBoard(true) },
                ]
            }
        ],
        'View and Utility': [
            { label: 'Customize Icon Bar', onClick: () => setShowCustomizeIconBarBoard(true) },
            { label: 'View Side Bar', onClick: () => setShowSideBar(true) },
            { label: 'Change Background', onClick: () => setShowChangeBackgroundBoard(true) },
            { label: 'Send File', onClick: () => setShowSendFileBoard(true) },
            { label: 'Use E-Mail', onClick: () => { } },
            { label: 'Open Office Document', onClick: () => setShowOfficeDocumentModal(true) },
            { label: 'Reminder - To Do List', onClick: () => setShowToDoListBoard(true) },
            { label: 'Open Notepad', onClick: () => { } },
            { label: 'Use Calculator', onClick: () => setShowCalculatorModal(true) },
            { label: 'Find', onClick: () => setShowFindBoard(true) },
            { label: 'Search', onClick: () => setShowDocSearchModal(true) },
            { label: 'Printer Setup', onClick: () => { } },
            { label: 'Prepare Letter with Envelopes', onClick: () => setShowLetterEnvelopesModal(true) },
        ],
        'Transaction': [
            {
                group: 'Customer Center',
                items: [
                    { label: 'Create Invoices', onClick: () => setShowSalesOrderModal(true) },
                    { label: 'Customer Invoices', onClick: () => setShowCustomerInvoiceModal(true) },
                    { label: 'Received Payment', onClick: () => setShowReceivePaymentModal(true) },
                    { label: 'Customer Receipt', onClick: () => setShowCustomerReceiptModal(true) },
                    { label: 'Customer Advanced Receive', onClick: () => setShowCustomerAdvanceModal(true) },
                ]
            },
            {
                group: 'Vendors Center',
                items: [
                    { label: 'Enter Bill', onClick: () => setShowEnterBillModal(true) },
                    { label: 'Paybill', onClick: () => setShowPayBillModal(true) },
                    { label: 'Advanced Issued', onClick: () => setShowAdvancePayModal(true) },
                ]
            },
            {
                group: 'Accounting',
                items: [
                    { label: 'Opening Balance', onClick: () => setShowOpeningBalanceModal(true) },
                    { label: 'Petty Cash Entry', onClick: () => setShowPettyCashModal(true) },
                    { label: 'Main Cash', onClick: () => setShowMainCashModal(true) },
                    { label: 'Make General Journal Entries', onClick: () => setShowJournalEntryModal(true) },
                    { label: 'Reversal Entry Form', onClick: () => setShowReversalEntryModal(true) },
                    { label: 'Payment Setoff', onClick: () => setShowPaymentSetoffModal(true) },
                ]
            },
            {
                group: 'Banking',
                items: [
                    { label: 'Make Deposits', onClick: () => setShowCollectionToDepositModal(true) },
                    { label: 'Direct Bank Transaction', onClick: () => setShowDirectBankTransactionModal(true) },
                    { label: 'Transfer Funds', onClick: () => setShowFundsTransferModal(true) },
                    { label: 'Reconcile', onClick: () => setShowBankRecModal(true) },
                    { label: 'Cheque Cancel', onClick: () => setShowChequeCancelModal(true) },
                    { label: 'Customer Cheque Return', onClick: () => setShowCustomerChequeReturnModal(true) },
                    { label: 'Enter Cheque Book Number', onClick: () => setShowChequeBookEntryModal(true) },
                    { label: 'Cheque Writing', onClick: () => setShowWriteChequeModal(true) },
                    { label: 'Cheque In Hand', onClick: () => setShowChequeInHandModal(true) },
                    { label: 'Not Presented Cheques', onClick: () => setShowNotPresentedChequesModal(true) },
                ]
            }
        ],
        'Reports': [
            {
                group: 'Financial Statements',
                items: [
                    { label: 'Profit & Loss Account', onClick: () => setShowFinanceManagementModal(true) },
                    { label: 'General Ledger', onClick: () => setShowFinanceManagementModal(true) },
                    { label: 'Trial Balance', onClick: () => setShowFinanceManagementModal(true) },
                    { label: 'Balance Sheet', onClick: () => setShowFinanceManagementModal(true) },
                ]
            },
            {
                group: 'Accounting Reports',
                items: [
                    { label: 'Accounting Details', onClick: () => setShowAccountingReportsModal(true) },
                    { label: 'Accounting Report', onClick: () => setShowAccountingReportsModal(true) },
                    { label: 'Journal Entry Reports', onClick: () => setShowAccountingReportsModal(true) },
                    { label: 'Double Entry Details Report', onClick: () => setShowAccountingReportsModal(true) },
                ]
            },
            {
                group: 'Bank Statements',
                items: [
                    { label: 'Banking', onClick: () => setShowBankingReportsModal(true) },
                    { label: 'Bank Statement', onClick: () => setShowBankingReportsModal(true) },
                ]
            },
            {
                group: 'Reconciliation',
                items: [
                    { label: 'Bank Reconciliation Statement', onClick: () => setShowBankingReportsModal(true) },
                    { label: 'Reconciliation Summary', onClick: () => setShowBankingReportsModal(true) },
                    { label: 'Reconciliation Detail Summary', onClick: () => setShowBankingReportsModal(true) },
                ]
            },
            {
                group: 'Cheque Books',
                items: [
                    { label: 'Entered Cheque Books Report', onClick: () => setShowBankingReportsModal(true) },
                    { label: 'Cheque Diary', onClick: () => setShowBankingReportsModal(true) },
                ]
            },
            {
                group: 'Customer Reports',
                items: [
                    { label: 'Debtor Aging Analyst', onClick: () => setShowCustomerCenterReportsModal(true) },
                    { label: 'Debtors Statement', onClick: () => setShowCustomerCenterReportsModal(true) },
                    { label: 'Debtors Balance Summary', onClick: () => setShowCustomerCenterReportsModal(true) },
                    { label: 'Invoice Details', onClick: () => setShowCustomerCenterReportsModal(true) },
                ]
            },
            {
                group: 'Vendor Reports',
                items: [
                    { label: 'Creditor Aging Analyst', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Creditor Statement', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Creditor Balance Report', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Unpaid Bills Details', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Transaction List by Vendor', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Creditor Statement (Given Date)', onClick: () => setShowVendorCenterReportsModal(true) },
                    { label: 'Creditor Balance Report (Given Date)', onClick: () => setShowVendorCenterReportsModal(true) },
                ]
            },
            {
                group: 'Inventory Reports',
                items: [
                    { label: 'Stock Report', onClick: () => setShowAdminReportsModal(true) },
                ]
            },
            {
                group: 'Audit Reports',
                items: [
                    { label: 'System Log Report', onClick: () => setShowAdminReportsModal(true) },
                    { label: 'Transaction Log Report', onClick: () => setShowAdminReportsModal(true) },
                ]
            },
            {
                group: 'Exception Reports',
                items: [
                    { label: 'Cancelled Transaction Report', onClick: () => setShowAdminReportsModal(true) },
                ]
            }
        ],
        'System Admin': [
            { label: 'Data Backup', onClick: () => setShowDatabaseBackupModal(true) },
            { label: 'Stock Balance Update', onClick: () => setShowStockBalanceUpdateModal(true) },
            { label: 'Inventory Download', onClick: () => setShowInventoryDownloadModal(true) },
            { label: 'Delete Account', onClick: () => setShowDeleteAccountModal(true) },
            { label: 'Transaction Search', onClick: () => setShowTransactionSearchModal(true) },
            { label: 'Document Editor', onClick: () => setShowJournalEntryEditorModal(true) },
            { label: 'Transaction Editor', onClick: () => setShowTransactionEditorModal(true) },
            { label: 'System Update', onClick: () => setShowSystemUpdateModal(true) },
            { label: 'Clear Temp Data', onClick: () => setShowClearTempDataModal(true) },
            { label: 'Period Lock Facility', onClick: () => setShowPeriodLockModal(true) },
            { label: 'User & Role Management', onClick: () => setShowCompanyUsersModal(true) },
            { label: 'Change Password', onClick: () => setShowChangePasswordBoard(true) },
        ],
        'Help': [],
        'About': [
            { label: 'About Software', onClick: () => setShowSoftwareAboutModal(true) },
        ],
    };


    const settingsMenuItems = [
        {
            group: 'YOUR COMPANY',
            items: [
                { label: 'Company Setup', onClick: () => setShowCompanyBoard(true) },
                { label: 'Manage Users', onClick: () => setShowCompanyUsersModal(true) },
                { label: 'Chart of Accounts', onClick: () => setShowChartOfAccountantModal(true) },
                { label: 'Change Password', onClick: () => setShowChangePasswordBoard(true) },
            ]
        },
        {
            group: 'LISTS',
            items: [
                { label: 'Customer Master', onClick: () => setShowCustomerMasterBoard(true) },
                { label: 'Supplier Master', onClick: () => setShowSupplierMasterBoard(true) },
                { label: 'Products & Categories', onClick: () => setShowCategoryBoard(true) },
                { label: 'Cost Centers', onClick: () => setShowCostCenterBoard(true) },
            ]
        },
        {
            group: 'TOOLS',
            items: [
                { label: 'Data Backup', onClick: () => setShowDatabaseBackupModal(true) },
                { label: 'System Update', onClick: () => setShowSystemUpdateModal(true) },
                { label: 'Reconcile', onClick: () => setShowBankRecModal(true) },
                { label: 'Audit Log', onClick: () => setShowAdminReportsModal(true) },
            ]
        },
        {
            group: 'PROFILE',
            items: [
                { label: 'User Profile', onClick: () => setShowUserProfileBoard(true) },
                { label: 'Customize Icon Bar', onClick: () => setShowCustomizeIconBarBoard(true) },
                { label: 'Change Background', onClick: () => setShowChangeBackgroundBoard(true) },
            ]
        }
    ];

    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    return (
        <div className="h-screen w-screen flex flex-col font-['Plus_Jakarta_Sans'] bg-[#f8fafc] select-none text-slate-800 overflow-hidden">
            {/* Top Subscription Banner OR Marquee Bar */}
            {showSubscriptionBanner ? (
                <div className="bg-[#0078d4] text-white text-[13px] h-9 flex justify-center items-center gap-2 relative z-50 transition-all animate-in slide-in-from-top duration-300 mb-2">
                    <span>Save 50% for 3 months.</span>
                    <button onClick={() => setShowPricingPlansModal(true)} className="underline font-bold hover:text-white/80 transition-colors">Subscribe now</button>
                    <button onClick={() => setShowSubscriptionBanner(false)} className="absolute right-4 text-white/70 hover:text-white transition-colors">
                        <X size={28} strokeWidth={1.5} />
                    </button>
                </div>
            ) : (
                <div className="h-9 bg-[#0078d4] border-b border-blue-600 flex items-center px-6 gap-6 relative overflow-hidden z-50 transition-all animate-in slide-in-from-top duration-300 mb-2">
                    <div className="flex-1 overflow-hidden relative h-full flex items-center">
                        <div className="absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-[#0078d4] to-transparent pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-[#0078d4] to-transparent pointer-events-none" />
                        <div className="whitespace-nowrap animate-marquee flex items-center gap-16" style={{ animationDuration: '180s' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-white">
                                        {selectedCompany?.CompanyName || selectedCompany?.companyName || 'Enterprise'}
                                    </span>
                                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Modal Overlays */}
            <SubscriptionModal isOpen={showPricingPlansModal} onClose={() => setShowPricingPlansModal(false)} />

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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-sm w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
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

            {/* Master File Boards */}
            <CompanyBoard isOpen={showCompanyBoard} onClose={() => setShowCompanyBoard(false)} />
            <CostCenterBoard isOpen={showCostCenterBoard} onClose={() => setShowCostCenterBoard(false)} />
            <CategoryBoard isOpen={showCategoryBoard} onClose={() => setShowCategoryBoard(false)} />
            <RouteBoard isOpen={showRouteBoard} onClose={() => setShowRouteBoard(false)} />
            <AreaBoard isOpen={showAreaBoard} onClose={() => setShowAreaBoard(false)} />
            <SupplierMasterBoard isOpen={showSupplierMasterBoard} onClose={() => setShowSupplierMasterBoard(false)} />
            <CustomerMasterBoard isOpen={showCustomerMasterBoard} onClose={() => setShowCustomerMasterBoard(false)} />
            <CustomerTypeBoard isOpen={showCustomerTypeBoard} onClose={() => setShowCustomerTypeBoard(false)} />
            <VendorTypesBoard isOpen={showVendorTypesBoard} onClose={() => setShowVendorTypesBoard(false)} />
            {/* View Utility Modals */}
            <LetterEnvelopesModal isOpen={showLetterEnvelopesModal} onClose={() => setShowLetterEnvelopesModal(false)} />
            <OfficeDocumentModal isOpen={showOfficeDocumentModal} onClose={() => setShowOfficeDocumentModal(false)} />
            <ToDoListBoard isOpen={showToDoListBoard} onClose={() => setShowToDoListBoard(false)} />
            <SendFileBoard isOpen={showSendFileBoard} onClose={() => setShowSendFileBoard(false)} />
            <FindBoard isOpen={showFindBoard} onClose={() => setShowFindBoard(false)} />
            <DocumentSearchModal isOpen={showDocSearchModal} onClose={() => setShowDocSearchModal(false)} />
            <CustomizeIconBarBoard isOpen={showCustomizeIconBarBoard} onClose={() => setShowCustomizeIconBarBoard(false)} onSave={() => window.location.reload()} />
            <ChangeBackgroundBoard isOpen={showChangeBackgroundBoard} onClose={() => setShowChangeBackgroundBoard(false)} />

            {/* System Admin Modals */}
            <DatabaseBackupModal isOpen={showDatabaseBackupModal} onClose={() => setShowDatabaseBackupModal(false)} />
            <StockBalanceUpdateModal isOpen={showStockBalanceUpdateModal} onClose={() => setShowStockBalanceUpdateModal(false)} />
            <InventoryDownloadModal isOpen={showInventoryDownloadModal} onClose={() => setShowInventoryDownloadModal(false)} />
            <DeleteAccountModal isOpen={showDeleteAccountModal} onClose={() => setShowDeleteAccountModal(false)} />
            <TransactionSearchModal isOpen={showTransactionSearchModal} onClose={() => setShowTransactionSearchModal(false)} />
            <SystemUpdateModal isOpen={showSystemUpdateModal} onClose={() => setShowSystemUpdateModal(false)} />
            <ClearTempDataModal isOpen={showClearTempDataModal} onClose={() => setShowClearTempDataModal(false)} />
            <PeriodLockModal isOpen={showPeriodLockModal} onClose={() => setShowPeriodLockModal(false)} />
            <JournalEntryEditorModal isOpen={showJournalEntryEditorModal} onClose={() => setShowJournalEntryEditorModal(false)} />
            <TransactionEditorModal isOpen={showTransactionEditorModal} onClose={() => setShowTransactionEditorModal(false)} />
            <CompanyUsersModal isOpen={showCompanyUsersModal} onClose={() => setShowCompanyUsersModal(false)} />

            {/* Reports Modals */}
            <AdminReportsModal isOpen={showAdminReportsModal} onClose={() => setShowAdminReportsModal(false)} />
            <AccountingReportsModal isOpen={showAccountingReportsModal} onClose={() => setShowAccountingReportsModal(false)} />
            <BankingReportsModal isOpen={showBankingReportsModal} onClose={() => setShowBankingReportsModal(false)} />
            <FinanceManagementModal isOpen={showFinanceManagementModal} onClose={() => setShowFinanceManagementModal(false)} />
            <VendorCenterReportsModal isOpen={showVendorCenterReportsModal} onClose={() => setShowVendorCenterReportsModal(false)} />
            <CustomerCenterReportsModal isOpen={showCustomerCenterReportsModal} onClose={() => setShowCustomerCenterReportsModal(false)} />

            <CardCommissionBoard isOpen={showCardCommissionBoard} onClose={() => setShowCardCommissionBoard(false)} />
            <UserProfileBoard isOpen={showUserProfileBoard} onClose={() => setShowUserProfileBoard(false)} />
            <ChangePasswordBoard isOpen={showChangePasswordBoard} onClose={() => setShowChangePasswordBoard(false)} />
            <ChartOfAccountantModal isOpen={showChartOfAccountantModal} onClose={() => setShowChartOfAccountantModal(false)} />

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
                        {/* Dynamic Greeting removed from here */}
                    </div>

                    {/* Center: Main Navigation Tabs */}
                    <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2 z-[200]">
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
                                        onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                                        className={`text-[13.5px] font-sans font-semibold tracking-wide ${activeMenu === item ? 'text-[#0078d4] bg-blue-50' : 'text-slate-600'} hover:text-[#0078d4] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/30 px-4 py-2 rounded-lg transition-all whitespace-nowrap active:scale-95`}
                                    >
                                        {item}
                                    </button>
                                    {activeMenu === item && items.length > 0 && (
                                        <div
                                            className="fixed sm:absolute top-[56px] sm:top-full left-2 sm:left-1/2 right-2 sm:right-auto sm:-translate-x-1/2 mt-0 sm:mt-3 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-none py-4 sm:py-6 px-4 sm:px-8 z-[200] border border-gray-100 w-auto sm:w-max max-h-[85vh] sm:max-h-none overflow-y-auto"
                                            onMouseEnter={() => clearTimeout(menuTimeoutRef.current)}
                                            onMouseLeave={() => {
                                                menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
                                            }}
                                        >
                                            <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden no-scrollbar">
                                                {items[0]?.group ? (
                                                    <div className={`columns-1 sm:columns-2 ${items.length >= 3 ? 'lg:columns-3' : ''} ${items.length >= 4 ? 'xl:columns-4' : ''} gap-6 sm:gap-12`}>
                                                        {items.map((menuItem, i) => (
                                                            <div key={i} className="flex flex-col min-w-[140px] sm:min-w-[160px] break-inside-avoid mb-6 sm:mb-8">
                                                                <h3 className="text-[11px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">{menuItem.group}</h3>
                                                                <div className="flex flex-col gap-2 sm:gap-3">
                                                                    {menuItem.items.map((subItem, j) => (
                                                                        <button
                                                                            key={j}
                                                                            onClick={() => {
                                                                                subItem.onClick();
                                                                                setActiveMenu(null);
                                                                            }}
                                                                            className="w-full text-left text-[13px] font-sans font-medium text-gray-600 hover:text-[#0078d4] hover:bg-[#f4f5f8] px-2 py-1.5 -mx-2 rounded-md transition-all block"
                                                                        >
                                                                            {subItem.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-2 sm:gap-y-3 min-w-0 sm:min-w-[320px]">
                                                        {items.map((menuItem, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    menuItem.onClick();
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full text-left text-[13px] font-sans font-medium text-gray-600 hover:text-[#0078d4] hover:bg-[#f4f5f8] px-2 py-1.5 -mx-2 rounded-md transition-all block"
                                                            >
                                                                {menuItem.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>

                    {/* Right: User + AI + Menu */}
                    <div className="flex items-center gap-3">
                        {/* Settings Gear Icon */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                                className="flex items-center justify-center w-[36px] h-[36px] rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                            >
                                <Settings size={20} />
                            </button>
                            {showSettingsDropdown && (
                                <div
                                    className="absolute top-full right-0 mt-3 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-6 px-8 z-[200] border border-gray-100 min-w-[max-content]"
                                    onMouseLeave={() => setShowSettingsDropdown(false)}
                                >
                                    <div className="flex flex-row gap-12">
                                        {settingsMenuItems.map((menuItem, i) => (
                                            <div key={i} className="flex flex-col min-w-[140px]">
                                                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">{menuItem.group}</h3>
                                                <div className="flex flex-col gap-3">
                                                    {menuItem.items.map((subItem, j) => (
                                                        <button
                                                            key={j}
                                                            onClick={() => {
                                                                subItem.onClick();
                                                                setShowSettingsDropdown(false);
                                                            }}
                                                            className="w-full text-left text-[13px] text-gray-700 hover:text-[#0078d4] hover:underline transition-all block"
                                                        >
                                                            {subItem.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Bubble & Dropdown */}
                        <div className="relative mx-1">
                            <div
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="w-[28px] h-[28px] rounded-full bg-[#4096ff] text-white flex items-center justify-center font-bold text-[11px] shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all"
                                title={user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'User'}
                            >
                                {(user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'User').charAt(0).toUpperCase()}
                            </div>

                            {showProfileDropdown && (
                                <div
                                    className="absolute top-full right-0 mt-3 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-2 w-40 z-[200] border border-gray-100"
                                    onMouseLeave={() => setShowProfileDropdown(false)}
                                >
                                    <button
                                        onClick={() => {
                                            setShowProfileDropdown(false);
                                            setShowLogoutConfirmModal(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        <span className="font-semibold">Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* AI Button - Custom Animated Pill */}
                        <button
                            data-tour="ai-chatbot"
                            onClick={() => setShowAIChatbotModal(!showAIChatbotModal)}
                            className="relative flex items-center justify-center ml-1 group cursor-pointer transition-transform hover:scale-[1.02]"
                            title="AI Assistant"
                        >
                            {/* Animated Gradient Border */}
                            <div className="rounded-full p-[2px] bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] bg-[length:200%_200%] animate-[gradient_3s_ease_infinite] shadow-[0_0_10px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-shadow">
                                <div className="h-[32px] px-3.5 bg-white rounded-full flex items-center overflow-hidden relative">
                                    {/* Inner glowing pulse */}
                                    <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Custom AI Asterisk animated */}
                                    <div className="relative flex items-center justify-center w-[18px] h-[18px] group-hover:rotate-180 transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-full bg-gradient-to-b from-[#3b82f6] to-[#1e1b4b] rounded-full"></div>
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[3px] bg-gradient-to-r from-[#60a5fa] to-[#4338ca] rounded-full"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px] bg-gradient-to-r from-[#93c5fd] to-[#312e81] rounded-full rotate-45"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px] bg-gradient-to-r from-[#bfdbfe] to-[#3730a3] rounded-full -rotate-45"></div>
                                    </div>

                                    {/* Animated Shimmering Text */}
                                    <div className="ml-2.5 whitespace-nowrap text-[13.5px] font-medium tracking-tight w-[130px] flex items-center h-full">
                                        <AITypingText />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {isTopBarCollapsed && (
                        <div className="flex items-center">
                            <ChevronRight size={18} className="text-slate-300 cursor-pointer hover:text-slate-500 transition-all transform rotate-90" onClick={() => { setIsTopBarCollapsed(false); setShowSideBar(false); }} />
                        </div>
                    )}
                </div>

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
                    <div className="p-8 w-full flex flex-col gap-8">

                        {/* Header & BI Data Summary (QuickBooks Style) */}
                        <div className="flex flex-col items-center justify-center gap-6 relative">
                            {/* Dynamic Greeting */}
                            <div className="flex flex-col items-center justify-center text-center w-full z-0">
                                <h1 className="text-[36px] font-extrabold text-[#1e293b] leading-tight mb-1.5 text-center tracking-tight">
                                    {(() => {
                                        const h = new Date().getHours();
                                        if (h < 12) return 'Good morning';
                                        if (h < 17) return 'Good afternoon';
                                        return 'Good evening';
                                    })()}, {user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'User'}!
                                </h1>
                                <p className="text-[16px] font-semibold text-slate-500 mt-1.5 text-center">Here's what's happening with your business today.</p>
                            </div>

                            {/* Actions Row */}
                            <div className="flex flex-row items-center justify-between z-10 w-full relative">
                                {/* Quick Actions Button */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => { clearTimeout(menuTimeoutRef.current); setShowQuickActions(true); }}
                                    onMouseLeave={() => { menuTimeoutRef.current = setTimeout(() => setShowQuickActions(false), 200); }}
                                >
                                    <button
                                        data-tour="quick-launch"
                                        className={`flex items-center gap-2 px-4 h-[36px] border rounded-xl transition-all font-bold text-[12.5px] group shadow-sm ${showQuickActions
                                                ? 'text-blue-600 border-blue-400 bg-blue-50 shadow-blue-100'
                                                : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/60'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${showQuickActions ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-100'
                                            }`}>
                                            <LayoutGrid size={11} className={showQuickActions ? 'text-white' : 'text-blue-600'} />
                                        </div>
                                        Quick Actions
                                        <ChevronRight size={12} className={`ml-0.5 transition-transform duration-200 ${showQuickActions ? 'rotate-90 text-blue-600' : 'rotate-0 text-slate-400'}`} />
                                    </button>

                                    {showQuickActions && (
                                        <div
                                            className="absolute top-full left-0 mt-1.5 w-[600px] max-h-[72vh] overflow-y-auto no-scrollbar bg-white border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.14)] rounded-2xl py-3 z-[200]"
                                            onMouseEnter={() => clearTimeout(menuTimeoutRef.current)}
                                            onMouseLeave={() => { menuTimeoutRef.current = setTimeout(() => setShowQuickActions(false), 200); }}
                                        >
                                            <div className="px-4 pb-2 flex items-center justify-between">
                                                <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            </div>
                                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-3 mb-2" />
                                            <div className="grid grid-cols-3 gap-1 px-2">
                                                {ribbonIcons.map((iconId) => {
                                                const iconData = {
                                                    logout: { icon: LogOut, label: 'Logout', onClick: () => setShowLogoutConfirmModal(true), iconColor: '#dc2626', bg: '#fef2f2' },
                                                    home: { icon: PieChart, label: 'Dashboard', onClick: () => navigate('/bi-dashboard'), iconColor: '#1e3a5f', bg: '#f1f5f9' },
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
                                                    help: { icon: HelpCircle, label: 'Help', onClick: () => { }, iconColor: '#64748b', bg: '#f8fafc' },
                                                    category: { icon: Layers, label: 'Category', onClick: () => setShowCategoryModal(true), active: showCategoryModal, iconColor: '#ea580c', bg: '#fff7ed' },
                                                    reminder: { icon: Bell, label: 'Reminder', onClick: () => setShowReminderModal(true), active: showReminderModal, iconColor: '#ca8a04', bg: '#fefce8' },
                                                    dashboard: { icon: LayoutDashboard, label: 'BI Dashboard', onClick: () => navigate('/bi-dashboard'), active: showBiDashboardView, iconColor: '#0891b2', bg: '#ecfeff' },
                                                }[iconId];
                                                if (!iconData) return null;
                                                const Icon = iconData.icon;
                                                const isActive = iconData.active;
                                                return (
                                                    <button
                                                        key={iconId}
                                                        onClick={() => { iconData.onClick(); setShowQuickActions(false); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 group/item ${isActive ? 'bg-blue-50/80 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                                            </div>
                                            <div className="h-px bg-slate-100 mx-3 mt-2" />
                                            <div className="px-4 pt-2 pb-1"><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Hover to explore</span></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        data-tour="rate-system"
                                        onClick={() => setShowReviewModal(true)}
                                        className="flex items-center gap-2 px-4 h-[36px] bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm active:scale-95 transition-all duration-200"
                                    >
                                        <Star size={14} />
                                        Rate
                                    </button>
                                    <button
                                        data-tour="global-search"
                                        onClick={() => setShowSearchModal(true)}
                                        className="flex items-center gap-2 px-4 h-[36px] bg-white border border-slate-200/80 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm active:scale-95 transition-all duration-200"
                                    >
                                        <Search size={14} className="text-slate-400" />
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quickbooks-style Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
                            {/* Bank Accounts */}
                            <div className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
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
                            <div className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
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
                            <div className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
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

                            {/* View widgets card */}
                            <div
                                className="bg-white p-5 border-2 border-dashed border-[#0078d4]/50 animate-border-pulse hover:bg-[#f0f7ff] transition-all cursor-pointer flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02]"
                                onClick={() => navigate('/bi-dashboard')}
                            >
                                <h3 className="text-[13px] font-bold text-[#0078d4] mb-4">View Widgets</h3>
                                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#0078d4]/30 flex items-center justify-center mb-4 bg-[#e8f2fb]">
                                    <LayoutGrid size={20} className="text-[#0078d4]" />
                                </div>
                                <span className="text-[11px] font-bold text-[#0078d4]/70 flex items-center gap-1">
                                    <Eye size={14} /> Browse dashboards
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
                </main>

                {showBiDashboardView && (
                    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/30 animate-popup">
                        <GetThingsDoneBoard
                            isOpen={true}
                            isInline={true}
                            onClose={() => setShowBiDashboardView(false)}
                            user={user}
                            selectedCompany={selectedCompany}
                            onAction={(id) => {
                                setShowBiDashboardView(false);
                                switch (id) {
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
                )}

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
                @keyframes borderPulse {
                    0%, 100% { border-color: rgba(0, 120, 212, 0.3); }
                    50% { border-color: rgba(0, 120, 212, 0.9); }
                }
                .animate-border-pulse {
                    animation: borderPulse 1.8s ease-in-out infinite;
                }
                @keyframes popupOverlay {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-popup {
                    animation: popupOverlay 0.25s ease-out forwards;
                }
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


            {/* ===== Notification Tips Panel (one at a time, bigger) ===== */}
            {showNotificationTip && (() => {
                const tip = notificationTips[currentTipIndex];
                if (!tip || dismissedTips.includes(tip.id)) return null;
                return (
                    <div
                        key={tip.id}
                        className="fixed bottom-0 left-0 right-0 z-[3000] animate-in slide-in-from-bottom duration-500"
                    >
                        {/* Auto-progress bar at the very top */}
                        <div className="h-[1px] bg-slate-100">
                            <div
                                className="h-full transition-none bg-[#0078d4]"
                                style={{ width: `${tipProgress}%` }}
                            />
                        </div>

                        <div
                            className="bg-white border-t-[0.5px] border-[#0078d4] shadow-[0_-12px_50px_rgba(0,0,0,0.14)] px-10 py-8 flex items-center gap-10"
                        >
                            {/* Conditional Illustration Image (Left for Even Indexes) */}
                            {currentTipIndex % 2 === 0 && (
                                <div className="hidden md:flex w-44 h-32 shrink-0 items-center justify-center relative">
                                    <img
                                        src={tip.image}
                                        alt={tip.title}
                                        className="w-[180%] h-[180%] max-w-none object-contain drop-shadow-md"
                                    />
                                </div>
                            )}

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[18px] font-bold text-slate-800 mb-2 leading-snug">{tip.title}</p>
                                <p className="text-[13.5px] text-slate-500 leading-relaxed">{tip.body}</p>
                            </div>

                            {/* Conditional Illustration Image (Right for Odd Indexes) */}
                            {currentTipIndex % 2 !== 0 && (
                                <div className="hidden md:flex w-44 h-32 shrink-0 items-center justify-center relative ml-4">
                                    <img
                                        src={tip.image}
                                        alt={tip.title}
                                        className="w-[180%] h-[180%] max-w-none object-contain drop-shadow-md"
                                    />
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={() => { tip.onAction(); dismissTip(tip.id, false); }}
                                className="shrink-0 px-7 py-3 rounded-sm text-white text-[13px] font-bold transition-all hover:opacity-90 active:scale-95 shadow-md whitespace-nowrap"
                                style={{ backgroundColor: tip.color }}
                            >
                                {tip.action}
                            </button>

                            {/* Dismiss X */}
                            <button
                                onClick={() => dismissTip(tip.id)}
                                className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                                title="Dismiss"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                );
            })()}

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
        switch (label) {
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
            className="w-full flex flex-col items-center justify-center p-4 sm:p-5 bg-white shadow-sm border border-slate-200/80 hover:-translate-y-2 active:scale-95 transition-all duration-300 relative overflow-hidden h-auto min-h-[200px] group"
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
        className={`relative p-8 border border-white/60 backdrop-blur-md flex flex-col justify-between items-start text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] active:scale-95 group overflow-hidden ${className}`}
    >
        {/* Decorative Background Element */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0078d4]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

        <div className="bg-white p-3 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
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
        className={`flex flex-col items-center justify-center min-w-[75px] h-[75px] m-0.5 relative transition-all duration-300 group
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
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        )}

        {/* Subtle Hover Glow Overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
    </button>
);

const AITypingText = () => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const messages = ['Or, ask me anything', 'Generate a report', 'Search transactions', 'Analyze my expenses'];

    useEffect(() => {
        let timer = setTimeout(() => {
            const i = loopNum % messages.length;
            const fullText = messages[i];

            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));

            setTypingSpeed(isDeleting ? 30 : 100);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, messages]);

    return (
        <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-600 via-blue-500 to-slate-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
            {text}
            <span className="animate-pulse text-blue-500 border-r-2 border-blue-500 ml-[1px]"></span>
        </span>
    );
};

export default Dashboard;
