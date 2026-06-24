import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Check, X, AlertTriangle, Info, Clock, Copy, Pause } from 'lucide-react';

const ToastLayout = ({
    t,
    icon,
    hugeIcon,
    title,
    subtitle,
    bgClass,
    btnClass,
    duration = 4000,
    glowColor,
}) => {
    const [isPaused, setIsPaused] = useState(duration === Infinity);
    const [copied, setCopied] = useState(false);
    const [isGlowActive, setIsGlowActive] = useState(false);

    useEffect(() => {
        if (glowColor && t.visible) {
            setIsGlowActive(true);
            const timer = setTimeout(() => {
                setIsGlowActive(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [glowColor, t.visible]);

    const handleCopy = () => {
        if (subtitle) {
            navigator.clipboard.writeText(subtitle);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePause = () => {
        setIsPaused(true);
        toast.custom(
            (tRef) => (
                <ToastLayout
                    t={tRef}
                    icon={icon}
                    hugeIcon={hugeIcon}
                    title={title}
                    subtitle={subtitle}
                    bgClass={bgClass}
                    btnClass={btnClass}
                    duration={Infinity}
                    glowColor={glowColor}
                />
            ),
            { id: t.id, duration: Infinity }
        );
    };

    return (
        <>
            {glowColor && createPortal(
                <div 
                    className={`fixed inset-0 w-full h-full pointer-events-none z-[9998] transition-opacity duration-1000 ease-in-out ${isGlowActive ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        background: `radial-gradient(ellipse at 50% 100%, ${glowColor} 0%, transparent 60%)`
                    }}
                />,
                document.body
            )}
            <div className={`max-w-[420px] w-full rounded-[3px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative ${t.visible ? 'animate-in fade-in slide-in-from-right-8 duration-200' : 'animate-out fade-out slide-out-to-right-8 duration-200'}`}>
                
                {/* Colored Area */}
                <div className={`relative ${bgClass} overflow-hidden w-full flex flex-col`}>
                    
                    {/* Background Huge Icon */}
                    {hugeIcon}

                    {/* Header */}
                    <div className="px-4 py-2 border-b border-black/10 flex justify-between items-center relative z-10">
                        <h3 className="text-[16px] font-normal text-white tracking-wide">
                            {title}
                        </h3>
                        <div className="flex items-center gap-3">
                            {subtitle && (
                                <button 
                                    onClick={handleCopy} 
                                    className="text-white hover:text-white/80 transition-colors flex items-center gap-1"
                                    title="Copy message"
                                >
                                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
                                </button>
                            )}
                            {!isPaused && (
                                <button 
                                    onClick={handlePause} 
                                    className="text-white hover:text-white/80 transition-colors"
                                    title="Stop auto-close"
                                >
                                    <Pause size={14} strokeWidth={2.5} fill="currentColor" />
                                </button>
                            )}
                            {isPaused && (
                                <button 
                                    onClick={() => toast.dismiss(t.id)} 
                                    className="text-white hover:text-white/80 transition-colors"
                                    title="Close"
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="px-4 py-3 relative z-10 pb-4">
                        {subtitle && (
                            <p className="text-[13px] text-white/95 leading-relaxed font-sans">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    
                    {/* Progress Bar Loader */}
                    <div className="w-full h-[3px] bg-white/20 relative z-10 mt-auto">
                        {!isPaused && (
                            <div
                                className="h-full bg-white/90"
                                style={{
                                    animation: `toastProgress ${duration}ms linear forwards`
                                }}
                            />
                        )}
                        {isPaused && (
                            <div className="h-full bg-white/50 w-full" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const parseArgs = (arg) => {
    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg) && !React.isValidElement(arg)) {
        return { subMessage: null, options: arg };
    }
    return { subMessage: arg, options: {} };
};

/* SUCCESS */
export const showSuccessToast = (message, subMessageOrOptions) => {
    const { subMessage, options } = parseArgs(subMessageOrOptions);
    const duration = options.duration || 4000;
    const displayTitle = subMessage ? message : "Success";
    const displaySubtitle = subMessage ? subMessage : (message || "Operation completed successfully");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Check size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                    </div>
                )}
                bgClass="bg-[#5cb85c]"
                btnClass="bg-[#5cb85c]"
                duration={duration}
            />
        ),
        {
            duration: duration,
            position: 'top-right',
            ...options
        }
    );
};

/* ERROR */
export const showErrorToast = (message, subMessageOrOptions) => {
    const { subMessage, options } = parseArgs(subMessageOrOptions);
    const duration = options.duration || 4000;
    const displayTitle = subMessage ? message : "Error";
    const displaySubtitle = subMessage ? subMessage : (message || "An error occurred");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <svg width="130" height="130" viewBox="0 0 100 100" className="fill-black opacity-[0.12] absolute">
                             <path d="M20,5 L50,35 L80,5 L95,20 L65,50 L95,80 L80,95 L50,65 L20,95 L5,80 L35,50 L5,20 Z" />
                        </svg>
                    </div>
                )}
                bgClass="bg-[#d9534f]"
                btnClass="bg-[#d9534f]"
                glowColor="rgba(217, 83, 79, 0.4)"
                duration={duration}
            />
        ),
        {
            duration: duration,
            position: 'top-right',
            ...options
        }
    );
};

/* INFO */
export const showInfoToast = (message, subMessageOrOptions) => {
    const { subMessage, options } = parseArgs(subMessageOrOptions);
    const duration = options.duration || 4000;
    const displayTitle = subMessage ? message : "Information";
    const displaySubtitle = subMessage ? subMessage : (message || "Here is some information");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Info size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                    </div>
                )}
                bgClass="bg-[#5bc0de]"
                btnClass="bg-[#5bc0de]"
                duration={duration}
            />
        ),
        {
            duration: duration,
            position: 'top-right',
            ...options
        }
    );
};

/* PENDING / WAIT */
export const showPendingToast = (message, subMessageOrOptions) => {
    const { subMessage, options } = parseArgs(subMessageOrOptions);
    const duration = options.duration || 4000;
    const displayTitle = subMessage ? message : "Pending";
    const displaySubtitle = subMessage ? subMessage : (message || "Processing your request");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Clock size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                    </div>
                )}
                bgClass="bg-[#f0ad4e]"
                btnClass="bg-[#f0ad4e]"
                duration={duration}
            />
        ),
        {
            duration: duration,
            position: 'top-right',
            ...options
        }
    );
};

