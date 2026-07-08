import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottiePlayer } from '@dotlottie/react-player';
import GetThingsDoneBoard from './GetThingsDoneBoard';
import AIChatbotBoard from './AIChatbotBoard';
import { authService } from '../services/auth.service';
import { X } from 'lucide-react';

// Import all modals
import EnterBillBoard from './EnterBillBoard';
import PayBillBoard from './PayBillBoard';
import WriteChequeBoard from './WriteChequeBoard';
import PettyCashBoard from '../HomeMaster/PettyCashBoard';
import JournalEntryBoard from './JournalEntryBoard';
import MakeDepositBoard from './MakeDepositBoard';
import PurchaseOrderBoard from './PurchaseOrderBoard';
import GRNBoard from './GRNBoard';
import BulkGRNBoard from './BulkGRNBoard';
import SalesOrderBoard from './SalesOrderBoard';
import SalesReceiptBoard from './SalesReceiptBoard';
import ReceivePaymentBoard from './ReceivePaymentBoard';
import EstimateBoard from './EstimateBoard';
import SalesInvoiceBoard from './SalesInvoiceBoard';
import ChequeRegisterBoard from './ChequeRegisterBoard';
import MarketingToolBoard from './MarketingToolBoard';
import SupplierMasterBoard from '../components/modals/MasterSubModal/SupplierMasterBoard';
import CustomerMasterBoard from '../components/modals/MasterSubModal/CustomerMasterBoard';
import AccountBalanceBoard from '../HomeMaster/AccountBalanceBoard';
import TrialBalanceBoard from './TrialBalanceBoard';
import BankReconciliationBoard from './BankReconciliationBoard';
import ExpensesDashboardBoard from './ExpensesDashboardBoard';
import ProfitLossDashboardBoard from './ProfitLossDashboardBoard';
import SurveySettingsModal from '../components/modals/SurveySettingsModal';
import ReportTemplate from '../components/ReportTemplate';
import ViewUtilityModal from '../components/modals/ViewUtilityModal';
import ReportsCenterModal from '../components/modals/AdminReports/ReportsCenterModal';
import SubscriptionModal from '../components/modals/SubscriptionModal';

const BIDashboardPage = () => {
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showAIChatbotModal, setShowAIChatbotModal] = useState(false);
    const [showAITyping, setShowAITyping] = useState(false);
    const [aiTypingText, setAiTypingText] = useState('');

    // Modal States
    const [showEnterBillModal, setShowEnterBillModal] = useState(false);
    const [showPayBillModal, setShowPayBillModal] = useState(false);
    const [showWriteChequeModal, setShowWriteChequeModal] = useState(false);
    const [showPettyCashModal, setShowPettyCashModal] = useState(false);
    const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
    const [showMakeDepositModal, setShowMakeDepositModal] = useState(false);
    const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
    const [showGRNModal, setShowGRNModal] = useState(false);
    const [showBulkGRNModal, setShowBulkGRNModal] = useState(false);
    const [showSalesOrderModal, setShowSalesOrderModal] = useState(false);
    const [showSalesReceiptModal, setShowSalesReceiptModal] = useState(false);
    const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
    const [showEstimateModal, setShowEstimateModal] = useState(false);
    const [showSalesInvoiceModal, setShowSalesInvoiceModal] = useState(false);
    const [showChequeRegisterModal, setShowChequeRegisterModal] = useState(false);
    const [showMarketingToolModal, setShowMarketingToolModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showAccountBalanceModal, setShowAccountBalanceModal] = useState(false);
    const [showTrialBalanceModal, setShowTrialBalanceModal] = useState(false);
    const [showBankRecModal, setShowBankRecModal] = useState(false);
    const [showExpensesDashboardModal, setShowExpensesDashboardModal] = useState(false);
    const [showProfitLossDashboardModal, setShowProfitLossDashboardModal] = useState(false);
    const [showSurveySettingsModal, setShowSurveySettingsModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportsCenterModal, setShowReportsCenterModal] = useState(false);
    const [showViewUtilityModal, setShowViewUtilityModal] = useState(false);
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true);
    const [showPricingPlansModal, setShowPricingPlansModal] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const companyRaw = localStorage.getItem('selectedCompany');
        
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        setUser(currentUser);
        if (companyRaw) {
            setSelectedCompany(JSON.parse(companyRaw));
        }
    }, []);

    const navigate = useNavigate();

    if (!user) return null;

    const handleClose = () => {
        navigate('/dashboard');
    };

    const handleAIAction = (actionKey) => {
        setShowAIChatbotModal(false);
        setTimeout(() => {
            const aiActionMap = {
                'new_account': () => navigate('/dashboard'),
                'customers': () => setShowCustomerModal(true),
                'vendors': () => setShowVendorModal(true),
                'enter_bill': () => setShowEnterBillModal(true),
                'pay_bill': () => setShowPayBillModal(true),
                'invoice': () => setShowSalesInvoiceModal(true),
                'sales_order': () => setShowSalesOrderModal(true),
                'journal': () => setShowJournalEntryModal(true),
                'customer_master': () => navigate('/dashboard'),
                'supplier_master': () => setShowVendorModal(true),
                'chart_of_accounts': () => navigate('/dashboard'),
                'reports': () => setShowReportsCenterModal(true),
                'search': () => navigate('/dashboard'),
                'bank_reconcile': () => setShowBankRecModal(true),
                'make_deposit': () => setShowMakeDepositModal(true),
                'write_cheque': () => setShowWriteChequeModal(true),
                'purchase_order': () => setShowPurchaseOrderModal(true),
                'grn': () => setShowGRNModal(true),
                'sales_receipt': () => setShowSalesReceiptModal(true),
                'receive_payment': () => setShowReceivePaymentModal(true),
                'petty_cash': () => setShowPettyCashModal(true),
                'trial_balance': () => setShowTrialBalanceModal(true),
                'backup': () => navigate('/dashboard'),
                'expenses': () => setShowExpensesDashboardModal(true),
                'marketing': () => setShowMarketingToolModal(true),
                'reversal': () => navigate('/dashboard'),
                'payment_setoff': () => navigate('/dashboard'),
            };
            const handler = aiActionMap[actionKey];
            if (handler) handler();
        }, 300);
    };

    const actionToStateSetter = {
        'enter_bill': setShowEnterBillModal,
        'pay_bills': setShowPayBillModal,
        'write_cheque': setShowWriteChequeModal,
        'petty_cash': setShowPettyCashModal,
        'journal': setShowJournalEntryModal,
        'make_deposit': setShowMakeDepositModal,
        'purchase_order': setShowPurchaseOrderModal,
        'grn': setShowGRNModal,
        'bulk_grn': setShowBulkGRNModal,
        'sales_order': setShowSalesOrderModal,
        'sales_receipt': setShowSalesReceiptModal,
        'receive_payment': setShowReceivePaymentModal,
        'estimate': setShowEstimateModal,
        'invoice': setShowSalesInvoiceModal,
        'cheque_register': setShowChequeRegisterModal,
        'marketing': setShowMarketingToolModal,
        'vendor': setShowVendorModal,
        'customer': setShowCustomerModal,
        'account_balance': setShowAccountBalanceModal,
        'trial_balance': setShowTrialBalanceModal,
        'bank_rec': setShowBankRecModal,
        'expenses_detail': setShowExpensesDashboardModal,
        'profit_loss_detail': setShowProfitLossDashboardModal,
        'survey_settings': setShowSurveySettingsModal,
        'reports': () => setShowReportsCenterModal(true),
        'items': setShowViewUtilityModal,
        'header_subscribe': setShowPricingPlansModal
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50">
            {/* Subscription Banner */}
            {showSubscriptionBanner && (
                <div className="bg-[#0078d4] text-white text-[13px] h-9 flex-shrink-0 flex justify-center items-center gap-2 relative z-50 transition-all animate-in slide-in-from-top duration-300">
                    <span>Save 50% for 3 months.</span>
                    <button onClick={() => setShowPricingPlansModal(true)} className="underline font-bold hover:text-white/80 transition-colors">Subscribe now</button>
                    <button onClick={() => setShowSubscriptionBanner(false)} className="absolute right-4 text-white/70 hover:text-white transition-colors">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
            )}

            <div className="flex-1 w-full overflow-hidden flex flex-row relative">
                {/* Animated Background */}
                <div className="absolute inset-0 flex items-center opacity-[0.03] pointer-events-none z-0 overflow-hidden select-none">
                    <style>{`
                  @keyframes slideRightText {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                  }
                  .animate-slide-right {
                    animation: slideRightText 20s linear infinite;
                  }
                `}</style>
                <div className="whitespace-nowrap animate-slide-right flex">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="text-[140px] md:text-[200px] lg:text-[280px] font-black text-black tracking-tighter pr-32">
                      ONIMTA
                    </span>
                  ))}
                </div>
            </div>

            <div className="flex-1 min-w-0 relative h-full z-10">
                <GetThingsDoneBoard 
                    isOpen={true} 
                    isInline={true}
                    onClose={handleClose}
                    user={user}
                    selectedCompany={selectedCompany}
                    onAction={(actionId) => {
                        if (actionId === 'header_ai') {
                            if (showAIChatbotModal) {
                                setShowAIChatbotModal(false);
                            } else {
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
                                            setShowAIChatbotModal(true);
                                        }, 600);
                                    }
                                }, 45);
                            }
                            return;
                        }
                        
                        if (actionId.startsWith('open_report:')) {
                            const reportName = actionId.split(':')[1];
                            setSelectedReport(reportName);
                            return;
                        }
                        
                        const setter = actionToStateSetter[actionId] || actionToStateSetter[actionId.replace('create_', '')];
                        if (setter) {
                            setter(true);
                        } else {
                            navigate('/dashboard');
                        }
                    }}
                />
            </div>

            {/* AI Typing Animation Overlay */}
            {showAITyping && (
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-8 max-w-2xl px-8">
                        <div className="w-32 h-32 flex items-center justify-center">
                            <DotLottiePlayer
                                src="/lottiefile/AI loading.lottie"
                                autoplay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
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

            <AIChatbotBoard 
                isOpen={showAIChatbotModal} 
                onClose={() => setShowAIChatbotModal(false)} 
                position="inline-right" 
                onAction={handleAIAction}
            />
            </div>

            {/* Render all Modals */}
            <EnterBillBoard isOpen={showEnterBillModal} onClose={() => setShowEnterBillModal(false)} />
            <PayBillBoard isOpen={showPayBillModal} onClose={() => setShowPayBillModal(false)} />
            <WriteChequeBoard isOpen={showWriteChequeModal} onClose={() => setShowWriteChequeModal(false)} />
            <PettyCashBoard isOpen={showPettyCashModal} onClose={() => setShowPettyCashModal(false)} />
            <JournalEntryBoard isOpen={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
            <MakeDepositBoard isOpen={showMakeDepositModal} onClose={() => setShowMakeDepositModal(false)} incomingData={null} />
            <PurchaseOrderBoard isOpen={showPurchaseOrderModal} onClose={() => setShowPurchaseOrderModal(false)} />
            <GRNBoard isOpen={showGRNModal} onClose={() => setShowGRNModal(false)} />
            <BulkGRNBoard isOpen={showBulkGRNModal} onClose={() => setShowBulkGRNModal(false)} />
            <SalesOrderBoard isOpen={showSalesOrderModal} onClose={() => setShowSalesOrderModal(false)} />
            <SalesReceiptBoard isOpen={showSalesReceiptModal} onClose={() => setShowSalesReceiptModal(false)} />
            <ReceivePaymentBoard isOpen={showReceivePaymentModal} onClose={() => setShowReceivePaymentModal(false)} />
            <EstimateBoard isOpen={showEstimateModal} onClose={() => setShowEstimateModal(false)} />
            <SalesInvoiceBoard isOpen={showSalesInvoiceModal} onClose={() => setShowSalesInvoiceModal(false)} />
            <ChequeRegisterBoard isOpen={showChequeRegisterModal} onClose={() => setShowChequeRegisterModal(false)} />
            <MarketingToolBoard isOpen={showMarketingToolModal} onClose={() => setShowMarketingToolModal(false)} />
            <SupplierMasterBoard isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
            <CustomerMasterBoard isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
            <AccountBalanceBoard isOpen={showAccountBalanceModal} onClose={() => setShowAccountBalanceModal(false)} />
            <TrialBalanceBoard isOpen={showTrialBalanceModal} onClose={() => setShowTrialBalanceModal(false)} />
            <BankReconciliationBoard isOpen={showBankRecModal} onClose={() => setShowBankRecModal(false)} />
            
            <ExpensesDashboardBoard 
                isOpen={showExpensesDashboardModal} 
                onClose={() => setShowExpensesDashboardModal(false)}
                onEnterBill={() => { setShowExpensesDashboardModal(false); setShowEnterBillModal(true); }}
                onPayBill={() => { setShowExpensesDashboardModal(false); setShowPayBillModal(true); }}
                onWriteCheque={() => { setShowExpensesDashboardModal(false); setShowWriteChequeModal(true); }}
                onPettyCash={() => { setShowExpensesDashboardModal(false); setShowPettyCashModal(true); }}
            />
            <ProfitLossDashboardBoard isOpen={showProfitLossDashboardModal} onClose={() => setShowProfitLossDashboardModal(false)} />
            <SurveySettingsModal isOpen={showSurveySettingsModal} onClose={() => setShowSurveySettingsModal(false)} />
            <ReportsCenterModal 
                isOpen={showReportsCenterModal} 
                onClose={() => setShowReportsCenterModal(false)} 
                onSelectReport={setSelectedReport} 
                empCode={user?.EmpCode || user?.empCode || user?.emp_Code || user?.id_No || user?.Id_No || user?.IdNo}
                companyCode={selectedCompany?.Company_Id || selectedCompany?.CompanyId || selectedCompany?.companyId || 'COM001'}
            />
            {selectedReport && <ReportTemplate companyName={selectedCompany?.CompanyName || selectedCompany?.companyName || 'ONIMTA IT SOLUTIONS'} title={selectedReport} subtitle={`As of ${new Date().toLocaleDateString()}`} onClose={() => setSelectedReport(null)} onSwitchReport={setSelectedReport} />}
            <ViewUtilityModal isOpen={showViewUtilityModal} onClose={() => setShowViewUtilityModal(false)} />
            <SubscriptionModal isOpen={showPricingPlansModal} onClose={() => setShowPricingPlansModal(false)} />
        </div>
    );
};

export default BIDashboardPage;



