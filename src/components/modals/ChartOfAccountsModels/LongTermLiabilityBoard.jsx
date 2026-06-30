import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { Search, RotateCcw, Save, Calendar, Loader2, X, PlusCircle } from 'lucide-react';
import { longTermLiabService } from '../../../services/longTermLiab.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const LongTermLiabilityBoard = ({ isOpen, onClose }) => {
    const initialState = {
        LiabCode: '',
        LiabName: '',
        LiabAccCode: '',
        LenderCode: '',
        Amount: '0.00',
        Description: '',
        Term: '0',
        OrgDate: new Date().toISOString().split('T')[0],
        PayType: '',
        InterestRate: '0',
        NoOfInstallment: '0',
        MonthlyIns: '0.00',
        DueDate: '1',
        Company: '',
        CreateUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState({ accounts: [], lenders: [], payTypes: [] });
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accSearchQuery, setAccSearchQuery] = useState('');
    const [showLenderSearch, setShowLenderSearch] = useState(false);
    const [lenderSearchQuery, setLenderSearchQuery] = useState('');
    const [showOrgDateModal, setShowOrgDateModal] = useState(false);
    const [showPayTypeSearch, setShowPayTypeSearch] = useState(false);
    // const payTypes = ['Fixed', 'Variable', 'Balloon']; // Removed hardcode

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user'));
            let companyCode = 'C001';
            
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({ 
                ...prev, 
                Company: companyCode,
                CreateUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));

            fetchLookups();
            if (!isEditMode) {
                fetchNextDocNo(companyCode);
            }
        }
    }, [isOpen]);

    const fetchNextDocNo = async (companyCode) => {
        try {
            const result = await longTermLiabService.getNextCode(companyCode || formData.Company);
            if (result && result.nextCode) {
                setFormData(prev => ({ ...prev, LiabCode: result.nextCode }));
            }
        } catch (error) {
            console.error('Failed to fetch next doc no:', error);
            showErrorToast('Failed to auto-generate Liability Number. Please enter it manually or check connection.');
        }
    };

    const fetchLookups = async () => {
        try {
            const data = await longTermLiabService.getLookups();
            setLookups(data);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...initialState,
            Company: formData.Company,
            CreateUser: formData.CreateUser
        });
        setIsEditMode(false);
        fetchNextDocNo(formData.Company);
    };

    const handleAccountSelect = (item) => {
        setFormData(prev => ({ ...prev, LiabAccCode: item.code }));
        setShowAccountSearch(false);
    };

    const handleLenderSelect = (item) => {
        setFormData(prev => ({ ...prev, LenderCode: item.code }));
        setShowLenderSearch(false);
    };

    const handleDateSelect = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handlePayTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, PayType: typeof type === 'object' ? (type.name || type.Name) : type }));
        setShowPayTypeSearch(false);
    };

    const handleSave = async () => {
        if (!formData.LiabCode) {
            showErrorToast('Liability Number is required.');
            return;
        }
        if (!formData.LiabName) {
            showErrorToast('Liability Name is required.');
            return;
        }
        if (!formData.LiabAccCode) {
            showErrorToast('Account is not selected.');
            return;
        }
        if (!formData.LenderCode) {
            showErrorToast('Vendor is not selected.');
            return;
        }

        setLoading(true);
        try {
            await longTermLiabService.save({
                ...formData,
                Amount: parseFloat(formData.Amount),
                Term: parseFloat(formData.Term),
                InterestRate: parseFloat(formData.InterestRate),
                NoOfInstallment: parseInt(formData.NoOfInstallment),
                MonthlyIns: parseFloat(formData.MonthlyIns)
            });
            showSuccessToast('Record saved successfully.');
            handleClear();
        } catch (error) {
            showErrorToast(error.message || error.toString() || 'Failed to save record.');
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await longTermLiabService.search(formData.Company, searchQuery);
            setSearchList(data);
            setShowSearchModal(true);
        } catch (err) {
            showErrorToast('Failed to load liabilities list.');
        } finally {
            setLoading(false);
        }
    };

    const selectLiability = async (code) => {
        setLoading(true);
        try {
            const data = await longTermLiabService.getByCode(code, formData.Company);
            setFormData({
                LiabCode: data.liabCode || data.LiabCode,
                LiabName: data.liabName || data.LiabName,
                LiabAccCode: data.liabAccCode || data.LiabAccCode,
                LenderCode: data.lenderCode || data.LenderCode,
                Amount: data.amount || data.Amount,
                Description: data.description || data.Description,
                Term: data.term || data.Term,
                OrgDate: convertDateToDisplay(data.orgDate || data.OrgDate),
                PayType: data.payType || data.PayType,
                InterestRate: data.interestRate || data.InterestRate,
                NoOfInstallment: data.noOfInstallment || data.NoOfInstallment,
                MonthlyIns: data.monthlyIns || data.MonthlyIns,
                DueDate: data.dueDate || data.DueDate,
                Company: data.company || data.Company,
                CreateUser: formData.CreateUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) {
            showErrorToast('Failed to load liability details.');
        } finally {
            setLoading(false);
        }
    };

    const convertDateToDisplay = (dateStr) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return dateStr.split('T')[0];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Long Term Liability"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'UPDATE' : 'SAVE'}
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className=" select-none font-['Tahoma'] space-y-4">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px] shadow-sm transition-all">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed ">
                            Long term liability: Obligations spanning over one year, 
                            including Bank Loans, Leases, and Third Party financing.
                        </p>
                    </div>

                    {/* Main Identity Section */}
 <div className="bg-white p-4 rounded-[3px] space-y-4 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px] shrink-0">Liability Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input 
                                    name="LiabCode" value={formData.LiabCode} onChange={handleInputChange}
                                    type="text" className="w-40 h-8 border text-[12px] border-slate-200 px-3 bg-slate-50 font-bold text-[#0285fd] rounded outline-none shadow-sm text-center cursor-not-allowed" 
                                    placeholder="Enter ID"
                                    readOnly
                                />
                                <div className="flex-1 flex gap-1 items-center">
                                    <input 
                                        name="LiabName" value={formData.LiabName} onChange={handleInputChange}
                                        type="text" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white" 
                                        placeholder=""
                                    />
                                    <button onClick={openSearch} className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"><Search size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px] shrink-0">Linked Account</label>
                            <div className="flex-1 flex gap-1 items-center">
                                <input 
                                    type="text" 
                                    value={(() => {
                                        const acc = lookups.accounts.find(a => (a.code || a.Code) === formData.LiabAccCode);
                                        return acc ? (acc.name || acc.Name || '').trim() : formData.LiabAccCode;
                                    })()} 
                                    readOnly 
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                />
                                <button 
                                    onClick={() => setShowAccountSearch(true)} 
                                    className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px] shrink-0">Lender / Institution</label>
                            <div className="flex-1 flex gap-1 items-center">
                                <input 
                                    type="text" 
                                    value={(() => {
                                        const lender = lookups.lenders.find(l => (l.code || l.Code) === formData.LenderCode);
                                        return lender ? (lender.name || lender.Name || lender.supplier_Name || '').trim() : formData.LenderCode;
                                    })()} 
                                    readOnly 
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                />
                                <button 
                                    onClick={() => setShowLenderSearch(true)} 
                                    className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Financial Terms Section */}
 <div className=" rounded-[3px] p-4 space-y-4 bg-white relative pt-7 shadow-sm">
                        <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border text-[#0285fd] border-slate-200 rounded-[3px] text-[10px] font-bold uppercase tracking-widest shadow-sm">Financial Terms & Repayment</span>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[110px] shrink-0">Description</label>
                                <input name="Description" value={formData.Description} onChange={handleInputChange} type="text" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white" placeholder="" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Amount</label>
                                    <input name="Amount" value={formData.Amount} onChange={handleInputChange} type="number" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-blue-600 bg-white text-right" step="0.01" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Term (Months)</label>
                                    <input name="Term" value={formData.Term} onChange={handleInputChange} type="number" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white text-center" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Payment Type</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.PayType} 
                                            readOnly 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                            placeholder=""
                                        />
                                        <button 
                                            onClick={() => setShowPayTypeSearch(true)} 
                                            className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                        >
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Origination Date</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.OrgDate} 
                                            readOnly 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                        />
                                        <button 
                                            onClick={() => setShowOrgDateModal(true)} 
                                            className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Installments (Qty)</label>
                                    <input name="NoOfInstallment" value={formData.NoOfInstallment} onChange={handleInputChange} type="number" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white text-center" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Monthly Dues (Rs.)</label>
                                    <input name="MonthlyIns" value={formData.MonthlyIns} onChange={handleInputChange} type="number" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-red-500 bg-white text-right" step="0.01" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Interest Rate (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input name="InterestRate" value={formData.InterestRate} onChange={handleInputChange} type="number" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-orange-600 bg-white text-center" step="0.1" />
                                        <span className="text-sm font-black text-gray-400">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Payment Due Day</label>
                                    <input name="DueDate" value={formData.DueDate} onChange={handleInputChange} type="number" min="1" max="31" className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-[#0285fd] bg-slate-50 text-center" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
 <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Liability Registry Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Liability Name or ID..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Liability ID</th>
                                            <th className="px-5 py-3">Registry Name</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {searchList.map((liab, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => selectLiability(liab.liabCode)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{liab.liabCode}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{liab.liabName}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {searchList.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No recorded liabilities found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{searchList.length} Result(s) Found</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Account Search Modal */}
            {showAccountSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAccountSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">General Ledger Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccountSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input type="text" placeholder="Find by Account Name or Code..." className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} />
                        </div>
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Account Code</th>
                                            <th className="px-5 py-3">Account Description</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {lookups.accounts.filter(a => 
                                            ((a.name || a.Name || '').toLowerCase().includes(accSearchQuery.toLowerCase())) || 
                                            ((a.code || a.Code || '').toLowerCase().includes(accSearchQuery.toLowerCase()))
                                        ).map((acc, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => handleAccountSelect(acc)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{acc.code || acc.Code}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{acc.name || acc.Name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lookups.accounts.filter(a => ((a.name || a.Name || '').toLowerCase().includes(accSearchQuery.toLowerCase())) || ((a.code || a.Code || '').toLowerCase().includes(accSearchQuery.toLowerCase()))).length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No accounts found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lender Search Modal */}
            {showLenderSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowLenderSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <PlusCircle size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Service Providers Lookup</span>
                            </div>
                            <button onClick={() => setShowLenderSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input type="text" placeholder="Find by Lender Name or Code..." className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" value={lenderSearchQuery} onChange={(e) => setLenderSearchQuery(e.target.value)} />
                        </div>
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Provider Code</th>
                                            <th className="px-5 py-3">Institution Name</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {lookups.lenders.filter(l => 
                                            ((l.name || l.Name || '').toLowerCase().includes(lenderSearchQuery.toLowerCase())) || 
                                            ((l.code || l.Code || '').toLowerCase().includes(lenderSearchQuery.toLowerCase()))
                                        ).map((lender, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => handleLenderSelect(lender)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{lender.code || lender.Code}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{lender.name || lender.Name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {lookups.lenders.filter(l => ((l.name || l.Name || '').toLowerCase().includes(lenderSearchQuery.toLowerCase())) || ((l.code || l.Code || '').toLowerCase().includes(lenderSearchQuery.toLowerCase()))).length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No providers found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            <CalendarModal 
                isOpen={showOrgDateModal} 
                onClose={() => setShowOrgDateModal(false)} 
                onDateSelect={(date) => handleDateSelect('OrgDate', date)} 
                currentDate={formData.OrgDate}
            />
            {/* Payment Type Search Modal */}
            {showPayTypeSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowPayTypeSearch(false)} />
 <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Payment Type</span>
                            </div>
                            <button onClick={() => setShowPayTypeSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {(lookups.payTypes || []).map((type, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handlePayTypeSelect(type)}
                                    className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-slate-50 border border-slate-200 rounded-[3px] transition-all text-left flex justify-between items-center group shadow-sm"
                                >
                                    <span className="uppercase tracking-widest">{type.name || type.Name}</span>
                                    <PlusCircle size={16} className="text-gray-300 group-hover:text-[#0285fd] transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LongTermLiabilityBoard;
