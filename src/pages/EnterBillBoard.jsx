import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
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
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);

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

    const openCalendar = (field) => {
        setCalendarField(field);
        setShowCalendar(true);
    };

    const handleDateSelect = (date) => {
        if (calendarField) {
            setFormData(prev => ({ ...prev, [calendarField]: date }));
        }
        setShowCalendar(false);
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Bill Management Facility"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#50af60] text-white text-sm font-bold rounded-md shadow-md hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Bill
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-md hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none font-bold">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma']">
                    {/* Header Information Section */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
                             <div className="flex items-center gap-3">
                                <label className="text-[12.5px] font-bold text-gray-700 w-20 shrink-0">Doc No</label>
                                <input
                                    type="text"
                                    name="docNo"
                                    value={formData.docNo}
                                    readOnly
                                    className="w-32 h-8 font-mono border border-gray-300 px-3 text-[13px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none text-center shadow-inner"
                                />
                            </div>

                            <div className="flex items-center bg-gray-100 p-1 rounded-lg shadow-inner">
                                <button 
                                    onClick={() => setBillType('Bill')}
                                    className={`px-8 py-1.5 text-[11px] font-black rounded-md transition-all uppercase tracking-widest ${billType === 'Bill' ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    BILL
                                </button>
                                <button 
                                    onClick={() => setBillType('Credit')}
                                    className={`px-8 py-1.5 text-[11px] font-black rounded-md transition-all uppercase tracking-widest ${billType === 'Credit' ? 'bg-white text-red-600 shadow-md transform scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    CREDIT
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-[12.5px] font-bold text-gray-700">Post Date</label>
                                <div className="flex h-8 gap-1">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.postDate} 
                                        className="w-[110px] px-2 text-[13px] border border-gray-300 rounded-[5px] outline-none text-gray-700 font-mono font-bold bg-gray-50 text-center shadow-sm" 
                                    />
                                    <button onClick={() => openCalendar('postDate')} className="w-9 h-8 bg-white border border-gray-300 text-blue-600 flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-10 gap-y-4">
                            {/* Left Column Fields */}
                            <div className="col-span-6 space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Vendor Name</label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.vendors.find(v => v.code === formData.vendorId)?.name || ''}
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] outline-none rounded-[5px] bg-gray-50 font-bold text-blue-700 truncate shadow-sm"
                                        />
                                        <button onClick={() => setShowVendorModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''}
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] outline-none rounded-[5px] bg-gray-50 truncate shadow-sm font-bold text-gray-600"
                                        />
                                        <button onClick={() => { setCcSource('header'); setShowCostCenterModal(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Bill Terms</label>
                                    <input name="terms" value={formData.terms} onChange={handleInputChange} type="text" className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] rounded-[5px] bg-white text-gray-700 outline-none focus:border-blue-400 shadow-sm transition-all" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">General Memo</label>
                                    <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] rounded-[5px] bg-white text-gray-700 outline-none focus:border-blue-400 shadow-sm transition-all" />
                                </div>
                            </div>

                            {/* Right Column Fields */}
                            <div className="col-span-6 space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">A/P Account (GL)</label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.payAccounts.find(a => a.code === formData.accId)?.name ? `${formData.accId} - ${lookups.payAccounts.find(a => a.code === formData.accId)?.name}` : ''}
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[12px] outline-none rounded-[5px] bg-gray-50 font-bold text-gray-600 truncate shadow-sm"
                                        />
                                        <button onClick={() => setShowAPModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Supplier Bill No</label>
                                    <input name="billNo" value={formData.billNo} onChange={handleInputChange} type="text" className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] rounded-[5px] bg-white text-blue-800 font-bold outline-none focus:border-blue-400 shadow-sm" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Reference No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] rounded-[5px] bg-white text-gray-700 outline-none focus:border-blue-400 shadow-sm" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Due Date</label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.billDueDate}
                                            className="flex-1 h-8 font-mono border border-gray-300 px-3 text-[13px] outline-none rounded-[5px] font-bold text-blue-800 bg-gray-50 shadow-sm text-center"
                                        />
                                        <button onClick={() => openCalendar('billDueDate')} className="w-9 h-8 bg-white border border-gray-300 text-blue-600 flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-1">
                                    <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Total Due Amount</label>
                                    <div className="flex-1 h-9 font-mono border border-red-100 bg-red-50/50 px-3 text-[16px] font-black text-red-600 text-right flex items-center justify-end rounded-[5px] shadow-inner">
                                        {calculateTotal()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details Table Section */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2">
                             <div className="h-4 w-1.5 bg-blue-600 rounded-full"></div>
                             <h4 className="text-[13px] font-black text-gray-600 uppercase tracking-widest">Expense Breakdown & Distributions</h4>
                        </div>

                        <div className="border border-gray-100 rounded-xl bg-white shadow-xl overflow-hidden flex flex-col min-h-[300px]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#f8fafc] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 leading-10">
                                    <tr>
                                        <th className="px-4 w-[30%]">Expense Account / Category</th>
                                        <th className="px-4 w-[20%]">Cost Center</th>
                                        <th className="px-4 w-[15%] text-right">Amount</th>
                                        <th className="px-4 w-[30%]">Line Memo</th>
                                        <th className="px-2 w-[5%] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((exp, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2.5 px-4 font-mono text-blue-700 uppercase">{lookups.expAccounts.find(a => a.code === exp.accCode)?.name || exp.accCode}</td>
                                            <td className="py-2.5 px-4 font-mono text-gray-400">{lookups.costCenters.find(c => c.code === exp.costCenter)?.name || exp.costCenter || '---'}</td>
                                            <td className="py-2.5 px-4 text-right font-mono font-black text-red-600 bg-red-50/10 tracking-tighter">{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="py-2.5 px-4 italic text-gray-400 font-medium">{exp.memo || '---'}</td>
                                            <td className="py-2.5 px-2 text-center">
                                                <button onClick={() => handleRemoveLine(idx)} className="text-red-300 hover:text-red-500 bg-red-50 p-1.5 rounded-md transition-all active:scale-95"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No expense items added.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Entry Input Row */}
                            <div className="mt-auto border-t-2 border-blue-50 bg-[#f8fafc] p-2 flex gap-3 items-center">
                                <div className="flex-[2] flex gap-1">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={lookups.expAccounts.find(a => a.code === currentLine.accCode)?.name ? `${currentLine.accCode} - ${lookups.expAccounts.find(a => a.code === currentLine.accCode)?.name}` : ''}
                                            className="w-full h-9 font-mono border border-gray-300 px-3 text-[12px] font-bold bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all"
                                        />
                                    </div>
                                    <button onClick={() => setShowExpModal(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="flex-[1.2] flex gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.costCenters.find(c => c.code === currentLine.costCenter)?.name || ''}
                                        className="flex-1 h-9 font-mono border border-gray-300 px-3 text-[12px] font-bold bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm"
                                    />
                                    <button onClick={() => { setCcSource('line'); setShowCostCenterModal(true); }} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <input name="amount" value={currentLine.amount} onChange={handleLineChange} onKeyDown={handleAddLine} type="number" className="w-full h-9 font-mono border border-gray-300 px-3 text-[14px] text-right font-black text-blue-700 rounded-[5px] shadow-inner outline-none focus:border-blue-400 bg-white" />
                                </div>
                                <div className="flex-[2] flex gap-2">
                                    <input name="memo" value={currentLine.memo} onChange={handleLineChange} onKeyDown={handleAddLine} type="text" className="flex-1 h-9 font-mono border border-gray-300 px-3 text-[12px] font-bold rounded-[5px] shadow-inner outline-none focus:border-blue-400 bg-white" />
                                    <button onClick={handleAddLine} className="px-6 h-9 bg-[#0078d4] text-white font-black text-[11px] uppercase tracking-widest rounded-sm hover:bg-[#005a9e] whitespace-nowrap transition-all active:scale-95 shadow-md flex items-center gap-2">
                                        Add Line
                                    </button>
                                </div>
                                <div className="w-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Vendor Records - ${lookups.vendors.length} Found`} maxWidth="max-w-xl">
                 <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={vendorSearch} 
                            onChange={(e) => setVendorSearch(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Vendor Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{v.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{v.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, vendorId: v.code }));
                                                setShowVendorModal(false);
                                            }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
             <SimpleModal isOpen={showCostCenterModal} onClose={() => setShowCostCenterModal(false)} title={`Cost Center Directory - ${lookups.costCenters.length} Found`} maxWidth="max-w-xl">
                 <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={ccSearch} 
                            onChange={(e) => setCcSearch(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Cost Center</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{c.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{c.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                if (ccSource === 'header') setFormData(prev => ({ ...prev, costCenter: c.code }));
                                                else setCurrentLine(prev => ({ ...prev, costCenter: c.code }));
                                                setShowCostCenterModal(false);
                                            }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* A/P Account Search Modal */}
            <SimpleModal isOpen={showAPModal} onClose={() => setShowAPModal(false)} title={`GL Accounts Directory - ${lookups.payAccounts.length} Found`} maxWidth="max-w-xl">
                 <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={apSearch} 
                            onChange={(e) => setApSearch(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Account Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.payAccounts.filter(a => (a.name || '').toLowerCase().includes(apSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(apSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{a.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{a.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                setFormData(prev => ({ ...prev, accId: a.code }));
                                                setShowAPModal(false);
                                            }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title={`Expense Accounts - ${lookups.expAccounts.length} Found`} maxWidth="max-w-xl">
                 <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={expSearch} 
                            onChange={(e) => setExpSearch(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Account Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lookups.expAccounts.filter(a => (a.name || '').toLowerCase().includes(expSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(expSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{a.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{a.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => {
                                                setCurrentLine(prev => ({ ...prev, accCode: a.code }));
                                                setShowExpModal(false);
                                            }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 uppercase tracking-wider">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={handleDateSelect}
                initialDate={formData[calendarField]}
            />
        </>
    );
};

export default EnterBillBoard;
