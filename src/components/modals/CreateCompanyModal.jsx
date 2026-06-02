import React, { useState, useEffect } from 'react';
import { Building2, Loader2, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
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
            subtitle="Register a new company workspace"
            icon={Building2}
            maxWidth="max-w-2xl"
            footer={
                !done && (
                    <div className="flex items-center justify-end gap-3 w-full">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2">
                            <ArrowLeft size={16} /> Cancel
                        </button>
                        <button type="submit" form="companyForm" disabled={loading} className="px-6 py-3 bg-[#00acee] hover:bg-[#0092cc] text-white font-bold text-sm rounded-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Create Company
                        </button>
                    </div>
                )
            }
        >
            {done ? (
                <div className="flex flex-col items-center gap-5 text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 size={48} className="text-[#00acee]" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 text-2xl font-bold tracking-tight mb-2">{form.CompanyName}</h3>
                        <p className="text-slate-500 text-sm">Company registered successfully. You can now enter this workspace.</p>
                    </div>
                    <button onClick={onCreated} className="px-8 py-3 mt-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-bold text-sm rounded-md transition-all active:scale-[0.98] shadow-sm">
                        Select Company
                    </button>
                </div>
            ) : (
                <form id="companyForm" onSubmit={handleSubmit} className="space-y-6 text-slate-700 p-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Company Name</label>
                            <input type="text" name="CompanyName" value={form.CompanyName} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Country</label>
                            <input type="text" name="Country" value={form.Country} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Industry</label>
                            <input type="text" name="Industry" value={form.Industry} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Address</label>
                            <input type="text" name="Address" value={form.Address} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                            <input type="tel" name="Phone" value={form.Phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" name="Email" value={form.Email} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" />
                        </div>
                    </div>
                </form>
            )}
        </TransactionFormWrapper>
    );
};

export default CreateCompanyModal;
