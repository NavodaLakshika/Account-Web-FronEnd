import React from 'react';
import { AlertTriangle, Check, X, Bell } from "lucide-react";
import { DotLottiePlayer } from '@dotlottie/react-player';

const AlarmAlertModal = ({ isOpen, onClose, task, onComplete }) => {
    React.useEffect(() => {
        if (isOpen) {
            const speech = new SpeechSynthesisUtterance("You have one reminder alert.");
            speech.rate = 1.0;
            speech.pitch = 1.0;
            window.speechSynthesis.speak(speech);
        }
    }, [isOpen]);

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            {/* Soft Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500" 
                onClick={onClose}
            />
            
            {/* Modal Container (Compact small size) */}
            <div className="relative w-full max-w-[340px] bg-white rounded-[10px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Section (Flat Red - Compact) */}
                <div className="bg-[#f05252] h-[150px] flex items-center justify-center relative overflow-hidden">
                    {/* Background Decorative Bell */}
                    <Bell size={140} className="absolute -left-8 -top-8 text-white/10 -rotate-12" />
                    
                    {/* Main Bell Icon Animation in Top Center */}
                    <div className="w-32 h-32 z-10">
                        <DotLottiePlayer
                            src="/lottiefile/Notification.lottie"
                            autoplay
                            loop
                            className="w-full h-full drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* Content Section (White) */}
                <div className="p-8 pt-6 flex flex-col items-center text-center">
                    <h2 className="text-[36px] font-mono font-bold text-slate-800 mb-1 tracking-tighter uppercase">
                        Reminder!
                    </h2>
                    
                    <p className="text-slate-600 text-[12px] font-mono font-bold leading-snug mb-6 px-2">
                        You have one pending job for today.
                    </p>

                    {/* Time/Date Info Inside Content */}
                    <div className="flex gap-3 mb-8 w-full">
                        <div className="flex-1 py-2.5 bg-slate-50 rounded-xl border border-slate-100 uppercase">
                             <span className="text-[12px] font-mono text-slate-400 block mb-0.5">Time</span>
                             <span className="text-sm font-bold text-[#000080]">{task.time || task.Time}</span>
                        </div>
                        <div className="flex-1 py-2.5 bg-slate-50 rounded-xl border border-slate-100 uppercase">
                             <span className="text-[12px] font-mono text-slate-400 block mb-0.5">Date</span>
                             <span className="text-sm font-bold text-slate-700">{task.date || task.Date}</span>
                        </div>
                    </div>

                    {/* Capsule Buttons (Style matching the image) */}
                    <div className="flex flex-col w-full gap-2.5">
                        <button 
                            onClick={() => {
                                if (onComplete) onComplete(task);
                                onClose();
                            }}
                            className="w-full h-[48px] bg-[#f05252] text-white text-[13px] font-black rounded-[10px] hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                         Mark Done
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="w-full h-[48px] bg-white border-2 border-slate-200 text-slate-500 text-[13px] font-black rounded-[10px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                             Dismiss 
                        </button>
                    </div>
                </div>
                
                {/* Visual Strip at bottom */}
                <div className="h-2 bg-slate-50" />
            </div>
        </div>
    );
};

export default AlarmAlertModal;
