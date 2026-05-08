import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottiePlayer } from '@dotlottie/react-player';

import {
    LogOut,
    Home,
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
    Bell,
    Receipt
} from 'lucide-react';

import { authService } from '../services/auth.service';
import HomeBoard from './HomeBoard';
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
import PettyCashBoard from '../HomeMaster/PettyCashBoard';
import SalesOrderBoard from '../HomeMaster/SalesOrderBoard';
import SalesReceiptBoard from '../HomeMaster/SalesReceiptBoard';
import ReceivePaymentBoard from '../HomeMaster/ReceivePaymentBoard';
import ChequeRegisterBoard from '../HomeMaster/ChequeRegisterBoard';
import PrintChequeBoard from '../HomeMaster/PrintChequeBoard';
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
import ChequePrintingBoard from './ChequePrintingBoard';
import ChequeBookEntryBoard from './ChequeBookEntryBoard';
import ChequeInHandBoard from './ChequeInHandBoard';
import NotPresentedChequesBoard from './NotPresentedChequesBoard';
import LogoutConfirmModal from '../components/modals/LogoutConfirmModal';
import AlarmAlertModal from '../components/modals/AlarmAlertModal';
import { reminderService } from '../services/reminder.service';

import AIChatbotBoard from './AIChatbotBoard';
import DepartmentBoard from './DepartmentBoard';
import CalculatorBoard from '../components/modals/ViewAndUtilityModels/CalculatorBoard';
import EstimateBoard from './EstimateBoard';
import { Layers } from 'lucide-react';
import ReportTemplate from '../components/ReportTemplate';
import { toast } from 'react-hot-toast';



const Dashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showHomeModal, setShowHomeModal] = useState(false);
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
    const [showMarketingToolModal, setShowMarketingToolModal] = useState(false);
    const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
    const [showGRNModal, setShowGRNModal] = useState(false);
    const [showPettyCashModal, setShowPettyCashModal] = useState(false);
    const [showSalesOrderModal, setShowSalesOrderModal] = useState(false);
    const [showSalesReceiptModal, setShowSalesReceiptModal] = useState(false);
    const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
    const [showChequeRegisterModal, setShowChequeRegisterModal] = useState(false);
    const [showPrintChequeModal, setShowPrintChequeModal] = useState(false);
    const [topBarColor, setTopBarColor] = useState(localStorage.getItem('topBarColor') || '#0078d4');
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
    const [showCustomerChequeReturnModal, setShowCustomerChequeReturnModal] = useState(false);
    const [showChequePrintModal, setShowChequePrintModal] = useState(false);
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
    const [ribbonIcons, setRibbonIcons] = useState(['logout', 'home', 'new_account', 'customer', 'vendor', 'reminder', 'enter_bill', 'pay_bill', 'write_chq', 'petty_cash', 'make_deposit', 'journal_entry', 'bank_rec', 'trial_balance', 'search', 'ai_chat']);

    const [showAIChatbotModal, setShowAIChatbotModal] = useState(false);
    const [showItemsServicesReport, setShowItemsServicesReport] = useState(false);
    const [itemsServicesData, setItemsServicesData] = useState([]);
    const [isReportLoading, setIsReportLoading] = useState(false);




    const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isLoaderStopped, setIsLoaderStopped] = useState(false);
    const [depositData, setDepositData] = useState(null);


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
        const currentUser = authService.getCurrentUser();
        const company = localStorage.getItem('selectedCompany');
        const savedIcons = localStorage.getItem('ribbon_icons');

        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
            setSelectedCompany(company ? JSON.parse(company) : null);
            if (savedIcons) setRibbonIcons(JSON.parse(savedIcons));
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
            toast.success("Task marked as completed!");
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
        setShowHomeModal(false);
        window.open(`/report/items-services?company=${companyId}&name=${encodeURIComponent(companyName)}`, '_blank');
    };

    const navItems = [
        { icon: Home, gif: '/icons/home.gif', label: 'Home', onClick: () => setShowHomeModal(true), active: showHomeModal },
        { icon: UserPlus, gif: '/icons/new account2.gif', label: 'Accounts', onClick: () => setShowNewAccountModal(true), active: showNewAccountModal },
        { icon: Users, gif: '/icons/customer.gif', label: 'Customers', onClick: () => setShowCustomerModal(true), active: showCustomerModal },
        { icon: Truck, gif: '/icons/vendors.gif', label: 'Vendors', onClick: () => setShowVendorModal(true), active: showVendorModal },
        { icon: FileText, gif: '/icons/billing.gif', label: 'Billing', onClick: () => setShowEnterBillModal(true), active: showEnterBillModal },
        { icon: CreditCard, gif: '/icons/paybill.gif', label: 'Pay Bills', onClick: () => setShowPayBillModal(true), active: showPayBillModal },
        { icon: PenTool, gif: '/icons/cheque.gif', label: 'Cheques', onClick: () => setShowWriteChequeModal(true), active: showWriteChequeModal },
        { icon: Wallet, gif: '/icons/cash.gif', label: 'Cash', onClick: () => setShowPettyCashModal(true), active: showPettyCashModal },
        { icon: ArrowDownLeft, gif: '/icons/deposit.gif', label: 'Deposit', onClick: () => setShowCollectionToDepositModal(true), active: showCollectionToDepositModal },
        { icon: BookOpen, gif: '/icons/journal.gif', label: 'Journal', onClick: () => setShowJournalEntryModal(true), active: showJournalEntryModal },
        { icon: RefreshCcw, gif: '/icons/cashflow.gif', label: 'Rec.', onClick: () => setShowBankRecModal(true), active: showBankRecModal },
        { icon: BarChart2, gif: '/icons/report.gif', label: 'Report', onClick: () => setShowTrialBalanceModal(true), active: showTrialBalanceModal },
        { icon: Search, label: 'Search', onClick: () => setShowSearchModal(true), active: showSearchModal },
    ];



    const menuBar = [
        'Master File', 'View and Utility', 'Transaction', 'Reports', 'System Admin', 'Help', 'About'
    ];


    return (
        <div className="h-screen w-screen flex flex-col font-['Plus_Jakarta_Sans'] bg-white select-none text-slate-800 overflow-hidden">
            {/* 1. Modal Overlays */}
            <HomeBoard
                isOpen={showHomeModal}
                onClose={() => setShowHomeModal(false)}
                onOpenModal={(label) => {
                    // Item Mapping from Legend/Original Home Page
                    if (label === 'Home') setShowHomeModal(true);
                    if (label === 'Vender') setShowVendorModal(true);
                    if (label === 'Customer') setShowCustomerModal(true);
                    if (label === 'Acc.Balance') setShowAccountBalanceModal(true);

                    // Vendor Section
                    if (label === 'Purchase Order') setShowPurchaseOrderModal(true);
                    if (label === 'GRN') setShowGRNModal(true);
                    if (label === 'Petty Cash') setShowPettyCashModal(true);
                    if (label === 'Enter Bills') setShowEnterBillModal(true);
                    if (label === 'Pay Bills') setShowPayBillModal(true);

                    // Customer Section
                    if (label === 'Sales Order') setShowSalesOrderModal(true);
                    if (label === 'Create Sales Receipt') setShowSalesReceiptModal(true);
                    if (label === 'Receive Payment') setShowReceivePaymentModal(true);
                    if (label === 'Estimate') setShowEstimateModal(true);
                    if (label === 'Create Invoice') setShowSalesInvoiceModal(true);
                    if (label === 'Refunds and Credit') setShowCustomerModal(true);

                    // Banking Section
                    if (label === 'Collection Deposit' || label === 'Make Deposit') setShowCollectionToDepositModal(true);
                    if (label === 'Cheque Register' || label === 'Register') setShowChequeRegisterModal(true);
                    if (label === 'Write Cheque') setShowWriteChequeModal(true);
                    if (label === 'Print Cheque') setShowPrintChequeModal(true);

                    // Company Section
                    if (label === 'Journal Entry') setShowJournalEntryModal(true);
                    if (label === 'Items and Servies' || label === 'Items & Services') handleOpenItemsServicesReport();
                    if (label === 'Marketing Tool') setShowMarketingToolModal(true);
                    if (label === 'AI Chat') setShowAIChatbotModal(true);


                    // Close home board after selecting an option (except when selecting Home)
                    if (label !== 'Home') setShowHomeModal(false);
                }}
            />
            <NewAccountBoard isOpen={showNewAccountModal} onClose={() => setShowNewAccountModal(false)} />
            <CustomerMasterBoard isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
            <SupplierMasterBoard isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
            <EnterBillBoard isOpen={showEnterBillModal} onClose={() => setShowEnterBillModal(false)} />
            <PayBillBoard isOpen={showPayBillModal} onClose={() => setShowPayBillModal(false)} />
            <EstimateBoard isOpen={showEstimateModal} onClose={() => setShowEstimateModal(false)} />
            <WriteChequeBoard isOpen={showWriteChequeModal} onClose={() => setShowWriteChequeModal(false)} />
            <MakeDepositBoard isOpen={showMakeDepositModal} onClose={() => { setShowMakeDepositModal(false); setDepositData(null); }} incomingData={depositData} />
            <JournalEntryBoard isOpen={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
            <BankReconciliationBoard isOpen={showBankRecModal} onClose={() => setShowBankRecModal(false)} />
            <ChequeCancelBoard isOpen={showChequeCancelModal} onClose={() => setShowChequeCancelModal(false)} />
            <CustomerChequeReturnBoard isOpen={showCustomerChequeReturnModal} onClose={() => setShowCustomerChequeReturnModal(false)} />
            <ChequePrintingBoard isOpen={showChequePrintModal} onClose={() => setShowChequePrintModal(false)} />
            <ChequeBookEntryBoard isOpen={showChequeBookEntryModal} onClose={() => setShowChequeBookEntryModal(false)} />
            <ChequeInHandBoard isOpen={showChequeInHandModal} onClose={() => setShowChequeInHandModal(false)} />
            <NotPresentedChequesBoard isOpen={showNotPresentedChequesModal} onClose={() => setShowNotPresentedChequesModal(false)} />
            <TrialBalanceBoard isOpen={showTrialBalanceModal} onClose={() => setShowTrialBalanceModal(false)} />
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
                onOpenChequePrint={() => {
                    setShowChequePrintModal(true);
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
            <SystemSettingsBoard isOpen={showSystemSettingsModal} onClose={() => setShowSystemSettingsModal(false)} />
            <AIChatbotBoard isOpen={showAIChatbotModal} onClose={() => setShowAIChatbotModal(false)} />
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
            <PrintChequeBoard isOpen={showPrintChequeModal} onClose={() => setShowPrintChequeModal(false)} />
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

            {/* 2. Top Ribbon Navigation (Matches Reference Image) */}
            <header
                className={`z-50 text-white shadow-md transition-all duration-500 ease-in-out overflow-hidden backdrop-blur-md ${isTopBarCollapsed ? 'h-12' : 'h-[155px]'}`}
                style={{ backgroundColor: `${topBarColor}F2` }} // Slightly transparent for glass effect
            >
                {/* Row 1: Text Menu */}
                <div className={`flex items-center gap-8 px-6 border-b border-white/10 overflow-x-auto no-scrollbar transition-opacity duration-300 ${isTopBarCollapsed ? 'h-full mt-0 border-transparent' : 'h-8 py-2 mt-4'}`}>
                    <div className="flex items-center gap-6">
                        {menuBar.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (item === 'Master File') setShowMasterFileModal(true);
                                    if (item === 'View and Utility') setShowViewUtilityModal(true);
                                    if (item === 'Transaction') setShowTransactionModal(true);
                                    if (item === 'Reports') setShowReportsModal(true);
                                    if (item === 'System Admin') setShowSystemAdminModal(true);
                                    if (item === 'About') setShowSoftwareAboutModal(true);
                                }}
                                className="!text-[12px]  text-white/90 hover:text-white whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex items-center gap-1 group"
                            >
                                {item}
                                <div className="w-0 h-[1.5px] bg-white absolute bottom-[-4px] left-0 group-hover:w-full transition-all duration-300" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="flex items-center gap-4 h-[28px] bg-white/15 backdrop-blur-md px-4 rounded-[10px] border border-white/20 shadow-sm transition-all hover:bg-white/25 mb-1">
                            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-sm">
                                    {user?.EmpName || user?.empName || user?.Emp_Name || user?.username || 'Admin'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 size={12} className="text-white/80" />
                                <span className="text-[10px] font-bold text-white/90 tracking-tight">
                                    {selectedCompany?.CompanyName || selectedCompany?.companyName || selectedCompany?.name || 'Enterprise'}
                                </span>
                            </div>
                        </div>

                        <div className="w-[1px] h-4 bg-white/20 mx-1" />
                        <button
                            onClick={() => setShowSideBar(!showSideBar)}
                            className={`p-2 rounded-lg transition-all flex items-center justify-center ${showSideBar ? 'bg-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Menu size={18} />
                        </button>
                    </div>

                    {/* Expand Trigger when collapsed */}
                    {isTopBarCollapsed && (
                        <div className="ml-4 pr-0 flex items-center">
                            <ChevronRight
                                size={16}
                                className="text-white/50 cursor-pointer hover:text-white transition-all transform rotate-90"
                                onClick={() => {
                                    setIsTopBarCollapsed(false);
                                    setShowSideBar(false);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Vertical Separator Gap - Dynamic Alert Bar (Fixed Persistence) */}
                {!isTopBarCollapsed && (
                    <div className="h-[4px] w-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] my-1 overflow-hidden relative">
                        {pendingJobsCount > 0 && (
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-[#f05252] via-[#f05252] to-[#f05252] animate-[cardLoading_2s_ease-in-out_infinite]"
                                style={{
                                    boxShadow: '0 0 10px rgba(234, 7, 7, 0.4)',
                                    backgroundSize: '200% 100%'
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Row 2: Icon Ribbon */}
                <div className={`flex items-center px-2 py-1 gap-1  overflow-x-auto no-scrollbar transition-all duration-500 ${isTopBarCollapsed ? 'opacity-0 -translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
                    {ribbonIcons.map((iconId) => {
                        const iconData = {
                            logout: { icon: LogOut, label: 'LogOut', onClick: () => setShowLogoutConfirmModal(true), iconColor: 'text-red-500' },
                            home: { icon: Home, label: 'Home', onClick: () => setShowHomeModal(true), active: showHomeModal },
                            new_account: { icon: UserPlus, label: 'New Account', onClick: () => setShowNewAccountModal(true), active: showNewAccountModal, hasBadge: true },
                            customer: { icon: Users, label: 'Customer', onClick: () => setShowCustomerModal(true), active: showCustomerModal },
                            vendor: { icon: Truck, label: 'Vendor', onClick: () => setShowVendorModal(true), active: showVendorModal },
                            enter_bill: { icon: FileText, label: 'Enter Bill', onClick: () => setShowEnterBillModal(true), active: showEnterBillModal },
                            pay_bill: { icon: CreditCard, label: 'Pay Bill', onClick: () => setShowPayBillModal(true), active: showPayBillModal },
                            write_chq: { icon: PenTool, label: 'Write Chq', onClick: () => setShowWriteChequeModal(true), active: showWriteChequeModal },
                            petty_cash: { icon: Wallet, label: 'Petty Cash', onClick: () => setShowPettyCashModal(true), active: showPettyCashModal },
                            make_deposit: { icon: ArrowDownLeft, label: 'Make Deposit', onClick: () => setShowMakeDepositModal(true), active: showMakeDepositModal },
                            journal_entry: { icon: BookOpen, label: 'Journal Entry', onClick: () => setShowJournalEntryModal(true), active: showJournalEntryModal },
                            bank_rec: { icon: RefreshCcw, label: 'Bank Rec', onClick: () => setShowBankRecModal(true), active: showBankRecModal },
                            trial_balance: { icon: BarChart2, label: 'Trial Balance', onClick: () => setShowTrialBalanceModal(true), active: showTrialBalanceModal },
                            search: { icon: Search, label: 'Search', onClick: () => setShowSearchModal(true), active: showSearchModal },
                            ai_chat: { icon: Bot, label: 'AI Chat', onClick: handleAIClick, active: showAIChatbotModal },
                            department: { icon: Building2, label: 'Dept.', onClick: () => setShowDepartmentModal(true), active: showDepartmentModal },
                            calculator: { icon: Calculator, label: 'Calculator', onClick: () => window.open('ms-calculator:'), active: showCalculatorModal },
                            help: { icon: HelpCircle, label: 'Help', onClick: () => { } },
                            category: { icon: Layers, label: 'Category', onClick: () => setShowCategoryModal(true), active: showCategoryModal },
                            reminder: { icon: Bell, label: 'Reminder', onClick: () => setShowReminderModal(true), active: showReminderModal, iconColor: 'text-yellow-400' },
                        }[iconId];

                        if (!iconData) return null;
                        return (
                            <RibbonButton
                                key={iconId}
                                icon={iconData.icon}
                                label={iconData.label}
                                onClick={iconData.onClick}
                                active={iconData.active}
                                hasBadge={iconData.hasBadge}
                                iconColor={iconData.iconColor}
                            />
                        );
                    })}



                    <div className="ml-auto pr-4 flex items-center">
                        <ChevronRight
                            size={16}
                            className="text-white/50 cursor-pointer hover:text-white transition-all transform -rotate-90"
                            onClick={() => {
                                setIsTopBarCollapsed(true);
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* 3. Main Workspace Area - Professional Console */}
            <main className="flex-1 relative overflow-y-auto bg-[#f8fafc]">
                {/* Visual Watermark Background - Custom Mesh Gradient */}
                <div
                    className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-[0.15]"
                    style={{ backgroundImage: `url('/images/dashboard_bg_premium.png')` }}
                />



                {/* Technical Dot Grid Overlay */}
                <div
                    className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(${topBarColor} 1.5px, transparent 1.5px)`,
                        backgroundSize: '36px 36px'
                    }}
                />

                {/* Glassmorphism Frosted Overlay */}
                <div className="fixed  inset-0 z-0 bg-white/20  backdrop-blur-[60px] pointer-events-none" />


                <div className="relative mt-8 z-10 p-12 max-w-7xl mx-auto flex flex-col gap-20">



                    {/* New Sleek Search Trigger (Top Right Aligned) */}
                    <div className="flex justify-end -mb-12 animate-in fade-in slide-in-from-right-10 duration-700">
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="flex items-center gap-3 px-5 h-11 bg-white/40 backdrop-blur-md border border-white/20 rounded-[10px] shadow-lg hover:bg-white/60 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                        >
                            <Search size={18} className="text-gray-400 group-hover:text-[#0078d4] transition-colors" />
                            <span className="text-gray-500 text-sm font-semibold tracking-tight">Search System</span>
                        </button>
                    </div>

                    {/* Standard Icon Grid (Excluding Search) */}
                    <div className="grid  grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {navItems.filter(item => item.label !== 'Search').map((item, idx) => {
                            const Icon = item.icon;
                            const isAnimated = item.gif && (item.label === 'Home' || item.label === 'Accounts' || item.label === 'Customers' || item.label === 'Vendors' || item.label === 'Billing' || item.label === 'Pay Bills' || item.label === 'Cheques' || item.label === 'Cash' || item.label === 'Deposit' || item.label === 'Journal' || item.label === 'Rec.' || item.label === 'Report');
                            return (
                                <div key={idx} className="flex flex-col items-center gap-3 group">
                                    <button
                                        onMouseEnter={() => setIsLoaderStopped(true)}
                                        onMouseLeave={() => setIsLoaderStopped(false)}
                                        onClick={() => {
                                            item.onClick();
                                            setIsLoaderStopped(true);
                                        }}
                                        className="w-full flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-[20px] shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,120,212,0.2)] hover:border-[#0078d4]/50 hover:scale-[1.04] hover:-translate-y-2 active:scale-95 transition-all duration-500 ease-out relative overflow-hidden aspect-square"
                                    >
                                        {/* Focus Glow Effect */}
                                        <div className="absolute inset-0 bg-[#0078d4]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className={`relative z-10 transition-all duration-500 flex items-center justify-center`}>
                                            <div className={`${isAnimated ? 'w-24 h-24' : 'w-14 h-14'} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                                                {item.gif ? (
                                                    <>
                                                        {/* Static State: Image or Lucide Icon */}
                                                        {isAnimated && (
                                                            item.staticImg ? (
                                                                <img
                                                                    src={item.staticImg}
                                                                    alt={item.label}
                                                                    className="w-16 h-16 object-contain group-hover:opacity-0 transition-opacity duration-300 absolute"
                                                                />
                                                            ) : (
                                                                <Icon
                                                                    size={58}
                                                                    strokeWidth={1.5}
                                                                    className="text-slate-400 group-hover:opacity-0 transition-opacity duration-300 absolute"
                                                                />
                                                            )
                                                        )}
                                                        {/* GIF shown only on hover/active for Animated Items */}
                                                        <img
                                                            src={item.gif}
                                                            alt={item.label}
                                                            className={`object-contain transition-all duration-500 ${isAnimated ? 'w-24 h-24 opacity-0 group-hover:opacity-100' : 'w-12 h-12 opacity-100'}`}
                                                        />
                                                    </>
                                                ) : (
                                                    item.staticImg ? (
                                                        <img src={item.staticImg} alt={item.label} className="w-16 h-16 object-contain group-hover:text-[#0078d4] transition-colors duration-500" />
                                                    ) : (
                                                        <Icon size={54} strokeWidth={1.5} className="text-slate-500 group-hover:text-[#0078d4] transition-colors duration-500" />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                    </button>
                                    <span className="text-[12px] font-medium text-slate-500 group-hover:text-[#0078d4] uppercase tracking-wider transition-colors duration-300 text-center leading-tight">
                                        {item.label}
                                    </span>

                                </div>
                            );
                        })}
                    </div>

                </div>
            </main>

            {/* Unified One-Line Professional Footer (Ticker + Company Info) */}
            <footer
                className="h-12 border-t border-white/10 flex items-center justify-between px-6 z-50 overflow-hidden relative shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                style={{ backgroundColor: topBarColor }}
            >
                {/* Left: Branding/License (Above Ticker) */}
                <div
                    className="flex items-center gap-2 relative z-20 pr-6"
                    style={{ backgroundColor: topBarColor }}
                >
                    <span className="text-[#ef1022] text-[12px] font-black tracking-tight group-hover:text-red-400 transition-all cursor-default uppercase drop-shadow-sm">
                        LICENSED
                    </span>
                </div>

                {/* Center: Animated Information Ticker (Middle Layer) */}
                <div className="flex-1 overflow-hidden relative mx-4">
                    {/* Fade Edges for Professional Look */}
                    <div className="absolute inset-y-0 left-0 w-12 z-10" style={{ background: `linear-gradient(to right, ${topBarColor}, transparent)` }} />
                    <div className="absolute inset-y-0 right-0 w-12 z-10" style={{ background: `linear-gradient(to left, ${topBarColor}, transparent)` }} />

                    <div className="whitespace-nowrap animate-marquee flex items-center gap-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <span key={i} className="text-[9px] font-bold text-white/70 uppercase tracking-[0.25em] flex items-center gap-3">
                                ONIMTA INFORMATION TECHNOLOGY (PVT) LTD
                                <div className="h-1 w-1 bg-white/40 rounded-full" />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right: Company Credits (Above Ticker) */}
                <div
                    className="flex items-center gap-2 group relative z-20 pl-6"
                    style={{ backgroundColor: topBarColor }}
                >
                    <span className="text-[9px] font-medium text-white/60 uppercase tracking-tight">Powered by</span>
                    <span className="text-[#ef1022] text-[12px] mt-[-1px] font-black tracking-tight group-hover:text-red-400 transition-all cursor-default uppercase drop-shadow-sm">
                        ONIMTA
                    </span>
                </div>
            </footer>
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

                {/* Robot Lottie Button (Dynamic Alignment) */}
                <button
                    onClick={handleAIClick}
                    className="w-32 h-32 mr-10 mb-10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group drop-shadow-2xl pointer-events-auto"
                >
                    <DotLottiePlayer
                        src="/images/Ai Robot Vector Art.lottie"
                        autoplay
                        loop
                        className="w-full h-full"
                    />
                </button>
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
                @keyframes flip {
                    0% { transform: scaleY(1); opacity: 1; }
                    50% { transform: scaleY(0); opacity: 0.5; }
                    100% { transform: scaleY(1); opacity: 1; }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }



                @keyframes cardLoading {
                    0% { width: 0%; opacity: 1; }
                    50% { width: 100%; opacity: 0.8; }
                    100% { width: 100%; opacity: 0; }
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
        </div>
    );
};

// Custom Rectangular Bento Card Component
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
