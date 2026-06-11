import React, { useState, useRef, useEffect } from 'react';
import { 
    X, Maximize, Minimize, MoreVertical, Plus, Mic, 
    ThumbsUp, ThumbsDown, Download, PanelLeftClose, PanelLeft,
    Sparkles, MessageSquare, Clock, Edit, Copy, Check
} from 'lucide-react';
import AIAsterisk from '../AIAsterisk';
import ThinkingProcess from '../ThinkingProcess';
import HowWeUseAIModal from './HowWeUseAIModal';
import { getUserName, getCompanyName } from '../../utils/session';

const AIChatbot = ({ isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [reactions, setReactions] = useState({});
    const [showAIInfoModal, setShowAIInfoModal] = useState(false);
    
    // Chat states
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]); // { role: 'user' | 'ai', text: string }
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageText = (text) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return <strong key={index} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isOpen) return null;

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDownload = (text, idx) => {
        const element = document.createElement("a");
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `Onimta_AI_Response_${idx + 1}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleReaction = (idx, type) => {
        setReactions(prev => ({ ...prev, [idx]: prev[idx] === type ? null : type }));
    };

    const handleSend = () => {
        if (!input.trim()) return;
        
        // Add user message
        const newMessages = [...messages, { role: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        const userName = getUserName() || 'there';
        const companyName = getCompanyName() || 'your company';

        // Simulate AI response
        setTimeout(() => {
            setMessages([...newMessages, { 
                role: 'ai', 
                text: `Hello ${userName}! I am Onimta Intelligence. I can help you with your financial needs for ${companyName}. Let me know what you'd like to do.`
            }]);
            setIsTyping(false);
        }, 3500);
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        // Optionally send immediately:
        // handleSend(); 
    };

    const suggestions = [
        {
            title: "Connecting your bank account is the first step to letting the system work for you.",
            action: "Connect my bank account"
        },
        {
            title: "Using the system to create and send invoices puts manual work on autopilot.",
            action: "How do I create and send an invoice?"
        },
        {
            title: "Use bulk entry to upload multiple supplier bills at once.",
            action: "How I upload bills in bulk?"
        }
    ];

    // Determine layout classes based on fullscreen state
    const containerClasses = isFullscreen 
        ? "fixed inset-0 z-[9999] bg-white flex flex-col animate-in zoom-in-95 duration-200"
        : "fixed bottom-6 right-6 w-[400px] h-[650px] z-[9999] bg-white shadow-2xl rounded-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300";

    return (
        <div className={isFullscreen ? "fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm" : ""}>
            <div className={containerClasses}>
                
                {/* Header */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white z-20">
                    <div className="flex items-center gap-3">
                        {isFullscreen && (
                            <button 
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors mr-2"
                                title={showSidebar ? "Hide sidebar" : "Show sidebar"}
                            >
                                {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                            </button>
                        )}
                        <div className="w-6 h-6 flex items-center justify-center">
                            <AIAsterisk size={24} isThinking={true} />
                        </div>
                        <h2 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                            Onimta Intelligence
                            <span className="text-[10px] font-bold bg-teal-600/90 text-white px-1.5 py-0.5 rounded-[4px] tracking-wider">
                                BETA
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 relative">
                        {/* More Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                            
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                    <div className="absolute top-[110%] right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                                        <button className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium">
                                            <Edit size={16} /> New chat
                                        </button>
                                        <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Clock size={12} /> Recent
                                        </div>
                                        <div className="px-4 py-2 text-[12px] text-slate-500 italic">
                                            No conversations yet
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors ml-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area (Sidebar + Chat) */}
                <div className="flex-1 flex overflow-hidden bg-white">
                    
                    {/* Sidebar (Only in Fullscreen mode) */}
                    {isFullscreen && showSidebar && (
                        <div className="w-[260px] border-r border-slate-100 flex flex-col shrink-0 animate-in slide-in-from-left-4 duration-300">
                            <div className="p-4">
                                <button 
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-700 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                    onClick={() => setMessages([])}
                                >
                                    <Edit size={18} className="text-slate-500" /> New chat
                                </button>
                            </div>
                            
                            <div className="px-4 py-2">
                                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3 px-2">
                                    <Clock size={14} /> Recent
                                </div>
                                <div className="px-2 py-2 text-[13px] text-slate-500 bg-slate-50/50 rounded-lg border border-slate-100">
                                    No conversations yet
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative">
                        
                        {/* Scrollable Messages / Empty State */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col">
                            {messages.length === 0 ? (
                                // Empty State
                                <div className="max-w-[700px] w-full mx-auto mt-4 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 md:mb-12">
                                        What can I do for you today?
                                    </h1>

                                    <div className="flex flex-col">
                                        {suggestions.map((item, idx) => (
                                            <div key={idx} className="border-b border-slate-100 py-6 first:pt-0 hover:bg-slate-50/50 transition-colors cursor-pointer group rounded-xl px-2 -mx-2" onClick={() => handleSuggestionClick(item.action)}>
                                                <p className="text-[13px] text-slate-600 mb-2 leading-relaxed">
                                                    {item.title}
                                                </p>
                                                <p className="text-[13px] text-[#0077c5] font-medium group-hover:underline">
                                                    {item.action}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Chat Messages
                                <div className="max-w-[700px] w-full mx-auto flex flex-col gap-8 pb-10">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                            {msg.role === 'user' ? (
                                                <div className="bg-[#f4f5f8] text-slate-800 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[13px] shadow-sm">
                                                    {msg.text}
                                                </div>
                                            ) : (
                                                <div className="flex gap-4 max-w-[90%]">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-1 group">
                                                        <AIAsterisk size={16} />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5">
                                                            Work done <span className="text-[10px]">❯</span>
                                                        </div>
                                                        <div className="text-slate-700 text-[13px] leading-relaxed whitespace-pre-wrap">
                                                            {formatMessageText(msg.text)}
                                                        </div>
                                                        
                                                        {/* AI Message Actions */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button 
                                                                onClick={() => handleCopy(msg.text, idx)}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} {copiedIndex === idx ? 'Copied' : 'Copy'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReaction(idx, 'like')}
                                                                className={`p-1.5 rounded-lg transition-colors ${reactions[idx] === 'like' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                                title="Helpful"
                                                            >
                                                                <ThumbsUp size={16} className={reactions[idx] === 'like' ? 'fill-indigo-600' : ''} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReaction(idx, 'dislike')}
                                                                className={`p-1.5 rounded-lg transition-colors ${reactions[idx] === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                                title="Not helpful"
                                                            >
                                                                <ThumbsDown size={16} className={reactions[idx] === 'dislike' ? 'fill-red-600' : ''} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDownload(msg.text, idx)}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
                                                                title="Download response"
                                                            >
                                                                <Download size={14} /> Download
                                                            </button>
                                                        </div>

                                                        {/* Suggested follow-ups (show only on last message) */}
                                                        {idx === messages.length - 1 && (
                                                            <div className="flex flex-col items-end gap-2 mt-4 pt-4 border-t border-slate-100/50 w-full">
                                                                <button className="px-4 py-1.5 border border-[#0077c5] text-[#0077c5] text-[13px] font-medium rounded-full hover:bg-blue-50 transition-colors" onClick={() => handleSuggestionClick("Show me how to connect my bank account")}>
                                                                    Show me how to connect my bank account
                                                                </button>
                                                                <button className="px-4 py-1.5 border border-[#0077c5] text-[#0077c5] text-[13px] font-medium rounded-full hover:bg-blue-50 transition-colors" onClick={() => handleSuggestionClick("Guide me to create my first invoice")}>
                                                                    Guide me to create my first invoice
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {isTyping && (
                                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex gap-4 max-w-[90%]">
                                                <ThinkingProcess />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white shrink-0">
                            <div className="max-w-[700px] w-full mx-auto relative group">
                                {/* Gradient Border Effect Wrapper */}
                                <div className="absolute -inset-[1.5px] bg-gradient-to-r from-emerald-200 via-blue-200 to-indigo-200 rounded-2xl opacity-70 group-focus-within:opacity-100 group-focus-within:from-emerald-400 group-focus-within:via-blue-400 group-focus-within:to-indigo-400 transition-all duration-500"></div>
                                
                                <div className="relative bg-white rounded-2xl flex flex-col min-h-[100px] p-1 shadow-sm">
                                    <textarea 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask anything"
                                        className="w-full resize-none outline-none text-[15px] text-slate-700 bg-transparent px-4 py-4 min-h-[60px]"
                                        rows={1}
                                    />
                                    <div className="flex items-center justify-between px-3 pb-3 mt-auto">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                            <Plus size={20} />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                                title="Voice Input"
                                            >
                                                <Mic size={20} />
                                            </button>
                                            {input.trim() && (
                                                <button 
                                                    onClick={handleSend}
                                                    className="px-4 py-1.5 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 transition-colors animate-in fade-in zoom-in-95"
                                                >
                                                    Send
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="max-w-[700px] mx-auto text-center mt-3">
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Onimta Intelligence can make mistakes. Onimta protects privacy and adheres to responsible AI principles. <button type="button" onClick={() => setShowAIInfoModal(true)} className="text-[#0077c5] hover:underline cursor-pointer">How we use AI.</button>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <HowWeUseAIModal isOpen={showAIInfoModal} onClose={() => setShowAIInfoModal(false)} />
        </div>
    );
};

export default AIChatbot;
