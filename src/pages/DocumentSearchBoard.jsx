import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SimpleModal from '../components/SimpleModal';
import ReportTemplate from '../components/ReportTemplate';
import { Search, Calendar, X, User, List, RotateCcw, Play, MapPin , FileText} from 'lucide-react';
import { documentSearchService } from '../services/documentSearch.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import CalendarModal from '../components/CalendarModal';
import SystemLoader from '../components/SystemLoader';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

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
    const [selectedDocReport, setSelectedDocReport] = useState(null);
    const [selectedDocData, setSelectedDocData] = useState(null);
    const [selectedDocLoading, setSelectedDocLoading] = useState(false);

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

    // ── Shared style tokens are removed as we use direct classes ──

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
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText} 
                isOpen={isOpen} 
                onClose={onClose} 
                title="Document Search"
                footer={
                    <div className="w-full flex justify-end items-center px-6 py-4">
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-5 h-10 border border-gray-400 text-gray-800 font-semibold text-[14px] rounded-[3px] hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => runSearch()} className="px-5 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold text-[14px] rounded-[3px] transition-colors">
                                Execute Search
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-sans p-4">

                    {/* ── Filter Panel ── */}
                    <div className="bg-white p-6 border border-gray-200 shadow-sm font-sans mb-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-5">
                            {/* Row 1 */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Trans Type</label>
                                <div className="relative">
                                    <input readOnly value={formData.allTransType ? 'ALL TYPES' : formData.transLabel} onClick={() => setShowTransTypeModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <List className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Type</label>
                                <div className="flex items-center gap-6 h-10 px-4 border border-gray-300 rounded-[3px] bg-white">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={formData.vendorType === 'customer'} onChange={() => setFormData(p => ({ ...p, vendorType: 'customer', vendorId: '', vendorName: 'ALL ENTITIES' }))} className="w-4 h-4 text-[#0285fd] focus:ring-[#0285fd]" />
                                        <span className="text-[14px] text-gray-700">Customer</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={formData.vendorType === 'supplier'} onChange={() => setFormData(p => ({ ...p, vendorType: 'supplier', vendorId: '', vendorName: 'ALL ENTITIES' }))} className="w-4 h-4 text-[#0285fd] focus:ring-[#0285fd]" />
                                        <span className="text-[14px] text-gray-700">Supplier</span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor</label>
                                <div className="relative">
                                    <input readOnly value={formData.vendorId ? `${formData.vendorId} — ${formData.vendorName}` : 'ALL ENTITIES'} onClick={() => setShowVendorModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <Search className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc No</label>
                                <input value={formData.docNo} onChange={e => set('docNo', e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque No</label>
                                <input value={formData.chequeNo} onChange={e => set('chequeNo', e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount</label>
                                <input type="number" value={formData.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <input readOnly value={formData.costCenterName} onClick={() => setShowCostCenterModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <MapPin className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payee</label>
                                <div className="relative">
                                    <input readOnly value={formData.payee} onClick={() => setShowPayeeModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <User className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Period Filter</label>
                                <div className="flex items-center gap-2 h-10 px-3 border border-gray-300 rounded-[3px] bg-white">
                                    <input type="checkbox" id="period-toggle" checked={formData.useDate} onChange={e => set('useDate', e.target.checked)} className="w-4 h-4 accent-[#0285fd] rounded" />
                                    <label htmlFor="period-toggle" className="text-[14px] text-gray-700 cursor-pointer select-none">Enable Date Range</label>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date From</label>
                                <div className="relative">
                                    <input readOnly value={formData.dateFrom} onClick={() => formData.useDate && setShowCalFrom(true)} className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] ${formData.useDate ? 'bg-white cursor-pointer text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} pr-10`} />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date To</label>
                                <div className="relative">
                                    <input readOnly value={formData.dateTo} onClick={() => formData.useDate && setShowCalTo(true)} className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] ${formData.useDate ? 'bg-white cursor-pointer text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} pr-10`} />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results header */}
                    <div className="flex justify-between items-center px-2 py-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">SEARCH RESULTS</span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{results.length} RECORDS</span>
                    </div>

                    {/* Data Grid */}
                    <div className="border border-slate-200 rounded-[3px] bg-white flex flex-col min-h-[300px] overflow-hidden">
                        <div className="overflow-auto flex-1 no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-28 whitespace-nowrap">DATE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-36 whitespace-nowrap">DOCUMENT ID</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 min-w-[140px] whitespace-nowrap">ENTITY</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32 whitespace-nowrap">REF / INV NO</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-32 whitespace-nowrap">ACCOUNT</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-28 whitespace-nowrap">CHEQUE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-28 whitespace-nowrap">CHQ DATE</th>
                                        <th className="px-4 py-2.5 border-r border-slate-200 w-28 whitespace-nowrap">MEMO</th>
                                        <th className="px-4 py-2.5 text-right w-32 whitespace-nowrap">NET AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading && results.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-gray-300">Loading records...</td></tr>
                                    ) : results.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-gray-300">No records found.</td></tr>
                                    ) : (
                                        results.map((row, idx) => (
                                            <tr
                                                key={idx}
                                                onClick={async () => {
                                                    setSelectedDocReport(null);
                                                    setSelectedDocData(null);
                                                    setSelectedDocLoading(true);
                                                    try {
                                                        const res = await documentSearchService.getDocumentDetail(row.docNo, companyCode);
                                                        setSelectedDocData(res.data || []);
                                                    } catch {
                                                        setSelectedDocData(null);
                                                    } finally {
                                                        setSelectedDocLoading(false);
                                                        setSelectedDocReport(row);
                                                    }
                                                }}
                                                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap">{row.date}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap">{row.docNo}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 truncate max-w-[140px]">{row.name}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap">{row.invNo}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{row.accName}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap">{row.chqNo}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-700 whitespace-nowrap">{row.chqDate}</td>
                                                <td className="px-4 h-10 border-r border-slate-200 text-[11px] font-bold text-slate-500 truncate max-w-[120px]">{row.memo}</td>
                                                <td className="px-4 py-2 text-right text-[12px] font-mono font-black text-slate-800 whitespace-nowrap">
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
            </TransactionFormWrapper>

            {/* Vendor Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)}
                title={`${formData.vendorType === 'customer' ? 'Customer' : 'Supplier'} Directory Lookup`}
                maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder={`Find ${formData.vendorType === 'customer' ? 'customer' : 'supplier'} by name or code...`}
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={vendorSearch}
                                onChange={(e) => setVendorSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                    <tr>
                                        <th className="w-32 px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Name</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ vendorId: '', vendorName: 'ALL ENTITIES' }); setShowVendorModal(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3" colSpan={2}>-- ALL ENTITIES --</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                    {vendors.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase()))
                                        .map(v => (
                                            <tr key={v.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ vendorId: v.code, vendorName: v.name }); setShowVendorModal(false); }}>
                                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.code}</td>
                                                <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.name}</td>
                                                <td className="text-right px-5 py-3">
                                                    <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
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
            <SimpleModal isOpen={showTransTypeModal} onClose={() => setShowTransTypeModal(false)} title="Select Category" maxWidth="max-w-[700px]">
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className=" px-5 py-3">Category Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr key="all-types" className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ transType: '', transLabel: 'ALL TYPES', allTransType: true }); setShowTransTypeModal(false); }}>
                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">ALL TYPES</td>
                                    <td className="text-right px-5 py-3">
                                        <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.transTypes || []).map((t, index) => (
                                    <tr key={t.iid || index} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ transType: t.iid, transLabel: t.tr_Type || t.tr_type || t.tr_Name || t.name || t.iid, allTransType: false }); setShowTransTypeModal(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{t.tr_Type || t.tr_type || t.tr_Name || t.name || t.iid}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Payee Modal */}
            <SimpleModal isOpen={showPayeeModal} onClose={() => setShowPayeeModal(false)} title="Select Payee" maxWidth="max-w-[700px]">
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className=" px-5 py-3">Payee Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { set('payee', 'ALL PAYEES'); setShowPayeeModal(false); }}>
                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">-- ALL PAYEES --</td>
                                    <td className="text-right px-5 py-3">
                                        <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.payees || []).map(p => (
                                    <tr key={p} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { set('payee', p); setShowPayeeModal(false); }}>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Modal */}
            <SimpleModal isOpen={showCostCenterModal} onClose={() => setShowCostCenterModal(false)} title="Select Cost Center" maxWidth="max-w-[700px]">
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm font-['Tahoma']">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                <tr>
                                    <th className="w-32 px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Cost Center Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ costCenter: '', costCenterName: 'ALL CENTERS' }); setShowCostCenterModal(false); }}>
                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3" colSpan={2}>-- ALL CENTERS --</td>
                                    <td className="text-right px-5 py-3">
                                        <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                    </td>
                                </tr>
                                {(lookups.costCenters || []).map(cc => (
                                    <tr key={cc.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setMultiple({ costCenter: cc.code, costCenterName: cc.name }); setShowCostCenterModal(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{cc.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{cc.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
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

            {/* Document Report View */}
            {(selectedDocLoading || selectedDocReport) && createPortal(
                <div className="fixed inset-0 z-[2000]">
                    {selectedDocLoading ? (
                        <SystemLoader message="Loading document details..." />
                    ) : (
                        <ReportTemplate
                            title={`Document Report - ${selectedDocReport?.docNo}`}
                            subtitle={`${selectedDocReport?.name} | ${selectedDocReport?.date}`}
                            data={selectedDocData || []}
                            columns={[
                                { header: 'Date', key: 'date' },
                                { header: 'Document ID', key: 'docNo' },
                                { header: 'Entity', key: 'name' },
                                { header: 'Ref / Inv No', key: 'invNo' },
                                { header: 'Account', key: 'accName' },
                                { header: 'Cheque No', key: 'chqNo' },
                                { header: 'Cheque Date', key: 'chqDate' },
                                { header: 'Memo', key: 'memo' },
                                { header: 'Amount', key: 'amount', align: 'right', format: (v) => (v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                            ]}
                            companyName="ONIMTA INFORMATION TECHNOLOGY (PVT) LTD"
                            isStandalone={true}
                            onClose={() => { setSelectedDocReport(null); setSelectedDocData(null); setSelectedDocLoading(false); }}
                        />
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

export default DocumentSearchBoard;
