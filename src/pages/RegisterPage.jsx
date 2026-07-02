import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Loader2, Phone, ShieldCheck, CheckCircle2, ArrowLeft, KeyRound, Eye, EyeOff, X, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import { Helmet } from 'react-helmet-async';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import AboutUsModal from '../components/modals/AboutUsModal';
import HelpModal from '../components/modals/HelpModal';
import LegalTextModal from '../components/modals/LegalTextModal';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showAboutUs, setShowAboutUs] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [legalModalConfig, setLegalModalConfig] = useState({ isOpen: false, title: '', content: null, type: '' });
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const generatedOtp = useRef(''); // stores the OTP sent via SMS for local comparison
    const [formData, setFormData] = useState({
        Emp_Name: '', Email: '', Phone_Number: '', Pass_Word: '', Conpass_Word: ''
    });
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [displayedRegisterText, setDisplayedRegisterText] = useState('');
    const [pageAlert, setPageAlert] = useState(null);
    const [glowType, setGlowType] = useState(null);

    useEffect(() => {
        if (pageAlert) {
            setGlowType(pageAlert.type);
            const glowTimer = setTimeout(() => setGlowType(null), 1000);
            const alertTimer = setTimeout(() => setPageAlert(null), 4000);
            return () => {
                clearTimeout(glowTimer);
                clearTimeout(alertTimer);
                setGlowType(null);
            };
        }
    }, [pageAlert]);

    const showPageAlert = (type, title, message) => setPageAlert({ type, title, message });

    useEffect(() => {
        if (step === 1) {
            let i = 0;
            const text = 'REGISTER';
            setDisplayedRegisterText('');
            const timer = setInterval(() => {
                i++;
                setDisplayedRegisterText(text.slice(0, i));
                if (i >= text.length) clearInterval(timer);
            }, 80);
            return () => clearInterval(timer);
        }
    }, [step]);

    useEffect(() => {
        if (step === 2) {
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        }
    }, [step]);

    const password = formData.Pass_Word || '';
    const criteria = {
        length: password.length >= 8,
        number: /\d/.test(password),
        letter: /[a-zA-Z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const strengthCount = Object.values(criteria).filter(Boolean).length;
    let strengthText = '';
    let strengthColor = 'bg-slate-200';
    if (password.length > 0) {
        if (strengthCount <= 2) { strengthText = 'Weak'; strengthColor = 'bg-red-400'; }
        else if (strengthCount === 3) { strengthText = 'Good'; strengthColor = 'bg-yellow-400'; }
        else { strengthText = 'Strong'; strengthColor = 'bg-blue-500'; }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value.slice(-1);
        setOtp(updated);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        if (formData.Pass_Word !== formData.Conpass_Word) { showPageAlert('error', 'Validation Error', 'Passwords do not match'); return; }
        if (!formData.Phone_Number) { showPageAlert('error', 'Validation Error', 'Phone number is required'); return; }
        if (!formData.Email) { showPageAlert('error', 'Validation Error', 'Email is required'); return; }
        setLoading(true);
        try {
            const emailCheck = await authService.checkEmailExists(formData.Email);
            if (emailCheck?.exists) {
                showPageAlert('error', 'Email Already Registered', 'This email is already registered. Please use a different email or sign in.');
                setLoading(false);
                return;
            }
            const sentOtp = await authService.sendSmsOtp(formData.Phone_Number);
            generatedOtp.current = sentOtp; // store for local verification
            showPageAlert('success', 'OTP Sent', 'OTP sent to ' + formData.Phone_Number);
            setStep(2);
        } catch (err) {
            showPageAlert('error', 'OTP Failed', typeof err === 'string' ? err : err?.message || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) { showPageAlert('error', 'Validation Error', 'Enter the 6-digit OTP'); return; }
        // Verify locally against the OTP sent via SMS
        if (otpCode !== generatedOtp.current) {
            showPageAlert('error', 'Invalid OTP', 'Incorrect OTP. Please try again.');
            return;
        }
        setLoading(true);
        try {
            await authService.register(formData);
            setStep(3);
        } catch (err) {
            showPageAlert('error', 'Registration Failed', typeof err === 'string' ? err : err?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-['Arial'] overflow-hidden bg-slate-50 py-8">
            <Helmet>
                <title>Create Account | Onimta Accounting System</title>
                <meta name="description" content="Register a new account on the Onimta Accounting Web Application. Create secure access to enterprise financial management tools." />
                <link rel="canonical" href="https://onimta.com/register" />
            </Helmet>
            <style>{`
                .otp-box { transition: border-color 0.2s, box-shadow 0.2s; }
                .otp-box:focus { border-color: #00acee !important; box-shadow: 0 0 0 3px rgba(0,172,238,0.25); outline: none; }
            `}</style>

            {/* Full-page Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 animate-in fade-in duration-300">
                    <div className="w-[120px] h-[120px]">
                        <DotLottiePlayer
                            src="/lottiefile/DashboardLoader.lottie"
                            autoplay
                            loop
                        />
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-6xl px-12 flex items-start justify-center mt-8">

                <div className="w-full py-12">
                    {/* Step indicator */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400">
                                {step === 1 ? 'Details' : step === 2 ? 'Verify' : 'Done'}
                            </span>
                            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#00acee]">
                                Step {step} of 3
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#00acee] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="max-w-md mx-auto">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-slate-800 text-3xl font-tahoma font-bold mb-6 tracking-tight min-h-[36px]">
                                {displayedRegisterText}<span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                            </h2>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="Emp_Name" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        Full Name
                                    </label>
                                    <input type="text" id="Emp_Name" name="Emp_Name" value={formData.Emp_Name} onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="Phone_Number" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        Phone Number
                                    </label>
                                    <input type="tel" id="Phone_Number" name="Phone_Number" value={formData.Phone_Number} onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="Email" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        Email Address
                                    </label>
                                    <input type="email" id="Email" name="Email" value={formData.Email} onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="Pass_Word" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} id="Pass_Word" name="Pass_Word" value={formData.Pass_Word} onChange={handleChange}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all pr-12" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white hover:bg-[#00acee] bg-white border border-slate-200 hover:border-[#00acee] rounded-md p-1.5 transition-all shadow-sm">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    
                                        {passwordFocused && (
                                        <div className="mt-2 w-full bg-slate-50/50 rounded-[3px] border border-slate-200 p-4 animate-in fade-in">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Password Strength</span>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${strengthText === 'Weak' ? 'text-red-500' : strengthText === 'Good' ? 'text-yellow-600' : strengthText === 'Strong' ? 'text-blue-600' : 'text-slate-400'}`}>{strengthText}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-[3px] overflow-hidden flex gap-1">
                                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 1 ? strengthColor : 'bg-transparent'}`} />
                                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 2 ? strengthColor : 'bg-transparent'}`} />
                                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 3 ? strengthColor : 'bg-transparent'}`} />
                                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 4 ? strengthColor : 'bg-transparent'}`} />
                                                </div>
                                            </div>

                                            <p className="text-[12px] font-bold text-slate-700 mb-3">Your password must contain:</p>
                                            <ul className="space-y-2">
                                                <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.length ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    <span className="text-sm font-bold w-3 text-center">{criteria.length ? '✓' : '−'}</span>
                                                    8 or more characters
                                                </li>
                                                <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.number ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    <span className="text-sm font-bold w-3 text-center">{criteria.number ? '✓' : '−'}</span>
                                                    Numbers
                                                </li>
                                                <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.letter ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    <span className="text-sm font-bold w-3 text-center">{criteria.letter ? '✓' : '−'}</span>
                                                    Letters
                                                </li>
                                                <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.special ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    <span className="text-sm font-bold w-3 text-center">{criteria.special ? '✓' : '−'}</span>
                                                    Special characters
                                                </li>
                                            </ul>
                                        </div>
                                        )}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="Conpass_Word" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        Confirm Password
                                    </label>
                                    <div>
                                        <input type="password" id="Conpass_Word" name="Conpass_Word" value={formData.Conpass_Word} onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 py-2">
                                    <ShieldCheck size={16} className="text-[#00acee] mt-0.5 shrink-0" />
                                    <p className="text-slate-500 text-[10px] font-mono leading-relaxed">By registering you agree to Onimta Data Protection Policy. An OTP will be sent to verify your phone.</p>
                                </div>
                                <button disabled={loading}
                                    className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Phone size={14} /> SEND OTP & CONTINUE</>}
                                </button>
                                <button type="button" onClick={() => navigate('/login')}
                                    className="w-full py-2 text-slate-500 hover:text-slate-800 font-mono text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 font-bold mt-2">
                                    <ArrowLeft size={12} /> Back to Sign In
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <KeyRound size={32} className="text-[#00acee] mb-4" />
                            <h2 className="text-slate-800 text-3xl font-bold uppercase tracking-tight mb-2">VERIFY OTP</h2>
                            <p className="text-slate-500 font-mono text-sm mb-8">
                                6-digit code sent to <span className="text-[#00acee] font-bold">{formData.Phone_Number}</span>
                            </p>
                            <form onSubmit={handleVerifyAndRegister} className="space-y-8">
                                <div className="flex items-center justify-between gap-2">
                                    {otp.map((digit, i) => (
                                        <input key={i} ref={el => otpRefs.current[i] = el}
                                            type="text" inputMode="numeric" maxLength={1} value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                            className="otp-box w-12 h-14 text-center text-slate-800 text-xl font-bold font-mono bg-white border-2 border-slate-300 hover:border-[#00acee] focus:border-[#00acee]" />
                                    ))}
                                </div>
                                <button disabled={loading}
                                    className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'VERIFY & CREATE ACCOUNT'}
                                </button>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="text-slate-500 hover:text-slate-800 font-mono text-xs transition-all uppercase tracking-widest flex items-center gap-2 font-bold">
                                        <ArrowLeft size={12} /> Back
                                    </button>
                                    <button type="button" onClick={handleSendOtp} disabled={loading}
                                        className="text-[#00acee] hover:text-[#0092cc] font-mono text-xs transition-all uppercase tracking-widest disabled:opacity-50 font-bold">
                                        Resend OTP
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="animate-in fade-in zoom-in duration-500 text-center flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-[#00acee]/40 flex items-center justify-center">
                                <CheckCircle2 size={48} className="text-[#00acee]" />
                            </div>
                            <div>
                                <h2 className="text-slate-800 text-3xl font-bold uppercase tracking-tight mb-2">Account Created!</h2>
                                <p className="text-slate-500 font-mono text-sm">Welcome, <span className="text-[#00acee] font-bold">{formData.Emp_Name}</span>. Your account is ready.</p>
                            </div>
                            <button onClick={() => navigate('/login')}
                                className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] uppercase shadow-lg">
                                SIGN IN NOW
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Centered Footer Section */}
            <div className="w-full flex flex-col items-center justify-center text-[11px] text-slate-500 font-sans tracking-wide space-y-3 z-20 mt-12 pb-4">
                <div className="flex gap-4 mb-1">
                    <button onClick={() => setShowAboutUs(true)} className="text-[#0078d4] hover:text-[#8a2be2] hover:underline transition-colors">Legal</button>
                    <button onClick={() => setLegalModalConfig({
                        isOpen: true,
                        title: 'Privacy Policy',
                        type: 'Privacy',
                        content: <div className="space-y-4">
                            <h3 className="font-bold text-lg text-slate-800">Your Privacy matters to us.</h3>
                            <p>This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.</p>
                            <h4 className="font-bold mt-4">Information Collection</h4>
                            <p>We may collect information about you in a variety of ways. The information we may collect includes personal data, derivative data, financial data, and mobile device data that you voluntarily give to us when you register.</p>
                            <h4 className="font-bold mt-4">Data Security</h4>
                            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
                        </div>
                    })} className="text-[#0078d4] hover:text-[#8a2be2] hover:underline transition-colors">Privacy</button>
                    <button onClick={() => setLegalModalConfig({
                        isOpen: true,
                        title: 'Security Guarantee',
                        type: 'Security',
                        content: <div className="space-y-4">
                            <h3 className="font-bold text-lg text-slate-800">Enterprise-Grade Security</h3>
                            <p>We take the security of your financial data extremely seriously. Our platform is built from the ground up with military-grade encryption and strict access controls.</p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li><strong>End-to-End Encryption:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3.</li>
                                <li><strong>Data Storage:</strong> Your data is stored in ISO 27001 certified data centers with 24/7 physical security.</li>
                                <li><strong>Regular Audits:</strong> We undergo independent third-party security audits and penetration testing quarterly.</li>
                                <li><strong>Access Control:</strong> Multi-factor authentication, role-based access control (RBAC), and detailed audit logs are strictly enforced.</li>
                            </ul>
                        </div>
                    })} className="text-[#0078d4] hover:text-[#8a2be2] hover:underline transition-colors">Security</button>
                </div>
                <div className="flex gap-4 mb-2">
                    <button onClick={() => setShowHelp(true)} className="text-[#0078d4] hover:text-[#8a2be2] hover:underline transition-colors">Support</button>
                    <button onClick={() => setLegalModalConfig({
                        isOpen: true,
                        title: 'Software License Agreement',
                        type: 'SLA',
                        content: <div className="space-y-4">
                            <h3 className="font-bold text-lg text-slate-800">End User License Agreement (EULA)</h3>
                            <p>This End-User License Agreement ("EULA") is a legal agreement between you and Onimta Information Technology Pvt Ltd.</p>
                            <p>This EULA agreement governs your acquisition and use of our Onimta Financial System software ("Software") directly from Onimta Information Technology Pvt Ltd or indirectly through an authorized reseller or distributor.</p>
                            <h4 className="font-bold mt-4">License Grant</h4>
                            <p>Onimta grants you a personal, non-transferable, non-exclusive license to use the Onimta Financial System software on your devices in accordance with the terms of this EULA agreement.</p>
                            <p>You are permitted to load the Software under your control. You are responsible for ensuring your device meets the minimum requirements of the Onimta Financial System software.</p>
                        </div>
                    })} className="text-[#0078d4] hover:text-[#8a2be2] hover:underline transition-colors">Software License Agreement</button>
                </div>
                <p className="text-center max-w-5xl px-4 text-slate-500">
                    Onimta, Onimta Financial System, and Onimta Cloud are registered trademarks of Onimta Information Technology Pvt Ltd. Terms and conditions, features, support, pricing, and service options subject to change without notice.
                </p>
                <p className="text-slate-500/80">
                    © 2026 Onimta Information Technology Pvt Ltd. All rights reserved.
                </p>
            </div>

            {/* Full-page Glow Effect */}
            {glowType && (
                <div
                    className="fixed inset-0 w-full h-full pointer-events-none z-40 animate-in fade-in duration-300"
                    style={{
                        background: glowType === 'error'
                            ? 'linear-gradient(180deg, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.04) 40%, transparent 70%)'
                            : glowType === 'success'
                            ? 'linear-gradient(180deg, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.04) 40%, transparent 70%)'
                            : 'linear-gradient(180deg, rgba(2,132,199,0.15) 0%, rgba(2,132,199,0.04) 40%, transparent 70%)'
                    }}
                />
            )}

            {/* Full-width Bottom Alert Bar */}
            {pageAlert && (
                <div
                    className={`fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full duration-300 ${pageAlert.type === 'error' ? 'bg-red-600' : pageAlert.type === 'success' ? 'bg-emerald-600' : 'bg-sky-600'} text-white shadow-2xl`}
                >
                    <div className="px-8 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="mt-0.5">
                                    {pageAlert.type === 'error' ? (
                                        <AlertCircle size={20} strokeWidth={2.5} />
                                    ) : pageAlert.type === 'success' ? (
                                        <CheckCircle size={20} strokeWidth={2.5} />
                                    ) : (
                                        <Info size={20} strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[16px] font-sans tracking-wide">{pageAlert.title}</h3>
                                    <p className="text-[13px] text-white/85 font-sans mt-0.5 leading-relaxed">{pageAlert.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPageAlert(null)}
                                className="text-white/70 hover:text-white transition-colors ml-4 shrink-0"
                            >
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-[3px] bg-white/20">
                        <div
                            className="h-full bg-white/90"
                            style={{
                                animation: 'toastProgress 4000ms linear forwards'
                            }}
                        />
                    </div>
                </div>
            )}
            <style>{`
                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>

            {/* About Us Sidebar Modal */}
            <AboutUsModal
                isOpen={showAboutUs}
                onClose={() => setShowAboutUs(false)}
            />

            {/* Help Side Drawer Modal */}
            <HelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
            />

            {/* Legal Text Modal (Privacy, Security, SLA) */}
            <LegalTextModal
                {...legalModalConfig}
                onClose={() => setLegalModalConfig({ ...legalModalConfig, isOpen: false })}
            />
        </div>
    );
};

export default RegisterPage;
