import React, { useState, useRef } from 'react';
import { 
    ShoppingBag, 
    Zap, 
    Sparkles, 
    Star, 
    Tag, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    ExternalLink, 
    Flame, 
    ShieldCheck, 
    Clock, 
    ArrowRight,
    SlidersHorizontal,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const PRODUCTS = [
    {
        id: 'prod-1',
        name: 'Enterprise Cloud ERP Suite',
        subtitle: 'Complete multi-tenant accounting and operations',
        category: 'Software Add-on',
        badge: 'SAVE 50%',
        badgeColor: 'bg-rose-500 text-white',
        iconBg: 'bg-blue-600',
        originalPrice: '$99/mo',
        dealPrice: '$49.50/mo',
        rating: 4.9,
        reviews: 248,
        features: [
            'Unlimited users & role authorizations',
            'Multi-company consolidated ledgers',
            'Full audit trail & enterprise security'
        ],
        ctaText: 'Claim 50% Off',
        accentGradient: 'from-blue-600 to-indigo-600'
    },
    {
        id: 'prod-2',
        name: 'E-Commerce & POS Real-time Sync',
        subtitle: 'Omnichannel inventory and sales integration',
        category: 'Hardware & POS',
        badge: 'NEW RELEASE',
        badgeColor: 'bg-emerald-500 text-white',
        iconBg: 'bg-emerald-600',
        originalPrice: '$49/mo',
        dealPrice: '$24.50/mo',
        rating: 4.8,
        reviews: 94,
        features: [
            'Shopify & WooCommerce instant sync',
            'Barcode scanning & thermal slip printing',
            'Automatic revenue & tax ledgering'
        ],
        ctaText: 'Explore Module',
        accentGradient: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'prod-3',
        name: 'Automated 100GB Cloud Vault',
        subtitle: 'Hands-off disaster recovery & daily snapshots',
        category: 'Cloud Services',
        badge: 'FREE PERK',
        badgeColor: 'bg-amber-500 text-slate-900',
        iconBg: 'bg-amber-500',
        originalPrice: '$29/mo',
        dealPrice: 'FREE with Enterprise',
        rating: 5.0,
        reviews: 412,
        features: [
            'Automated nightly database snapshots',
            'AES-256 military-grade encryption',
            'Instant 1-click cloud restoration'
        ],
        ctaText: 'Activate Free',
        accentGradient: 'from-amber-500 to-orange-600'
    },
    {
        id: 'prod-4',
        name: 'AI Financial Analytics & Forecasting',
        subtitle: 'Predictive cashflow intelligence model',
        category: 'Software Add-on',
        badge: 'AI POWERED',
        badgeColor: 'bg-purple-500 text-white',
        iconBg: 'bg-purple-600',
        originalPrice: '$39/mo',
        dealPrice: '$19.50/mo',
        rating: 4.9,
        reviews: 178,
        features: [
            '90-day cash flow & expense projections',
            'Automated bank discrepancy detector',
            'Instant natural language report queries'
        ],
        ctaText: 'Try AI Module',
        accentGradient: 'from-purple-600 to-pink-600'
    },
    {
        id: 'prod-5',
        name: 'Global Multi-Currency Connector',
        subtitle: 'Trade across borders with live FX feeds',
        category: 'Software Add-on',
        badge: 'POPULAR',
        badgeColor: 'bg-sky-500 text-white',
        iconBg: 'bg-sky-600',
        originalPrice: '$35/mo',
        dealPrice: '$15.00/mo',
        rating: 4.7,
        reviews: 120,
        features: [
            'Real-time central bank exchange rates',
            'Automated unrealized FX gain/loss',
            'Multi-currency customer statements'
        ],
        ctaText: 'Upgrade Now',
        accentGradient: 'from-sky-600 to-blue-700'
    },
    {
        id: 'prod-6',
        name: 'Payment Gateway & Virtual Terminal',
        subtitle: 'Direct digital billing and customer portal',
        category: 'Hardware & POS',
        badge: '0% SETUP',
        badgeColor: 'bg-indigo-500 text-white',
        iconBg: 'bg-indigo-600',
        originalPrice: '$50 Setup',
        dealPrice: '$0 Free Setup',
        rating: 4.8,
        reviews: 86,
        features: [
            'One-click payment links on invoices',
            'Visa, MasterCard & local QR payments',
            'Instant ledger settlement matching'
        ],
        ctaText: 'Get Terminal',
        accentGradient: 'from-indigo-600 to-violet-600'
    }
];

const CATEGORIES = ['All Offers', 'Software Add-on', 'Hardware & POS', 'Cloud Services'];

const EcommercePromoShowcase = ({ onOpenPricing }) => {
    const [selectedCategory, setSelectedCategory] = useState('All Offers');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const scrollContainerRef = useRef(null);

    const filteredProducts = selectedCategory === 'All Offers' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === selectedCategory);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 md:p-6 mb-6 transition-all duration-300">
            {/* Header / Banner Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-[16px] md:text-[18px] font-black text-slate-800 tracking-tight leading-tight">
                                Featured Business Add-Ons & Deals
                            </h2>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                                <Flame size={11} />
                                LIMITED TIME
                            </span>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium">
                            Explore e-commerce modules, hardware connectors, and premium cloud add-ons
                        </p>
                    </div>
                </div>

                {/* Right controls: Collapse toggle & Slider navigation */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                        title="Scroll left"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                        title="Scroll right"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-[11px] font-bold transition-all ml-1"
                        title={isCollapsed ? 'Expand showcase' : 'Collapse showcase'}
                    >
                        <span>{isCollapsed ? 'Show Deals' : 'Hide'}</span>
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                </div>
            </div>

            {/* Content area: visible when not collapsed */}
            {!isCollapsed && (
                <div className="pt-4 animate-in fade-in duration-300">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
                                    selectedCategory === cat 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Products Horizontal Scroll Slider */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {filteredProducts.map(prod => (
                            <div
                                key={prod.id}
                                className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                {/* Top Banner Ribbon Accent */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${prod.accentGradient}`} />

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    {/* Header & Badges */}
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {prod.category}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm ${prod.badgeColor}`}>
                                                {prod.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-[15px] font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                                            {prod.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                            {prod.subtitle}
                                        </p>

                                        {/* Rating & Reviews */}
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="flex items-center text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={11} 
                                                        className={i < Math.floor(prod.rating) ? 'fill-amber-400' : 'text-slate-300'} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-extrabold text-slate-700">{prod.rating}</span>
                                            <span className="text-[10px] text-slate-400">({prod.reviews})</span>
                                        </div>

                                        {/* Feature Checklist */}
                                        <ul className="mt-3.5 space-y-1.5 border-t border-dashed border-slate-100 pt-3">
                                            {prod.features.map((feat, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                                                    <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Price & Action Button */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 line-through font-semibold">
                                                {prod.originalPrice}
                                            </span>
                                            <span className="text-[14px] font-black text-slate-900 leading-tight">
                                                {prod.dealPrice}
                                            </span>
                                        </div>

                                        <button
                                            onClick={onOpenPricing}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0078d4] hover:bg-[#005a9e] text-white font-extrabold text-[11px] rounded-lg shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
                                        >
                                            <span>{prod.ctaText}</span>
                                            <ArrowRight size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcommercePromoShowcase;
