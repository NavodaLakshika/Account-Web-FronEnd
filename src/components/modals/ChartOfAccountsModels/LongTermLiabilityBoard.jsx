import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Calendar, Loader2, X, PlusCircle } from 'lucide-react';
import { longTermLiabService } from '../../../services/longTermLiab.service';
import { toast } from 'react-hot-toast';

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
    const [lookups, setLookups] = useState({ accounts: [], lenders: [] });
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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
        }
    }, [isOpen]);

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
    };

    const handleSave = async () => {
        if (!formData.LiabCode || !formData.LiabName) {
            toast.error('Liability number and name are required.');
            return;
        }
        if (!formData.LiabAccCode) {
            toast.error('Account is not selected.');
            return;
        }
        if (!formData.LenderCode) {
            toast.error('Vendor is not selected.');
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
            toast.success('Record saved successfully.');
            handleClear();
        } catch (error) {
            toast.error(error);
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
            toast.error('Failed to load liabilities list');
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
            toast.error('Failed to load liability details');
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
                    <div className="flex justify-center gap-3 w-full border-t pt-3 mt-2">
                        <button onClick={handleSave} disabled={loading} className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border hover:bg-[#005a9e] flex items-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-2 font-['Inter']">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-sm shadow-sm transition-all">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed italic">
                            Long term liability: Obligations spanning over one year, 
                            including Bank Loans, Leases, and Third Party financing.
                        </p>
                    </div>

                    {/* Main Identity Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase w-[160px] shrink-0">Liability Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input 
                                    name="LiabCode" value={formData.LiabCode} onChange={handleInputChange}
                                    type="text" className="w-40 h-8 border border-gray-300 px-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none rounded-sm font-bold text-blue-700" 
                                    placeholder="LIAB-001"
                                />
                                <div className="flex-1 flex gap-1">
                                    <input 
                                        name="LiabName" value={formData.LiabName} onChange={handleInputChange}
                                        type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium" 
                                        placeholder="Liability registry name"
                                    />
                                    <button onClick={openSearch} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-95"><Search size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase w-[160px] shrink-0">Linked Account</label>
                            <select name="LiabAccCode" value={formData.LiabAccCode} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium">
                                <option value="">&lt; Select G/L Account &gt;</option>
                                {lookups.accounts.map((acc, idx) => (
                                    <option key={idx} value={acc.sub_Code} disabled={acc.sub_Code === '850-100'}>
                                        {acc.sub_Code} - {acc.sub_Acc_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase w-[160px] shrink-0">Lender / Institution</label>
                            <select name="LenderCode" value={formData.LenderCode} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium">
                                <option value="">&lt; Select Service Provider &gt;</option>
                                {lookups.lenders.map((lender, idx) => (
                                    <option key={idx} value={lender.code}>{lender.supplier_Name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Financial Terms Section */}
                    <div className="border border-gray-200 rounded-sm p-4 space-y-4 bg-slate-50/20 relative pt-7">
                        <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border text-[#0078d4] border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Financial Terms & Repayment</span>
                        
                        <div className="flex items-center gap-4">
                            <label className="text-[11px] font-black text-gray-500 uppercase w-[110px] shrink-0">Description</label>
                            <input name="Description" value={formData.Description} onChange={handleInputChange} type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-medium" placeholder="E.g. Bank of Ceylon Five Year Loan" />
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            <div className="col-span-5 flex items-center gap-4">
                                <label className="text-[11px] font-black text-gray-500 uppercase w-[110px] shrink-0">Total Amount</label>
                                <input name="Amount" value={formData.Amount} onChange={handleInputChange} type="number" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm text-right font-black text-blue-600" step="0.01" />
                            </div>
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase shrink-0">Term</label>
                                <input name="Term" value={formData.Term} onChange={handleInputChange} type="number" className="w-20 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-bold text-center" />
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase shrink-0">Payment</label>
                                <select name="PayType" value={formData.PayType} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-1 text-sm bg-white focus:border-blue-500 outline-none rounded-sm font-medium">
                                    <option value="">Select Type</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Variable">Variable</option>
                                    <option value="Balloon">Balloon</option>
                                </select>
                            </div>

                            <div className="col-span-5 flex items-center gap-4">
                                <label className="text-[11px] font-black text-gray-500 uppercase w-[110px] shrink-0">Origination</label>
                                <input name="OrgDate" value={formData.OrgDate} onChange={handleInputChange} type="date" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" />
                            </div>
                            <div className="col-span-7 grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Installments (Qty)</label>
                                    <input name="NoOfInstallment" value={formData.NoOfInstallment} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-bold text-center" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Monthly Dues (Rs.)</label>
                                    <input name="MonthlyIns" value={formData.MonthlyIns} onChange={handleInputChange} type="number" className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-black text-red-600 text-right" step="0.01" />
                                </div>
                            </div>

                            <div className="col-span-5 flex items-center gap-4">
                                <label className="text-[11px] font-black text-gray-500 uppercase w-[110px] shrink-0">Interest Rate</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input name="InterestRate" value={formData.InterestRate} onChange={handleInputChange} type="number" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-bold text-center text-orange-600" step="0.1" />
                                    <span className="text-sm font-black text-gray-600">%</span>
                                </div>
                            </div>
                            <div className="col-span-7 flex items-center justify-end gap-3">
                                <label className="text-[11px] font-black text-gray-500 uppercase">Payment Due Day</label>
                                <input name="DueDate" value={formData.DueDate} onChange={handleInputChange} type="number" min="1" max="31" className="w-20 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm font-black text-center bg-blue-50 text-blue-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] border border-gray-300 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Inter']">
                            <div className="flex items-center gap-3">
                                <PlusCircle size={22} className="text-[#0078d4]" />
                                <h3 className="font-black text-gray-800 uppercase tracking-tight text-base">Liability Registry Search</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Search code or name..." 
                                        className="h-10 border border-gray-300 pl-9 pr-3 text-sm rounded-md w-72 focus:border-blue-500 outline-none shadow-sm transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyUp={(e) => e.key === 'Enter' && openSearch()}
                                    />
                                </div>
                                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-[#d13438] transition-colors active:scale-95"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#f8fafd] border-b text-[11px] font-black text-gray-500 uppercase tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 text-center w-40 border-r">Liability ID</th>
                                        <th className="p-4">Registry Name</th>
                                        <th className="p-4 text-center w-28">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchList.map((liab, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/70 transition-colors border-b last:border-0 group cursor-default">
                                            <td className="p-4 text-center font-black text-blue-700 border-r bg-slate-50/50 group-hover:bg-blue-100/50">{liab.liabCode}</td>
                                            <td className="p-4 font-bold text-gray-700 uppercase">{liab.liabName}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => selectLiability(liab.liabCode)} className="bg-white border-2 border-[#0078d4] text-[#0078d4] text-[10px] px-4 py-1.5 rounded-full font-black hover:bg-[#0078d4] hover:text-white transition-all shadow-sm transform hover:-translate-y-0.5 active:translate-y-0">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {searchList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-16 text-center text-gray-400 italic font-medium flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><Search size={24} /></div>
                                                Search above to find recorded liabilities
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 text-[10px] font-black text-gray-400 text-center uppercase tracking-[0.2em]">
                            End of Results • Verified Ledger Data
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LongTermLiabilityBoard;
