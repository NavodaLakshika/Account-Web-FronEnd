import React, { useEffect, useState, useRef } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

const WelcomeModal = ({ isOpen, onComplete, user }) => {

    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing secure connection...');
    const [visibleLogs, setVisibleLogs] = useState([]);
    const [greeting, setGreeting] = useState('Welcome');

    const tips = [
        "Ctrl+P: Quickly print financial reports.",
        "Master Files: Manage your vendor categories.",
        "Security: Always log out after your session.",
        "Real-time: Dashboard updates automatically.",
        "Reports: Access monthly audit logs easily.",
        "Shortcut: Press Esc to close any modal."
    ];
    const [tipIndex, setTipIndex] = useState(0);

    const allLogs = [
        `[SYS] Authenticating profile: ${user?.empName || 'USER_ID_NULL'}`,
        '[OK] Authentication successful. RSA-2048 encryption active.',
        '[SYS] Requesting module access privileges...',
        '[OK] Access granted: Master Files, Transactions, Reports.',
        '[SYS] Loading enterprise dashboard environment...',
        '[OK] Environment variables loaded.',
        '[SYS] Synchronizing financial ledgers...',
        '[OK] Ledger sync complete. 0 errors.',
        '[SYS] Finalizing system preparations...'
    ];

    useEffect(() => {
        // Set time-based greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        if (isOpen) {
            const duration = 5000;
            const startTime = Date.now();

            // Tip rotation timer (Changes every 3 seconds)
            const tipTimer = setInterval(() => {
                setTipIndex((prev) => (prev + 1) % tips.length);
            }, 1000);

            const progressTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min(Math.round((elapsed / duration) * 100), 100);
                setProgress(percent);

                if (percent < 30) {
                    setLoadingText('Authenticating user profile...');
                } else if (percent < 60) {
                    setLoadingText('Loading system modules...');
                } else if (percent < 90) {
                    setLoadingText('Preparing your dashboard...');
                } else {
                    setLoadingText('Launch sequence ready.');
                }

                const logsToShow = Math.max(1, Math.ceil((percent / 100) * allLogs.length));
                setVisibleLogs(allLogs.slice(0, logsToShow));

                if (percent >= 100) {
                    clearInterval(progressTimer);
                }
            }, 30);

            const redirectTimer = setTimeout(() => {
                if (onComplete) onComplete();
            }, duration + 300);

            return () => {
                clearInterval(tipTimer);
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
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
            {/* Cinematic Dark Blue Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />


            
            {/* Stylish External Header (Outside Modal) */}
            <div className="relative mb-12 animate-in fade-in slide-in-from-top-8 duration-1000 flex flex-col items-center">
                <div className="absolute -top-6 text-white/5 text-[120px] font-black tracking-[0.3em] uppercase whitespace-nowrap select-none pointer-events-none">
                    ONIMTA
                </div>
                <h1 className="text-white text-[16px] font-black tracking-[1em] uppercase opacity-40 mb-2 relative z-10">
                    System Authentication
                </h1>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Clean Professional Browser Window Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="px-16 py-8 flex flex-row items-center justify-between gap-12 relative">

                    <style>
                        {`
                            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
                        `}
                    </style>
                    
                    {/* Left Section: Welcome Text and Branding */}
                    <div className="flex flex-col items-start text-left flex-1">
                        {/* Dynamic Greeting Header */}
                        <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-700 flex flex-col items-start"> 
                            <h2 className="text-[54px] font-bold text-slate-800 tracking-[4px] leading-none mb-2">
                                {greeting}
                            </h2>
                            <h3 className="text-[32px] font-mono font-bold text-[#00acee] tracking-tight leading-none">
                                {user?.empName || 'User'}
                            </h3>
                        </div>

                        {/* Branding & System Status */}
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
                            <div className="flex items-center gap-3">
                                <img src="/logo-removebg.png" alt="Logo" className="w-6 h-6 object-contain opacity-80" />
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 font-mono tracking-[0.2em] text-[11px] font-black uppercase whitespace-nowrap">Onimta Financial</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-400 font-mono tracking-[0.1em] text-[10px] uppercase whitespace-nowrap">Enterprise System</span>
                                </div>
                            </div>

                            {/* Dynamic Tip of the Day */}
                            <div className="bg-slate-50 border-l-4 border-[#00acee] px-4 py-3 rounded-r-[8px] max-w-[400px] min-h-[70px] flex flex-col justify-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tip of the Day</span>
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed animate-in fade-in duration-500" key={tipIndex}>
                                    "{tips[tipIndex]}"
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Section: Large Circular Loader */}
                    <div className="flex flex-col items-center min-w-[280px] animate-in fade-in slide-in-from-right-4 duration-700 delay-150 relative z-10">
                        <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="circleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#00ff87" />
                                        <stop offset="50%" stopColor="#00acee" />
                                        <stop offset="100%" stopColor="#0284c7" />
                                    </linearGradient>
                                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                <circle cx="50" cy="50" r="40" stroke="url(#circleGradient)" strokeWidth="6" fill="transparent" strokeLinecap="round"
                                    style={{
                                        strokeDasharray: 251.2,
                                        strokeDashoffset: 251.2 - (progress / 100) * 251.2,
                                        transition: 'stroke-dashoffset 0.1s linear'
                                    }}
                                    filter="url(#neonGlow)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[42px] font-bold font-['Outfit',_sans-serif] text-slate-800 tracking-tighter ml-2">
                                    {progress}<span className="text-[24px] text-slate-400 font-medium ml-1">%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Under Bar: Status Path + Live Logs + Performance */}
            <div className="mt-4 w-full max-w-4xl bg-white shadow-[0_4px_25px_rgba(0,0,0,0.1)] border border-slate-200 rounded-[8px] h-12 px-8 flex items-center justify-between relative z-10 overflow-hidden">
                {/* Left: Status Path */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-[#00ff87] shadow-[0_0_8px_#00ff87]' : 'bg-slate-200'} transition-all duration-500`} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${progress > 20 ? 'text-slate-900' : 'text-slate-400'}`}>Security</span>
                    </div>
                    <div className="w-4 h-[1px] bg-slate-100" />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-[#00ff87] shadow-[0_0_8px_#00ff87]' : 'bg-slate-200'} transition-all duration-500`} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${progress > 50 ? 'text-slate-900' : 'text-slate-400'}`}>Database</span>
                    </div>
                    <div className="w-4 h-[1px] bg-slate-100" />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-[#00ff87] shadow-[0_0_8px_#00ff87]' : 'bg-slate-200'} transition-all duration-500`} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${progress > 80 ? 'text-slate-900' : 'text-slate-400'}`}>Modules</span>
                    </div>
                </div>

                {/* Right: Live System Log & Health */}
                <div className="flex items-center gap-8 flex-1 justify-end ml-12 border-l border-slate-100 pl-8">
                    {/* Live Health Badge */}
                    {/* <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Online</span>
                        </div>
                        <div className="w-[1px] h-3 bg-slate-200" />
                        <span className="text-[9px] font-mono text-slate-400">24ms</span>
                    </div> */}

                    <div className="flex flex-col items-end text-right">
                        <p className={`text-[11px] font-mono font-bold tracking-tight truncate max-w-[350px] ${
                            visibleLogs[visibleLogs.length - 1]?.startsWith('[OK]') ? 'text-emerald-600' : 'text-[#00acee]'
                        }`}>
                            {visibleLogs[visibleLogs.length - 1] || 'INITIALIZING SECURE PROTOCOLS...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dedicated White Load Bar (Ultra Low Profile) */}
            <div className="mt-2 w-full max-w-4xl bg-white/20 rounded-full h-1 overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

        </div>
    );
};

export default WelcomeModal;
