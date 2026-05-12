import React, { useState, useMemo, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { 
    Search, 
    X, 
    RotateCcw, 
    Calendar, 
    ChevronDown, 
    FileSearch, 
    Users, 
    Target, 
    CreditCard, 
    DollarSign,
    Layers,
    Activity,
    ClipboardList,
    Hash,
    Database
} from 'lucide-react';
import { documentSearchService } from '../../../services/documentSearch.service';
import { getSessionData } from '../../../utils/session';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import UniversalLookupModal from '../ViewAndUtilityModels/UniversalLookupModal';

const TransactionSearchModal = ({ isOpen, onClose }) => {
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

    // Filter States
    const [transType, setTransType] = useState({ code: '', name: '' });
    const [docNo, setDocNo] = useState('');
    const [searchType, setSearchType] = useState('customer'); // customer or supplier
    const [entity, setEntity] = useState({ code: '', name: '' });
    const [chequeNo, setChequeNo] = useState('');
    const [amount, setAmount] = useState('');
    const [costCenter, setCostCenter] = useState({ code: '', name: '' });
    const [payee, setPayee] = useState({ code: '', name: '' });
    const [docCategory, setDocCategory] = useState('note'); // note or statement
    const [useDateFilter, setUseDateFilter] = useState(false);
    const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    // Lookup States
    const [lookups, setLookups] = useState({ transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] });
    const [loading, setLoading] = useState(false);

    // Results State
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Lookup Visibility States
    const [showTransLookup, setShowTransLookup] = useState(false);
    const [showEntityLookup, setShowEntityLookup] = useState(false);
    const [showCostCenterLookup, setShowCostCenterLookup] = useState(false);
    const [showPayeeLookup, setShowPayeeLookup] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        setLoading(true);
        try {
            const session = getSessionData();
            const response = await documentSearchService.getLookups(session?.userName);
            setLookups(response.data);
            
            // Set default transaction type if available
            if (response.data.transTypes.length > 0 && !transType.code) {
                setTransType(response.data.transTypes[0]);
            }
        } catch (error) {
            console.error('Failed to fetch lookups:', error);
            showErrorToast('Failed to load search metadata from database');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const params = {
                transType: transType.code,
                vendorId: entity.code,
                docNo: docNo,
                chequeNo: chequeNo,
                amount: amount ? parseFloat(amount) : null,
                costCenter: costCenter.code,
                dateFrom: dateFrom,
                dateTo: dateTo,
                useDate: useDateFilter,
                payee: payee.name
            };
            const response = await documentSearchService.search(params);
            setResults(response.data);
            if (response.data.length === 0) {
                toast('No documents found matching your criteria', { icon: '🔍', className: "font-['Tahoma'] text-[12px] font-bold uppercase tracking-wider" });
            }
        } catch (error) {
            console.error('Search failed:', error);
            showErrorToast('Search failed. Please verify database connectivity.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setDocNo('');
        setEntity({ code: '', name: '' });
        setChequeNo('');
        setAmount('');
        setCostCenter({ code: '', name: '' });
        setPayee({ code: '', name: '' });
        setResults([]);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear All
            </button>
            <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="px-10 h-10 bg-[#e49e1b] text-white text-[13px] font-black rounded-[5px] hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 border-none flex items-center justify-center gap-2 uppercase tracking-widest"
            >
                {isSearching ? <RotateCcw className="animate-spin" size={16} /> : <><Search size={16} strokeWidth={3} /> Find Records</>}
            </button>
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Document Searching"
                maxWidth="max-w-[1400px]"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                    
                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Intelligent Transaction Retrieval & Audit</h2>
                        </div>
                       
                    </div>

                    {/* Filter Grid System */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[5px] grid grid-cols-12 gap-4 shadow-sm relative overflow-hidden">
                        
                        {/* Column 1: Core Identifiers */}
                        <div className="col-span-3 space-y-4 border-r border-slate-200 pr-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Transaction Type</label>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={transType.name} 
                                        readOnly 
                                        className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[4px] outline-none font-bold text-[#0285fd] text-[12px] truncate shadow-sm" 
                                    />
                                    <button onClick={() => setShowTransLookup(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] shadow-sm"><Search size={14} strokeWidth={3}/></button>
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-1">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Document No</label>
                                <input 
                                    type="text" 
                                    value={docNo} 
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[4px] outline-none font-mono text-gray-700 text-[12px] shadow-sm" 
                                />
                            </div>
                        </div>

                        {/* Column 2: Entity Selection */}
                        <div className="col-span-4 space-y-4 border-r border-slate-200 px-4">
                            <div className="flex items-center gap-3 pb-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={searchType === 'customer'} onChange={() => setSearchType('customer')} className="w-3.5 h-3.5 accent-[#0285fd]" />
                                    <span className={`text-[12px] font-bold ${searchType === 'customer' ? 'text-[#0285fd]' : 'text-slate-400 opacity-60'}`}>Customer</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={searchType === 'supplier'} onChange={() => setSearchType('supplier')} className="w-3.5 h-3.5 accent-[#0285fd]" />
                                    <span className={`text-[12px] font-bold ${searchType === 'supplier' ? 'text-[#0285fd]' : 'text-slate-400 opacity-60'}`}>Supplier</span>
                                </label>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">{searchType === 'customer' ? 'Customer Profile' : 'Supplier Profile'}</label>
                                <div className="flex gap-1">
                                    <input type="text" value={entity.code} readOnly className="w-14 h-8 border border-gray-300 px-1 bg-slate-50 rounded-[4px] outline-none font-bold text-center text-[#0285fd] text-[11px]" />
                                    <input type="text" value={entity.name} readOnly className="flex-1 min-w-0 h-8 border border-gray-300 px-2 bg-slate-50 rounded-[4px] outline-none font-bold text-[11px] text-slate-700 truncate" />
                                    <button onClick={() => setShowEntityLookup(true)} className="w-8 h-8 shrink-0 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] shadow-sm"><Users size={14} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1.5">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Cheque No</label>
                                    <div className="relative">
                                        <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className="w-full h-8 border border-gray-300 px-2 bg-white rounded-[4px] outline-none font-bold text-slate-700 text-[11px]" />
                                        <CreditCard size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Amount</label>
                                    <div className="relative">
                                        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-8 border border-gray-300 px-2 bg-white rounded-[4px] outline-none font-mono font-bold text-slate-700 text-[11px]" />
                                        <DollarSign size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Cost Center & Type */}
                        <div className="col-span-2 space-y-4 border-r border-slate-200 px-3">
                            <div className="space-y-1.5">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Cost Center</label>
                                <div className="flex gap-1">
                                    <input type="text" value={costCenter.name} readOnly className="flex-1 min-w-0 h-8 border border-gray-300 px-2 bg-white rounded-[4px] outline-none truncate text-[11px] font-bold text-slate-700" placeholder="" />
                                    <button onClick={() => setShowCostCenterLookup(true)} className="w-8 h-8 shrink-0 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] shadow-sm"><Target size={14} /></button>
                                </div>
                            </div>
                            
                            <div className="pt-1">
                                <div className="bg-slate-50/50 border border-slate-200 rounded-[8px] p-2 flex items-center justify-around h-[70px] shadow-inner">
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input type="radio" checked={docCategory === 'note'} onChange={() => setDocCategory('note')} className="w-3.5 h-3.5 accent-[#0285fd]" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${docCategory === 'note' ? 'text-[#0285fd]' : 'text-slate-400'}`}>Note</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input type="radio" checked={docCategory === 'statement'} onChange={() => setDocCategory('statement')} className="w-3.5 h-3.5 accent-[#0285fd]" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${docCategory === 'statement' ? 'text-[#0285fd]' : 'text-slate-400'}`}>Stmt</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Payee & Dates */}
                        <div className="col-span-3 space-y-4 pl-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Payee Name</label>
                                <div className="flex gap-1">
                                    <input type="text" value={payee.name} readOnly className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[4px] outline-none truncate text-[12px] font-bold text-slate-700 shadow-sm" placeholder="" />
                                    <button onClick={() => setShowPayeeLookup(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] shadow-sm"><Search size={14} strokeWidth={3}/></button>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 border border-slate-200 rounded-[8px] p-3 space-y-2 shadow-inner">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={useDateFilter} 
                                        onChange={(e) => setUseDateFilter(e.target.checked)} 
                                        className="w-3.5 h-3.5 rounded accent-[#0285fd]" 
                                    />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enable Date Range</span>
                                </label>
                                <div className={`flex items-center gap-2 transition-opacity duration-300 ${!useDateFilter ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                                    <button
                                        onClick={() => setShowCalendarFrom(true)}
                                        className="flex-1 h-7 bg-white border border-slate-200 rounded-[4px] text-[10px] font-bold text-slate-600 flex items-center px-2 gap-2 hover:border-[#0285fd] shadow-sm"
                                    >
                                        <Calendar size={12} className="text-[#0285fd]" />
                                        {dateFrom}
                                    </button>
                                    <button
                                        onClick={() => setShowCalendarTo(true)}
                                        className="flex-1 h-7 bg-white border border-slate-200 rounded-[4px] text-[10px] font-bold text-slate-600 flex items-center px-2 gap-2 hover:border-[#0285fd] shadow-sm"
                                    >
                                        <Calendar size={12} className="text-[#0285fd]" />
                                        {dateTo}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Search Results Grid */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[450px] bg-white shadow-inner relative">
                        {/* Grid Header */}
                        <div className="flex bg-[#f8fafc] border-b border-gray-300 select-none font-bold text-gray-600 text-[10px] uppercase tracking-wider sticky top-0 z-10">
                            <div className="w-10 px-2 py-2 text-center border-r border-gray-200">#</div>
                            <div className="w-32 px-3 py-2 border-r border-gray-200">Date</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Document No</div>
                            <div className="flex-1 px-3 py-2 border-r border-gray-200">Entity Name (Customer/Supplier)</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Voucher No</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Account Name</div>
                            <div className="w-32 px-3 py-2 border-r border-gray-200">Cheque No</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200 text-right">Amount (LKR)</div>
                        </div>

                        {/* Table Background Grid Lines & Results */}
                        <div className="flex-1 bg-white relative overflow-y-auto no-scrollbar">
                            {results.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {results.map((row, idx) => (
                                        <div key={idx} className="flex border-b border-gray-50 hover:bg-blue-50/50 transition-colors text-[11px] font-mono text-slate-700 cursor-pointer group">
                                            <div className="w-10 px-2 py-2 text-center border-r border-gray-50 flex items-center justify-center text-slate-300 font-bold group-hover:text-blue-500">{idx + 1}</div>
                                            <div className="w-32 px-3 py-2 border-r border-gray-50 font-bold">{row.Date || row.date}</div>
                                            <div className="w-40 px-3 py-2 border-r border-gray-50 font-black text-blue-600">{row['Document No'] || row.docNo}</div>
                                            <div className="flex-1 px-3 py-2 border-r border-gray-50 uppercase truncate">{row['Customer/Supplier Name'] || row.name || '---'}</div>
                                            <div className="w-40 px-3 py-2 border-r border-gray-50">{row['Invoice No/Voucher No'] || row.invNo || row['Voucher No'] || row['Invoice No'] || '---'}</div>
                                            <div className="w-40 px-3 py-2 border-r border-gray-50 text-[#0285fd] font-bold truncate">{row['Account Name'] || row.accName || '---'}</div>
                                            <div className="w-32 px-3 py-2 border-r border-gray-50 opacity-60">{row['Cheque No'] || row.chequeNo || '---'}</div>
                                            <div className="w-40 px-3 py-2 text-right font-black text-slate-900 bg-slate-50/30 group-hover:bg-blue-100/30 transition-colors">
                                                {parseFloat(row.Amount || row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Grid Line Overlay */}
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                                         style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 32px' }} 
                                    />
                                    
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <ClipboardList size={64} className="text-slate-400" />
                                        <div className="flex flex-col items-center">
                                            <span className="font-black uppercase tracking-[0.4em] text-slate-500">Retrieval Queue Ready</span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Define filters above to populate ledger data</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </SimpleModal>

            {/* Standard Lookup Modals */}
            {showTransLookup && (
                <UniversalLookupModal 
                    isOpen={true}
                    title="Transaction Profile Lookup" 
                    type="transType"
                    initialData={lookups.transTypes}
                    onSelect={(i) => { setTransType(i); setShowTransLookup(false); }} 
                    onClose={() => setShowTransLookup(false)} 
                    placeholder="Search type..." 
                />
            )}
            {showEntityLookup && (
                <UniversalLookupModal 
                    isOpen={true}
                    title={`${searchType} Profile Lookup`.toUpperCase()} 
                    type={searchType}
                    initialData={searchType === 'customer' ? lookups.customers : lookups.suppliers}
                    onSelect={(i) => { setEntity(i); setShowEntityLookup(false); }} 
                    onClose={() => setShowEntityLookup(false)} 
                    placeholder={`Search ${searchType}...`} 
                />
            )}
            {showCostCenterLookup && (
                <UniversalLookupModal 
                    isOpen={true}
                    title="Cost Center Profile Lookup" 
                    type="costCenter"
                    initialData={lookups.costCenters}
                    onSelect={(i) => { setCostCenter(i); setShowCostCenterLookup(false); }} 
                    onClose={() => setShowCostCenterLookup(false)} 
                    placeholder="Search dept..." 
                />
            )}
            {showPayeeLookup && (
                <UniversalLookupModal 
                    isOpen={true}
                    title="Payee Profile Lookup" 
                    type="payee"
                    initialData={lookups.payees?.map(p => ({ code: p, name: p }))}
                    onSelect={(i) => { setPayee(i); setShowPayeeLookup(false); }} 
                    onClose={() => setShowPayeeLookup(false)} 
                    placeholder="Search payee..." 
                />
            )}

            {/* Calendar Modals */}
            <CalendarModal isOpen={showCalendarFrom} onClose={() => setShowCalendarFrom(false)} onDateSelect={(d) => { setDateFrom(d); setShowCalendarFrom(false); }} initialDate={dateFrom} />
            <CalendarModal isOpen={showCalendarTo} onClose={() => setShowCalendarTo(false)} onDateSelect={(d) => { setDateTo(d); setShowCalendarTo(false); }} initialDate={dateTo} />
        </>
    );
};

export default TransactionSearchModal;
