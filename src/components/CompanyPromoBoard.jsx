import React, { useState, useEffect, useMemo } from 'react';
import { Database, Layout, Cpu, Globe, X, ChevronRight, Sparkles } from 'lucide-react';

const ads = [
    {
        title: 'Merit Plus Finance',
        desc: 'Cloud-native accounting platform with real-time multi-company reporting.',
        icon: Database,
        accent: '#3b82f6',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500'
    },
    {
        title: 'Web Solutions',
        desc: 'High-performance ERP for textile manufacturing and restaurant chains.',
        icon: Layout,
        accent: '#059669',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-500'
    },
    {
        title: 'AI Platform',
        desc: 'Predictive analytics and intelligent automation for data-driven growth.',
        icon: Cpu,
        accent: '#7c3aed',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-500'
    },
    {
        title: 'ONIMTA Technology',
        desc: 'Enterprise software solutions — EST. 2013, Lake Road, Maharagama.',
        icon: Globe,
        accent: '#78716c',
        bg: 'bg-stone-50',
        border: 'border-stone-200',
        iconBg: 'bg-stone-500'
    }
];

const CompanyPromoBoard = ({ isOpen, onClose }) => {
    const adIndex = useMemo(() => Math.floor(Math.random() * ads.length), []);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onClose, 400);
        }, 8000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const ad = ads[adIndex];
    const Icon = ad.icon;

    return (
        <div className="fixed bottom-24 left-6 z-[2060] w-full max-w-sm">
            <div className={`transition-all duration-400 ease-in-out ${exiting ? 'opacity-0 -translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}>
                <div className={`bg-white rounded-xl shadow-lg border ${ad.border} overflow-hidden`}>
                    {/* Top accent bar */}
                    <div className="h-1 w-full" style={{ backgroundColor: ad.accent }} />

                    <div className="px-4 py-3.5">
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg ${ad.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                                <Icon size={15} className="text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-800">{ad.title}</h3>
                                    <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all shrink-0">
                                        <X size={11} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{ad.desc}</p>
                                <div className="flex items-center gap-2 mt-2.5">
                                    <a href="https://www.onimta.com" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wider hover:underline flex items-center gap-1" style={{ color: ad.accent }}>
                                        Learn more <ChevronRight size={10} />
                                    </a>
                                    <div className="h-3 w-px bg-slate-200" />
                                    <span className="text-[9px] font-medium text-slate-400">Sponsored</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-[2px] bg-slate-100">
                        <div className="h-full rounded-full" style={{ backgroundColor: ad.accent, width: '100%', animation: 'adProgress 8s linear' }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes adProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default CompanyPromoBoard;
