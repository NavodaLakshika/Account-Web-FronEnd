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

            const progressTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min(Math.round((elapsed / duration) * 100), 100);
                setProgress(percent);

                if (percent >= 100) {
                    clearInterval(progressTimer);
                }
            }, 50);

            // Final Redirect
            const redirectTimer = setTimeout(() => {
                authService.logout();
                localStorage.removeItem('selectedCompany');
                window.location.href = '/login';
            }, duration);

            return () => {
                clearInterval(progressTimer);
                clearTimeout(redirectTimer);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center font-['Outfit'] overflow-hidden">
            {/* Background Video - Exact Match to Auth Page Background Style */}
            <div className="absolute -inset-8 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(4px) brightness(0.5)' }}
                >
                    <source src="/Video/thankyou2.mp4" type="video/mp4" />
                </video>
            </div>
            
            {/* Top Logo Section - Exact Match to Auth Page */}
            <div className="absolute top-8 left-8 flex items-center gap-3 z-10 scale-90">
                <div className="bg-white p-1 rounded-full shadow-lg">
                    <img src="/logo-removebg.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-white text-xs tracking-[0.2em] opacity-70 uppercase font-medium">Onimta Financial System</span>
            </div>

            {/* Main Content Container - Reduced to 75% for a smaller look */}
            <div className="relative z-10 w-full max-w-2xl px-8 py-12 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 scale-75 origin-center">

                <div className="flex flex-col items-center">
                    {/* Big Mail Icon in White with Shadow */}
                    <div className="mb-6">
                        <Mail size={100} strokeWidth={1.5} className="text-white fill-white/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                    </div>

                    {/* Bold Heading */}
                    <h1 className="text-[64px] font-black text-white mb-4 tracking-[0.05em] uppercase leading-none drop-shadow-xl font-['Outfit']">
                        THANK YOU!
                    </h1>

                    {/* Subtext with User Info */}
                    <div className="space-y-4 mb-14">
                        <p className="text-white/60 text-lg font-medium opacity-90 max-w-lg mx-auto leading-relaxed uppercase tracking-widest">
                            You have been successfully logged out
                        </p>
                        <div className="inline-block px-8 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
                            <span className="text-white font-bold tracking-widest uppercase text-sm">
                                Session ended: <span className="text-[#00acee] ml-2">{user?.EmpName || user?.empName || user?.Emp_Name || 'SYSTEM USER'}</span>
                            </span>
                        </div>
                    </div>

                    {/* VINTAGE SEGMENTED LOADING BAR (Matches reference image) */}
                    <div className="w-full max-w-[500px] space-y-5">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-xl font-black text-white/50 tracking-[0.3em] uppercase">Loading</span>
                            <span className="text-xl font-black text-white tabular-nums tracking-tighter">{progress}%</span>
                        </div>

                        {/* Outlined Container */}
                        <div className="w-full h-11 border-[5px] border-white p-1.5 flex items-center gap-1.5 overflow-hidden bg-black/50 backdrop-blur-md shadow-2xl">
                            {/* Segmented blocks */}
                            {[...Array(20)].map((_, i) => {
                                const threshold = (i + 1) * 5;
                                const isActive = progress >= threshold;
                                return (
                                    <div
                                        key={i}
                                        className={`h-full flex-1 transition-all duration-100 ${isActive ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-transparent'}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-20 border-t border-white/5 pt-8 w-full">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.6em] font-['Outfit']">
                            Powered by Onimta Information Technology
                        </p>
                    </div>
                </div>
            </div>
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
            `}</style>
        </div>
    );
};

export default ThankYouModal;
;
