import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Loader2, Phone, ShieldCheck, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { authService } from '../services/auth.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const RegisterPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const generatedOtp = useRef(''); // stores the OTP sent via SMS for local comparison
    const [formData, setFormData] = useState({
        Emp_Name: '', Email: '', Phone_Number: '', Pass_Word: '', Conpass_Word: ''
    });

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = 0.75;
    }, []);

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
        if (formData.Pass_Word !== formData.Conpass_Word) { toast.error('Passwords do not match'); return; }
        if (!formData.Phone_Number) { toast.error('Phone number is required'); return; }
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
        <div className="min-h-screen relative flex items-center justify-center font-['Arial'] overflow-hidden">
            <style>{`
                @keyframes shimmerFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg,#fff 0%,#fff 40%,#04b4fa 50%,#fff 60%,#fff 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmerFlow 12s linear infinite;
                }
                .otp-box { transition: border-color 0.2s, box-shadow 0.2s; }
                .otp-box:focus { border-color: #00acee !important; box-shadow: 0 0 0 3px rgba(0,172,238,0.25); outline: none; }
            `}</style>

            <div className="absolute inset-0 z-0">
                <video ref={videoRef} autoPlay loop muted playsInline
                    className="absolute w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(24px) brightness(0.3)' }}>
                    <source src="/Video/Backgroundvideo2.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 w-full max-w-6xl px-12 flex items-center justify-between">
                {/* Left Branding */}
                <div className="flex-1 flex flex-col items-center justify-center text-center pr-12">
                    <div className="relative mb-6">
                        <h1 className="text-[85px] font-bold tracking-[0.05em] uppercase animate-shimmer leading-none relative z-10">ONIMTA</h1>
                        <div className="absolute -right-12 -top-12 w-48 h-48 flex items-center justify-center opacity-80 select-none pointer-events-none">
                            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_30s_linear_infinite]" />
                            <img src="/logo-removebg.png" alt="Onimta Logo" className="w-24 h-24 object-contain animate-[pulse_4s_easeInOut_infinite]" />
                        </div>
                    </div>
                    <p className="text-white text-xl font-bold tracking-widest uppercase mb-4 opacity-90">Financial System</p>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-[0.3em]">
                        {step === 1 ? 'Create Your Account' : step === 2 ? 'Phone Verification' : 'Registration Complete'}
                    </p>
                </div>

                <div className="w-[1px] h-96 bg-white/40 mx-12 hidden md:block" />

                <div className="flex-1 max-w-md w-full py-12">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1,2,3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${step >= s ? 'bg-[#00acee] text-white' : 'bg-white/10 text-white/30'}`}>{s}</div>
                                {s < 3 && <div className={`flex-1 h-[1px] transition-all ${step > s ? 'bg-[#00acee]' : 'bg-white/10'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-white text-3xl font-bold mb-6 uppercase tracking-tight">
                                REGISTER<span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                            </h2>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-1 block">Full Name</label>
                                        <div className="relative">
                                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input type="text" name="Emp_Name" value={formData.Emp_Name} onChange={handleChange}
                                                placeholder="" required
                                                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 font-mono text-sm outline-none focus:border-[#00acee]/60 focus:bg-white/10 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-1 block">Phone</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input type="tel" name="Phone_Number" value={formData.Phone_Number} onChange={handleChange}
                                                placeholder="" required
                                                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 font-mono text-sm outline-none focus:border-[#00acee]/60 focus:bg-white/10 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-1 block">Email</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input type="email" name="Email" value={formData.Email} onChange={handleChange}
                                            placeholder="" required
                                            className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 font-mono text-sm outline-none focus:border-[#00acee]/60 focus:bg-white/10 transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-1 block">Password</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input type="password" name="Pass_Word" value={formData.Pass_Word} onChange={handleChange}
                                                placeholder="••••••••" required
                                                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 font-mono text-sm outline-none focus:border-[#00acee]/60 focus:bg-white/10 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-1 block">Confirm</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input type="password" name="Conpass_Word" value={formData.Conpass_Word} onChange={handleChange}
                                                placeholder="••••••••" required
                                                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 font-mono text-sm outline-none focus:border-[#00acee]/60 focus:bg-white/10 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 py-2">
                                    <ShieldCheck size={16} className="text-[#00acee] mt-0.5 shrink-0" />
                                    <p className="text-white/30 text-[10px] font-mono leading-relaxed">By registering you agree to Onimta Data Protection Policy. An OTP will be sent to verify your phone.</p>
                                </div>
                                <button disabled={loading}
                                    className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Phone size={14} /> SEND OTP & CONTINUE</>}
                                </button>
                                <button type="button" onClick={() => navigate('/login')}
                                    className="w-full py-2 text-white/40 hover:text-white font-mono text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ArrowLeft size={12} /> Back to Sign In
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <KeyRound size={32} className="text-[#00acee] mb-4" />
                            <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-2">VERIFY OTP</h2>
                            <p className="text-white/40 font-mono text-sm mb-8">
                                6-digit code sent to <span className="text-[#00acee] font-bold">{formData.Phone_Number}</span>
                            </p>
                            <form onSubmit={handleVerifyAndRegister} className="space-y-8">
                                <div className="flex items-center justify-between gap-2">
                                    {otp.map((digit, i) => (
                                        <input key={i} ref={el => otpRefs.current[i] = el}
                                            type="text" inputMode="numeric" maxLength={1} value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                            className="otp-box w-12 h-14 text-center text-white text-xl font-bold font-mono bg-white/5 border-2 border-white/10" />
                                    ))}
                                </div>
                                <button disabled={loading}
                                    className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-70 uppercase shadow-lg flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'VERIFY & CREATE ACCOUNT'}
                                </button>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="text-white/40 hover:text-white font-mono text-xs transition-all uppercase tracking-widest flex items-center gap-2">
                                        <ArrowLeft size={12} /> Back
                                    </button>
                                    <button type="button" onClick={handleSendOtp} disabled={loading}
                                        className="text-[#00acee] hover:text-white font-mono text-xs transition-all uppercase tracking-widest disabled:opacity-50">
                                        Resend OTP
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="animate-in fade-in zoom-in duration-500 text-center flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-[#00acee]/10 border-2 border-[#00acee]/40 flex items-center justify-center">
                                <CheckCircle2 size={48} className="text-[#00acee]" />
                            </div>
                            <div>
                                <h2 className="text-white text-3xl font-bold uppercase tracking-tight mb-2">Account Created!</h2>
                                <p className="text-white/40 font-mono text-sm">Welcome, <span className="text-[#00acee]">{formData.Emp_Name}</span>. Your account is ready.</p>
                            </div>
                            <button onClick={() => navigate('/login')}
                                className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.2em] transition-all active:scale-[0.98] uppercase shadow-lg">
                                SIGN IN NOW
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 left-10 text-[12px] text-white/40 font-mono tracking-wide">
                Powered by Onimta Information Technology Pvt Ltd
            </div>
        </div>
    );
};

export default RegisterPage;
