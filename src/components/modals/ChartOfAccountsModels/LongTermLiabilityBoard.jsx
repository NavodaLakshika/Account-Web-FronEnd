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
            const result = await longTermLiabService.generateDocNo(companyCode || formData.Company);
            if (result && result.docNo) {
                setFormData(prev => ({ ...prev, LiabCode: result.docNo }));
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
                title="Long Term Liability Registry"
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-slate-50 px-6  w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className=" select-none font-['Tahoma'] space-y-4">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px] shadow-sm transition-all">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed ">
                            Long term liability: Obligations spanning over one year, 
                            including Bank Loans, Leases, and Third Party financing.
                        </p>
                    </div>

                    {/* Main Identity Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-[5px] space-y-3 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-bold text-gray-700 uppercase w-[160px] shrink-0">Liability Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input 
                                    name="LiabCode" value={formData.LiabCode} onChange={handleInputChange}
                                    type="text" className="w-40 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-blue-600 shadow-sm text-center" 
                                    placeholder=""
                                />
                                <div className="flex-1 flex gap-1 items-center">
                                    <input 
                                        name="LiabName" value={formData.LiabName} onChange={handleInputChange}
                                        type="text" className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-gray-700 shadow-sm" 
                                        placeholder=""
                                    />
                                    <button onClick={openSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={18} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-bold text-gray-700 uppercase w-[160px] shrink-0">Linked Account</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={(() => {
                                        const acc = lookups.accounts.find(a => (a.code || a.Code) === formData.LiabAccCode);
                                        return acc ? (acc.name || acc.Name || '').trim() : formData.LiabAccCode;
                                    })()} 
                                    readOnly 
                                    className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-blue-600 shadow-sm cursor-default" 
                                />
                                <button 
                                    onClick={() => setShowAccountSearch(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-bold text-gray-700 uppercase w-[160px] shrink-0">Lender / Institution</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={(() => {
                                        const lender = lookups.lenders.find(l => (l.code || l.Code) === formData.LenderCode);
                                        return lender ? (lender.name || lender.Name || lender.supplier_Name || '').trim() : formData.LenderCode;
                                    })()} 
                                    readOnly 
                                    className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-blue-600 shadow-sm cursor-default" 
                                />
                                <button 
                                    onClick={() => setShowLenderSearch(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Financial Terms Section */}
                    <div className="border border-gray-200 rounded-[5px] p-4 space-y-4 bg-slate-50/20 relative pt-7">
                        <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border text-[#0078d4] border-gray-200 rounded-[5px] text-[10px] font-bold uppercase tracking-widest shadow-sm">Financial Terms & Repayment</span>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-[110px] shrink-0">Description</label>
                                <input name="Description" value={formData.Description} onChange={handleInputChange} type="text" className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-gray-700 shadow-sm" placeholder="" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Total Amount</label>
                                    <input name="Amount" value={formData.Amount} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] text-right font-black text-blue-600 shadow-sm" step="0.01" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Term (Months)</label>
                                    <input name="Term" value={formData.Term} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-bold text-center shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Type</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.PayType} 
                                            readOnly 
                                            className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none font-bold text-gray-700 shadow-sm cursor-default" 
                                            placeholder=""
                                        />
                                        <button 
                                            onClick={() => setShowPayTypeSearch(true)} 
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Origination Date</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.OrgDate} 
                                            readOnly 
                                            className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none font-bold text-gray-700 shadow-sm cursor-default" 
                                        />
                                        <button 
                                            onClick={() => setShowOrgDateModal(true)} 
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Installments (Qty)</label>
                                    <input name="NoOfInstallment" value={formData.NoOfInstallment} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-bold text-center shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Monthly Dues (Rs.)</label>
                                    <input name="MonthlyIns" value={formData.MonthlyIns} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-black text-red-600 text-right shadow-sm" step="0.01" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Interest Rate (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input name="InterestRate" value={formData.InterestRate} onChange={handleInputChange} type="number" className="flex-1 h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-bold text-center text-orange-600 shadow-sm" step="0.1" />
                                        <span className="text-sm font-black text-gray-400">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Due Day</label>
                                    <input name="DueDate" value={formData.DueDate} onChange={handleInputChange} type="number" min="1" max="31" className="w-full h-8 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-black text-center bg-blue-50 text-blue-700 shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
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
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Liability Name or ID..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-32 text-center">Liability ID</span>
                                <span className="flex-1 px-3">Registry Name</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {searchList.map((liab, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => selectLiability(liab.liabCode)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {liab.liabCode}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {liab.liabName}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {searchList.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No recorded liabilities found.</div>
                                )}
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccountSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">General Ledger Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccountSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input type="text" placeholder="Find by Account Name or Code..." className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} />
                        </div>
                        <div className="p-2">
                            <div className="px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase">
                                <span className="w-32 text-center">Account Code</span>
                                <span className="flex-1 px-3">Account Description</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {lookups.accounts.filter(a => 
                                    ((a.name || a.Name || '').toLowerCase().includes(accSearchQuery.toLowerCase())) || 
                                    ((a.code || a.Code || '').toLowerCase().includes(accSearchQuery.toLowerCase()))
                                ).map((acc, idx) => (
                                    <button key={idx} onClick={() => handleAccountSelect(acc)} className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">{acc.code || acc.Code}</span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">{acc.name || acc.Name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lender Search Modal */}
            {showLenderSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowLenderSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <PlusCircle size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Service Providers Lookup</span>
                            </div>
                            <button onClick={() => setShowLenderSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input type="text" placeholder="Find by Lender Name or Code..." className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" value={lenderSearchQuery} onChange={(e) => setLenderSearchQuery(e.target.value)} />
                        </div>
                        <div className="p-2">
                            <div className="px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase">
                                <span className="w-32 text-center">Provider Code</span>
                                <span className="flex-1 px-3">Institution Name</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {lookups.lenders.filter(l => 
                                    ((l.name || l.Name || '').toLowerCase().includes(lenderSearchQuery.toLowerCase())) || 
                                    ((l.code || l.Code || '').toLowerCase().includes(lenderSearchQuery.toLowerCase()))
                                ).map((lender, idx) => (
                                    <button key={idx} onClick={() => handleLenderSelect(lender)} className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">{lender.code || lender.Code}</span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">{lender.name || lender.Name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            <CalendarModal 
                isOpen={showOrgDateModal} 
                onClose={() => setShowOrgDateModal(false)} 
                onSelect={(date) => handleDateSelect('OrgDate', date)} 
                currentDate={formData.OrgDate}
            />
            {/* Payment Type Search Modal */}
            {showPayTypeSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowPayTypeSearch(false)} />
                    <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Payment Type</span>
                            </div>
                            <button onClick={() => setShowPayTypeSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-4 space-y-2">
                            {(lookups.payTypes || []).map((type, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handlePayTypeSelect(type)}
                                    className="w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 border border-gray-100 rounded-lg transition-all text-left flex justify-between items-center group"
                                >
                                    <span className="uppercase tracking-wider">{type.name || type.Name}</span>
                                    <PlusCircle size={16} className="text-gray-300 group-hover:text-[#0078d4] transition-colors" />
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
