import React, { useState, useEffect } from 'react';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert, CheckCircle2, LogOut } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import PaymentMethodModal from './PaymentMethodModal';

const SubscriptionExpiredModal = ({ isOpen, userStatus }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await subscriptionPlanService.getAllPlans();
            setPlans(data || []);
        } catch (error) {
            console.error("Failed to fetch subscription plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlanForPayment(plan);
        setShowPaymentModal(true);
    };

    const handlePaymentClose = (success) => {
        setShowPaymentModal(false);
        if (success) {
            // Ideally, we'd update the backend here or navigate the user to login to re-fetch tokens
            authService.logout();
            localStorage.removeItem('selectedCompany');
            window.location.href = '/login';
        }
    };

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem('selectedCompany');
        navigate('/login');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-8 text-center border-b border-slate-100 relative">
                    <button 
                        onClick={handleLogout}
                        className="absolute top-6 right-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                    <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-[28px] font-black text-slate-800 mb-3 tracking-tight">
                        {userStatus === 'Trial' ? 'Your Free Trial Has Ended' : 'Subscription Expired'}
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-[15px] leading-relaxed">
                        {userStatus === 'Trial' 
                            ? "We hope you enjoyed exploring the system! To continue using all features without interruption, please choose a subscription plan below."
                            : "Your active subscription has expired. Please renew your plan or upgrade to continue accessing your financial workspace."}
                    </p>
                </div>

                <div className="p-8 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Available Plans</h3>
                    
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                            <p>Loading pricing plans...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.filter(p => p.isActive).map((plan, index) => (
                                <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                                    {index === 1 && (
                                        <div className="bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider py-1 text-center w-full absolute top-0 left-0">
                                            Most Popular
                                        </div>
                                    )}
                                    <div className={`p-6 ${index === 1 ? 'pt-8' : ''} flex flex-col flex-grow`}>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2">{plan.planName}</h4>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-4xl font-black text-slate-800">${plan.price}</span>
                                            <span className="text-slate-500 font-medium">/{plan.billingCycle.toLowerCase()}</span>
                                        </div>
                                        
                                        <ul className="space-y-4 mb-8 flex-grow">
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <span className="text-slate-600 font-medium text-sm">Up to <strong>{plan.maxUsers}</strong> Users</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <span className="text-slate-600 font-medium text-sm">Manage <strong>{plan.maxCompanies}</strong> Companies</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <span className="text-slate-600 font-medium text-sm">24/7 Priority Support</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <span className="text-slate-600 font-medium text-sm">Full Analytics Access</span>
                                            </li>
                                        </ul>
                                        
                                        <button 
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`w-full py-3 rounded-xl font-bold transition-all ${
                                                index === 1 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                            }`}
                                        >
                                            Select Plan
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {plans.filter(p => p.isActive).length === 0 && (
                                <div className="col-span-3 text-center py-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200 border-dashed">
                                    No subscription plans available at the moment. Please contact support.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="bg-white border-t border-slate-100 p-5 text-center">
                    <p className="text-slate-500 text-[13px] font-medium">
                        Need help? Contact our support team at <a href="mailto:support@onimta.com" className="text-[#0388cc] hover:underline font-bold">support@onimta.com</a>
                    </p>
                </div>
            </div>

            <PaymentMethodModal 
                isOpen={showPaymentModal}
                onClose={handlePaymentClose}
                selectedPlan={selectedPlanForPayment}
            />
        </div>
    );
};

export default SubscriptionExpiredModal;
