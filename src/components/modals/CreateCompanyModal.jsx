import React, { useState, useEffect } from 'react';
import { Building2, Loader2, CheckCircle2, Save, ArrowLeft, Calendar, ShoppingCart, Briefcase } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { setCompanyModule } from '../../utils/session';
import TransactionFormWrapper from '../TransactionFormWrapper';

const CreateCompanyModal = ({ isOpen, onClose, onCreated, user, startDate, selectedModule = 'Sales' }) => {
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
            setForm({
                CompanyCode: `COMP${Math.floor(1000 + Math.random() * 9000)}`,
                CompanyName: '',
                Address: '',
                Phone: '',
                Email: '',
                Country: '',
                Industry: '',
            });
            setDone(false);
        }
    }, [isOpen]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userName = user ? (user.EmpName || user.empName || user.Emp_Name || '') : '';
            const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
            const startYear = new Date(effectiveStartDate).getFullYear().toString();

            const payload = {
                Comp_Name: form.CompanyName,
                Model: selectedModule,
                User_Name: userName,
                Start_Date: effectiveStartDate,
                Acc_Year: startYear,
                To_Year: startYear,
                Address1: form.Address,
                Phone: form.Phone,
                Email: form.Email || null,
                Country: form.Country,
                Industry: form.Industry
            };
            const createdRes = await authService.createCompany(payload);
            setCompanyModule(form.CompanyName, selectedModule);
            if (createdRes?.companyCode) {
                setCompanyModule(createdRes.companyCode, selectedModule);
            }
            setDone(true);
            showSuccessToast('Company created successfully!');
        } catch (err) {
            showErrorToast(typeof err === 'string' ? err : err?.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TransactionFormWrapper boardName="CreateCompanyModal" isOpen={isOpen}
            onClose={onClose}
            title={done ? 'Company Created' : 'New Company'}
            icon={Building2}
            maxWidth="max-w-[700px]"
        >
            {done ? (
                <div className="flex flex-col items-center gap-5 text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 size={48} className="text-[#00acee]" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 text-2xl font-bold tracking-tight mb-2">{form.CompanyName}</h3>
                        <p className="text-slate-500 text-sm">Company registered successfully with <strong className="text-slate-700">{selectedModule} Module</strong>. You can now enter this workspace.</p>
                    </div>
                    <button onClick={() => onCreated(form.CompanyName, selectedModule)} className="px-8 py-3 mt-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-bold text-sm rounded-[3px] transition-all active:scale-[0.98] shadow-sm">
                        Select Company
                    </button>
                </div>
            ) : (
                <form id="companyForm" onSubmit={handleSubmit} className="space-y-6 text-slate-700 p-2">
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-[3px] p-3.5 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <p className="text-xs text-blue-900 leading-relaxed">
                            <strong>Note:</strong> Please provide your company details below.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-[3px] text-xs font-mono font-bold text-[#00acee] shadow-sm whitespace-nowrap">
                                <Calendar size={13} />
                                <span>Start: {startDate || new Date().toISOString().split('T')[0]}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-bold shadow-sm whitespace-nowrap border ${
                                selectedModule === 'Service' 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}>
                                {selectedModule === 'Service' ? <Briefcase size={13} /> : <ShoppingCart size={13} />}
                                <span>Module: {selectedModule}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name <span className="text-red-500">*</span></label>
                            <input type="text" name="CompanyName" value={form.CompanyName} onChange={handleChange} required className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. Acme Corporation" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Industry</label>
                            <input type="text" name="Industry" value={form.Industry} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. Manufacturing, Retail" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Country</label>
                            <input type="text" name="Country" value={form.Country} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. Sri Lanka" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
                            <input type="tel" name="Phone" value={form.Phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. +94 11 234 5678" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                            <input type="email" name="Email" value={form.Email} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. info@company.com" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Address</label>
                            <input type="text" name="Address" value={form.Address} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-[3px] font-bold text-slate-800 text-sm outline-none transition-all focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 hover:border-[#00acee]" placeholder="e.g. 123 Business Road, Colombo" />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-3 mt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-[3px] transition-all flex items-center justify-center gap-2">
                                <ArrowLeft size={16} /> Cancel
                            </button>
                            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#00acee] hover:bg-[#0092cc] text-white font-bold text-sm rounded-[3px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Create Company
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </TransactionFormWrapper>
    );
};

export default CreateCompanyModal;
