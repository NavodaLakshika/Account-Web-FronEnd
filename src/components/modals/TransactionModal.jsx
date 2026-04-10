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
                <div className="relative w-full max-w-[280px] bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#0078d4]" />
                            <span className="text-lg font-bold text-slate-800 tracking-tight">Transaction Hub</span>
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
                    <div className="p-6 bg-white flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[75vh] no-scrollbar">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={16} className={`text-gray-500 group-hover:text-white transition-colors`} />
                                    <span className={`text-[13px] font-medium text-gray-700 group-hover:text-white transition-colors`}>
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight size={10} className="text-gray-300 group-hover:text-white transition-colors" />
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 italic">
                        <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic font-sans font-black">Center Navigation</span>
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
