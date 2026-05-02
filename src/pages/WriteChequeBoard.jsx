import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    RotateCcw, 
    Save, 
    Trash2, 
    Loader2, 
    Landmark,
    ChevronRight,
    ChevronDown,
    X,
    Plus
} from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { writeChequeService } from '../services/writeCheque.service';
import { toast } from 'react-hot-toast';

const WriteChequeBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Expenses Portfolio');
    
    // UI States
    const [showBankModal, setShowBankModal] = useState(false);
    const [showCCModal, setShowCCModal] = useState(false);
    const [showEndorsementModal, setShowEndorsementModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [showPayeeModal, setShowPayeeModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarField, setCalendarField] = useState(null);
    const [ccSource, setCcSource] = useState('header'); // header or line
    const [ccIndex, setCcIndex] = useState(0);
    const [accIndex, setAccIndex] = useState(0);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);

    // Search States
    const [bankSearch, setBankSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');

    const [formData, setFormData] = useState({
        docId: '',
        date: new Date().toISOString().split('T')[0],
        bankAcc: '',
        costCenter: '',
        endorsement: 'A/C PAYEE ONLY',
        payeeId: '',
        payeeName: '',
        address: '',
        isElectronic: false,
        chqNo: '',
        isChqNoManual: false,
        totalAmount: 0
    });

    const [expenses, setExpenses] = useState([]);
    
    const [lookups, setLookups] = useState({
        banks: [],
        costCenters: [],
        endorsements: ['A/C PAYEE ONLY', 'NOT NEGOTIABLE', 'CASH PAYABLE', 'NONE'],
        accounts: [],
        payees: [],
        vendors: []
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
            const data = await writeChequeService.getLookups();
            setLookups(prev => ({ ...prev, ...data }));
        } catch (error) {
            toast.error('Failed to load banking lookups.');
        }
    };

    const generateDocNo = async () => {
        try {
            const data = await writeChequeService.generateDocNo();
            setFormData(prev => ({ ...prev, docId: data.docNo }));
        } catch (error) {
            toast.error('System failed to generate document sequence.');
        }
    };

    const handleCommit = async () => {
        if (!formData.bankAcc) return toast.error('Select settlement bank.');
        if (expenses.length === 0) return toast.error('Add at least one line item.');
        
        setLoading(true);
        try {
             const payload = {
                 DocNo: formData.docId,
                 Company: formData.company || 'C001',
                 PayDoc: formData.docId,
                 PayDate: formData.date,
                 PayType: formData.isElectronic ? 'Online' : 'Cheque',
                 BankId: formData.bankAcc,
                 Bank: lookups.banks.find(b => b.code === formData.bankAcc)?.name || '',
                 VendorId: formData.payeeId || '',
                 Payee: formData.payeeName,
                 Memo: formData.address,
                 RefNo: formData.chqNo,
                 ChqNo: formData.chqNo,
                 OnlinePay: formData.isElectronic,
                 NetAmount: calculateTotal(),
                 CostCenterFrom: formData.costCenter,
                 Expenses: expenses.map(e => ({
                     AccId: e.accCode,
                     ExpId: lookups.accounts.find(a => a.code === e.accCode)?.name || '',
                     Amount: parseFloat(e.amount) || 0,
                     Memo: e.memo || '',
                     CustJob: '', // Explicitly send empty string to avoid validation errors
                     CostCode: e.costCenter,
                     CostName: lookups.costCenters.find(cc => cc.code === e.costCenter)?.name || ''
                 })),
                 Items: [] // Not implemented in UI yet but required by DTO
             };

             await writeChequeService.save(payload);
             toast.success('Cheque portfolio committed successfully.');
             onClose();
        } catch (error) {
             toast.error(error.toString());
        } finally {
             setLoading(false);
        }
    };

    const handleClear = () => {
        setExpenses([]);
        setFormData(prev => ({
            ...prev,
            bankAcc: '',
            costCenter: '',
            payeeId: '',
            payeeName: '',
            address: '',
            chqNo: '',
            totalAmount: 0
        }));
        generateDocNo();
    };

    const calculateTotal = () => {
        return expenses.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
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
            title="Write Cheque Portfolio"
            maxWidth="max-w-[950px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleCommit} disabled={loading} className={`px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                        COMMIT CHEQUE
                    </button>
                    <button onClick={() => setShowVoidConfirm(true)} className="px-6 h-10 bg-[#ff3b30] text-white text-sm font-black rounded-[5px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none">
                        <Trash2 size={14} /> VOID DOC
                    </button>
                    <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                        <RotateCcw size={14} /> CLEAR FORM
                    </button>
                </div>
            }
        >
            <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma'] select-none px-1 pb-4">
                {/* 1. Header Detail Configuration Section */}
                <div className="grid grid-cols-12 gap-x-10 items-start">
                    <div className="col-span-12 lg:col-span-12 space-y-3">
                        <div className="bg-white p-3 border border-gray-100 border-b-0 rounded-t-lg shadow-sm">
                            <div className="grid grid-cols-2 gap-x-10">
                                <FormRow label="Document ID">
                                    <div className="flex-1 h-9 border border-gray-200 px-3 text-sm font-bold text-[#0285fd] outline-none bg-gray-50 flex items-center rounded-[5px]">
                                        {formData.docId}
                                    </div>
                                </FormRow>

                                <FormRow label="Dispatch Date">
                                    <div className="flex flex-1 h-9 gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.date} 
                                            className="flex-1 px-3 text-[12.5px] border border-gray-300 rounded-[5px] outline-none text-slate-700 font-mono font-bold bg-gray-50 text-center shadow-sm" 
                                        />
                                        <button onClick={() => openCalendar('date')} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] transition-all shadow-sm active:scale-90">
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </FormRow>
                            </div>
                        </div>

                        <div className="bg-white p-3 border border-gray-100 rounded-b-lg shadow-sm space-y-3">
                            <FormRow label="Settlement Bank">
                                <div className="flex flex-1 gap-2 items-center">
                                    <div className="flex-1 relative flex items-center">
                                        <Landmark size={14} className="absolute left-3 text-gray-400" />
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.banks.find(b => b.code === formData.bankAcc)?.name || ''} 
                                            className="w-full h-9 border border-gray-300 pl-9 pr-3 text-[12.5px] font-mono font-bold text-slate-800 bg-gray-50 outline-none rounded-[5px] shadow-sm truncate" 
                                        />
                                    </div>
                                    <button onClick={() => setShowBankModal(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </FormRow>

                            <div className="grid grid-cols-2 gap-x-10">
                                <FormRow label="Cost Center">
                                    <div className="flex flex-1 gap-2 items-center">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.costCenters.find(cc => cc.code === formData.costCenter)?.name || ''} 
                                            className="flex-1 h-9 border border-gray-300 px-3 text-[12px] font-mono font-bold text-gray-600 bg-gray-50 outline-none rounded-[5px] shadow-sm truncate" 
                                        />
                                        <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </FormRow>

                                <FormRow label="Endorsement">
                                    <div className="flex items-center gap-2 flex-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.endorsement} 
                                            className="flex-1 h-9 border border-gray-300 px-3 text-[12px] font-mono font-bold bg-white text-gray-700 outline-none rounded-[5px] shadow-sm" 
                                        />
                                        <button onClick={() => setShowEndorsementModal(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </FormRow>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-3 border border-gray-100 rounded-lg space-y-3 shadow-inner">
                             <FormRow label="Pay to order">
                                <div className="flex flex-1 gap-2">
                                    <input type="text" className="w-24 h-9 font-mono border border-gray-300 px-3 text-[12.5px] bg-gray-50 text-slate-600 font-bold rounded-[5px]" value={formData.payeeId} readOnly />
                                    <input type="text" className="flex-1 h-9 font-mono border border-slate-200 px-3 text-[12.5px] font-bold text-slate-800 bg-white focus:border-slate-400 outline-none rounded-[5px] shadow-sm" value={formData.payeeName} onChange={(e) => setFormData({...formData, payeeName: e.target.value})} />
                                     <button onClick={() => setShowPayeeModal(true)} title="Search Payees" className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-l-[5px] transition-all shadow-md active:scale-95 border-r border-white/20">
                                         <Search size={14} />
                                     </button>
                                     <button onClick={() => setShowVendorModal(true)} title="Search Vendors" className="w-10 h-9 bg-[#2bb744] text-white flex items-center justify-center hover:bg-[#259b3a] rounded-r-[5px] transition-all shadow-md active:scale-95">
                                         <Plus size={14} />
                                     </button>
                                </div>
                            </FormRow>
                            <FormRow label="Postal Address">
                                <textarea className="flex-1 h-16 font-mono border border-gray-300 p-3 text-[11px] text-gray-600 resize-none focus:border-blue-400 outline-none rounded-[5px] shadow-sm bg-white" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                            </FormRow>
                        </div>
                    </div>
                </div>

                {/* 2. Cheque Specifics & Financial Summary */}
                <div className="grid grid-cols-12 gap-x-10 items-start">
                    <div className="col-span-7 bg-white border border-gray-100 p-3 rounded-lg shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                             <div className="flex items-center gap-2">
                                <div className="h-3 w-1 bg-blue-500 rounded-full"></div>
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Bank Submission</span>
                             </div>
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 shadow-sm transition-all" checked={formData.isElectronic} onChange={(e) => setFormData({...formData, isElectronic: e.target.checked})} />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight group-hover:text-blue-600">Electronic</span>
                            </label>
                        </div>
                        
                        <div className="space-y-1">
                            <FormRow label="Cheque No">
                                <div className="flex items-center gap-2 flex-1">
                                    <input type="checkbox" className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 shrink-0" checked={formData.isChqNoManual} onChange={(e) => setFormData({...formData, isChqNoManual: e.target.checked})} />
                                    <input type="text" className="flex-1 h-9 border border-gray-300 px-3 text-[12px] font-mono font-black text-gray-800 tracking-[0.1em] focus:border-blue-400 outline-none rounded-[5px] shadow-sm bg-white" value={formData.chqNo} onChange={(e) => setFormData({...formData, chqNo: e.target.value})} />
                                </div>
                            </FormRow>
                            <div className="pl-[120px] text-[9.5px] font-bold text-slate-400 uppercase tracking-tight leading-none">
                                Manual entry overrides system auto-gen
                            </div>
                        </div>
                    </div>

                    <div className="col-span-5 bg-blue-50/30 p-3 rounded-lg border border-dashed border-blue-200">
                         <div className="text-right">
                            <label className="text-[10px] font-black text-blue-400 uppercase block mb-1 tracking-tighter">Total Payable Disbursement</label>
                            <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums flex items-baseline justify-end gap-1">
                                {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Expenses Portfolio Ledger Table */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[180px]">
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-gray-100">
                        <div className="flex gap-1">
                            {['Expenses Portfolio', 'Regional Cost'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-md ${selectedTab === tab ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Live Accounting Grid</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3 w-[35%]">Ledger Selection</th>
                                    <th className="px-4 py-3 w-[25%]">Allocation CC</th>
                                    <th className="px-4 py-3 w-40 text-right">Net Value</th>
                                    <th className="px-4 py-3">Description / Internal Transcript</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {expenses.map((line, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-2 text-center font-mono text-[11px] text-gray-300 font-bold group-hover:text-slate-400 transition-colors">{idx + 1}</td>
                                        <td className="px-2 py-1">
                                            <div className="flex gap-1 items-center">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={lookups.accounts.find(a => a.code === line.accCode)?.name || ''} 
                                                    className="flex-1 h-8 font-mono border border-gray-200 px-3 text-[11px] font-bold bg-white text-slate-700 rounded-[5px] outline-none shadow-sm truncate group-hover:border-slate-200 transition-all" 
                                                />
                                                <button onClick={() => { setAccIndex(idx); setShowAccModal(true); }} className="w-8 h-8 bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:text-blue-600 rounded-[5px] transition-all shadow-sm active:scale-90">
                                                    <Search size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex gap-1 items-center">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={lookups.costCenters.find(cc => cc.code === line.costCenter)?.name || ''} 
                                                    className="flex-1 h-8 font-mono border border-gray-200 px-3 text-[11px] font-bold bg-white text-gray-600 rounded-[5px] outline-none shadow-sm truncate group-hover:border-blue-200 transition-all" 
                                                />
                                                <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-8 h-8 bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:text-blue-600 rounded-[5px] transition-all shadow-sm active:scale-90">
                                                    <Search size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="relative">
                                                <input type="text" className="w-full h-8 font-mono border border-gray-200 px-3 text-right text-[12px] font-black text-gray-800 bg-white rounded-[5px] outline-none shadow-sm group-hover:border-blue-200 transition-all" value={line.amount} onChange={(e) => {
                                                    const newExp = [...expenses];
                                                    newExp[idx].amount = e.target.value;
                                                    setExpenses(newExp);
                                                }} />
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <input type="text" className="w-full h-8 font-mono border border-transparent px-3 text-[11px] text-gray-500 bg-transparent rounded-[5px] outline-none group-hover:bg-white group-hover:border-gray-200 transition-all" value={line.memo} onChange={(e) => {
                                                const newExp = [...expenses];
                                                newExp[idx].memo = e.target.value;
                                                setExpenses(newExp);
                                            }} />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/30">
                                    <td colSpan="5" className="p-0">
                                        <button onClick={() => setExpenses([...expenses, { id: expenses.length + 1, accCode: '', costCenter: '', amount: '0.00', memo: '' }])} className="w-full py-2.5 text-blue-600 font-black text-[10px] tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2 group">
                                            <span className="opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={14} /></span>
                                            ATTACH NEW PORTFOLIO LINE
                                            <span className="opacity-0 group-hover:opacity-100 transition-all"><ChevronDown size={14} className="-rotate-90" /></span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Global Validation Summary Footer */}
                <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Accounting Delta</span>
                                 <div className="text-[18px] font-mono leading-none font-black text-slate-800 tracking-tighter">
                                    {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                 </div>
                             </div>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-100" />
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Entry Validated</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-[1px] bg-gray-100" />
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-90">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {/* --- Lookups --- */}

        <SimpleModal
            isOpen={showBankModal}
            onClose={() => setShowBankModal(false)}
            title="Search Payment Origin Ledgers"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Find ledger account by name..." 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={bankSearch} 
                        onChange={(e) => setBankSearch(e.target.value)} 
                    />
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Ledger Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map((b, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, bankAcc: b.code});
                                    setShowBankModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{b.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{b.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0078d4] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e] shadow-sm transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showCCModal}
            onClose={() => setShowCCModal(false)}
            title="Search Portfolio Cost Centers"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Find cost center..." 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={ccSearch} 
                        onChange={(e) => setCcSearch(e.target.value)} 
                    />
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Center Description</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.costCenters.filter(c => c.name.toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    if (ccSource === 'header') {
                                        setFormData({...formData, costCenter: c.code});
                                    } else {
                                        const newExp = [...expenses];
                                        newExp[ccIndex].costCenter = c.code;
                                        setExpenses(newExp);
                                    }
                                    setShowCCModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{c.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{c.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showEndorsementModal}
            onClose={() => setShowEndorsementModal(false)}
            title="Select Crossing Type"
            maxWidth="max-w-md"
        >
            <div className="p-1 space-y-1 font-['Tahoma']">
                {lookups.endorsements.map((type, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => {
                            setFormData(prev => ({ ...prev, endorsement: type }));
                            setShowEndorsementModal(false);
                        }}
                        className="w-full text-left px-5 py-3.5 text-[13px] font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center justify-between group uppercase tracking-tight"
                    >
                        {type}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-blue-400" />
                    </button>
                ))}
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showAccModal}
            onClose={() => setShowAccModal(false)}
            title="Search Ledger Accounts"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Filter accounts by name or code..." 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        value={accSearch} 
                        onChange={(e) => setAccSearch(e.target.value)} 
                    />
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Account Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lookups.accounts.filter(a => a.name.toLowerCase().includes(accSearch.toLowerCase()) || a.code.includes(accSearch)).map((a, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    const newExp = [...expenses];
                                    newExp[accIndex].accCode = a.code;
                                    setExpenses(newExp);
                                    setShowAccModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{a.code}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{a.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showPayeeModal}
            onClose={() => setShowPayeeModal(false)}
            title="Search Historical Payees"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <input 
                        type="text" 
                        placeholder="Filter payees..." 
                        className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                        onChange={(e) => setFormData({...formData, payeeName: e.target.value})} 
                    />
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Payee Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(lookups.payees || []).filter(p => p.toLowerCase().includes((formData.payeeName || '').toLowerCase())).map((p, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, payeeName: p});
                                    setShowPayeeModal(false);
                                }}>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{p}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>

        <SimpleModal
            isOpen={showVendorModal}
            onClose={() => setShowVendorModal(false)}
            title="Select Supplier / Vendor"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4 font-['Tahoma']">
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Supplier Name</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(lookups.vendors || []).map((v, idx) => (
                                <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer" onClick={() => {
                                    setFormData({...formData, payeeId: v.id, payeeName: v.name, address: v.address});
                                    setShowVendorModal(false);
                                }}>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400">{v.id}</td>
                                    <td className="px-4 py-3 font-bold text-[13px] text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{v.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="bg-[#2bb744] text-white text-[10px] px-4 py-1.5 rounded-[5px] font-black hover:bg-[#259b3a] shadow-md transition-all active:scale-95">SELECT</button>
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
            initialDate={formData.date}
        />

        <ConfirmModal 
            isOpen={showVoidConfirm}
            onClose={() => setShowVoidConfirm(false)}
            onConfirm={() => {
                handleClear();
                setShowVoidConfirm(false);
                onClose();
                toast.success('Document sequence cancelled and cleared.');
            }}
            title="Void Transaction Portfolio?"
            message="This will reset all current entries and discard the pending cheque sequence. This action cannot be reversed within this session."
            variant="danger"
            confirmText="Yes, Void Doc"
        />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center min-h-[32px]">
        <label className="text-[12.5px] font-bold text-gray-700 w-[120px] shrink-0">{label}</label>
        {children}
    </div>
);

export default WriteChequeBoard;
