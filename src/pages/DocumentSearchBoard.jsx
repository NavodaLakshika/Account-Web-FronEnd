import React, { useState, useEffect, useCallback } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, RotateCcw, Printer, X, Loader2, ChevronRight, Play, User, Users, Filter, Hash, CreditCard, Banknote, DollarSign, List, MapPin } from 'lucide-react';
import { documentSearchService } from '../services/documentSearch.service';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { toast } from 'react-hot-toast';

const DocumentSearchBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] });
    const [results, setResults] = useState([]);
    const [formData, setFormData] = useState({
        transType: '', transLabel: 'ALL TYPES',
        vendorType: 'customer', vendorId: '', vendorName: 'ALL ENTITIES',
        docNo: '', chequeNo: '', amount: '', costCenter: '', costCenterName: 'ALL CENTERS', payee: 'ALL PAYEES',
        dateFrom: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        dateTo: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        useDate: false
    });

    // Modal States
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showTransTypeModal, setShowTransTypeModal] = useState(false);
    const [showCostCenterModal, setShowCostCenterModal] = useState(false);
    const [showPayeeModal, setShowPayeeModal] = useState(false);

    // Search States for Modals
    const [vendorSearch, setVendorSearch] = useState('');
    const [transTypeSearch, setTransTypeSearch] = useState('');
    const [costCenterSearch, setCostCenterSearch] = useState('');
    const [payeeSearch, setPayeeSearch] = useState('');

    const [showCalFrom, setShowCalFrom] = useState(false);
    const [showCalTo, setShowCalTo] = useState(false);
    const companyCode = localStorage.getItem('company') || '';

    const showSuccessToast = (msg) => toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{msg}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-emerald-50">
                <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 3000, position: 'top-right' });

    const showErrorToast = (msg) => toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{msg}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                        <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-red-50">
                <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 4000, position: 'top-right' });

    useEffect(() => { if (isOpen) loadLookups(); }, [isOpen]);

    const loadLookups = async () => {
        try {
            const data = await documentSearchService.getLookups(companyCode);
            setLookups(data);
            if (data.transTypes?.length > 0 && !formData.transType) {
                setFormData(prev => ({ 
                    ...prev, 
                    transType: data.transTypes[0].iid, 
                    transLabel: data.transTypes[0].tr_Type 
                }));
            }
        } catch { showErrorToast('Failed to load lookups'); }
    };

    const runSearch = useCallback(async (fd = formData) => {
        if (!fd.transType) return;
        setLoading(true);
        try {
            const data = await documentSearchService.search({ ...fd, companyCode });
            setResults(data);
            if (data.length > 0) showSuccessToast(`${data.length} Document(s) Retrieved`);
            else showSuccessToast(`No documents found`);
        } catch (e) {
            showErrorToast(e?.response?.data || 'Search failed');
        } finally { setLoading(false); }
    }, [formData, companyCode]);

    const set = (key, val) => {
        const next = { ...formData, [key]: val };
        setFormData(next);
        if (['docNo', 'chequeNo', 'amount', 'vendorId', 'transType', 'costCenter', 'payee'].includes(key)) {
            clearTimeout(window._dsTimer);
            window._dsTimer = setTimeout(() => runSearch(next), 400);
        }
    };

    const handleReset = () => {
        const fd = { 
            ...formData, 
            vendorId: '', vendorName: 'ALL ENTITIES', 
            docNo: '', chequeNo: '', amount: '', 
            costCenter: '', costCenterName: 'ALL CENTERS',
            payee: 'ALL PAYEES', useDate: false 
        };
        setFormData(fd);
        setResults([]);
    };

    const vendors = formData.vendorType === 'customer' ? (lookups.customers || []) : (lookups.suppliers || []);
    const transTypes = lookups.transTypes || [];
    const costCenters = lookups.costCenters || [];
    const payees = lookups.payees || [];

    // --- PURCHASE ORDER STYLE CONSTANTS ---
    const labelStyle = "text-[12.5px] font-bold text-gray-700 w-24 shrink-0";
    const inputStyle = "flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm focus:border-[#0285fd]";
    const pickerStyle = "flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer flex items-center justify-between overflow-hidden";
    const iconBtnStyle = "w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0";

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
            <div className="flex gap-3">
                <button 
                    onClick={handleReset}
                    className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none uppercase"
                >
                    <RotateCcw size={14} /> CLEAR
                </button>
                <button className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 uppercase">
                    <Printer size={14} /> PRINT 
                </button>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => runSearch()}
                    disabled={loading}
                    className="px-8 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none uppercase disabled:opacity-50"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    EXECUTE SEARCH
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Advanced Document Discovery — Transaction Archive" maxWidth="max-w-[1550px]" footer={footer}>
                <div className="space-y-4 pt-2 font-['Tahoma'] overflow-y-auto no-scrollbar">
                    
                    {/* ── FILTER PANEL (PO STYLE) ── */}
                    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Trans Type - Col 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>Category</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowTransTypeModal(true)} className={pickerStyle}>
                                        <span className="truncate">{formData.transLabel}</span>
                                    </div>
                                    <button onClick={() => setShowTransTypeModal(true)} className={iconBtnStyle}><List size={16} /></button>
                                </div>
                            </div>

                            {/* Vendor Context (Customer/Supplier radios + Picker) - Col 2 & 3 */}
                            <div className="col-span-8 flex items-center gap-4">
                                <label className={labelStyle}>Entity Context</label>
                                <div className="flex items-center gap-3 h-8 shrink-0 bg-slate-50 px-3 rounded-[5px] border border-gray-200">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="vt" checked={formData.vendorType === 'customer'} onChange={() => setFormData(p => ({ ...p, vendorType: 'customer', vendorId: '', vendorName: 'ALL CUSTOMERS' }))} className="w-3.5 h-3.5 accent-[#0285fd]" />
                                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase">Customer</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="vt" checked={formData.vendorType === 'supplier'} onChange={() => setFormData(p => ({ ...p, vendorType: 'supplier', vendorId: '', vendorName: 'ALL SUPPLIERS' }))} className="w-3.5 h-3.5 accent-[#e49e1b]" />
                                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase">Supplier</span>
                                    </label>
                                </div>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowVendorModal(true)} className={pickerStyle}>
                                        <span className="truncate text-red-600">{formData.vendorName}</span>
                                    </div>
                                    <button onClick={() => setShowVendorModal(true)} className={iconBtnStyle}><Search size={16} /></button>
                                </div>
                            </div>

                            {/* Document ID - Col 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>Document ID</label>
                                <input value={formData.docNo} onChange={e => set('docNo', e.target.value)} placeholder=" " className={inputStyle} />
                            </div>

                            {/* Cheque Number - Col 2 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>Cheque No</label>
                                <input value={formData.chequeNo} onChange={e => set('chequeNo', e.target.value)} placeholder="" className={inputStyle} />
                            </div>

                            {/* Exact Amount - Col 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>Exact Amount</label>
                                <input type="number" value={formData.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" className={inputStyle} />
                            </div>

                            {/* Cost Center - Col 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowCostCenterModal(true)} className={pickerStyle}>
                                        <span className="truncate">{formData.costCenterName}</span>
                                    </div>
                                    <button onClick={() => setShowCostCenterModal(true)} className={iconBtnStyle}><MapPin size={16} /></button>
                                </div>
                            </div>

                            {/* Date Filter Matrix - Col 2 & 3 */}
                            <div className="col-span-8 flex items-center gap-4">
                                <div className="flex items-center gap-2 cursor-pointer shrink-0 bg-slate-50 px-3 h-8 rounded-[5px] border border-gray-200" onClick={() => set('useDate', !formData.useDate)}>
                                    <input type="checkbox" checked={formData.useDate} readOnly className="w-4 h-4 accent-[#0285fd]" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase">Period Search</span>
                                </div>
                                <div className={`flex-1 flex items-center gap-2 transition-opacity ${!formData.useDate ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <label className="text-[12px] font-bold text-gray-500">From</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input readOnly value={formData.dateFrom} className={inputStyle} />
                                        <button onClick={() => setShowCalFrom(true)} className={iconBtnStyle}><Calendar size={16} /></button>
                                    </div>
                                    <label className="text-[12px] font-bold text-gray-500">To</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input readOnly value={formData.dateTo} className={inputStyle} />
                                        <button onClick={() => setShowCalTo(true)} className={iconBtnStyle}><Calendar size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Payee Discovery - Col 1 & 2 */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className={labelStyle}>Payee Entity</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowPayeeModal(true)} className={pickerStyle}>
                                        <span className="truncate">{formData.payee}</span>
                                    </div>
                                    <button onClick={() => setShowPayeeModal(true)} className={iconBtnStyle}><User size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RESULTS GRID ── */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Discovery Results Stream</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {results.length > 0 && (
                                    <div className="bg-[#f0f7ff] px-3 py-0.5 rounded-full border border-blue-100 flex items-center gap-2">
                                        <span className="text-[10px] font-black text-blue-400 uppercase">Valuation:</span>
                                        <span className="text-[12px] font-mono font-black text-[#0285fd]">
                                            LKR {results.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{results.length} Records Matched</span>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
                            <div className="max-h-[440px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 border-b border-gray-100 text-[10.5px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-4 py-3 border-r border-gray-100 w-24">Date</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-36">Document ID</th>
                                            <th className="px-4 py-3 border-r border-gray-100 min-w-[200px]">Entity Context</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-40">Ref / Inv No</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-44">Accounting</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-28">Cheque</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-24">Chq Date</th>
                                            <th className="px-4 py-3 border-r border-gray-100 min-w-[150px]">Memo</th>
                                            <th className="px-4 py-3 text-right w-36">Net Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {results.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/40 transition-colors group cursor-default">
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11.5px] font-mono font-bold text-slate-500">{row.date}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px] font-black text-[#0285fd] font-mono uppercase">{row.docNo}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[12px] font-bold text-slate-700 uppercase">{row.name}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11.5px] font-bold text-slate-500">{row.invNo}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11.5px] font-bold text-slate-600">{row.accName}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11.5px] font-mono font-bold text-slate-600">{row.chqNo}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11px] text-slate-400">{row.chqDate}</td>
                                                <td className="px-4 py-2.5 border-r border-gray-50 text-[11.5px] text-slate-500 italic truncate max-w-[150px]">{row.memo}</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-black text-[12.5px] text-slate-800 tabular-nums">
                                                    {(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        {Array.from({ length: Math.max(0, 12 - results.length) }).map((_, i) => (
                                            <tr key={`filler-${i}`} className="h-10"><td colSpan={9}></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* ── MODALS (PURCHASE ORDER STYLE) ── */}
            
            {/* Vendor Discovery Modal */}
            {showVendorModal && (
                <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)}
                    title={`${formData.vendorType === 'customer' ? 'Customer' : 'Supplier'} Directory Lookup`}
                    maxWidth="max-w-[600px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder=""
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Identity</th>
                                            <th className="px-5 py-3">Credential / Nomenclature</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase()))
                                            .map(v => (
                                                <tr key={v.code} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => { set('vendorId', v.code); set('vendorName', v.name); setShowVendorModal(false); }}>
                                                    <td className="px-5 py-3 font-mono text-[12.5px] font-bold text-gray-600">{v.code}</td>
                                                    <td className="px-5 py-3 text-[12.5px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{v.name}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase">Select</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Trans Type Modal */}
            {showTransTypeModal && (
                <SimpleModal isOpen={showTransTypeModal} onClose={() => setShowTransTypeModal(false)} title="Transaction Category Search" maxWidth="max-w-[500px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder=""
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                    value={transTypeSearch}
                                    onChange={(e) => setTransTypeSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Code</th>
                                            <th className="px-5 py-3">Type Nomenclature</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transTypes.filter(t => (t.tr_Type || '').toLowerCase().includes(transTypeSearch.toLowerCase()) || (t.iid || '').toLowerCase().includes(transTypeSearch.toLowerCase()))
                                            .map(t => (
                                                <tr key={t.iid} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { set('transType', t.iid); set('transLabel', t.tr_Type); setShowTransTypeModal(false); }}>
                                                    <td className="px-5 py-3 font-mono text-[12px] font-bold text-slate-500">{t.iid}</td>
                                                    <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600">{t.tr_Type}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase">Select</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Cost Center Modal */}
            {showCostCenterModal && (
                <SimpleModal isOpen={showCostCenterModal} onClose={() => setShowCostCenterModal(false)} title="Cost Center Discovery Lookup" maxWidth="max-w-[500px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder=""
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                    value={costCenterSearch}
                                    onChange={(e) => setCostCenterSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-50">
                                        {costCenters.filter(cc => (cc.name || '').toLowerCase().includes(costCenterSearch.toLowerCase()) || (cc.code || '').toLowerCase().includes(costCenterSearch.toLowerCase()))
                                            .map(cc => (
                                                <tr key={cc.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { set('costCenter', cc.code); set('costCenterName', cc.name); setShowCostCenterModal(false); }}>
                                                    <td className="px-5 py-3 font-mono text-[12px] font-bold text-slate-500">{cc.code}</td>
                                                    <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600">{cc.name}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase">Select</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Payee Modal */}
            {showPayeeModal && (
                <SimpleModal isOpen={showPayeeModal} onClose={() => setShowPayeeModal(false)} title="Payee Entity Discovery" maxWidth="max-w-[450px]">
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder=""
                                    className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                    value={payeeSearch}
                                    onChange={(e) => setPayeeSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-50">
                                        {payees.filter(p => (p || '').toLowerCase().includes(payeeSearch.toLowerCase()))
                                            .map((p, i) => (
                                                <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { set('payee', p); setShowPayeeModal(false); }}>
                                                    <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600">{p}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase">Select</button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}

            <CalendarModal isOpen={showCalFrom} onClose={() => setShowCalFrom(false)} onDateSelect={d => { set('dateFrom', d); setShowCalFrom(false); }} initialDate={formData.dateFrom} />
            <CalendarModal isOpen={showCalTo} onClose={() => setShowCalTo(false)} onDateSelect={d => { set('dateTo', d); setShowCalTo(false); }} initialDate={formData.dateTo} />
        </>
    );
};

export default DocumentSearchBoard;
