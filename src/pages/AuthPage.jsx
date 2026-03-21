import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('EN');
    const [loginData, setLoginData] = useState({ empName: '', password: '' });

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

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.login(loginData.empName, loginData.password);
            toast.success(result.message || 'Verification Successful', {
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '24px',
                },
                iconTheme: {
                    primary: '#00acee',
                    secondary: '#fff',
                }
            });
            navigate('/select-company');
        } catch (err) {
            const errorMessage = typeof err === 'object' ? (err.message || err.Message || 'Invalid credentials') : err;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Outfit'] overflow-hidden">
            <div className="absolute -inset-8 z-0">
                <video ref={videoRef} autoPlay loop muted playsInline className="absolute w-full h-full object-cover scale-110" style={{ filter: 'blur(4px) brightness(0.5)' }}>
                    <source src="/Video/Backgroundvideo2.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="bg-white p-1 rounded-full shadow-lg">
                    <img src="/logo-removebg.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-white text-xs tracking-[0.2em] opacity-70 uppercase font-medium">Onimta {t.systemTitle}</span>
            </div>

            <div className="relative z-10 w-full max-w-lg px-8 py-12 flex flex-col items-center scale-95 origin-center">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-2 uppercase">ONIMTA</h1>
                    <p className="text-white/60 text-lg tracking-wide uppercase">{t.systemTitle}</p>
                </div>

                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            name="empName" 
                            value={loginData.empName} 
                            onChange={handleLoginChange} 
                            placeholder={t.username} 
                            className="w-full px-8 py-4 bg-black/20 border border-white/30 rounded-full outline-none focus:border-white focus:bg-white/10 transition-all text-white placeholder-white/40 font-medium" 
                            required 
                        />
                        <User className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            name="password" 
                            value={loginData.password} 
                            onChange={handleLoginChange} 
                            placeholder={t.password} 
                            className="w-full px-8 py-4 bg-black/20 border border-white/30 rounded-full outline-none focus:border-white focus:bg-white/10 transition-all text-white placeholder-white/40 font-medium" 
                            required 
                        />
                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-transparent text-[#00acee] focus:ring-0 checked:bg-[#00acee]" />
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">{t.remember}</span>
                        </label>
                        <a href="#" className="text-sm text-white/70 hover:text-white hover:underline transition-all">{t.forgot}</a>
                    </div>
                    <button disabled={loading} className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] rounded-full font-bold text-base text-white shadow-xl shadow-[#00acee]/20 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 h-[56px] uppercase tracking-widest">
                        {loading ? <Loader2 className="animate-spin mx-auto text-white" /> : t.login}
                    </button>
                </form>

                <div className="mt-20 text-center">
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.5em] font-medium font-sans">
                        {t.footer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
