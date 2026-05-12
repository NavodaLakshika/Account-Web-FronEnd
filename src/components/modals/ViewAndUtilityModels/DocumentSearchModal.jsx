import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { Search, Calendar, RotateCcw, X, Filter, ChevronRight, FileText, User, Building2, CreditCard, DollarSign } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { documentSearchService } from '../../../services/documentSearch.service';
import { getSessionData } from '../../../utils/session';

import UniversalLookupModal from './UniversalLookupModal';

const DocumentSearchModal = ({ isOpen, onClose, onSelect }) => {
    // Custom Toast Handlers
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
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
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-['Tahoma'] leading-relaxed">{message}</h3>
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
        ), { duration: 3000, position: 'top-right' });
    };

    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] });
    const [results, setResults] = useState([]);
    const [showProfileLookup, setShowProfileLookup] = useState(false);
    const [showEntityLookup, setShowEntityLookup] = useState(false);
    const [showCostCenterLookup, setShowCostCenterLookup] = useState(false);
    
    const [filters, setFilters] = useState({
        transType: '',
        transTypeName: '',
        vendorId: '',
        docNo: '',
        chequeNo: '',
        amount: '',
        costCenter: '',
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        useDate: true,
        payee: '',
        searchType: 'customer' // 'customer' or 'supplier'
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const session = getSessionData();
            const response = await documentSearchService.getLookups(session?.userName);
            setLookups(response.data);
            if (response.data.transTypes.length > 0) {
                setFilters(prev => ({ 
                    ...prev, 
                    transType: response.data.transTypes[0].code,
                    transTypeName: response.data.transTypes[0].name
                }));
            }
        } catch (error) {
            console.error('Failed to fetch lookups:', error);
            showErrorToast('Failed to load search metadata');
        }
    };

    const handleProfileSelect = (profile) => {
        setFilters(prev => ({ 
            ...prev, 
            transType: profile.code,
            transTypeName: profile.name
        }));
        setShowProfileLookup(false);
    };

    const handleEntitySelect = (entity) => {
        setFilters(prev => ({ 
            ...prev, 
            vendorId: entity.code,
            vendorName: entity.name
        }));
        setShowEntityLookup(false);
    };

    const handleCostCenterSelect = (cc) => {
        setFilters(prev => ({ 
            ...prev, 
            costCenter: cc.code,
            costCenterName: cc.name
        }));
        setShowCostCenterLookup(false);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                amount: filters.amount ? parseFloat(filters.amount) : null
            };
            const response = await documentSearchService.search(params);
            setResults(response.data);
            if (response.data.length === 0) {
                toast('No documents found matching your criteria', { icon: '🔍', className: "font-['Tahoma'] text-[12px] font-bold uppercase tracking-wider" });
            }
        } catch (error) {
            console.error('Search failed:', error);
            showErrorToast('Search failed. Please check your criteria.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            transType: lookups.transTypes[0]?.code || '',
            vendorId: '',
            docNo: '',
            chequeNo: '',
            amount: '',
            costCenter: '',
            dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
            useDate: true,
            payee: '',
            searchType: 'customer'
        });
        setResults([]);
    };

    const handleDateSelect = (date) => {
        setFilters(prev => ({ ...prev, [datePickerField]: date }));
        setShowDatePicker(false);
    };

    const openDatePicker = (field) => {
        setDatePickerField(field);
        setShowDatePicker(true);
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
            <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="DOCUMENT SEARCH UTILITY"
            maxWidth="max-w-[1100px]"
        >
            <div className="flex flex-col h-[80vh] font-['Tahoma'] overflow-hidden">
                {/* Search Bar / Filters */}
                <div className="p-5 bg-slate-50/50 border-b border-gray-100 shrink-0">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Transaction Type & Search Type */}
                        <div className="col-span-3 space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction Type</label>
                                <div className="relative group">
                                    <button
                                        onClick={() => setShowProfileLookup(true)}
                                        className="w-full h-10 pl-3 pr-10 bg-white border border-gray-200 rounded-[5px] text-[12px] font-black text-[#0285fd] outline-none hover:border-[#0285fd] transition-all flex items-center shadow-sm uppercase tracking-tighter"
                                    >
                                        {filters.transTypeName || 'Select Type...'}
                                    </button>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#0285fd] transition-colors">
                                        <Search size={14} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex bg-gray-100 p-1 rounded-[6px] gap-1">
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, searchType: 'customer', vendorId: '' }))}
                                    className={`flex-1 h-8 rounded-[4px] text-[10px] font-black tracking-widest transition-all ${filters.searchType === 'customer' ? 'bg-white text-[#0285fd] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    CUSTOMER
                                </button>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, searchType: 'supplier', vendorId: '' }))}
                                    className={`flex-1 h-8 rounded-[4px] text-[10px] font-black tracking-widest transition-all ${filters.searchType === 'supplier' ? 'bg-white text-[#0285fd] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    SUPPLIER
                                </button>
                            </div>
                        </div>

                        {/* Middle Filters */}
                        <div className="col-span-6 grid grid-cols-3 gap-3">
                            {/* Vendor / Payee */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    {filters.searchType === 'customer' ? 'Customer' : 'Supplier'}
                                </label>
                                <div className="relative group">
                                    <button
                                        onClick={() => setShowEntityLookup(true)}
                                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none hover:border-[#0285fd] transition-all flex items-center shadow-sm overflow-hidden"
                                    >
                                        <span className="truncate">{filters.vendorName || `Select ${filters.searchType}...`}</span>
                                    </button>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#0285fd] transition-colors">
                                        <User size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Doc No */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document No</label>
                                <input
                                    type="text"
                                    value={filters.docNo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, docNo: e.target.value }))}
                                    placeholder="Search Doc/Inv/Vou..."
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0285fd] transition-all"
                                />
                            </div>

                            {/* Cost Center */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cost Center</label>
                                <div className="relative group">
                                    <button
                                        onClick={() => setShowCostCenterLookup(true)}
                                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none hover:border-[#0285fd] transition-all flex items-center shadow-sm"
                                    >
                                        {filters.costCenterName || 'Select Center...'}
                                    </button>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#0285fd] transition-colors">
                                        <Building2 size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Cheque No */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cheque No</label>
                                <input
                                    type="text"
                                    value={filters.chequeNo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, chequeNo: e.target.value }))}
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none focus:border-[#0285fd] transition-all"
                                />
                            </div>

                            {/* Amount */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exact Amount</label>
                                <input
                                    type="number"
                                    value={filters.amount}
                                    onChange={(e) => setFilters(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none focus:border-[#0285fd] transition-all"
                                />
                            </div>

                            {/* Payee */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payee Name</label>
                                <select
                                    value={filters.payee}
                                    onChange={(e) => setFilters(prev => ({ ...prev, payee: e.target.value }))}
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none focus:border-[#0285fd] transition-all"
                                >
                                    <option value="">All Payees</option>
                                    {lookups.payees.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Filters & Actions */}
                        <div className="col-span-3 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        type="checkbox"
                                        id="useDate"
                                        checked={filters.useDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, useDate: e.target.checked }))}
                                        className="w-3.5 h-3.5 rounded accent-[#0285fd]"
                                    />
                                    <label htmlFor="useDate" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Filter by Date</label>
                                </div>
                                
                                <div className={`grid grid-cols-2 gap-2 transition-opacity duration-300 ${!filters.useDate ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <button
                                        onClick={() => openDatePicker('dateFrom')}
                                        className="h-10 bg-white border border-gray-200 rounded-[5px] flex items-center px-3 gap-2 hover:border-[#0285fd] transition-colors"
                                    >
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                                            {filters.dateFrom}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => openDatePicker('dateTo')}
                                        className="h-10 bg-white border border-gray-200 rounded-[5px] flex items-center px-3 gap-2 hover:border-[#0285fd] transition-colors"
                                    >
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                                            {filters.dateTo}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="flex-1 h-11 bg-[#e49e1b] text-white text-[11px] font-black rounded-[5px] shadow-md hover:bg-[#cb9b34] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <RotateCcw className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            <Search size={16} strokeWidth={3} />
                                            FIND RECORDS
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-11 h-11 bg-white border border-gray-200 text-slate-400 rounded-[5px] flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                                    title="Reset Filters"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table Area */}
                <div className="flex-1 p-5 overflow-hidden flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-5 bg-[#0285fd] rounded-full" />
                            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Search Results</h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                                {results.length} Documents Found
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden flex flex-col shadow-inner bg-slate-50/30">
                        <div className="overflow-auto flex-1 no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-800 text-white shadow-md">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Date</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Doc No</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Entity Name</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Inv/Vou No</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Account</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results.length > 0 ? (
                                        results.map((row, idx) => (
                                            <tr 
                                                key={idx} 
                                                className="bg-white hover:bg-[#0285fd]/5 transition-colors cursor-pointer group border-l-4 border-transparent hover:border-[#0285fd]"
                                                onClick={() => onSelect && onSelect(row)}
                                            >
                                                <td className="px-4 py-3 text-[11px] font-bold text-slate-600">{row.Date || row.date}</td>
                                                <td className="px-4 py-3 text-[11px] font-black text-slate-800 uppercase tracking-tighter">{row['Document No'] || row.docNo}</td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <User size={12} className="text-slate-300" />
                                                        <span className="truncate max-w-[180px]">{row['Customer/Supplier Name'] || row.name || '---'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-slate-500 italic">{row['Invoice No/Voucher No'] || row.invNo || row['Voucher No'] || row['Invoice No'] || '---'}</td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-[#0285fd]">{row['Account Name'] || row.accName || '---'}</td>
                                                <td className="px-4 py-3 text-[12px] font-black text-slate-800 text-right">
                                                    {parseFloat(row.Amount || row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button className="p-1.5 bg-[#0285fd]/10 text-[#0285fd] rounded-[4px] hover:bg-[#0285fd] hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                        <ChevronRight size={14} strokeWidth={3} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                                    <Search size={48} strokeWidth={1} />
                                                    <p className="text-[12px] font-black uppercase tracking-[3px]">Ready to search documents</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showDatePicker && (
                <CalendarModal
                    isOpen={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onSelect={handleDateSelect}
                    currentDate={filters[datePickerField]}
                />
            )}

            {showProfileLookup && (
                <UniversalLookupModal
                    isOpen={showProfileLookup}
                    onClose={() => setShowProfileLookup(false)}
                    onSelect={handleProfileSelect}
                    type="transType"
                    title="TRANSACTION PROFILE LOOKUP"
                    placeholder="Search transaction types..."
                />
            )}

            {showEntityLookup && (
                <UniversalLookupModal
                    isOpen={showEntityLookup}
                    onClose={() => setShowEntityLookup(false)}
                    onSelect={handleEntitySelect}
                    type={filters.searchType}
                    title={`${filters.searchType} Profile Lookup`.toUpperCase()}
                    placeholder={`Search ${filters.searchType}s...`}
                />
            )}

            {showCostCenterLookup && (
                <UniversalLookupModal
                    isOpen={showCostCenterLookup}
                    onClose={() => setShowCostCenterLookup(false)}
                    onSelect={handleCostCenterSelect}
                    type="costCenter"
                    title="COST CENTER LOOKUP"
                    placeholder="Search cost centers..."
                />
            )}
            </SimpleModal>
        </>
    );
};

export default DocumentSearchModal;
