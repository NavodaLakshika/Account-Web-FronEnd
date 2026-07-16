import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { LogOut } from 'lucide-react';

const ThankYouModal = ({ isOpen, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const redirectTimer = setTimeout(() => {
                authService.logout();
                localStorage.removeItem('selectedCompany');
                window.location.href = '/login';
            }, 3200);

            const duration = 3200;
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
            
            <div className="relative w-[600px] bg-white shadow-[0_10px_40px_rgb(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Colored Area */}
                <div className={`relative bg-[#0285fd] overflow-hidden w-full flex flex-col py-6`}>
                    
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
                        
                        {/* Progress Bar */}
                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#0285fd] transition-all duration-100 ease-linear" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>

                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="px-8 py-2.5 bg-[#0285fd] text-white font-medium rounded-[3px] hover:bg-[#0073ff] transition-all text-[13px] uppercase flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                        >
                            Login Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThankYouModal;
