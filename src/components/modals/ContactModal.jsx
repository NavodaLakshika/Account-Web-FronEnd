import React from 'react';
import { X, Globe, Phone, Mail, MessageCircle, ChevronUp, Headset } from 'lucide-react';

const ContactModal = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Soft Backdrop */}
            <div 
                className={`fixed inset-0 bg-[#001c3d]/20 backdrop-blur-md z-[999] transition-opacity duration-700 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Floating Banner Style Modal - Professional Light Bottom-Up */}
            <div 
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[1150px] h-[230px] bg-white/95 backdrop-blur-[40px] z-[1000] rounded-[2px] border border-gray-100 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                    isOpen ? 'translate-y-0 opacity-100 shadow-[0_40px_80px_rgba(0,0,0,0.1)]' : '-translate-y-[calc(100%+80px)] opacity-0 pointer-events-none'
                }`}
                style={{ fontFamily: "'Tahoma', sans-serif" }}
            >
                {/* Styled Collapse Handle - Only visible when open */}
                {isOpen && (
                    <button 
                        onClick={onClose}
                        className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-white to-gray-50 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[2px] flex items-center justify-center gap-2 text-gray-400 hover:text-[#ff0008] transition-all hover:scale-105 active:scale-95 z-[1020] border-x border-b border-gray-100 border-t-2 border-[#0091ca] group animate-in fade-in zoom-in duration-500 delay-300"
                    >
                        <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Minimize</span>
                        <ChevronUp size={12} strokeWidth={4} className="group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                )}
                <div className="flex h-full w-full">
                    {/* Left Section (Branding) */}
                    <div className="w-[45%] h-full p-8 flex flex-col justify-center bg-gray-50/10">
                        <div className="space-y-4 text-left border-l-[4px] border-[#0091ca] pl-8">
                            <div className="space-y-1">
                                <p className="text-[12px] font-mono font-bold tracking-[0.4em] uppercase">
                                    <span className="text-[#ff0008]">Onimta</span> <span className="text-black">Tech</span>
                                </p>
                                <h2 className="text-gray-900 text-[32px] font-mono font-bold tracking-tight uppercase leading-none ml-[-2px]">
                                    Global <span className="text-gray-400 font-light">Support</span>
                                </h2>
                            </div>
                            
                            <p className="text-gray-500 text-[11px] leading-relaxed max-w-[340px] font-mono">
                                24/7 technical assistance and corporate inquiry channels. Connecting you to intelligence across the globe.
                            </p>

                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Globe size={14} />
                                    <span className="text-[12px] font-mono font-bold tracking-widest uppercase">Global Network</span>
                                </div>
                                <span className="text-gray-200 text-[10px] font-mono tracking-widest uppercase italic">Rapid Response Enabled</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section (REAN Style details - Contact Info) */}
                    <div className="flex-1 h-full bg-white/50 p-4 flex flex-col justify-center gap-2 relative">
                        {/* Vertical Blue Anchor */}
                        <div className="absolute top-1/2 left-0 h-[154px] w-[4px] bg-[#0091ca] -translate-y-1/2 z-10" />

                        {/* Contact Rows */}
                        {[
                            { 
                                title: 'WhatsApp', 
                                color: 'bg-[#25D366]', 
                                icon: <MessageCircle size={14} />, 
                                desc: '+94 77 123 4567 | Corporate Instant Messaging' 
                            },
                            { 
                                title: 'Direct Email', 
                                color: 'bg-[#1e293b]', 
                                icon: <Mail size={14} />, 
                                desc: 'info@onimta.com | 2-Hour Response Protocol' 
                            },
                            { 
                                title: 'Operations', 
                                color: 'bg-[#0c172a]', 
                                icon: <Headset size={14} />, 
                                desc: '+94 11 281 7575 | 24/7 Global Hotline' 
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center group">
                                {/* Row Container */}
                                <div className="flex-1 bg-gray-50/50 rounded-[4px] h-8 flex items-center overflow-hidden border border-gray-100 shadow-sm group-hover:bg-white transition-all">
                                    {/* Color Block */}
                                    <div className={`${item.color} w-32 h-full flex items-center justify-between px-4 shrink-0`}>
                                        <span className="text-white text-[9px] font-bold uppercase tracking-wider">{item.title}</span>
                                        <div className="text-white opacity-80">{item.icon}</div>
                                    </div>
                                    {/* Description */}
                                    <div className="px-6 flex-1 text-left">
                                        <p className="text-gray-500 text-[10px] font-mono tracking-tight uppercase line-clamp-1 truncate">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Decorative Loading Bar (Reversed Direction) */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gray-50/20">
                    <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#ff0008] animate-[loading_4s_linear_infinite] origin-left shadow-[0_0_10px_rgba(66,133,244,0.2)]" style={{ width: '40%' }} />
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes loading {
                        0% { width: 0%; opacity: 0.3; }
                        50% { width: 70%; opacity: 1; }
                        100% { width: 100%; opacity: 0; }
                    }
                `}} />
            </div>
        </>
    );
};

export default ContactModal;
