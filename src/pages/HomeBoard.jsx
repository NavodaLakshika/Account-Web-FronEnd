import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
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
    Lock
} from 'lucide-react';

import FeatureLockedModal from '../components/modals/FeatureLockedModal';

/* Category Item - Final Style: Non-bold text, Precise Green boxes */
const CategoryItem = ({ icon: Icon, label, onClick, colorClass = "bg-[#4cc3a5]", isLocked = false }) => (
    <div className="relative group/item flex items-center justify-between w-full pr-4">
        <button
            onClick={onClick}
            className={`flex items-center gap-6 group transition-all duration-300 ${isLocked ? 'opacity-60' : 'hover:translate-x-3'}`}
        >
            <div className={`w-12 h-10 ${isLocked ? 'bg-slate-300' : colorClass} rounded-[2px] flex items-center justify-center shadow-sm transform ${isLocked ? '' : 'group-hover:scale-110'} transition-transform`}>
                {isLocked ? <Lock size={18} className="text-white opacity-80" strokeWidth={2} /> : <Icon size={20} className="text-white" strokeWidth={2} />}
            </div>
            <span className={`text-[15px] font-medium ${isLocked ? 'text-slate-400' : 'text-gray-500 group-hover:text-[#0078d4]'} transition-colors tracking-tight`}>
                {label}
            </span>
        </button>
        {isLocked && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full shadow-sm ml-2">
                <Lock size={10} className="text-red-500" />
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-red-500">Secured</span>
            </div>
        )}
    </div>
);

const HomeBoard = ({ isOpen, onClose, onOpenModal }) => {
    const [showLockModal, setShowLockModal] = useState(false);

    const handleItemClick = (label, isLocked) => {
        if (isLocked) {
            setShowLockModal(true);
            return;
        }
        onOpenModal(label);
    };
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SELECT ITEM TO QUICK VIEW"
            maxWidth="max-w-[1240px]"
        >
            <div className="flex bg-[#fcfdfe] h-[75vh] max-h-[780px] min-h-[500px] font-['Plus_Jakarta_Sans'] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] relative select-none rounded-[32px] m-1 border border-gray-100">

                {/* 1. Vertical Sidebar - System Blue (#0078d4) with Curve */}
                <div className="w-[200px] bg-[#0078d4] flex flex-col items-center justify-center relative overflow-hidden shrink-0 z-20">

                    <h1 className="text-white text-[72px] font-black uppercase tracking-[0.25em] transform -rotate-90 origin-center whitespace-nowrap opacity-90 drop-shadow-xl relative -left-6">
                        HOME
                    </h1>

                    <div className="absolute bottom-12 flex flex-col items-center gap-3">
                        <div className="w-1.5 h-16 bg-white/10 rounded-full overflow-hidden">
                            <div className="w-full h-1/2 bg-white/40 rounded-full" />
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">System Terminal</span>
                    </div>

                    {/* Curve transition into white area */}
                    <div className="absolute top-0 right-[-2px] h-full w-24 bg-[#fcfdfe] rounded-l-[100px]" />
                </div>

                {/* 2. Main Area with 4 Quadrants */}
                <div className="flex-1 relative p-16 overflow-y-auto no-scrollbar">
                    {/* Centered Cross-hair divider lines (Thin System Blue) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[85%] h-[1px] bg-[#0078d4]/10 absolute" />
                        <div className="w-[1px] h-[85%] bg-[#0078d4]/10 relative" />
                    </div>

                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-x-20 gap-y-32 relative z-10 -mt-12">

                        {/* Quadrant 1: Vendors & Purchasing - All Details Added */}
                        <div className="flex flex-col gap-6 animate-in slide-in-from-top duration-500 pt-4">
                            <div className="space-y-4">
                                <CategoryItem icon={ClipboardList} label="Purchase Order" onClick={() => handleItemClick('Purchase Order', localStorage.getItem('isLocked_trans_po') === 'true')} isLocked={localStorage.getItem('isLocked_trans_po') === 'true'} />
                                <CategoryItem icon={Package} label="GRN" onClick={() => handleItemClick('GRN', localStorage.getItem('isLocked_trans_grn') === 'true')} isLocked={localStorage.getItem('isLocked_trans_grn') === 'true'} />
                                <CategoryItem icon={Wallet} label="Petty Cash" onClick={() => handleItemClick('Petty Cash', localStorage.getItem('isLocked_trans_pettyCash') === 'true')} isLocked={localStorage.getItem('isLocked_trans_pettyCash') === 'true'} />
                                <CategoryItem icon={FileText} label="Enter Bills" onClick={() => handleItemClick('Enter Bills', localStorage.getItem('isLocked_trans_enterBills') === 'true')} isLocked={localStorage.getItem('isLocked_trans_enterBills') === 'true'} />
                                <CategoryItem icon={CreditCard} label="Pay Bills" onClick={() => handleItemClick('Pay Bills', localStorage.getItem('isLocked_trans_payBills') === 'true')} isLocked={localStorage.getItem('isLocked_trans_payBills') === 'true'} />
                                <CategoryItem icon={ArrowDownLeft} label="Estimate" onClick={() => handleItemClick('Estimate', localStorage.getItem('isLocked_trans_estimate') === 'true')} isLocked={localStorage.getItem('isLocked_trans_estimate') === 'true'} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 animate-in slide-in-from-top duration-700 pt-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.4em]">COMPANY</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                            </div>
                            <div className="space-y-4">
                                <CategoryItem icon={Settings} label="Items and Servies" onClick={() => handleItemClick('Items & Services', localStorage.getItem('isLocked_trans_items') === 'true')} isLocked={localStorage.getItem('isLocked_trans_items') === 'true'} />
                                <CategoryItem icon={BookOpen} label="Journal Entry" onClick={() => handleItemClick('Journal Entry', localStorage.getItem('isLocked_trans_journal') === 'true')} isLocked={localStorage.getItem('isLocked_trans_journal') === 'true'} />
                                <CategoryItem icon={Search} label="Marketing Tool" onClick={() => handleItemClick('Marketing Tool', localStorage.getItem('isLocked_trans_marketing') === 'true')} isLocked={localStorage.getItem('isLocked_trans_marketing') === 'true'} />

                                {/* Relocated Buttons - One Line Block Style */}
                                <div className="flex flex-row gap-3 pt-6 border-t border-gray-50">
                                    <button onClick={() => handleItemClick('Vender', localStorage.getItem('isLocked_master_supplier') === 'true')} className="w-[100px] h-14 bg-[#0078d4] rounded-[8px] flex flex-col items-center justify-center gap-2 shadow-md hover:bg-[#0078d4]/90 hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
                                        <Users size={17} className="text-blue-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Vender</span>
                                    </button>
                                    <button onClick={() => handleItemClick('Customer', localStorage.getItem('isLocked_master_customer') === 'true')} className="w-[100px] h-14 bg-[#0078d4] rounded-[8px] flex flex-col items-center justify-center gap-2 shadow-md hover:bg-[#0078d4]/90 hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
                                        <Users size={17} className="text-blue-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Customer</span>
                                    </button>
                                    <button onClick={() => onOpenModal('Acc.Balance')} className="w-[100px] h-14 bg-[#0078d4] rounded-[8px] flex flex-col items-center justify-center gap-2 shadow-md hover:bg-[#0078d4]/90 hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
                                        <Landmark size={17} className="text-blue-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Acc.Balance</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quadrant 3: Customers & Sales - All Details Added */}
                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pt-4">
                            <div className="space-y-4">
                                <CategoryItem icon={Monitor} label="Sales Order" onClick={() => handleItemClick('Sales Order', localStorage.getItem('isLocked_trans_salesOrder') === 'true')} isLocked={localStorage.getItem('isLocked_trans_salesOrder') === 'true'} />
                                <CategoryItem icon={PenTool} label="Create Invoice" onClick={() => handleItemClick('Create Invoice', localStorage.getItem('isLocked_trans_invoice') === 'true')} isLocked={localStorage.getItem('isLocked_trans_invoice') === 'true'} />
                                <CategoryItem icon={Receipt} label="Receive Payment" onClick={() => handleItemClick('Receive Payment', localStorage.getItem('isLocked_trans_receivePayment') === 'true')} isLocked={localStorage.getItem('isLocked_trans_receivePayment') === 'true'} />
                                <CategoryItem icon={FileText} label="Create Sales Receipt" onClick={() => handleItemClick('Create Sales Receipt', localStorage.getItem('isLocked_trans_salesReceipt') === 'true')} isLocked={localStorage.getItem('isLocked_trans_salesReceipt') === 'true'} />
                                <CategoryItem icon={RefreshCcw} label="Refunds and Credit" onClick={() => handleItemClick('Refunds and Credit', localStorage.getItem('isLocked_trans_refunds') === 'true')} isLocked={localStorage.getItem('isLocked_trans_refunds') === 'true'} />
                            </div>
                        </div>

                        {/* Quadrant 4: Banking - All Details Added */}
                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-700 pt-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.4em]">BANKING</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                            </div>
                            <div className="space-y-4 pt-2">
                                <CategoryItem icon={ArrowDownLeft} label="Collection Deposit" onClick={() => handleItemClick('Make Deposit', localStorage.getItem('isLocked_trans_collection') === 'true')} isLocked={localStorage.getItem('isLocked_trans_collection') === 'true'} />
                                <CategoryItem icon={ClipboardList} label="Cheque Register" onClick={() => handleItemClick('Register', localStorage.getItem('isLocked_trans_chequeRegister') === 'true')} isLocked={localStorage.getItem('isLocked_trans_chequeRegister') === 'true'} />
                                <CategoryItem icon={PenTool} label="Write Cheque" onClick={() => handleItemClick('Write Cheque', localStorage.getItem('isLocked_trans_writeCheque') === 'true')} isLocked={localStorage.getItem('isLocked_trans_writeCheque') === 'true'} />

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
            `}</style>
        </SimpleModal>
    );
};

export default HomeBoard;