import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, 
    ShoppingBag, 
    Cloud, 
    CreditCard, 
    Sparkles, 
    ChevronLeft, 
    ChevronRight, 
    ChevronDown, 
    ChevronUp, 
    X, 
    ArrowRight, 
    Maximize2,
    Clock,
    Tag,
    ShieldCheck
} from 'lucide-react';

const ADS = [
    {
        id: 'ad-1',
        theme: 'blue',
        tag: 'SPECIAL PROMO',
        title: 'Save 50% on Enterprise ERP & Multi-Tenant Accounting',
        desc: 'Unlock unlimited companies, advanced ledger consolidation, and role authorizations at 50% off.',
        icon: Zap,
        code: 'ONIMTA50',
        badgeColor: 'bg-blue-50 text-[#0078d4] border border-blue-200',
        accentColor: '#0078d4',
        btnBg: 'bg-[#0078d4] hover:bg-[#005a9e]',
        dealPrice: '$49.50/mo',
        highlight: 'Save 50% First 3 Months'
    },
    {
        id: 'ad-2',
        theme: 'green',
        tag: 'NEW ADD-ON',
        title: 'Real-time E-Commerce & POS Hardware Sync Live',
        desc: 'Connect Shopify, WooCommerce, and thermal billing printers directly to your inventory ledgers.',
        icon: ShoppingBag,
        code: 'SYNCPRO',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        accentColor: '#059669',
        btnBg: 'bg-[#059669] hover:bg-[#047857]',
        dealPrice: 'From $24.50/mo',
        highlight: 'Instant 2-Way Sync'
    },
    {
        id: 'ad-3',
        theme: 'blue',
        tag: 'FREE PERK',
        title: '100GB Free Automated Daily Cloud Database Backups',
        desc: 'AES-256 encrypted disaster recovery snapshots for all active tenants. Zero data loss guarantee.',
        icon: Cloud,
        code: 'VAULT100',
        badgeColor: 'bg-blue-50 text-[#0284c7] border border-blue-200',
        accentColor: '#0284c7',
        btnBg: 'bg-[#0284c7] hover:bg-[#0369a1]',
        dealPrice: 'FREE with Enterprise',
        highlight: 'Nightly Auto Backups'
    },
    {
        id: 'ad-4',
        theme: 'green',
        tag: 'PAYMENT PACK',
        title: 'Zero Merchant Gateway Setup Fees on All Invoicing',
        desc: 'Accept Visa, MasterCard, and dynamic QR payments on your PDF invoices with instant bank deposits.',
        icon: CreditCard,
        code: 'ZEROFEE',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        accentColor: '#047857',
        btnBg: 'bg-[#047857] hover:bg-[#065f46]',
        dealPrice: '0% Setup Fee',
        highlight: 'One-Click Invoicing'
    },
    {
        id: 'ad-5',
        theme: 'blue',
        tag: 'GLOBAL SUITE',
        title: 'Free Multi-Branch & Multi-Currency Pack with Pro Upgrades',
        desc: 'Real-time central bank foreign exchange feeds with automated unrealized FX gain and loss calculation.',
        icon: Sparkles,
        code: 'GLOBALPRO',
        badgeColor: 'bg-blue-50 text-[#0066b8] border border-blue-200',
        accentColor: '#0066b8',
        btnBg: 'bg-[#0066b8] hover:bg-[#004e8c]',
        dealPrice: '$15.00/mo',
        highlight: 'Live Central FX'
    }
];

const ROTATION_INTERVAL = 6000; // 6 seconds per ad

const DashboardBottomAdsStrip = ({ onOpenDealsModal }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAutoHidden, setIsAutoHidden] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef(null);
    const progressTimerRef = useRef(null);

    const nextAd = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % ADS.length);
            setAnimating(false);
            setProgress(0);
        }, 180);
    };

    const prevAd = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + ADS.length) % ADS.length);
            setAnimating(false);
            setProgress(0);
        }, 180);
    };

    // Auto rotate ads and drive smooth progress bar
    useEffect(() => {
        if (isPaused || isAutoHidden || isDismissed) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            return;
        }

        const stepMs = 50;
        const totalSteps = ROTATION_INTERVAL / stepMs;
        let step = (progress / 100) * totalSteps;

        progressTimerRef.current = setInterval(() => {
            step += 1;
            const newProgress = Math.min((step / totalSteps) * 100, 100);
            setProgress(newProgress);

            if (step >= totalSteps) {
                step = 0;
                nextAd();
            }
        }, stepMs);

        return () => {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        };
    }, [isPaused, isAutoHidden, isDismissed, currentIndex]);

    if (isDismissed) return null;

    const currentAd = ADS[currentIndex];
    const IconComponent = currentAd.icon;

    // When collapsed / auto-hidden: show sleek, compact animated bottom pill
    if (isAutoHidden) {
        return (
            <div className="w-full bg-white border-t border-b border-[#eceef1] px-4 py-1.5 flex items-center justify-between gap-3 text-xs transition-all duration-300 animate-in fade-in">
                <div 
                    onClick={() => {
                        setIsAutoHidden(false);
                        if (onOpenDealsModal) onOpenDealsModal();
                    }}
                    className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
                    title="Click to view all deals & add-ons"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-[#0078d4] text-[11px] group-hover:underline truncate">
                        Exclusive Deals Available:
                    </span>
                    <span className="text-slate-600 font-medium text-[11px] truncate hidden sm:inline">
                        {currentAd.title}
                    </span>
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                        {currentAd.highlight}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => {
                            if (onOpenDealsModal) onOpenDealsModal();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0078d4] hover:text-[#005a9e] px-2 py-0.5 rounded hover:bg-blue-50 transition-all"
                        title="Popup full deals modal"
                    >
                        <span>View Deals</span>
                        <Maximize2 size={11} />
                    </button>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <button
                        onClick={() => setIsAutoHidden(false)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-bold text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Expand ads strip"
                    >
                        <ChevronUp size={14} />
                        <span className="hidden md:inline">Expand</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="w-full bg-gradient-to-r from-white via-[#f8fafc] to-white border-t border-b border-[#eceef1] shadow-xs relative overflow-hidden transition-all duration-300"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Animated top progress bar showing time to next rotation */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-slate-100 overflow-hidden">
                <div 
                    className="h-full transition-all duration-100 ease-linear"
                    style={{ 
                        width: `${progress}%`,
                        backgroundColor: currentAd.accentColor
                    }}
                />
            </div>

            {/* Main Content Strip */}
            <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
                
                {/* Left: Previous Navigation Arrow */}
                <button
                    onClick={prevAd}
                    className="w-7 h-7 rounded-[3px] border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-xs transition-all active:scale-95 shrink-0"
                    title="Previous announcement"
                    aria-label="Previous announcement"
                >
                    <ChevronLeft size={15} />
                </button>

                {/* Center: Animated Ad Details (Clicking pops up the full deals page) */}
                <div 
                    onClick={() => {
                        if (onOpenDealsModal) onOpenDealsModal();
                    }}
                    className={`flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 min-w-0 cursor-pointer group transition-all duration-200 ${
                        animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
                    }`}
                    title="Click to popup full deals page"
                >
                    {/* Brand Icon & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Animated Icon Box with pulsing glow */}
                        <div 
                            className="w-8 h-8 rounded-[4px] flex items-center justify-center text-white shadow-xs shrink-0 transition-transform group-hover:scale-105 duration-200 relative"
                            style={{ backgroundColor: currentAd.accentColor }}
                        >
                            <IconComponent size={16} />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/90"></span>
                            </span>
                        </div>

                        {/* Title & Description */}
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`px-1.5 py-0.2 rounded-[2px] text-[8.5px] font-black uppercase tracking-wider shrink-0 ${currentAd.badgeColor}`}>
                                    {currentAd.tag}
                                </span>
                                <h4 className="text-[12.5px] sm:text-[13px] font-bold text-[#393a3d] group-hover:text-[#0078d4] transition-colors truncate">
                                    {currentAd.title}
                                </h4>
                            </div>
                            <p className="text-[11px] text-[#6b6c72] truncate mt-0.5 hidden sm:block">
                                {currentAd.desc}
                            </p>
                        </div>
                    </div>

                    {/* Middle Tag & Promo Code */}
                    <div className="flex items-center gap-2 shrink-0">
                        {currentAd.code && (
                            <div className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                                <Tag size={10} className="text-[#0078d4]" />
                                <span>CODE: {currentAd.code}</span>
                            </div>
                        )}
                        <span className="text-[11px] font-extrabold text-[#393a3d] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                            {currentAd.dealPrice}
                        </span>
                    </div>

                    {/* Right: CTA Button that auto pops up that page */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenDealsModal) onOpenDealsModal();
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-white font-bold text-[11px] rounded-[3px] shadow-xs hover:shadow transition-all active:scale-95 uppercase tracking-wider ${currentAd.btnBg}`}
                        >
                            <span>Explore Deal</span>
                            <ArrowRight size={11} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Next Navigation Arrow */}
                <button
                    onClick={nextAd}
                    className="w-7 h-7 rounded-[3px] border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-xs transition-all active:scale-95 shrink-0"
                    title="Next announcement"
                    aria-label="Next announcement"
                >
                    <ChevronRight size={15} />
                </button>

                {/* Rightmost Controls: Slide Indicators + Auto-Hide Toggle + Close */}
                <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-200">
                    {/* Indicators */}
                    <div className="hidden lg:flex items-center gap-1">
                        {ADS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setProgress(0);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    currentIndex === idx ? 'w-3.5 bg-[#0078d4]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                                }`}
                                aria-label={`Go to deal ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Auto-Hide / Collapse button */}
                    <button
                        onClick={() => setIsAutoHidden(true)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Auto-hide / Minimize banner"
                        aria-label="Minimize banner"
                    >
                        <ChevronDown size={15} />
                    </button>

                    {/* Close / Dismiss */}
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Dismiss banner"
                        aria-label="Dismiss banner"
                    >
                        <X size={15} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DashboardBottomAdsStrip;
