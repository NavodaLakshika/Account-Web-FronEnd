import React, { useState } from 'react';
import { X, MessageCircle, Mail, Building, ChevronRight, ArrowLeft } from 'lucide-react';

const ContactSupportModal = ({ isOpen, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <>
            {/* Subtle Backdrop without Blur */}
            <div
                className={`fixed inset-0 z-[105] bg-black/10 transition-opacity duration-700 cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div className={`fixed right-4 bottom-4 md:right-12 md:bottom-12 z-[110] transition-transform duration-700 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+48px)]'}`}>
                <div
                    className="w-[calc(100vw-32px)] md:w-[420px] h-[280px] relative transition-all duration-700 [perspective:1000px]"
                >
                    <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                        {/* FRONT SIDE (Direct Contact) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-none border border-slate-300 shadow-xl p-8 [backface-visibility:hidden] flex flex-col justify-center overflow-y-auto custom-scrollbar">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0078d4] transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div>
                                <div className="text-center mb-8">
                                    <h4 className="text-slate-800 font-bold text-[14px] uppercase tracking-widest mb-3 leading-none">Need Assistance?</h4>
                                    <div className="w-12 h-[2px] bg-[#0078d4] mx-auto" />
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href="https://wa.me/+94755000755"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center gap-3 rounded-none transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        <MessageCircle size={18} />
                                        <span className="font-bold text-[11px] uppercase tracking-wider">WhatsApp Support</span>
                                    </a>

                                    <a
                                        href="mailto:sales@onimtait.com"
                                        className="w-full py-3.5 bg-[#0078d4] hover:bg-[#005a9e] text-white flex items-center justify-center gap-3 rounded-none transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        <Mail size={18} />
                                        <span className="font-bold text-[11px] uppercase tracking-wider">Email Support Desk</span>
                                    </a>
                                </div>
                            </div>

                            {/* Company Profile Trigger - Fixed Bottom Tab Style */}
                            <div className="absolute inset-x-0 bottom-0">
                                <button
                                    onClick={() => setIsFlipped(true)}
                                    className="w-full h-12 bg-slate-50 hover:bg-[#0078d4]/10 text-slate-500 hover:text-[#0078d4] transition-all flex items-center justify-center gap-2 border-t border-slate-200 group"
                                >
                                    <Building size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">Corporate Profile</span>
                                    <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* BACK SIDE (Folded-Tab Style) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-none border border-slate-300 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden">

                            {/* Top Content (White Branding Area) */}
                            <div className="flex-grow flex flex-col items-center justify-center relative px-8 pb-12">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0078d4] transition-colors z-20"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 mb-4">
                                        <img src="/logo-removebg.png" alt="Onimta Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold tracking-widest text-[16px] uppercase leading-none">Onimta Cloud</h3>
                                    <p className="text-[#0078d4] text-[9px] uppercase tracking-[0.2em] font-bold mt-2 mb-4">Innovative Enterprise Solutions</p>
                                    <a href="https://www.onimtait.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#0078d4] text-[11px] font-bold tracking-wider uppercase hover:underline transition-colors">
                                        www.onimtait.com
                                    </a>
                                </div>
                            </div>

                            {/* Back Button - Symmetrical with Front Side */}
                            <div className="absolute inset-x-0 bottom-0">
                                <button
                                    onClick={() => setIsFlipped(false)}
                                    className="w-full h-12 bg-slate-50 hover:bg-[#0078d4]/10 text-slate-500 hover:text-[#0078d4] transition-all flex items-center justify-center gap-2 border-t border-slate-200 group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">Back to Contact</span>
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
