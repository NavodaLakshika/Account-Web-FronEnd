import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Send, Trash2, Plus, ChevronLeft, ChevronRight, Paperclip, 
    File, Image as ImageIcon, Mic, Maximize2, Minimize2, Square, 
    Sparkles, Clock, MoreVertical, Edit, PanelLeftClose, PanelLeft, 
    ThumbsUp, ThumbsDown, Download, Copy, Check
} from 'lucide-react';
import { getUserName, getCompanyName } from '../utils/session';
import AIAsterisk from '../components/AIAsterisk';
import ThinkingProcess from '../components/ThinkingProcess';
import HowWeUseAIModal from '../components/modals/HowWeUseAIModal';
import { getSystemKnowledge, findRelevantModules } from '../ai/aiKnowledgeBase';
import { aiDataService } from '../ai/aiDataService';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const AVAILABLE_ACTIONS = {
  'new_account': { label: 'Open New Account', action: 'new_account' },
  'customers': { label: 'Open Customers', action: 'customers' },
  'vendors': { label: 'Open Vendors', action: 'vendors' },
  'enter_bill': { label: 'Enter Bill', action: 'enter_bill' },
  'pay_bill': { label: 'Pay Bill', action: 'pay_bill' },
  'invoice': { label: 'Create Invoice', action: 'invoice' },
  'sales_order': { label: 'Create Sales Order', action: 'sales_order' },
  'journal': { label: 'Journal Entry', action: 'journal' },
  'customer_master': { label: 'Customer Master', action: 'customer_master' },
  'supplier_master': { label: 'Supplier Master', action: 'supplier_master' },
  'chart_of_accounts': { label: 'Chart of Accounts', action: 'chart_of_accounts' },
  'reports': { label: 'View Reports', action: 'reports' },
  'search': { label: 'Search Transactions', action: 'search' },
  'bank_reconcile': { label: 'Bank Reconciliation', action: 'bank_reconcile' },
  'make_deposit': { label: 'Make Deposit', action: 'make_deposit' },
  'write_cheque': { label: 'Write Cheque', action: 'write_cheque' },
  'purchase_order': { label: 'Purchase Order', action: 'purchase_order' },
  'grn': { label: 'Goods Receipt Note', action: 'grn' },
  'sales_receipt': { label: 'Sales Receipt', action: 'sales_receipt' },
  'receive_payment': { label: 'Receive Payment', action: 'receive_payment' },
  'petty_cash': { label: 'Petty Cash', action: 'petty_cash' },
  'trial_balance': { label: 'Trial Balance', action: 'trial_balance' },
  'backup': { label: 'Data Backup', action: 'backup' },
  'expenses': { label: 'Expenses Dashboard', action: 'expenses' },
  'marketing': { label: 'Marketing Tool', action: 'marketing' },
  'reversal': { label: 'Reversal Entry', action: 'reversal' },
  'payment_setoff': { label: 'Payment Setoff', action: 'payment_setoff' },
};

const AIChatbotBoard = ({ isOpen, onClose, position = 'center', onAction }) => {
    // Persistent History from localStorage
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeHistoryId, setActiveHistoryId] = useState(null);

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // We determine if we are showing the sidebar in the inline-right mode
    const [sidebarCollapsed, setSidebarCollapsed] = useState(position === 'right' || position === 'inline-right');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [reactions, setReactions] = useState({});
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [chatSize, setChatSize] = useState('standard'); // 'standard', 'wide', 'compact'
    const [showAIInfoModal, setShowAIInfoModal] = useState(false);
    const abortControllerRef = useRef(null);
    
    // Auto-scroll on new message
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);

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


    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
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

        try {
            abortControllerRef.current = new AbortController();
            const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
            const userName = getUserName() || 'User';
            const companyName = getCompanyName() || 'your company';

            const query = newUserMessage.text;
            const lower = (query || '').toLowerCase();

            const relevantModules = findRelevantModules(query);
            const knowledgeContext = relevantModules.length > 0
                ? `\nRELEVANT MODULES FOR THIS QUERY:\n${relevantModules.map(m =>
                    `- ${m.name}: ${m.description}\n  Workflow: ${m.workflow || 'See navigation above.'}`
                  ).join('\n\n')}`
                : '';

            let dataContext = '';
            const wantsList = /\b(list|show|get|find|search|view|my|balance|recent|how many|total|summary|all)\b/i.test(lower);
            const dataType = /(customer|client|invoice|sale|bill|supplier|vendor|product|item|stock|inventory|expense|spend|income|revenue|earnings|payment|receipt|transaction|account|report|order|quotation|estimate|cheque|deposit|journal|ledger)/i.test(lower);

            if (wantsList && dataType) {
                const searchTerm = lower.replace(/^(list|show|get|find|search|view|my|recent)\s+/i, '').replace(/^(me|the|all|my)\s+/i, '').trim();
                const fetches = [];

                if (/(customer|client)/i.test(lower)) {
                    const term = lower.match(/customer\s+(\w+)/i)?.[1] || '';
                    fetches.push(aiDataService.getCustomers(term).then(d => d.length > 0 ? `CUSTOMERS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }
                if (/(invoice|sale)/i.test(lower) && !/(sales.?order|sales.?receipt)/i.test(lower)) {
                    const term = lower.match(/invoice\s+(\w+)/i)?.[1] || '';
                    fetches.push(aiDataService.getInvoices(term).then(d => d.length > 0 ? `INVOICES:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }
                if (/(supplier|vendor)/i.test(lower)) {
                    const term = lower.match(/(supplier|vendor)\s+(\w+)/i)?.[2] || '';
                    fetches.push(aiDataService.getSuppliers(term).then(d => d.length > 0 ? `SUPPLIERS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }
                if (/(bill|payable)/i.test(lower)) {
                    fetches.push(aiDataService.getBills().then(d => d.length > 0 ? `BILLS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }
                if (/(product|item|stock|inventory)/i.test(lower)) {
                    const term = lower.match(/(product|item)\s+(\w+)/i)?.[2] || '';
                    fetches.push(aiDataService.getProducts(term).then(d => d.length > 0 ? `PRODUCTS:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }
                if (/(expense|spend)/i.test(lower)) fetches.push(aiDataService.getExpensesSummary().then(d => d ? `EXPENSES:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                if (/(income|revenue|earnings)/i.test(lower)) fetches.push(aiDataService.getIncomeSummary().then(d => d ? `INCOME:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));

                if (fetches.length === 0 && /(summary|overview|everything|all)/i.test(lower)) {
                    fetches.push(aiDataService.getSummary().then(d => d ? `SYSTEM SUMMARY:\n${JSON.stringify(d, null, 2)}` : '').catch(() => ''));
                }

                if (fetches.length > 0) {
                    const results = await Promise.all(fetches);
                    const nonEmpty = results.filter(r => r && r.length > 20);
                    if (nonEmpty.length > 0) {
                        dataContext = `\n\nLIVE DATA FROM YOUR ACCOUNTING SYSTEM:\n${nonEmpty.join('\n\n')}`;
                    }
                }
            }

            const { aiSystemPrompt } = getSystemKnowledge();
            const basePrompt = aiSystemPrompt.content;

            const actionInstructions = `
YOU CAN PERFORM ACTIONS IN THE SYSTEM. When the user asks you to DO something (create, add, enter, open, etc.), include an action marker at the END of your response to open the relevant page/form.

HOW TO USE: End your response with <<action:action_key>>
Example: "Opening the New Account form for you. <<action:new_account>>"

Available actions:
${Object.entries(AVAILABLE_ACTIONS).map(([key, val]) => `- ${key}: ${val.label}`).join('\n')}

Only include ONE marker per response, at the very end.

DATA YOU CAN FETCH LIVE:
- List customers, suppliers, products, invoices, bills
- Show customer/invoice/bill details
- Show expenses and income summaries
- Search for specific records
When the user asks "show me", "list", "find", "search" for data, use the live data fetches directly.`;

            const apiMessages = [
                {
                    role: "system",
                    content: `${basePrompt}\n\nYou are assisting ${userName} from ${companyName}.${knowledgeContext}${dataContext}\n\nIMPORTANT: Use the live data provided above to answer the user's query about their accounting data. If the data was fetched, reference specific values from it. If no live data was fetched and the user asked about their data, explain that you don't have access to that specific data and guide them on how to find it in the system.\n\n${actionInstructions}`
                },
                ...messages.map(m => ({
                    role: m.sender === 'user' ? "user" : "assistant",
                    content: m.text
                })),
                { role: "user", content: newUserMessage.text }
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
                const isRateLimit = response.status === 429 || (errorData.error?.message || '').includes('rate limit');
                throw new Error(isRateLimit
                    ? 'AI service is temporarily busy. Please wait a moment and try again.'
                    : (errorData.error?.message || 'Failed to fetch response from AI API'));
            }

            const data = await response.json();
            let aiText = data.choices && data.choices[0] && data.choices[0].message.content
                ? data.choices[0].message.content
                : "I couldn't process that response correctly.";

            let actionToExecute = null;
            const actionMatch = aiText.match(/<<action:(\w+)>>/);
            if (actionMatch && AVAILABLE_ACTIONS[actionMatch[1]]) {
                actionToExecute = actionMatch[1];
                aiText = aiText.replace(/<<action:\w+>>/g, '').trim();
            }

            const elapsed = Date.now() - newUserMessage.timestamp.getTime();
            if (elapsed < 3500) {
                await new Promise(resolve => setTimeout(resolve, 3500 - elapsed));
            }

            const aiResponse = { id: Date.now() + 1, text: aiText, sender: 'ai', timestamp: new Date(), action: actionToExecute };
            setMessages(prev => [...prev, aiResponse]);

            if (actionToExecute && onAction) {
                setTimeout(() => onAction(actionToExecute), 500);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("Generation stopped by user");
                return;
            }
            console.error("AI API Error:", error);
            const errorResponse = {
                id: Date.now() + 1,
                text: error.message || 'AI service is temporarily unavailable. Please try again later.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsTyping(false);
        }
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

    // Archive current chat and start fresh
    const handleNewSession = () => {
        if (!activeHistoryId && messages.length > 0) {
            const firstUserMsg = messages.find(m => m.sender === 'user')?.text || "New Conversation";
            const summary = firstUserMsg.length > 20 ? firstUserMsg.substring(0, 18) + '...' : firstUserMsg;
            const newId = Date.now();
            setHistory(prev => [{ id: newId, title: summary, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msgs: [...messages] }, ...prev.slice(0, 9)]);
        }
        setActiveHistoryId(null);
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        setShowMenu(false);
    };

    const handleClearHistory = () => {
        setHistory([]);
        setActiveHistoryId(null);
        setMessages([]);
        setReactions({});
        setShowMenu(false);
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

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
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

    if (!isOpen) return null;

    const isInlineRight = position === 'inline-right';

    // Outer layout wrapper
    // In inline-right mode, we assume it's part of the dashboard layout (e.g. flex flex-col h-full bg-white)
    // We will render our Intuit UI entirely inside it.
    
    return (
        <div className={isInlineRight 
            ? `relative overflow-hidden flex flex-col h-full bg-white border-l border-slate-100 transition-all duration-500 ease-out shrink-0 ${chatSize === 'wide' ? 'w-full md:w-[800px] lg:w-[900px]' : 'w-full md:w-[450px] lg:w-[450px]'}`
            : "fixed inset-0 z-[9999] bg-white flex flex-col animate-in zoom-in-95 duration-200"
        }>
            {/* Header */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors mr-2 hidden md:block"
                        title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                    >
                        {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '150%', height: '150%' }} />
                    </div>
                    <h2 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                        Onimta Intelligence
                        <span className="text-[10px] font-bold bg-teal-600/90 text-white px-1.5 py-0.5 rounded-[4px] tracking-wider">
                            BETA
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-1 relative">
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors"
                        >
                            <MoreVertical size={20} />
                        </button>
                        
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                <div className="absolute top-[110%] right-0 mt-1 w-56 bg-white rounded-[3px] shadow-xl border border-slate-100 py-1.5 z-20">
                                    <button onClick={handleNewSession} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-medium">
                                        <Edit size={16} /> New chat
                                    </button>
                                    <button onClick={handleClearHistory} className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium">
                                        <Trash2 size={16} /> Clear chat history
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {isInlineRight && (
                        <button 
                            onClick={() => setChatSize(prev => prev === 'standard' ? 'wide' : 'standard')}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors"
                            title={chatSize === 'standard' ? "Wide view" : "Standard view"}
                        >
                            {chatSize === 'wide' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    )}
                    
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors ml-1"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Area (Sidebar + Chat) */}
            <div className="flex-1 flex overflow-hidden bg-white">
                
                {/* Sidebar */}
                {!sidebarCollapsed && (
                    <div className="w-[260px] border-r border-slate-100 flex flex-col shrink-0 animate-in slide-in-from-left-4 duration-300">
                        <div className="p-4">
                            <button 
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-slate-700 font-medium hover:bg-slate-50 rounded-[3px] transition-colors"
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
                                <div className="px-2 py-2 text-[13px] text-slate-500 bg-slate-50/50 rounded-[3px] border border-slate-100">
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
                                            className={`w-full text-left px-3 py-2 text-[13px] rounded-[3px] transition-colors truncate ${activeHistoryId === item.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
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
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                        {messages.length === 0 ? (
                            // Empty State
                            <div className="max-w-[700px] w-full mx-auto mt-4 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 md:mb-12">
                                    What can I do for you today?
                                </h1>

                                <div className="flex flex-col">
                                    {suggestions.map((item, idx) => (
                                        <div key={idx} className="border-b border-slate-100 py-6 first:pt-0 hover:bg-slate-50/50 transition-colors cursor-pointer group rounded-[3px] px-2 -mx-2" onClick={() => handleSuggestionClick(item.action)}>
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
                                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                        {msg.sender === 'user' ? (
                                            <div className="flex flex-col items-end max-w-[85%]">
                                                <div className="bg-[#f4f5f8] text-slate-800 px-5 py-3 rounded-2xl rounded-tr-sm text-[13px] shadow-sm">
                                                    {msg.file && (
                                                        <div className="mb-3">
                                                            {msg.file.isImage ? (
                                                                <img src={msg.file.url} alt="upload" className="max-w-full rounded-[3px] border border-slate-200 shadow-sm" />
                                                            ) : (
                                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-[3px]">
                                                                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-[3px]">
                                                                        <File size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 text-left">
                                                                        <div className="text-[12px] font-bold text-slate-700 truncate">{msg.file.name}</div>
                                                                        <div className="text-[10px] text-slate-400">{msg.file.size}</div>
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
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-1 group overflow-hidden">
                                                    <DotLottiePlayer src="/lottiefile/AI loading.lottie" autoplay loop style={{ width: '130%', height: '130%' }} />
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
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[3px] transition-colors"
                                                            title="Copy to clipboard"
                                                        >
                                                            {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} {copiedIndex === idx ? 'Copied' : 'Copy'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReaction(idx, 'like')}
                                                            className={`p-1.5 rounded-[3px] transition-colors ${reactions[idx] === 'like' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                            title="Helpful"
                                                        >
                                                            <ThumbsUp size={16} className={reactions[idx] === 'like' ? 'fill-indigo-600' : ''} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReaction(idx, 'dislike')}
                                                            className={`p-1.5 rounded-[3px] transition-colors ${reactions[idx] === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                            title="Not helpful"
                                                        >
                                                            <ThumbsDown size={16} className={reactions[idx] === 'dislike' ? 'fill-red-600' : ''} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(msg.text, idx)}
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[3px] transition-colors ml-auto"
                                                            title="Download response"
                                                        >
                                                            <Download size={14} /> Download
                                                        </button>
                                                    </div>

                                                    {/* Action button */}
                                                    {msg.action && AVAILABLE_ACTIONS[msg.action] && onAction && (
                                                        <div className="mt-4">
                                                            <button
                                                                onClick={() => onAction(msg.action)}
                                                                className="px-5 py-2 bg-[#0B1D4A] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#122b5c] transition-colors flex items-center gap-2"
                                                            >
                                                                {AVAILABLE_ACTIONS[msg.action].label}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Suggested follow-ups (show only on last message) */}
                                                    {idx === messages.length - 1 && (
                                                        <div className="flex flex-col items-start gap-2 mt-4 pt-4 border-t border-slate-100/50 w-full">
                                                            <button className="px-4 py-1.5 border border-[#0077c5] text-[#0077c5] text-[13px] font-medium rounded-[3px] hover:bg-blue-50 transition-colors" onClick={() => handleSuggestionClick("Show me how to connect my bank account")}>
                                                                Show me how to connect my bank account
                                                            </button>
                                                            <button className="px-4 py-1.5 border border-[#0077c5] text-[#0077c5] text-[13px] font-medium rounded-[3px] hover:bg-blue-50 transition-colors" onClick={() => handleSuggestionClick("Guide me to create my first invoice")}>
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
                    <div className="p-4 md:p-6 bg-white shrink-0 relative">
                        {attachedFile && (
                            <div className="absolute bottom-[100%] left-6 right-6 mb-2 max-w-[700px] mx-auto flex items-center justify-between p-2.5 bg-white border border-slate-200 shadow-sm rounded-[3px] animate-in slide-in-from-bottom-2 fade-in z-10">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-[3px] bg-indigo-50 flex items-center justify-center text-indigo-500 overflow-hidden border border-indigo-100">
                                        {attachedFile.isImage ? <img src={attachedFile.url} className="w-full h-full object-cover" /> : <File size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[12px] font-bold text-slate-700 truncate">{attachedFile.name}</div>
                                        <div className="text-[10px] text-slate-400">{attachedFile.size}</div>
                                    </div>
                                </div>
                                <button onClick={() => setAttachedFile(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <div className="max-w-[700px] w-full mx-auto relative group">
                            {/* Gradient Border Effect Wrapper */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-200 via-blue-200 to-indigo-200 rounded-2xl opacity-70 group-focus-within:opacity-100 group-focus-within:from-emerald-400 group-focus-within:via-blue-400 group-focus-within:to-indigo-400 transition-all duration-500"></div>
                            
                            <form onSubmit={handleSendMessage} className="relative bg-white rounded-2xl flex flex-col min-h-[100px] p-1 shadow-sm">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                />
                                <textarea 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder={isRecording ? "Recording audio..." : "Ask anything"}
                                    className={`w-full resize-none outline-none text-[15px] text-slate-700 bg-transparent px-4 py-4 min-h-[60px] ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                                    rows={1}
                                />
                                <div className="flex items-center justify-between px-3 pb-3 mt-auto">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-[3px] transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                    <div className="">
                                        <button 
                                            type="button"
                                            onClick={() => setIsRecording(!isRecording)}
                                            className={`p-2 rounded-[3px] transition-colors ${isRecording ? 'bg-red-500 text-white animate-bounce' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                            title="Voice Input"
                                        >
                                            <Mic size={20} />
                                        </button>
                                        {isTyping ? (
                                            <button 
                                                type="button"
                                                onClick={handleStopGeneration}
                                                className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Square size={12} fill="currentColor" /> Stop
                                            </button>
                                        ) : (inputValue.trim() || attachedFile) ? (
                                            <button 
                                                type="submit"
                                                className="px-4 py-1.5 bg-indigo-600 text-white text-[13px] font-bold rounded-[3px] hover:bg-indigo-700 transition-colors animate-in fade-in zoom-in-95"
                                            >
                                                Send
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="max-w-[700px] mx-auto text-center mt-3">
                            <p className="text-[11px] text-slate-400 font-medium">
                                Onimta Intelligence can make mistakes. Onimta protects privacy and adheres to responsible AI principles. <button type="button" onClick={() => setShowAIInfoModal(true)} className="text-[#0077c5] hover:underline cursor-pointer">How we use AI.</button>
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <HowWeUseAIModal isOpen={showAIInfoModal} onClose={() => setShowAIInfoModal(false)} />
        </div>
    );
};

export default AIChatbotBoard;
