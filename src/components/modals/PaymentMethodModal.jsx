import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, CheckCircle2, ArrowLeft } from 'lucide-react';
import { showSuccessToast } from '../../utils/toastUtils';

const PaymentMethodModal = ({ isOpen, onClose, selectedPlan }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !selectedPlan) return null;

    const handleProcessPayment = () => {
        setIsProcessing(true);
        // Simulate payment processing delay
        setTimeout(() => {
            setIsProcessing(false);
            showSuccessToast(`Payment successful! Your ${selectedPlan.planName} is now active.`);
            onClose(true); // pass true to indicate success
        }, 2000);
    };

    const paymentMethods = [
        { id: 'card', title: 'Credit / Debit Card', icon: CreditCard, description: 'Pay securely with Visa, Mastercard, or Amex' },
        { id: 'paypal', title: 'PayPal', icon: Wallet, description: 'Quick and easy checkout with PayPal' },
        { id: 'bank', title: 'Bank Transfer', icon: Landmark, description: 'Direct transfer from your bank account' }
    ];

    return (
        <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={() => onClose(false)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2 rounded-full transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plans
                    </button>
                    <div className="text-right">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Checkout</h3>
                        <p className="text-slate-500 text-sm">Select payment method</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row gap-8">
                    {/* Left: Methods */}
                    <div className="flex-1 space-y-4">
                        <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Payment Options</h4>
                        {paymentMethods.map(method => {
                            const Icon = method.icon;
                            const isSelected = selectedMethod === method.id;
                            return (
                                <div 
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                        isSelected 
                                            ? 'border-[#0388cc] bg-blue-50/50 shadow-sm' 
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${isSelected ? 'bg-[#0388cc] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className={`font-bold ${isSelected ? 'text-[#0388cc]' : 'text-slate-700'}`}>{method.title}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5">{method.description}</p>
                                    </div>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0388cc]" />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: Summary */}
                    <div className="w-full md:w-64 flex flex-col">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1">
                            <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Order Summary</h4>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Plan</span>
                                    <span className="font-bold text-slate-800">{selectedPlan.planName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Billing</span>
                                    <span className="font-medium text-slate-700 capitalize">{selectedPlan.billingCycle}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-end mb-6">
                                <span className="text-slate-500 font-medium">Total</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-800">${selectedPlan.price}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleProcessPayment}
                                disabled={isProcessing}
                                className="w-full py-3 bg-[#0388cc] hover:bg-[#026b9c] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>Pay ${selectedPlan.price}</>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <LockIcon className="w-3 h-3" /> Secure SSL Connection
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export default PaymentMethodModal;
