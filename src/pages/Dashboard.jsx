import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    ChevronRight
} from 'lucide-react';
import { authService } from '../services/auth.service';
import HomeBoard from './HomeBoard';
import NewAccountBoard from './NewAccountBoard';
import CustomerBoard from './CustomerBoard';
import VendorBoard from './VendorBoard';
import EnterBillBoard from './EnterBillBoard';
import PayBillBoard from './PayBillBoard';
import WriteChequeBoard from './WriteChequeBoard';
import PettyCashBoard from './PettyCashBoard';
import MakeDepositBoard from './MakeDepositBoard';
import JournalEntryBoard from './JournalEntryBoard';
import BankReconciliationBoard from './BankReconciliationBoard';
import TrialBalanceBoard from './TrialBalanceBoard';
import SearchBoard from './SearchBoard';
import MasterFileModal from '../components/modals/MasterFileModal';
import ViewUtilityModal from '../components/modals/ViewUtilityModal';
import TransactionModal from '../components/modals/TransactionModal';
import ReportsModal from '../components/modals/ReportsModal';
import SystemAdminModal from '../components/modals/SystemAdminModal';
import SideBar from '../components/SideBar';

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
    const [showPettyCashModal, setShowPettyCashModal] = useState(false);
    const [showMakeDepositModal, setShowMakeDepositModal] = useState(false);
    const [showJournalEntryModal, setShowJournalEntryModal] = useState(false);
    const [showBankRecModal, setShowBankRecModal] = useState(false);
    const [showTrialBalanceModal, setShowTrialBalanceModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showMasterFileModal, setShowMasterFileModal] = useState(false);
    const [showViewUtilityModal, setShowViewUtilityModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showSystemAdminModal, setShowSystemAdminModal] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false);
    const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
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

        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
            setSelectedCompany(company ? JSON.parse(company) : null);
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem('selectedCompany');
        navigate('/login');
    };

    const navItems = [
        { icon: Home, gif: '/icons/home.gif', label: 'Main', onClick: () => setShowHomeModal(true), active: showHomeModal },
        { icon: UserPlus, gif: '/icons/new account2.gif', label: 'Accounts', onClick: () => setShowNewAccountModal(true), active: showNewAccountModal },
        { icon: Users, gif: '/icons/customer.gif', label: 'Customers', onClick: () => setShowCustomerModal(true), active: showCustomerModal },
        { icon: Truck, gif: '/icons/vendors.gif', label: 'Vendors', onClick: () => setShowVendorModal(true), active: showVendorModal },
        { icon: FileText, gif: '/icons/billing.gif', label: 'Billing', onClick: () => setShowEnterBillModal(true), active: showEnterBillModal },
        { icon: CreditCard, gif: '/icons/paybill.gif', label: 'Pay Bills', onClick: () => setShowPayBillModal(true), active: showPayBillModal },
        { icon: PenTool, gif: '/icons/cheque.gif', label: 'Cheques', onClick: () => setShowWriteChequeModal(true), active: showWriteChequeModal },
        { icon: Wallet, gif: '/icons/cash.gif', label: 'Cash', onClick: () => setShowPettyCashModal(true), active: showPettyCashModal },
        { icon: ArrowDownLeft, gif: '/icons/deposit.gif', label: 'Deposit', onClick: () => setShowMakeDepositModal(true), active: showMakeDepositModal },
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
            <HomeBoard isOpen={showHomeModal} onClose={() => setShowHomeModal(false)} />
            <NewAccountBoard isOpen={showNewAccountModal} onClose={() => setShowNewAccountModal(false)} />
            <CustomerBoard isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
            <VendorBoard isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
            <EnterBillBoard isOpen={showEnterBillModal} onClose={() => setShowEnterBillModal(false)} />
            <PayBillBoard isOpen={showPayBillModal} onClose={() => setShowPayBillModal(false)} />
            <WriteChequeBoard isOpen={showWriteChequeModal} onClose={() => setShowWriteChequeModal(false)} />
            <PettyCashBoard isOpen={showPettyCashModal} onClose={() => setShowPettyCashModal(false)} />
            <MakeDepositBoard isOpen={showMakeDepositModal} onClose={() => setShowMakeDepositModal(false)} />
            <JournalEntryBoard isOpen={showJournalEntryModal} onClose={() => setShowJournalEntryModal(false)} />
            <BankReconciliationBoard isOpen={showBankRecModal} onClose={() => setShowBankRecModal(false)} />
            <TrialBalanceBoard isOpen={showTrialBalanceModal} onClose={() => setShowTrialBalanceModal(false)} />
            <SearchBoard isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
            <MasterFileModal isOpen={showMasterFileModal} onClose={() => setShowMasterFileModal(false)} />
            <MasterFileModal isOpen={showMasterFileModal} onClose={() => setShowMasterFileModal(false)} />
            <ViewUtilityModal
                isOpen={showViewUtilityModal}
                onClose={() => setShowViewUtilityModal(false)}
                onToggleSideBar={() => setShowSideBar(!showSideBar)}
                onOpenCalculator={() => setShowTrialBalanceModal(true)} // Or link to the new CalculatorBoard if I had a toggle in Dashboard
            />
            <TransactionModal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} />
            <ReportsModal isOpen={showReportsModal} onClose={() => setShowReportsModal(false)} />
            <SystemAdminModal isOpen={showSystemAdminModal} onClose={() => setShowSystemAdminModal(false)} />

            {/* Side Bar Component */}
            <SideBar
                isOpen={showSideBar}
                onClose={() => setShowSideBar(false)}
                onOpenCalculator={() => {
                    setShowViewUtilityModal(true); // Re-open or just open the specific modal
                }}
            />

            {/* 2. Top Ribbon Navigation (Matches Reference Image) */}
            <header className={`z-50 bg-[#0078d4] text-white shadow-md transition-all duration-500 ease-in-out overflow-hidden ${isTopBarCollapsed ? 'h-8' : 'h-[120px]'}`}>
                {/* Row 1: Text Menu */}
                <div className={`flex items-center gap-6 px-4 py-1.5 border-b border-white/10 overflow-x-auto no-scrollbar transition-opacity duration-300 ${isTopBarCollapsed ? 'h-full flex items-center' : ''}`}>
                    {menuBar.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (item === 'Master File') setShowMasterFileModal(true);
                                if (item === 'View and Utility') setShowViewUtilityModal(true);
                                if (item === 'Transaction') setShowTransactionModal(true);
                                if (item === 'Reports') setShowReportsModal(true);
                                if (item === 'System Admin') setShowSystemAdminModal(true);
                            }}
                            className="text-[12.5px]  hover:text-white/80 whitespace-nowrap transition-colors"
                        >
                            {item}
                        </button>
                    ))}

                    {/* Expand Trigger when collapsed */}
                    {isTopBarCollapsed && (
                        <div className="ml-auto pr-4 flex items-center">
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

                {/* Row 2: Icon Ribbon */}
                <div className={`flex items-center px-2 py-1 gap-1  overflow-x-auto no-scrollbar transition-all duration-500 ${isTopBarCollapsed ? 'opacity-0 -translate-y-10 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
                    {/* Logout always first */}
                    <RibbonButton icon={LogOut} label="LogOut" onClick={handleLogout} iconColor="text-red-500" />

                    <div className="h-10 w-[1px] bg-white/20 mx-1" />

                    <RibbonButton icon={Home} label="Home" onClick={() => setShowHomeModal(true)} active={showHomeModal} />

                    {/* New Account with Badge */}
                    <RibbonButton icon={UserPlus} label="New Account" onClick={() => setShowNewAccountModal(true)} active={showNewAccountModal} hasBadge />

                    {/* Highlighted Customer Item */}
                    <RibbonButton icon={Users} label="Customer" onClick={() => setShowCustomerModal(true)} active={showCustomerModal} />

                    <RibbonButton icon={Truck} label="Vendor" onClick={() => setShowVendorModal(true)} active={showVendorModal} />
                    <RibbonButton icon={FileText} label="Enter Bill" onClick={() => setShowEnterBillModal(true)} active={showEnterBillModal} />
                    <RibbonButton icon={CreditCard} label="Pay Bill" onClick={() => setShowPayBillModal(true)} active={showPayBillModal} />
                    <RibbonButton icon={PenTool} label="Write Chq" onClick={() => setShowWriteChequeModal(true)} active={showWriteChequeModal} />
                    <RibbonButton icon={Wallet} label="Petty Cash" onClick={() => setShowPettyCashModal(true)} active={showPettyCashModal} />
                    <RibbonButton icon={ArrowDownLeft} label="Make Deposit" onClick={() => setShowMakeDepositModal(true)} active={showMakeDepositModal} />
                    <RibbonButton icon={BookOpen} label="Journal Entry" onClick={() => setShowJournalEntryModal(true)} active={showJournalEntryModal} />
                    <RibbonButton icon={RefreshCcw} label="Bank Rec" onClick={() => setShowBankRecModal(true)} active={showBankRecModal} />
                    <RibbonButton icon={BarChart2} label="Trial Balance" onClick={() => setShowTrialBalanceModal(true)} active={showTrialBalanceModal} />
                    <RibbonButton icon={Search} label="Search" onClick={() => setShowSearchModal(true)} active={showSearchModal} />
                    <RibbonButton icon={HelpCircle} label="Help" onClick={() => { }} />

                    {/* Right side arrow - Collapse Trigger */}
                    <div className="ml-auto pr-4">
                        <ChevronRight
                            size={16}
                            className="text-white/50 cursor-pointer hover:text-white transition-all transform -rotate-90"
                            onClick={() => {
                                setIsTopBarCollapsed(true);
                                setShowSideBar(true);
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* 3. Main Workspace Area - Professional Console */}
            <main className="flex-1 relative overflow-y-auto">
                {/* Visual Watermark Background - HD Vector Quality */}
                <div
                    className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: `url('/dashboard-backgroun.jpg')` }}
                />

                {/* Subtle Focus Overlay to prioritize cards */}
                <div className="fixed inset-0 z-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />

                {/* Dashboard Center Watermark - Coins Image */}
               

                <div className="relative z-10 p-12 max-w-7xl mx-auto flex flex-col gap-10">

                    {/* Integrated Search Bar (Transformed from Search Card) */}
                    <div className="w-full flex justify-center">
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="w-full max-w-2xl flex items-center gap-4 px-6 h-16 bg-white border border-slate-200 rounded-[8px] shadow-sm hover:shadow-md hover:border-[#0078d4]/30 transition-all group text-left"
                        >
                            <Search size={22} className="text-slate-400 group-hover:text-[#0078d4] transition-colors" />
                            <span className="text-slate-400 font-medium group-hover:text-slate-500 transition-colors">Search documents, accounts, or ledger entries...</span>
                            <div className="ml-auto px-2 py-1 bg-slate-50 border border-slate-200 rounded-[4px] text-[10px] font-black text-slate-400 uppercase tracking-tighter shadow-sm">
                                Ctrl + K
                            </div>
                        </button>
                    </div>

                    {/* Standard Icon Grid (Excluding Search) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {navItems.filter(item => item.label !== 'Search').map((item, idx) => {
                            const Icon = item.icon;
                            const isAnimated = item.gif && (item.label === 'Main' || item.label === 'Accounts' || item.label === 'Customers' || item.label === 'Vendors' || item.label === 'Billing' || item.label === 'Pay Bills' || item.label === 'Cheques' || item.label === 'Cash' || item.label === 'Deposit' || item.label === 'Journal' || item.label === 'Rec.' || item.label === 'Report');
                            return (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-[8px] shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,120,212,0.2)] hover:border-[#0078d4]/50 hover:scale-[1.04] hover:-translate-y-2.5 active:scale-95 transition-all duration-500 ease-out group relative overflow-hidden"
                                >
                                    {/* Focus Glow Effect */}
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#0078d4] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-[#0078d4]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {/* Indicator Dot */}
                                    <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#0078d4] group-hover:shadow-[0_0_10px_rgba(0,120,212,0.6)] transition-all duration-500" />

                                    <div className={`relative z-10 mb-2 ${isAnimated ? 'w-20 h-20' : 'w-14 h-10'} transition-all duration-500 flex items-center justify-center`}>
                                        {item.gif ? (
                                            <>
                                                {/* Static Icon shown by default for Animated Items */}
                                                {isAnimated && (
                                                    <Icon
                                                        size={40}
                                                        strokeWidth={1.5}
                                                        className="text-slate-500 group-hover:opacity-0 transition-opacity duration-300 absolute"
                                                    />
                                                )}
                                                {/* GIF shown only on hover/active for Animated Items */}
                                                <img
                                                    src={item.gif}
                                                    alt={item.label}
                                                    className={`object-contain transition-all duration-500 ${isAnimated ? 'w-20 h-20 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100' : 'w-8 h-8 opacity-100'}`}
                                                />
                                            </>
                                        ) : (
                                            <Icon size={32} strokeWidth={1.5} className="text-slate-500 group-hover:text-[#0078d4] transition-colors duration-500" />
                                        )}
                                    </div>
                                    <span className="relative z-10 text-[13px] font-bold text-slate-700 group-hover:text-[#0078d4] transition-colors duration-500 text-center leading-tight">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Secondary Navigation (Menu Categories) */}
                    <div className="mt-4 border-t border-slate-200 pt-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-0.5 w-8 bg-[#0078d4]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">System Categories</h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {menuBar.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (item === 'Master File') setShowMasterFileModal(true);
                                        if (item === 'View and Utility') setShowViewUtilityModal(true);
                                        if (item === 'Transaction') setShowTransactionModal(true);
                                        if (item === 'Reports') setShowReportsModal(true);
                                        if (item === 'System Admin') setShowSystemAdminModal(true);
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-[8px] shadow-sm hover:shadow-md hover:border-[#0078d4]/30 hover:-translate-y-0.5 transition-all group"
                                >
                                    <span className="text-[14px] font-medium text-slate-600 uppercase tracking-tight whitespace-nowrap group-hover:text-[#0078d4] transition-colors">
                                        {item}
                                    </span>
                                    <ChevronRight size={12} className="text-slate-300 group-hover:text-[#0078d4] group-hover:translate-x-0.5 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Animated Information Ticker */}
            <div className="h-6 bg-slate-50 border-t border-slate-100 flex items-center overflow-hidden relative z-50">
                <div className="whitespace-nowrap animate-marquee flex items-center gap-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <span key={i} className="text-[10px] font-bold text-[#0078d4]/60 uppercase tracking-[0.2em] flex items-center gap-2">
                            ONIMTA INFORMATION TECHNOLOGY (PVT)
                            <div className="h-1 w-1 bg-[#0078d4]/30 rounded-full" />
                        </span>
                    ))}
                </div>
            </div>

            {/* 4. Minimalist Footer (Matches Reference) */}
            <footer className="h-10 bg-white border-t border-slate-100 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Licensed</span>
                </div>

                <div className="flex items-center gap-1.5 group">
                    <span className="text-[11px] font-medium text-slate-500">Powered by</span>
                    <span className="text-[#0078d4] text-sm font-black tracking-tighter group-hover:scale-105 transition-transform cursor-default">ONIMTA</span>
                </div>
            </footer>

            <style hmr-ignore="true">{`
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
        className={`flex flex-col items-center justify-center min-w-[80px] h-[80px] relative transition-all duration-200 group
            ${isHighlighted ? 'bg-white/20' : 'hover:bg-white/10'}
            ${active ? 'bg-white/30 text-white' : 'text-white/90 hover:text-white'}
        `}
    >
        <div className="relative">
            {gif ? (
                <img src={gif} alt={label} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
            ) : (
                <Icon size={30} strokeWidth={2} className={`group-hover:scale-110 transition-transform ${iconColor || ''}`} />
            )}

            {/* New Badge */}
            {hasBadge && (
                <div className="absolute -top-1 -right-3 bg-white text-[#0078d4] text-[7px] font-black px-1 rounded shadow-sm">
                    New
                </div>
            )}
        </div>

        <span className="text-[10px] font-bold mt-2 tracking-tight leading-none text-center">
            {label.length > 8 ? <>{label.split(' ')[0]}<br />{label.split(' ')[1]}</> : label}
        </span>

        {/* Highlight line for active items */}
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white" />}
    </button>
);

export default Dashboard;
