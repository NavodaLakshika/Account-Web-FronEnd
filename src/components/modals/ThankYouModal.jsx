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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#1a1c21]/60 backdrop-blur-[2px]">
            <div className="relative w-full max-w-sm bg-white rounded-[4px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Accent */}
                <div className="h-1 w-full bg-[#0077c5]"></div>
                
                <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#eef6fc] rounded-full flex items-center justify-center mb-5 border border-[#b3d4f5]">
                        <CheckCircle2 size={28} className="text-[#0077c5]" />
                    </div>
                    
                    <h2 className="text-[18px] font-bold text-gray-900 mb-2 tracking-tight">
                        Successfully Logged Out
                    </h2>
                    
                    <p className="text-gray-600 text-[13px] mb-8 leading-relaxed px-2">
                        Thank you for using the ONIMTA Enterprise Suite. You have been securely signed out of your account.
                    </p>

                    <div className="flex flex-col w-full">
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="w-full h-10 flex items-center justify-center gap-2 bg-[#0077c5] hover:bg-[#005a9c] text-white rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
                        >
                            Return to Login <ArrowRight size={15} />
                        </button>
                    </div>
                </div>

                {/* Subtle bottom progress bar */}
                <div className="h-1 w-full bg-gray-100">
                    <div 
                        className="h-full bg-[#0077c5] transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ThankYouModal;
