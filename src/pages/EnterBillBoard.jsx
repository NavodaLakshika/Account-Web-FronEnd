import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Trash2, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import { enterBillService } from '../services/enterBill.service';
import { toast } from 'react-hot-toast';

const EnterBillBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [billType, setBillType] = useState('Bill');
    const [lookups, setLookups] = useState({ payAccounts: [], expAccounts: [], costCenters: [], vendors: [] });
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCostCenterModal, setShowCostCenterModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [showAPModal, setShowAPModal] = useState(false);
    const [apSearch, setApSearch] = useState('');
    const [showExpModal, setShowExpModal] = useState(false);
    const [expSearch, setExpSearch] = useState('');
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'line'

    const [formData, setFormData] = useState({
        docNo: '',
        vendorId: '',
        accId: '',
        terms: '',
        memo: '',
        billNo: '',
        refNo: '',
        postDate: new Date().toISOString().split('T')[0],
        billDueDate: new Date().toISOString().split('T')[0],
        costCenter: '',
        company: '',
        createUser: 'SYSTEM'
    });

    const [expenses, setExpenses] = useState([]);

    // Line entry state
    const [currentLine, setCurrentLine] = useState({
        accCode: '',
        costCenter: '',
        amount: '',
        memo: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            generateDocNo();

            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';

            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await enterBillService.getLookups();
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async () => {
        try {
            const data = await enterBillService.generateDocNo();
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            toast.error('Failed to generate document number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (e) => {
        const { name, value } = e.target;
        setCurrentLine(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLine = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!currentLine.accCode || !currentLine.amount || parseFloat(currentLine.amount) === 0) {
                toast.error('Please select an account and enter a valid amount.');
                return;
            }
            setExpenses([...expenses, { ...currentLine, amount: parseFloat(currentLine.amount) }]);
            setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
        }
    };

    const handleRemoveLine = (idx) => {
        setExpenses(expenses.filter((_, i) => i !== idx));
    };

    const calculateTotal = () => expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const handleClear = () => {
        setExpenses([]);
        setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
        setFormData({
            ...formData,
            vendorId: '',
            accId: '',
            terms: '',
            memo: '',
            billNo: '',
            refNo: '',
            costCenter: ''
        });
        setVendorSearch('');
        setCcSearch('');
        setApSearch('');
        setExpSearch('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.vendorId) return toast.error('Vendor is required.');
        if (!formData.accId) return toast.error('A/P Account (Payable) is required.');
        if (expenses.length === 0) return toast.error('At least one expense line is required.');

        setLoading(true);
        try {
            await enterBillService.save({
                ...formData,
                billType,
                netAmount: parseFloat(calculateTotal()),
                expenses: expenses
            });
            toast.success('Bill saved successfully!');
            handleClear();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Enter Bill"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-1.5 font-['Inter']">
                    {/* Header Information Section */}
                    <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-2">
                        <div className="grid grid-cols-12 gap-x-8 gap-y-3">
                            <div className="col-span-4 flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-20 shrink-0">Doc No</label>
                                <input
                                    type="text"
                                    name="docNo"
                                    value={formData.docNo}
                                    readOnly
                                    className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[13px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm outline-none"
                                />
                            </div>

                            <div className="col-span-4 flex items-center justify-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={billType === 'Bill'} onChange={() => setBillType('Bill')} className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" />
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Bill</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={billType === 'Credit'} onChange={() => setBillType('Credit')} className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" />
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Credit</span>
                                </label>
                            </div>

                            <div className="col-span-4 flex items-center justify-end gap-3">
                                <label className="text-[13px] font-bold text-gray-700">Date</label>
                                <input type="date" name="postDate" value={formData.postDate} onChange={handleInputChange} className="h-7 w-[140px] px-2 text-[13px] border border-gray-300 rounded-sm outline-none text-gray-700" />
                            </div>

                            <div className="col-span-12 flex justify-center -mt-2">
                                <span className="text-[16px] font-black italic text-[#0078d4] tracking-tight py-0.5">{billType}</span>
                            </div>

                            {/* Left Column Fields */}
                            <div className="col-span-7 space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Vendor</label>
                                    <div className="flex-1 flex gap-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.vendors.find(v => v.code === formData.vendorId)?.name || ''}
                                            placeholder="Select Vendor..."
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-gray-50 font-bold text-[#b91c1c]"
                                        />
                                        <button onClick={() => setShowVendorModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''}
                                            placeholder="Select Cost Center..."
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-gray-50"
                                        />
                                        <button onClick={() => { setCcSource('header'); setShowCostCenterModal(true); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-1">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Terms</label>
                                    <input name="terms" value={formData.terms} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                    <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent" />
                                </div>
                            </div>

                            {/* Right Column Fields */}
                            <div className="col-span-5 space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">A/P Account</label>
                                    <div className="flex-1 flex gap-1">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.payAccounts.find(a => a.code === formData.accId)?.name ? `${formData.accId} - ${lookups.payAccounts.find(a => a.code === formData.accId)?.name}` : ''}
                                            placeholder="Select A/P Account..."
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-gray-50 font-medium"
                                        />
                                        <button onClick={() => setShowAPModal(true)} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill No</label>
                                    <input name="billNo" value={formData.billNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Reference No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Amount Due</label>
                                    <div className="flex-1 h-7 border-b border-gray-300 px-2 text-[14px] font-black text-[#b91c1c] text-right flex items-center justify-end">
                                        {calculateTotal()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill Due Date</label>
                                    <input type="date" name="billDueDate" value={formData.billDueDate} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-white text-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details Table Section */}
                    <div className="space-y-0">
                        <div className="flex gap-0.5 border-b border-gray-300 px-1">
                            <button className="px-12 py-2 text-[13px] font-bold rounded-t-sm border border-gray-300 border-b-0 bg-white text-[#0078d4] shadow-[0_-2px_0_#0078d4] -mb-[1px]">
                                Expenses
                            </button>
                        </div>

                        <div className="border border-gray-300 rounded-b-sm bg-white shadow-sm flex flex-col min-h-[220px]">
                            <div className="flex bg-[#f8fafd] border-b border-gray-300 text-[12px] font-bold text-gray-700 tracking-wide uppercase">
                                <div className="flex-[2] py-2 px-4 border-r border-gray-300">Expense Account</div>
                                <div className="flex-[1.5] py-2 px-4 border-r border-gray-300">Cost Center</div>
                                <div className="flex-1 py-2 px-4 border-r border-gray-300 text-right">Amount</div>
                                <div className="flex-[2] py-2 px-4 border-r border-gray-300">Memo</div>
                                <div className="w-12 py-2 px-2 text-center">Del</div>
                            </div>

                            <div className="flex-1 bg-white overflow-y-auto max-h-[140px]">
                                {expenses.map((exp, idx) => (
                                    <div key={idx} className="flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 hover:bg-blue-50/50">
                                        <div className="flex-[2] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.accCode}</div>
                                        <div className="flex-[1.5] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.costCenter}</div>
                                        <div className="flex-1 py-1.5 px-4 border-r border-gray-100 text-right font-bold text-blue-700 flex items-center justify-end">{exp.amount.toFixed(2)}</div>
                                        <div className="flex-[2] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.memo}</div>
                                        <div className="w-12 py-1 flex justify-center items-center">
                                            <button onClick={() => handleRemoveLine(idx)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-sm"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Entry Input Row */}
                            <div className="flex border-t-2 border-[#bae6fd] bg-[#f0f9ff] p-1 gap-1 items-center">
                                <div className="flex-[2] relative flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.expAccounts.find(a => a.code === currentLine.accCode)?.name ? `${currentLine.accCode} - ${lookups.expAccounts.find(a => a.code === currentLine.accCode)?.name}` : ''}
                                        placeholder="Expense Account..."
                                        className="flex-1 h-8 border border-blue-200 px-2 text-[12px] font-bold bg-white rounded-sm outline-none"
                                    />
                                    <button onClick={() => setShowExpModal(true)} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                        <Search size={14} />
                                    </button>
                                </div>
                                <div className="flex-[1.5] relative flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.costCenters.find(c => c.code === currentLine.costCenter)?.name || ''}
                                        placeholder="None"
                                        className="flex-1 h-8 border border-blue-200 px-2 text-[12px] font-bold bg-white rounded-sm outline-none"
                                    />
                                    <button onClick={() => { setCcSource('line'); setShowCostCenterModal(true); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors">
                                        <Search size={14} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <input name="amount" value={currentLine.amount} onChange={handleLineChange} onKeyDown={handleAddLine} type="number" placeholder="0.00" className="w-full h-8 border border-blue-200 px-2 text-[13px] text-right font-black text-[#0078d4] rounded-sm outline-none focus:border-blue-500 placeholder:text-blue-300 bg-white" />
                                </div>
                                <div className="flex-[2] flex gap-1">
                                    <input name="memo" value={currentLine.memo} onChange={handleLineChange} onKeyDown={handleAddLine} type="text" placeholder="Entry Memo..." className="flex-1 h-8 border border-blue-200 px-2 text-[12px] font-bold rounded-sm outline-none focus:border-blue-500 bg-white" />
                                    <button onClick={handleAddLine} className="px-4 h-8 bg-[#0078d4] text-white font-bold text-[11px] uppercase tracking-wider rounded-sm hover:bg-[#005a9e] whitespace-nowrap transition-all active:scale-95 shadow-sm shadow-blue-100">Add</button>
                                </div>
                                <div className="w-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            {showVendorModal && (
                <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVendorModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Vendors</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search by name or code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                                <button onClick={() => setShowVendorModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Vendor Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700">{v.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{v.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    setFormData(prev => ({ ...prev, vendorId: v.code }));
                                                    setShowVendorModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Cost Center Search Modal */}
            {showCostCenterModal && (
                <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCostCenterModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Cost Centers</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search by name or code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} />
                                <button onClick={() => setShowCostCenterModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Cost Center</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700">{c.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{c.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    if (ccSource === 'header') setFormData(prev => ({ ...prev, costCenter: c.code }));
                                                    else setCurrentLine(prev => ({ ...prev, costCenter: c.code }));
                                                    setShowCostCenterModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* A/P Account Search Modal */}
            {showAPModal && (
                <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAPModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Accounts Payable</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={apSearch} onChange={(e) => setApSearch(e.target.value)} />
                                <button onClick={() => setShowAPModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Account Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lookups.payAccounts.filter(a => (a.name || '').toLowerCase().includes(apSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(apSearch.toLowerCase())).map((a, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700">{a.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{a.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    setFormData(prev => ({ ...prev, accId: a.code }));
                                                    setShowAPModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Account Search Modal */}
            {showExpModal && (
                <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowExpModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Expense Accounts</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={expSearch} onChange={(e) => setExpSearch(e.target.value)} />
                                <button onClick={() => setShowExpModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Account Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lookups.expAccounts.filter(a => (a.name || '').toLowerCase().includes(expSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(expSearch.toLowerCase())).map((a, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700">{a.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{a.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    setCurrentLine(prev => ({ ...prev, accCode: a.code }));
                                                    setShowExpModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EnterBillBoard;
