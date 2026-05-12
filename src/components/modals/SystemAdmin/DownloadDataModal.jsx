import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { 
    Download, 
    Calendar, 
    ChevronDown, 
    Save, 
    X,
    RotateCcw,
    Table,
    Search,
    MapPin,
    Target,
    Activity,
    Layers
} from 'lucide-react';

const DownloadDataModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [loading, setLoading] = useState(false);

    // Lookup States
    const [location, setLocation] = useState({ code: '', name: '' });
    const [costCenter, setCostCenter] = useState({ code: '', name: '' });
    const [showLocationLookup, setShowLocationLookup] = useState(false);
    const [showCostCenterLookup, setShowCostCenterLookup] = useState(false);

    const locations = [
        { code: 'WH01', name: 'Main Warehouse - Colombo 03' },
        { code: 'RO02', name: 'Retail Outlet - Kandy' },
        { code: 'DC03', name: 'Distribution Center - Gampaha' }
    ];

    const costCenters = [
        { code: 'ADM01', name: 'ADMINISTRATION - DEPT 01' },
        { code: 'SAL02', name: 'SALES & MARKETING - DEPT 02' },
        { code: 'OPS03', name: 'OPERATIONS - DEPT 03' }
    ];

    const handleClear = () => {
        setDateFrom('24/04/2026');
        setDateTo('24/04/2026');
        setLocation({ code: '', name: '' });
        setCostCenter({ code: '', name: '' });
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={() => setLoading(true)} 
                className="px-8 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Save size={14} /> Save
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Inventory Data Download"
                maxWidth="max-w-5xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-2">
                    
                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                        <Download size={20} className="text-[#0078d4]" />
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Enterprise Inventory Data Retrieval</h2>
                    </div>

                    {/* Filter Bar Row 1 */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[5px] space-y-4">
                        <div className="flex items-center gap-6">
                            {/* Date From */}
                            <div className="flex items-center gap-3">
                                <label className="font-bold text-gray-700 whitespace-nowrap">Date From</label>
                                <div className="flex items-center border border-gray-300 bg-white rounded-[5px] overflow-hidden shadow-sm focus-within:border-blue-400 transition-all">
                                    <input 
                                        type="text" 
                                        value={dateFrom} 
                                        readOnly
                                        className="w-[110px] h-8 px-3 text-[12px] outline-none font-bold text-blue-600 cursor-default"
                                    />
                                    <button 
                                        onClick={() => setShowCalendarFrom(true)}
                                        className="h-8 w-8 border-l border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date To */}
                            <div className="flex items-center gap-3">
                                <label className="font-bold text-gray-700 whitespace-nowrap">Date To</label>
                                <div className="flex items-center border border-gray-300 bg-white rounded-[5px] overflow-hidden shadow-sm focus-within:border-blue-400 transition-all">
                                    <input 
                                        type="text" 
                                        value={dateTo} 
                                        readOnly
                                        className="w-[110px] h-8 px-3 text-[12px] outline-none font-bold text-blue-600 cursor-default"
                                    />
                                    <button 
                                        onClick={() => setShowCalendarTo(true)}
                                        className="h-8 w-8 border-l border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                                    >
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Location Lookup (Replaced Dropdown) */}
                            <div className="flex-1 flex items-center gap-3 ml-2">
                                <label className="font-bold text-gray-700 whitespace-nowrap">Location</label>
                                <div className="flex-1 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={location.name} 
                                        readOnly 
                                        placeholder="Select Location..."
                                        className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-mono text-gray-600 truncate" 
                                    />
                                    <button 
                                        onClick={() => setShowLocationLookup(true)} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar Row 2 - Cost Center Lookup (Replaced Dropdown) */}
                        <div className="flex items-center gap-6">
                            <label className="w-20 font-bold text-gray-700 whitespace-nowrap">Cost Center</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={costCenter.name} 
                                    readOnly 
                                    placeholder="Select Cost Center Profile..."
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-mono text-gray-600" 
                                />
                                <button 
                                    onClick={() => setShowCostCenterLookup(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table Container */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[400px] bg-white shadow-inner relative">
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 28px' }} 
                        />
                        <div className="flex-1 flex items-center justify-center opacity-20 select-none">
                            <div className="flex flex-col items-center gap-4">
                                <Activity size={64} className="text-slate-400" />
                                <span className="font-bold uppercase tracking-[0.4em] text-slate-500">Retrieval Queue Empty</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Totaling Bar */}
                    <div className="bg-slate-100 border border-slate-200 px-6 py-2 rounded-[5px] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Account Totals:</span>
                        </div>
                        <div className="flex items-center gap-20">
                            <span className="text-[12px] font-bold text-slate-700 font-mono">0.00</span>
                            <span className="text-[12px] font-bold text-slate-700 font-mono">0.00</span>
                            <span className="text-[13px] font-black text-blue-600 font-mono">0.00</span>
                        </div>
                    </div>

                </div>
            </SimpleModal>

            {/* Calendar Modals */}
            <CalendarModal 
                isOpen={showCalendarFrom}
                onClose={() => setShowCalendarFrom(false)}
                onDateSelect={(date) => { setDateFrom(date); setShowCalendarFrom(false); }}
                initialDate={dateFrom}
            />
            <CalendarModal 
                isOpen={showCalendarTo}
                onClose={() => setShowCalendarTo(false)}
                onDateSelect={(date) => { setDateTo(date); setShowCalendarTo(false); }}
                initialDate={dateTo}
            />

            {/* Location Lookup Modal */}
            {showLocationLookup && (
                <SearchModal 
                    title="Location" 
                    list={locations} 
                    onSelect={(item) => { setLocation(item); setShowLocationLookup(false); }} 
                    onClose={() => setShowLocationLookup(false)}
                    placeholder="Search location code or name..."
                />
            )}

            {/* Cost Center Lookup Modal */}
            {showCostCenterLookup && (
                <SearchModal 
                    title="Cost Center" 
                    list={costCenters} 
                    onSelect={(item) => { setCostCenter(item); setShowCostCenterLookup(false); }} 
                    onClose={() => setShowCostCenterLookup(false)}
                    placeholder="Search cost center code or name..."
                />
            )}
        </>
    );
};

const SearchModal = ({ title, list, onSelect, onClose, placeholder }) => {
    const [query, setQuery] = useState('');
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Search size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight tracking-[0.1em]">{title} Profile Lookup</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Search Input Area */}
                <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    </div>
                    <input 
                        type="text" 
                        placeholder={placeholder} 
                        className="h-8 border border-gray-300 px-3 text-xs rounded-md w-60 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                    />
                </div>

                {/* Results List */}
                <div className="p-2">
                    <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                        <span className="w-24 text-center">CODE</span>
                        <span className="flex-1 px-3">DISPLAY NAME</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {list.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.code.toLowerCase().includes(query.toLowerCase())).map(x => (
                            <button 
                                key={x.code} 
                                onClick={() => onSelect(x)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                        {x.code}
                                    </span>
                                    <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                        {x.name}
                                    </span>
                                </div>
                                <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                            </button>
                        ))}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default DownloadDataModal;
