import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const steps = [
    {
        text: 'Start by clicking <b>Master File</b> in the top menu bar to begin setting up your system.',
        find: () => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).find(b => b.textContent?.trim() === 'Master File');
        },
        onEnter: null
    },
    {
        text: 'Here is the <b>Master File</b> menu. This is where all your core configurations live.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return modal.querySelector('.bg-white') || modal;
        },
        onEnter: 'openMasterFile'
    },
    {
        text: 'Click <b>Cost Center Master</b> to define cost centers for tracking expenses.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Cost Center Master');
        },
        onEnter: null
    },
    {
        text: 'Select <b>Create Department</b> to organize your business departments.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Create Department');
        },
        onEnter: null
    },
    {
        text: 'Click <b>Supplier Master</b> to add your suppliers and vendor information.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Supplier Master');
        },
        onEnter: null
    },
    {
        text: 'Use <b>Chart of Accountant</b> to build your accounts — income, expenses, assets, and liabilities.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Chart of Accountant');
        },
        onEnter: null
    },
    {
        text: 'Go to <b>User Profile Maintenance</b> to add employee profiles with roles and permissions.',
        find: () => {
            const modal = document.querySelector('[class*="z-[200]"]');
            if (!modal) return null;
            return Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'User Profile Maintenance');
        },
        onEnter: null
    }
];

const FirstTimeGuide = ({ isOpen, onClose, onOpenMasterFile, onCloseMasterFile, user }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
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

    // On step change or mount, refresh rect and handle onEnter
    useEffect(() => {
        if (!isOpen) return;

        const step = steps[currentStep];

        // Handle auto-open on step 2 (index 1)
        if (step?.onEnter === 'openMasterFile' && !modalOpen) {
            setModalOpen(true);
            onOpenMasterFile();
            // Retry finding modal content after delay
            setTimeout(() => refreshRect(), 500);
            return;
        }

        // Try immediately, then retry a few times
        if (!refreshRect()) {
            let tries = 0;
            const tryFind = () => {
                tries++;
                if (refreshRect()) return;
                if (tries < 10) retryRef.current = setTimeout(tryFind, 300);
            };
            retryRef.current = setTimeout(tryFind, 200);
        }

        return () => {
            if (retryRef.current) clearTimeout(retryRef.current);
        };
    }, [isOpen, currentStep, modalOpen, onOpenMasterFile, refreshRect]);

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
            if (modalOpen) onCloseMasterFile();
            localStorage.setItem(onboardKey, 'true');
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
            setRect(null);
        }
    };

    const handleSkip = () => {
        if (modalOpen) onCloseMasterFile();
        localStorage.setItem(onboardKey, 'true');
        onClose();
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setRect(null);
    };

    const cx = rect.left + rect.width / 2;

    return (
        <div className="fixed inset-0 z-[3000]">
            <div className="absolute inset-0 bg-slate-900/10" />

            {/* Highlight glow */}
            <div
                className="absolute rounded-lg border-2 border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.4)] animate-pulse pointer-events-none"
                style={{
                    left: rect.left - 6,
                    top: rect.top - 6,
                    width: rect.width + 12,
                    height: rect.height + 12
                }}
            />

            {/* Cursor hand - Tap/Click Gesture Icon pointing down */}
            <div
                className="absolute pointer-events-none animate-bounce"
                style={{
                    left: cx - 18,
                    top: rect.top - 68
                }}
            >
                <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="handShadow" x="-10%" y="-10%" width="120%" height="130%">
                            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
                        </filter>
                    </defs>
                    <g filter="url(#handShadow)">
                        {/* Wrist/arm */}
                        <rect x="16" y="1" width="12" height="18" rx="5" fill="white" stroke="#6366f1" strokeWidth="2" />
                        {/* Palm */}
                        <rect x="6" y="16" width="28" height="20" rx="8" fill="white" stroke="#6366f1" strokeWidth="2" />
                        {/* Thumb */}
                        <rect x="30" y="20" width="12" height="7" rx="3.5" transform="rotate(-30 30 20)" fill="white" stroke="#6366f1" strokeWidth="2" />
                        {/* Index finger (extended down) */}
                        <rect x="12" y="34" width="10" height="20" rx="5" fill="white" stroke="#6366f1" strokeWidth="2" />
                        {/* Middle finger (curled) */}
                        <rect x="22" y="34" width="8" height="14" rx="4" fill="white" stroke="#6366f1" strokeWidth="2" />
                        {/* Ring finger (curled more) */}
                        <path d="M4 34 L4 30 L7 34Z" fill="white" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
                        {/* Pinky (curled most) */}
                        <path d="M4 28 L4 24 L8 28Z" fill="white" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
                        {/* Knuckle details */}
                        <line x1="14" y1="20" x2="14" y2="26" stroke="#6366f1" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                        <line x1="24" y1="20" x2="24" y2="26" stroke="#6366f1" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                    </g>
                    {/* Tap ripple at fingertip */}
                    <circle cx="17" cy="56" r="3" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.8">
                        <animate attributeName="r" values="3;12" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="17" cy="56" r="2.5" fill="#6366f1" />
                </svg>
            </div>

            {/* Tooltip at top-left */}
            <div className="fixed top-20 left-6 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-300" style={{ maxWidth: 'calc(100vw - 48px)' }}>
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 py-3.5 min-w-[340px] max-w-[440px]">
                    <p className="text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.text }} />
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            {steps.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentStep ? 'bg-indigo-500 w-3' : idx < currentStep ? 'bg-indigo-300' : 'bg-slate-300'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={handleSkip} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded transition-all">
                                Skip
                            </button>
                            {currentStep > 0 && (
                                <button onClick={handleBack} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                    <ChevronLeft size={14} />
                                </button>
                            )}
                            <button onClick={handleNext} className="w-6 h-6 flex items-center justify-center rounded bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstTimeGuide;
