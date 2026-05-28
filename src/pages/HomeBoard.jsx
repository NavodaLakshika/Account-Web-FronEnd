import React, { useState } from 'react';
import {
    ShoppingCart,
    Wallet,
    Landmark,
    Users,
    CreditCard,
    FileText,
    Truck,
    PenTool,
    Settings,
    BookOpen,
    ArrowDownLeft,
    RefreshCcw,
    ChevronRight,
    Search,
    Package,
    ClipboardList,
    Receipt,
    Monitor,
    Home,
    MousePointer2,
    LayoutDashboard,
    Lock,
    PieChart,
    TrendingUp,
    X
} from 'lucide-react';

import FeatureLockedModal from '../components/modals/FeatureLockedModal';

/* Card-style Category Item with guaranteed staggered animation */
const CategoryItem = ({ icon: Icon, label, onClick, colorClass = "bg-[#4cc3a5]", isLocked = false, delay = 0 }) => (
    <div
        className="relative w-full card-animate"
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className={`w-full flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_10px_30px_-5px_rgba(0,120,212,0.15)] hover:border-[#0078d4]/30 hover:-translate-y-1 group'}`}
        >
            <div className={`w-14 h-14 ${isLocked ? 'bg-slate-300' : colorClass} rounded-xl flex items-center justify-center shadow-sm transform transition-transform ${isLocked ? '' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                {isLocked ? <Lock size={20} className="text-white opacity-80" strokeWidth={2.5} /> : <Icon size={24} className="text-white" strokeWidth={2.5} />}
            </div>
            <span className={`ml-6 text-[15px] font-bold tracking-wide ${isLocked ? 'text-slate-400' : 'text-slate-700 group-hover:text-[#0078d4]'} transition-colors`}>
                {label}
            </span>
            {isLocked && (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md shadow-sm">
                    <Lock size={12} className="text-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Secured</span>
                </div>
            )}
        </button>
    </div>
);

const HomeBoard = ({ isOpen, onClose, onOpenModal, onOpenDashboard }) => {
    const [showLockModal, setShowLockModal] = useState(false);

    const handleItemClick = (label, isLocked) => {
        if (isLocked) {
            setShowLockModal(true);
            return;
        }
        onOpenModal(label);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] bg-[#fcfdfe] font-['Plus_Jakarta_Sans'] flex overflow-hidden animate-in fade-in duration-300">

            {/* Full Page Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-50 text-slate-400 hover:text-slate-700"
            >
                <X size={16} />
            </button>

            {/* 1. Vertical Sidebar - System Blue (#0078d4) with Curve */}
            <div className="w-[280px] bg-[#0078d4] flex flex-col items-center justify-center relative overflow-hidden shrink-0 z-20">

                <h1 className="text-white text-[90px] font-black uppercase tracking-[0.25em] transform -rotate-90 origin-center whitespace-nowrap opacity-90 drop-shadow-xl relative -left-8">
                    HOME
                </h1>

                <div className="absolute bottom-16 flex flex-col items-center gap-4">
                    <div className="w-2 h-20 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-full h-1/2 bg-white/40 rounded-full" />
                    </div>
                    <span className="text-[12px] font-bold text-white/20 uppercase tracking-[0.4em]">System Terminal</span>
                </div>

                {/* Curve transition into white area */}
                <div className="absolute top-0 right-[-2px] h-full w-24 bg-[#fcfdfe] rounded-l-[100px]" />
            </div>

            {/* 2. Main Area */}
            <div className="flex-1 relative p-20 overflow-hidden">
                {/* Divider Lines (Thin System Blue) */}
                <div className="absolute inset-0 pointer-events-none flex">
                    <div className="w-1/2 h-full border-r border-[#0078d4]/10 my-12"></div>
                    <div className="w-1/2 h-full relative">
                        <div className="absolute left-0 right-20 top-1/2 h-[1px] bg-[#0078d4]/10"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 h-full gap-x-20 relative z-10 pt-4">

                    {/* Left Column: All Transactions */}
                    <div className="flex flex-col gap-4 pr-6 overflow-y-auto no-scrollbar pb-12 pt-2">
                        <CategoryItem delay={50} icon={ClipboardList} label="Purchase Order" onClick={() => handleItemClick('Purchase Order', localStorage.getItem('isLocked_trans_po') === 'true')} isLocked={localStorage.getItem('isLocked_trans_po') === 'true'} />
                        <CategoryItem delay={100} icon={Package} label="GRN" onClick={() => handleItemClick('GRN', localStorage.getItem('isLocked_trans_grn') === 'true')} isLocked={localStorage.getItem('isLocked_trans_grn') === 'true'} />
                        <CategoryItem delay={150} icon={Package} label="Bulk GRN" onClick={() => handleItemClick('Bulk GRN', localStorage.getItem('isLocked_trans_bulkGrn') === 'true')} isLocked={localStorage.getItem('isLocked_trans_bulkGrn') === 'true'} />
                        <CategoryItem delay={200} icon={Wallet} label="Petty Cash" onClick={() => handleItemClick('Petty Cash', localStorage.getItem('isLocked_trans_pettyCash') === 'true')} isLocked={localStorage.getItem('isLocked_trans_pettyCash') === 'true'} />
                        <CategoryItem delay={250} icon={FileText} label="Enter Bills" onClick={() => handleItemClick('Enter Bills', localStorage.getItem('isLocked_trans_enterBills') === 'true')} isLocked={localStorage.getItem('isLocked_trans_enterBills') === 'true'} />
                        <CategoryItem delay={300} icon={CreditCard} label="Pay Bills" onClick={() => handleItemClick('Pay Bills', localStorage.getItem('isLocked_trans_payBills') === 'true')} isLocked={localStorage.getItem('isLocked_trans_payBills') === 'true'} />
                        <CategoryItem delay={350} icon={ArrowDownLeft} label="Estimate" onClick={() => handleItemClick('Estimate', localStorage.getItem('isLocked_trans_estimate') === 'true')} isLocked={localStorage.getItem('isLocked_trans_estimate') === 'true'} />
                        <CategoryItem delay={400} icon={Monitor} label="Sales Order" onClick={() => handleItemClick('Sales Order', localStorage.getItem('isLocked_trans_salesOrder') === 'true')} isLocked={localStorage.getItem('isLocked_trans_salesOrder') === 'true'} />
                        <CategoryItem delay={450} icon={PenTool} label="Create Invoice" onClick={() => handleItemClick('Create Invoice', localStorage.getItem('isLocked_trans_invoice') === 'true')} isLocked={localStorage.getItem('isLocked_trans_invoice') === 'true'} />
                        <CategoryItem delay={500} icon={Receipt} label="Receive Payment" onClick={() => handleItemClick('Receive Payment', localStorage.getItem('isLocked_trans_receivePayment') === 'true')} isLocked={localStorage.getItem('isLocked_trans_receivePayment') === 'true'} />
                        <CategoryItem delay={550} icon={FileText} label="Create Sales Receipt" onClick={() => handleItemClick('Create Sales Receipt', localStorage.getItem('isLocked_trans_salesReceipt') === 'true')} isLocked={localStorage.getItem('isLocked_trans_salesReceipt') === 'true'} />
                        <CategoryItem delay={600} icon={RefreshCcw} label="Refunds and Credit" onClick={() => handleItemClick('Refunds and Credit', localStorage.getItem('isLocked_trans_refunds') === 'true')} isLocked={localStorage.getItem('isLocked_trans_refunds') === 'true'} />
                    </div>

                    {/* Right Column: Company & Banking */}
                    <div className="flex flex-col h-full pl-8 overflow-hidden">
                        {/* Top Half: Company */}
                        <div className="flex-[0.5] flex flex-col pb-8 border-b border-transparent">
                            <div className="flex items-center gap-3 mb-8 card-animate" style={{ animationDelay: '100ms' }}>
                                <span className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.4em]">COMPANY</span>
                            </div>
                            <div className="space-y-4">
                                <CategoryItem delay={200} icon={Settings} label="Items and Servies" onClick={() => handleItemClick('Items & Services', localStorage.getItem('isLocked_trans_items') === 'true')} isLocked={localStorage.getItem('isLocked_trans_items') === 'true'} />
                                <CategoryItem delay={250} icon={BookOpen} label="Journal Entry" onClick={() => handleItemClick('Journal Entry', localStorage.getItem('isLocked_trans_journal') === 'true')} isLocked={localStorage.getItem('isLocked_trans_journal') === 'true'} />
                                <CategoryItem delay={300} icon={Search} label="Marketing Tool" onClick={() => handleItemClick('Marketing Tool', localStorage.getItem('isLocked_trans_marketing') === 'true')} isLocked={localStorage.getItem('isLocked_trans_marketing') === 'true'} />
                            </div>

                            <div className="flex flex-row gap-4 pt-8 mt-auto pr-10">
                                <div className="flex-1 card-animate" style={{ animationDelay: '400ms' }}>
                                    <button onClick={() => handleItemClick('Vender', localStorage.getItem('isLocked_master_supplier') === 'true')} className="w-full h-16 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center hover:border-blue-300 hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all group">
                                        <Users size={22} className="mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-blue-600">VENDER</span>
                                    </button>
                                </div>
                                <div className="flex-1 card-animate" style={{ animationDelay: '450ms' }}>
                                    <button onClick={() => handleItemClick('Customer', localStorage.getItem('isLocked_master_customer') === 'true')} className="w-full h-16 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center hover:border-blue-300 hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all group">
                                        <Users size={22} className="mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-blue-600">CUSTOMER</span>
                                    </button>
                                </div>
                                <div className="flex-1 card-animate" style={{ animationDelay: '500ms' }}>
                                    <button onClick={() => onOpenModal('Acc.Balance')} className="w-full h-16 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center hover:border-blue-300 hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all group">
                                        <Landmark size={22} className="mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-blue-600">ACC.BALANCE</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Half: Banking */}
                        <div className="flex-[0.5] flex flex-col pt-10 relative">
                            <div className="flex items-center gap-3 mb-8 card-animate" style={{ animationDelay: '300ms' }}>
                                <span className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.4em]">BANKING</span>
                            </div>
                            <div className="space-y-4">
                                <CategoryItem delay={400} icon={ArrowDownLeft} label="Collection Deposit" onClick={() => handleItemClick('Make Deposit', localStorage.getItem('isLocked_trans_collection') === 'true')} isLocked={localStorage.getItem('isLocked_trans_collection') === 'true'} />
                                <CategoryItem delay={450} icon={ClipboardList} label="Cheque Register" onClick={() => handleItemClick('Register', localStorage.getItem('isLocked_trans_chequeRegister') === 'true')} isLocked={localStorage.getItem('isLocked_trans_chequeRegister') === 'true'} />
                                <CategoryItem delay={500} icon={PenTool} label="Write Cheque" onClick={() => handleItemClick('Write Cheque', localStorage.getItem('isLocked_trans_writeCheque') === 'true')} isLocked={localStorage.getItem('isLocked_trans_writeCheque') === 'true'} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <FeatureLockedModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
            />

            <style hmr-ignore="true">{`
                * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                
                @keyframes cardPopIn {
                    0% {
                        opacity: 0;
                        transform: translateY(30px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .card-animate {
                    opacity: 0;
                    animation: cardPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default HomeBoard;