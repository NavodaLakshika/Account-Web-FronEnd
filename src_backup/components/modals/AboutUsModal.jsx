import React from 'react';
import { X, Globe, Building2, ChevronUp, ChevronDown, Mail, Layout, Database, Cpu, MapPin } from 'lucide-react';

const AboutUsModal = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Soft Backdrop - No blur as requested */}
            <div
                className={`fixed inset-0 bg-[#001c3d]/5 z-[999] transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Flat, Sharp Banner Style Modal - Matching Login Page */}
            <div
                className={`fixed bottom-0 left-0 w-full min-h-[250px] bg-white z-[1000] rounded-none border-t border-slate-300 transition-all duration-700 ease-in-out overflow-visible ${isOpen ? 'translate-y-0 opacity-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]' : 'translate-y-full opacity-0 pointer-events-none'
                    }`}
                style={{ fontFamily: "'Tahoma', 'Arial', sans-serif" }}
            >
                {/* Styled Collapse Handle - Sharp Rectangular Tab */}
                {isOpen && (
                    <button
                        onClick={onClose}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-8 h-10 bg-white shadow-sm rounded-none flex items-center justify-center gap-2 text-slate-500 hover:text-[#00acee] transition-all hover:-translate-y-1 z-[1020] border-t border-x border-slate-300 group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
                    >
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase group-hover:text-[#00acee] transition-colors">Close</span>
                        <ChevronDown size={16} strokeWidth={3} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                )}
                <div className="flex flex-col md:flex-row h-full w-full max-w-[1600px] mx-auto rounded-none overflow-hidden relative">
                    {/* Left Section (Branding) */}
                    <div className="w-full md:w-[45%] h-full p-10 flex flex-col justify-center relative z-10 bg-slate-50/50">
                        <div className="space-y-4 text-left border-l-[4px] border-[#00acee] pl-8">
                            <div className="space-y-1">
                                <p className="text-[12px] font-mono font-bold tracking-[0.4em] uppercase text-slate-500">
                                    <span className="text-[#00acee]">Onimta</span> <span className="text-slate-800">Tech</span>
                                </p>
                                <h2 className="text-slate-900 text-[32px] font-bold tracking-tight uppercase leading-none ml-[-2px]">
                                    Software <span className="text-slate-400 font-light">Engineering</span>
                                </h2>
                            </div>

                            <p className="text-slate-500 text-[12px] leading-relaxed max-w-[360px] font-mono">
                                Architecting enterprise-grade accounting architectures and intelligent automation solutions with precision.
                            </p>

                            <div className="flex items-center gap-6 pt-4">
                                <a href="https://www.onimtait.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-[#00acee] transition-colors group">
                                    <Globe size={14} className="group-hover:text-[#00acee] transition-colors" />
                                    <span className="text-[11px] font-mono font-bold tracking-widest uppercase">www.onimtait.com</span>
                                </a>
                                <span className="text-slate-300 text-[11px] font-mono font-bold tracking-widest">EST. 2013</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section (REAN Style details from image) */}
                    <div className="flex-1 h-full bg-white p-8 flex flex-col justify-center gap-2 relative z-10">

                        {[
                            {
                                title: 'ERP Systems',
                                color: 'bg-[#0f172a]',
                                icon: <Database size={14} />,
                                desc: 'Cloud-native accounting architecture for large scale enterprises.'
                            },
                            {
                                title: 'Web Solutions',
                                color: 'bg-[#1e293b]',
                                icon: <Layout size={14} />,
                                desc: 'High-performance web platforms for textile & restaurant operations.'
                            },
                            {
                                title: 'AI Company',
                                color: 'bg-[#334155]',
                                icon: <Cpu size={14} />,
                                desc: 'Intelligent automation and predictive analytics for data-driven growth.'
                            },
                            {
                                title: 'HQ Location',
                                color: 'bg-[#000000]',
                                icon: <MapPin size={14} />,
                                desc: 'Lake Road, Maharagama, Colombo. Global Operational Headquarters.'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center group w-full">
                                {/* Row Container */}
                                <div className="flex-1 bg-white rounded-none h-10 flex items-center overflow-hidden border border-slate-300 hover:border-[#00acee] transition-all shadow-sm">
                                    {/* Color Block */}
                                    <div className={`${item.color} w-36 h-full flex items-center justify-between px-4 shrink-0 border-r border-slate-300`}>
                                        <span className="text-white text-[9px] font-bold uppercase tracking-wider">{item.title}</span>
                                        <div className="text-white opacity-80">{item.icon}</div>
                                    </div>
                                    {/* Description */}
                                    <div className="px-6 flex-1 bg-slate-50 group-hover:bg-blue-50/30 transition-colors h-full flex items-center">
                                        <p className="text-slate-600 text-[10px] font-mono tracking-tight uppercase line-clamp-1">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Decorative Loading Bar (Moved inside overflow-hidden to fix border artifacts) */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00acee] via-[#6366f1] to-[#00acee] animate-[shimmer_3s_ease-in-out_infinite] origin-left shadow-lg" style={{ width: '100%', backgroundSize: '200% auto' }} />
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shimmer {
                        0% { background-position: 200% center; }
                        100% { background-position: -200% center; }
                    }
                `}} />
            </div>
        </>
    );
};

export default AboutUsModal;
