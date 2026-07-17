import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReportTemplate from '../components/ReportTemplate';
import { Search, Calendar, RotateCcw, Play, FileText} from 'lucide-react';
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
        transType: '',
        vendorType: 'all',
        vendorId: '',
        vendorName: 'ALL ENTITIES',
        payee: '',
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
        
        setResults([]);
        setLoading(true);
        
        await new Promise(r => setTimeout(r, 400));
        
        try {
            const searchParams = { ...fd, companyCode };
            if (!searchParams.transType) {
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

    const dropdownStyle = {
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1em'
    };

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
                                <select value={formData.transType} onChange={e => set('transType', e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer" style={dropdownStyle}>
                                    <option value="">ALL TYPES</option>
                                    {lookups.transTypes.map((t, i) => (
                                        <option key={i} value={t.iid || t.code || i}>{t.tr_Type || t.tr_type || t.tr_Name || t.name || t.iid}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Type</label>
                                <select value={formData.vendorType} onChange={e => set('vendorType', e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer" style={dropdownStyle}>
                                    <option value="all">ALL</option>
                                    <option value="customer">CUSTOMER</option>
                                    <option value="supplier">SUPPLIER</option>
                                </select>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor</label>
                                <select value={formData.vendorId} onChange={e => {
                                    const val = e.target.value;
                                    const list = formData.vendorType === 'customer' ? lookups.customers : (formData.vendorType === 'supplier' ? lookups.suppliers : []);
                                    const v = list.find(x => x.code === val);
                                    setMultiple({ vendorId: val, vendorName: v ? v.name : 'ALL ENTITIES' });
                                }} className={`w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] appearance-none cursor-pointer truncate ${formData.vendorType === 'all' ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700'}`} style={dropdownStyle} disabled={formData.vendorType === 'all'}>
                                    <option value="">ALL ENTITIES</option>
                                    {(formData.vendorType === 'customer' ? lookups.customers : (formData.vendorType === 'supplier' ? lookups.suppliers : [])).map(v => (
                                        <option key={v.code} value={v.code}>{v.code} - {v.name}</option>
                                    ))}
                                </select>
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
                                <select value={formData.costCenter} onChange={e => {
                                    const val = e.target.value;
                                    const cc = lookups.costCenters.find(x => x.code === val);
                                    setMultiple({ costCenter: val, costCenterName: cc ? cc.name : 'ALL CENTERS' });
                                }} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer truncate" style={dropdownStyle}>
                                    <option value="">ALL CENTERS</option>
                                    {lookups.costCenters.map(cc => (
                                        <option key={cc.code} value={cc.code}>{cc.code} - {cc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payee</label>
                                <select value={formData.payee} onChange={e => set('payee', e.target.value)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer truncate" style={dropdownStyle}>
                                    <option value="">ALL PAYEES</option>
                                    {lookups.payees.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
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
