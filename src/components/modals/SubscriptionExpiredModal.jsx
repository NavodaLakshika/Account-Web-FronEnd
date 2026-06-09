import React, { useState } from 'react';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import SubscriptionModal from './SubscriptionModal';

const SubscriptionExpiredModal = ({ isOpen, userStatus }) => {
    const [showPlans, setShowPlans] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem('selectedCompany');
        navigate('/login');
    };

    if (!isOpen) return null;

    if (showPlans) {
        return (
            <div className="fixed inset-0 z-[99999]">
                <SubscriptionModal isOpen={true} onClose={() => setShowPlans(false)} />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[999999]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-white bg-slate-800/70 hover:bg-slate-800 px-5 py-2.5 rounded-sm text-sm font-bold transition-colors shadow-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <ShieldAlert className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        {userStatus === 'Trial' ? 'Free Trial Ended' : 'Subscription Expired'}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        {userStatus === 'Trial'
                            ? "Your free trial has ended. Subscribe to continue using all features without interruption."
                            : "Your subscription has expired. Renew now to regain access to your financial workspace."
                        }
                    </p>
                    <button
                        onClick={() => setShowPlans(true)}
                        className="w-full py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white font-bold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                        Subscribe Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpiredModal;
