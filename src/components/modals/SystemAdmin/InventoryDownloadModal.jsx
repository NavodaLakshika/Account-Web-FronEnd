import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    Download,
    Calendar as CalendarIcon,
    RefreshCw,
    Database,
    ShieldCheck,
    X,
    Search,
    Filter,
    ChevronDown,
    Building2,
    MapPin,
    CheckCircle,
    RotateCcw,
    LogOut,
    Plus,
    Table as TableIcon,
    Save,
    Trash2
} from 'lucide-react';
import { inventoryDownloadService } from '../../../services/inventoryDownload.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';
import CalendarModal from '../../CalendarModal';

const LookupSearchModal = ({ isOpen, onClose, onSelect, title, data, searchPlaceholder, idLabel, nameLabel, searchTitle }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        return data.filter(item => 
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={title.toUpperCase()}
            maxWidth="max-w-2xl"
            showHeaderClose={true}
        >
            <div className="p-2 space-y-6 font-['Tahoma']">
                {/* Global Search Container */}
                <div className="bg-slate-50/80 p-5 rounded-xl border border-gray-100 flex items-center gap-6 shadow-sm">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] shrink-0">{searchTitle || 'Global Search'}</label>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0285fd] focus:ring-4 focus:ring-blue-50 transition-all text-[13px] font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-lg bg-white">
                    <div className="bg-slate-50/80 px-6 py-2.5 flex items-center gap-4 border-b border-gray-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">{idLabel}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">{nameLabel}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Select</span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar custom-scrollbar divide-y divide-gray-50">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div
                                    key={item.code}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all border-b border-gray-50 last:border-0 group"
                                >
                                    <span className="text-[13px] font-mono font-bold text-slate-500 w-40">{item.code}</span>
                                    <span className="text-[13px] font-bold text-slate-700 flex-1 uppercase truncate">{item.name}</span>
                                    <div className="w-32 flex justify-center shrink-0">
                                        <button
                                            onClick={() => {
                                                onSelect(item);
                                                onClose();
                                            }}
                                            className="px-5 h-8 bg-[#0285fd] text-white text-[10px] font-black rounded-[5px] flex items-center gap-2 shadow-sm hover:bg-[#0073ff] transition-all active:scale-95 uppercase tracking-widest"
                                        >
                                            <CheckCircle size={12} /> SELECT
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-slate-400 opacity-40 italic">
                                <Filter size={48} className="mb-3" />
                                <span className="text-[14px] font-black uppercase tracking-[0.3em] text-center">No Data Found</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">
                    <span>Total Records: {data.length}</span>
                    <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Secure Data Stream Active</span>
                </div>
            </div>
        </SimpleModal>
    );
};

const InventoryDownloadModal = ({ isOpen, onClose }) => {
    // Standard Master Data
    const [locations, setLocations] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    
    // Form State
    const [selectedLocation, setSelectedLocation] = useState({ code: '', name: '' });
    const [selectedCostCenter, setSelectedCostCenter] = useState({ code: '', name: '' });
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Transaction Type');
    const [selectAll, setSelectAll] = useState(false);
    
    // Grid & Totals
    const [items, setItems] = useState([]);
    const [totals, setTotals] = useState({ amount: 0, transfer: 0, balance: 0 });
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('SYSTEM READY');
    const [activePicker, setActivePicker] = useState(null); 
    const [showCalendar, setShowCalendar] = useState(false);
    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [showCostCenterSearch, setShowCostCenterSearch] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            setLoading(true);
            const [locResp, ccResp] = await Promise.all([
                inventoryDownloadService.getLocations(),
                inventoryDownloadService.getCostCenters()
            ]);
            
            setLocations(locResp.data);
            setCostCenters(ccResp.data);
            
            if (locResp.data.length > 0) setSelectedLocation(locResp.data[0]);
            if (ccResp.data.length > 0) setSelectedCostCenter(ccResp.data[0]);
        } catch (error) {
            showErrorToast('Failed to load master data.');
        } finally {
            setLoading(false);
        }
    };

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed font-['Tahoma']">{message}</h3>
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
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed font-['Tahoma']">{message}</h3>
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

    const handleSave = async () => {
        setLoading(true);
        setStatusMessage('SAVING DATA...');
        try {
            const session = getSessionData();
            const requestData = {
                userName: session.userName,
                compCode: session.companyCode,
                locationCode: selectedLocation.code,
                dateFrom: formatDate(dateFrom),
                dateTo: formatDate(dateTo)
            };
            
            const resp = await inventoryDownloadService.downloadPurchase(requestData);
            showSuccessToast(resp.data.message);
            setStatusMessage('SUCCESSFUL');
            setTimeout(() => setStatusMessage('READY'), 3000);
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Process failed.');
            setStatusMessage('ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setItems([]);
        setTotals({ amount: 0, transfer: 0, balance: 0 });
        setSelectAll(false);
        setStatusMessage('CLEARED');
        setTimeout(() => setStatusMessage('READY'), 2000);
    };

    const formatDate = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const openCalendar = (picker) => {
        setActivePicker(picker);
        setShowCalendar(true);
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Inventory Data Download"
                maxWidth="max-w-[1000px]"
                showHeaderClose={true}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl font-['Tahoma']">
                        <div className="flex gap-3">
                            <button
                                onClick={handleClear}
                                className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR 
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50"
                            >
                        <CheckCircle size={14} /> SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col space-y-4 font-['Tahoma'] relative min-h-[550px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-lg animate-in fade-in duration-300">
                            <div className="w-24 h-24">
                                <DotLottiePlayer src="/lottiefile/Loading animation blue.lottie" autoplay loop />
                            </div>
                            <span className="text-[11px] font-black text-[#00adff] uppercase tracking-[0.2em] animate-pulse -mt-4">
                                {statusMessage}
                            </span>
                        </div>
                    )}

                    {/* Tab Header - Styled like PO Board section headers */}
                    <div className="flex items-center gap-1 border-b border-gray-200 px-1">
                        <button 
                            className={`px-5 py-2.5 text-[12px] font-bold flex items-center gap-2 border-t border-x rounded-t-lg transition-all ${activeTab === 'Transaction Type' ? 'bg-white border-gray-200 text-[#0285fd] shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setActiveTab('Transaction Type')}
                        >
                            Transaction Type <ChevronDown size={14} />
                        </button>
                        <button 
                            className={`px-5 py-2.5 text-[12px] font-bold border-t border-x rounded-t-lg transition-all ${activeTab === 'Click Here' ? 'bg-white border-gray-200 text-[#0285fd] shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setActiveTab('Click Here')}
                        >
                            Reconcile Staging
                        </button>
                    </div>

                    {/* Filters Section - Mirroring PO Board Container Styles */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            
                            {/* Date From - Column 1 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date From</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={dateFrom}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm focus:border-[#0285fd]"
                                        onClick={() => openCalendar('from')}
                                    />
                                    <button onClick={() => openCalendar('from')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <CalendarIcon size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Date To - Column 2 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date To</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={dateTo}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm focus:border-[#0285fd]"
                                        onClick={() => openCalendar('to')}
                                    />
                                    <button onClick={() => openCalendar('to')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <CalendarIcon size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Location - Column 3 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Location</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedLocation.code ? `${selectedLocation.code} - ${selectedLocation.name}` : ''}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer truncate"
                                        onClick={() => setShowLocationSearch(true)}
                                    />
                                    <button onClick={() => setShowLocationSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Secondary Location/Detail Row */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Sub Branch</label>
                                <div className="flex-1 h-8 border border-gray-300 rounded-[5px] bg-slate-50 flex items-center px-3 cursor-not-allowed">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase ">Primary sync source active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Grid Area - Mirroring PO Board Table Styles */}
                    <div className="flex-1 border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[300px] overflow-hidden">
                        {/* Table header */}
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                            <div className="w-12 py-2.5 text-center border-r border-gray-100">#</div>
                            <div className="w-36 py-2.5 px-4 border-r border-gray-100">Document No</div>
                            <div className="w-32 py-2.5 px-4 border-r border-gray-100">Sync Date</div>
                            <div className="flex-1 py-2.5 px-4 border-r border-gray-100">Transactional Description</div>
                            <div className="w-40 py-2.5 px-4 text-right">Settled Amount</div>
                        </div>
                        
                        <div className="flex-1 bg-white relative overflow-y-auto no-scrollbar custom-scrollbar" 
                             style={{ backgroundImage: 'repeating-linear-gradient(#fff, #fff 31px, #f8fafc 31px, #f8fafc 32px)', backgroundSize: '100% 32px' }}>
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest gap-2 opacity-50 mt-28">
                                    No records pending for synchronization
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="flex border-b border-gray-100 h-8 items-center text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 transition-colors group">
                                        <div className="w-12 text-center text-slate-400 font-mono border-r border-gray-50">{idx + 1}</div>
                                        {/* Grid cells would go here */}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bottom Details Panel - Mirroring PO Board Totals/Sub-alignments */}
                    <div className="space-y-4 pt-1">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="selectAll"
                                checked={selectAll}
                                onChange={(e) => setSelectAll(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd] transition-all cursor-pointer" 
                            />
                            <label htmlFor="selectAll" className="text-[12px] font-bold text-slate-600 uppercase cursor-pointer select-none">Global Selection Toggle</label>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 items-end bg-slate-50/30 p-3 rounded-lg border border-gray-50">
                            {/* Cost Center */}
                            <div className="col-span-4 flex flex-col gap-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cost Center Allocation</label>
                                <div className="flex gap-1 h-8">
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedCostCenter.code ? `${selectedCostCenter.code} - ${selectedCostCenter.name}` : ''}
                                        className="flex-1 border border-gray-300 rounded-[5px] px-3 text-[12px] font-bold text-red-600 bg-gray-50 outline-none shadow-sm cursor-pointer truncate"
                                        onClick={() => setShowCostCenterSearch(true)}
                                    />
                                    <button onClick={() => setShowCostCenterSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-3 flex flex-col gap-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Volume</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    value={totals.amount.toFixed(2)}
                                    className="h-8 border border-gray-300 rounded-[5px] bg-white px-3 text-right text-[13px] font-mono font-bold text-slate-900 shadow-inner"
                                />
                            </div>

                            {/* Transfer Amount */}
                            <div className="col-span-3 flex flex-col gap-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Applied Offset</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    value={totals.transfer.toFixed(2)}
                                    className="h-8 border border-gray-300 rounded-[5px] bg-white px-3 text-right text-[13px] font-mono font-bold text-slate-900 shadow-inner"
                                />
                            </div>

                            {/* Balance */}
                            <div className="col-span-2 flex flex-col gap-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Net Balance</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    value={totals.balance.toFixed(2)}
                                    className="h-8 border border-gray-300 rounded-[5px] bg-white px-3 text-right text-[13px] font-mono font-bold text-[#2bb744] shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Utility Bar */}
                    <div className="flex items-center justify-between px-2 pt-2 text-[11px] font-bold text-slate-400 border-t border-gray-100 select-none">
                        <div className="flex items-center gap-6">
                            <span className="uppercase tracking-widest">System Load: <span className="text-[#0285fd]">STABLE</span></span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="uppercase tracking-tighter">Live Connection Verified</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 italic opacity-50">
                            <span>SESSION ID: {getSessionData().userName?.toUpperCase()}</span>
                            <span>VERSION 2.0.4</span>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Sub Modals */}
            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => { 
                    if (activePicker === 'from') setDateFrom(date);
                    else setDateTo(date);
                    setShowCalendar(false); 
                }}
                initialDate={activePicker === 'from' ? dateFrom : dateTo}
            />

            <LookupSearchModal 
                isOpen={showLocationSearch}
                onClose={() => setShowLocationSearch(false)}
                onSelect={setSelectedLocation}
                title="Location Lookup"
                data={locations}
                searchPlaceholder="Filter by location name or id..."
                idLabel="REFERENCE ID"
                nameLabel="Location Name"
                searchTitle="Global Location Search"
            />

            <LookupSearchModal 
                isOpen={showCostCenterSearch}
                onClose={() => setShowCostCenterSearch(false)}
                onSelect={setSelectedCostCenter}
                title="Cost Center Lookup"
                data={costCenters}
                searchPlaceholder="Filter by cost center name or id..."
                idLabel="REFERENCE ID"
                nameLabel="Cost Center Description"
                searchTitle="Global Cost Center Search"
            />
        </>
    );
};

export default InventoryDownloadModal;
