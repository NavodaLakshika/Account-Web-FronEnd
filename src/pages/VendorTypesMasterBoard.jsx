import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Save, Building2, Loader2, AlertTriangle } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SimpleModal from '../components/SimpleModal';
import { vendorTypeService } from '../services/vendorType.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SearchableSelect from '../components/SearchableSelect';

const VendorTypesMasterBoard = ({ isOpen, onClose }) => {
    const initialState = { VendorType: '', PaybleAccCode: '', PaybleAccName: '', CurrentUser: '', Company: '', Loca: '01' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [vendorSearchTerm, setVendorSearchTerm] = useState('');
    const [accSearchTerm, setAccSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData; } catch (e) { companyCode = companyData; } }
            setFormData(prev => ({ ...prev, CurrentUser: user ? (user.empName || user.EmpName || user.Emp_Name || user.emp_Name || user.username || '') : '', Company: companyCode }));
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [vendorList, accountList] = await Promise.all([vendorTypeService.getVendors(), vendorTypeService.searchAccounts()]);
            setVendors(vendorList);
            setAccounts(accountList);
        } catch (error) { console.error('Data fetch error:', error); }
    };

    const handleVendorSelect = async (vt) => {
        setFormData(prev => ({ ...prev, VendorType: vt.vendorTypes, PaybleAccCode: vt.paybleAccCode }));
        try {
            const details = await vendorTypeService.getDetails(vt.vendorTypes);
            setFormData(prev => ({ ...prev, PaybleAccName: details.paybleAccName }));
        } catch (e) { setFormData(prev => ({ ...prev, PaybleAccName: '' })); }
        setShowVendorModal(false);
    };

    const handleAccSelect = (acc) => {
        setFormData(prev => ({ ...prev, PaybleAccCode: acc.sub_Code, PaybleAccName: acc.sub_Acc_Name }));
        setShowAccModal(false);
    };

    const handleSave = () => {
        if (!formData.VendorType.trim()) { showErrorToast('Vendor Type is required'); return; }
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            await vendorTypeService.save(formData);
            showSuccessToast('Vendor Type saved successfully');
            setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
            fetchInitialData();
        } catch (error) { showErrorToast(typeof error === 'string' ? error : (error.message || 'Failed to save')); } finally { setLoading(false); }
    };

    const handleClear = () => { setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company }); };

    const filteredVendors = vendors.filter(v => (v.vendorTypes || '').toLowerCase().includes(vendorSearchTerm.toLowerCase()));
    const filteredAccounts = accounts.filter(a => (a.sub_Acc_Name || '').toLowerCase().includes(accSearchTerm.toLowerCase()) || (a.sub_Code || '').toLowerCase().includes(accSearchTerm.toLowerCase()));

    return (
        <>
            <TransactionFormWrapper subtitle="Manage vendor type classifications" icon={null}
                isOpen={isOpen} onClose={onClose} title="Vendor Types Master"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Save size={14} /> SAVE</button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Type</label>
                                <div className="relative">
                                    <input type="text" value={formData.VendorType} readOnly onClick={() => setShowVendorModal(true)} placeholder="Select vendor type" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowVendorModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Search size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payable Account</label>
                                <div className="relative">
                                    <input type="text" value={formData.PaybleAccName || formData.PaybleAccCode} readOnly onClick={() => setShowAccModal(true)} placeholder="Select account..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowAccModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"><Search size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title="Vendor Type Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find vendor type..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={vendorSearchTerm} onChange={(e) => setVendorSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">VENDOR TYPE</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredVendors.map((v, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleVendorSelect(v)}>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.vendorTypes}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {filteredVendors.length === 0 && <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No vendor types found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title="Chart of Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find account..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accSearchTerm} onChange={(e) => setAccSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">ACCOUNT NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAccounts.map((a, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleAccSelect(a)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.sub_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.sub_Acc_Name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {filteredAccounts.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No accounts found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><Building2 size={40} className="text-emerald-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Save</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">
                                Are you sure you want to save vendor type <span className="font-bold text-slate-800 uppercase">"{formData.VendorType}"</span>?
                                <br />This will link it to account <span className="font-black text-[#0285fd]">{formData.PaybleAccCode}</span>.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmSave} disabled={loading} className="flex-1 h-11 bg-[#0285fd] text-white text-[11px] font-black rounded-[3px] hover:bg-[#0073ff] shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Continue Save'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Transaction Integrity Guaranteed</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorTypesMasterBoard;
