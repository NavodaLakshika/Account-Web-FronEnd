import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Download, RotateCcw, Search, Calendar, Database, Filter, Loader2 } from 'lucide-react';
import { inventoryDownloadService } from '../services/inventoryDownload.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SearchableSelect from '../components/SearchableSelect';


const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
        (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className="w-32 px-5 py-3">Identifier</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records discovered</td></tr>
                                ) : filtered.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { onSelect(item); onClose(); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.name}</td>
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
    );
};

const InventoryDownloadBoard = ({ isOpen, onClose }) => {
    const [locations, setLocations] = useState([]);
    const [costCenters, setCostCenters] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState({ code: '', name: '' });
    const [selectedCostCenter, setSelectedCostCenter] = useState({ code: '', name: '' });
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('Transaction Type');

    const [items, setItems] = useState([]);
    const [totals, setTotals] = useState({ amount: 0, transfer: 0, balance: 0 });
    const [selectAll, setSelectAll] = useState(false);

    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [activePicker, setActivePicker] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

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

    const handleDownload = async () => {
        setLoading(true);
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
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Download failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setItems([]);
        setTotals({ amount: 0, transfer: 0, balance: 0 });
        setSelectAll(false);
    };

    const formatDate = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Inventory Download" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Inventory Data Download"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleDownload} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            Download Data
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Tab Buttons */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => setActiveTab('Transaction Type')}
                            className={`px-5 py-2.5 text-[12px] font-bold border-t border-x rounded-t-lg transition-all ${activeTab === 'Transaction Type' ? 'bg-white border-gray-200 text-[#0285fd] shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'}`}>
                            Transaction Type
                        </button>
                        <button onClick={() => setActiveTab('Click Here')}
                            className={`px-5 py-2.5 text-[12px] font-bold border-t border-x rounded-t-lg transition-all ${activeTab === 'Click Here' ? 'bg-white border-gray-200 text-[#0285fd] shadow-[0_-2px_5px_rgba(0,0,0,0.02)]' : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-600'}`}>
                            Reconcile Staging
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <Filter size={14} className="text-[#0285fd]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date From</label>
                                <div className="relative">
                                    <input type="text" readOnly value={dateFrom}
                                        onClick={() => { setActivePicker('from'); setShowCalendar(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setActivePicker('from'); setShowCalendar(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date To</label>
                                <div className="relative">
                                    <input type="text" readOnly value={dateTo}
                                        onClick={() => { setActivePicker('to'); setShowCalendar(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => { setActivePicker('to'); setShowCalendar(true); }}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Location</label>
                                <div className="relative">
                                    <select
                                        value={selectedLocation.code}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (locations || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = setSelectedLocation;
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(locations || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sub Branch</label>
                                <div className="w-full h-10 border border-gray-200 rounded-[3px] bg-gray-50 flex items-center px-3 text-[12px] text-gray-400 italic">Auto-detected</div>
                            </div>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden flex flex-col h-[250px]">
                        <div className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 border-b border-slate-200 flex shrink-0">
                            <div className="w-12 text-center border-r border-slate-200">#</div>
                            <div className="flex-1 px-4 border-r border-slate-200">Document No</div>
                            <div className="w-36 px-4 border-r border-slate-200">Sync Date</div>
                            <div className="flex-1 px-4 border-r border-slate-200">Description</div>
                            <div className="w-36 px-4 text-right border-r border-slate-200">Settled Amount</div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar"
                            style={{ backgroundImage: 'repeating-linear-gradient(#fff, #fff 31px, #f8fafc 31px, #f8fafc 32px)', backgroundSize: '100% 32px' }}>
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 text-[10px] font-bold uppercase tracking-widest gap-2 opacity-50">
                                    <Database size={32} className="opacity-30" />
                                    No records pending for synchronization
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="flex h-8 items-center text-[11px] font-bold text-slate-700 border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <div className="w-12 text-center text-slate-400 font-mono shrink-0 border-r border-gray-50">{idx + 1}</div>
                                        <div className="flex-1 px-4 truncate border-r border-gray-50">{item.docNo || '-'}</div>
                                        <div className="w-36 px-4 truncate border-r border-gray-50">{item.date || '-'}</div>
                                        <div className="flex-1 px-4 truncate border-r border-gray-50">{item.desc || '-'}</div>
                                        <div className="w-36 px-4 text-right font-mono">{item.amount || '0.00'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bottom Details */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="selectAll" checked={selectAll}
                                onChange={(e) => setSelectAll(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd] transition-all cursor-pointer" />
                            <label htmlFor="selectAll" className="text-[12px] font-bold text-slate-600 uppercase cursor-pointer select-none">Global Selection Toggle</label>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center Allocation</label>
                                <div className="relative">
                                    <select
                                        value={selectedCostCenter.code}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (costCenters || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = setSelectedCostCenter;
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(costCenters || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Volume</label>
                                <div className="h-10 border border-gray-300 rounded-[3px] bg-white px-3 flex items-center text-right text-[13px] font-mono font-bold text-gray-800">{totals.amount.toFixed(2)}</div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Applied Offset</label>
                                <div className="h-10 border border-gray-300 rounded-[3px] bg-white px-3 flex items-center text-right text-[13px] font-mono font-bold text-gray-800">{totals.transfer.toFixed(2)}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Net Balance</label>
                                <div className="h-10 border border-gray-300 rounded-[3px] bg-white px-3 flex items-center text-right text-[13px] font-mono font-bold text-[#0285fd]">{totals.balance.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'location'}
                onClose={() => setActiveModal(null)}
                title="Location Lookup"
                items={locations}
                onSelect={setSelectedLocation}
                searchPlaceholder="Filter by location name..."
            />

            <SearchModal
                isOpen={activeModal === 'costCenter'}
                onClose={() => setActiveModal(null)}
                title="Cost Center Lookup"
                items={costCenters}
                onSelect={setSelectedCostCenter}
                searchPlaceholder="Filter by cost center name..."
            />

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
        </>
    );
};

export default InventoryDownloadBoard;
