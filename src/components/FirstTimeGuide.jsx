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
                className="absolute rounded-[12px] ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none transition-all duration-500 ease-in-out bg-blue-500/10"
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
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#2563eb" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="animate-[diagonalBounce_1.2s_infinite] drop-shadow-[0_4px_8px_rgba(37,99,235,0.3)]">
                    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
                </svg>
            </div>

            {/* Professional Solid Light Tooltip */}
            <div 
                className="absolute z-[3010] transition-all duration-500 ease-out pointer-events-auto animate-in fade-in zoom-in-95" 
                style={{ top: tooltipTop, left: tooltipLeft }}
            >
                <div className="relative bg-white rounded-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-200 p-6 min-w-[340px] max-w-[380px]">
                    <h3 className="text-[17px] font-bold text-slate-900 mb-2 flex items-center gap-3">
                        {/* <div className="w-8 h-8 rounded-[3px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-blue-600" strokeWidth={2.5} />
                        </div> */}
                        {step.title}
                    </h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed mt-4 font-medium [&>b]:text-slate-900" dangerouslySetInnerHTML={{ __html: step.text }} />
                    
                    <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 relative z-50 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            {steps.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-blue-600 w-6' : 'bg-slate-200 w-1.5'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleSkip} className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 cursor-pointer pointer-events-auto">
                                Skip
                            </button>
                            {currentStep > 0 && (
                                <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 cursor-pointer pointer-events-auto">
                                    <ChevronLeft size={16} strokeWidth={2.5} className="-ml-0.5" />
                                </button>
                            )}
                            <button onClick={handleNext} className="h-8 px-5 flex items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 text-white hover:bg-blue-700 text-[13px] font-bold transition-all active:scale-95 cursor-pointer pointer-events-auto shadow-sm">
                                {isLast ? 'Done' : 'Next'}
                                {!isLast && <ChevronRight size={16} strokeWidth={2.5} className="-mr-1" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstTimeGuide;
