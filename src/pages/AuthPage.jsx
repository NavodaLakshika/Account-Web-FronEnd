import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, Facebook, Linkedin, Globe, X, ChevronRight, Settings } from 'lucide-react';
import { authService } from '../services/auth.service';
import CompanySelectModal from '../components/modals/CompanySelectModal';
import AboutUsModal from '../components/modals/AboutUsModal';
import ContactModal from '../components/modals/ContactModal';
import HelpModal from '../components/modals/HelpModal';
import WelcomeModal from '../components/modals/WelcomeModal';
import toast from 'react-hot-toast';

import { DotLottiePlayer } from '@dotlottie/react-player';

const AuthPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('EN');
    const [loginData, setLoginData] = useState({ empName: '', password: '' });
    const [showSelection, setShowSelection] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [showSocialLinks, setShowSocialLinks] = useState(false);
    const [showAboutUs, setShowAboutUs] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [displayedSignInText, setDisplayedSignInText] = useState('');

    const translations = {
        EN: {
            systemTitle: 'Financial System',
            username: 'Username / Email',
            password: 'Password',
            remember: 'Remember Password',
            forgot: 'Forgot Password?',
            login: 'LOGIN',
            footer: 'Powered by Onimta Information Technology'
        },
        CN: {
            systemTitle: '管理系统',
            username: '用户名 / 邮箱',
            password: '密码',
            remember: '记住密码',
            forgot: '忘记密码？',
            login: '登录',
            footer: '由 Onimta 云基础设施 provide powered'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
        }
    }, []);

    const fullSignInText = lang === 'EN' ? 'SIGN IN' : t.login;

    useEffect(() => {
        if (!showForgot) {
            let i = 0;
            setDisplayedSignInText('');
            const timer = setInterval(() => {
                i++;
                setDisplayedSignInText(fullSignInText.slice(0, i));
                if (i >= fullSignInText.length) clearInterval(timer);
            }, 80);
            return () => clearInterval(timer);
        }
    }, [showForgot, lang, fullSignInText]);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

    const handleLoginSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>


                <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer
                            src="/lottiefile/Successffull.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>

                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {/* Progress Bar Timer */}
                <div className="h-[2px] w-full bg-emerald-50">
                    <div 
                        className="h-full bg-emerald-500"
                        style={{ animation: 'toastProgress 3s linear forwards' }}
                    />
                </div>
            </div>
        ), {
            duration: 3000,
            position: 'top-right'
        });
    };

    const handleLoginErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>


                <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer
                            src="/lottiefile/Error Fail animation.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>

                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Access Denied</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {/* Progress Bar Timer */}
                <div className="h-[2px] w-full bg-red-50">
                    <div 
                        className="h-full bg-red-500"
                        style={{ animation: 'toastProgress 3s linear forwards' }}
                    />
                </div>
            </div>
        ), {
            duration: 3000,
            position: 'top-right'
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.login(loginData.empName, loginData.password);
            const user = authService.getCurrentUser();
            setCurrentUser(user);
            
            handleLoginSuccessToast(result.message || 'Verification Successful');
            
            // Show the welcome modal after toast animation starts
            setTimeout(() => {
                setShowWelcome(true);
            }, 1000);
        } catch (err) {
            const errorMessage = typeof err === 'object' ? (err.message || err.Message || 'Invalid credentials') : err;
            handleLoginErrorToast(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySelected = () => {
        setShowSelection(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Arial'] overflow-hidden">
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    @keyframes shimmerFlow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-shimmer {
                        background: linear-gradient(
                            90deg, 
                            #ffffff 0%, 
                            #ffffff 40%, 
                            #04b4faff 50%, 
                            #ffffff 60%, 
                            #ffffff 100%
                        );
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: shimmerFlow 12s linear infinite;
                    }
                `}
            </style>

            {/* Restored Video Background */}
            <div className="absolute inset-0 z-0">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(24px) brightness(0.3)' }}
                >
                    <source src="/Video/Backgroundvideo2.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 w-full max-w-6xl px-12 flex items-center justify-between">
                
                {/* Left Branding Panel */}
                <div className="flex-1 flex flex-col items-center justify-center text-center pr-12">
                    <div className="relative mb-6">
                        <h1 className="text-[85px] font-bold tracking-[0.05em] uppercase animate-shimmer leading-none relative z-10">ONIMTA</h1>
                        
                        {/* Decorative Rotating Logo Circle */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 flex items-center justify-center opacity-80 select-none pointer-events-none">
                            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_30s_linear_infinite]" />
                            <img 
                                src="/logo-removebg.png" 
                                alt="Onimta Logo" 
                                className="w-24 h-24 object-contain animate-[pulse_4s_easeInOut_infinite]" 
                            />
                        </div>
                    </div>
                    <p className="text-white text-xl font-bold tracking-widest uppercase mb-4 opacity-90">{t.systemTitle}</p>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-96 bg-white/40 mx-12 hidden md:block" />

                {/* Right Form Panel / Success Action */}
                <div className="flex-1 max-w-md w-full py-12">
                    {!showForgot ? (
                        <>
                            <h2 className="text-white text-3xl font-tahoma font-bold mb-8 transition-opacity duration-500 min-h-[40px]">
                                {displayedSignInText}
                                <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                            </h2>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <input 
                                        type="text" 
                                        name="empName" 
                                        value={loginData.empName} 
                                        onChange={handleLoginChange} 
                                        placeholder={t.username} 
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none focus:ring-4 focus:ring-[#00acee]/30 transition-all" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={loginData.password} 
                                        onChange={handleLoginChange} 
                                        placeholder={t.password} 
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none focus:ring-4 focus:ring-[#00acee]/30 transition-all" 
                                        required 
                                    />
                                </div>
                                <div className="flex flex-col gap-6 pt-4">
                                    <button 
                                        disabled={loading} 
                                        className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg shadow-black/10"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto text-white" /> : t.login}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForgot(true)}
                                        className="text-white/60 font-mono text-sm hover:text-white transition-all text-center bg-transparent border-none cursor-pointer"
                                    >
                                        {t.forgot}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-white text-3xl font-tahoma font-bold mb-4 uppercase tracking-tight">Account Recovery</h2>
                            <p className="text-white/60 font-mono text-sm mb-8 leading-relaxed">
                                Enter your <span className="text-[#00acee] font-bold">Username or Corporate Email</span> and we will send you a recovery protocol.
                            </p>
                            
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setLoading(true);
                                    setTimeout(() => {
                                        toast.success('Recovery instruction sent to registered email');
                                        setLoading(false);
                                        setShowForgot(false);
                                    }, 1500);
                                }} 
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <input 
                                        type="text" 
                                        value={forgotEmail} 
                                        onChange={(e) => setForgotEmail(e.target.value)} 
                                        placeholder="Username / Email" 
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none focus:ring-4 focus:ring-[#00acee]/30 transition-all" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-4">
                                    <button 
                                        disabled={loading} 
                                        className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Request Reset'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowForgot(false)}
                                        className="w-full py-2 text-white/40 font-mono text-xs hover:text-white transition-all uppercase tracking-widest font-bold"
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Media Icons (Top Left) - Appears on Toggle */}
            <div 
                className={`absolute top-8 left-12 z-20 flex items-center transition-all duration-700 ${
                    showSocialLinks 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-10 pointer-events-none'
                }`}
            >
                <ul className="flex items-center gap-4 list-none m-0 p-0">
                    {/* Facebook */}
                    <li className="relative group flex flex-col items-center">
                        <span className="absolute top-[50px] px-3 py-1.5 bg-[#4267B2] text-white text-[12px] font-bold rounded-[5px] opacity-0 group-hover:opacity-100 group-hover:top-[55px] transition-all duration-300 pointer-events-none shadow-lg shadow-[#4267B2]/30 after:content-[''] after:absolute after:top-[-5px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-[#4267B2]">
                            Facebook
                        </span>
                        <a href="https://www.facebook.com/onimta" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#4267B2] transition-all duration-300 shadow-xl group-hover:scale-110">
                            <Facebook size={18} />
                        </a>
                    </li>

                    {/* LinkedIn */}
                    <li className="relative group flex flex-col items-center">
                        <span className="absolute top-[50px] px-3 py-1.5 bg-[#0077b5] text-white text-[12px] font-bold rounded-[5px] opacity-0 group-hover:opacity-100 group-hover:top-[55px] transition-all duration-300 pointer-events-none shadow-lg shadow-[#0077b5]/30 after:content-[''] after:absolute after:top-[-5px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-[#0077b5]">
                            LinkedIn
                        </span>
                        <a href="https://www.linkedin.com/company/onimta" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#0077b5] transition-all duration-300 shadow-xl group-hover:scale-110">
                            <Linkedin size={18} />
                        </a>
                    </li>

                    {/* Web Link (Globe) */}
                    <li className="relative group flex flex-col items-center">
                        <span className="absolute top-[50px] px-3 py-1.5 bg-[#00acee] text-white text-[12px] font-bold rounded-[5px] opacity-0 group-hover:opacity-100 group-hover:top-[55px] transition-all duration-300 pointer-events-none shadow-lg shadow-[#00acee]/30 after:content-[''] after:absolute after:top-[-5px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[6px] after:border-b-[#00acee]">
                            Website
                        </span>
                        <a href="https://www.onimta.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#00acee] transition-all duration-300 shadow-xl group-hover:scale-110">
                            <Globe size={18} />
                        </a>
                    </li>
                </ul>
            </div>

            {/* Toggle Button (Top Right) */}
            <div className="absolute top-8 right-12 z-20">
                <button 
                    onClick={() => setShowSocialLinks(!showSocialLinks)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-30 ${
                        showSocialLinks 
                        ? 'bg-white/20 text-white rotate-[360deg]' 
                        : 'bg-white/10 text-white/40 hover:text-white hover:bg-white/20'
                    }`}
                >
                    {showSocialLinks ? <X size={20} /> : <Settings size={20} className="animate-[spin_4s_linear_infinite]" />}
                </button>
            </div>

            {/* Bottom Footer Section */}
            {/* Bottom Footer Section (Right Side Links Connected to Toggle) */}
            <div className="absolute bottom-6 right-10 z-20 overflow-hidden">
                <div 
                    className={`flex items-center gap-6 text-[12px] text-white/40 font-mono transition-all duration-700 ${
                        showSocialLinks 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
                >
                    <button 
                        onClick={() => setShowAboutUs(true)}
                        className="cursor-pointer hover:text-white transition-colors"
                    >
                        About us
                    </button>
                    <span>|</span>
                    <button 
                        onClick={() => setShowContact(true)}
                        className="cursor-pointer hover:text-white transition-colors "
                    >
                        Contact
                    </button>
                    <span>|</span>
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="hover:text-white transition-colors "
                    >
                        Help
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 left-10 text-[12px] text-white/40 font-mono tracking-wide">
                Powered by Onimta Information Technology Pvt Ltd
            </div>

            {/* Welcome Modal */}
            <WelcomeModal 
                isOpen={showWelcome} 
                user={currentUser}
                onComplete={() => {
                    setShowWelcome(false);
                    setShowSelection(true);
                }}
            />

            {/* Company Selection Modal */}
            <CompanySelectModal 
                isOpen={showSelection} 
                onClose={() => setShowSelection(false)} 
                onSelect={handleCompanySelected}
                user={currentUser}
            />

            {/* About Us Sidebar Modal */}
            <AboutUsModal 
                isOpen={showAboutUs} 
                onClose={() => setShowAboutUs(false)} 
            />

            {/* Contact Bottom Modal */}
            <ContactModal 
                isOpen={showContact} 
                onClose={() => setShowContact(false)} 
            />

            {/* Help Side Drawer Modal */}
            <HelpModal 
                isOpen={showHelp} 
                onClose={() => setShowHelp(false)} 
            />
        </div>
    );
};

export default AuthPage;
