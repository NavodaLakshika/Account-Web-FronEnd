import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Loader2, Phone, ShieldCheck, BadgeCheck, Zap } from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Emp_Name: '',
        Email: '',
        Phone_Number: '',
        Pass_Word: '',
        Conpass_Word: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.Pass_Word !== formData.Conpass_Word) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const result = await authService.register(formData);
            toast.success(result.message || 'Registration Successful!');
            navigate('/login');
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: 'url("/auth_bg_v2.png")' }}
        >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
            <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-[0_25px_70px_-20px_rgba(0,0,0,0.3)] flex md:flex-row-reverse h-auto min-h-[660px] border border-white/50 relative z-10">

                {/* Side Pane - Welcome Section (Onimta Blue/Red) */}
                <div className="hidden md:flex w-2/5 bg-[#2b5797] relative flex-col items-center justify-center text-white p-12 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-[#dc2626] rounded-full mix-blend-overlay opacity-30"></div>
                    <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-[#dc2626] rounded-full mix-blend-overlay opacity-20 rotate-45"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/50 to-transparent"></div>

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="mb-8 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl p-3 transition-transform hover:scale-105 duration-500">
                             <img src="/onimta_logo.png" alt="Onimta Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 animate-slide-left tracking-tighter">Become Part of Onimta IT</h2>
                        <p className="text-blue-100 mb-8 opacity-80 text-sm font-medium">Join the next generation of cloud accounting</p>

                        <div className="h-px w-32 bg-white/20 mb-8"></div>

                        <p className="text-blue-100 mb-6 opacity-70 text-xs uppercase tracking-[0.3em] font-black">Already registered?</p>
                        <Link
                            to="/login"
                            className="group relative px-12 py-3.5 rounded-full font-black text-white overflow-hidden transition-all duration-300 shadow-xl border-2 border-white hover:bg-white hover:text-[#2b5797] active:scale-95"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Form Pane - Register (Accounting Professional) */}
                <div className="w-full md:w-3/5 flex flex-col items-center justify-center p-8 md:p-14 bg-white">
                    <div className="w-full max-w-md animate-slide-right">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-3">Onimta Register</h1>
                            <p className="text-slate-400 font-medium text-sm">Account Creation & Management Console</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-[#2b5797]">Employee Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                                        <input
                                            type="text"
                                            name="Emp_Name"
                                            value={formData.Emp_Name}
                                            onChange={handleChange}
                                            placeholder="User Identity"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-[#2b5797] outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Mobile Contact</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                                        <input
                                            type="tel"
                                            name="Phone_Number"
                                            value={formData.Phone_Number}
                                            onChange={handleChange}
                                            placeholder="System Contact"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-[#2b5797] outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest text-[#2b5797]">Secure Workspace Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        placeholder="yourname@onimta.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-[#2b5797] outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Master Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                                        <input
                                            type="password"
                                            name="Pass_Word"
                                            value={formData.Pass_Word}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-[#2b5797] outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Repeat Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b5797] transition-colors" />
                                        <input
                                            type="password"
                                            name="Conpass_Word"
                                            value={formData.Conpass_Word}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-[#2b5797] outline-none transition-all placeholder:text-slate-300 text-slate-700 text-sm font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-2 py-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-[#2b5797]" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold leading-tight">By creating an account, you agree to the Onimta Data Protection Policy and Financial Standards Protocol.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2b5797] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 leading-none"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "PROVISION ACCOUNT"}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-slate-50 pt-6">
                            <div className="flex justify-center items-center gap-2 mb-1">
                                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.4em]">Onimta Information Technology (Pvt) Ltd</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
