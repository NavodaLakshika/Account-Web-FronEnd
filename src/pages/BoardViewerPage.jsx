import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemLoader from '../components/SystemLoader';

const NewAccountBoard = lazy(() => import('./NewAccountBoard'));
const CustomerMasterBoard = lazy(() => import('../components/modals/MasterSubModal/CustomerMasterBoard'));
const SupplierMasterBoard = lazy(() => import('../components/modals/MasterSubModal/SupplierMasterBoard'));
const EnterBillBoard = lazy(() => import('./EnterBillBoard'));
const PayBillBoard = lazy(() => import('./PayBillBoard'));
const WriteChequeBoard = lazy(() => import('./WriteChequeBoard'));
const MakeDepositBoard = lazy(() => import('./MakeDepositBoard'));
const JournalEntryBoard = lazy(() => import('./JournalEntryBoard'));
const BankReconciliationBoard = lazy(() => import('./BankReconciliationBoard'));
const TrialBalanceBoard = lazy(() => import('./TrialBalanceBoard'));
const DocumentSearchBoard = lazy(() => import('./DocumentSearchBoard'));
const PurchaseOrderBoard = lazy(() => import('./PurchaseOrderBoard'));
const GRNBoard = lazy(() => import('./GRNBoard'));
const BulkGRNBoard = lazy(() => import('./BulkGRNBoard'));
const PettyCashBoard = lazy(() => import('../HomeMaster/PettyCashBoard'));
const SalesOrderBoard = lazy(() => import('./SalesOrderBoard'));
const SalesReceiptBoard = lazy(() => import('./SalesReceiptBoard'));
const ReceivePaymentBoard = lazy(() => import('./ReceivePaymentBoard'));
const ChequeRegisterBoard = lazy(() => import('./ChequeRegisterBoard'));
const MarketingToolBoard = lazy(() => import('./MarketingToolBoard'));
const AccountBalanceBoard = lazy(() => import('../HomeMaster/AccountBalanceBoard'));
const ReminderListBoard = lazy(() => import('../HomeMaster/ReminderListBoard'));
const SalesInvoiceBoard = lazy(() => import('./SalesInvoiceBoard'));
const SystemSettingsBoard = lazy(() => import('../HomeMaster/SystemSettingsBoard'));
const MasterFileModal = lazy(() => import('../components/modals/MasterFileModal'));
const ViewUtilityModal = lazy(() => import('../components/modals/ViewUtilityModal'));
const TransactionModal = lazy(() => import('../components/modals/TransactionModal'));
const SystemAdminModal = lazy(() => import('../components/modals/SystemAdmin/SystemAdminModal'));
const ChangePasswordBoard = lazy(() => import('./ChangePasswordBoard'));
const ThankYouModal = lazy(() => import('../components/modals/ThankYouModal'));
const SoftwareAboutModal = lazy(() => import('../components/modals/SoftwareAboutModal'));
const SubscriptionModal = lazy(() => import('../components/modals/SubscriptionModal'));
const AdvancePayBoard = lazy(() => import('./AdvancePayBoard'));
const CustomerAdvanceBoard = lazy(() => import('./CustomerAdvanceBoard'));
const CustomerInvoiceBoard = lazy(() => import('./CustomerInvoiceBoard'));
const ReceivedPaymentBoard = lazy(() => import('./ReceivedPaymentBoard'));
const CustomerReceiptBoard = lazy(() => import('./CustomerReceiptBoard'));
const OpeningBalanceBoard = lazy(() => import('./OpeningBalanceBoard'));
const MainCashBoard = lazy(() => import('./MainCashBoard'));
const ReversalEntryBoard = lazy(() => import('./ReversalEntryBoard'));
const PaymentSetoffBoard = lazy(() => import('./PaymentSetoffBoard'));
const CollectionToDepositBoard = lazy(() => import('./CollectionToDepositBoard'));
const DirectBankTransactionBoard = lazy(() => import('./DirectBankTransactionBoard'));
const FundsTransferBoard = lazy(() => import('./FundsTransferBoard'));
const ChequeCancelBoard = lazy(() => import('./ChequeCancelBoard'));
const CustomerChequeReturnBoard = lazy(() => import('./CustomerChequeReturnBoard'));
const ChequeBookEntryBoard = lazy(() => import('./ChequeBookEntryBoard'));
const ChequeInHandBoard = lazy(() => import('./ChequeInHandBoard'));
const NotPresentedChequesBoard = lazy(() => import('./NotPresentedChequesBoard'));
const LogoutConfirmModal = lazy(() => import('../components/modals/LogoutConfirmModal'));
const AlarmAlertModal = lazy(() => import('../components/modals/AlarmAlertModal'));
const AIChatbotBoard = lazy(() => import('./AIChatbotBoard'));
const FeatureLockedModal = lazy(() => import('../components/modals/FeatureLockedModal'));
const ExpensesDashboardBoard = lazy(() => import('./ExpensesDashboardBoard'));
const QuickLaunchGridModal = lazy(() => import('../components/modals/QuickLaunchGridModal'));
const DepartmentBoard = lazy(() => import('./DepartmentProfileBoard'));
const CalculatorBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/CalculatorBoard'));
const SimpleModal = lazy(() => import('../components/SimpleModal'));
const EstimateBoard = lazy(() => import('./EstimateBoard'));
const SubscriptionExpiredModal = lazy(() => import('../components/modals/SubscriptionExpiredModal'));
const SubmitReviewModal = lazy(() => import('../components/modals/SubmitReviewModal'));
const CompanyPromoBoard = lazy(() => import('../components/CompanyPromoBoard'));
const SubscriptionAdminBoard = lazy(() => import('../components/Admin/SubscriptionAdminBoard'));
const GetThingsDoneBoard = lazy(() => import('./GetThingsDoneBoard'));
const GlobalSearchModal = lazy(() => import('../components/modals/GlobalSearchModal'));
const CompanyBoard = lazy(() => import('./CompanyProfileBoard'));
const CostCenterBoard = lazy(() => import('./CostCenterProfileBoard'));
const CategoryBoard = lazy(() => import('./CategoryProfileBoard'));
const RouteBoard = lazy(() => import('./RouteProfileBoard'));
const AreaBoard = lazy(() => import('./AreaProfileBoard'));
const AddReminderBoard = lazy(() => import('./AddReminderBoard'));
const CardCommissionBoard = lazy(() => import('./CardSaleCommissionBoard'));
const UserProfileBoard = lazy(() => import('./UserProfileMaintenanceBoard'));
const VendorTypesBoard = lazy(() => import('./VendorTypesMasterBoard'));
const CustomerTypeBoard = lazy(() => import('./CustomerTypeProfileBoard'));
const ChartOfAccountantModal = lazy(() => import('../components/modals/ChartOfAccountsModels/ChartOfAccountantModal'));
const FixedAssetsBoard = lazy(() => import('./FixedAssetsProfileBoard'));
const LongTermLiabilityBoard = lazy(() => import('./LongTermLiabilityProfileBoard'));
const DepreciationBoard = lazy(() => import('./DepreciationRateBoard'));
const FixedTransactionEntryBoard = lazy(() => import('./FixedTransactionEntryBoard'));
const LetterEnvelopesModal = lazy(() => import('../components/modals/LetterEnvelopesModal'));
const OfficeDocumentModal = lazy(() => import('../components/modals/OfficeDocumentModal'));
const ToDoListBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/ToDoListBoard'));
const SendFileBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/SendFileBoard'));
const FindBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/FindBoard'));
const CustomizeIconBarBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/CustomizeIconBarBoard'));
const ChangeBackgroundBoard = lazy(() => import('../components/modals/ViewAndUtilityModels/ChangeBackgroundBoard'));
const BackupBoard = lazy(() => import('./BackupBoard'));
const StockBalanceUpdateModal = lazy(() => import('../components/modals/SystemAdmin/StockBalanceUpdateModal'));
const InventoryDownloadBoard = lazy(() => import('./InventoryDownloadBoard'));
const DeleteAccountModal = lazy(() => import('../components/modals/SystemAdmin/DeleteAccountModal'));
const TwoFactorSetupModal = lazy(() => import('../components/modals/SystemAdmin/TwoFactorSetupModal'));
const SystemUpdateModal = lazy(() => import('../components/modals/SystemAdmin/SystemUpdateModal'));
const ClearTempDataModal = lazy(() => import('../components/modals/SystemAdmin/ClearTempDataModal'));
const PeriodLockModal = lazy(() => import('../components/modals/SystemAdmin/PeriodLockModal'));
const JournalEntryEditorBoard = lazy(() => import('./JournalEntryEditorBoard'));
const TransactionEditorModal = lazy(() => import('../components/modals/SystemAdmin/TransactionEditorModal'));
const CompanyUsersModal = lazy(() => import('../components/modals/SystemAdmin/CompanyUsersModal'));
const ReportsCenterModal = lazy(() => import('../components/modals/AdminReports/ReportsCenterModal'));
const DashboardHelpModal = lazy(() => import('../components/modals/DashboardHelpModal'));
const ProfitLossDashboardBoard = lazy(() => import('./ProfitLossDashboardBoard'));
const CustomerBoard = lazy(() => import('./CustomerBoard'));
const VendorBoard = lazy(() => import('./VendorBoard'));

const boardRegistry = {
    'NewAccountBoard': NewAccountBoard,
    'CustomerMasterBoard': CustomerMasterBoard,
    'SupplierMasterBoard': SupplierMasterBoard,
    'EnterBillBoard': EnterBillBoard,
    'PayBillBoard': PayBillBoard,
    'WriteChequeBoard': WriteChequeBoard,
    'MakeDepositBoard': MakeDepositBoard,
    'JournalEntryBoard': JournalEntryBoard,
    'BankReconciliationBoard': BankReconciliationBoard,
    'TrialBalanceBoard': TrialBalanceBoard,
    'DocumentSearchBoard': DocumentSearchBoard,
    'PurchaseOrderBoard': PurchaseOrderBoard,
    'GRNBoard': GRNBoard,
    'BulkGRNBoard': BulkGRNBoard,
    'PettyCashBoard': PettyCashBoard,
    'SalesOrderBoard': SalesOrderBoard,
    'SalesReceiptBoard': SalesReceiptBoard,
    'ReceivePaymentBoard': ReceivePaymentBoard,
    'ChequeRegisterBoard': ChequeRegisterBoard,
    'MarketingToolBoard': MarketingToolBoard,
    'AccountBalanceBoard': AccountBalanceBoard,
    'ReminderListBoard': ReminderListBoard,
    'SalesInvoiceBoard': SalesInvoiceBoard,
    'SystemSettingsBoard': SystemSettingsBoard,
    'MasterFileModal': MasterFileModal,
    'ViewUtilityModal': ViewUtilityModal,
    'TransactionModal': TransactionModal,
    'SystemAdminModal': SystemAdminModal,
    'ChangePasswordBoard': ChangePasswordBoard,
    'ThankYouModal': ThankYouModal,
    'SoftwareAboutModal': SoftwareAboutModal,
    'SubscriptionModal': SubscriptionModal,
    'AdvancePayBoard': AdvancePayBoard,
    'CustomerAdvanceBoard': CustomerAdvanceBoard,
    'CustomerInvoiceBoard': CustomerInvoiceBoard,
    'ReceivedPaymentBoard': ReceivedPaymentBoard,
    'CustomerReceiptBoard': CustomerReceiptBoard,
    'OpeningBalanceBoard': OpeningBalanceBoard,
    'MainCashBoard': MainCashBoard,
    'ReversalEntryBoard': ReversalEntryBoard,
    'PaymentSetoffBoard': PaymentSetoffBoard,
    'CollectionToDepositBoard': CollectionToDepositBoard,
    'DirectBankTransactionBoard': DirectBankTransactionBoard,
    'FundsTransferBoard': FundsTransferBoard,
    'ChequeCancelBoard': ChequeCancelBoard,
    'CustomerChequeReturnBoard': CustomerChequeReturnBoard,
    'ChequeBookEntryBoard': ChequeBookEntryBoard,
    'ChequeInHandBoard': ChequeInHandBoard,
    'NotPresentedChequesBoard': NotPresentedChequesBoard,
    'LogoutConfirmModal': LogoutConfirmModal,
    'AlarmAlertModal': AlarmAlertModal,
    'AIChatbotBoard': AIChatbotBoard,
    'FeatureLockedModal': FeatureLockedModal,
    'ExpensesDashboardBoard': ExpensesDashboardBoard,
    'QuickLaunchGridModal': QuickLaunchGridModal,
    'DepartmentBoard': DepartmentBoard,
    'CalculatorBoard': CalculatorBoard,
    'SimpleModal': SimpleModal,
    'EstimateBoard': EstimateBoard,
    'SubscriptionExpiredModal': SubscriptionExpiredModal,
    'SubmitReviewModal': SubmitReviewModal,
    'CompanyPromoBoard': CompanyPromoBoard,
    'SubscriptionAdminBoard': SubscriptionAdminBoard,
    'GetThingsDoneBoard': GetThingsDoneBoard,
    'GlobalSearchModal': GlobalSearchModal,
    'CompanyBoard': CompanyBoard,
    'CostCenterBoard': CostCenterBoard,
    'CategoryBoard': CategoryBoard,
    'RouteBoard': RouteBoard,
    'AreaBoard': AreaBoard,
    'AddReminderBoard': AddReminderBoard,
    'CardCommissionBoard': CardCommissionBoard,
    'UserProfileBoard': UserProfileBoard,
    'VendorTypesBoard': VendorTypesBoard,
    'CustomerTypeBoard': CustomerTypeBoard,
    'ChartOfAccountantModal': ChartOfAccountantModal,
    'FixedAssetsBoard': FixedAssetsBoard,
    'LongTermLiabilityBoard': LongTermLiabilityBoard,
    'DepreciationBoard': DepreciationBoard,
    'FixedTransactionEntryBoard': FixedTransactionEntryBoard,
    'LetterEnvelopesModal': LetterEnvelopesModal,
    'OfficeDocumentModal': OfficeDocumentModal,
    'ToDoListBoard': ToDoListBoard,
    'SendFileBoard': SendFileBoard,
    'FindBoard': FindBoard,
    'CustomizeIconBarBoard': CustomizeIconBarBoard,
    'ChangeBackgroundBoard': ChangeBackgroundBoard,
    'BackupBoard': BackupBoard,
    'StockBalanceUpdateModal': StockBalanceUpdateModal,
    'InventoryDownloadBoard': InventoryDownloadBoard,
    'DeleteAccountModal': DeleteAccountModal,
    'TwoFactorSetupModal': TwoFactorSetupModal,
    'SystemUpdateModal': SystemUpdateModal,
    'ClearTempDataModal': ClearTempDataModal,
    'PeriodLockModal': PeriodLockModal,
    'JournalEntryEditorBoard': JournalEntryEditorBoard,
    'TransactionEditorModal': TransactionEditorModal,
    'CompanyUsersModal': CompanyUsersModal,
    'ReportsCenterModal': ReportsCenterModal,
    'DashboardHelpModal': DashboardHelpModal,
    'ProfitLossDashboardBoard': ProfitLossDashboardBoard,
    'CustomerBoard': CustomerBoard,
    'VendorBoard': VendorBoard,
};

const BoardViewerPage = () => {
    const [searchParams] = useSearchParams();
    const boardName = searchParams.get('name');
    const BoardComponent = boardRegistry[boardName];
    if (!BoardComponent) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Board "{boardName}" not found or not mapped yet.</div>;
    return <Suspense fallback={<SystemLoader />}><BoardComponent isOpen={true} onClose={() => window.close()} isInline={false} /></Suspense>;
};
export default BoardViewerPage;
