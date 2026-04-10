import React, { useState } from 'react';
import { X, MessageCircle, Mail, Building, ChevronRight, ArrowLeft } from 'lucide-react';

const ContactSupportModal = ({ isOpen, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <>
            {/* Subtle Backdrop with Blur */}
            <div 
                className={`fixed inset-0 z-[105] bg-black/10 backdrop-blur-[4px] transition-opacity duration-700 cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div className={`fixed right-4 bottom-4 md:right-12 md:bottom-12 z-[110] transition-transform duration-700 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+48px)]'}`}>
                <div 
                    className="w-[calc(100vw-32px)] md:w-[420px] h-[280px] relative transition-all duration-700 [perspective:1000px]"
                >
                    <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        
                        {/* FRONT SIDE (Direct Contact) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-[5px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-7 [backface-visibility:hidden] flex flex-col justify-center overflow-y-auto custom-scrollbar">
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-[#00acee] transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div>
                                <div className="text-center mb-6">
                                    <h4 className="text-[#1a1a1a] font-mono font-bold text-[13px] uppercase tracking-[0.3em] mb-2 leading-none">Need Assistance?</h4>
                                    <div className="w-8 h-[2px] bg-[#00D1FF] mx-auto" />
                                </div>

                                <div className="space-y-3">
                                    <a 
                                        href="https://wa.me/94771234567" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center gap-3 rounded-[5px] transition-all active:scale-[0.97] group shadow-lg shadow-green-500/10"
                                    >
                                        <MessageCircle size={16} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">WhatsApp Support</span>
                                    </a>
                                    
                                    <a 
                                        href="mailto:it-help@onimta.com" 
                                        className="w-full py-3.5 bg-[#00D1FF] hover:bg-[#00acee] text-white flex items-center justify-center gap-3 rounded-[5px] transition-all active:scale-[0.97] group shadow-lg shadow-cyan-500/10"
                                    >
                                        <Mail size={16} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">Email Support Desk</span>
                                    </a>
                                </div>
                            </div>

                            {/* Company Profile Trigger - Fixed Bottom Tab Style */}
                            <div className="absolute inset-x-0 bottom-0">
                                <button 
                                    onClick={() => setIsFlipped(true)}
                                    className="w-full h-10 bg-gray-50/80 hover:bg-[#00acee]/10 text-gray-400 hover:text-[#00acee] transition-all flex items-center justify-center gap-2 border-t border-gray-100 group"
                                >
                                    <Building size={12} className="opacity-40 group-hover:opacity-100" />
                                    <span className="font-black text-[8px] uppercase tracking-[0.3em]">Corporate Profile</span>
                                    <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* BACK SIDE (Folded-Tab Style) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-[5px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden border border-gray-100">
                            
                            {/* Top Content (White Branding Area) */}
                            <div className="flex-grow flex flex-col items-center justify-center relative px-8">
                                <button 
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-gray-200 hover:text-[#00acee] transition-colors z-20"
                                >
                                    <X size={18} />
                                </button>

                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 mb-4">
                                        <img src="/logo-removebg.png" alt="Onimta Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <h3 className="text-gray-500 font-bold tracking-widest text-[16px] uppercase leading-none">Onimta Cloud</h3>
                                    <p className="text-[#00acee] text-[8px] uppercase tracking-[0.2em] font-black mt-2">Innovative Enterprise Solutions</p>
                                </div>
                            </div>

                            {/* Folded Tab Footer Section - User Specific Geometric Logic */}
                            <div className="relative h-16 w-full mt-auto select-none">
                                <div className="absolute inset-0" style={{ background: '#3a3a3a', clipPath: 'polygon(0 0, 15% 0, 20% 100%, 0 100%)' }} />
                                <div className="absolute inset-0" style={{ background: '#4a4a4a', clipPath: 'polygon(0 0, 15% 0, 0 100%)' }} />
                                <div className="absolute inset-0" style={{ background: '#00BFDE', clipPath: 'polygon(13% 0, 85% 0, 93% 100%, 5% 100%)' }} />
                                <div className="absolute inset-0" style={{ background: '#3a3a3a', clipPath: 'polygon(85% 0, 100% 0, 100% 100%, 80% 100%)' }} />
                                <div className="absolute inset-0" style={{ background: '#4a4a4a', clipPath: 'polygon(95% 0, 100% 0, 100% 100%)' }} />

                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 z-20">
                                    <p className="text-white text-[7px] tracking-[0.3em] opacity-80 font-bold uppercase">
                                        Innovative Enterprise Solutions
                                    </p>
                                    <a href="https://www.onimta.com" target="_blank" rel="noreferrer" className="text-white text-[10px] font-black tracking-[0.1em] uppercase hover:underline">
                                        WWW.ONIMTA.COM
                                    </a>
                                </div>
                                
                                <button 
                                    onClick={() => setIsFlipped(false)}
                                    className="absolute left-4 bottom-3 z-30 text-white/30 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #eee;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #00D1FF;
                    }
                `}
            </style>
        </>
    );
};

export default ContactSupportModal;
