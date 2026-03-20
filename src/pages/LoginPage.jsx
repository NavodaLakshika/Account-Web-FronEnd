import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Loader2, Github, Twitter, Facebook, Chrome, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    empName: '',
    password: ''
  });

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
      toast.success(result.message || 'Login Successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Invalid username or password. Please try again.';
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
              className="inline-block border-2 border-white px-12 py-3 rounded-full font-bold hover:bg-white hover:text-[#2b5797] transition-all duration-300 shadow-lg active:scale-95"
            >
              Register Now
            </Link>
          </div>
        </div>

        {/* Right Pane - Login Form (Accounting Clean) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-white">
          <div className="w-full max-w-sm animate-slide-left">
            <div className="mb-10 block md:hidden text-center">
              <img src="/onimta_logo.png" alt="Onimta Logo" className="w-16 h-16 object-contain mx-auto" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 text-center mb-2">Login</h1>
            <p className="text-slate-400 text-center mb-10 text-sm">Please enter your accounting credentials</p>

            <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="mt-12 text-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] block mb-6">Secured by Onimta Cloud</span>
              <div className="flex justify-center gap-4">
                {[Chrome, Facebook, Github].map((Icon, i) => (
                  <button key={i} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-lg hover:border-blue-100 transition-all text-slate-400 hover:text-[#2b5797]">
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
