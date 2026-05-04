import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, RotateCcw, Printer, Download, X, Loader2, ListFilter, FileText, ChevronRight, Play, User, Users, Filter, Hash, CreditCard, Banknote } from 'lucide-react';
import { documentSearchService } from '../services/documentSearch.service';
import { toast } from 'react-hot-toast';

const DocumentSearchBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ transTypes: [], payees: [], costCenters: [], customers: [], suppliers: [] });
    const [searchResults, setSearchResults] = useState([]);
    
    const [formData, setFormData] = useState({
        transType: 'SAL',
        vendorType: 'customer',
        vendorId: '',
        vendorName: 'ALL CONTEXTS',
        docNo: '',
        chequeNo: '',
        amount: '',
        costCenter: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        useDate: false,
        payee: ''
    });

    // Modal States
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);

    const companyCode = localStorage.getItem('company') || 'C001';

    useEffect(() => {
        if (isOpen) {
            loadLookups();
        }
    }, [isOpen]);

    const loadLookups = async () => {
        try {
            const data = await documentSearchService.getLookups(companyCode);
            setLookups(data);
            if (data.transTypes?.length > 0) {
                setFormData(prev => ({ ...prev, transType: data.transTypes[0].iid }));
            }
        } catch (e) {
            toast.error('Failed to load search parameters');
        }
    };

    const runSearch = async () => {
        setLoading(true);
        try {
            const data = await documentSearchService.search({
                ...formData,
                companyCode
            });
            setSearchResults(data);
            toast.success(`Retrieved ${data.length} Matching Documents`);
        } catch (error) {
            toast.error('Search operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            ...formData,
            vendorId: '',
            vendorName: 'ALL CONTEXTS',
            docNo: '',
            chequeNo: '',
            amount: '',
            costCenter: '',
            useDate: false,
            payee: ''
        });
        setSearchResults([]);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
            <div className="flex-1 flex items-center gap-2 opacity-30 select-none">
                <span className="text-[20px] font-black text-[#0078d4] tracking-tighter">onimta IT</span>
            </div>
            <button className="px-6 h-9 bg-[#0285fd] text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <Printer size={15} /> PRINT LIST
            </button>
            <button onClick={onClose} className="px-6 h-9 bg-slate-400 text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-slate-500 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <X size={15} /> CLOSE ARCHIVE
            </button>
        </div>
    );

    const vendors = formData.vendorType === 'customer' ? lookups.customers : lookups.suppliers;

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Historical Transaction Archive: Advanced Document Discovery"
                maxWidth="max-w-[1550px]"
                footer={footer}
            >
                <div className="space-y-4 pt-1 font-['Tahoma',_sans-serif]">
                    {/* Advanced Filter Matrix */}
                    <div className="bg-white/50 backdrop-blur-sm p-5 border border-gray-200 rounded-[8px] shadow-sm space-y-5">
                        <div className="grid grid-cols-12 gap-5 items-end">
                            {/* Primary Category */}
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <Filter size={12} className="text-[#0285fd]" /> Transaction Type
                                </label>
                                <select 
                                    value={formData.transType}
                                    onChange={(e) => setFormData({ ...formData, transType: e.target.value })}
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-bold focus:border-[#0285fd] transition-all"
                                >
                                    {lookups.transTypes.map(t => (
                                        <option key={t.iid} value={t.iid}>{t.tr_Type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Vendor Context */}
                            <div className="col-span-3 space-y-1.5">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        {formData.vendorType === 'customer' ? <Users size={12} className="text-[#0285fd]" /> : <User size={12} className="text-[#e49e1b]" />}
                                        Context Entity
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input type="radio" name="vType" checked={formData.vendorType === 'customer'} onChange={() => setFormData({...formData, vendorType: 'customer', vendorId: '', vendorName: 'ALL CUSTOMERS'})} className="w-3 h-3 accent-[#0285fd]" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-[#0285fd]">Customer</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input type="radio" name="vType" checked={formData.vendorType === 'supplier'} onChange={() => setFormData({...formData, vendorType: 'supplier', vendorId: '', vendorName: 'ALL SUPPLIERS'})} className="w-3 h-3 accent-[#e49e1b]" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-[#e49e1b]">Supplier</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex h-9 gap-1.5">
                                    <div className="flex-1 h-9 border border-gray-300 bg-white rounded-[3px] px-3 flex items-center justify-between group cursor-pointer hover:border-[#0285fd] transition-all shadow-sm" onClick={() => setShowVendorModal(true)}>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {formData.vendorId && <span className="text-[10px] font-black text-[#0285fd] shrink-0">{formData.vendorId}</span>}
                                            <span className="text-[12.5px] font-bold text-slate-700 truncate">{formData.vendorName}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#0285fd] transition-colors shrink-0" />
                                    </div>
                                    <button onClick={() => setShowVendorModal(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Document Meta */}
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <Hash size={12} className="text-[#0285fd]" /> Document No
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.docNo}
                                    onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                                    placeholder="Prefix or ID..."
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold focus:border-[#0285fd] transition-all shadow-sm"
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <CreditCard size={12} className="text-[#0285fd]" /> Cheque No
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.chequeNo}
                                    onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                                    placeholder="Serial Search..."
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold focus:border-[#0285fd] transition-all shadow-sm"
                                />
                            </div>

                            <div className="col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <Banknote size={12} className="text-[#0285fd]" /> Amount
                                </label>
                                <input 
                                    type="number" 
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Exact..."
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-bold focus:border-[#0285fd] transition-all shadow-sm"
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Cost Center</label>
                                <select 
                                    value={formData.costCenter}
                                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-bold focus:border-[#0285fd] transition-all"
                                >
                                    <option value="">ALL COST CENTERS</option>
                                    {lookups.costCenters.map(cc => (
                                        <option key={cc.code} value={cc.code}>{cc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-5 items-end pt-1">
                            {/* Date Matrix */}
                            <div className="col-span-5 flex items-end gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <div className="flex flex-col gap-2 shrink-0 pr-3 border-r border-slate-200">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Filter</label>
                                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, useDate: !formData.useDate})}>
                                        <input type="checkbox" checked={formData.useDate} readOnly className="w-3.5 h-3.5 accent-[#0285fd] cursor-pointer" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Enable Period</span>
                                    </div>
                                </div>
                                
                                <div className={`flex-1 space-y-1.5 transition-opacity ${!formData.useDate ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">From</label>
                                    <div className="flex h-9 gap-1">
                                        <input readOnly value={formData.dateFrom} className="flex-1 px-3 text-[12px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm" />
                                        <button onClick={() => setShowCalendarFrom(true)} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90"><Calendar size={14} /></button>
                                    </div>
                                </div>

                                <div className={`flex-1 space-y-1.5 transition-opacity ${!formData.useDate ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">To</label>
                                    <div className="flex h-9 gap-1">
                                        <input readOnly value={formData.dateTo} className="flex-1 px-3 text-[12px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm" />
                                        <button onClick={() => setShowCalendarTo(true)} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90"><Calendar size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Payee Context (Specific to PTC) */}
                            <div className="col-span-3 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <User size={12} className="text-[#0285fd]" /> Payee Filter
                                </label>
                                <select 
                                    value={formData.payee}
                                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                                    className="w-full h-9 px-3 text-[12.5px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-bold focus:border-[#0285fd] transition-all"
                                >
                                    <option value="">ALL PAYEES</option>
                                    {lookups.payees.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="col-span-4 flex gap-3 h-9">
                                <button onClick={handleReset} className="flex-1 h-9 bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-[3px] hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <RotateCcw size={15} /> RESET
                                </button>
                                <button onClick={runSearch} disabled={loading} className={`flex-[2] h-9 bg-[#2bb744] text-white text-[11px] font-black uppercase tracking-widest rounded-[3px] hover:bg-[#259b3a] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} fill="currentColor" />}
                                    EXECUTE SEARCH
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Result Matrix */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest opacity-80">Discovery Results Stream</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{searchResults.length} Records Found</span>
                        </div>

                        <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden">
                            <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-500 font-black uppercase text-[10.5px] tracking-widest z-10 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 border-r border-gray-100 w-28">Date</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-40">Document ID</th>
                                            <th className="px-5 py-3 border-r border-gray-100 min-w-[200px]">Context Entity</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-44">Reference/Inv No</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-44">Account Stratum</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-32">Cheque No</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-28">Chq Date</th>
                                            <th className="px-5 py-3 border-r border-gray-100 min-w-[150px]">Memo</th>
                                            <th className="px-5 py-3 w-36 text-right">Amount (LKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {searchResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] font-mono font-bold text-slate-500">{row.date}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12.5px] font-black text-[#0285fd] font-mono">{row.docNo}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12.5px] font-bold text-slate-700 uppercase">{row.name}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] font-bold text-slate-500">{row.invNo}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] font-bold text-slate-600">{row.accName}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] font-mono font-bold text-slate-700">{row.chqNo}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[11px] font-bold text-slate-400">{row.chqDate}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] text-slate-500 italic truncate max-w-[200px] block">{row.memo}</span>
                                                </td>
                                                <td className="px-5 py-2.5 text-right font-mono font-black text-[13.5px] text-slate-800 tabular-nums">
                                                    {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        {Array.from({ length: Math.max(0, 10 - searchResults.length) }).map((_, i) => (
                                            <tr key={`filler-${i}`} className="h-10">
                                                <td colSpan={9}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Entity Search Modal */}
            {showVendorModal && (
                <SimpleModal 
                    isOpen={showVendorModal} 
                    onClose={() => setShowVendorModal(false)} 
                    title={`${formData.vendorType === 'customer' ? 'Customer' : 'Supplier'} Discovery Portal - ${vendors.length} Matched`} 
                    maxWidth="max-w-3xl"
                >
                    <div className="flex flex-col h-full font-['Tahoma']">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Context Search</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filter by ID or Nomenclature..." 
                                className="h-10 border border-gray-300 px-4 text-sm rounded-md w-96 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={vendorSearch} 
                                onChange={(e) => setVendorSearch(e.target.value)} 
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                    <tr>
                                        <th className="px-6 border-b text-center">Identity</th>
                                        <th className="px-6 border-b">Nomenclature</th>
                                        <th className="px-6 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr onClick={() => { setFormData({ ...formData, vendorId: '', vendorName: 'ALL CONTEXTS' }); setShowVendorModal(false); }} className="bg-blue-50/30 hover:bg-blue-100/50 transition-colors cursor-pointer font-black italic">
                                        <td className="p-3 text-center text-blue-600">ALL</td>
                                        <td className="p-3 text-blue-600 uppercase">Universal Context Search</td>
                                        <td className="p-3 text-center">
                                            <button className="bg-blue-600 text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                    {vendors.filter(v => 
                                        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
                                        v.code.toLowerCase().includes(vendorSearch.toLowerCase())
                                    ).map(v => (
                                        <tr key={v.code} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                            <td className="p-3 text-center font-mono font-bold text-gray-700">{v.code}</td>
                                            <td className="p-3 font-medium font-mono uppercase text-gray-700">{v.name}</td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => {
                                                        setFormData({ ...formData, vendorId: v.code, vendorName: v.name });
                                                        setShowVendorModal(false);
                                                    }} 
                                                    className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase"
                                                >
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>
            )}

            <CalendarModal 
                isOpen={showCalendarFrom} 
                onClose={() => setShowCalendarFrom(false)} 
                onDateSelect={(date) => setFormData({ ...formData, dateFrom: date })}
                initialDate={formData.dateFrom}
            />
            <CalendarModal 
                isOpen={showCalendarTo} 
                onClose={() => setShowCalendarTo(false)} 
                onDateSelect={(date) => setFormData({ ...formData, dateTo: date })}
                initialDate={formData.dateTo}
            />
        </>
    );
};

export default DocumentSearchBoard;
