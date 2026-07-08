import React, { useState, useRef, useEffect } from 'react';
import { 
    X, MoreVertical, Plus, Mic, 
    ThumbsUp, ThumbsDown, Download, PanelLeftClose, PanelLeft,
    Sparkles, MessageSquare, Clock, Edit, Copy, Check, ChevronUp, ChevronDown,
    Trash2, Paperclip, File, Image as ImageIcon, Square
} from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import ThinkingProcess from '../ThinkingProcess';
import HowWeUseAIModal from './HowWeUseAIModal';
import AnimatedBackground from '../AnimatedBackground';
import { getSAKnowledge, findSAModules } from '../../ai/saKnowledgeBase';
import { saDataService } from '../../ai/saDataService';

const SA_ACTIONS = {
  'dashboard': { label: 'Dashboard Overview', action: 'dashboard' },
  'companies': { label: 'Open Companies', action: 'companies' },
  'employees': { label: 'Open Employees', action: 'employees' },
  'roles': { label: 'Open Role Features', action: 'roles' },
  'reports': { label: 'Open Reports', action: 'reports' },
  'engagement': { label: 'Open Engagement', action: 'engagement' },
  'subscriptions': { label: 'Open Subscriptions', action: 'subscriptions' },
  'plans': { label: 'Open Subscription Plans', action: 'subscriptions' },
  'pricing': { label: 'Open Pricing Plans', action: 'subscriptions' },
  'database': { label: 'Open Database', action: 'database' },
  'backup': { label: 'Open Database Backups', action: 'database' },
  'security': { label: 'Open Security Audit', action: 'security' },
  'audit': { label: 'Open Security Audit', action: 'security' },
  'integrations': { label: 'Open Integrations', action: 'integrations' },
  'feedback': { label: 'Open User Feedback', action: 'feedback' },
  'reviews': { label: 'Open Reviews', action: 'engagement' },
  'ads': { label: 'Open Advertisements', action: 'engagement' },
  'logs': { label: 'Open System Logs', action: 'security' },
  'config': { label: 'Open System Configuration', action: 'dashboard' },
  'settings': { label: 'Open Settings', action: 'dashboard' },
  'messaging': { label: 'Open Employee SMS', action: 'employees' },
  'sms': { label: 'Open Employee SMS', action: 'employees' },
  'resets': { label: 'Open Password Resets', action: 'dashboard' },
  'stats': { label: 'Open System Statistics', action: 'dashboard' },
};

const AdminAIChatbot = ({ isOpen, onClose, onAction }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [reactions, setReactions] = useState({});
    const [showAIInfoModal, setShowAIInfoModal] = useState(false);
    
    // Chat states
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    
    // Persistent History from localStorage
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('sa_ai_chat_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeHistoryId, setActiveHistoryId] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync history to localStorage
    useEffect(() => {
        localStorage.setItem('sa_ai_chat_history', JSON.stringify(history));
    }, [history]);

    // Live-sync active session to history
    useEffect(() => {
        if (activeHistoryId && messages.length > 1) {
            setHistory(prev => prev.map(item =>
                item.id === activeHistoryId ? { ...item, msgs: [...messages] } : item
            ));
        }
    }, [messages, activeHistoryId]);

    const handleNewSession = () => {
        if (!activeHistoryId && messages.length > 0) {
            const firstUserMsg = messages.find(m => m.role === 'user')?.text || "New Conversation";
            const summary = firstUserMsg.length > 20 ? firstUserMsg.substring(0, 18) + '...' : firstUserMsg;
            const newId = Date.now();
            setHistory(prev => [{ id: newId, title: summary, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msgs: [...messages] }, ...prev.slice(0, 9)]);
        }
        setActiveHistoryId(null);
        setMessages([]);
        setInput('');
        setIsTyping(false);
        setShowMenu(false);
        setAttachedFile(null);
    };

    const handleClearHistory = () => {
        setHistory([]);
        setActiveHistoryId(null);
        setMessages([]);
        setReactions({});
        setShowMenu(false);
        setAttachedFile(null);
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

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsTyping(false);
        }
    };

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

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() && !attachedFile) return;

        const newUserMessage = { role: 'user', text: input, id: Date.now(), file: attachedFile };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setAttachedFile(null);
        setIsTyping(true);

        try {
            abortControllerRef.current = new AbortController();
            const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
            if (!API_KEY) throw new Error('AI API key not configured');

            const query = newUserMessage.text;
            const lower = (query || '').toLowerCase();

            const relevantModules = findSAModules(query);
            const knowledgeContext = relevantModules.length > 0
                ? `\nRELEVANT MODULES:\n${relevantModules.map(m =>
                    `- ${m.name}: ${m.description}\n  Features: ${m.features.join(', ')}\n  Menu: ${m.menuPath || 'See navigation.'}`
                  ).join('\n\n')}`
                : '';

            let dataContext = '';
            const wantsList = /\b(list|show|get|find|search|view|my|recent|how many|total|summary|all)\b/i.test(lower);
            const dataType = /(company|employee|role|subscription|plan|review|ad|log|backup|feedback|stats|reset)/i.test(lower);

            if (wantsList && dataType) {
                const fetches = [];
                if (/(company|firm|organization)/i.test(lower)) fetches.push(saDataService.getCompanies().then(d => d.length ? `COMPANIES:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(employee|staff|user|personnel)/i.test(lower)) fetches.push(saDataService.getEmployees().then(d => d.length ? `EMPLOYEES:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(role|permission)/i.test(lower)) fetches.push(saDataService.getRoles().then(d => d.length ? `ROLES:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(subscription|plan)/i.test(lower)) fetches.push(saDataService.getSubscriptions().then(d => d.length ? `SUBSCRIPTIONS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(plan|pricing)/i.test(lower)) fetches.push(saDataService.getPricingPlans().then(d => d.length ? `PRICING PLANS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(review|rating)/i.test(lower)) fetches.push(saDataService.getReviews().then(d => d.length ? `REVIEWS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(ad|advertisement|promo)/i.test(lower)) fetches.push(saDataService.getAds().then(d => d.length ? `ADS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(log|audit)/i.test(lower)) fetches.push(saDataService.getLogs().then(d => d.length ? `SYSTEM LOGS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(backup|database)/i.test(lower)) fetches.push(saDataService.getBackups().then(d => d.length ? `BACKUPS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(feedback|complaint)/i.test(lower)) fetches.push(saDataService.getFeedback().then(d => d.length ? `FEEDBACK:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(stats?|summary|overview|count|total)/i.test(lower)) fetches.push(saDataService.getStats().then(d => d ? `SYSTEM STATS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));

                if (fetches.length > 0) {
                    const results = await Promise.all(fetches);
                    const nonEmpty = results.filter(r => r && r.length > 20);
                    if (nonEmpty.length > 0) {
                        dataContext = `\n\nLIVE DATA FROM YOUR SYSTEM:\n${nonEmpty.join('\n\n')}`;
                    }
                }
            }

            const { saSystemPrompt } = getSAKnowledge();
            const basePrompt = saSystemPrompt.content;

            const actionInstructions = `
CRITICAL RULE: Only use <<action:action_key>> when the user EXPLICITLY asks you to SHOW, OPEN, or GO TO a page. For ALL other requests (questions, explanations, greetings, general chat), DO NOT include any action marker.

Available actions:
${Object.entries(SA_ACTIONS).map(([key, val]) => `- ${key}: ${val.label}`).join('\n')}

When to use <<action:action_key>>:
- User says "show me companies" → <<action:companies>>
- User says "open dashboard" → <<action:dashboard>>
- User says "list employees" → <<action:employees>>

When NOT to use <<action:action_key>>:
- User asks a question ("what is X", "how do I X", "tell me about X") → Just answer, NO action marker
- User says hello, thanks, or general chat → Just reply, NO action marker
- User asks for data/listing → Fetch and present it, NO action marker

Remember: <<action:>> is ONLY for explicit page navigation requests. Never add it to explanations or general responses.`;

            const apiMessages = [
                {
                    role: "system",
                    content: `${basePrompt}${knowledgeContext}${dataContext}\n\n${actionInstructions}`
                },
                ...messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.text
                })),
                { role: 'user', content: query }
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: apiMessages,
                    temperature: 0.7
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'Failed to fetch AI response');
            }

            const data = await response.json();
            let aiText = data.choices?.[0]?.message?.content || "I couldn't process that response.";

            let actionToExecute = null;
            const actionMatch = aiText.match(/<<action:(\w+)>>/);
            const q = query.trim().toLowerCase();
            const isNavigateQuery = /\b(?:show|open|go\s*to|take\s*me\s*to|navigate|display|view|launch|list|find)\b/i.test(q);
            const isExplainQuery = /^(?:what|how|why|when|who|where|can|do|does|is|are|will|would|could|should|tell|explain|describe|define|meaning|purpose|function|difference|benefit|advantage)/i.test(q)
                || /\b(?:tell\s+me|explain|describe|define|meaning|purpose|how\s+(?:does|do|can|would|is|are)|what\s+(?:is|are|does|do|can|could))\b/i.test(q);
            if (actionMatch && SA_ACTIONS[actionMatch[1]]) {
                if (isNavigateQuery || (!isExplainQuery && q.split(/\s+/).length <= 3)) {
                    actionToExecute = actionMatch[1];
                }
                aiText = aiText.replace(/<<action:\w+>>/g, '').trim();
            }

            const elapsed = Date.now() - newUserMessage.id;
            if (elapsed < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
            }

            const aiResponse = { role: 'ai', text: aiText, id: Date.now() + 1, action: actionToExecute };
            setMessages(prev => [...prev, aiResponse]);

            if (actionToExecute && onAction) {
                setTimeout(() => onAction(actionToExecute), 500);
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error("AI API Error:", error);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: error.message || 'AI service is temporarily unavailable.',
                id: Date.now() + 1
            }]);
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
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

    const containerClasses = `fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a]/90 backdrop-blur-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 transition-all`;

    return (
        <div className="fixed inset-0 z-[9999]">
            <div className={containerClasses}>
                <AnimatedBackground customColor="59, 130, 246" />

                {/* Header */}
                <div className="h-12 border-b border-slate-200 dark:border-gray-800/50 flex items-center justify-between px-6 shrink-0 bg-transparent z-20">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-[3px] transition-colors mr-2 hidden md:block"
                            title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                        >
                            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                        </button>
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '150%', height: '150%' }} />
                        </div>
                        <h2 className="text-[14px] font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            Onimta Intelligence
                            <span className="text-[9px] font-bold bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded-[4px] tracking-wider">
                                BETA
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-[3px] transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                            
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                    <div className="absolute top-[110%] right-0 mt-1 w-56 bg-white dark:bg-[#0f172a] rounded-[3px] shadow-xl border border-slate-200 dark:border-gray-700 py-1.5 z-20">
                                        <button onClick={handleNewSession} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 flex items-center gap-3 font-medium">
                                            <Edit size={16} /> New chat
                                        </button>
                                        <button onClick={handleClearHistory} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 font-medium">
                                            <Trash2 size={16} /> Clear chat history
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors ml-1"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden bg-transparent">
                    
                    {/* Sidebar */}
                    {!sidebarCollapsed && (
                        <div className="w-[260px] border-r border-slate-200 dark:border-gray-800/50 flex flex-col shrink-0 animate-in slide-in-from-left-4 duration-300">
                            <div className="p-4">
                                <button 
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-700 dark:text-gray-300 font-medium hover:bg-slate-100 dark:hover:bg-gray-800 rounded-[3px] transition-colors"
                                    onClick={handleNewSession}
                                >
                                    <Edit size={18} className="text-slate-500" /> New chat
                                </button>
                            </div>
                            
                            <div className="px-4 py-2 flex-1 overflow-y-auto">
                                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-3 px-2">
                                    <div className=""><Clock size={14} /> Recent</div>
                                </div>
                                
                                {history.length === 0 ? (
                                    <div className="px-2 py-2 text-[13px] text-slate-500 bg-slate-50/50 dark:bg-gray-800/50 rounded-[3px] border border-slate-100 dark:border-gray-700">
                                        No conversations yet
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {history.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (item.msgs) {
                                                        setMessages(item.msgs);
                                                        setActiveHistoryId(item.id);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[13px] rounded-[3px] transition-colors truncate ${activeHistoryId === item.id ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-medium' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'}`}
                                            >
                                                {item.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative">
                        
                        {/* Scrollable Messages / Empty State */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col no-scrollbar">
                            {messages.length === 0 ? (
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
                                <div className="max-w-[900px] w-full mx-auto flex flex-col gap-6 pb-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                            {msg.role === 'user' ? (
                                                <div className="flex flex-col items-end max-w-[85%]">
                                                    <div className="bg-[#3b82f6] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[13px] shadow-sm">
                                                        {msg.file && (
                                                            <div className="mb-3">
                                                                {msg.file.isImage ? (
                                                                    <img src={msg.file.url} alt="upload" className="max-w-full rounded-[3px] border border-blue-400 shadow-sm" />
                                                                ) : (
                                                                    <div className="flex items-center gap-3 p-3 bg-blue-700 border border-blue-600 rounded-[3px]">
                                                                        <div className="p-2 bg-blue-600 text-white rounded-[3px]">
                                                                            <File size={20} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 text-left">
                                                                            <div className="text-[12px] font-bold text-white truncate">{msg.file.name}</div>
                                                                            <div className="text-[10px] text-blue-200">{msg.file.size}</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-4 max-w-[90%]">
                                                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                                                        <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '130%', height: '130%' }} />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                                                            Onimta Intelligence <span className="text-[10px]">❯</span>
                                                        </div>
                                                        <div className="text-slate-700 dark:text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap">
                                                            {formatMessageText(msg.text)}
                                                        </div>

                                                        {/* Action button */}
                                                        {msg.action && SA_ACTIONS[msg.action] && onAction && (
                                                            <div className="mt-2">
                                                                <button
                                                                    onClick={() => onAction(msg.action)}
                                                                    className="px-4 py-1.5 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                                >
                                                                    {SA_ACTIONS[msg.action].label}
                                                                </button>
                                                            </div>
                                                        )}
                                                        
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
                        <div className="p-3 md:p-4 bg-transparent shrink-0 border-t border-slate-200 dark:border-gray-800/50 relative">
                            {attachedFile && (
                                <div className="absolute bottom-[100%] left-6 right-6 mb-2 max-w-[900px] mx-auto flex items-center justify-between p-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-gray-800 shadow-sm rounded-xl animate-in slide-in-from-bottom-2 fade-in z-10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-[3px] bg-blue-50 dark:bg-gray-800 flex items-center justify-center text-blue-500 overflow-hidden border border-blue-100 dark:border-gray-700">
                                            {attachedFile.isImage ? <img src={attachedFile.url} className="w-full h-full object-cover" /> : <File size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[12px] font-bold text-slate-700 dark:text-gray-300 truncate">{attachedFile.name}</div>
                                            <div className="text-[10px] text-slate-400">{attachedFile.size}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setAttachedFile(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="max-w-[900px] w-full mx-auto relative group">
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#3b82f6]/50 via-indigo-500/50 to-[#3b82f6]/50 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
                                
                                <form onSubmit={handleSend} className="relative bg-white dark:bg-[#0f172a] rounded-xl flex flex-col min-h-[50px] p-1 shadow-inner border border-slate-200 dark:border-gray-800 group-focus-within:border-transparent">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <div className="flex flex-row items-center w-full">
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current.click()}
                                            className="p-2 text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0 ml-1"
                                        >
                                            <Plus size={20} />
                                        </button>
                                        <textarea 
                                            autoFocus
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                            placeholder={isRecording ? "Recording audio..." : "Ask anything..."}
                                            className={`w-full outline-none resize-none text-[14px] text-slate-800 dark:text-white bg-transparent px-3 py-2 placeholder:text-gray-600 min-h-[40px] max-h-[150px] ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                                            rows={1}
                                        />
                                        <div className="flex items-center gap-1 shrink-0 mr-1">
                                            <button 
                                                type="button"
                                                onClick={() => setIsRecording(!isRecording)}
                                                className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500 text-white animate-bounce' : 'text-gray-400 hover:text-slate-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                title="Voice Input"
                                            >
                                                <Mic size={20} />
                                            </button>
                                            {isTyping ? (
                                                <button 
                                                    type="button"
                                                    onClick={handleStopGeneration}
                                                    className="px-4 py-1.5 h-[34px] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0f172a] hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Square size={12} fill="currentColor" /> Stop
                                                </button>
                                            ) : (input.trim() || attachedFile) ? (
                                                <button 
                                                    type="submit"
                                                    className="px-4 py-1.5 bg-[#3b82f6] text-white text-[13px] font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in-95"
                                                >
                                                    Send
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </form>
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
