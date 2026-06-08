import React from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

const toastBaseStyle = `
    max-w-[320px] w-full
    bg-[#1a1b26]
    border border-slate-800
    shadow-[0_10px_40px_rgb(0,0,0,0.5)]
    rounded-xl
    overflow-hidden
    pointer-events-auto
    flex
    flex-col
    relative
`;

const animationStyle = (visible, position = 'top-right') => {
    let slideIn = 'slide-in-from-top-5';
    let slideOut = 'slide-out-to-top-5';

    if (position === 'bottom-right') {
        slideIn = 'slide-in-from-bottom-5';
        slideOut = 'slide-out-to-bottom-5';
    } else if (position === 'top-right') {
        slideIn = 'slide-in-from-right-5';
        slideOut = 'slide-out-to-right-5';
    }

    return visible
        ? `animate-in ${slideIn} fade-in zoom-in-95 duration-300`
        : `animate-out ${slideOut} fade-out zoom-out-95 duration-200`;
};

const ToastLayout = ({
    t,
    icon,
    title,
    subtitle,
    gradientFrom,
    titleColor,
    progressColor,
    duration = 2000,
    position = 'top-right'
}) => (
    <div className={`${toastBaseStyle} ${animationStyle(t.visible, position)}`}>

        {/* Subtle Background Glow Gradient */}
        <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${gradientFrom} to-transparent opacity-20 pointer-events-none`} />

        {/* Main Content Area */}
        <div className="flex flex-row w-full flex-1 items-center p-3 gap-3 relative z-10">

            {/* Icon */}
            <div className="flex-shrink-0">
                {icon}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <h3 className={`text-[13px] font-semibold ${titleColor} leading-tight`}>
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-[11px] text-slate-300 mt-0.5 opacity-90 leading-snug truncate">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Dismiss overlay button (invisible but clickable over the whole toast or a tiny x) */}
            <button
                onClick={() => toast.dismiss(t.id)}
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 transition-colors opacity-0 hover:opacity-100"
            >
                <X size={14} />
            </button>
        </div>

        {/* Progress Bar Loader */}
        <div className="w-full h-1 bg-slate-800 relative z-10">
            <div
                className={`h-full ${progressColor}`}
                style={{
                    animation: `toastProgress ${duration}ms linear forwards`
                }}
            />
        </div>
    </div>
);

const parseArgs = (arg) => {
    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg) && !React.isValidElement(arg)) {
        return { subMessage: null, options: arg };
    }
    return { subMessage: arg, options: {} };
};

/* SUCCESS */
export const showSuccessToast = (message, subMessageOrOptions) => {
    const { subMessage, options } = parseArgs(subMessageOrOptions);
    const duration = options.duration || 2000;
    const displayTitle = subMessage ? message : "Success";
    const displaySubtitle = subMessage ? subMessage : (message || "Operation completed successfully");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                icon={
                    <div className="w-7 h-7 rounded-md bg-[#22c55e] flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Check size={15} strokeWidth={4} className="text-[#064e3b]" />
                    </div>
                }
                gradientFrom="from-[#22c55e]"
                titleColor="text-[#4ade80]"
                progressColor="bg-[#22c55e]"
                position="top-right"
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
    const duration = options.duration || 2000;
    const displayTitle = subMessage ? message : "Error";
    const displaySubtitle = subMessage ? subMessage : (message || "An error occurred");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                icon={
                    <div className="w-7 h-7 rounded-md bg-[#ef4444] flex items-center justify-center shadow-lg shadow-red-500/20">
                        <X size={15} strokeWidth={4} className="text-[#450a0a]" />
                    </div>
                }
                gradientFrom="from-[#ef4444]"
                titleColor="text-[#f87171]"
                progressColor="bg-[#ef4444]"
                position="top-right"
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
    const duration = options.duration || 3000;
    const displayTitle = subMessage ? message : "Information";
    const displaySubtitle = subMessage ? subMessage : (message || "Here is some information");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                icon={
                    <div className="w-7 h-7 rounded-md bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <AlertCircle size={15} strokeWidth={3} className="text-[#1e3a8a]" />
                    </div>
                }
                gradientFrom="from-[#3b82f6]"
                titleColor="text-[#60a5fa]"
                progressColor="bg-[#3b82f6]"
                position="top-right"
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
    const duration = options.duration || 3000;
    const displayTitle = subMessage ? message : "Pending";
    const displaySubtitle = subMessage ? subMessage : (message || "Processing your request");
    toast.custom(
        (t) => (
            <ToastLayout
                t={t}
                title={displayTitle}
                subtitle={displaySubtitle}
                icon={
                    <div className="w-7 h-7 rounded-md bg-[#00D1FF] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Clock size={15} strokeWidth={3} className="text-[#083344]" />
                    </div>
                }
                gradientFrom="from-[#00D1FF]"
                titleColor="text-[#00D1FF]"
                progressColor="bg-[#00D1FF]"
                position="top-right"
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

