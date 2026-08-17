import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import {
    Mail, Phone, MapPin, Activity,
    BookOpen, HelpCircle, Video,
    ChevronDown, ChevronRight,
    MessageCircle, Crown, Send, X,
    Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import { supportService } from '../services/support.service';

const faqs = [
    {
        question: "How do I reset my password?",
        answer: "You can easily reset your password by clicking on the 'Forgot Password' link on the login page. An OTP will be sent to your registered mobile number for verification."
    },
    {
        question: "How do I connect my bank account?",
        answer: "Navigate to the Banking module from your dashboard, click on 'Add Account', and follow the step-by-step secure wizard to link your local bank."
    },
    {
        question: "Is there a limit to how many users I can add?",
        answer: "User limits depend on your current subscription plan. Our Enterprise plan allows unlimited user accounts with role-based access control."
    },
    {
        question: "Where can I find my invoice history?",
        answer: "Your complete billing and invoice history is located in the 'Billing & Subscription' section under System Settings."
    }
];

const SupportPage = () => {
    const [openFaq, setOpenFaq] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatRegistered, setIsChatRegistered] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [chatUser, setChatUser] = useState({ name: '', email: '', phone: '', companyGroup: '' });
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! Welcome to Onimta Support. How can we help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleRegisterChat = async (e) => {
        e.preventDefault();
        try {
            const result = await supportService.registerChat(chatUser);
            if (result?.id) {
                setSessionId(result.id);
                sessionStorage.setItem('supportChatSessionId', result.id);
            }
            setIsChatRegistered(true);
        } catch (error) {
            console.error("Network error during chat registration:", error);
            setIsChatRegistered(true);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const textToSend = chatInput;
        const newUserMsg = { type: 'user', text: textToSend };
        setMessages([...messages, newUserMsg]);
        setChatInput('');

        if (sessionId) supportService.saveMessage(sessionId, 'user', textToSend).catch(console.error);

        setTimeout(() => {
            const botReplyText = "Thanks for reaching out! A support agent will review your message shortly.";
            setMessages(prev => [...prev, { type: 'bot', text: botReplyText }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white selection:bg-[#00acee] selection:text-white pb-20">
            <Helmet>
                <title>Support Center - Onimta</title>
                <meta name="description" content="Onimta Support and Contact" />
            </Helmet>

            {/* Custom Styles */}
            <style>{`
                @keyframes float-logo {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float-logo {
                    animation: float-logo 3s ease-in-out infinite;
                }
            `}</style>


            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-4xl font-extrabold text-blue-950">SUPPORT CENTER</h1>
                    <div className="hidden sm:flex items-center gap-4 text-slate-400">
                        <a href="#" className="hover:text-[#1877F2] hover:scale-110 transform transition-all duration-200"><Facebook size={22} /></a>
                        <a href="#" className="hover:text-[#1DA1F2] hover:scale-110 transform transition-all duration-200"><Twitter size={22} /></a>
                        <a href="#" className="hover:text-[#E4405F] hover:scale-110 transform transition-all duration-200"><Instagram size={22} /></a>
                        <a href="#" className="hover:text-[#0A66C2] hover:scale-110 transform transition-all duration-200"><Linkedin size={22} /></a>
                    </div>
                </div>
                <div className="flex items-center justify-between border-b border-blue-100 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-blue-900">How can we help?</h2>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-[5px] text-green-700 text-sm font-semibold">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        All Systems Operational
                    </div>
                </div>


                <div className="space-y-6 text-slate-600 leading-relaxed">
                    <p className="italic bg-blue-50/50 p-4 border-l-4 border-[#00acee] text-[15px]">
                        Our dedicated support team is available to assist you with any inquiries regarding the Onimta Financial System, Onimta Cloud, or your account. We guarantee professional, premium support tailored to your business needs.
                    </p>

                    <h4 className="text-xl font-bold text-blue-950 mt-10 mb-6 flex items-center gap-2">
                        Quick Resources
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="group bg-white p-6 rounded-[5px] border border-blue-100 shadow-sm hover:shadow-md hover:border-[#00acee] transition-all duration-300 cursor-pointer">
                            <div className="mb-4 text-[#00acee] bg-blue-50 w-12 h-12 rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-[16px] text-blue-950 mb-2">Knowledge Base</h3>
                            <p className="text-[14px] text-slate-500 leading-relaxed">Browse through comprehensive articles and step-by-step guides.</p>
                        </div>

                        <div className="group bg-white p-6 rounded-[5px] border border-blue-100 shadow-sm hover:shadow-md hover:border-[#00acee] transition-all duration-300 cursor-pointer">
                            <div className="mb-4 text-[#00acee] bg-blue-50 w-12 h-12 rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Video size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-[16px] text-blue-950 mb-2">Video Tutorials</h3>
                            <p className="text-[14px] text-slate-500 leading-relaxed">Watch our expert team demonstrate key features.</p>
                        </div>

                        <div className="group bg-white p-6 rounded-[5px] border border-blue-100 shadow-sm hover:shadow-md hover:border-[#00acee] transition-all duration-300 cursor-pointer">
                            <div className="mb-4 text-[#00acee] bg-blue-50 w-12 h-12 rounded-[5px] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HelpCircle size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-[16px] text-blue-950 mb-2">Community Forum</h3>
                            <p className="text-[14px] text-slate-500 leading-relaxed">Connect with other Onimta users and share tips.</p>
                        </div>
                    </div>


                    {/* Premium Upgrade Banner */}
                    <div className="mt-10 bg-gradient-to-br from-[#005a9c] to-[#004a82] text-white p-8 rounded-[5px] shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-[#003a68]">
                        <div className="absolute -right-8 -top-8 text-white/5 pointer-events-none transform rotate-12">
                            <Crown size={180} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[18px] font-bold mb-2 flex items-center gap-2 text-yellow-400">
                                <Crown size={18} className="animate-pulse" /> Upgrade to Premium Care
                            </h4>
                            <p className="text-[14px] text-blue-50 max-w-xl">
                                Dedicated account managers, VIP routing, and 24/7 direct telephone line. Experience enterprise-grade support designed for peak performance.
                            </p>
                        </div>
                        <button className="relative z-10 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-[#003a68] font-extrabold text-[14px] rounded-[5px] transition-colors shadow-md shrink-0">
                            View Premium Plans
                        </button>
                    </div>

                    <h4 className="text-xl font-bold text-blue-950 mt-12 mb-6 border-b border-blue-100 pb-2">
                        Get in Touch
                    </h4>

                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-50 p-3 rounded-[5px] text-[#00acee]">
                                    <Mail size={20} />
                                </div>
                                <div className="pt-1">
                                    <p className="font-bold text-blue-950 text-[15px] mb-1">Email Support</p>
                                    <a href="mailto:sales@onimtait.com" className="text-slate-600 hover:text-[#00acee] transition-colors text-[14px] underline-offset-4 hover:underline">sales@onimtait.com</a>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-50 p-3 rounded-[5px] text-[#00acee]">
                                    <Phone size={20} />
                                </div>
                                <div className="pt-1 w-full">
                                    <p className="font-bold text-blue-950 text-[15px] mb-2">Direct Phone Lines</p>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[14px] text-slate-600">
                                        <div className="flex justify-between border-b border-blue-50 pb-1">
                                            <span>Support:</span>
                                            <a href="tel:0112897507" className="font-semibold hover:text-[#00acee]">011 2 897 507</a>
                                        </div>
                                        <div className="flex justify-between border-b border-blue-50 pb-1">
                                            <span>Mobile 1:</span>
                                            <a href="tel:0759888809" className="font-semibold hover:text-[#00acee]">075 9 888 809</a>
                                        </div>
                                        <div className="col-span-2 flex justify-between pt-1">
                                            <span>Mobile 2:</span>
                                            <a href="tel:0759888888" className="font-semibold hover:text-[#00acee]">075 9 888 888</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-50 p-3 rounded-[5px] text-[#00acee]">
                                    <MapPin size={20} />
                                </div>
                                <div className="pt-1">
                                    <p className="font-bold text-blue-950 text-[15px] mb-1">Headquarters</p>
                                    <address className="not-italic text-[14px] text-slate-600">
                                        Onimta Information Technology (Pvt) Ltd.<br />
                                        No. 41/3, Lake Road, Maharagama,<br />
                                        Sri Lanka.
                                    </address>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-6 bg-blue-50/50 rounded-[5px] border border-blue-100 relative shadow-inner overflow-hidden">
                            <DotLottiePlayer
                                src="/lottiefile/Call Center Support Lottie Animation.lottie"
                                autoplay
                                loop
                                style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
                            />
                        </div>
                    </div>


                    <h4 className="text-xl font-bold text-blue-950 mt-14 mb-6 border-b border-blue-100 pb-2">
                        Frequently Asked Questions
                    </h4>

                    <div className="bg-white border border-blue-200 rounded-[5px] shadow-sm overflow-hidden mb-12">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div key={index} className="border-b border-blue-100 last:border-b-0">
                                    <button
                                        className={`w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none transition-colors ${isOpen ? 'bg-blue-50/50' : 'hover:bg-blue-50/50'}`}
                                        onClick={() => setOpenFaq(isOpen ? null : index)}
                                    >
                                        <span className={`text-[15px] font-bold ${isOpen ? 'text-[#00acee]' : 'text-blue-950'}`}>
                                            {faq.question}
                                        </span>
                                        <div className={`shrink-0 ml-4 transition-transform duration-200 ${isOpen ? 'text-[#00acee] rotate-180' : 'text-slate-400'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-5 pt-1 text-[14px] text-slate-600 leading-relaxed bg-blue-50/50 border-t border-blue-100">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>


            {/* Floating Live Chat Animation Button */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {isChatOpen && (
                    <div className="mb-4 w-80 bg-white rounded-[5px] shadow-2xl border border-blue-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300 transform origin-bottom-right">
                        {/* Chat Header */}
                        <div className="bg-[#005a9c] text-white p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-blue-200 animate-pulse" />
                                    <span className="font-bold text-[14px]">Live Support</span>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-[#004a82]">
                                <a href="mailto:sales@onimtait.com" className="flex-1 flex items-center justify-center gap-1.5 bg-[#004a82] hover:bg-[#003a68] py-1.5 rounded-[5px] text-[11px] font-bold transition-colors">
                                    <Mail size={14} /> Email Us
                                </a>
                                <a href="https://wa.me/94759888888" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/90 hover:bg-[#25D366] py-1.5 rounded-[5px] text-[11px] text-white font-bold transition-colors shadow-sm">
                                    <MessageCircle size={14} /> WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Chat Body (Registration or Messages) */}
                        {!isChatRegistered ? (
                            <form onSubmit={handleRegisterChat} className="p-4 bg-white flex flex-col gap-3 h-auto max-h-96 overflow-y-auto">
                                <p className="text-[13px] text-slate-600 mb-2 font-medium">Please provide your details to start chatting with our support agents.</p>
                                <input required type="text" placeholder="Name" value={chatUser.name} onChange={e => setChatUser({ ...chatUser, name: e.target.value })} className="w-full h-9 px-3 text-[13px] border border-blue-100 rounded-[5px] outline-none focus:border-[#00acee] transition-colors bg-slate-50 focus:bg-white" />
                                <input required type="email" placeholder="Email Address" value={chatUser.email} onChange={e => setChatUser({ ...chatUser, email: e.target.value })} className="w-full h-9 px-3 text-[13px] border border-blue-100 rounded-[5px] outline-none focus:border-[#00acee] transition-colors bg-slate-50 focus:bg-white" />
                                <input required type="tel" placeholder="Phone Number" value={chatUser.phone} onChange={e => setChatUser({ ...chatUser, phone: e.target.value })} className="w-full h-9 px-3 text-[13px] border border-blue-100 rounded-[5px] outline-none focus:border-[#00acee] transition-colors bg-slate-50 focus:bg-white" />
                                <input required type="text" placeholder="Company / Group" value={chatUser.companyGroup} onChange={e => setChatUser({ ...chatUser, companyGroup: e.target.value })} className="w-full h-9 px-3 text-[13px] border border-blue-100 rounded-[5px] outline-none focus:border-[#00acee] transition-colors bg-slate-50 focus:bg-white" />
                                <button type="submit" className="w-full h-9 bg-[#00acee] text-white font-bold text-[13px] rounded-[5px] hover:bg-[#0099d3] transition-colors mt-2 shadow-sm">
                                    Start Chat
                                </button>
                            </form>
                        ) : (
                            <>
                                {/* Chat Messages */}
                                <div className="h-72 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`max-w-[85%] rounded-[5px] p-3 text-[13px] leading-relaxed ${msg.type === 'user' ? 'bg-[#00acee] text-white self-end rounded-br-[5px] shadow-sm' : 'bg-white border border-blue-100 text-slate-700 self-start rounded-bl-[5px] shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-blue-100 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 h-9 px-3 outline-none text-[13px] bg-slate-50 border border-blue-100 focus:border-[#00acee] transition-colors rounded-[5px]"
                                    />
                                    <button type="submit" className="h-9 w-9 bg-[#00acee] hover:bg-[#0099d3] text-white rounded-[5px] transition-colors shadow-sm flex items-center justify-center">
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {/* The Floating Button */}
                <div className="flex items-center group cursor-pointer" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {!isChatOpen && (
                        <div className="mr-4 bg-[#005a9c] px-4 py-2 rounded-[5px] shadow-xl text-[13px] font-bold text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                            Click to Chat
                        </div>
                    )}
                    <button className="h-[65px] w-[65px] flex items-center justify-center relative hover:scale-110 transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl rounded-full bg-white">
                        {!isChatOpen && <span className="absolute inset-2 rounded-full border-2 border-[#00acee] border-opacity-60 animate-ping"></span>}
                        {isChatOpen ? (
                            <div className="h-14 w-14 bg-[#005a9c] rounded-full flex items-center justify-center shadow-md border border-[#004a82] text-white">
                                <X size={26} />
                            </div>
                        ) : (
                            <img src="/24-7-support-icon.png" alt="24/7 Support" className="relative z-10 w-full h-full object-contain rounded-full drop-shadow-sm" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        )}
                        <div className="hidden absolute inset-0 items-center justify-center bg-[#00acee] text-white rounded-full font-bold shadow-lg">
                            Help
                        </div>
                        {!isChatOpen && <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-white shadow-sm z-20"></div>}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default SupportPage;
