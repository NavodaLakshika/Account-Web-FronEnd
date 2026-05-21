import React, { useState, useEffect } from 'react';
import { Building2, X, Loader2, CheckCircle2, Globe, Hash, Briefcase, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const CreateCompanyModal = ({ isOpen, onClose, onCreated, user }) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [form, setForm] = useState({
        CompanyCode: '',
        CompanyName: '',
        Address: '',
        Phone: '',
        Email: '',
        Country: '',
        Industry: '',
    });


    useEffect(() => {
        if (isOpen) {
            setForm(prev => ({
                ...prev,
                CompanyCode: `COMP${Math.floor(1000 + Math.random() * 9000)}`
            }));
            setDone(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userName = user ? (user.EmpName || user.empName || user.Emp_Name || '') : '';
            const payload = {
                Comp_Name: form.CompanyName,
                User_Name: userName,
                Address1: form.Address,
                Phone: form.Phone,
                Email: form.Email,
                Country: form.Country,
                Industry: form.Industry
            };
            await authService.createCompany(payload);
            setDone(true);
            showSuccessToast('Company created successfully!');
        } catch (err) {
            showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    const field = (name, label, icon, type = 'text', placeholder = '', readOnly = false) => (
        <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
                <input type={type} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder || label} required={!readOnly} readOnly={readOnly}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-sm font-mono outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-slate-100 font-bold text-blue-600' : 'focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20'}`} />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg animate-in slide-in-from-bottom-10 fade-in duration-400">
                {/* Header outside card */}
                <div className="mb-6 flex items-center justify-between px-1">
                    <h2 className="text-white text-2xl font-mono font-bold uppercase tracking-widest">
                        {done ? 'Company Created' : 'New Company'}
                        <span className="animate-[pulse_1s_ease-in-out_infinite] opacity-70 font-light ml-1">_</span>
                    </h2>
                    <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="bg-white rounded-[5px] shadow-2xl overflow-hidden">
                    {done ? (
                        <div className="p-10 flex flex-col items-center gap-5 text-center">
                            <div className="w-20 h-20 rounded-full bg-cyan-50 border-2 border-[#00D1FF]/40 flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-[#00D1FF]" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 text-xl font-black uppercase tracking-tight mb-1">{form.CompanyName}</h3>
                                <p className="text-slate-400 text-xs font-mono">Company registered successfully. You can now select it.</p>
                            </div>
                            <button onClick={onCreated}
                                className="w-full py-4 bg-[#00D1FF] hover:bg-[#00acee] text-white font-mono font-bold tracking-widest uppercase rounded-[5px] transition-all active:scale-[0.98]">
                                SELECT COMPANY
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            {field('CompanyName', 'Company Name', <Building2 size={13} />, 'text', '')}
                            <div className="grid grid-cols-2 gap-4">
                                {field('Country', 'Country', <Globe size={13} />, 'text', '')}
                                {field('Industry', 'Industry', <Briefcase size={13} />, 'text', '')}
                            </div>
                            {field('Address', 'Address', <MapPin size={13} />, 'text', '')}
                            <div className="grid grid-cols-2 gap-4">
                                {field('Phone', 'Phone', <Phone size={13} />, 'tel', '')}
                                {field('Email', 'Email', <Mail size={13} />, 'email', '')}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all flex items-center justify-center gap-2">
                                    <ArrowLeft size={14} /> Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 bg-[#00D1FF] hover:bg-[#00acee] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'CREATE COMPANY'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCompanyModal;
