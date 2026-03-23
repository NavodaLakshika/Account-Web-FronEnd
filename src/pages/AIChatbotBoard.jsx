import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Maximize2, Minimize2, Trash2, Shield, Zap, Cpu } from 'lucide-react';

import { DotLottiePlayer } from '@dotlottie/react-player';

const AIChatbotBoard = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "System Online. I am your specialized AI Assistant. How can I assist with your accounts today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showIntro, setShowIntro] = useState(false);

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
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-700 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {!showIntro && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-700" onClick={onClose} />
                )}

                {/* Technical Blueprint Chat Container */}
                <div className={`relative overflow-hidden flex transition-all duration-500 ease-out ${isMaximized ? 'w-full h-full' : 'w-full max-w-6xl h-[800px]'} ${showIntro ? 'bg-transparent border-none shadow-none' : 'bg-[#011e41] border border-white/20 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.05)]'}`}>



                    {/* Blueprint Grid Overlay for Entire Modal */}
                    {!showIntro && (
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    )}



                    {/* Left Sidebar: Technical Robot Identity */}
                    <div className="hidden md:flex w-[350px] flex-col border-r border-white/20 relative z-10 bg-transparent">


                        <div className="p-8 flex flex-col h-full relative">
                            <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                                {/* The Robot Lottie Animation */}
                                <div className="w-64 h-64 flex items-center justify-center relative mb-6">
                                    <DotLottiePlayer
                                        src="/images/Ai Robot Vector Art.lottie"
                                        autoplay
                                        loop
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-white text-xl font-black tracking-widest mb-4">BOOT ASSISTANT</h2>
                                </div>
                            </div>

                            <div className="text-white/60 text-[9px] font-medium leading-relaxed uppercase tracking-wider mt-auto text-center px-4">
                                LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT,
                                SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA.
                                UT ENIM AD MINIM VENIAM, QUIS NOSTRUD EXERCITATION ULLAMCO.
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Chat Area */}
                    <div className="flex-1 flex flex-col relative z-10 bg-transparent">
                        {/* Top Navigation Frame */}
                        <div className="h-12 border-b border-white/20 flex items-center justify-end px-6 space-x-4 bg-transparent">

                            <button onClick={handleClearChat} title="Clear Chat History" className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-2">
                                <Trash2 size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Delete Log</span>
                            </button>

                            <button onClick={() => setIsMaximized(!isMaximized)} className="text-white/40 hover:text-white transition-colors">
                                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button onClick={onClose} className="text-white/40 hover:text-red-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`flex gap-6 items-end max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

                                        {/* Avatar Bubble */}
                                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0 bg-white/5">
                                            {msg.sender === 'user' ? <User size={24} className="text-white" /> : <Bot size={24} className="text-white" />}

                                        </div>


                                        {/* Chat Bubble */}
                                        <div className="relative mb-2">
                                            <div className="px-5 py-3 text-[12px] font-bold leading-relaxed bg-white/10 border border-white/20 text-white rounded-xl relative shadow-lg backdrop-blur-sm">
                                                {/* Custom Fin Tail matching the image */}
                                                {msg.sender === 'user' ? (
                                                    <svg className="absolute -right-6 bottom-0 w-8 h-10 text-white/10" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                        <path d="M0 0V32H24C12 32 6 20 0 0Z" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg className="absolute -left-6 bottom-0 w-8 h-10 text-white/10" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
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
                                    <div className="flex gap-6 items-end">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0 bg-white/5">
                                            <Bot size={24} className="text-white" />

                                        </div>

                                        <div className="relative mb-2">
                                            <div className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                                                <svg className="absolute -left-6 bottom-0 w-8 h-10 text-white/10" viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                    <path d="M24 0V32H0C12 32 18 20 24 0Z" fill="currentColor" />
                                                </svg>
                                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-white/20 bg-transparent">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">


                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="flex-1 bg-transparent border-2 border-white/20 rounded-xl px-5 py-3 text-[12px] text-white focus:outline-none focus:bg-white/5 transition-colors placeholder:text-white/30 placeholder:text-[12px] tracking-wide"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-white text-[#011e41] p-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <Send size={20} strokeWidth={2.5} />
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

