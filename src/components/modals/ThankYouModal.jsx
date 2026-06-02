import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const ThankYouModal = ({ isOpen, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Remove user data immediately so they can't cancel out of this state
            const redirectTimer = setTimeout(() => {
                authService.logout();
                localStorage.removeItem('selectedCompany');
                window.location.href = '/login';
            }, 3000);

            // Simple progress bar
            const duration = 3000;
            const startTime = Date.now();
            let animationFrameId;

            const animateProgress = () => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed / duration) * 100, 100);
                setProgress(percent);

                if (percent < 100) {
                    animationFrameId = requestAnimationFrame(animateProgress);
                }
            };

            animationFrameId = requestAnimationFrame(animateProgress);

            return () => {
                cancelAnimationFrame(animationFrameId);
                clearTimeout(redirectTimer);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm font-['Plus_Jakarta_Sans']">
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ">
                {/* Header Pattern / Accent */}
                <div className="h-1.5 w-full bg-blue-600"></div>
                
                <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} className="text-blue-600" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Successfully Logged Out
                    </h2>
                    
                    <p className="text-slate-500 text-[13px] mb-8 leading-relaxed">
                        Thank you for using the Onimta Enterprise Suite. You have been securely signed out of your account.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                        >
                            Return to Login <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Subtle bottom progress bar */}
                <div className="h-1 w-full bg-slate-100">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ThankYouModal;
