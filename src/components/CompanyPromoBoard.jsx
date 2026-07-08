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
        <div className="fixed top-0 left-0 z-[99999] flex flex-col pointer-events-none transition-all duration-400">
            <div 
                className={`relative bg-white shadow-xl border border-slate-200 p-5 rounded-none transition-all duration-400 pointer-events-auto ${
                    entering || exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
            >
                {/* Ad content */}
                <div className="flex flex-col gap-3 max-w-[280px]">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div 
                                className="w-10 h-10 shrink-0 rounded-none flex items-center justify-center shadow-md border border-slate-200/50"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Icon size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-extrabold text-slate-800 leading-tight">
                                    {title}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Sponsored • {countdown}s</span>
                            </div>
                        </div>
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-800 transition-colors p-1"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Description */}
                    {desc && (
                        <p className="text-[13px] text-slate-700 font-medium leading-snug drop-shadow-sm">
                            {desc}
                        </p>
                    )}

                    {/* CTA */}
                    <a
                        href="https://www.onimtait.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-none text-[13px] font-bold text-white transition-all active:scale-95 shadow-md hover:shadow-lg w-fit mt-1"
                        style={{ backgroundColor: accentColor }}
                    >
                        <ExternalLink size={14} />
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CompanyPromoBoard;
