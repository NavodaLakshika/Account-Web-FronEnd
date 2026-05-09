import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, CheckSquare, Square, Filter, Banknote, ListChecks, CheckCircle2, ChevronRight, CornerDownRight, CheckCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../utils/session';

const SearchModal = ({ isOpen, onClose, title, items, onSelect }) => {
    const [q, setQ] = useState('');
    if (!isOpen) return null;
    const filtered = (items || []).filter(i => (i.name || '').toLowerCase().includes(q.toLowerCase()) || (i.code || '').toLowerCase().includes(q.toLowerCase()));
    
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-[550px]"
        >
            <div className="space-y-4 font-['Tahoma']">
                {/* Search Facility */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input 
                            autoFocus 
                            value={q} 
                            onChange={e => setQ(e.target.value)} 
                            placeholder="" 
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                        />
                    </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Credential / Title Detail</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((item, i) => (
                                    <tr key={i} onClick={() => { onSelect(item); onClose(); }} className="group hover:bg-blue-50/50 cursor-pointer transition-colors">
                                        <td className="px-5 py-3 font-mono text-[12px] font-mono text-blue-600 font-bold">{item.code || 'N/A'}</td>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors font-bold">{item.name}</td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 opacity-30">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={32} className="text-gray-400" />
                                                <span className="text-[11px] font-bold uppercase tracking-widest">No matching registry entries</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const CollectionToDepositBoard = ({ isOpen, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ costCenters: [], paymentModes: [], customers: [], departments: [] });

    const { companyCode, userName } = getSessionData();

    const [formData, setFormData] = useState({
        docNo: '',
        costCenter: '',
        costCenterName: '',
        dateFrom: new Date().toLocaleDateString('en-GB'), 
        dateTo: new Date().toLocaleDateString('en-GB'),
        paymentMode: '',
        customerReceipt: false,
        customerId: '',
        customerName: '',
        department: '',
        departmentName: '',
        company: companyCode,
        createUser: userName
    });

    const [collections, setCollections] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
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
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
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

    useEffect(() => {
        if (isOpen) {
            const { companyCode: comp, userName: user } = getSessionData();
            setFormData(prev => ({
                ...prev,
                company: comp,
                createUser: user
            }));
            loadInitialData(comp);
        }
    }, [isOpen]);

    const loadInitialData = async (comp) => {
        try {
            setLoading(true);
            const activeComp = comp || companyCode;
            const lookupRes = await bankingService.getCollectionLookups(activeComp);
            setLookups(lookupRes);
            generateDocNo(activeComp);
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const generateDocNo = async (comp) => {
        try {
            const activeComp = comp || companyCode;
            const docRes = await bankingService.generateDocNo('MDPO', activeComp);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (e) {}
    };

    const handleFetchCollections = async () => {
        if (!formData.docNo) return showErrorToast("Document Number is required.");
        try {
            setLoading(true);
            const data = await bankingService.getCollections({ ...formData, company: companyCode });
            setCollections(data);
            setSelectedIds([]);
        } catch (error) {
            showErrorToast("Failed to fetch collections records");
        } finally {
            setLoading(false);
        }
    };


    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === collections.length ? [] : collections.map(c => c.documentNo));
    };

    const totalToDeposit = collections
        .filter(c => selectedIds.includes(c.documentNo))
        .reduce((sum, c) => sum + (c.balance || 0), 0);

    const handleSave = async () => {
        if (selectedIds.length === 0) return showErrorToast("Please select at least one record to deposit.");
        try {
            setLoading(true);
            const selectedItems = collections.filter(c => selectedIds.includes(c.documentNo));
            const result = await bankingService.saveDeposit({ ...formData, items: selectedItems });
            showSuccessToast('Funds successfully moved to deposit state!');
            if (onComplete) onComplete({ items: result.items, totalBalance: result.totalBalance, sourceDocNo: formData.docNo });
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            costCenter: '', costCenterName: '', paymentMode: '', customerReceipt: false,
            customerId: '', customerName: '', department: '', departmentName: '',
            dateFrom: new Date().toLocaleDateString('en-GB'),
            dateTo: new Date().toLocaleDateString('en-GB'),
        }));
        setCollections([]);
        setSelectedIds([]);
        generateDocNo();
    };

    const handleDateSelect = (formattedDate) => {
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
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
                title="Collection to Deposit Selection"
                maxWidth="max-w-[1150px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <button 
                            onClick={handleClear} 
                            className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all flex items-center gap-2 border-none active:scale-95 shadow-md"
                        >
                            <RotateCcw size={14} /> CLEAR 
                        </button>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleSave} 
                                disabled={loading || selectedIds.length === 0} 
                                className={`px-8 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all flex items-center gap-2 active:scale-95 border-none ${loading || selectedIds.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} CONFIRM 
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma'] overflow-y-auto no-scrollbar">
                    
                    {/* Header Controls Grid */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Column 1 */}
                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Document ID</label>
                                <div className="flex-1 h-8 bg-white border border-gray-300 rounded-[5px] px-3 flex items-center shadow-sm">
                                    <span className="text-[12px] font-bold text-blue-600 font-mono uppercase">{formData.docNo}</span>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date From</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.dateFrom} 
                                        onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }} 
                                        className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" 
                                    />
                                    <button onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date To</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.dateTo} 
                                        onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }} 
                                        className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" 
                                    />
                                    <button onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-12 lg:col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.costCenterName || ''} 
                                        onClick={() => setActiveModal('costCenter')} 
                                        className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" 
                                    />
                                    <button onClick={() => setActiveModal('costCenter')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.paymentMode || ''} 
                                        onClick={() => setActiveModal('paymentMode')} 
                                        className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" 
                                    />
                                    <button onClick={() => setActiveModal('paymentMode')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-12 lg:col-span-8 flex items-center gap-2">
                                <div className="w-24 shrink-0 flex items-center gap-2">
                                    <input type="checkbox" id="chkCustomer" checked={formData.customerReceipt} onChange={e => setFormData({...formData, customerReceipt: e.target.checked})} className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                                    <label htmlFor="chkCustomer" className="text-[12.5px] font-bold text-gray-700 cursor-pointer">Customer</label>
                                </div>
                                <div className={`flex-1 flex gap-1 h-8 min-w-0 ${!formData.customerReceipt ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                                    <input type="text" readOnly value={formData.customerName || ''} onClick={() => setActiveModal('customer')} className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" />
                                    <button onClick={() => setActiveModal('customer')} className="w-10 h-8 bg-gray-200 text-gray-400 flex items-center justify-center rounded-[5px] shadow-sm shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Dept Unit</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.departmentName || ''} onClick={() => setActiveModal('dept')} className="flex-1 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-gray-700 outline-none focus:border-[#0285fd] bg-white cursor-pointer shadow-sm" />
                                    <button onClick={() => setActiveModal('dept')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] shadow-md hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Actions & Checkbox Bar */}
                            <div className="col-span-12 flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-[5px] border-2 border-blue-100 cursor-pointer hover:bg-blue-50 transition-all shadow-sm group"
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${collections.length > 0 && selectedIds.length === collections.length ? 'bg-[#0285fd] border-[#0285fd]' : 'border-gray-300'}`}>
                                            {(collections.length > 0 && selectedIds.length === collections.length) && <CheckSquare size={12} className="text-white" />}
                                        </div>
                                        <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Select All</span>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-400 ">
                                        * Use filters above to narrow down the collection queue
                                    </div>
                                </div>
                                <button 
                                    onClick={handleFetchCollections} 
                                    disabled={loading} 
                                    className="h-9 px-8 bg-[#0285fd] text-white text-[11px] font-black uppercase tracking-widest rounded-[5px] shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95 border-none"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />} Load Records
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Collection Queue Table */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[300px] overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center sticky top-0 z-10">
                            <div className="w-14 py-2.5 px-3 border-r border-gray-100 text-center">Sel</div>
                            <div className="flex-1 py-2.5 px-4 border-r border-gray-100">Document Trace ID</div>
                            <div className="w-32 py-2.5 px-4 border-r border-gray-100 text-center">Post Date</div>
                            <div className="w-24 py-2.5 px-4 border-r border-gray-100 text-center">Origin</div>
                            <div className="flex-1 py-2.5 px-4 border-r border-gray-100">Client / Payer Reference</div>
                            <div className="w-36 py-2.5 px-4 border-r border-gray-100 text-right">Ledger Value</div>
                            <div className="w-36 py-2.5 px-4 text-right bg-blue-50/30 text-blue-600">Liquidity Bal</div>
                        </div>
                        <div className="flex-1 bg-white overflow-y-auto max-h-[350px] divide-y divide-gray-50">
                            {collections.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-300 gap-4">
                                    <Landmark size={48} className="opacity-20" />
                                    <div className="text-[11px] font-bold uppercase tracking-widest">Pending collection queue is empty</div>
                                </div>
                            ) : collections.map((c) => (
                                <div 
                                    key={c.documentNo} 
                                    onClick={() => toggleSelect(c.documentNo)} 
                                    className={`flex border-b border-gray-100 text-[11px] font-bold hover:bg-blue-50 transition-colors cursor-pointer group ${selectedIds.includes(c.documentNo) ? 'bg-blue-50/80 border-l-[3px] border-[#0285fd]' : 'text-slate-700'}`}
                                >
                                    <div className="w-14 py-2 px-3 border-r border-gray-100 flex items-center justify-center">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${selectedIds.includes(c.documentNo) ? 'bg-[#2bb744] border-[#2bb744] text-white' : 'border-gray-200 bg-white'}`}>
                                            {selectedIds.includes(c.documentNo) && <CheckCircle size={10} strokeWidth={4} />}
                                        </div>
                                    </div>
                                    <div className="flex-1 py-2 px-4 border-r border-gray-100 text-blue-600 font-mono flex items-center gap-2 font-bold">
                                        <CornerDownRight size={12} className="text-gray-300" />
                                        {c.documentNo}
                                    </div>
                                    <div className="w-32 py-2 px-4 border-r border-gray-100 text-center text-slate-500 font-mono font-bold">{c.date}</div>
                                    <div className="w-24 py-2 px-4 border-r border-gray-100 text-center flex justify-center">
                                        <span className="px-1.5 py-0.5 rounded-[3px] bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest">{c.type}</span>
                                    </div>
                                    <div className="flex-1 py-2 px-4 border-r border-gray-100 truncate italic text-slate-500 group-hover:text-slate-800 transition-colors font-bold">{c.name || 'INTERNAL RECONCILIATION'}</div>
                                    <div className="w-36 py-2 px-4 border-r border-gray-100 text-right text-gray-400 font-mono font-bold">{c.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div className="w-36 py-2 px-4 text-right font-black text-slate-900 group-hover:text-blue-700 transition-colors font-mono">{c.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Total Box */}
                    <div className="flex justify-end pt-2">
                        <div className="w-[350px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[12.5px] font-bold text-gray-500 uppercase tracking-tight">Selected Entities</span>
                                <div className="text-[14px] font-mono font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-[4px]">
                                    {selectedIds.length} <span className="text-gray-300 font-normal ml-1 text-[10px]">RECORDS</span>
                                </div>
                            </div>
                            <div className="h-[1px] bg-gray-100" />
                            <div className="bg-slate-50 p-3 rounded-md flex flex-col gap-0.5">
                                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Aggregate Liquidity Value</span>
                                <div className="text-[22px] font-mono font-black text-blue-700 tracking-tighter leading-none">
                                    {totalToDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Redesigned SearchModal */}
            <SearchModal 
                isOpen={activeModal !== null} 
                onClose={() => setActiveModal(null)} 
                title={
                    activeModal === 'costCenter' ? 'Cost Center Registry Lookup' : 
                    activeModal === 'paymentMode' ? 'Payment Method Directory' : 
                    activeModal === 'customer' ? 'Client / Customer Master' : 
                    'Departmental Unit Directory'
                }
                items={activeModal === 'costCenter' ? lookups.costCenters : activeModal === 'paymentMode' ? lookups.paymentModes : activeModal === 'customer' ? lookups.customers : lookups.departments}
                onSelect={(item) => {
                    if (activeModal === 'costCenter') setFormData({...formData, costCenter: item.code, costCenterName: item.name});
                    if (activeModal === 'paymentMode') setFormData({...formData, paymentMode: item.name});
                    if (activeModal === 'customer') setFormData({...formData, customerId: item.code, customerName: item.name});
                    if (activeModal === 'dept') setFormData({...formData, department: item.code, departmentName: item.name});
                }}
            />

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={handleDateSelect} initialDate={formData[datePickerField]} />
        </>
    );
};

export default CollectionToDepositBoard;
