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
    
    const topBarColor = localStorage.getItem('topBarColor') || '#0285fd';

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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-all duration-700" onClick={onClose} />
                )}

                {/* Chat Container */}
                <div 
                    className={`relative overflow-hidden flex transition-all duration-500 ease-out ${isMaximized ? 'w-full h-full' : 'w-full md:max-w-6xl h-full md:h-[85vh] md:max-h-[850px]'} ${showIntro ? 'bg-transparent border-none shadow-none' : 'bg-white border-0 md:border md:border-gray-100 rounded-none md:rounded-2xl shadow-2xl'}`}
                >
                    {/* System Color Left Accent */}
                    {!showIntro && (
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 z-[120]" 
                            style={{ backgroundColor: topBarColor }}
                        />
                    )}
                    
                    {/* Top Close Button (System Unique) */}
                    {!showIntro && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[100] w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                            title="Close"
                        >
                            <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Blueprint Grid Overlay for Entire Modal */}
                    {!showIntro && (
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    )}

                    {/* Left Sidebar: Robot Identity */}
                    <div className={`hidden lg:flex flex-col border-r border-gray-100 relative z-10 bg-slate-50 transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'w-[80px] p-4' : 'w-[300px] p-8'}`}>
                        {/* Session Status Section */}
                        <div className={`mb-8 flex flex-col ${sidebarCollapsed ? 'hidden' : 'items-start'}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: topBarColor, color: topBarColor }} />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-80" style={{ color: topBarColor }}>Session Active</span>
                            </div>
                            <h3 className="text-slate-900 text-xl font-black uppercase tracking-tight leading-none mt-2">
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
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50 to-transparent z-10" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-slate-900 text-[15px] font-black tracking-[0.4em] mb-2" style={{ textShadow: `0 0 20px ${topBarColor}40` }}>BOOT ASSISTANT</h2>
                                <p className="text-slate-400 text-[7px] font-bold uppercase tracking-[0.2em]">Neural Processing v4.2</p>
                            </div>
                        </div>

                        {/* Sidebar Controls */}
                        <div className={`mt-auto pt-8 space-y-4 border-t border-gray-200 flex flex-col ${sidebarCollapsed ? 'items-center' : ''}`}>
                            <button 
                                onClick={handleClearChat}
                                title="New Session"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl ${sidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 px-4'} text-white shadow-lg hover:brightness-110 active:scale-95 border-none`}
                                style={{ backgroundColor: topBarColor, boxShadow: `0 4px 15px ${topBarColor}40` }}
                            >
                                <Plus size={sidebarCollapsed ? 20 : 16} strokeWidth={3} />
                                {!sidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">New Session</span>}
                            </button>

                            <button 
                                onClick={handleClearChat}
                                title="Clear Log"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl border border-gray-200 bg-white hover:bg-gray-50 ${sidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 px-4'} text-slate-500 hover:text-slate-800 shadow-sm`}
                            >
                                <Trash2 size={sidebarCollapsed ? 18 : 14} className="group-hover:text-red-500 transition-colors" />
                                {!sidebarCollapsed && <span className="text-[9px] font-black uppercase tracking-widest">Clear Log</span>}
                            </button>

                            <button 
                                onClick={onClose}
                                title="Terminate"
                                className={`flex items-center justify-center gap-3 transition-all group rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 ${sidebarCollapsed ? 'w-12 h-12' : 'w-full py-3 px-4'} text-red-600 shadow-sm`}
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
                                className="hidden lg:flex absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 border border-gray-200 text-white items-center justify-center rounded-r-lg z-[30] transition-colors group shadow-md"
                                style={{ backgroundColor: topBarColor }}
                            >
                            {sidebarCollapsed ? <ChevronRight size={14} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={14} className="group-hover:scale-125 transition-transform" />}
                        </button>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 md:space-y-12 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`flex gap-3 md:gap-6 items-end max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

                                        {/* Avatar Bubble */}
                                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm border ${msg.sender === 'user' ? 'bg-slate-100 border-gray-200' : 'bg-white'}`} style={msg.sender === 'ai' ? { borderColor: `${topBarColor}40`, backgroundColor: `${topBarColor}10` } : {}}>
                                            {msg.sender === 'user' ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={18} className="text-slate-500 md:hidden" />
                                                    <User size={24} className="text-slate-500 hidden md:block" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Bot size={20} className="md:hidden" style={{ color: topBarColor }} />
                                                    <Bot size={28} className="hidden md:block" style={{ color: topBarColor }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Chat Bubble */}
                                        <div className="relative mb-2 shadow-sm rounded-xl">
                                            <div className={`px-4 py-3 md:px-5 md:py-3 font-mono text-[10.5px] md:text-[11.5px] font-mono leading-relaxed border rounded-xl relative ${msg.sender === 'user' ? 'bg-white border-gray-200 text-slate-800' : 'bg-slate-50 border-gray-100 text-slate-800'}`} style={msg.sender === 'ai' ? { borderLeft: `2px solid ${topBarColor}` } : {}}>
                                                {/* Custom Fin Tail */}
                                                {msg.sender === 'user' ? (
                                                    <svg className="absolute -right-4 bottom-0 w-6 h-8 text-white" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                        <path d="M0 0V32H24C12 32 6 20 0 0Z" fill="currentColor" />
                                                        <path d="M0 0V32H24C12 32 6 20 0 0Z" stroke="#e5e7eb" strokeWidth="1" />
                                                    </svg>
                                                ) : (
                                                    <svg className="absolute -left-4 bottom-0 w-6 h-8 text-slate-50" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                        <path d="M24 0V32H0C12 32 18 20 24 0Z" fill="currentColor" />
                                                        <path d="M24 0V32H0C12 32 18 20 24 0Z" stroke="#f3f4f6" strokeWidth="1" />
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
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm" style={{ borderColor: `${topBarColor}40`, backgroundColor: `${topBarColor}10` }}>
                                            <Bot size={16} className="md:hidden" style={{ color: topBarColor }} />
                                            <Bot size={24} className="hidden md:block" style={{ color: topBarColor }} />
                                        </div>

                                        <div className="relative mb-2 shadow-sm rounded-xl">
                                            <div className="px-5 py-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center gap-2" style={{ borderLeft: `2px solid ${topBarColor}` }}>
                                                <svg className="absolute -left-4 bottom-0 w-6 h-8 text-slate-50" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                    <path d="M24 0V32H0C12 32 18 20 24 0Z" fill="currentColor" />
                                                    <path d="M24 0V32H0C12 32 18 20 24 0Z" stroke="#f3f4f6" strokeWidth="1" />
                                                </svg>
                                                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-8 border-t border-gray-100 bg-white">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 md:gap-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Write your message..."
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[10.5px] md:text-[11.5px] font-mono text-slate-900 focus:outline-none focus:border-gray-400 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-3 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md border-none text-white"
                                    style={{ backgroundColor: topBarColor }}
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

