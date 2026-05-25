import React, { useEffect, useState, useRef } from 'react';
import { Mail } from 'lucide-react';
import { authService } from '../../services/auth.service';

const ThankYouModal = ({ isOpen, onClose }) => {
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const userData = JSON.parse(localStorage.getItem('user') || 'null');
            setUser(userData);

            if (videoRef.current) {
                videoRef.current.playbackRate = 1.5;
            }

            // Progress percentage animation - 4.5 seconds
            const duration = 4700;
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

            // Final Redirect
            const redirectTimer = setTimeout(() => {
                authService.logout();
                localStorage.removeItem('selectedCompany');
                window.location.href = '/login';
            }, duration);

            return () => {
                cancelAnimationFrame(animationFrameId);
                clearTimeout(redirectTimer);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 font-mono overflow-hidden">
            {/* Minimal Light Backdrop */}
            <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-md" />
            
            {/* Browser Window Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-[15px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-200">
                <div className="p-8 flex flex-col items-center text-center relative">

                    <style>
                        {`
                            @import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
                        `}
                    </style>
                    

                    {/* Thank You Message - Extra Big Script Font Style */}
                    <h2 className="text-[80px] font-['Satisfy',_cursive] text-slate-700 pt-6 mb-4 leading-none">
                        Thank you!
                    </h2>
                    
                    <p className="text-slate-500 font-mono text-sm mb-6 max-w-md leading-relaxed">
                        Thank you for using our Financial System. <br/>
                        We hope you had a productive session with <br/>
                        <span className="font-bold font-mono text-[#0388cc]">Onimta Information Technology Pvt Ltd</span>. <br/>
                        You have been successfully logged out.
                    </p>

                    {/* Single Line Footer Branding - Now above buttons */}
                    <div className="flex items-center gap-3  mb-6 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                        <img src="/logo-removebg.png" alt="Logo" className="w-5 h-5 object-contain" />
                        <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-mono tracking-[0.2em] text-[9px] font-black uppercase whitespace-nowrap">Onimta Financial</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400 font-mono tracking-[0.1em] text-[8px] uppercase whitespace-nowrap">Secure Banking Protocol</span>
                        </div>
                    </div>

                    {/* Action Buttons - Now at the bottom */}
                    <div className="flex gap-4 mb-4">
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="px-8 py-2.5 border border-slate-300 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
                        >
                            Log In Again
                        </button>
                        <button 
                            className="px-8 py-2.5 border border-slate-300 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
                        >
                            Visit Website
                        </button>
                    </div>
                </div>

                {/* All Around Multichromatic Perimeter Loading System */}
                <div className="absolute inset-0 pointer-events-none rounded-[15px] overflow-hidden">
                    {/* Top Bar (0-25%) - Blue */}
                    <div 
                        className="absolute inset-0 border-[6px] border-transparent border-t-[#0388cc] rounded-[15px]" 
                        style={{ 
                            clipPath: `inset(0 ${100 - Math.min(100, Math.max(0, (progress / 25) * 100))}% 0 0)`,
                            filter: 'drop-shadow(0 0 8px rgba(3,136,204,0.6))'
                        }} 
                    />
                    {/* Right Bar (25-50%) - Emerald */}
                    <div 
                        className="absolute inset-0 border-[6px] border-transparent border-r-[#10b981] rounded-[15px]" 
                        style={{ 
                            clipPath: `inset(0 0 ${100 - Math.min(100, Math.max(0, ((progress - 25) / 25) * 100))}% 0)`,
                            filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                        }} 
                    />
                    {/* Bottom Bar (50-75%) - Amber */}
                    <div 
                        className="absolute inset-0 border-[6px] border-transparent border-b-[#f59e0b] rounded-[15px]" 
                        style={{ 
                            clipPath: `inset(0 0 0 ${100 - Math.min(100, Math.max(0, ((progress - 50) / 25) * 100))}%)`,
                            filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))'
                        }} 
                    />
                    {/* Left Bar (75-100%) - Red */}
                    <div 
                        className="absolute inset-0 border-[6px] border-transparent border-l-[#ef4444] rounded-[15px]" 
                        style={{ 
                            clipPath: `inset(${100 - Math.min(100, Math.max(0, ((progress - 75) / 25) * 100))}% 0 0 0)`,
                            filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ThankYouModal;
