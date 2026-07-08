import React, { useState, useRef, useEffect } from 'react';
import { 
    X, MoreVertical, Plus, Mic, 
    ThumbsUp, ThumbsDown, Download, PanelLeftClose, PanelLeft,
    Sparkles, MessageSquare, Clock, Edit, Copy, Check, ChevronUp, ChevronDown
} from 'lucide-react';
import AIAsterisk from '../AIAsterisk';
import ThinkingProcess from '../ThinkingProcess';
import HowWeUseAIModal from './HowWeUseAIModal';
import { getUserName } from '../../utils/session';

const AdminAIChatbot = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
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
                return <strong key={index} className="font-semibold text-slate-800 dark:text-white">{part.slice(2, -2)}</strong>;
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
        
        const newMessages = [...messages, { role: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        const userName = getUserName() || 'Admin';

        setTimeout(() => {
            setMessages([...newMessages, { 
                role: 'ai', 
                text: `Hello ${userName}! I am Onimta Intelligence. I can help you manage your system, companies, and users. Let me know what you'd like to do.`
            }]);
            setIsTyping(false);
        }, 2000);
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        // Optionally send immediately by calling handleSend() here, but setting input is fine
    };

    const suggestions = [
        {
            title: "View active subscriptions and renewals.",
            action: "Show me subscription status"
        },
        {
            title: "Manage permissions and assign roles.",
            action: "Assign a new role to an employee"
        },
        {
            title: "Audit system logs and security events.",
            action: "Show me recent security logs"
        }
    ];

    const containerClasses = `fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-[#0f172a]/70 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-[4px] border-t-blue-500 border-slate-200 dark:border-gray-800/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 transition-all ${isExpanded ? 'h-[85vh]' : 'h-[350px]'}`;

    return (
        <div className={isExpanded ? "fixed inset-0 z-[9998] bg-slate-200/50 dark:bg-black/40 backdrop-blur-md" : ""}>
            <div className={containerClasses}>
                
                {/* Header */}
                <div className="h-12 border-b border-slate-200 dark:border-gray-800/50 flex items-center justify-between px-6 shrink-0 bg-transparent z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            <AIAsterisk size={20} isThinking={isTyping} />
                        </div>
                        <h2 className="text-[14px] font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            Onimta Intelligence
                            <span className="text-[9px] font-bold bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded-[4px] tracking-wider">
                                BETA
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-slate-800 dark:text-white rounded-lg transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors ml-1"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden bg-transparent">
                    
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative">
                        
                        {/* Scrollable Messages / Empty State */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col no-scrollbar">
                            {messages.length === 0 ? (
                                // Empty State
                                <div className="max-w-[800px] w-full mx-auto mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
                                        What can I do for you today?
                                    </h1>

                                    <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
                                        {suggestions.map((item, idx) => (
                                            <div key={idx} className="bg-white dark:bg-[#0f172a]/50 border border-blue-500/20 hover:border-blue-500/50 hover:bg-white dark:bg-[#0f172a]/80 p-4 rounded-xl transition-colors cursor-pointer group flex-1 min-w-[200px] max-w-[250px] shadow-sm backdrop-blur-sm" onClick={() => handleSuggestionClick(item.action)}>
                                                <p className="text-[12px] text-gray-400 mb-2 leading-relaxed">
                                                    {item.title}
                                                </p>
                                                <p className="text-[13px] text-[#3b82f6] font-medium group-hover:text-blue-400">
                                                    {item.action}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Chat Messages
                                <div className="max-w-[900px] w-full mx-auto flex flex-col gap-6 pb-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                            {msg.role === 'user' ? (
                                                <div className="bg-[#3b82f6] text-slate-800 dark:text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[13px] shadow-sm">
                                                    {msg.text}
                                                </div>
                                            ) : (
                                                <div className="flex gap-4 max-w-[90%]">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0f172a]/60 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm">
                                                        <AIAsterisk size={16} />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                                                            Onimta Intelligence <span className="text-[10px]">❯</span>
                                                        </div>
<div className="text-slate-700 dark:text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap">
                                                            {formatMessageText(msg.text)}
                                                        </div>
                                                        
                                                        {/* AI Message Actions */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button 
                                                                onClick={() => handleCopy(msg.text, idx)}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedIndex === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copiedIndex === idx ? 'Copied' : 'Copy'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReaction(idx, 'like')}
                                                                className={`p-1.5 rounded-lg transition-colors ${reactions[idx] === 'like' ? 'text-[#3b82f6] bg-blue-900/30' : 'text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800'}`}
                                                                title="Helpful"
                                                            >
                                                                <ThumbsUp size={16} className={reactions[idx] === 'like' ? 'fill-[#3b82f6]' : ''} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReaction(idx, 'dislike')}
                                                                className={`p-1.5 rounded-lg transition-colors ${reactions[idx] === 'dislike' ? 'text-red-400 bg-red-900/30' : 'text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800'}`}
                                                                title="Not helpful"
                                                            >
                                                                <ThumbsDown size={16} className={reactions[idx] === 'dislike' ? 'fill-red-400' : ''} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDownload(msg.text, idx)}
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800 rounded-lg transition-colors ml-auto"
                                                                title="Download response"
                                                            >
                                                                <Download size={14} /> Download
                                                            </button>
                                                        </div>
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
                        <div className="p-3 md:p-4 bg-transparent shrink-0 border-t border-slate-200 dark:border-gray-800/50">
                            <div className="max-w-[900px] w-full mx-auto relative group">
                                {/* Gradient Border Effect Wrapper */}
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#3b82f6]/50 via-indigo-500/50 to-[#3b82f6]/50 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
                                
                                <div className="relative bg-white dark:bg-[#0f172a] rounded-xl flex flex-row items-center min-h-[50px] p-1 shadow-inner border border-slate-200 dark:border-gray-800 group-focus-within:border-transparent">
                                    <button className="p-2 text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800 rounded-lg transition-colors shrink-0 ml-1">
                                        <Plus size={20} />
                                    </button>
                                    <input 
                                        autoFocus
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask anything..."
                                        className="w-full outline-none text-[14px] text-slate-800 dark:text-white bg-transparent px-3 py-2 placeholder:text-gray-600"
                                    />
                                    <div className="flex items-center gap-1 shrink-0 mr-1">
                                        <button 
                                            className="p-2 text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                            title="Voice Input"
                                        >
                                            <Mic size={20} />
                                        </button>
                                        <button 
                                            onClick={handleSend}
                                            disabled={!input.trim()}
                                            className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all ${input.trim() ? 'bg-[#3b82f6] text-slate-800 dark:text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="max-w-[900px] mx-auto text-center mt-2">
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Onimta Intelligence can make mistakes. Onimta protects privacy and adheres to responsible AI principles. <button type="button" onClick={() => setShowAIInfoModal(true)} className="text-[#3b82f6] hover:underline cursor-pointer">How we use AI.</button>
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

export default AdminAIChatbot;




