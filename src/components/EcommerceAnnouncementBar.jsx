import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, 
    Gift, 
    ShoppingBag, 
    Cloud, 
    CreditCard, 
    Tag, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    ArrowRight,
    Sparkles,
    Flame
} from 'lucide-react';

const DEALS = [
    {
        id: 'deal-1',
        theme: 'blue',
        tag: 'SPECIAL OFFER',
        icon: Zap,
        title: 'Save 50% for 3 Months on Enterprise Annual Plan',
        code: 'ONIMTA50',
        cta: 'Claim 50% Off',
        actionType: 'pricing',
        bg: 'bg-[#0078d4]',
        badgeBg: 'bg-white text-[#0078d4]',
        iconColor: 'text-[#0078d4]',
        codeBg: 'bg-[#005a9e] border border-blue-200/40 text-white',
        codeIcon: 'text-blue-200',
        ctaBg: 'bg-white text-[#0078d4] hover:bg-blue-50'
    },
    {
        id: 'deal-2',
        theme: 'green',
        tag: 'NEW RELEASE',
        icon: ShoppingBag,
        title: 'Real-time POS & E-Commerce Integration Module Live',
        code: 'SYNCPRO',
        cta: 'Explore Add-on',
        actionType: 'pricing',
        bg: 'bg-[#059669]',
        badgeBg: 'bg-white text-[#059669]',
        iconColor: 'text-[#059669]',
        codeBg: 'bg-[#046a47] border border-emerald-200/40 text-white',
        codeIcon: 'text-emerald-200',
        ctaBg: 'bg-white text-[#059669] hover:bg-emerald-50'
    },
    {
        id: 'deal-3',
        theme: 'blue',
        tag: 'CLOUD PERK',
        icon: Cloud,
        title: '100GB Free Automated Daily Cloud Database Backups',
        code: 'VAULT100',
        cta: 'Activate Free',
        actionType: 'pricing',
        bg: 'bg-[#0284c7]',
        badgeBg: 'bg-white text-[#0284c7]',
        iconColor: 'text-[#0284c7]',
        codeBg: 'bg-[#0369a1] border border-sky-200/40 text-white',
        codeIcon: 'text-sky-200',
        ctaBg: 'bg-white text-[#0284c7] hover:bg-sky-50'
    },
    {
        id: 'deal-4',
        theme: 'green',
        tag: 'PAYMENT PACK',
        icon: CreditCard,
        title: 'Zero Merchant Gateway Setup Fees on All Billing Channels',
        code: 'ZEROFEE',
        cta: 'View Terminal',
        actionType: 'pricing',
        bg: 'bg-[#047857]',
        badgeBg: 'bg-white text-[#047857]',
        iconColor: 'text-[#047857]',
        codeBg: 'bg-[#064e3b] border border-emerald-200/40 text-white',
        codeIcon: 'text-emerald-200',
        ctaBg: 'bg-white text-[#047857] hover:bg-emerald-50'
    },
    {
        id: 'deal-5',
        theme: 'blue',
        tag: 'GLOBAL SUITE',
        icon: Sparkles,
        title: 'Free Multi-Branch & Multi-Currency Pack with Pro Upgrades',
        code: 'GLOBALPRO',
        cta: 'Upgrade Plan',
        actionType: 'pricing',
        bg: 'bg-[#0066b8]',
        badgeBg: 'bg-white text-[#0066b8]',
        iconColor: 'text-[#0066b8]',
        codeBg: 'bg-[#004e8c] border border-blue-200/40 text-white',
        codeIcon: 'text-blue-200',
        ctaBg: 'bg-white text-[#0066b8] hover:bg-blue-50'
    }
];

const EcommerceAnnouncementBar = ({ onOpenPricing, onOpenDeals, onBlockAds }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const timerRef = useRef(null);

    const nextDeal = () => {
        setCurrentIndex((prev) => (prev + 1) % DEALS.length);
    };

    const prevDeal = () => {
        setCurrentIndex((prev) => (prev - 1 + DEALS.length) % DEALS.length);
    };

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(() => {
            nextDeal();
        }, 5500);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused]);

    const currentDeal = DEALS[currentIndex];
    const IconComponent = currentDeal.icon;

    const handleCopyCode = (e, code) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCtaClick = () => {
        if (onOpenDeals) {
            onOpenDeals();
        } else if (onOpenPricing) {
            onOpenPricing();
        }
    };

    return (
        <div 
            className={`w-full h-10 ${currentDeal.bg} text-white shadow-sm flex items-center justify-between px-3 md:px-6 relative z-50 transition-colors duration-500 ease-in-out select-none overflow-hidden`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Left: Previous & Next Arrows Grouped Together for Easy Ergonomics */}
            <div className="flex items-center gap-1 z-20">
                <button 
                    onClick={prevDeal}
                    className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
                    title="Previous offer"
                    aria-label="Previous deal"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    onClick={nextDeal}
                    className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
                    title="Next offer"
                    aria-label="Next deal"
                >
                    <ChevronRight size={16} />
                </button>
                <span className="hidden xl:inline text-[10.5px] text-white/70 font-mono ml-1 font-semibold">
                    {currentIndex + 1}/{DEALS.length}
                </span>
            </div>

            {/* Absolute Dead-Center Container: Mathematically 100% Centered on Screen */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-20 sm:px-28 md:px-36 z-10">
                <div 
                    className="pointer-events-auto flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm font-medium tracking-wide truncate cursor-pointer transition-all duration-300"
                    onClick={handleCtaClick}
                    title="Click to view all special deals"
                >
                    {/* Badge Tag: Clean solid white tag with matching theme text */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0 ${currentDeal.badgeBg}`}>
                        <IconComponent size={11} className={`shrink-0 ${currentDeal.iconColor}`} />
                        <span>{currentDeal.tag}</span>
                    </span>

                    {/* Offer Text */}
                    <span className="truncate font-semibold text-white tracking-normal">
                        {currentDeal.title}
                    </span>

                    {/* Promo Code Chip: Crisp glassmorphic contrast */}
                    {currentDeal.code && (
                        <button
                            onClick={(e) => handleCopyCode(e, currentDeal.code)}
                            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[3px] font-mono text-[10px] font-extrabold uppercase tracking-wider bg-white/20 hover:bg-white/30 border border-white/35 text-white transition-all shadow-xs"
                            title="Click to copy promo code"
                        >
                            <Tag size={10} className="text-white" />
                            <span>{copiedCode === currentDeal.code ? 'COPIED!' : currentDeal.code}</span>
                        </button>
                    )}

                    {/* CTA Button: Pure matching contrast without color clash */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCtaClick(); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 font-extrabold text-[11px] rounded-[3px] shadow-sm hover:shadow transition-all active:scale-95 shrink-0 uppercase tracking-wider ${currentDeal.ctaBg}`}
                    >
                        <span>{currentDeal.cta}</span>
                        <ArrowRight size={12} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Right: Slide Indicators + Close Button */}
            <div className="flex items-center gap-2 shrink-0 z-20">
                {/* Deal Indicator Dots */}
                <div className="hidden lg:flex items-center gap-1.5 mr-1">
                    {DEALS.map((d, idx) => (
                        <button
                            key={d.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                currentIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Dismiss / Block ads trigger */}
                <button 
                    onClick={onBlockAds}
                    className="p-1 text-white/75 hover:text-white hover:bg-white/20 rounded transition-colors"
                    title="Hide banner"
                    aria-label="Hide banner"
                >
                    <X size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default EcommerceAnnouncementBar;
