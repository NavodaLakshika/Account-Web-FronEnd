import React, { useState } from 'react';
import { X, ChevronRight, Truck, Users, Calculator, Landmark, ShieldCheck } from 'lucide-react';
import CustomerCenterModal from './CustomerCenterModal';
import VendorsCenterModal from './VendorsCenterModal';
import AccountingSubModal from './AccountingSubModal';
import BankingSubModal from './BankingSubModal';

const TransactionModal = ({ isOpen, onClose, onOpenEnterBill, onOpenPayBill, onOpenAdvancePay, onOpenSalesOrder, onOpenCustomerInvoice, onOpenSalesReceipt, onOpenReceivePayment, onOpenCustomerAdvance, onOpenOpeningBalance, onOpenPettyCash, onOpenMainCash, onOpenJournalEntry, onOpenReversalEntry, onOpenPaymentSetoff, onOpenCollectionDeposit, onOpenDirectBankTransaction, onOpenFundsTransfer, onOpenBankReconciliation, onOpenChequeCancel, onOpenCustomerChequeReturn, onOpenChequePrint, onOpenChequeBookEntry, onOpenWriteCheque, onOpenChequeInHand, onOpenNotPresented }) => {
    const [showCustomerCenterModal, setShowCustomerCenterModal] = useState(false);
    const [showVendorsCenterModal, setShowVendorsCenterModal] = useState(false);
    const [showAccountingModal, setShowAccountingModal] = useState(false);
    const [showBankingModal, setShowBankingModal] = useState(false);

    if (!isOpen) return null;

    const menuItems = [
        { icon: Truck, label: 'Vendors Center', hasSubmenu: true, onClick: () => setShowVendorsCenterModal(true) },
        { icon: Users, label: 'Customer Center', hasSubmenu: true, onClick: () => setShowCustomerCenterModal(true) },
        { icon: Calculator, label: 'Accounting', hasSubmenu: true, onClick: () => setShowAccountingModal(true) },
        { icon: Landmark, label: 'Banking', hasSubmenu: true, onClick: () => setShowBankingModal(true) },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        {/* System Color Left Accent */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                            style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                        />
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#0078d4]" />
                            <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Transaction Management</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                            title="Close"
                        >
                            <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-2 bg-white flex-1 flex flex-col overflow-y-auto max-h-[75vh] no-scrollbar">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden text-left"
                            >
                                {/* Hover Indicator Bar */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                                />
                                
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                        <item.icon size={16} className="text-slate-500 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <span className="text-[14px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submodals */}
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
