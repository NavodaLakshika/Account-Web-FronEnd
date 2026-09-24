import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { LogOut, Loader2 } from 'lucide-react';

const ThankYouModal = ({ isOpen, onClose }) => {
    const [secondsLeft, setSecondsLeft] = useState(3);

    const performLogout = () => {
        try {
            if (authService && typeof authService.logout === 'function') {
                authService.logout();
            }
        } catch (e) {
            console.error('Logout error:', e);
        }
        try {
            sessionStorage.clear();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('selectedCompany');
            localStorage.removeItem('company');
        } catch (e) {
            console.error('Storage clear error:', e);
        }
    };

    const handleLoginNow = () => {
        performLogout();
        window.location.href = '/login';
    };

    useEffect(() => {
        if (!isOpen) return;

        performLogout();
        setSecondsLeft(3);

        const countdownInterval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
        }, 1000);

        const redirectTimer = setTimeout(() => {
            handleLoginNow();
        }, 3000);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimer);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
            
            <div className="relative w-[600px] bg-white shadow-[0_10px_40px_rgb(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Colored Area */}
                <div className="relative bg-[#0285fd] overflow-hidden w-full flex flex-col py-6">
                    
                    {/* Background Huge Icon */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center opacity-[0.08]">
                        <LogOut size={240} className="text-black transform -translate-x-4" strokeWidth={1} />
                    </div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 px-6">
                        {/* Header */}
                        <div className="pb-2 border-b border-black/10 flex justify-between items-center">
                            <h3 className="text-[15px] font-mono font-bold text-white uppercase tracking-widest">Sign Out Successful</h3>
                        </div>
                        
                        {/* Content */}
                        <div className="pt-3 pb-2">
                            <p className="text-white/95 text-[22px] font-black tracking-widest uppercase mb-1">
                                Thank You
                            </p>
                            <p className="text-white/80 text-[14px] leading-relaxed font-sans max-w-3xl">
                                You have been securely logged out of the system.<br/>
                                Redirecting you to the login page momentarily...
                            </p>
                        </div>
                    </div>
                </div>

                {/* White Footer Area */}
                <div className="bg-white py-4 w-full flex relative z-10">
                    <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center gap-6">
                        
                        {/* Hardware-Accelerated Progress Bar Container */}
                        <div className="flex-1 flex items-center gap-3">
                            <Loader2 size={18} className="text-[#0285fd] animate-spin shrink-0" />
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-[#0285fd] rounded-full origin-left w-full"
                                    style={{
                                        animation: 'thankYouProgress 3s linear forwards',
                                        transformOrigin: 'left center',
                                        willChange: 'transform'
                                    }} 
                                />
                            </div>
                            <span className="text-[12px] font-mono font-bold text-slate-400 shrink-0 min-w-[28px] text-right">
                                {secondsLeft}s
                            </span>
                        </div>

                        <button 
                            onClick={handleLoginNow}
                            className="px-8 py-2.5 bg-[#0285fd] text-white font-medium rounded-[3px] hover:bg-[#0073ff] transition-all text-[13px] uppercase flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer active:scale-95"
                        >
                            Login Now
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes thankYouProgress {
                    0% {
                        transform: scaleX(0);
                    }
                    100% {
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ThankYouModal;
