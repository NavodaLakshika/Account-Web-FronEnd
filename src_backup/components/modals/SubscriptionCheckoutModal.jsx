import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';
import { CreditCard, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

const SubscriptionCheckoutModal = ({ isOpen, onClose, plan, userData }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!plan) return null;

    const handleCheckout = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 2000);
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={step === 1 ? onClose : undefined}
            title="Secure Checkout"
            maxWidth="max-w-[700px]"
            showHeaderClose={step === 1}
        >
            <div className="flex-1 overflow-y-auto font-['Tahoma']">
                {step === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_350px]">
                        {/* Left Form Area */}
                        <div className="p-6 bg-white">
                            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                                <Lock size={14} className="text-[#0285fd]" />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">256-bit Encryption</span>
                            </div>

                            <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cardholder Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Name on card"
                                        defaultValue={userData?.userName !== 'Not specified' ? userData?.userName : ''}
                                        className="w-full h-9 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Card Number</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded text-[12px] font-mono font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        />
                                        <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Expiry Date</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full h-9 border border-slate-200 rounded px-3 text-[12px] font-mono font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CVC</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="123"
                                            maxLength={4}
                                            className="w-full h-9 border border-slate-200 rounded px-3 text-[12px] font-mono font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 bg-blue-50 p-3 rounded-[3px] border border-blue-200 mt-2">
                                    <ShieldCheck size={16} className="text-[#0285fd] shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide leading-relaxed">
                                        Your payment information is securely encrypted and processed by our certified payment partners.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Right Summary Area */}
                        <div className="p-6 bg-slate-50 border-l border-slate-200 flex flex-col">
                            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">Order Summary</h3>

                            <div className="bg-white p-4 rounded-[3px] border border-slate-200 shadow-sm mb-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[13px] font-bold text-slate-800">{plan.PlanName}</span>
                                    <span className="text-[15px] font-black text-[#0285fd]">${plan.Price}</span>
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">{plan.BillingCycle}</p>

                                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-gray-500 font-bold">Subtotal</span>
                                        <span className="font-bold text-slate-700">${plan.Price}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-gray-500 font-bold">Taxes (0%)</span>
                                        <span className="font-bold text-slate-700">$0.00</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6 px-1">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Total Due</span>
                                <span className="text-[22px] font-black text-slate-900">${plan.Price}</span>
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
                                <button
                                    form="checkout-form"
                                    disabled={loading}
                                    type="submit"
                                    className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>Pay ${plan.Price}</>
                                    )}
                                </button>
                                <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-widest">
                                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Success Step */
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
                            <CheckCircle2 size={28} className="text-[#0285fd]" />
                        </div>
                        <h2 className="text-[16px] font-black text-slate-800 uppercase tracking-widest mb-2">Subscription Confirmed!</h2>
                        <p className="text-[11px] font-bold text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                            Thank you for subscribing to the <strong className="text-slate-700">{plan.PlanName}</strong>. Your account has been upgraded and is ready to use.
                        </p>
                        <button
                            onClick={() => { onClose(); window.location.reload(); }}
                            className="px-6 h-9 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-[12px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 border-none"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </SimpleModal>
    );
};

export default SubscriptionCheckoutModal;
