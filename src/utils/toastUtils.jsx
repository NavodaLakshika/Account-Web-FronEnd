import React from 'react';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { X } from 'lucide-react';

/**
 * Professional toast notifications mirroring the Purchase Order style.
 */
export const showSuccessToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-emerald-50 relative overflow-hidden">
                <div className="h-full bg-emerald-500 absolute left-0 top-0" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 3000, position: 'top-right' });
};

export const showErrorToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                        <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-red-50 relative overflow-hidden">
                <div className="h-full bg-red-500 absolute left-0 top-0" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 3000, position: 'top-right' });
};

// Add this global style to your main CSS or layout if not already present
// @keyframes toastProgress { 0% { width: 100%; } 100% { width: 0%; } }
