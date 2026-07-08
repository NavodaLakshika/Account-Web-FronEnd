import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Loader2, Github, Twitter, Facebook, Chrome, AlertCircle, ShieldAlert } from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { showSuccessToast } from '../utils/toastUtils';
import AnimatedBackground from '../components/AnimatedBackground';


const SUCCESS_SOUND_URL = '/Music/mrstokes302-success-videogame-sfx-423626.mp3';



const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    empName: '',
    password: ''
  });

  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [authEmpCode, setAuthEmpCode] = useState('');
  const [twoFAMethod, setTwoFAMethod] = useState('APP');

  const handleChange = (e) => {
    setErrorMsg(''); // Clear error when user starts typing
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Always prevent default FIRST
    if (!formData.empName || !formData.password) {
      setErrorMsg('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await authService.login(formData.empName, formData.password);
      
      if (result.requires2FA || result.Requires2FA) {
        setTempToken(result.tempToken || result.TempToken);
        setAuthEmpCode(result.empCode || result.EmpCode);
        setTwoFAMethod(result.method || result.Method || 'APP');
        setShow2FA(true);
        return;
      }

      const subStatus = result.subscriptionStatus || result.SubscriptionStatus;
      const subEndDate = result.subscriptionEndDate || result.SubscriptionEndDate;

      // Allow expired users to login so the Dashboard can show them the Subscription modal

      let successMessage = result.message || 'Login Successful!';
      
      if (subStatus === 'Trial') {
        const endDateStr = subEndDate ? new Date(subEndDate).toLocaleDateString() : '1 month';
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-800">Free Trial Active</span>
            <span className="text-sm text-slate-600">You are currently on a free trial which will expire on {endDateStr}.</span>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="mt-2 bg-blue-600 text-white rounded px-3 py-1 text-sm font-bold w-max"
            >
              Acknowledge
            </button>
          </div>
        ), { duration: 8000, icon: '🎉' });
      } else {
        showSuccessToast(successMessage);
      }
      
      // Play success sound
      const audio = new Audio(SUCCESS_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed:", e));

      navigate('/dashboard');
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err.message || 'Invalid username or password. Please try again.');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFACode || twoFACode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await authService.verify2FALogin(authEmpCode, tempToken, twoFACode);
      
      const subStatus = result.subscriptionStatus || result.SubscriptionStatus;
      const subEndDate = result.subscriptionEndDate || result.SubscriptionEndDate;

      let successMessage = result.message || 'Login Successful!';
      
      if (subStatus === 'Trial') {
        const endDateStr = subEndDate ? new Date(subEndDate).toLocaleDateString() : '1 month';
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-800">Free Trial Active</span>
            <span className="text-sm text-slate-600">You are currently on a free trial which will expire on {endDateStr}.</span>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="mt-2 bg-blue-600 text-white rounded px-3 py-1 text-sm font-bold w-max"
            >
              Acknowledge
            </button>
          </div>
        ), { duration: 8000, icon: '🎉' });
      } else {
        showSuccessToast(successMessage);
      }
      
      const audio = new Audio(SUCCESS_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play failed:", e));

      navigate('/dashboard');
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err.message || 'Invalid 2FA code.');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: 'url("/auth_bg_v2.png")' }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      <AnimatedBackground />
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex h-[620px] border border-white/50 relative z-10">

        {/* Left Pane - Welcome Section (Blue/Red Branding) */}
        <div className="hidden md:flex w-1/2 bg-[#2b5797] relative flex-col items-center justify-center text-white p-12 overflow-hidden">
          {/* Brand Accents */}
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#dc2626] rounded-full mix-blend-overlay opacity-40"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-[#dc2626] rounded-full mix-blend-overlay opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/50 to-transparent"></div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="mb-8 w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl p-4 transition-transform hover:scale-105 duration-500">
               <img src="/onimta_logo.png" alt="Onimta Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-4xl font-bold mb-2 animate-slide-right tracking-tight">Onimta IT</h2>
            <p className="text-blue-50 mb-8 opacity-80 text-sm font-medium">Accounting Management System</p>

            <div className="h-px w-24 bg-white/30 mb-8"></div>

            <p className="text-blue-100 mb-6 opacity-90 text-xs uppercase tracking-[0.2em] font-bold">New to the system?</p>
            <Link
              to="/register"
              className="inline-block border-2 border-white px-12 py-3 rounded-[3px] font-bold hover:bg-white hover:text-[#2b5797] transition-all duration-300 shadow-lg active:scale-95"
            >
              Register Now
            </Link>
          </div>
        </div>

        {/* Right Pane - Login Form (Accounting Clean) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-white">
          <div className="w-full animate-slide-left">
            <div className="mb-10 block md:hidden text-center">
              <img src="/onimta_logo.png" alt="Onimta Logo" className="w-16 h-16 object-contain mx-auto" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 text-center mb-2">Login</h1>
            <p className="text-slate-400 text-center mb-10 text-sm">Please enter your accounting credentials</p>

            {show2FA ? (
              <form onSubmit={handleVerify2FA} className="space-y-5 animate-in slide-in-from-right duration-500">
                <div className="text-center mb-6">
                  <ShieldAlert className="w-16 h-16 text-[#2b5797] mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-800">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {twoFAMethod === 'EMAIL' 
                      ? 'Please enter the 6-digit code sent to your email.' 
                      : 'Please enter the 6-digit code from your authenticator app.'}
                  </p>
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1 transition-colors group-focus-within:text-[#2b5797]">Verification Code</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFACode}
                      onChange={(e) => { setErrorMsg(''); setTwoFACode(e.target.value); }}
                      placeholder="000000"
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700 font-bold tracking-widest text-center ${errorMsg ? 'border-red-200 focus:border-red-400' : 'border-transparent focus:border-[#2b5797]'}`}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                    <span className="text-sm font-semibold">{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2b5797] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "VERIFY CODE"}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setShow2FA(false); setTwoFACode(''); setErrorMsg(''); }}
                  className="w-full mt-2 text-slate-500 hover:text-slate-800 text-sm font-semibold"
                >
                  Back to Login
                </button>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left duration-500">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1 transition-colors group-focus-within:text-[#2b5797]">User Identity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                  <input
                    type="text"
                    name="empName"
                    value={formData.empName}
                    onChange={handleChange}
                    placeholder="Username / Emp Name"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium ${errorMsg ? 'border-red-200 focus:border-red-400' : 'border-transparent focus:border-[#2b5797]'}`}
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1 transition-colors group-focus-within:text-[#2b5797]">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium ${errorMsg ? 'border-red-200 focus:border-red-400' : 'border-transparent focus:border-[#2b5797]'}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2b5797] focus:ring-[#2b5797]" />
                  <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-xs font-bold text-[#2b5797] hover:underline decoration-2">Forgot Password?</a>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                  <span className="text-sm font-semibold">{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2b5797] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "AUTHENTICATE"}
              </button>
            </form>
            )}

            <div className="mt-12 text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] block mb-6">Secured by Onimta Cloud</span>
              <div className="flex justify-center gap-4">
                {[Chrome, Facebook, Github].map((Icon, i) => (
                  <button key={i} className="p-3 bg-white border border-slate-100 rounded-[3px] hover:shadow-lg hover:border-blue-100 transition-all text-slate-400 hover:text-[#2b5797]">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
