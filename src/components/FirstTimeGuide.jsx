import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const steps = [
    {
        title: "Welcome to Dashboard!",
        text: 'This is your <b>Main Navigation Bar</b>. You can access all primary modules like Master File, Transactions, and Reports from here.',
        find: () => document.querySelector('[data-tour="main-menu"]'),
        onEnter: null,
        position: 'bottom'
    },
    {
        title: "Quick Access",
        text: 'Use the <b>Quick Launch Grid</b> for rapid access to commonly used features like Customers, Bills, and Accounts.',
        find: () => document.querySelector('[data-tour="quick-launch"]'),
        onEnter: null,
        position: 'top'
    },
    {
        title: "Global Search",
        text: 'Looking for a specific document or record? The <b>Search System</b> helps you find anything instantly.',
        find: () => document.querySelector('[data-tour="global-search"]'),
        onEnter: null,
        position: 'bottom'
    },
    {
        title: "Share Your Feedback",
        text: 'Use the <b>Rate System</b> to share your experience or report any issues directly to the admins.',
        find: () => document.querySelector('[data-tour="rate-system"]'),
        onEnter: null,
        position: 'bottom'
    },
    {
        title: "Meet Your AI Assistant",
        text: 'Need help or want to automate tasks? Click the <b>AI Chatbot</b> to interact with your intelligent assistant!',
        find: () => document.querySelector('[data-tour="ai-chatbot"]'),
        onEnter: null,
        position: 'top'
    }
];

const FirstTimeGuide = ({ isOpen, onClose, user }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState(null);
    const retryRef = useRef(null);
    const userId = user?.EmpCode || user?.empCode || user?.emp_Code || user?.id_No || user?.Id_No || user?.IdNo || user?.username || user?.EmpName || 'unknown';
    const onboardKey = `onboardingDone_${userId}`;

    const findTarget = useCallback(() => {
        const step = steps[currentStep];
        if (!step) return null;
        return step.find();
    }, [currentStep]);

    const refreshRect = useCallback(() => {
        const el = findTarget();
        if (el) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
                setRect(r);
                return true;
            }
        }
        setRect(null);
        return false;
    }, [findTarget]);

    // On step change or mount, refresh rect
    useEffect(() => {
        if (!isOpen) return;

        // Try immediately, then retry a few times
        if (!refreshRect()) {
            let tries = 0;
            const tryFind = () => {
                tries++;
                if (refreshRect()) return;
                if (tries < 15) retryRef.current = setTimeout(tryFind, 300);
            };
            retryRef.current = setTimeout(tryFind, 200);
        }

        return () => {
            if (retryRef.current) clearTimeout(retryRef.current);
        };
    }, [isOpen, currentStep, refreshRect]);

    // Scroll to element
    useEffect(() => {
        if (!isOpen || !rect) return;
        const el = findTarget();
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [isOpen, rect, findTarget]);

    // Re-observe on DOM changes
    useEffect(() => {
        if (!isOpen) return;
        const observer = new MutationObserver(() => refreshRect());
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [isOpen, refreshRect]);

    // Re-calculate on resize
    useEffect(() => {
        if (!isOpen) return;
        const onResize = () => refreshRect();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [isOpen, refreshRect]);

    if (!isOpen || !rect) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLast) {
            localStorage.setItem(onboardKey, 'true');
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
            setRect(null);
        }
    };

    const handleSkip = () => {
        localStorage.setItem(onboardKey, 'true');
        onClose();
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setRect(null);
    };

    // Calculate Tooltip Position
    let tooltipTop = rect.bottom + 20;
    let tooltipLeft = rect.left + (rect.width / 2) - 170; // Center tooltip
    
    // Boundary checks
    if (tooltipLeft < 20) tooltipLeft = 20;
    if (tooltipLeft + 360 > window.innerWidth) tooltipLeft = window.innerWidth - 380;
    
    if (step.position === 'top' || tooltipTop + 200 > window.innerHeight) {
        tooltipTop = rect.top - 200; // Place above
        if (tooltipTop < 20) tooltipTop = rect.bottom + 20; // Revert if too high
    }

    // Cursor position (pointing top-left from the bottom-right of the target)
    const cursorX = rect.left + (rect.width / 2) + 20;
    const cursorY = rect.top + (rect.height / 2) + 20;

    return (
        <div className="fixed inset-0 z-[3000]">
            {/* Dark overlay backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-500" />

            {/* Highlight glow ring around target element */}
            <div
                className="absolute rounded-xl border-2 border-[#00acee] shadow-[0_0_25px_rgba(0,172,238,0.5)] animate-pulse pointer-events-none transition-all duration-500 ease-in-out"
                style={{
                    left: rect.left - 8,
                    top: rect.top - 8,
                    width: rect.width + 16,
                    height: rect.height + 16
                }}
            />

            {/* Cursor hand - Custom Diagonal Pointer */}
            <div
                className="absolute pointer-events-none z-[3020] transition-all duration-500 ease-out"
                style={{
                    left: cursorX,
                    top: cursorY,
                }}
            >
                <style>{`
                    @keyframes diagonalBounce {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(-10px, -10px); }
                    }
                `}</style>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[diagonalBounce_1.2s_infinite] drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
                </svg>
            </div>

            {/* Premium Glassmorphic Tooltip */}
            <div 
                className="absolute z-[3010] transition-all duration-500 ease-out pointer-events-auto animate-in fade-in zoom-in-95" 
                style={{ top: tooltipTop, left: tooltipLeft }}
            >
                <div className="bg-[#0f172a]/85 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] border border-white/10 p-6 min-w-[340px] max-w-[400px]">
                    {/* Decorative subtle gradient glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-[#00acee]/40 to-purple-500/40 rounded-2xl opacity-20 pointer-events-none" />
                    
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#00acee]/20 text-[#00acee]">
                            <Sparkles size={16} strokeWidth={2.5} />
                        </div>
                        {step.title}
                    </h3>
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium mt-3" dangerouslySetInnerHTML={{ __html: step.text }} />
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 relative z-10">
                        <div className="flex items-center gap-1.5">
                            {steps.map((_, idx) => (
 <div key={idx} className={`h-1.5 rounded-sm transition-all duration-300 ${idx === currentStep ? 'bg-gradient-to-r from-[#00acee] to-blue-500 w-5 shadow-[0_0_8px_rgba(0,172,238,0.6)]' : idx < currentStep ? 'bg-white/40 w-1.5' : 'bg-white/10 w-1.5'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleSkip} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all hover:bg-white/5 active:scale-95">
                                Skip
                            </button>
                            {currentStep > 0 && (
                                <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 active:scale-95">
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                            )}
                            <button onClick={handleNext} className="h-8 px-4 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00acee] to-[#0082b3] text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,172,238,0.4)] hover:shadow-[0_0_25px_rgba(0,172,238,0.6)] active:scale-95 border border-white/10">
                                {isLast ? 'Done' : 'Next'}
                                {!isLast && <ChevronRight size={14} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstTimeGuide;
