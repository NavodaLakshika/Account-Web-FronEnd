import React, { useState, useEffect } from 'react';
import AIAsterisk from './AIAsterisk';

const ThinkingProcess = () => {
    const allSteps = [
        "Analysing your request...",
        "Analysing system context...",
        "Finding the best path...",
        "Formulating the answer..."
    ];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < allSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 800);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <AIAsterisk size={16} isThinking={true} />
                </div>
                <span className="text-[14px] font-semibold text-slate-700">Working...</span>
            </div>
            
            <div className="ml-4 pl-5 border-l-[1.5px] border-slate-200 flex flex-col gap-2.5 py-1">
                {allSteps.slice(0, currentStep + 1).map((step, idx) => (
                    <div 
                        key={idx} 
                        className={`text-[13px] animate-in fade-in slide-in-from-top-1 ${idx === currentStep ? 'text-slate-700' : 'text-slate-400'}`}
                    >
                        {step}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThinkingProcess;
