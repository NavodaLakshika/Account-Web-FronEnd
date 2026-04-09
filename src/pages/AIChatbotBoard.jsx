import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Maximize2, Minimize2, Trash2, Shield, Zap, Cpu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { DotLottiePlayer } from '@dotlottie/react-player';

const AIChatbotBoard = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "System Online. I am your specialized AI Assistant. How can I assist with your accounts today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const messagesEndRef = useRef(null);



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                text: getMockResponse(inputValue),
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };
    const getMockResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('balance')) return "Analyzing ledgers... Your current total liquidity is $124,500.20. All balances are verified against recent bank feeds.";
        if (q.includes('vendor')) return "Retrieving vendor profiles... You have 48 active vendor accounts. 3 payments are pending approval.";
        return "Query processed. I can assist with balance inquiries, vendor reports, or general accounting logic. What is your next instruction?";
    };

    const handleClearChat = () => {
        setMessages([
            { id: 1, text: "System Online. I am your specialized AI Assistant. How can I assist with your accounts today?", sender: 'ai', timestamp: new Date() }
        ]);
        setInputValue('');
        setIsTyping(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={`fixed inset-0 z-[1100] flex items-center justify-center p-0 md:p-6 transition-all duration-700 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {!showIntro && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all duration-700" onClick={onClose} />
                )}

                {/* Technical Blueprint Chat Container */}
                <div className={`relative overflow-hidden flex transition-all duration-500 ease-out ${isMaximized ? 'w-full h-full' : 'w-full md:max-w-6xl h-full md:h-[85vh] md:max-h-[850px]'} ${showIntro ? 'bg-transparent border-none shadow-none' : 'bg-[#011e41] border-0 md:border md:border-white/20 rounded-none md:rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.05)]'}`}>

                    {/* Blueprint Grid Overlay for Entire Modal */}
                    {!showIntro && (
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    )}

                    {/* Left Sidebar: Technical Robot Identity */}
                    <div className={`hidden lg:flex flex-col border-r border-white/10 relative z-10 bg-[#011e41]/50 backdrop-blur-xl transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'w-[80px] p-4' : 'w-[300px] p-8'}`}>
                        {/* Session Status Section */}
                        <div className={`mb-8 flex flex-col ${sidebarCollapsed ? 'hidden' : 'items-start'}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[#00BFDE] text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Session Active</span>
                            </div>
                            <h3 className="text-white text-xl font-black uppercase tracking-tight leading-none mt-2">
                                Hello, {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).empName.split(' ')[0] : 'Operator'}
                            </h3>
                        </div>

                        <div className={`flex-1 flex flex-col items-center justify-center ${sidebarCollapsed ? 'hidden' : ''}`}>
                            {/* The Robot Lottie Animation */}
                            <div className="w-48 h-48 flex items-center justify-center relative mb-6">
                                <DotLottiePlayer
                                    src="/images/Ai Robot Vector Art.lottie"
                                    autoplay
                                    loop
                                    className="w-full h-full"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#011e41] to-transparent z-10" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-white text-[15px] font-black tracking-[0.4em] mb-2">BOOT ASSISTANT</h2>
                                <p className="text-white/20 text-[7px] font-bold uppercase tracking-[0.2em]">Neural Processing v4.2</p>
                            </div>
                        </div>

                        {/* Sidebar Controls */}
                        <div className={`mt-auto pt-8 space-y-4 border-t border-white/10 flex flex-col ${sidebarCollapsed ? 'items-center' : ''}`}>
                            <button 
                                onClick={handleClearChat}
                                title="New Session"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl ${sidebarCollapsed ? 'w-12 h-12 bg-[#00BFDE]' : 'w-full py-3 px-4 bg-[#00BFDE]'} text-[#011e41] shadow-[0_0_20px_rgba(0,191,222,0.2)]`}
                            >
                                <Plus size={sidebarCollapsed ? 20 : 16} strokeWidth={3} />
                                {!sidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">New Session</span>}
                            </button>

                            <button 
                                onClick={handleClearChat}
                                title="Clear Log"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 ${sidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 px-4'} text-white/40 hover:text-white`}
                            >
                                <Trash2 size={sidebarCollapsed ? 18 : 14} className="group-hover:text-red-400" />
                                {!sidebarCollapsed && <span className="text-[9px] font-black uppercase tracking-widest">Clear Log</span>}
                            </button>

                            <button 
                                onClick={onClose}
                                title="Terminate"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 ${sidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 px-4'} text-red-500`}
                            >
                                <X size={sidebarCollapsed ? 18 : 14} />
                                {!sidebarCollapsed && <span className="text-[9px] font-black uppercase tracking-widest">Terminate</span>}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Chat Area */}
                    <div className="flex-1 flex flex-col relative z-20 bg-transparent min-w-0">
                        {/* Sidebar Toggle Trigger (Floating on Divider) */}
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 bg-[#011e41] border border-white/20 text-white/40 hover:text-white items-center justify-center rounded-r-lg z-[30] transition-colors group"
                        >
                            {sidebarCollapsed ? <ChevronRight size={14} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={14} className="group-hover:scale-125 transition-transform" />}
                        </button>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 md:space-y-12 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`flex gap-3 md:gap-6 items-end max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

                                        {/* Avatar Bubble */}
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 bg-white/5 overflow-hidden">
                                            {msg.sender === 'user' ? (
                                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                                    <User size={18} className="text-white md:hidden" />
                                                    <User size={26} className="text-white hidden md:block" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-[#00BFDE]/20 flex items-center justify-center">
                                                    <Bot size={20} className="text-[#00BFDE] md:hidden" />
                                                    <Bot size={28} className="text-[#00BFDE] hidden md:block" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat Bubble */}
                                        <div className="relative mb-2">
                                            <div className={`px-4 py-3 md:px-5 md:py-3 text-[10px] md:text-[11px] font-mono leading-relaxed border backdrop-blur-sm rounded-xl relative shadow-lg ${msg.sender === 'user' ? 'bg-white/5 border-white/20 text-white' : 'bg-white/10 border-white/30 text-white'}`}>
                                                {/* Custom Fin Tail */}
                                                {msg.sender === 'user' ? (
                                                    <svg className="absolute -right-4 bottom-0 w-6 h-8 text-white/5" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                        <path d="M0 0V32H24C12 32 6 20 0 0Z" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg className="absolute -left-4 bottom-0 w-6 h-8 text-white/10" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                        <path d="M24 0V32H0C12 32 18 20 24 0Z" fill="currentColor" />
                                                    </svg>
                                                )}
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 md:gap-6 items-end">
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 bg-white/5 overflow-hidden">
                                            <div className="w-full h-full bg-[#00BFDE]/20 flex items-center justify-center">
                                                <Bot size={16} className="text-[#00BFDE] md:hidden" />
                                                <Bot size={24} className="text-[#00BFDE] hidden md:block" />
                                            </div>
                                        </div>

                                        <div className="relative mb-2">
                                            <div className="px-5 py-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                                                <svg className="absolute -left-4 bottom-0 w-6 h-8 text-white/10" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                    <path d="M24 0V32H0C12 32 18 20 24 0Z" fill="currentColor" />
                                                </svg>
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-8 border-t border-white/10 bg-white/5 backdrop-blur-md">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 md:gap-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Write your message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] md:text-[11px] font-mono text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20 placeholder:font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-white text-[#011e41] p-3 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
                                >
                                    <Send size={18} strokeWidth={2.5} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: white; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f0f0f0; }
            `}</style>
        </>
    );
};

export default AIChatbotBoard;

