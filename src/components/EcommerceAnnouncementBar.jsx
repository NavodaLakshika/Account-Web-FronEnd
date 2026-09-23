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
import SocialMediaModals from './modals/SocialMediaModals';

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
    const [activeSocialModal, setActiveSocialModal] = useState(null);
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
            {/* Left: Navigation Arrows + Social Media Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5 z-20">
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
                <span className="hidden xl:inline text-[10.5px] text-white/70 font-mono ml-0.5 mr-1 font-semibold">
                    {currentIndex + 1}/{DEALS.length}
                </span>

                {/* Subtle Divider */}
                <span className="h-3.5 w-[1px] bg-white/30 mx-1 hidden sm:inline-block" />

                {/* Social Media Links */}
                <div className="flex items-center gap-1">
                    {/* Facebook */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveSocialModal('facebook'); }}
                        className="p-1 rounded-full hover:bg-white/25 text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Onimta Facebook Page"
                        aria-label="Facebook"
                    >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </button>

                    {/* WhatsApp */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveSocialModal('whatsapp'); }}
                        className="p-1 rounded-full hover:bg-white/25 text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Onimta Customer Center (+94721220008)"
                        aria-label="WhatsApp"
                    >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                    </button>

                    {/* Gmail */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveSocialModal('email'); }}
                        className="p-1 rounded-full hover:bg-white/25 text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Send Email to navoda991@gmail.com"
                        aria-label="Gmail"
                    >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z" />
                        </svg>
                    </button>

                    {/* Instagram */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveSocialModal('instagram'); }}
                        className="p-1 rounded-full hover:bg-white/25 text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Onimta Instagram"
                        aria-label="Instagram"
                    >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </button>
                </div>
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

            {/* Social Media Action Modal */}
            <SocialMediaModals 
                modalType={activeSocialModal}
                isOpen={!!activeSocialModal}
                onClose={() => setActiveSocialModal(null)}
            />
        </div>
    );
};

export default EcommerceAnnouncementBar;
