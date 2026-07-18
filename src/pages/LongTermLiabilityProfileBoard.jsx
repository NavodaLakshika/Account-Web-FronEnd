import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Save, Calendar } from 'lucide-react';
import { longTermLiabService } from '../services/longTermLiab.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const LongTermLiabilityProfileBoard = ({ isOpen, onClose }) => {
    const initialState = {
        LiabCode: '', LiabName: '', LiabAccCode: '', LenderCode: '', Amount: '0.00',
        Description: '', Term: '0', OrgDate: new Date().toISOString().split('T')[0],
        PayType: '', InterestRate: '0', NoOfInstallment: '0', MonthlyIns: '0.00',
        DueDate: '1', Company: '', CreateUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState({ accounts: [], lenders: [], payTypes: [] });
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOrgDateModal, setShowOrgDateModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user'));
            let companyCode = 'C001';
            if (companyData) {
                try { const parsed = JSON.parse(companyData); companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData; } catch (e) { companyCode = companyData; }
            }
            setFormData(prev => ({ ...prev, Company: companyCode, CreateUser: user?.emp_Name || user?.empName || 'SYSTEM' }));
            fetchLookups();
            if (!isEditMode) fetchNextDocNo(companyCode);
        }
    }, [isOpen]);

    const fetchNextDocNo = async (companyCode) => {
        try {
            const result = await longTermLiabService.getNextCode(companyCode || formData.Company);
            if (result && result.nextCode) setFormData(prev => ({ ...prev, LiabCode: result.nextCode }));
        } catch (error) { showErrorToast('Failed to auto-generate Liability Number.'); }
    };

    const fetchLookups = async () => {
        try { const data = await longTermLiabService.getLookups(); setLookups(data); } catch (error) { console.error('Lookup error:', error); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({ ...initialState, Company: formData.Company, CreateUser: formData.CreateUser });
        setIsEditMode(false);
        fetchNextDocNo(formData.Company);
    };

    const handleDateSelect = (field, date) => { setFormData(prev => ({ ...prev, [field]: date })); };

    const handleSave = async () => {
        if (!formData.LiabCode) { showErrorToast('Liability Number is required.'); return; }
        if (!formData.LiabName) { showErrorToast('Liability Name is required.'); return; }
        if (!formData.LiabAccCode) { showErrorToast('Account is not selected.'); return; }
        if (!formData.LenderCode) { showErrorToast('Vendor is not selected.'); return; }
        setLoading(true);
        try {
            await longTermLiabService.save({ ...formData, Amount: parseFloat(formData.Amount), Term: parseFloat(formData.Term), InterestRate: parseFloat(formData.InterestRate), NoOfInstallment: parseInt(formData.NoOfInstallment), MonthlyIns: parseFloat(formData.MonthlyIns) });
            showSuccessToast('Record saved successfully.');
            handleClear();
        } catch (error) { showErrorToast(error.message || error.toString() || 'Failed to save record.'); } finally { setLoading(false); }
    };

    const openSearch = async () => {
        setLoading(true);
        try { const data = await longTermLiabService.search(formData.Company, ''); setSearchList(data); setShowSearchModal(true); } catch (err) { showErrorToast('Failed to load liabilities list.'); } finally { setLoading(false); }
    };

    const selectLiability = async (code) => {
        setLoading(true);
        try {
            const data = await longTermLiabService.getByCode(code, formData.Company);
            const convertDate = (dateStr) => {
                if (!dateStr) return new Date().toISOString().split('T')[0];
                if (dateStr.includes('/')) { const [d, m, y] = dateStr.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
                return dateStr.split('T')[0];
            };
            setFormData({
                LiabCode: data.liabCode || data.LiabCode, LiabName: data.liabName || data.LiabName,
                LiabAccCode: data.liabAccCode || data.LiabAccCode, LenderCode: data.lenderCode || data.LenderCode,
                Amount: data.amount || data.Amount, Description: data.description || data.Description,
                Term: data.term || data.Term, OrgDate: convertDate(data.orgDate || data.OrgDate),
                PayType: data.payType || data.PayType, InterestRate: data.interestRate || data.InterestRate,
                NoOfInstallment: data.noOfInstallment || data.NoOfInstallment, MonthlyIns: data.monthlyIns || data.MonthlyIns,
                DueDate: data.dueDate || data.DueDate, Company: data.company || data.Company, CreateUser: formData.CreateUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) { showErrorToast('Failed to load liability details.'); } finally { setLoading(false); }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage long-term liability records" icon={null}
                isOpen={isOpen} onClose={onClose} title="Long Term Liability"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> {isEditMode ? 'UPDATE' : 'SAVE'}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px]">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center">Long term liability: Obligations spanning over one year, including Bank Loans, Leases, and Third Party financing.</p>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Liability Number</label>
                                <input type="text" name="LiabCode" value={formData.LiabCode} onChange={handleInputChange} readOnly className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-slate-50 outline-none text-gray-700 font-mono" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Liability Name</label>
                                <input type="text" name="LiabName" value={formData.LiabName} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3 flex items-end">
                                <button onClick={openSearch} className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] text-[13px] transition-all flex items-center justify-center gap-2 border-none">
                                    <Search size={16} /> SEARCH
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Linked Account</label>
                                <select
                                    value={formData.LiabAccCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, LiabAccCode: e.target.value }))}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select account...</option>
                                    {lookups.accounts.map((acc, idx) => (
                                        <option key={idx} value={acc.code || acc.Code}>{acc.name || acc.Name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Lender / Institution</label>
                                <select
                                    value={formData.LenderCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, LenderCode: e.target.value }))}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select lender...</option>
                                    {lookups.lenders.map((lender, idx) => (
                                        <option key={idx} value={lender.code || lender.Code}>{lender.name || lender.Name || lender.supplier_Name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Financial Terms & Repayment</span>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                <input type="text" name="Description" value={formData.Description} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Amount</label>
                                <input type="number" name="Amount" value={formData.Amount} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" step="0.01" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Term (Months)</label>
                                <input type="number" name="Term" value={formData.Term} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Type</label>
                                <select
                                    value={formData.PayType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, PayType: e.target.value }))}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select type...</option>
                                    {lookups.payTypes.map((type, idx) => (
                                        <option key={idx} value={type.name || type.Name}>{type.name || type.Name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Origination Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.OrgDate} onClick={() => setShowOrgDateModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowOrgDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Installments (Qty)</label>
                                <input type="number" name="NoOfInstallment" value={formData.NoOfInstallment} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Monthly Dues</label>
                                <input type="number" name="MonthlyIns" value={formData.MonthlyIns} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" step="0.01" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Interest Rate (%)</label>
                                <input type="number" name="InterestRate" value={formData.InterestRate} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center" step="0.1" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Due Day</label>
                                <input type="number" name="DueDate" value={formData.DueDate} onChange={handleInputChange} min="1" max="31" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Liability Registry Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find by Liability Name or ID..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Liability ID</th><th className=" px-5 py-3">Registry Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {searchList.filter(l => (l.liabName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.liabCode || '').toLowerCase().includes(searchQuery.toLowerCase())).map((liab, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectLiability(liab.liabCode)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{liab.liabCode}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{liab.liabName}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {searchList.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No recorded liabilities found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showOrgDateModal} onClose={() => setShowOrgDateModal(false)} onDateSelect={(date) => handleDateSelect('OrgDate', date)} currentDate={formData.OrgDate} />
        </>
    );
};

export default LongTermLiabilityProfileBoard;
