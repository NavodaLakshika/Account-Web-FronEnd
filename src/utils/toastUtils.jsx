import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Check, X, AlertTriangle, Info, Clock, Copy, Pause } from 'lucide-react';

const ToastLayout = ({
    t,
    title,
    subtitle,
    bgClass,
    btnClass,
    hugeIcon,
    options = {},
    duration = 4000
}) => {
    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] ${t.visible ? 'pointer-events-auto animate-in fade-in' : 'pointer-events-none animate-out fade-out'} duration-200`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => toast.remove(t.id)} />
            
            <div className={`relative w-[600px] bg-white shadow-[0_10px_40px_rgb(0,0,0,0.3)] overflow-hidden ${t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'} duration-200 rounded-[3px]`}>
                {/* Colored Area */}
                <div className={`relative ${bgClass} overflow-hidden w-full flex flex-col py-6`}>
                    {/* Watermark Icon */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                        {hugeIcon}
                    </div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 px-6">
                        {/* Header */}
                        <div className="pb-2 border-b border-black/10 flex justify-between items-center">
                            <h3 className="text-[15px] font-mono font-bold text-white uppercase tracking-widest">{title}</h3>
                        </div>
                        
                        {/* Content */}
                        <div className="pt-3 pb-2">
                            {subtitle && (
                                <p className="text-white/95 text-[15px] leading-relaxed font-sans max-w-3xl">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* White Footer Area */}
                <div className="bg-white py-3 w-full flex relative z-10">
                    <div className="max-w-7xl mx-auto w-full px-6 flex justify-end gap-3">
                        <button 
                            onClick={() => {
                                if (options.onCancel) options.onCancel();
                                toast.remove(t.id);
                            }}
                            className="px-8 py-2 bg-[#cccccc] hover:bg-[#b3b3b3] text-white font-medium rounded-[3px] transition-colors text-[14px] uppercase"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                if (options.onConfirm) options.onConfirm();
                                toast.remove(t.id);
                            }}
                            className={`px-8 py-2 ${btnClass} text-white font-medium rounded-[3px] hover:brightness-90 transition-all text-[14px] uppercase flex items-center justify-center gap-2 min-w-[100px] shadow-sm`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
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
    const duration = options.duration || Infinity;
    const displayTitle = subMessage ? message : "Success";
    const displaySubtitle = subMessage ? subMessage : (message || "Operation completed successfully");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <>
                        <svg width="200" height="200" viewBox="0 0 100 100" className="fill-black opacity-[0.05]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Check size={120} strokeWidth={4} className="text-black opacity-[0.08] absolute right-[40px]" />
                    </>
                )}
                bgClass="bg-[#5cb85c]"
                btnClass="bg-[#5cb85c]"
                glowColor="rgba(92, 184, 92, 0.15)"
                options={options}
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
    const duration = options.duration || Infinity;
    const displayTitle = subMessage ? message : "Error";
    const displaySubtitle = subMessage ? subMessage : (message || "An error occurred");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <>
                        <svg width="200" height="200" viewBox="0 0 100 100" className="fill-black opacity-[0.05]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <svg width="120" height="120" viewBox="0 0 100 100" className="fill-black opacity-[0.08] absolute right-[40px]">
                             <path d="M20,5 L50,35 L80,5 L95,20 L65,50 L95,80 L80,95 L50,65 L20,95 L5,80 L35,50 L5,20 Z" />
                        </svg>
                    </>
                )}
                bgClass="bg-[#d9534f]"
                btnClass="bg-[#d9534f]"
                glowColor="rgba(217, 83, 79, 0.15)"
                options={options}
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
    const duration = options.duration || Infinity;
    const displayTitle = subMessage ? message : "Information";
    const displaySubtitle = subMessage ? subMessage : (message || "Here is some information");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <>
                        <svg width="200" height="200" viewBox="0 0 100 100" className="fill-black opacity-[0.05]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Info size={120} strokeWidth={4} className="text-black opacity-[0.08] absolute right-[40px]" />
                    </>
                )}
                bgClass="bg-[#5bc0de]"
                btnClass="bg-[#5bc0de]"
                glowColor="rgba(91, 192, 222, 0.15)"
                options={options}
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
    const duration = options.duration || Infinity;
    const displayTitle = subMessage ? message : "Pending";
    const displaySubtitle = subMessage ? subMessage : (message || "Processing your request");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                hugeIcon={(
                    <>
                        <svg width="200" height="200" viewBox="0 0 100 100" className="fill-black opacity-[0.05]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        <Clock size={120} strokeWidth={4} className="text-black opacity-[0.08] absolute right-[40px]" />
                    </>
                )}
                bgClass="bg-[#f0ad4e]"
                btnClass="bg-[#f0ad4e]"
                glowColor="rgba(240, 173, 78, 0.15)"
                options={options}
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

