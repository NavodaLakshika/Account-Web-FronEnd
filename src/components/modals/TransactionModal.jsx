import React, { useState } from 'react';
import { X, Truck, Users, Calculator, Landmark, ShoppingCart, FileText, ArrowRightLeft, Search } from 'lucide-react';
import CustomerCenterModal from './CustomerCenterModal';
import VendorsCenterModal from './VendorsCenterModal';
import AccountingSubModal from './AccountingSubModal';
import BankingSubModal from './BankingSubModal';

const menuGroups = [
    {
        title: 'Sales & Receivables',
        items: [
            { icon: ShoppingCart, label: 'Customer Center', desc: 'Invoices, receipts, and customer payments', modal: 'customer' },
        ]
    },
    {
        title: 'Purchases & Payables',
        items: [
            { icon: FileText, label: 'Vendors Center', desc: 'Bills, payments, and vendor management', modal: 'vendor' },
        ]
    },
    {
        title: 'Accounting',
        items: [
            { icon: Calculator, label: 'Accounting', desc: 'Journal entries, cash, and adjustments', modal: 'accounting' },
        ]
    },
    {
        title: 'Banking',
        items: [
            { icon: Landmark, label: 'Banking', desc: 'Deposits, transfers, cheques, and reconciliation', modal: 'banking' },
        ]
    }
];

const TransactionModal = ({ isOpen, onClose, onOpenEnterBill, onOpenPayBill, onOpenAdvancePay, onOpenSalesOrder, onOpenCustomerInvoice, onOpenSalesReceipt, onOpenReceivePayment, onOpenCustomerAdvance, onOpenOpeningBalance, onOpenPettyCash, onOpenMainCash, onOpenJournalEntry, onOpenReversalEntry, onOpenPaymentSetoff, onOpenCollectionDeposit, onOpenDirectBankTransaction, onOpenFundsTransfer, onOpenBankReconciliation, onOpenChequeCancel, onOpenCustomerChequeReturn, onOpenChequePrint, onOpenChequeBookEntry, onOpenWriteCheque, onOpenChequeInHand, onOpenNotPresented }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCustomerCenterModal, setShowCustomerCenterModal] = useState(false);
    const [showVendorsCenterModal, setShowVendorsCenterModal] = useState(false);
    const [showAccountingModal, setShowAccountingModal] = useState(false);
    const [showBankingModal, setShowBankingModal] = useState(false);

    if (!isOpen) return null;

    const filteredGroups = (() => {
        const q = searchQuery.toLowerCase();
        if (!q) return menuGroups;
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
            )
        })).filter(group => group.items.length > 0);
    })();

    const openModal = (modal) => {
        switch (modal) {
            case 'customer': setShowCustomerCenterModal(true); break;
            case 'vendor': setShowVendorsCenterModal(true); break;
            case 'accounting': setShowAccountingModal(true); break;
            case 'banking': setShowBankingModal(true); break;
        }
    };

    const totalModules = menuGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0285fd]" />

                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                <ArrowRightLeft size={13} className="text-[#0285fd]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-slate-900 uppercase tracking-[2px] font-mono leading-none">Transaction Center</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sales, Purchases, Accounting &amp; Banking</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                            <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="px-3 py-2 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search modules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-6 text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[65vh] no-scrollbar">
                        {filteredGroups.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                    <Search size={18} className="text-slate-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">No modules found</p>
                                <button onClick={() => setSearchQuery('')} className="mt-1.5 text-[9px] font-bold text-[#0285fd] uppercase tracking-wider hover:underline">Clear search</button>
                            </div>
                        ) : (
                            filteredGroups.map((group, gi) => (
                                <div key={gi}>
                                    <div className="flex items-center gap-2 px-4 py-2">
                                        <div className="w-1 h-1 rounded-full bg-[#0285fd]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</span>
                                        <div className="flex-1" />
                                        <span className="text-[9px] font-mono font-bold text-slate-300">{group.items.length}</span>
                                    </div>
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => openModal(item.modal)}
                                                className="group w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all relative overflow-hidden text-left border-none"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0285fd]" />

                                                <div className="flex items-center gap-3 relative z-10 w-full">
 <div className="w-7 h-7 rounded-sm bg-slate-100 flex items-center justify-center transition-colors shadow-sm group-hover:bg-white">
                                                        <Icon size={14} className="text-slate-500 group-hover:text-[#0285fd] transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {totalModules} Modules
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Transaction Hub</span>
                    </div>
                </div>
            </div>

            {showCustomerCenterModal && (
                <CustomerCenterModal
                    isOpen={showCustomerCenterModal}
                    onClose={() => setShowCustomerCenterModal(false)}
                    onOpenSalesOrder={onOpenSalesOrder}
                    onOpenCustomerInvoice={onOpenCustomerInvoice}
                    onOpenSalesReceipt={onOpenSalesReceipt}
                    onOpenReceivePayment={onOpenReceivePayment}
                    onOpenCustomerAdvance={onOpenCustomerAdvance}
                />
            )}
            {showVendorsCenterModal && (
                <VendorsCenterModal
                    isOpen={showVendorsCenterModal}
                    onClose={() => setShowVendorsCenterModal(false)}
                    onOpenEnterBill={onOpenEnterBill}
                    onOpenPayBill={onOpenPayBill}
                    onOpenAdvancePay={onOpenAdvancePay}
                />
            )}
            {showAccountingModal && (
                <AccountingSubModal
                    isOpen={showAccountingModal}
                    onClose={() => setShowAccountingModal(false)}
                    onOpenOpeningBalance={onOpenOpeningBalance}
                    onOpenPettyCash={onOpenPettyCash}
                    onOpenMainCash={onOpenMainCash}
                    onOpenJournalEntry={onOpenJournalEntry}
                    onOpenReversalEntry={onOpenReversalEntry}
                    onOpenPaymentSetoff={onOpenPaymentSetoff}
                />
            )}
            {showBankingModal && (
                <BankingSubModal
                    isOpen={showBankingModal}
                    onClose={() => setShowBankingModal(false)}
                    onOpenCollectionDeposit={onOpenCollectionDeposit}
                    onOpenDirectBankTransaction={onOpenDirectBankTransaction}
                    onOpenFundsTransfer={onOpenFundsTransfer}
                    onOpenBankReconciliation={onOpenBankReconciliation}
                    onOpenChequeCancel={onOpenChequeCancel}
                    onOpenCustomerChequeReturn={onOpenCustomerChequeReturn}
                    onOpenChequePrint={onOpenChequePrint}
                    onOpenChequeBookEntry={onOpenChequeBookEntry}
                    onOpenWriteCheque={onOpenWriteCheque}
                    onOpenChequeInHand={onOpenChequeInHand}
                    onOpenNotPresented={onOpenNotPresented}
                />
            )}
        </>
    );
};

export default TransactionModal;
