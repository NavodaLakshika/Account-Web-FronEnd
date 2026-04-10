import React from 'react';
import { X, BookOpen, Command, HelpCircle, AlertCircle, ExternalLink, Activity, ChevronLeft, ChevronRight, ShieldCheck, Rocket, Key, Database, Layers, Cpu, User } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Soft Backdrop */}
            <div
                className={`fixed inset-0 bg-[#001c3d]/30 backdrop-blur-xl z-[999] transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Floating Card Style Modal - Right Positioned */}
            <div
                className={`fixed top-1/2 right-4 -translate-y-1/2 w-[300px] h-[920px] max-h-[95vh] bg-white/95 backdrop-blur-[60px] z-[1000] rounded-[2px] border border-gray-100 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-x-0 opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : 'translate-x-full opacity-0 pointer-events-none'
                    }`}
                style={{ fontFamily: "'Tahoma', sans-serif" }}
            >
                {/* Vertical Styled Handle - Only visible when open */}
                {isOpen && (
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 left-[-16px] -translate-y-1/2 w-6 h-20 bg-gradient-to-r from-white to-gray-50 shadow-[-5px_0_15px_rgba(0,0,0,0.05)] rounded-[2px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#ff0008] transition-all hover:scale-105 active:scale-95 z-[1020] border-y border-l border-gray-100 border-r-2 border-[#0091ca] group animate-in slide-in-from-right duration-500 delay-300"
                    >
                        <ChevronRight size={12} strokeWidth={4} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}

                <div className="h-full flex flex-col p-5 overflow-hidden">
                    {/* Header Section */}
                    <div className="mb-6 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-1 bg-[#ff0008]" />
                            <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-gray-400 uppercase">Support</span>
                        </div>
                        <h2 className="text-gray-900 text-[24px] font-mono font-bold tracking-tight uppercase leading-none">
                            Help <span className="text-gray-300 font-light">&</span> Resources
                        </h2>
                    </div>

                    {/* Content Container - Flex Justify - No Scroll */}
                    <div className="flex-1 flex flex-col justify-between pb-4 overflow-hidden">

                        {/* System Initialization - Paragraph Style */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-mono font-bold text-[#0091ca] tracking-[0.2em] uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                                System Overview
                            </h3>
                            <div className="bg-gray-50/50 p-4 rounded-[2px] border border-gray-100 space-y-4">
                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">01 Development Protocol</h4>
                                    <p className="text-gray-600 text-[10px] font-mono leading-relaxed uppercase">
                                        The <span className="text-gray-900 font-bold">Onimta Corporate Ecosystem</span> is a secure, cloud-native architecture designed for high-performance financial orchestration. To begin, authenticate via <span className="text-[#0091ca]">Authorized Credentials</span>. 
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">02 Entity Management</h4>
                                    <p className="text-gray-600 text-[10px] font-mono leading-relaxed uppercase">
                                        The system utilizes a <span className="text-gray-900 font-bold">Multi-Tenant Framework</span>, allowing seamless transition between business units. Each entity operates on an isolated data-shard to ensure integrity.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">03 Security Standards</h4>
                                    <p className="text-gray-600 text-[10px] font-mono leading-relaxed uppercase">
                                        Protected by <span className="text-gray-900 font-bold">AES-256 Encryption</span> and synchronized across global nodes in real-time. The architecture maintains redundant fail-safes and traffic routing.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">04 Data Lifecycle</h4>
                                    <p className="text-gray-600 text-[10px] font-mono leading-relaxed uppercase">
                                        Automated <span className="text-gray-900 font-bold">Heuristic Backups</span> are executed every 6 hours with 30-day retention. Data pruning protocols ensure optimal performance without sacrificing historical audit depth.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">05 Compliance & Audit</h4>
                                    <p className="text-gray-600 text-[10px] font-mono leading-relaxed uppercase">
                                        Every system interaction is recorded within a <span className="text-gray-900 font-bold">Immutable Audit Trail</span>. Compliance reports are generated automatically for regulatory alignment and internal oversight.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[9px] font-bold text-gray-900 tracking-widest uppercase">06 Network Resilience</h4>
                                    <p className="text-gray-600 text-[11px] font-mono leading-relaxed uppercase">
                                        Global latency is minimized through <span className="text-gray-900 font-bold">Edge-Node Distribution</span>. In the event of a cluster failure, traffic is rerouted within 500ms to the nearest operational node.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Status Section - Light Style */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <h3 className="text-[9px] font-mono font-bold text-gray-400 tracking-[0.2em] uppercase border-b border-gray-50 pb-2">Infrastructure Health</h3>
                            <div className="p-3 bg-gray-50 rounded-[2px] border border-gray-100 relative overflow-hidden group">
                                <Activity size={30} strokeWidth={1} className="absolute -right-2 -bottom-2 text-gray-200 opacity-[0.2] group-hover:scale-125 transition-transform duration-1000" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-emerald-500 text-[9px] font-mono font-bold uppercase tracking-widest">Active</span>
                                    </div>
                                    <span className="text-gray-400 text-[8px] font-mono uppercase tracking-widest">v2.4.0</span>
                                </div>
                                <p className="text-gray-700 text-[11px] font-mono font-bold uppercase">Architecture Stable</p>
                            </div>
                        </div>


                    </div>

                    {/* Footer Branding - Static Bottom */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between opacity-50 shrink-0">
                        <div className="text-[9px] text-gray-400 font-mono uppercase tracking-[0.1em]">Support Hub</div>
                        <div className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-widest">2026.4.10</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpModal;
