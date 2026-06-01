import React, { useState, useEffect, useCallback } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, CheckCircle, Trash2, Printer, X, User, List, RotateCcw, Play, MapPin } from 'lucide-react';
import { documentSearchService } from '../services/documentSearch.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import CalendarModal from '../components/CalendarModal';

const DocumentSearchBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] });
    const [results, setResults] = useState([]);
    
    const getInitialFormData = () => ({
        allTransType: true,
        transType: '',
        transLabel: 'ALL TYPES',
        vendorType: 'customer',
        vendorId: '',
        vendorName: 'ALL ENTITIES',
        payee: 'ALL PAYEES',
        useDate: false,
        dateFrom: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        dateTo: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
        docNo: '',
        chequeNo: '',
        amount: '',
        costCenter: '',
        costCenterName: 'ALL CENTERS',
        docType: 'note'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    // Modals
    const [showTransTypeModal, setShowTransTypeModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showPayeeModal, setShowPayeeModal] = useState(false);
    const [showCostCenterModal, setShowCostCenterModal] = useState(false);
    
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCalFrom, setShowCalFrom] = useState(false);
    const [showCalTo, setShowCalTo] = useState(false);

    let parsedCompany = '';
    const selectedCompanyStr = localStorage.getItem('selectedCompany');
    if (selectedCompanyStr) {
        try {
            const companyObj = JSON.parse(selectedCompanyStr);
            parsedCompany = companyObj?.companyCode || companyObj?.CompanyCode || '';
        } catch (e) {
            console.error('Error parsing company', e);
        }
    }
    const companyCode = parsedCompany || localStorage.getItem('company') || '';

    useEffect(() => { 
        if (isOpen) { 
            setFormData(getInitialFormData()); 
            setResults([]);
            loadLookups(); 
        } 
    }, [isOpen]);

    const loadLookups = async () => {
        try {
            const res = await documentSearchService.getLookups(companyCode);
            const data = res.data || { transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] };
            setLookups(data);
        } catch { 
            showErrorToast('Failed to load lookups'); 
        }
    };

    const runSearch = useCallback(async (fdOrEvent = formData) => {
        // Protect against accidental onClick={runSearch} event object passing
        const fd = (fdOrEvent && fdOrEvent.nativeEvent) ? formData : (fdOrEvent || formData);
        
        if (!fd.transType && !fd.allTransType) return;
        setResults([]); // Clear previous results immediately for visual feedback
        setLoading(true);
        
        // Add artificial delay so the UI loading state is visible (local API is too fast)
        await new Promise(r => setTimeout(r, 400));
        
        try {
            const searchParams = { ...fd, companyCode };
            // Bypass strict ASP.NET validation if backend hasn't been recompiled yet
            if (searchParams.allTransType && !searchParams.transType) {
                searchParams.transType = 'ALL';
            }
            const res = await documentSearchService.search(searchParams);
            setResults(res.data || []);
        } catch (e) {
            console.error("Search error:", e);
            const errData = e?.response?.data;
            const errMsg = typeof errData === 'string' ? errData : (errData?.title || errData?.message || e.message || 'Search failed');
            showErrorToast(errMsg);
        } finally { 
            setLoading(false); 
        }
    }, [formData, companyCode]);

    const set = (key, val) => {
        const next = { ...formData, [key]: val };
        setFormData(next);
        
        // Auto-search on field change
        clearTimeout(window._dsTimer);
        window._dsTimer = setTimeout(() => runSearch(next), 500);
    };

    const setMultiple = (updates) => {
        const next = { ...formData, ...updates };
        setFormData(next);
        
        clearTimeout(window._dsTimer);
        window._dsTimer = setTimeout(() => runSearch(next), 500);
    };

    const handleClear = () => {
        setFormData(getInitialFormData());
        setResults([]);
    };

    const vendors = formData.vendorType === 'customer' ? (lookups.customers || []) : (lookups.suppliers || []);

    const labelStyle = "text-[10px] font-bold text-gray-500 uppercase w-[110px] shrink-0 tracking-wide";
    const inputStyle = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[11px] font-bold text-gray-700 bg-slate-50/50 rounded outline-none transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20";
    const pickerStyle = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[11px] font-bold bg-slate-50/50 rounded outline-none cursor-pointer transition-all flex items-center hover:bg-slate-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20";
    const iconBtnStyle = "w-9 h-8 bg-[#4a85f6] text-white flex items-center justify-center hover:bg-[#3b76e5] rounded transition-all shadow-sm active:scale-95 shrink-0";
    const iconBtnLightStyle = "w-9 h-8 bg-[#d8e2fb] text-white flex items-center justify-center hover:bg-[#c7d5f8] rounded transition-all shadow-sm active:scale-95 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed";

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
            <SimpleModal 
                isOpen={isOpen} 
                onClose={onClose} 
                title="ADVANCED DOCUMENT DISCOVERY - TRANSACTION ARCHIVE" 
                maxWidth="max-w-[1250px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 py-3 bg-[#4bb3ff] hover:bg-[#349be8] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                            <button onClick={() => window.print()} className="px-6 py-3 bg-white text-[#4285f4] font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] border border-[#d2e3fc] hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Printer size={14} /> PRINT
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => runSearch()} className="px-6 py-3 bg-[#39ba52] hover:bg-[#2da344] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <Play size={14} fill="currentColor" /> EXECUTE SEARCH
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma'] p-4">
                    <div className="bg-white p-4 pb-5 border border-slate-200 rounded-[5px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Row 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>TRANSACTION TYPE</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowTransTypeModal(true)} className={`${pickerStyle} cursor-pointer`}>
                                        <span className="truncate text-[#3f7ef7]">{formData.allTransType ? 'ALL TYPES' : formData.transLabel}</span>
                                    </div>
                                    <button onClick={() => setShowTransTypeModal(true)} className={iconBtnStyle}><List size={14} /></button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>VENDOR TYPE</label>
                                <div className="flex flex-1 items-center justify-center gap-6 border border-slate-200 rounded px-3 h-8 bg-slate-50/50">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="vtype" checked={formData.vendorType === 'customer'} onChange={() => { setFormData(p => ({...p, vendorType: 'customer', vendorId: '', vendorName: 'ALL ENTITIES'})); }} className="w-3.5 h-3.5 accent-[#4a85f6]" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">CUSTOMER</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="vtype" checked={formData.vendorType === 'supplier'} onChange={() => { setFormData(p => ({...p, vendorType: 'supplier', vendorId: '', vendorName: 'ALL ENTITIES'})); }} className="w-3.5 h-3.5 accent-[#4a85f6]" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">SUPPLIER</span>
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>VENDOR ENTITY</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowVendorModal(true)} className={`${pickerStyle} font-bold ${formData.vendorId ? 'text-blue-600' : 'text-[#f65d64]'}`}>
                                        <span className="truncate">{formData.vendorId ? `${formData.vendorId} - ${formData.vendorName}` : 'ALL ENTITIES'}</span>
                                    </div>
                                    <button onClick={() => setShowVendorModal(true)} className={iconBtnStyle}><Search size={14} /></button>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>DOCUMENT ID</label>
                                <input value={formData.docNo} onChange={e => set('docNo', e.target.value)} className={inputStyle} />
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>CHEQUE NO</label>
                                <input value={formData.chequeNo} onChange={e => set('chequeNo', e.target.value)} className={inputStyle} />
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>EXACT AMOUNT</label>
                                <input type="number" value={formData.amount} onChange={e => set('amount', e.target.value)} className={inputStyle} placeholder="0.00" />
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>COST CENTER</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowCostCenterModal(true)} className={`${pickerStyle} text-[#4a85f6]`}>
                                        <span className="truncate">{formData.costCenterName}</span>
                                    </div>
                                    <button onClick={() => setShowCostCenterModal(true)} className={iconBtnStyle}><MapPin size={14} /></button>
                                </div>
                            </div>

                            <div className="col-span-8 flex items-center gap-2">
                                <label className={labelStyle}>PAYEE ENTITY</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <div onClick={() => setShowPayeeModal(true)} className={`${pickerStyle} text-[#4a85f6]`}>
                                        <span className="truncate">{formData.payee}</span>
                                    </div>
                                    <button onClick={() => setShowPayeeModal(true)} className={iconBtnStyle}><User size={14} /></button>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>PERIOD SEARCH</label>
                                <div className="flex flex-1 items-center h-8 border border-slate-200 bg-slate-50/50 rounded px-3">
                                    <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                                        <input type="checkbox" checked={formData.useDate} onChange={e => set('useDate', e.target.checked)} className="w-3.5 h-3.5 accent-[#4a85f6]" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">ENABLE DATE FILTER</span>
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>DATE FROM</label>
                                <div className="flex-1 flex h-8 gap-1">
                                    <input value={formData.dateFrom} readOnly className={`${inputStyle} text-center font-mono text-gray-700 cursor-pointer`} onClick={() => formData.useDate && setShowCalFrom(true)} />
                                    <button onClick={() => formData.useDate && setShowCalFrom(true)} disabled={!formData.useDate} className={iconBtnLightStyle}>
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelStyle}>DATE TO</label>
                                <div className="flex-1 flex h-8 gap-1">
                                    <input value={formData.dateTo} readOnly className={`${inputStyle} text-center font-mono text-gray-700 cursor-pointer`} onClick={() => formData.useDate && setShowCalTo(true)} />
                                    <button onClick={() => formData.useDate && setShowCalTo(true)} disabled={!formData.useDate} className={iconBtnLightStyle}>
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2 py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]"></div>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">DISCOVERY RESULTS STREAM</span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{results.length} RECORDS MATCHED</span>
                    </div>

                    {/* Data Grid */}
                    <div className="border border-slate-200 rounded-[5px] bg-white flex flex-col min-h-[300px] overflow-hidden">
                        <div className="overflow-y-auto flex-1 no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-24">DATE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32">DOCUMENT ID</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 min-w-[150px]">ENTITY CONTEXT</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32">REF / INV NO</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32">ACCOUNTING</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-28">CHEQUE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-24">CHQ DATE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32">MEMO</th>
                                        <th className="px-4 py-2.5 text-right w-32">NET AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading && results.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-gray-300">Loading records...</td></tr>
                                    ) : results.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-gray-300">No records found.</td></tr>
                                    ) : (
                                        results.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.date}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.docNo}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.name}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.invNo}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.accName}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.chqNo}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-700">{row.chqDate}</td>
                                                <td className="px-4 py-2 border-r border-slate-200 text-[11px] font-bold text-slate-500 truncate max-w-[150px]">{row.memo}</td>
                                                <td className="px-4 py-2 text-right text-[12px] font-mono font-black text-slate-800">
                                                    {(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)}
                title={`${formData.vendorType === 'customer' ? 'Customer' : 'Supplier'} Directory Lookup`}
                maxWidth="max-w-[600px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder={`Find ${formData.vendorType === 'customer' ? 'customer' : 'supplier'} by name or code...`}
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-[12px] bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={vendorSearch}
                                onChange={(e) => setVendorSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ vendorId: '', vendorName: 'ALL ENTITIES' }); setShowVendorModal(false); }}>
                                        <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-500" colSpan={2}>-- ALL ENTITIES --</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                    {vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map(v => (
                                            <tr key={v.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ vendorId: v.code, vendorName: v.name }); setShowVendorModal(false); }}>
                                                <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{v.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors">{v.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Trans Type Modal */}
            <SimpleModal isOpen={showTransTypeModal} onClose={() => setShowTransTypeModal(false)} title="Select Category" maxWidth="max-w-[500px]">
                <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3">Category Name</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr key="all-types" className="group hover:bg-red-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ transType: '', transLabel: 'ALL TYPES', allTransType: true }); setShowTransTypeModal(false); }}>
                                    <td className="px-5 py-3 text-[12px] font-mono text-[#f65d64] font-bold uppercase group-hover:text-red-500">ALL TYPES</td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.transTypes || []).map((t, index) => (
                                    <tr key={t.iid || index} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ transType: t.iid, transLabel: t.tr_Type || t.tr_type || t.tr_Name || t.name || t.iid, allTransType: false }); setShowTransTypeModal(false); }}>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{t.tr_Type || t.tr_type || t.tr_Name || t.name || t.iid}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Payee Modal */}
            <SimpleModal isOpen={showPayeeModal} onClose={() => setShowPayeeModal(false)} title="Select Payee" maxWidth="max-w-[500px]">
                <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3">Payee Name</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { set('payee', 'ALL PAYEES'); setShowPayeeModal(false); }}>
                                    <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-500">-- ALL PAYEES --</td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.payees || []).map(p => (
                                    <tr key={p} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { set('payee', p); setShowPayeeModal(false); }}>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{p}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Modal */}
            <SimpleModal isOpen={showCostCenterModal} onClose={() => setShowCostCenterModal(false)} title="Select Cost Center" maxWidth="max-w-[500px]">
                <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Cost Center Name</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ costCenter: '', costCenterName: 'ALL CENTERS' }); setShowCostCenterModal(false); }}>
                                    <td className="px-5 py-3 text-[12px] font-mono font-bold text-gray-500" colSpan={2}>-- ALL CENTERS --</td>
                                    <td className="px-5 py-3 text-right">
                                        <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.costCenters || []).map(cc => (
                                    <tr key={cc.code} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setMultiple({ costCenter: cc.code, costCenterName: cc.name }); setShowCostCenterModal(false); }}>
                                        <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{cc.code}</td>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{cc.name}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showCalFrom} onClose={() => setShowCalFrom(false)} onDateSelect={d => { set('dateFrom', d); setShowCalFrom(false); }} initialDate={formData.dateFrom} />
            <CalendarModal isOpen={showCalTo} onClose={() => setShowCalTo(false)} onDateSelect={d => { set('dateTo', d); setShowCalTo(false); }} initialDate={formData.dateTo} />
        </>
    );
};

export default DocumentSearchBoard;
