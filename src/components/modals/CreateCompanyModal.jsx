import React, { useState, useEffect } from 'react';
import { Building2, Loader2, CheckCircle2, Globe, Briefcase, MapPin, Phone, Mail, Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import TransactionFormWrapper from '../TransactionFormWrapper';

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

    return (
        <TransactionFormWrapper
            isOpen={isOpen}
            onClose={onClose}
            title={done ? 'Company Created' : 'New Company'}
            subtitle="Register a new company"
            icon={Building2}
            maxWidth="max-w-lg"
            footer={
                !done && (
                    <div className="flex items-center justify-end gap-3 w-full">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <ArrowLeft size={14} /> CANCEL
                        </button>
                        <button type="submit" form="companyForm" disabled={loading} className="px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none shadow-md shadow-green-100">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} CREATE COMPANY
                        </button>
                    </div>
                )
            }
        >
            {done ? (
                <div className="flex flex-col items-center gap-5 text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-cyan-50 border-2 border-[#00D1FF]/40 flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-[#00D1FF]" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 text-xl font-mono font-bold uppercase tracking-tight mb-1">{form.CompanyName}</h3>
                        <p className="text-gray-400 text-xs font-mono">Company registered successfully. You can now select it.</p>
                    </div>
                    <button onClick={onCreated} className="px-8 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 shadow-md shadow-green-100">
                        SELECT COMPANY
                    </button>
                </div>
            ) : (
                <form id="companyForm" onSubmit={handleSubmit} className="space-y-4 font-['Tahoma',_sans-serif] text-slate-700">
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-4 gap-y-3.5">
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Company Name</label>
                                <input type="text" name="CompanyName" value={form.CompanyName} onChange={handleChange} required placeholder="Enter company name" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Country</label>
                                <input type="text" name="Country" value={form.Country} onChange={handleChange} placeholder="Select country" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Industry</label>
                                <input type="text" name="Industry" value={form.Industry} onChange={handleChange} placeholder="Select industry" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Address</label>
                                <input type="text" name="Address" value={form.Address} onChange={handleChange} placeholder="Street address" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Phone</label>
                                <input type="tel" name="Phone" value={form.Phone} onChange={handleChange} placeholder="Phone number" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Email</label>
                                <input type="email" name="Email" value={form.Email} onChange={handleChange} placeholder="company@example.com" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 font-mono text-sm outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </TransactionFormWrapper>
    );
};

export default CreateCompanyModal;
