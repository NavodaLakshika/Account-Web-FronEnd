import React, { useState, useEffect, useRef } from 'react';
import { 
    ShoppingBag, 
    Zap, 
    Star, 
    Tag, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    ArrowRight, 
    Clock, 
    Copy, 
    Pause, 
    Play
} from 'lucide-react';

const PRODUCTS = [
    {
        id: 'prod-1',
        theme: 'blue',
        name: 'Enterprise Cloud ERP Suite',
        subtitle: 'Complete multi-tenant accounting & financial ledgers for growing enterprises',
        category: 'SOFTWARE ADD-ON',
        badge: 'SAVE 50%',
        badgeColor: 'bg-blue-50 text-[#0078d4] border border-blue-200',
        accentColor: '#0078d4',
        btnBg: 'bg-[#0078d4] hover:bg-[#005a9e]',
        promoCode: 'ONIMTA50',
        isPopular: true,
        originalPrice: '$99/mo',
        dealPrice: '$49.50/mo',
        rating: 4.9,
        reviews: 248,
        features: [
            'Unlimited users & custom role-based authorizations',
            'Multi-company consolidated trial balance & ledgers',
            'Automated bank discrepancy and reconciliation engine',
            'Priority 24/7 dedicated enterprise support SLA'
        ],
        ctaText: 'Claim 50% Off'
    },
    {
        id: 'prod-2',
        theme: 'green',
        name: 'E-Commerce & POS Real-time Sync',
        subtitle: 'Omnichannel inventory & billing synchronization across branches and online stores',
        category: 'HARDWARE & POS',
        badge: 'NEW RELEASE',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        accentColor: '#059669',
        btnBg: 'bg-[#059669] hover:bg-[#047857]',
        promoCode: 'SYNCPRO',
        isPopular: false,
        originalPrice: '$49/mo',
        dealPrice: '$24.50/mo',
        rating: 4.8,
        reviews: 94,
        features: [
            'Shopify & WooCommerce instant 2-way catalog sync',
            'Barcode scanning & thermal slip printer driver',
            'Live branch-wise stock balance adjustments',
            'Offline cashier register mode with auto-sync'
        ],
        ctaText: 'Explore Module'
    },
    {
        id: 'prod-3',
        theme: 'blue',
        name: 'Automated 100GB Cloud Vault',
        subtitle: 'Disaster recovery & daily automated encrypted database snapshots',
        category: 'CLOUD SERVICES',
        badge: 'FREE PERK',
        badgeColor: 'bg-blue-50 text-[#0284c7] border border-blue-200',
        accentColor: '#0284c7',
        btnBg: 'bg-[#0284c7] hover:bg-[#0369a1]',
        promoCode: 'VAULT100',
        isPopular: false,
        originalPrice: '$29/mo',
        dealPrice: 'FREE with Enterprise',
        rating: 5.0,
        reviews: 412,
        features: [
            'Automated nightly database snapshots & logs',
            'AES-256 military-grade offsite encryption',
            'One-click instant ledger state rollback & restore',
            'Redundant geo-replicated enterprise safe storage'
        ],
        ctaText: 'Activate Free'
    },
    {
        id: 'prod-4',
        theme: 'green',
        name: 'AI Financial Analytics & Forecast',
        subtitle: 'Predictive cashflow intelligence, discrepancy detector, and ledger assistant',
        category: 'SOFTWARE ADD-ON',
        badge: 'SMART AI',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        accentColor: '#059669',
        btnBg: 'bg-[#059669] hover:bg-[#047857]',
        promoCode: 'SMARTAI',
        isPopular: false,
        originalPrice: '$39/mo',
        dealPrice: '$19.50/mo',
        rating: 4.9,
        reviews: 178,
        features: [
            '90-day predictive cash flow and runway forecast',
            'Automated bank discrepancy and duplicate detector',
            'Revenue anomaly & suspicious expense alerts',
            'Natural language query assistant on all ledgers'
        ],
        ctaText: 'Try AI Module'
    },
    {
        id: 'prod-5',
        theme: 'blue',
        name: 'Global Multi-Currency Connector',
        subtitle: 'Trade across borders with live central bank foreign exchange feeds',
        category: 'SOFTWARE ADD-ON',
        badge: 'PRO BUNDLE',
        badgeColor: 'bg-blue-50 text-[#0066b8] border border-blue-200',
        accentColor: '#0066b8',
        btnBg: 'bg-[#0066b8] hover:bg-[#004e8c]',
        promoCode: 'GLOBALPRO',
        isPopular: false,
        originalPrice: '$35/mo',
        dealPrice: '$15.00/mo',
        rating: 4.7,
        reviews: 120,
        features: [
            'Real-time central bank exchange rates feed',
            'Automated unrealized FX gain/loss calculation',
            'Multi-currency customer statements & invoicing',
            'Cross-border international tax compliance reports'
        ],
        ctaText: 'Upgrade Now'
    },
    {
        id: 'prod-6',
        theme: 'green',
        name: 'Payment Gateway & POS Terminal',
        subtitle: 'Direct digital billing, payment links, and online customer portal',
        category: 'HARDWARE & POS',
        badge: '0% SETUP',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        accentColor: '#047857',
        btnBg: 'bg-[#047857] hover:bg-[#065f46]',
        promoCode: 'ZEROFEE',
        isPopular: false,
        originalPrice: '$50 Setup',
        dealPrice: '$0 Free Setup',
        rating: 4.8,
        reviews: 86,
        features: [
            'One-click payment links on PDF email invoices',
            'Visa, MasterCard & local QR dynamic payments',
            'Instant webhook ledger receipt posting',
            'Automated bank settlement reconciliation breakdown'
        ],
        ctaText: 'Get Terminal'
    }
];

const AUTO_PAGINATE_SECONDS = 5.5; // 5.5s per card

const EcommercePromoModal = ({ isOpen, onClose, onOpenPricing }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedCodeId, setCopiedCodeId] = useState(null);
    const [dontShowToday, setDontShowToday] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(28780);
    const [animating, setAnimating] = useState(false);
    const progressIntervalRef = useRef(null);

    // Live countdown timer
    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 28800));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`;
    };

    const goToNext = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % PRODUCTS.length);
            setProgress(0);
            setAnimating(false);
        }, 160);
    };

    const goToPrev = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
            setProgress(0);
            setAnimating(false);
        }, 160);
    };

    const goToIndex = (idx) => {
        if (idx === currentIndex) return;
        setAnimating(true);
        setTimeout(() => {
            setCurrentIndex(idx);
            setProgress(0);
            setAnimating(false);
        }, 160);
    };

    // Auto-pagination ticker loader
    useEffect(() => {
        if (!isOpen || isPaused) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return;
        }

        const stepMs = 50;
        const totalSteps = (AUTO_PAGINATE_SECONDS * 1000) / stepMs;
        let step = (progress / 100) * totalSteps;

        progressIntervalRef.current = setInterval(() => {
            step += 1;
            const newProgress = Math.min((step / totalSteps) * 100, 100);
            setProgress(newProgress);

            if (step >= totalSteps) {
                step = 0;
                goToNext();
            }
        }, stepMs);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isOpen, isPaused, currentIndex]);

    // Keyboard navigation: Escape to close, Left/Right arrows to paginate
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                handleDismiss();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    if (!isOpen) return null;

    const currentProd = PRODUCTS[currentIndex];

    const handleDismiss = () => {
        if (dontShowToday) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('hideEcommerceDealsDate', today);
        }
        onClose();
    };

    const handleActionClick = () => {
        onClose();
        if (onOpenPricing) onOpenPricing();
    };

    const handleCopyCode = (e, prod) => {
        e.stopPropagation();
        if (!prod.promoCode) return;
        navigator.clipboard?.writeText(prod.promoCode);
        setCopiedCodeId(prod.id);
        setTimeout(() => setCopiedCodeId(null), 2500);
    };

    return (
        /* Dark Blurred Background Overlay (Scrollable for short viewport height) */
        <div 
            className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 min-h-screen"
            onClick={handleDismiss}
        >
            {/* Floating Close Button in Background Top Corner */}
            <button
                onClick={handleDismiss}
                className="fixed top-3 right-3 sm:top-5 sm:right-5 md:top-7 md:right-7 z-[100000] p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg"
                title="Close (Esc)"
                aria-label="Close"
            >
                <X size={18} strokeWidth={2} className="sm:w-5 sm:h-5" />
            </button>

            {/* Center Card Container (Stops click propagation so clicking the card doesn't dismiss) */}
            <div 
                className="relative w-full max-w-[94vw] sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px] flex flex-col items-center my-auto"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* THE ONLY CARD (Spacious width & height, fully auto-responsive, crisp enterprise border radius) */}
                <div 
                    className={`w-full bg-white rounded-[4px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col min-h-0 sm:min-h-[460px] md:min-h-[500px] transition-all duration-200 ${
                        animating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                    }`}
                >
                    {/* Top Loader Bar (Smooth Auto-Pagination Indicator) */}
                    <div className="w-full h-[3.5px] sm:h-[4px] bg-slate-100 overflow-hidden">
                        <div 
                            className="h-full transition-all duration-100 ease-linear"
                            style={{ 
                                width: `${progress}%`,
                                backgroundColor: currentProd.accentColor 
                            }}
                        />
                    </div>

                    {/* Card Inner Padding (Auto-responsive layout) */}
                    <div className="p-5 sm:p-7 md:p-10 lg:p-11 flex flex-col justify-between flex-1">
                        
                        {/* Top Section: Badges, Title, Subtitle, Voucher, and Bullets */}
                        <div className="flex flex-col">
                            {/* Top Header inside Card: Badges and Live Deal Timer */}
                            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                                {/* Left: Category & Badges */}
                                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                                    <span className="text-[9.5px] sm:text-[11px] font-extrabold text-[#64748b] tracking-wider uppercase">
                                        {currentProd.category}
                                    </span>
                                    {currentProd.isPopular && (
                                        <span className="px-2 sm:px-2.5 py-0.5 rounded-[3px] text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0078d4]">
                                            ★ POPULAR
                                        </span>
                                    )}
                                    <span className={`px-2 sm:px-2.5 py-0.5 rounded-[3px] text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs ${currentProd.badgeColor}`}>
                                        {currentProd.badge}
                                    </span>
                                </div>

                                {/* Right: Live Deal Timer */}
                                <div className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-[3px] text-[9.5px] sm:text-[10.5px] font-extrabold shrink-0">
                                    <Clock size={11} className="text-emerald-600 animate-pulse" />
                                    <span className="font-mono">{formatTime(secondsRemaining)}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-[19px] sm:text-[23px] md:text-[26px] lg:text-[28px] font-extrabold text-[#0f172a] leading-snug sm:leading-tight mt-1">
                                {currentProd.name}
                            </h3>

                            {/* Subtitle */}
                            <p className="text-[12.5px] sm:text-[13.5px] md:text-[14.5px] text-[#64748b] mt-1.5 sm:mt-2 leading-relaxed">
                                {currentProd.subtitle}
                            </p>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-2 mt-2 sm:mt-3">
                                <div className="flex items-center text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={12} 
                                            className={`sm:w-[13px] sm:h-[13px] ${i < Math.floor(currentProd.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] sm:text-[12px] font-bold text-[#1e293b]">{currentProd.rating}</span>
                                <span className="text-[10.5px] sm:text-[11.5px] text-slate-400">({currentProd.reviews} verified enterprise reviews)</span>
                            </div>

                            {/* Click-to-Copy Voucher Code Chip */}
                            {currentProd.promoCode && (
                                <div className="mt-3.5 sm:mt-4 md:mt-5">
                                    <button
                                        onClick={(e) => handleCopyCode(e, currentProd)}
                                        className={`w-full inline-flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px] border text-[10.5px] sm:text-[11.5px] font-mono font-bold tracking-wider transition-all shadow-2xs gap-2 ${
                                            copiedCodeId === currentProd.id 
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                        }`}
                                        title="Click to copy promo voucher code"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Tag size={12} className={`shrink-0 ${copiedCodeId === currentProd.id ? 'text-emerald-600' : 'text-[#0078d4]'}`} />
                                            <span className="truncate">COUPON: <span className="underline decoration-dotted">{currentProd.promoCode}</span></span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[9.5px] sm:text-[10.5px] shrink-0">
                                            {copiedCodeId === currentProd.id ? (
                                                <>
                                                    <Check size={12} className="text-emerald-600" />
                                                    <span className="font-sans font-bold text-emerald-700">COPIED!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={11} className="text-slate-400" />
                                                    <span className="font-sans font-medium text-slate-500">CLICK TO COPY</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Feature Bullets with Emerald Checkmarks (Auto-responsive: 1 col on mobile, 2 col on tablet/desktop) */}
                            <ul className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 sm:gap-y-3">
                                {currentProd.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-[12px] sm:text-[12.5px] md:text-[13px] text-[#1e293b]">
                                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 sm:w-[15px] sm:h-[15px]" />
                                        <span className="leading-snug">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price & Primary CTA Bottom Row (Stacks on tiny screens, side-by-side on normal screens) */}
                        <div className="mt-5 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex sm:flex-col items-baseline sm:items-start justify-between sm:justify-start min-w-0">
                                <span className="text-[11px] sm:text-[12px] text-slate-400 line-through font-semibold leading-none">
                                    {currentProd.originalPrice}
                                </span>
                                <span className="text-[20px] sm:text-[24px] md:text-[28px] font-extrabold text-[#0f172a] leading-tight sm:mt-0.5">
                                    {currentProd.dealPrice}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
                                <button
                                    onClick={handleActionClick}
                                    className="text-[11px] sm:text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors px-2.5 sm:px-3 py-1.5"
                                >
                                    View All Plans
                                </button>
                                <button
                                    onClick={handleActionClick}
                                    className={`inline-flex items-center justify-center gap-2 px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 text-white font-extrabold text-[12px] sm:text-[13px] rounded-[4px] shadow-sm hover:shadow transition-all active:scale-95 uppercase tracking-wider flex-1 sm:flex-initial ${currentProd.btnBg}`}
                                >
                                    <span>{currentProd.ctaText}</span>
                                    <ArrowRight size={13} strokeWidth={2.5} className="sm:w-[14px] sm:h-[14px]" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Pagination Strip & Auto-sliding indicator below the card */}
                <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mt-4 sm:mt-7 md:mt-8 px-2 text-white/85 select-none">
                    
                    {/* Offer Count */}
                    <span className="text-[10.5px] sm:text-[11.5px] font-mono font-bold tracking-wide text-white/90">
                        Deal {currentIndex + 1} of {PRODUCTS.length}
                    </span>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        {PRODUCTS.map((prod, idx) => (
                            <button
                                key={prod.id}
                                onClick={() => goToIndex(idx)}
                                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                    currentIndex === idx 
                                        ? 'w-5 sm:w-7 bg-white shadow-sm' 
                                        : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                                }`}
                                title={`View ${prod.name}`}
                                aria-label={`Go to deal ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Auto-Slide Status + Pause/Resume */}
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-[12px] border border-white/20 shrink-0"
                        title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
                    >
                        {isPaused ? (
                            <>
                                <Play size={9} className="fill-white sm:w-[10px] sm:h-[10px]" />
                                <span>Paused</span>
                            </>
                        ) : (
                            <>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Auto-sliding</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Don't show again today subtle toggle on blurred background */}
                <label className="mt-3 sm:mt-4 md:mt-5 flex items-center justify-center gap-2 cursor-pointer select-none text-[10.5px] sm:text-[11px] text-white/70 hover:text-white/90 transition-colors text-center">
                    <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => setDontShowToday(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-white/30 bg-white/10 text-[#0078d4] focus:ring-0"
                    />
                    <span>Don't show promotional popups again today</span>
                </label>

            </div>
        </div>
    );
};

export default EcommercePromoModal;
