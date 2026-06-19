import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, Facebook, Linkedin, Globe, X, ChevronRight, Settings, Info, RefreshCw, MinusCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import CompanySelectModal from '../components/modals/CompanySelectModal';
import AboutUsModal from '../components/modals/AboutUsModal';
import ContactModal from '../components/modals/ContactModal';
import HelpModal from '../components/modals/HelpModal';
import WelcomeModal from '../components/modals/WelcomeModal';
import LegalTextModal from '../components/modals/LegalTextModal';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toastUtils';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
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
    const [recoveryStep, setRecoveryStep] = useState(1); // 1: Request, 2: Reset
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showSocialLinks, setShowSocialLinks] = useState(false);
    const [showAboutUs, setShowAboutUs] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [legalModalConfig, setLegalModalConfig] = useState({ isOpen: false, title: '', content: null, type: '' });
    const [savedAccount, setSavedAccount] = useState(() => {
        const saved = localStorage.getItem('onimta_saved_account');
        return saved ? JSON.parse(saved) : null;
    });
    const [showAccountSelector, setShowAccountSelector] = useState(() => !!localStorage.getItem('onimta_saved_account'));
    const [rememberMe, setRememberMe] = useState(false);
    const [displayedSignInText, setDisplayedSignInText] = useState('');

    const translations = {
        EN: {
            systemTitle: 'Financial System',
            username: 'Username ',
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


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.login(loginData.empName, loginData.password);
            const user = authService.getCurrentUser();
            setCurrentUser(user);

            // Save to localStorage for Account Selector if Remember Me is checked
            if (rememberMe) {
                const accountToSave = {
                    empName: loginData.empName,
                    lastAccessed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };
                localStorage.setItem('onimta_saved_account', JSON.stringify(accountToSave));
                setSavedAccount(accountToSave);
            } else {
                localStorage.removeItem('onimta_saved_account');
                setSavedAccount(null);
            }

            showSuccessToast(result.message || 'Verification Successful');

            // Show the welcome modal after toast animation starts
            setTimeout(() => {
                setShowWelcome(true);
            }, 1000);
        } catch (err) {
            const errorMessage = typeof err === 'object' ? (err.message || err.Message || 'Invalid credentials') : err;
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSavedAccount = () => {
        if (savedAccount) {
            setLoginData(prev => ({ ...prev, empName: savedAccount.empName }));
        }
        setShowAccountSelector(false);
    };

    const handleRemoveSavedAccount = () => {
        localStorage.removeItem('onimta_saved_account');
        setSavedAccount(null);
        setShowAccountSelector(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.forgotPassword(forgotEmail);
            showSuccessToast(result.message || 'Recovery instruction sent');

            // Second alert for the 24 hour wait as requested
            setTimeout(() => {
                showInfoToast('Waiting for 24 hours recovery and reset your password', 'Protocol Init');
            }, 1500);

            setRecoveryStep(2); // Move to reset step
        } catch (err) {
            showErrorToast(typeof err === 'object' ? (err.message || 'Request failed') : err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.resetPassword(resetToken, newPassword);
            showSuccessToast(result.message || 'Password reset successful');
            setShowForgot(false);
            setRecoveryStep(1);
            setResetToken('');
            setNewPassword('');
        } catch (err) {
            showErrorToast(typeof err === 'object' ? (err.message || 'Reset failed') : err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySelected = () => {
        setShowSelection(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-['Arial'] overflow-hidden bg-[#f8fafc] py-8">
            <Helmet>
                <title>Login | Onimta Accounting System</title>
                <meta name="description" content="Securely login to the Onimta Accounting Web Application. Access your financials, dashboards, and enterprise resources." />
                <link rel="canonical" href="https://onimta.com/login" />
            </Helmet>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }

                `}
            </style>



            <div className="relative z-10 w-full max-w-6xl px-12 flex items-center justify-center mt-16">



                {/* Right Form Panel / Success Action */}
                <div className="max-w-md w-full py-12">
                    {showAccountSelector ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center">
                            <h2 className="text-slate-800 text-2xl font-tahoma font-bold mb-6 text-center">
                                Let's get you in to Onimta
                            </h2>
                            
                            {/* Saved Account Card */}
                            <button 
                                onClick={handleSelectSavedAccount}
                                className="w-full bg-white border border-slate-300 hover:border-[#00acee] hover:shadow-md transition-all rounded-none p-4 mb-6 flex items-center gap-4 text-left shadow-sm mt-"
                            >
                                <div className="bg-slate-100 p-3 rounded-none text-slate-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">{savedAccount?.empName}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Last accessed {savedAccount?.lastAccessed} on this device with Onimta</p>
                                </div>
                            </button>

                            {/* Terms */}
                            <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2 mb-8">
                                By signing in to access your <a href="#" className="text-[#00acee] hover:underline">Onimta Account</a>, you agree to <a href="#" className="text-[#00acee] hover:underline">Onimta terms</a> and <a href="#" className="text-[#00acee] hover:underline">Cloud terms</a>. Our <a href="#" className="text-[#00acee] hover:underline">Privacy Policy</a> applies to your personal data. Standard call or SMS rates may apply.
                            </p>

                            {/* Other Actions */}
                            <div className="w-full">
                                <p className="text-sm text-slate-500 font-bold mb-3 px-1">Other actions</p>
                                <button 
                                    onClick={() => setShowAccountSelector(false)}
                                    className="w-full bg-white border border-slate-300 hover:border-[#00acee] transition-all rounded-none p-4 mb-3 flex items-center gap-4 text-left font-bold text-slate-700 text-sm shadow-sm"
                                >
                                    <div className="text-slate-600"><RefreshCw size={20} /></div>
                                    Use a different account
                                </button>
                                <button 
                                    onClick={handleRemoveSavedAccount}
                                    className="w-full bg-white border border-slate-300 hover:border-red-400 transition-all rounded-none p-4 mb-8 flex items-center gap-4 text-left font-bold text-slate-700 text-sm shadow-sm"
                                >
                                    <div className="text-slate-600"><MinusCircle size={20} /></div>
                                    Remove a user ID
                                </button>
                            </div>

                            <p className="text-sm text-slate-600 mb-6">
                                New to Onimta? <button onClick={() => navigate('/register')} className="text-[#00acee] hover:underline font-bold">Create an account</button>
                            </p>

                            <p className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-4 w-full mt-2">
                                Invisible reCAPTCHA by Google <a href="#" className="hover:underline">Privacy Policy</a> and <a href="#" className="hover:underline">Terms of Use</a>.
                            </p>
                        </div>
                    ) : !showForgot ? (
                        <>
                            <h2 className="text-slate-800 text-3xl font-tahoma font-bold mb-8 transition-opacity duration-500 min-h-[40px]">
                                {displayedSignInText}
                                <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                            </h2>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="empName" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        {t.username}
                                    </label>
                                    <input
                                        type="text"
                                        id="empName"
                                        name="empName"
                                        value={loginData.empName}
                                        onChange={handleLoginChange}
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                        {t.password}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 mb-4 px-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded bg-white hover:border-[#00acee] checked:bg-[#00acee] checked:border-[#00acee] focus:outline-none focus:ring-4 focus:ring-[#00acee]/30 transition-all cursor-pointer"
                                            />
                                            <svg className="absolute w-3.5 h-3.5 text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className="text-sm font-mono font-bold text-slate-500 group-hover:text-[#00acee] transition-colors select-none">
                                            {t.remember}
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgot(true)}
                                        className="text-[#00acee] font-mono text-sm font-bold hover:text-[#0092cc] hover:underline transition-all bg-transparent border-none cursor-pointer"
                                    >
                                        {t.forgot}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-6 pt-2">
                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg shadow-black/10"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto text-white" /> : t.login}
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-[1px] bg-slate-300" />
                                        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-[1px] bg-slate-300" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/register')}
                                        className="w-full py-3 border border-slate-300 hover:border-[#00acee] text-slate-500 hover:text-[#00acee] font-mono font-bold tracking-[0.2em] transition-all uppercase text-sm"
                                    >
                                        CREATE ACCOUNT
                                    </button>
                                </div>

                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-slate-800 text-3xl font-tahoma font-bold mb-4 uppercase tracking-tight">
                                {recoveryStep === 1 ? 'Account Recovery' : 'Reset Password'}
                            </h2>
                            <p className="text-slate-500 font-mono text-sm mb-8 leading-relaxed">
                                {recoveryStep === 1
                                    ? <>Enter your <span className="text-[#00acee] font-bold">Username or Corporate Email</span> and we will send you a recovery protocol.</>
                                    : <>Enter the <span className="text-[#00acee] font-bold">Recovery Token</span> sent to you and your <span className="text-[#00acee] font-bold">New Password</span>.</>
                                }
                            </p>

                            <form
                                onSubmit={recoveryStep === 1 ? handleForgotPassword : handleResetPassword}
                                className="space-y-6"
                            >
                                {recoveryStep === 1 ? (
                                    <div className="space-y-1">
                                        <label htmlFor="forgotEmail" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                            Username / Email
                                        </label>
                                        <input
                                            type="text"
                                            id="forgotEmail"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label htmlFor="resetToken" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                                Recovery Token
                                            </label>
                                            <input
                                                type="text"
                                                id="resetToken"
                                                value={resetToken}
                                                onChange={(e) => setResetToken(e.target.value)}
                                                className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="newPassword" className="block text-sm font-sans font-medium text-slate-700 ml-1">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white font-mono text-slate-800 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="space-y-4">
                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" /> : (recoveryStep === 1 ? 'Request Reset' : 'Update Password')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (recoveryStep === 2) {
                                                setRecoveryStep(1);
                                            } else {
                                                setShowForgot(false);
                                            }
                                        }}
                                        className="w-full py-2 text-slate-500 font-mono text-xs hover:text-slate-800 transition-all uppercase tracking-widest font-bold"
                                    >
                                        {recoveryStep === 1 ? 'Back to Sign In' : 'Back to Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
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

            {/* Welcome Modal */}
            <WelcomeModal
                isOpen={showWelcome}
                user={currentUser}
                onComplete={() => {
                    setShowWelcome(false);
                    if (currentUser && (currentUser.userRoleId === "99" || currentUser.UserRoleId === "99")) {
                        navigate('/super-admin');
                    } else {
                        setShowSelection(true);
                    }
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

            {/* Legal Text Modal (Privacy, Security, SLA) */}
            <LegalTextModal
                {...legalModalConfig}
                onClose={() => setLegalModalConfig({ ...legalModalConfig, isOpen: false })}
            />
        </div>
    );
};

export default AuthPage;
