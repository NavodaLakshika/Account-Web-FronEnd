import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Trash2, Plus, ChevronLeft, ChevronRight, Paperclip, File, Image as ImageIcon, Mic, Maximize2, Minimize2 } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';

// ─── DrawBorderBox ────────────────────────────────────────────────────────────
// SVG stroke-dashoffset animation that perfectly traces the rounded-rect border.
// AI bubbles → brand topBarColor with glow | User bubbles → Slate #94a3b8 (Simple & Charm)
const DrawBorderBox = ({ children, color = '#0285fd', isUser = false, animKey }) => {
    const [drawn, setDrawn]            = useState(false);
    const [contentVisible, setContent] = useState(false);
    const [size, setSize]              = useState({ w: 0, h: 0 });
    const containerRef                 = useRef(null);
    const rx = 12; 

    useEffect(() => {
        const obs = new ResizeObserver(entries => {
            if (containerRef.current) {
                const w = containerRef.current.offsetWidth;
                const h = containerRef.current.offsetHeight;
                if (w > 0 && h > 0) setSize({ w, h });
            }
        });
        if (containerRef.current) obs.observe(containerRef.current);
        
        // Animation sequence
        const t1 = setTimeout(() => setDrawn(true), 150);
        const t2 = setTimeout(() => setContent(true), 1200);
        
        return () => { obs.disconnect(); clearTimeout(t1); clearTimeout(t2); };
    }, [animKey]);

    const { w, h } = size;
    const perimeter  = 2 * (w - 2 * rx + h - 2 * rx) + 2 * Math.PI * rx;
    const strokeColor = isUser ? '#94a3b8' : color;
    const sparkFill   = isUser ? '#cbd5e1' : '#e0f0ff';

    const svgPath = `M ${rx},1 L ${w - rx},1 Q ${w - 1},1 ${w - 1},${rx} L ${w - 1},${h - rx} Q ${w - 1},${h - 1} ${w - rx},${h - 1} L ${rx},${h - 1} Q 1,${h - 1} 1,${h - rx} L 1,${rx} Q 1,1 ${rx},1 Z`;

    return (
        <div ref={containerRef} className="relative block w-fit min-w-[80px] max-w-full">
            {w > 0 && h > 0 && (
                <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}>
                    <path
                        d={svgPath} fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray={perimeter} strokeDashoffset={drawn ? 0 : perimeter}
                        opacity={0.12} style={{ transition: drawn ? `stroke-dashoffset 1.05s cubic-bezier(0.4,0,0.2,1)` : 'none' }}
                    />
                    <path
                        d={svgPath} fill="none" stroke={strokeColor} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray={perimeter} strokeDashoffset={drawn ? 0 : perimeter}
                        style={{ transition: drawn ? `stroke-dashoffset 1.05s cubic-bezier(0.4,0,0.2,1)` : 'none' }}
                    />
                    {drawn && !contentVisible && (
                        <circle r={3} fill={sparkFill} opacity={0.9}>
                            <animateMotion dur="1.05s" path={svgPath} fill="freeze" />
                        </circle>
                    )}
                </svg>
            )}

            <div style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0px)' : 'translateY(4px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
                {children}
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const AIChatbotBoard = ({ isOpen, onClose }) => {
    // Persistent History from localStorage
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeHistoryId, setActiveHistoryId] = useState(null);

    const [messages, setMessages] = useState([
        { id: 1, text: "System Online. I am your specialized AI Assistant. How can I assist with your accounts today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [chatSize, setChatSize] = useState('standard'); // 'standard', 'wide', 'compact'

    const topBarColor = localStorage.getItem('topBarColor') || '#0285fd';
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync history to localStorage
    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(history));
    }, [history]);

    // Live-sync active session to history
    useEffect(() => {
        if (activeHistoryId && messages.length > 1) {
            setHistory(prev => prev.map(item => 
                item.id === activeHistoryId ? { ...item, msgs: [...messages] } : item
            ));
        }
    }, [messages, activeHistoryId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim() && !attachedFile) return;

        const newUserMessage = { 
            id: Date.now(), 
            text: inputValue, 
            sender: 'user', 
            timestamp: new Date(),
            file: attachedFile 
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setAttachedFile(null);
        setIsTyping(true);
        
        setTimeout(() => {
            const aiResponse = { id: Date.now() + 1, text: getMockResponse(inputValue), sender: 'ai', timestamp: new Date() };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachedFile({
                name: file.name,
                type: file.type,
                size: (file.size / 1024).toFixed(1) + ' KB',
                url: reader.result,
                isImage: file.type.startsWith('image/')
            });
        };
        reader.readAsDataURL(file);
    };

    const getMockResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('balance')) return "Analyzing ledgers... Your current total liquidity is $124,500.20. All balances are verified against recent bank feeds.";
        if (q.includes('vendor')) return "Retrieving vendor profiles... You have 48 active vendor accounts. 3 payments are pending approval.";
        return "Query processed. I can assist with balance inquiries, vendor reports, or general accounting logic.";
    };

    // Archive current chat and start fresh
    const handleNewSession = () => {
        if (!activeHistoryId && messages.length > 1) {
            const firstUserMsg = messages.find(m => m.sender === 'user')?.text || "New Conversation";
            const summary = firstUserMsg.length > 20 ? firstUserMsg.substring(0, 18) + '...' : firstUserMsg;
            const newId = Date.now();
            setHistory(prev => [{ id: newId, title: summary, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), msgs: [...messages] }, ...prev.slice(0, 9)]);
        }
        setActiveHistoryId(null);
        setMessages([{ id: Date.now(), text: "System Online. I am your specialized AI Assistant. How can I assist with your accounts today?", sender: 'ai', timestamp: new Date() }]);
        setInputValue('');
        setIsTyping(false);
    };

    // Permanently wipe the history list
    const handleClearHistory = () => {
        setHistory([]);
        setActiveHistoryId(null);
    };

    if (!isOpen) return null;

    const sizeClasses = {
        standard: 'md:max-w-6xl md:max-h-[850px]',
        wide: 'md:max-w-[98%] md:h-[95vh] md:max-h-[95vh]'
    };

    return (
        <>
            <div className={`fixed inset-0 z-[1100] flex items-center justify-center p-0 md:p-4 transition-all duration-700 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-all duration-700" onClick={onClose} />

                <div className={`relative overflow-hidden flex transition-all duration-500 ease-out w-full ${sizeClasses[chatSize]} h-full md:h-[85vh] bg-white rounded-none md:rounded-2xl shadow-2xl`}>
                    
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 z-[120]" style={{ backgroundColor: topBarColor }} />

                    <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setChatSize(prev => prev === 'standard' ? 'wide' : 'standard');
                            }}
                            className="w-9 h-8 flex items-center justify-center bg-white border border-gray-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 rounded-[8px] shadow-sm transition-all active:scale-90"
                            title={chatSize === 'standard' ? "Switch to Wide View" : "Switch to Standard View"}
                        >
                            {chatSize === 'wide' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button onClick={onClose} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-lg transition-all active:scale-90 border-none group">
                            <X size={18} strokeWidth={4} />
                        </button>
                    </div>

                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* Sidebar */}
                    <div className={`hidden lg:flex flex-col border-r border-gray-100 relative z-10 bg-slate-50 transition-all duration-500 ${sidebarCollapsed ? 'w-[80px] p-4' : 'w-[300px] p-6'}`}>
                        <div className="flex items-center justify-between mb-2">
                             {/* Sidebar controls removed as requested */}
                        </div>
                        {/* Header */}
                        <div className={`mb-4 flex flex-col ${sidebarCollapsed ? 'hidden' : ''}`}>
                            <h3 className="text-slate-900 text-xl font-black uppercase tracking-tight leading-none">
                                {(() => {
                                    const hour = new Date().getHours();
                                    if (hour < 12) return "Good Morning";
                                    if (hour < 17) return "Good Afternoon";
                                    return "Good Evening";
                                })()}, {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).empName.split(' ')[0] : 'Navoda'}
                            </h3>
                        </div>

                        {/* Recent Activity (History) */}
                        <div className={`flex-1 overflow-y-auto mb-6 custom-scrollbar min-h-0 pr-1 ${sidebarCollapsed ? 'hidden' : ''}`}>
                            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Recent Activity</h4>
                            <div className="space-y-2">
                                {history.map((item, idx) => (
                                    <div key={idx} className="group relative">
                                        <button 
                                            onClick={() => {
                                                if (item.msgs) {
                                                    setMessages(item.msgs);
                                                    setActiveHistoryId(item.id);
                                                }
                                            }}
                                            className={`w-full text-left p-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 relative overflow-hidden ${activeHistoryId === item.id ? 'border-blue-300 ring-1 ring-blue-50' : 'border-gray-50 hover:border-blue-100'}`}
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: activeHistoryId === item.id ? topBarColor : topBarColor + '80' }} />
                                            
                                            <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors border border-gray-100">
                                                <Bot size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="text-slate-700 text-[9px] font-black group-hover:text-blue-600 transition-colors truncate uppercase tracking-tight w-full">
                                                    {item.title || "New Conversation"}
                                                </div>
                                                
                                                <div className="text-slate-400 text-[8px] truncate font-medium leading-none mt-1">
                                                    {item.msgs && item.msgs.length > 0 ? item.msgs[item.msgs.length - 1].text : "No messages yet"}
                                                </div>
                                                
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <div className="text-blue-400 text-[6.5px] font-black uppercase tracking-[0.1em] flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-0.5 h-0.5 rounded-full bg-blue-400 animate-pulse" />
                                                        {item.msgs?.length || 0} MESSAGES
                                                    </div>
                                                    <div className="text-slate-300 text-[6.5px] font-bold uppercase tracking-widest">• {item.time || "Recently"}</div>
                                                </div>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHistory(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all z-20"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Controls */}
                        <div className="space-y-2.5 pt-6 border-t border-gray-200">
                            <button 
                                onClick={handleNewSession}
                                className={`flex items-center justify-center gap-2.5 rounded-xl transition-all shadow-md active:scale-95 border-none text-white font-black uppercase tracking-widest ${sidebarCollapsed ? 'w-10 h-10' : 'w-full py-2.5'}`}
                                style={{ backgroundColor: topBarColor, boxShadow: `0 4px 12px ${topBarColor}25` }}
                            >
                                <Plus size={16} strokeWidth={3} />
                                {!sidebarCollapsed && <span className="text-[9.5px]">New Session</span>}
                            </button>
                            
                            <button 
                                onClick={handleClearHistory}
                                className={`flex items-center justify-center gap-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-all active:scale-95 text-slate-500 shadow-sm ${sidebarCollapsed ? 'w-10 h-10' : 'w-full py-2.5'}`}
                            >
                                <Trash2 size={14} strokeWidth={2} />
                                {!sidebarCollapsed && <span className="text-[8.5px] font-black uppercase tracking-widest">Clear Log</span>}
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative z-20 bg-transparent min-w-0">
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 border border-gray-200 text-white items-center justify-center rounded-r-lg z-[30] shadow-md" style={{ backgroundColor: topBarColor }}>
                            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>

                        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 custom-scrollbar">
                            {(messages || []).map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 items-end max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        
                                        {/* Avatar with Animation */}
                                        <div className="relative flex-shrink-0 flex items-center justify-center">
                                            <span className="absolute inset-0 rounded-full" style={msg.sender === 'ai' 
                                                ? { animation: 'aiRing 2.4s ease-in-out infinite', border: `2px solid ${topBarColor}`, opacity: 0 } 
                                                : { animation: 'userRing 2.4s ease-in-out infinite', border: '2px solid #94a3b8', opacity: 0 }} 
                                            />
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center shadow" style={msg.sender === 'ai' 
                                                ? { borderColor: `${topBarColor}50`, backgroundColor: `${topBarColor}12`, animation: 'iconBob 3s ease-in-out infinite' } 
                                                : { borderColor: '#cbd5e1', backgroundColor: '#f8fafc', animation: 'iconPop 3s ease-in-out infinite' }}>
                                                {msg.sender === 'user' ? <User size={13} className="text-slate-500" /> : <Bot size={14} style={{ color: topBarColor }} />}
                                            </div>
                                        </div>

                                        <DrawBorderBox color={topBarColor} isUser={msg.sender === 'user'} animKey={msg.id}>
                                            <div className={`px-5 py-3.5 font-mono text-[11px] leading-relaxed rounded-xl relative break-words whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-slate-50 text-slate-700' : 'bg-slate-50 text-slate-800'}`} style={msg.sender === 'ai' ? { borderLeft: `2px solid ${topBarColor}` } : { borderLeft: '2px solid #94a3b8' }}>
                                                <svg className={`absolute ${msg.sender === 'user' ? '-right-4 text-slate-50' : '-left-4 text-slate-50'} bottom-0 w-6 h-8`} viewBox="0 0 24 32" fill="none" preserveAspectRatio="none">
                                                    <path d={msg.sender === 'user' ? "M0 0V32H24C12 32 6 20 0 0Z" : "M24 0V32H0C12 32 18 20 24 0Z"} fill="currentColor" />
                                                    <path d={msg.sender === 'user' ? "M0 0V32H24C12 32 6 20 0 0Z" : "M24 0V32H0C12 32 18 20 24 0Z"} stroke="#e2e8f0" strokeWidth="1" />
                                                </svg>
                                                
                                                {msg.file && (
                                                    <div className="mb-3">
                                                        {msg.file.isImage ? (
                                                            <img src={msg.file.url} alt="upload" className="max-w-full rounded-lg border border-gray-100 shadow-sm" />
                                                        ) : (
                                                            <div className="flex items-center gap-3 p-3 bg-white/50 border border-gray-100 rounded-lg">
                                                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                                                    <File size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[10px] font-bold text-slate-700 truncate">{msg.file.name}</div>
                                                                    <div className="text-[8px] text-slate-400">{msg.file.size}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {msg.text}
                                            </div>
                                        </DrawBorderBox>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2.5 items-end">
                                        <div className="relative flex-shrink-0 flex items-center justify-center">
                                            <span className="absolute inset-0 rounded-full" style={{ animation: 'aiRing 2.4s ease-in-out infinite', border: `2px solid ${topBarColor}`, opacity: 0 }} />
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center shadow" style={{ borderColor: `${topBarColor}50`, backgroundColor: `${topBarColor}12`, animation: 'iconBob 3s ease-in-out infinite' }}>
                                                <Bot size={14} style={{ color: topBarColor }} />
                                            </div>
                                        </div>
                                        <div className="px-2 py-1.5 bg-slate-50 border border-gray-100 rounded-xl flex items-center gap-1 shadow-sm" style={{ borderLeft: `2px solid ${topBarColor}` }}>
                                            <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '0ms' }} />
                                            <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '150ms' }} />
                                            <span className="w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: topBarColor, animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 md:p-6 bg-slate-50 border-t border-gray-100">
                            {attachedFile && (
                                <div className="mb-4 flex items-center justify-between p-2.5 bg-white border border-blue-100 rounded-xl animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 overflow-hidden border border-blue-100">
                                            {attachedFile.isImage ? <img src={attachedFile.url} className="w-full h-full object-cover" /> : <File size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-slate-700 truncate">{attachedFile.name}</div>
                                            <div className="text-[8px] text-slate-400">{attachedFile.size}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setAttachedFile(null)} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-3.5 bg-white border border-gray-200 text-slate-400 hover:text-blue-500 hover:border-blue-100 rounded-2xl transition-all active:scale-95 shadow-sm"
                                >
                                    <Paperclip size={18} />
                                </button>
                                
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={isRecording ? "Recording audio..." : "Write your message..."}
                                        className={`w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-mono text-[11px] shadow-inner placeholder:text-slate-300 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                                    />
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => setIsRecording(!isRecording)}
                                    className={`p-4 rounded-2xl shadow-md border-none transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-bounce' : 'bg-white border border-gray-100 text-slate-400 hover:text-blue-500'}`}
                                >
                                    <Mic size={18} />
                                </button>

                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim() && !attachedFile}
                                    className="p-4 rounded-2xl text-white shadow-lg border-none disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
                                    style={inputValue.trim() || attachedFile ? { backgroundColor: topBarColor } : {}}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; transition: background 0.3s; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                @keyframes aiRing { 0% { transform: scale(1); opacity: 0.7; } 70% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(1.8); opacity: 0; } }
                @keyframes userRing { 0% { transform: scale(1); opacity: 0.5; } 70% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(1.8); opacity: 0; } }
                @keyframes iconBob { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
                @keyframes iconPop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            `}</style>
        </>
    );
};

export default AIChatbotBoard;
