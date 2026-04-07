import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Database, User, Truck, Hash, FileSearch, Trash2, RotateCcw, Download, X, Loader2, ListFilter, LayoutGrid, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SearchBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [entityType, setEntityType] = useState('Customer');
    const [formData, setFormData] = useState({
        streamCode: 'CS01',
        streamName: 'Commercial Sale',
        docId: '',
        entityCode: 'S-001',
        entityName: 'CASH SALES REVENUE',
        valuation: 0,
        unitCode: 'GLB',
        unitName: 'GLOBAL REPOSITORY',
        startDate: '2026-01-01',
        endDate: new Date().toISOString().split('T')[0]
    });

    // Modal States
    const [modalConfig, setModalConfig] = useState({ show: false, title: '', type: '', search: '' });
    const [showCalendarStart, setShowCalendarStart] = useState(false);
    const [showCalendarEnd, setShowCalendarEnd] = useState(false);

    // Dummy Data
    const streams = [
        { code: 'CS01', name: 'Commercial Sale' },
        { code: 'PP02', name: 'Procurement / Purchase' },
        { code: 'JE03', name: 'General Journal Entries' }
    ];
    const entities = [
        { code: 'C001', name: 'ABC Corporates' },
        { code: 'S-001', name: 'CASH SALES REVENUE' },
        { code: 'V999', name: 'Internal Vendor Ops' }
    ];
    const units = [
        { code: 'GLB', name: 'GLOBAL REPOSITORY' },
        { code: 'HQ', name: 'HEADQUARTERS' },
        { code: 'BR-1', name: 'SOUTHERN BRANCH' }
    ];

    const openModal = (type, title) => {
        setModalConfig({ show: true, title, type, search: '' });
    };

    const handleSelect = (item) => {
        const type = modalConfig.type;
        if (type === 'stream') setFormData({ ...formData, streamCode: item.code, streamName: item.name });
        if (type === 'entity') setFormData({ ...formData, entityCode: item.code, entityName: item.name });
        if (type === 'unit') setFormData({ ...formData, unitCode: item.code, unitName: item.name });
        setModalConfig({ ...modalConfig, show: false });
    };

    const runSearch = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1800));
            toast.success('Search Results Populated!');
        } catch (error) {
            toast.error('Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            streamCode: 'CS01',
            streamName: 'Commercial Sale',
            docId: '',
            entityCode: 'S-001',
            entityName: 'CASH SALES REVENUE',
            valuation: 0,
            unitCode: 'GLB',
            unitName: 'GLOBAL REPOSITORY',
            startDate: '2026-01-01',
            endDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleStartDateSelect = (date) => {
        setFormData({ ...formData, startDate: date });
        setShowCalendarStart(false);
    };

    const handleEndDateSelect = (date) => {
        setFormData({ ...formData, endDate: date });
        setShowCalendarEnd(false);
    };

    return (
        <>
        <SimpleModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Archive Retrieval & Intelligent Search"
            maxWidth="max-w-[1200px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleReset} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                        <RotateCcw size={14} /> CLEAR SEARCH
                    </button>
                    <button className="px-6 h-10 bg-indigo-50/50 backdrop-blur-md border border-indigo-200 text-indigo-700 text-sm font-bold rounded-[5px] shadow-sm hover:bg-indigo-100/80 transition-all active:scale-95 flex items-center gap-2">
                        <Download size={14} /> EXPORT RESULTS
                    </button>
                </div>
            }
        >
            <div className="space-y-6 font-['Tahoma'] relative select-none">
                {/* Branding Icon */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <Database size={160} />
                </div>

                {/* Search Filters */}
                <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0078d4]" />
                    <div className="grid grid-cols-12 gap-10">
                        {/* Transaction Params */}
                        <div className="col-span-12 lg:col-span-3 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-[#0078d4]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Primary Filters</span>
                            </div>
                            <FormRow label="Stream">
                                <div className="flex-1 flex gap-1 items-center">
                                    <div className="flex-1 bg-slate-50 border border-gray-200 px-3 py-1 rounded-[5px] cursor-pointer hover:border-blue-300 transition-all" onClick={() => openModal('stream', 'Search Transaction Streams')}>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-[#0078d4] leading-none mb-0.5">{formData.streamCode}</span>
                                            <span className="text-[11px] font-bold text-slate-600 truncate">{formData.streamName}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openModal('stream', 'Search Streams')} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </FormRow>
                            <FormRow label="Doc ID">
                                <div className="flex-1 relative">
                                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input type="text" value={formData.docId} onChange={(e) => setFormData({...formData, docId: e.target.value})} className="w-full h-8 border border-gray-200 pl-9 pr-3 text-[12px] font-bold text-slate-600 bg-slate-50 rounded-[5px] outline-none focus:border-blue-300" />
                                </div>
                            </FormRow>
                        </div>

                        {/* Entity Selection */}
                        <div className="col-span-12 lg:col-span-5 space-y-4 border-l border-slate-100 pl-10">
                            <div className="flex gap-6 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={entityType === 'Customer'} onChange={() => setEntityType('Customer')} className="w-4 h-4 text-[#0078d4] focus:ring-transparent" />
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} className={entityType === 'Customer' ? 'text-[#0078d4]' : 'text-slate-300'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${entityType === 'Customer' ? 'text-slate-800' : 'text-slate-400'}`}>Customer</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={entityType === 'Supplier'} onChange={() => setEntityType('Supplier')} className="w-4 h-4 text-[#0078d4] focus:ring-transparent" />
                                     <div className="flex items-center gap-1.5">
                                        <Truck size={14} className={entityType === 'Supplier' ? 'text-[#0078d4]' : 'text-slate-300'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${entityType === 'Supplier' ? 'text-slate-800' : 'text-slate-400'}`}>Supplier</span>
                                    </div>
                                </label>
                            </div>
                            <div className="flex gap-1 items-center">
                                <div className="flex-1 flex gap-1 items-center bg-slate-50 border border-gray-200 p-1.5 rounded-[5px] group cursor-pointer hover:border-blue-300 transition-all" onClick={() => openModal('entity', `Search ${entityType} Archives`)}>
                                    <div className="w-20 bg-white border border-gray-100 rounded px-2 py-1 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-slate-400 tabular-nums leading-none tracking-tighter">{formData.entityCode}</span>
                                    </div>
                                    <div className="flex-1 px-2">
                                        <span className="text-[12px] font-bold text-slate-600 truncate block">{formData.entityName}</span>
                                    </div>
                                </div>
                                <button onClick={() => openModal('entity', 'Search Entity')} className="w-10 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90">
                                    <Search size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <FormRow label="Valuation">
                                    <input type="number" value={formData.valuation} onChange={(e) => setFormData({...formData, valuation: e.target.value})} className="flex-1 h-8 border border-gray-200 px-3 text-right text-[12px] font-black text-[#0078d4] bg-slate-50 rounded-[5px] outline-none tabular-nums" />
                                </FormRow>
                                <FormRow label="Unit">
                                    <div className="flex-1 flex gap-1 items-center" onClick={() => openModal('unit', 'Search Operational Units')}>
                                        <div className="flex-1 bg-slate-100 h-8 px-3 rounded-[5px] flex items-center text-[11px] font-bold text-slate-500 cursor-pointer hover:bg-blue-50 transition-colors">
                                            {formData.unitCode}
                                        </div>
                                    </div>
                                </FormRow>
                            </div>
                        </div>

                        {/* Date Range & Action */}
                        <div className="col-span-12 lg:col-span-4 space-y-4 border-l border-slate-100 pl-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">Start Horizon</label>
                                <div className="flex h-10 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.startDate}
                                        className="flex-1 px-3 text-[12px] border border-gray-200 bg-white rounded-[5px] outline-none text-slate-700 font-bold shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendarStart(true)} className="w-10 h-10 bg-white border border-gray-300 text-[#0285fd] flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">End Horizon</label>
                                <div className="flex h-10 gap-1">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.endDate}
                                        className="flex-1 px-3 text-[12px] border border-gray-200 bg-white rounded-[5px] outline-none text-slate-700 font-bold shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendarEnd(true)} className="w-10 h-10 bg-white border border-gray-300 text-[#0285fd] flex items-center justify-center hover:bg-blue-50 rounded-[5px] transition-all shadow-sm active:scale-90">
                                        <Calendar size={14} />
                                    </button>
                                </div>
                                </div>
                            </div>
                            <button onClick={runSearch} disabled={loading} className={`w-full h-12 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[5px] hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <FileSearch size={18} className="text-blue-400" />} 
                                Execute Archive Query
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-200 rounded-2xl shadow-lg bg-white overflow-hidden">
                    <div className="bg-[#f8fafd] px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <LayoutGrid size={18} className="text-[#0078d4]" />
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Retrieved Transaction Records</span>
                        </div>
                        <div className="bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-4 text-[11px] font-black">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 uppercase tracking-tighter">Total Hits</span>
                                <span className="text-[#0078d4] tabular-nums">1,245</span>
                            </div>
                            <div className="w-[1px] h-3 bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 uppercase tracking-tighter">Agg. Value</span>
                                <span className="text-slate-700 tabular-nums">920,450.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] whitespace-nowrap border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="py-5 px-8 text-left border-b border-gray-100">Chronology</th>
                                    <th className="py-5 px-8 text-left border-b border-gray-100">Document Artifact</th>
                                    <th className="py-5 px-8 text-left border-b border-gray-100">Counterpart Detail</th>
                                    <th className="py-5 px-8 text-left border-b border-gray-100">Audit Reference</th>
                                    <th className="py-5 px-8 text-left border-b border-gray-100">Instrument</th>
                                    <th className="py-5 px-8 text-right border-b border-gray-100">Net Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                                    <td className="py-5 px-8 font-medium text-slate-500">2026/01/21</td>
                                    <td className="py-5 px-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[#0078d4] text-[12px] tracking-tight">INV01000001</span>
                                            <span className="text-[9px] text-slate-400 uppercase font-black">Electronic Invoice</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 font-bold text-slate-700">CASH SALES REVENUE</td>
                                    <td className="py-5 px-8">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200">System Migrated</span>
                                    </td>
                                    <td className="py-5 px-8 text-slate-300">---</td>
                                    <td className="py-5 px-8 text-right font-black text-slate-800 text-[14px] tabular-nums tracking-tighter">9,000.00</td>
                                </tr>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <tr key={i} className="bg-slate-50/10 h-16">
                                        <td colSpan={6}></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>

        {/* --- MODALS --- */}
        {modalConfig.show && (
            <SearchModal 
                title={modalConfig.title} 
                query={modalConfig.search} 
                setQuery={(q) => setModalConfig({ ...modalConfig, search: q })} 
                onClose={() => setModalConfig({ ...modalConfig, show: false })}
                data={modalConfig.type === 'stream' ? streams : modalConfig.type === 'entity' ? entities : units}
                columns={[{ label: 'Ref Code', key: 'code' }, { label: 'Description / Name', key: 'name' }]}
                onSelect={handleSelect}
            />
        )}
        <CalendarModal 
            isOpen={showCalendarStart} 
            onClose={() => setShowCalendarStart(false)} 
            onDateSelect={handleStartDateSelect}
            initialDate={formData.startDate}
        />
        <CalendarModal 
            isOpen={showCalendarEnd} 
            onClose={() => setShowCalendarEnd(false)} 
            onDateSelect={handleEndDateSelect}
            initialDate={formData.endDate}
        />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">{label}</label>
        {children}
    </div>
);

const SearchModal = ({ title, query, setQuery, onClose, data, columns, onSelect }) => (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-['Tahoma']">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-black text-slate-800 tracking-tight uppercase tracking-[0.05em]">{title}</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search..." className="h-9 border border-gray-200 pl-9 pr-3 text-sm rounded-lg w-64 focus:border-blue-500 outline-none shadow-sm transition-all" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-400 hover:text-red-500 transition-all rounded-full border border-transparent hover:border-gray-200"><X size={20} /></button>
                </div>
            </div>
            <div className="overflow-y-auto p-2">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 sticky top-0 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                        <tr>
                            {columns.map((col, idx) => <th key={idx} className="p-4 border-b border-slate-100">{col.label}</th>)}
                            <th className="p-4 border-b border-slate-100 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.filter(item => 
                            columns.some(col => (item[col.key] || '').toLowerCase().includes(query.toLowerCase()))
                        ).map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => onSelect(item)}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} className={`p-4 border-b border-slate-50 text-[13px] ${cIdx === 0 ? 'font-black text-slate-700' : 'font-medium text-slate-600'}`}>
                                        {item[col.key]}
                                    </td>
                                ))}
                                <td className="p-4 border-b border-slate-50 text-center">
                                    <button className="bg-blue-50/50 backdrop-blur-md border border-blue-200 text-[#0078d4] text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-blue-100/80 shadow-sm transition-all active:scale-95">SELECT</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default SearchBoard;
