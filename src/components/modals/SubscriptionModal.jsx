import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Building2, User, CalendarDays, Fingerprint } from 'lucide-react';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { subscriptionService } from '../../services/subscription.service';
import SubscriptionCheckoutModal from './SubscriptionCheckoutModal';

const SubscriptionModal = ({ isOpen, onClose }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({ companyCode: '', companyName: '', userName: '', expiryDate: '' });

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            const initialUserData = loadUserData();
            if (initialUserData && initialUserData.empCode) {
                fetchLiveExpiry(initialUserData.empCode);
            }
        }
    }, [isOpen]);

    const fetchLiveExpiry = async (empCode) => {
        try {
            const res = await subscriptionService.getUsers();
            if (res && res.success && res.data) {
                const currentUser = res.data.find(u => u.emp_Code === empCode || u.emp_Name === empCode);
                if (currentUser && currentUser.subscription_End_Date) {
                    setUserData(prev => ({ 
                        ...prev, 
                        expiryDate: new Date(currentUser.subscription_End_Date).toLocaleDateString() 
                    }));
                } else if (currentUser && currentUser.subscription_end_date) {
                    setUserData(prev => ({ 
                        ...prev, 
                        expiryDate: new Date(currentUser.subscription_end_date).toLocaleDateString() 
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch live expiry date", e);
        }
    };

    const loadUserData = () => {
        let companyCode = 'Not specified';
        let companyName = 'Not specified';
        const companyStr = localStorage.getItem('selectedCompany');
        if (companyStr) {
            try {
                const companyObj = JSON.parse(companyStr);
                companyCode = companyObj.companyCode || companyObj.CompanyCode || companyObj.code || companyStr;
                companyName = companyObj.CompanyName || companyObj.companyName || companyObj.Company_Name || companyStr;
            } catch (e) {
                companyCode = companyStr;
            }
        }

        const userStr = localStorage.getItem('user');
        let userName = 'Not specified';
        let expiryDate = 'N/A';
        let empCode = null;

        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                userName = userObj.EmpName || userObj.empName || userObj.Emp_Name || userObj.username || userName;
                empCode = userObj.emp_Code || userObj.Emp_Code || userObj.empName;
                
                if (userObj.subscription_End_Date) {
                    expiryDate = new Date(userObj.subscription_End_Date).toLocaleDateString();
                } else if (userObj.subscription_end_date) {
                    expiryDate = new Date(userObj.subscription_end_date).toLocaleDateString();
                } else if (empCode && companyCode === 'Not specified') {
                    companyCode = userObj.emp_Code;
                }
            } catch(e) {}
        }
        
        setUserData({ companyCode, companyName, userName, expiryDate, empCode });
        return { empCode };
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await subscriptionPlanService.getAllPlans();
            if (data && data.length > 0) {
                // Filter active plans only
                const activePlans = data.filter(p => p.isActive !== false);
                setPlans(mapPlans(activePlans));
            } else {
                setPlans([]);
            }
        } catch (error) {
            console.error("Failed to fetch subscription plans", error);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const mapPlans = (data) => {
        return data.map((plan, index) => ({
            id: plan.id,
            PlanName: plan.planName,
            IsTrial: plan.price === 0 || (plan.planName && plan.planName.toLowerCase().includes('trial')),
            Description: `Enjoy access to our financial system with support for up to ${plan.maxUsers} users and ${plan.maxCompanies} companies.`,
            Price: plan.price || 0,
            BillingCycle: plan.billingCycle || 'mo',
            ButtonText: 'Subscribe',
            TopColor: index % 2 === 0 ? 'bg-[#0078d4]' : 'bg-[#393a3d]',
            Features: [
                `Up to ${plan.maxUsers} Users`,
                `Manage up to ${plan.maxCompanies} Companies`,
                `Billed ${plan.billingCycle || 'Monthly'}`
            ]
        }));
    };

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);

    if (!isOpen) return null;

    const handleSubscribeClick = (plan) => {
        setSelectedPlan(plan);
        setShowCheckout(true);
    };

    return (
        <>
            <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm font-sans ${showCheckout ? 'hidden' : ''}`}>
                <div className="relative w-full max-w-[1200px] h-[75vh] bg-white shadow-2xl flex flex-col rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header with Close */}
                    <div className="flex justify-end p-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                            <X size={28} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="px-12 pb-12 overflow-y-auto flex-1">
                        <div className="max-w-6xl mx-auto">
                            {/* Modal Title & Intro */}
                            <div className="mb-10 text-center">
                                <h1 className="text-[28px] font-bold text-slate-900 mb-3">Choose Your Subscription Plan</h1>
                                <p className="text-[15px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                    Upgrade your account to unlock premium features, add more users, and manage multiple companies seamlessly. Select the plan that best fits your growing business needs.
                                </p>
                            </div>

                            {/* Cards Grid */}
                            {loading ? (
                                <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading subscription plans...</div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-20 text-gray-500 font-medium">No subscription plans are currently available. Please check the Super Admin Panel.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {plans.map((plan, index) => (
                                        <div key={plan.id || index} className="border border-gray-300 bg-white flex flex-col h-full rounded-sm overflow-hidden">
                                            {/* Top Color Bar */}
                                            <div className={`h-2.5 w-full ${plan.TopColor}`}></div>
                                            
                                            <div className="p-7 flex flex-col h-full">
                                                <h2 className="text-[20px] font-normal text-[#393a3d] mb-2">{plan.PlanName}</h2>
                                                
                                                {plan.IsTrial && (
                                                    <div className="text-[11px] font-bold tracking-wide uppercase mb-5">
                                                        <span className="text-[#0078d4]">TRIAL PLAN</span>
                                                    </div>
                                                )}

                                                <p className="text-[14px] text-[#393a3d] leading-relaxed mb-6">
                                                    {plan.Description}
                                                </p>

                                                <ul className="list-disc pl-5 flex flex-col gap-2 mb-6 text-[#393a3d]">
                                                    {plan.Features.map((feat, idx) => (
                                                        <li key={idx} className="text-[13.5px] leading-relaxed pl-1 marker:text-gray-500">
                                                            {feat}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className="mt-auto pt-6 flex items-end justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] text-gray-500 mb-1">Subscribe for</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-[#b30072] font-semibold text-[26px] leading-none">${Math.floor(plan.Price)}</span>
                                                            <span className="text-[#b30072] font-semibold text-[15px] leading-none relative -top-[8px]">{(plan.Price % 1).toFixed(2).substring(2)}</span>
                                                            <span className="text-[#b30072] text-[16px] font-medium ml-1">/{plan.BillingCycle.toLowerCase()}</span>
                                                        </div>
                                                        <div className="w-[100px] border-b-2 border-dotted border-[#b30072] opacity-30 my-1"></div>
                                                        <span className="text-[12px] text-[#393a3d] mt-1">+applicable taxes</span>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handleSubscribeClick(plan)}
                                                        className="px-6 py-2.5 rounded-sm font-bold text-[14px] transition-colors bg-[#0078d4] text-white hover:bg-[#005a9e] whitespace-nowrap"
                                                    >
                                                        {plan.ButtonText}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* FAQ Section */}
                            <div className="mt-12 bg-[#f8fafc] rounded-[4px] p-8 border border-slate-200">
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
                                    <HelpCircle className="text-[#0078d4]" size={22} />
                                    <h3 className="text-[18px] font-semibold text-slate-800">Frequently Asked Questions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-800 mb-2">How does billing work?</h4>
                                        <p className="text-[13px] text-slate-600 leading-relaxed">You will be billed automatically at the beginning of each billing cycle (monthly or annually). You can manage or cancel your subscription at any time.</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-800 mb-2">Can I switch plans later?</h4>
                                        <p className="text-[13px] text-slate-600 leading-relaxed">Yes, you can upgrade or downgrade your plan at any time. Any prorated charges or credits will be applied automatically to your next invoice.</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-800 mb-2">What payment methods do you accept?</h4>
                                        <p className="text-[13px] text-slate-600 leading-relaxed">We accept all major credit cards, PayPal, and wire transfers for our annual Enterprise plans.</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-800 mb-2">Is there a setup fee?</h4>
                                        <p className="text-[13px] text-slate-600 leading-relaxed">No, there are no hidden fees or setup costs. You only pay the flat rate listed for your selected subscription plan.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Checkout Flow */}
            <SubscriptionCheckoutModal 
                isOpen={showCheckout} 
                onClose={() => setShowCheckout(false)} 
                plan={selectedPlan}
                userData={userData}
            />
        </>
    );
};

export default SubscriptionModal;
