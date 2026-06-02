import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Loader2, Phone, ShieldCheck, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { authService } from '../services/auth.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
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
        else { strengthText = 'Strong'; strengthColor = 'bg-green-500'; }
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
        if (formData.Pass_Word !== formData.Conpass_Word) { showErrorToast('Passwords do not match'); return; }
        if (!formData.Phone_Number) { showErrorToast('Phone number is required'); return; }
        setLoading(true);
        try {
            const sentOtp = await authService.sendSmsOtp(formData.Phone_Number);
            generatedOtp.current = sentOtp; // store for local verification
            showSuccessToast('OTP sent to ' + formData.Phone_Number);
            setStep(2);
        } catch (err) {
            showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) { showErrorToast('Enter the 6-digit OTP'); return; }
        // Verify locally against the OTP sent via SMS
        if (otpCode !== generatedOtp.current) {
            showErrorToast('Incorrect OTP. Please try again.');
            return;
        }
        setLoading(true);
        try {
            await authService.register(formData);
            setStep(3);
        } catch (err) {
            showErrorToast(typeof err === 'string' ? err : err?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-['Arial'] overflow-hidden bg-[#f8fafc] py-8">
            <style>{`
                .otp-box { transition: border-color 0.2s, box-shadow 0.2s; }
                .otp-box:focus { border-color: #00acee !important; box-shadow: 0 0 0 3px rgba(0,172,238,0.25); outline: none; }
            `}</style>

            <div className="relative z-10 w-full max-w-6xl px-12 flex items-center justify-center mt-16">

                <div className="max-w-md w-full py-12">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1,2,3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${step >= s ? 'bg-[#00acee] text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>{s}</div>
                                {s < 3 && <div className={`flex-1 h-[1px] transition-all ${step > s ? 'bg-[#00acee]' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-slate-800 text-3xl font-tahoma font-bold mb-6 tracking-tight">
                                REGISTER<span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                            </h2>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input type="text" name="Emp_Name" value={formData.Emp_Name} onChange={handleChange}
                                            placeholder="Full Name" required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <input type="tel" name="Phone_Number" value={formData.Phone_Number} onChange={handleChange}
                                            placeholder="Phone Number" required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <input type="email" name="Email" value={formData.Email} onChange={handleChange}
                                        placeholder="Email Address" required
                                        className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 relative">
                                        <input type="password" name="Pass_Word" value={formData.Pass_Word} onChange={handleChange}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            placeholder="Password" required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
                                        
                                        {(passwordFocused || password.length > 0) && (
                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2">
                                                {/* Strength Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Password Strength</span>
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${strengthText === 'Weak' ? 'text-red-500' : strengthText === 'Good' ? 'text-yellow-600' : strengthText === 'Strong' ? 'text-green-600' : 'text-slate-400'}`}>{strengthText}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                                                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 1 ? strengthColor : 'bg-transparent'}`} />
                                                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 2 ? strengthColor : 'bg-transparent'}`} />
                                                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 3 ? strengthColor : 'bg-transparent'}`} />
                                                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthCount >= 4 ? strengthColor : 'bg-transparent'}`} />
                                                    </div>
                                                </div>

                                                <p className="text-[12px] font-bold text-slate-700 mb-3">Your password must contain:</p>
                                                <ul className="space-y-2">
                                                    <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.length ? 'text-green-600' : 'text-slate-400'}`}>
                                                        <span className="text-sm font-bold w-3 text-center">{criteria.length ? '✓' : '−'}</span>
                                                        8 or more characters
                                                    </li>
                                                    <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.number ? 'text-green-600' : 'text-slate-400'}`}>
                                                        <span className="text-sm font-bold w-3 text-center">{criteria.number ? '✓' : '−'}</span>
                                                        Numbers
                                                    </li>
                                                    <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.letter ? 'text-green-600' : 'text-slate-400'}`}>
                                                        <span className="text-sm font-bold w-3 text-center">{criteria.letter ? '✓' : '−'}</span>
                                                        Letters
                                                    </li>
                                                    <li className={`text-[12px] font-semibold flex items-center gap-3 transition-colors ${criteria.special ? 'text-green-600' : 'text-slate-400'}`}>
                                                        <span className="text-sm font-bold w-3 text-center">{criteria.special ? '✓' : '−'}</span>
                                                        Special characters
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <input type="password" name="Conpass_Word" value={formData.Conpass_Word} onChange={handleChange}
                                            placeholder="Confirm Password" required
                                            className="w-full px-4 py-3 bg-white font-mono text-slate-800 placeholder-slate-400 font-bold outline-none border border-slate-300 hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/30 transition-all" />
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
