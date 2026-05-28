import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { Search, Calendar, RotateCcw, X, Filter, ChevronRight, FileText, User, Building2, CreditCard, DollarSign } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { documentSearchService } from '../../../services/documentSearch.service';
import { getSessionData } from '../../../utils/session';

import UniversalLookupModal from './UniversalLookupModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const DocumentSearchModal = ({ isOpen, onClose, onSelect }) => {
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
        searchType: 'customer'
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    if (!isOpen) return null;

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
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-[1100px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                                <Search size={16} className="text-[#4f83ff]" />
                            </div>
                            <div>
                                <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Document Search Utility</h2>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wider">Advanced Document Retrieval</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                            <X size={18} strokeWidth={3} className="text-red-600" />
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="p-5 bg-slate-50/50 border-b border-slate-100 shrink-0">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction Type</label>
                                        <div className="relative group">
                                            <button
                                                onClick={() => setShowProfileLookup(true)}
                                                className="w-full h-10 pl-3 pr-10 bg-white border border-slate-200 rounded-[5px] text-[12px] font-black text-[#4f83ff] outline-none hover:border-[#4f83ff] transition-all flex items-center shadow-sm uppercase tracking-tighter"
                                            >
                                                {filters.transTypeName || 'Select Type...'}
                                            </button>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#4f83ff] transition-colors">
                                                <Search size={14} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex bg-slate-100 p-1 rounded-[6px] gap-1">
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, searchType: 'customer', vendorId: '' }))}
                                            className={`flex-1 h-8 rounded-[4px] text-[10px] font-black tracking-widest transition-all ${filters.searchType === 'customer' ? 'bg-white text-[#4f83ff] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            CUSTOMER
                                        </button>
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, searchType: 'supplier', vendorId: '' }))}
                                            className={`flex-1 h-8 rounded-[4px] text-[10px] font-black tracking-widest transition-all ${filters.searchType === 'supplier' ? 'bg-white text-[#4f83ff] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            SUPPLIER
                                        </button>
                                    </div>
                                </div>

                                <div className="col-span-6 grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            {filters.searchType === 'customer' ? 'Customer' : 'Supplier'}
                                        </label>
                                        <div className="relative group">
                                            <button
                                                onClick={() => setShowEntityLookup(true)}
                                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none hover:border-[#4f83ff] transition-all flex items-center shadow-sm overflow-hidden"
                                            >
                                                <span className="truncate">{filters.vendorName || `Select ${filters.searchType}...`}</span>
                                            </button>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#4f83ff] transition-colors">
                                                <User size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Document No</label>
                                        <input
                                            type="text"
                                            value={filters.docNo}
                                            onChange={(e) => setFilters(prev => ({ ...prev, docNo: e.target.value }))}
                                            placeholder="Search Doc/Inv/Vou..."
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cost Center</label>
                                        <div className="relative group">
                                            <button
                                                onClick={() => setShowCostCenterLookup(true)}
                                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[5px] text-[12px] font-bold text-slate-700 outline-none hover:border-[#4f83ff] transition-all flex items-center shadow-sm"
                                            >
                                                {filters.costCenterName || 'Select Center...'}
                                            </button>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-[#4f83ff] transition-colors">
                                                <Building2 size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cheque No</label>
                                        <input
                                            type="text"
                                            value={filters.chequeNo}
                                            onChange={(e) => setFilters(prev => ({ ...prev, chequeNo: e.target.value }))}
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exact Amount</label>
                                        <input
                                            type="number"
                                            value={filters.amount}
                                            onChange={(e) => setFilters(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payee Name</label>
                                        <select
                                            value={filters.payee}
                                            onChange={(e) => setFilters(prev => ({ ...prev, payee: e.target.value }))}
                                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#4f83ff] focus:ring-1 focus:ring-[#4f83ff]/20 transition-all shadow-sm"
                                        >
                                            <option value="">All Payees</option>
                                            {lookups.payees.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-3 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <input
                                                type="checkbox"
                                                id="useDate"
                                                checked={filters.useDate}
                                                onChange={(e) => setFilters(prev => ({ ...prev, useDate: e.target.checked }))}
                                                className="w-3.5 h-3.5 rounded accent-[#4f83ff]"
                                            />
                                            <label htmlFor="useDate" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Filter by Date</label>
                                        </div>

                                        <div className={`grid grid-cols-2 gap-2 transition-opacity duration-300 ${!filters.useDate ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <button
                                                onClick={() => openDatePicker('dateFrom')}
                                                className="h-9 bg-white border border-slate-200 rounded-lg flex items-center px-3 gap-2 hover:border-[#4f83ff] transition-colors"
                                            >
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                                                    {filters.dateFrom}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => openDatePicker('dateTo')}
                                                className="h-9 bg-white border border-slate-200 rounded-lg flex items-center px-3 gap-2 hover:border-[#4f83ff] transition-colors"
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
                                            className="flex-1 h-9 bg-[#4f83ff] text-white text-[11px] font-black rounded-[5px] shadow-md hover:bg-[#3a6fdf] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
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
                                            className="w-9 h-9 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                                            title="Reset Filters"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-5 overflow-hidden flex flex-col bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-5 bg-[#4f83ff] rounded-full" />
                                    <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Search Results</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                                        {results.length} Documents Found
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-inner bg-slate-50/30">
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
                                        <tbody className="divide-y divide-slate-100">
                                            {results.length > 0 ? (
                                                results.map((row, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="bg-white hover:bg-[#4f83ff]/5 transition-colors cursor-pointer group border-l-4 border-transparent hover:border-[#4f83ff]"
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
                                                        <td className="px-4 py-3 text-[11px] font-bold text-[#4f83ff]">{row['Account Name'] || row.accName || '---'}</td>
                                                        <td className="px-4 py-3 text-[12px] font-black text-slate-800 text-right">
                                                            {parseFloat(row.Amount || row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button className="p-1.5 bg-[#4f83ff]/10 text-[#4f83ff] rounded-[4px] hover:bg-[#4f83ff] hover:text-white transition-all opacity-0 group-hover:opacity-100">
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

                    <div className="bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0 px-6 py-3">
                        <span className="text-[9px] text-slate-400 font-medium">Document Search Utility</span>
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
        </>
    );
};

export default DocumentSearchModal;
