import React, { useState } from 'react';
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
    ClipboardList
} from 'lucide-react';

const TransactionSearchModal = ({ isOpen, onClose }) => {
    // Filter States
    const [transType, setTransType] = useState({ code: 'SALE', name: 'Sale' });
    const [docNo, setDocNo] = useState('');
    const [searchType, setSearchType] = useState('customer'); // customer or supplier
    const [entity, setEntity] = useState({ code: '', name: '' });
    const [chequeNo, setChequeNo] = useState('');
    const [amount, setAmount] = useState('');
    const [costCenter, setCostCenter] = useState({ code: '', name: '' });
    const [payee, setPayee] = useState({ code: '', name: '' });
    const [docCategory, setDocCategory] = useState('note'); // note or statement
    const [useDateFilter, setUseDateFilter] = useState(false);
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');

    // Lookup Visibility States
    const [showTransLookup, setShowTransLookup] = useState(false);
    const [showEntityLookup, setShowEntityLookup] = useState(false);
    const [showCostCenterLookup, setShowCostCenterLookup] = useState(false);
    const [showPayeeLookup, setShowPayeeLookup] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);

    // Mock Data for Lookups
    const transTypes = [
        { code: 'SALE', name: 'Sale' },
        { code: 'PURC', name: 'Purchase' },
        { code: 'PMNT', name: 'Payment' },
        { code: 'RECT', name: 'Receipt' }
    ];

    const handleClear = () => {
        setDocNo('');
        setEntity({ code: '', name: '' });
        setChequeNo('');
        setAmount('');
        setCostCenter({ code: '', name: '' });
        setPayee({ code: '', name: '' });
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear All
            </button>
        </div>
    );

    return (
        <>
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
                            <FileSearch size={20} className="text-[#0078d4]" />
                            <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Intelligent Transaction Retrieval & Audit</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <Activity size={14} className="text-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Search Facility</span>
                        </div>
                    </div>

                    {/* Filter Grid System */}
                    <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-[5px] grid grid-cols-12 gap-8 shadow-sm relative overflow-hidden">
                        
                        {/* Column 1: Core Identifiers */}
                        <div className="col-span-3 space-y-4 border-r border-slate-200 pr-8">
                            <div className="space-y-2">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Transaction Type</label>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={transType.name} 
                                        readOnly 
                                        className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none font-bold text-[#0078d4]" 
                                    />
                                    <button onClick={() => setShowTransLookup(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm"><Search size={14} /></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Document No</label>
                                <input 
                                    type="text" 
                                    value={docNo} 
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none font-mono text-gray-700" 
                                />
                            </div>
                        </div>

                        {/* Column 2: Entity Selection */}
                        <div className="col-span-4 space-y-4 border-r border-slate-200 pr-8">
                            <div className="flex items-center gap-6 pb-2 border-b border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={searchType === 'customer'} onChange={() => setSearchType('customer')} className="w-3.5 h-3.5 accent-[#0078d4]" />
                                    <span className={`text-[12px] font-bold ${searchType === 'customer' ? 'text-[#0078d4]' : 'text-slate-400'}`}>Customer</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={searchType === 'supplier'} onChange={() => setSearchType('supplier')} className="w-3.5 h-3.5 accent-[#0078d4]" />
                                    <span className={`text-[12px] font-bold ${searchType === 'supplier' ? 'text-[#0078d4]' : 'text-slate-400'}`}>Supplier</span>
                                </label>
                            </div>
                            <div className="space-y-2">
                                <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">{searchType === 'customer' ? 'Customer Profile' : 'Supplier Profile'}</label>
                                <div className="flex gap-2">
                                    <input type="text" value={entity.code} readOnly placeholder="Code" className="w-24 h-8 border border-gray-300 px-2 bg-gray-50 rounded-[5px] outline-none font-bold text-center text-[#0078d4]" />
                                    <input type="text" value={entity.name} readOnly placeholder="Entity Name" className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none font-mono" />
                                    <button onClick={() => setShowEntityLookup(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm"><Users size={16} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Cheque No</label>
                                    <div className="relative">
                                        <input type="text" value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none" />
                                        <CreditCard size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Amount</label>
                                    <div className="relative">
                                        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none font-mono font-bold text-blue-600" />
                                        <DollarSign size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Advanced Categorization */}
                        <div className="col-span-5 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Cost Center</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={costCenter.name} readOnly className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none truncate" placeholder="Select Dept..." />
                                        <button onClick={() => setShowCostCenterLookup(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm"><Target size={14} /></button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-gray-700 block uppercase tracking-wider text-[11px]">Payee Name</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={payee.name} readOnly className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none truncate" placeholder="Search Payee..." />
                                        <button onClick={() => setShowPayeeLookup(true)} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-sm"><Search size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-6 mt-1">
                                {/* Type Selection */}
                                <div className="flex-1 bg-white border border-slate-200 rounded-[5px] p-2 flex items-center justify-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" checked={docCategory === 'note'} onChange={() => setDocCategory('note')} className="w-3.5 h-3.5 accent-[#0078d4]" />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Note</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" checked={docCategory === 'statement'} onChange={() => setDocCategory('statement')} className="w-3.5 h-3.5 accent-[#0078d4]" />
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Statement</span>
                                    </label>
                                </div>

                                {/* Date Range Controls */}
                                <div className="flex-[1.5] bg-white border border-slate-200 rounded-[5px] p-2 flex flex-col gap-2 relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <input type="checkbox" checked={useDateFilter} onChange={() => setUseDateFilter(!useDateFilter)} className="w-3.5 h-3.5 accent-[#0078d4]" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enable Date Range</span>
                                    </div>
                                    <div className={`flex gap-2 transition-opacity ${useDateFilter ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                        <div className="flex-1 flex items-center border border-gray-200 rounded-[5px] bg-white overflow-hidden shadow-sm">
                                            <input type="text" value={dateFrom} readOnly className="flex-1 h-6 px-2 text-[10px] font-bold text-blue-600 outline-none" />
                                            <button onClick={() => setShowCalendarFrom(true)} className="h-6 w-6 bg-slate-50 border-l border-gray-100 flex items-center justify-center text-slate-400 hover:text-blue-500"><Calendar size={12} /></button>
                                        </div>
                                        <div className="flex-1 flex items-center border border-gray-200 rounded-[5px] bg-white overflow-hidden shadow-sm">
                                            <input type="text" value={dateTo} readOnly className="flex-1 h-6 px-2 text-[10px] font-bold text-blue-600 outline-none" />
                                            <button onClick={() => setShowCalendarTo(true)} className="h-6 w-6 bg-slate-50 border-l border-gray-100 flex items-center justify-center text-slate-400 hover:text-blue-500"><Calendar size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Search Results Grid */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[450px] bg-white shadow-inner relative">
                        {/* Grid Header */}
                        <div className="flex bg-[#f8fafc] border-b border-gray-300 select-none font-bold text-gray-600 text-[10px] uppercase tracking-wider">
                            <div className="w-10 px-2 py-2 text-center border-r border-gray-200">#</div>
                            <div className="w-32 px-3 py-2 border-r border-gray-200">Date</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Document No</div>
                            <div className="flex-1 px-3 py-2 border-r border-gray-200">Entity Name (Customer/Supplier)</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Voucher No</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200">Account Name</div>
                            <div className="w-32 px-3 py-2 border-r border-gray-200">Cheque No</div>
                            <div className="w-40 px-3 py-2 border-r border-gray-200 text-right">Amount (LKR)</div>
                        </div>

                        {/* Table Background Grid Lines & Empty State */}
                        <div className="flex-1 bg-white relative flex items-center justify-center">
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

                            {/* Demo Row for Reference (Matching User Image) */}
                            <div className="absolute top-0 left-0 right-0 flex border-b border-gray-100 bg-blue-50/10 hover:bg-blue-50 transition-colors text-[11px] font-mono text-slate-700">
                                <div className="w-10 px-2 py-2.5 text-center border-r border-gray-100 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                </div>
                                <div className="w-32 px-3 py-2.5 border-r border-gray-100 font-bold">21/01/2026</div>
                                <div className="w-40 px-3 py-2.5 border-r border-gray-100 font-bold text-blue-600">INV01000001</div>
                                <div className="flex-1 px-3 py-2.5 border-r border-gray-100 uppercase">CASH SALES - RETAIL TERMINAL 01</div>
                                <div className="w-40 px-3 py-2.5 border-r border-gray-100">/.</div>
                                <div className="w-40 px-3 py-2.5 border-r border-gray-100 opacity-40 italic">Not Specified</div>
                                <div className="w-32 px-3 py-2.5 border-r border-gray-100 opacity-40 italic">N/A</div>
                                <div className="w-40 px-3 py-2.5 text-right font-black text-slate-900">9,000.0000</div>
                            </div>
                        </div>
                    </div>

                </div>
            </SimpleModal>

            {/* Standard Lookup Modals */}
            {showTransLookup && (
                <SearchModal title="Transaction" list={transTypes} onSelect={(i) => { setTransType(i); setShowTransLookup(false); }} onClose={() => setShowTransLookup(false)} placeholder="Search type..." />
            )}
            {showEntityLookup && (
                <SearchModal title={searchType === 'customer' ? "Customer" : "Supplier"} list={[]} onSelect={(i) => { setEntity(i); setShowEntityLookup(false); }} onClose={() => setShowEntityLookup(false)} placeholder={`Search ${searchType}...`} />
            )}
            {showCostCenterLookup && (
                <SearchModal title="Cost Center" list={[]} onSelect={(i) => { setCostCenter(i); setShowCostCenterLookup(false); }} onClose={() => setShowCostCenterLookup(false)} placeholder="Search dept..." />
            )}
            {showPayeeLookup && (
                <SearchModal title="Payee" list={[]} onSelect={(i) => { setPayee(i); setShowPayeeLookup(false); }} onClose={() => setShowPayeeLookup(false)} placeholder="Search payee..." />
            )}

            {/* Calendar Modals */}
            <CalendarModal isOpen={showCalendarFrom} onClose={() => setShowCalendarFrom(false)} onDateSelect={(d) => { setDateFrom(d); setShowCalendarFrom(false); }} initialDate={dateFrom} />
            <CalendarModal isOpen={showCalendarTo} onClose={() => setShowCalendarTo(false)} onDateSelect={(d) => { setDateTo(d); setShowCalendarTo(false); }} initialDate={dateTo} />
        </>
    );
};

const SearchModal = ({ title, list, onSelect, onClose, placeholder }) => {
    const [query, setQuery] = useState('');
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Search size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight tracking-[0.1em]">{title} Profile Lookup</span>
                    </div>
                    <button onClick={onClose} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-95"><X size={18} strokeWidth={4} /></button>
                </div>
                <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Layers size={14} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span></div>
                    <input type="text" placeholder={placeholder} className="h-8 border border-gray-300 px-3 text-xs rounded-md w-60 focus:border-[#0285fd] outline-none shadow-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="p-2">
                    <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                        <span className="w-24 text-center">CODE</span>
                        <span className="flex-1 px-3">DISPLAY NAME</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {list.filter(x => (x.name || '').toLowerCase().includes(query.toLowerCase()) || (x.code || '').toLowerCase().includes(query.toLowerCase())).map(x => (
                            <button key={x.code} onClick={() => onSelect(x)} className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left">
                                <div className="flex items-center gap-2 flex-1"><span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">{x.code}</span><span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">{x.name}</span></div>
                                <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] active:scale-95 uppercase">Select</div>
                            </button>
                        ))}
                        {list.length === 0 && <div className="p-8 text-center text-gray-400 italic text-sm uppercase font-bold tracking-widest opacity-30">No entities identified</div>}
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                    <span>{list.length} Entity/Entities Identified</span>
                    <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD INFRASTRUCTURE</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionSearchModal;
