import React from 'react';
import { X, Check, Clock, Calendar, Bell } from "lucide-react";

const AlarmAlertModal = ({ isOpen, onClose, task, onComplete }) => {
    React.useEffect(() => {
        // Voice alert removed for subtle toast style
    }, [isOpen]);

    if (!isOpen || !task) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[2000] flex items-start justify-center font-['Plus_Jakarta_Sans'] pointer-events-none">
            {/* Top Bar Alert Container - Eye-catching Vibrant Red */}
            <div className="relative w-full h-[40px] pointer-events-auto bg-[#de212d] rounded-none shadow-[0_4px_20px_rgba(255,0,60,0.4)] overflow-hidden animate-in slide-in-from-top-full fade-in duration-500 flex items-center">
                
                {/* Wavy aesthetic patterns (subtle) */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-[40%] rotate-45 pointer-events-none" />
                <div className="absolute top-0 right-40 w-24 h-24 bg-black/10 rounded-[40%] rotate-12 pointer-events-none" />
                
                <div className="px-6 flex items-center justify-between w-full h-full relative z-10 mx-auto">
                    
                    {/* Left: Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-white animate-bounce" strokeWidth={2.5} />
                            <h2 className="text-[13px] font-extrabold text-white tracking-wide uppercase">
                                REMINDER:
                            </h2>
                            <span className="text-white/90 text-[13px] font-semibold">
                                1 pending job
                            </span>
                        </div>
                        
                        <div className="h-4 w-px bg-white/30 mx-2"></div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-white/80" />
                                <span className="text-[12px] font-bold text-white tracking-wider">{task.time || task.Time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-white/80" />
                                <span className="text-[12px] font-bold text-white tracking-wider">{task.date || task.Date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                if (onComplete) onComplete(task);
                                onClose();
                            }}
                            className="h-[26px] px-4 bg-white text-[#FF003C] text-[11px] font-extrabold rounded-md shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center tracking-widest"
                        >
                            <Check size={14} className="mr-1.5" strokeWidth={3} />
                            MARK DONE
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="h-[26px] px-3 border border-white/40 text-white text-[11px] font-extrabold rounded-md hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center tracking-widest"
                        >
                            <X size={14} className="mr-1" strokeWidth={3} />
                            DISMISS
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default AlarmAlertModal;
