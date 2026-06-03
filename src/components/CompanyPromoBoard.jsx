import React, { useState, useEffect, useCallback } from 'react';
import { Database, Layout, Cpu, Globe, X, ChevronRight, ExternalLink, Clock } from 'lucide-react';
import { adService } from '../services/ad.service';

const defaultAds = [
    // {
    //     title: 'Merit Plus Finance',
    //     desc: 'Cloud-native accounting platform with real-time multi-company reporting.',
    //     icon: Database,
    //     accent: '#3b82f6',
    //     bg: 'bg-blue-50',
    //     border: 'border-blue-200',
    //     iconBg: 'bg-blue-500'
    // },
    // {
    //     title: 'Web Solutions',
    //     desc: 'High-performance ERP for textile manufacturing and restaurant chains.',
    //     icon: Layout,
    //     accent: '#059669',
    //     bg: 'bg-emerald-50',
    //     border: 'border-emerald-200',
    //     iconBg: 'bg-emerald-500'
    // },
    // {
    //     title: 'AI Platform',
    //     desc: 'Predictive analytics and intelligent automation for data-driven growth.',
    //     icon: Cpu,
    //     accent: '#7c3aed',
    //     bg: 'bg-purple-50',
    //     border: 'border-purple-200',
    //     iconBg: 'bg-purple-500'
    // },
    // {
    //     title: 'ONIMTA Technology',
    //     desc: 'Enterprise software solutions — EST. 2013, Lake Road, Maharagama.',
    //     icon: Globe,
    //     accent: '#78716c',
    //     bg: 'bg-stone-50',
    //     border: 'border-stone-200',
    //     iconBg: 'bg-stone-500'
    // }
];

const AVAILABLE_ICONS = { Database, Layout, Cpu, Globe };
const AUTO_CLOSE_SECONDS = 12;

const CompanyPromoBoard = ({ isOpen, onClose }) => {
    const [ads, setAds] = useState([]);
    const [adIndex, setAdIndex] = useState(0);
    const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
    const [exiting, setExiting] = useState(false);
    const [entering, setEntering] = useState(true);

    const handleClose = useCallback(() => {
        if (exiting) return;
        setExiting(true);
        setTimeout(onClose, 400);
    }, [exiting, onClose]);

    useEffect(() => {
        if (!isOpen) {
            setExiting(false);
            setEntering(true);
            setCountdown(AUTO_CLOSE_SECONDS);
            return;
        }

        const enterTimer = setTimeout(() => {
            setEntering(false);
        }, 100);

        const fetchAndSelectAd = async () => {
            try {
                const fetchedAds = await adService.getAllAds();
                const activeAds = fetchedAds.filter(ad => ad.isActive || ad.IsActive);
                if (activeAds.length > 0) {
                    setAds(activeAds);
                    setAdIndex(Math.floor(Math.random() * activeAds.length));
                } else {
                    setAds(defaultAds);
                    setAdIndex(Math.floor(Math.random() * defaultAds.length));
                }
            } catch (error) {
                setAds(defaultAds);
                setAdIndex(Math.floor(Math.random() * defaultAds.length));
            }
        };

        fetchAndSelectAd();
        setCountdown(AUTO_CLOSE_SECONDS);

        return () => {
            clearTimeout(enterTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || entering || exiting) return;

        const interval = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, entering, exiting]);

    useEffect(() => {
        if (countdown <= 0 && isOpen && !exiting) {
            handleClose();
        }
    }, [countdown, isOpen, exiting, handleClose]);

    if (!isOpen || ads.length === 0) return null;

    const ad = ads[adIndex];
    if (!ad) return null;
    
    const iconNameStr = ad.iconName || ad.IconName;
    const Icon = iconNameStr ? (AVAILABLE_ICONS[iconNameStr] || Globe) : (ad.icon || Globe);
    const title = ad.title || ad.Title || '';
    const desc = ad.desc || ad.Desc || '';
    const accentColor = ad.accent || '#0388cc';
    const progress = ((AUTO_CLOSE_SECONDS - countdown) / AUTO_CLOSE_SECONDS) * 100;

    return (
        <div className="fixed inset-0 z-[2060] flex items-center justify-center p-4">
            <div 
                className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-400 ${entering ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />
            <div 
                className={`relative w-full max-w-[420px] bg-white rounded-none shadow-2xl overflow-hidden transition-all duration-400 ${
                    entering || exiting ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
                }`}
            >
                {/* Progress bar at top */}
                <div className="h-1 bg-slate-100 w-full">
                    <div 
                        className="h-full transition-all duration-1000 ease-linear rounded-none"
                        style={{ 
                            width: `${progress}%`, 
                            backgroundColor: accentColor,
                            transitionDuration: `${exiting ? '0ms' : '1000ms'}`
                        }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors z-10"
                >
                    <X size={28} strokeWidth={1.5} />
                </button>

                {/* Ad content */}
                <div className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        {/* Icon */}
                        <div 
                            className="w-16 h-16 rounded-none flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            <Icon size={28} style={{ color: accentColor }} />
                        </div>

                        {/* Title */}
                        <h3 className="text-[17px] font-bold text-slate-800 leading-tight">
                            {title}
                        </h3>

                        {/* Description */}
                        {desc && (
                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                {desc}
                            </p>
                        )}

                        {/* CTA */}
                        <a
                            href="https://www.onimtait.com"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none text-[13px] font-bold text-white transition-all active:scale-95 shadow-md hover:shadow-lg"
                            style={{ backgroundColor: accentColor }}
                        >
                            <ExternalLink size={15} />
                            Learn More
                        </a>

                        {/* Sponsored + countdown */}
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sponsored</span>
                            <div className="w-px h-3 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400">
                                <Clock size={12} />
                                <span>{countdown}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyPromoBoard;
