import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

const WelcomeModal = ({ isOpen, onComplete, user }) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing secure connection...');
    const [greeting, setGreeting] = useState('Welcome');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        if (isOpen) {
            const duration = 2500; // Fast web feel
            const startTime = Date.now();

            const progressTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min(Math.round((elapsed / duration) * 100), 100);
                setProgress(percent);

                if (percent < 40) {
                    setLoadingText('Authenticating user profile...');
                } else if (percent < 80) {
                    setLoadingText('Loading your dashboard...');
                } else {
                    setLoadingText('Ready to go.');
                }

                if (percent >= 100) {
                    clearInterval(progressTimer);
                }
            }, 30);

            const redirectTimer = setTimeout(() => {
                if (onComplete) onComplete();
            }, duration + 300);

            return () => {
                clearInterval(progressTimer);
                clearTimeout(redirectTimer);
            };
        } else {
            setProgress(0);
            setLoadingText('Initializing secure connection...');
        }
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 font-['Arial'] overflow-hidden">
            {/* Clean, frosted glass overlay */}
            <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" />
            
            {/* Minimalist Web Modal */}
            <div className="relative w-full max-w-sm bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8 flex flex-col items-center text-center">
                
                {/* Modern Loader / Success Icon */}
                <div className="mb-6 relative flex items-center justify-center">
                    {progress < 100 ? (
                        <div className="relative">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                                <circle cx="50" cy="50" r="45" stroke="#00acee" strokeWidth="6" fill="transparent" strokeLinecap="round"
                                    style={{
                                        strokeDasharray: 282.7,
                                        strokeDashoffset: 282.7 - (progress / 100) * 282.7,
                                        transition: 'stroke-dashoffset 0.1s linear'
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-slate-800 font-bold font-mono text-sm">{progress}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center animate-in zoom-in duration-300">
                            <CheckCircle2 size={48} className="text-[#00acee]" />
                        </div>
                    )}
                </div>

                {/* Clean Welcome Text */}
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                    {greeting},
                </h2>
                <h3 className="text-lg font-bold text-[#00acee] mb-6">
                    {user?.empName || 'User'}
                </h3>

                {/* Simple Web Status Box */}
                <div className="w-full bg-slate-50 rounded-none p-3 border border-slate-100 flex items-center justify-center gap-3">
                    {progress < 100 && <Loader2 size={16} className="text-[#00acee] animate-spin" />}
                    <p className="text-sm font-bold text-slate-500">
                        {loadingText}
                    </p>
                </div>

                {/* Subtle Branding */}
                <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
                    <img src="/logo-removebg.png" alt="Onimta" className="w-5 h-5 object-contain" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Onimta Financial</span>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
