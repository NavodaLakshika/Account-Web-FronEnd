import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

const SubscriptionCheckoutModal = ({ isOpen, onClose, plan, userData }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    if (!isOpen || !plan) return null;

    const handleCheckout = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call for payment processing
        setTimeout(() => {
            setLoading(false);
            setStep(2); // Move to success step
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm font-sans">
            <div className="relative w-full max-w-[900px] h-auto max-h-[90vh] bg-[#f8fafc] shadow-2xl flex flex-col rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-[#0078d4]/10 flex items-center justify-center">
                            <Lock size={16} className="text-[#0078d4]" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-black text-slate-800 tracking-tight">Secure Checkout</h2>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">256-bit Encryption</p>
                        </div>
                    </div>
                    {step === 1 && (
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors p-1">
                            <X size={20} strokeWidth={2} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] h-full">
                            {/* Left Form Area */}
                            <div className="p-8 bg-white">
                                <h3 className="text-[18px] font-extrabold text-slate-800 mb-6 tracking-tight">Payment Details</h3>
                                
                                <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-slate-700">Cardholder Name</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Name on card"
                                            defaultValue={userData?.userName !== 'Not specified' ? userData?.userName : ''}
                                            className="h-10 px-3 border border-slate-300 rounded-sm text-[13px] outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-slate-700">Card Number</label>
                                        <div className="relative">
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-sm text-[13px] font-mono outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
                                            />
                                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-slate-700">Expiry Date</label>
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="h-10 px-3 border border-slate-300 rounded-sm text-[13px] font-mono outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-slate-700">CVC</label>
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="123"
                                                maxLength={4}
                                                className="h-10 px-3 border border-slate-300 rounded-sm text-[13px] font-mono outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 bg-emerald-50 p-3 rounded-sm border border-emerald-200">
                                        <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                                        <p className="text-[11px] font-medium text-emerald-800 leading-tight">
                                            Your payment information is securely encrypted and processed by our certified payment partners.
                                        </p>
                                    </div>
                                </form>
                            </div>

                            {/* Right Summary Area */}
                            <div className="p-8 bg-slate-50 border-l border-slate-200 flex flex-col">
                                <h3 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wide mb-6">Order Summary</h3>
                                
                                <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[15px] font-bold text-slate-800">{plan.PlanName}</span>
                                        <span className="text-[16px] font-black text-[#0078d4]">${plan.Price}</span>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-500 mb-4">Billed {plan.BillingCycle}</p>
                                    
                                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span className="font-semibold text-slate-800">${plan.Price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-600">Taxes (0%)</span>
                                            <span className="font-semibold text-slate-800">$0.00</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8 px-1">
                                    <span className="text-[14px] font-bold text-slate-700">Total Due</span>
                                    <span className="text-[24px] font-black text-slate-900">${plan.Price}</span>
                                </div>

                                <div className="mt-auto flex flex-col gap-3">
                                    <button 
                                        form="checkout-form"
                                        disabled={loading}
                                        type="submit"
                                        className="w-full h-11 bg-[#0078d4] hover:bg-[#005a9e] text-white rounded-sm font-bold text-[14px] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : (
                                            <>Pay ${plan.Price}</>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-center font-medium text-slate-500">
                                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Success Step */
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white h-full">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <h2 className="text-[20px] font-black text-slate-800 mb-2">Subscription Confirmed!</h2>
                            <p className="text-[13px] font-medium text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                                Thank you for subscribing to the <strong className="text-slate-700">{plan.PlanName}</strong>. Your account has been upgraded and is ready to use.
                            </p>
                            <button 
                                onClick={() => {
                                    onClose();
                                    // Normally you'd trigger a reload or context update here
                                    window.location.reload(); 
                                }}
                                className="px-6 h-10 bg-[#0078d4] hover:bg-[#005a9e] text-white rounded-sm font-bold text-[13px] transition-all shadow-sm"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCheckoutModal;
