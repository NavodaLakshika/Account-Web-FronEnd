import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Landmark, RotateCcw, Save, Trash2, Send , X, Loader2} from 'lucide-react';

const WriteChequeBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses Portfolio');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        docId: 'WCH001000004',
        bankAcc: '',
        costCenter: '',
        payeeId: 'VEN-14',
        payeeName: '',
        endorsement: '',
        address: '',
        date: new Date().toISOString().split('T')[0],
        isElectronic: false,
        isChqNoManual: false,
        chqNo: '',
        totalAmount: 0
    });

    const [expenses, setExpenses] = useState([
        { id: 1, accCode: '', costCenter: '', amount: '0.00', memo: '' }
    ]);

    // Modal States
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const [showCCModal, setShowCCModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [ccSource, setCcSource] = useState('header'); // 'header' or 'line'
    const [ccIndex, setCcIndex] = useState(null);
    const [showEndorsementModal, setShowEndorsementModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [accSearch, setAccSearch] = useState('');
    const [accIndex, setAccIndex] = useState(null);

    // Dummy Lookups (To be replaced by service)
    const [lookups] = useState({
        banks: [
            { code: 'B001', name: 'HNB Bank Main' },
            { code: 'B002', name: 'Commercial Bank' },
            { code: 'B003', name: 'Sampath Bank' }
        ],
        costCenters: [
            { code: 'CC01', name: 'Head Office' },
            { code: 'CC02', name: 'Branch 01' },
            { code: 'CC03', name: 'Production Dept' }
        ],
        accounts: [
            { code: '4001', name: 'Electricity Expense' },
            { code: '4002', name: 'Rent Expense' },
            { code: '4003', name: 'Telephone Bills' }
        ],
        endorsements: ['Account Payee Only', 'Bearer Only', 'Not Negotiable']
    });

    const handleClear = () => {
        setFormData({
            ...formData,
            bankAcc: '',
            costCenter: '',
            payeeName: '',
            endorsement: '',
            address: '',
            chqNo: ''
        });
        setExpenses([{ id: 1, accCode: '', costCenter: '', amount: '0.00', memo: '' }]);
    };

    const handleCommit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Write Cheque"
            maxWidth="max-w-[1000px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button className="px-6 h-10 bg-[#d13438] text-white text-sm font-bold rounded-md shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center gap-2">
                        <Trash2 size={14} /> Void
                    </button>
                    <button onClick={handleCommit} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} 
                        Commit Cheque
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-4 font-['Inter']">
                {/* Header Section */}
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7 space-y-3">
                        <FormRow label="Document ID">
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 border border-blue-100 rounded-sm">{formData.docId}</span>
                        </FormRow>

                        <FormRow label="Settlement Bank">
                            <div className="flex flex-1 gap-1 items-center">
                                <div className="flex-1 relative flex items-center">
                                    <Landmark size={14} className="absolute left-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={lookups.banks.find(b => b.code === formData.bankAcc)?.name || ''} 
                                        placeholder="Select Bank Account..." 
                                        className="w-full h-8 border border-gray-300 pl-9 pr-2 text-sm bg-gray-50 outline-none rounded-sm" 
                                    />
                                </div>
                                <button onClick={() => setShowBankModal(true)} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                            </div>
                        </FormRow>

                        <FormRow label="Cost Center">
                            <div className="flex flex-1 gap-1 items-center">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={lookups.costCenters.find(cc => cc.code === formData.costCenter)?.name || ''} 
                                    placeholder="Select Cost Center..." 
                                    className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 outline-none rounded-sm" 
                                />
                                <button onClick={() => { setCcSource('header'); setShowCCModal(true); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={14} />
                                </button>
                            </div>
                        </FormRow>

                        <div className="bg-gray-50 p-4 border border-gray-200 space-y-3 rounded-sm shadow-sm">
                            <FormRow label="Pay to order">
                                <div className="flex flex-1 gap-1">
                                    <input type="text" className="w-24 h-8 border border-gray-300 px-2 text-sm bg-gray-100" value={formData.payeeId} readOnly />
                                    <input type="text" className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" placeholder="Payee name..." value={formData.payeeName} onChange={(e) => setFormData({...formData, payeeName: e.target.value})} />
                                    <button className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 shadow-sm transition-colors">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>
                            <FormRow label="Endorsement">
                                <div className="flex items-center gap-1 flex-1">
                                    <label className="flex items-center gap-2 cursor-pointer w-[140px] shrink-0">
                                        <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase">Registered Payee</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.endorsement} 
                                        placeholder="Select Endorsement..." 
                                        className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 outline-none rounded-sm" 
                                    />
                                    <button onClick={() => setShowEndorsementModal(true)} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>
                        </div>

                        <FormRow label="Postal Address">
                            <textarea className="flex-1 h-20 border border-gray-300 p-2 text-sm resize-none focus:border-blue-500 outline-none rounded-sm" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Delivery address..."></textarea>
                        </FormRow>
                    </div>

                    <div className="col-span-12 lg:col-span-5 bg-gray-50 p-6 border border-gray-200 space-y-4 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                            <Landmark size={80} />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase">Cheque Date</label>
                            <div className="w-44 h-8 border border-gray-300 bg-white flex items-center px-2 rounded-sm shadow-sm hover:border-blue-400 transition-colors">
                                <span className="flex-1 text-sm font-semibold text-slate-700">{formData.date.replace(/-/g, '/')}</span>
                                <Calendar size={14} className="text-blue-500" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 shadow-sm" checked={formData.isElectronic} onChange={(e) => setFormData({...formData, isElectronic: e.target.checked})} />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Electronic Submission</span>
                            </label>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">Cheque No</label>
                                    <input type="checkbox" className="w-4 h-4 rounded-sm border-slate-300 text-blue-600" checked={formData.isChqNoManual} onChange={(e) => setFormData({...formData, isChqNoManual: e.target.checked})} />
                                </div>
                                <input type="text" className="w-44 h-8 border border-gray-300 px-3 text-sm font-mono font-bold tracking-[0.2em] focus:border-blue-500 outline-none rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" placeholder="XXXX-XXXX" value={formData.chqNo} onChange={(e) => setFormData({...formData, chqNo: e.target.value})} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <div className="text-right">
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">TOTAL PAYABLE AMOUNT</label>
                                <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm flex items-baseline justify-end gap-1">
                                    <span className="text-xl font-bold text-slate-400 mr-1">LKR</span>
                                    {formData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounting Table */}
                <div className="border border-gray-300 rounded-sm overflow-hidden shadow-sm">
                    <div className="flex bg-[#f8fafd] border-b border-gray-300">
                        {['Expenses Portfolio', 'Regional Cost Centers'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-6 py-2.5 text-xs font-bold border-r border-gray-200 transition-all ${selectedTab === tab ? 'bg-white text-blue-700 border-b-2 border-b-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto min-h-[160px]">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-gray-300 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="w-12 py-3 px-3 border-r border-gray-200">#</th>
                                    <th className="py-3 px-4 text-left border-r border-gray-200 w-[30%]">Ledger Account</th>
                                    <th className="py-3 px-4 text-left border-r border-gray-200 w-[20%]">Cost Center</th>
                                    <th className="w-40 py-3 px-4 text-right border-r border-gray-200">Net Valuation</th>
                                    <th className="py-3 px-4 text-left">Description / Transcript</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((line, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors">
                                        <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                                        <td className="p-1">
                                            <div className="flex gap-1 items-center">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={lookups.accounts.find(a => a.code === line.accCode)?.name || ''} 
                                                    placeholder="Select Account..." 
                                                    className="flex-1 h-8 border border-gray-300 px-2 text-xs bg-white outline-none rounded-sm font-semibold" 
                                                />
                                                <button onClick={() => { setAccIndex(idx); setShowAccModal(true); }} className="w-7 h-8 bg-blue-50 text-[#0078d4] flex items-center justify-center hover:bg-blue-100 rounded-sm transition-colors border border-blue-100">
                                                    <Search size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-1">
                                            <div className="flex gap-1 items-center">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={lookups.costCenters.find(cc => cc.code === line.costCenter)?.name || ''} 
                                                    placeholder="Select..." 
                                                    className="flex-1 h-8 border border-gray-300 px-2 text-xs bg-white outline-none rounded-sm" 
                                                />
                                                <button onClick={() => { setCcSource('line'); setCcIndex(idx); setShowCCModal(true); }} className="w-7 h-8 bg-blue-50 text-[#0078d4] flex items-center justify-center hover:bg-blue-100 rounded-sm transition-colors border border-blue-100">
                                                    <Search size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-1">
                                            <input type="text" className="w-full h-8 border border-gray-300 px-2 text-right text-sm font-bold text-slate-700 tabular-nums focus:border-blue-500 outline-none rounded-sm" value={line.amount} onChange={(e) => {
                                                const newExp = [...expenses];
                                                newExp[idx].amount = e.target.value;
                                                setExpenses(newExp);
                                            }} />
                                        </td>
                                        <td className="p-1">
                                            <input type="text" className="w-full h-8 border border-gray-300 px-2 text-xs text-slate-600 focus:border-blue-500 outline-none rounded-sm" placeholder="Transaction details..." value={line.memo} onChange={(e) => {
                                                const newExp = [...expenses];
                                                newExp[idx].memo = e.target.value;
                                                setExpenses(newExp);
                                            }} />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="h-10">
                                    <td colSpan="5">
                                        <button onClick={() => setExpenses([...expenses, { id: expenses.length + 1, accCode: '', costCenter: '', amount: '0.00', memo: '' }])} className="w-full h-full text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                            + ADD NEW EXPENSE LINE
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Delta / Comparison */}
                <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100 rounded-sm shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Account Delta</span>
                            <div className={`text-xl font-bold font-mono tracking-tighter ${expenses.length > 0 ? 'text-[#0078d4]' : 'text-slate-400'}`}>0.00</div>
                        </div>
                        <div className="h-6 w-[1px] bg-blue-200/50 mx-2" />
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Entry Verification</span>
                           <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold border border-green-200">VALIDATED</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-slate-400 italic px-4 border-r border-slate-200">All figures in LKR</span>
                        <button className="p-2 text-slate-400 hover:text-[#0078d4] hover:bg-white rounded-full transition-all active:scale-95 shadow-sm border border-transparent hover:border-blue-100 bg-transparent">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {/* --- MODALS --- */}

        {/* Bank Account Search Modal */}
        {showBankModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={() => setShowBankModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Bank Accounts</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                            <button onClick={() => setShowBankModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Account Name</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map((b, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        setFormData({...formData, bankAcc: b.code});
                                        setShowBankModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{b.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{b.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
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
        {showCCModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={() => setShowCCModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Cost Centers</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search cost centers..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={ccSearch} onChange={(e) => setCcSearch(e.target.value)} />
                            <button onClick={() => setShowCCModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Cost Center</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.costCenters.filter(c => c.name.toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        if (ccSource === 'header') {
                                            setFormData({...formData, costCenter: c.code});
                                        } else {
                                            const newExp = [...expenses];
                                            newExp[ccIndex].costCenter = c.code;
                                            setExpenses(newExp);
                                        }
                                        setShowCCModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{c.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{c.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Endorsement Search Modal */}
        {showEndorsementModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={() => setShowEndorsementModal(false)} />
                <div className="relative w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col shadow-blue-500/20">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Select Endorsement</h3>
                        <button onClick={() => setShowEndorsementModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                    </div>
                    <div className="p-2 space-y-1">
                        {lookups.endorsements.map((type, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, endorsement: type }));
                                    setShowEndorsementModal(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors flex items-center justify-between group"
                            >
                                {type}
                                <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 -rotate-90 transition-all text-blue-400" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Account Search Modal (Lines) */}
        {showAccModal && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={() => setShowAccModal(false)} />
                <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Ledger Accounts</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={accSearch} onChange={(e) => setAccSearch(e.target.value)} />
                            <button onClick={() => setShowAccModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full"><X size={24} /></button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-3 border-b">Code</th>
                                    <th className="p-3 border-b">Account Name</th>
                                    <th className="p-3 border-b text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lookups.accounts.filter(a => a.name.toLowerCase().includes(accSearch.toLowerCase()) || a.code.includes(accSearch)).map((a, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => {
                                        const newExp = [...expenses];
                                        newExp[accIndex].accCode = a.code;
                                        setExpenses(newExp);
                                        setShowAccModal(false);
                                    }}>
                                        <td className="p-3 border-b font-medium text-gray-700">{a.code}</td>
                                        <td className="p-3 border-b font-medium uppercase text-blue-600">{a.name}</td>
                                        <td className="p-3 border-b text-center">
                                            <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
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

const FormRow = ({ label, children }) => (
    <div className="flex items-center min-h-[32px]">
        <label className="text-[11px] font-black text-slate-600 uppercase w-[120px] shrink-0 tracking-widest">{label}</label>
        {children}
    </div>
);

export default WriteChequeBoard;
