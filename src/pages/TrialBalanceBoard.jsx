import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { BarChart3, Search, Calendar, RotateCcw, Printer, Download, X, Loader2, ListFilter, FileText, PieChart, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TrialBalanceBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dateFrom: '2026-01-01',
        dateTo: new Date().toISOString().split('T')[0],
        costCenterCode: 'GLB-001',
        costCenterName: 'GLOBAL COST REPOSITORY'
    });

    // Modal States
    const [showCCModal, setShowCCModal] = useState(false);
    const [ccSearch, setCcSearch] = useState('');
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);

    // Dummy Cost Centers
    const costCenters = [
        { code: 'GLB-001', name: 'GLOBAL COST REPOSITORY' },
        { code: 'CC-HQ', name: 'HEADQUARTERS (HQ)' },
        { code: 'CC-BR', name: 'REGIONAL BRANCH - SOUTH' },
        { code: 'CC-IT', name: 'IT INFRASTRUCTURE DEPT' }
    ];

    const [reportResults, setReportResults] = useState([
        { id: '10100', name: 'Main Operating Account', type: 'Asset', deb: 12450.00, cre: 0.00 },
        { id: '20100', name: 'Accounts Payable Ledger', type: 'Liability', deb: 0.00, cre: 5200.00 },
        { id: '30100', name: 'Equity Distribution Capital', type: 'Equity', deb: 0.00, cre: 7250.00 }
    ]);

    // Calculate totals dynamically
    const totalDebit = reportResults.reduce((sum, row) => sum + row.deb, 0);
    const totalCredit = reportResults.reduce((sum, row) => sum + row.cre, 0);

    const runReport = async () => {
        setLoading(true);
        try {
            // Simulated API call would populate reportResults here
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Report Synchronized Successfully');
        } catch (error) {
            toast.error('Failed to synchronize report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateFromSelect = (date) => {
        setFormData({ ...formData, dateFrom: date });
        setShowCalendarFrom(false);
    };

    const handleDateToSelect = (date) => {
        setFormData({ ...formData, dateTo: date });
        setShowCalendarTo(false);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
             <div className="flex-1 flex items-center gap-2 opacity-30 select-none">
                <span className="text-[20px] font-black text-[#0078d4] tracking-tighter">onimta IT</span>
            </div>
            <button className="px-6 h-9 bg-[#00adff] text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-[#0094db] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <Printer size={15} /> PRINT STATEMENT
            </button>
            <button className="px-6 h-9 bg-[#e49e1b] text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-[#c98a12] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <Download size={15} /> EXPORT CSV
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Strategic Portfolio Insight: Trial Balance Analysis"
                maxWidth="max-w-[1000px]"
                footer={footer}
            >
                <div className="space-y-4 pt-1 font-['Tahoma',_sans-serif]">
                    {/* Compact Filter Section */}
                    <div className="bg-white/50 backdrop-blur-sm p-6 border border-gray-200 rounded-[8px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-6 items-end">
                            <div className="col-span-3 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Period From</label>
                                <div className="flex h-9 gap-1.5">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.dateFrom}
                                        className="flex-1 px-3 text-[12.5px] border border-gray-300 bg-gray-50/50 rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendarFrom(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Period To</label>
                                <div className="flex h-9 gap-1.5">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.dateTo}
                                        className="flex-1 px-3 text-[12.5px] border border-gray-300 bg-gray-50/50 rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm"
                                    />
                                    <button onClick={() => setShowCalendarTo(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Cost Center Context</label>
                                <div className="flex h-9 gap-1.5">
                                    <div className="flex-1 h-9 border border-gray-300 bg-white rounded-[3px] px-3 flex items-center justify-between group cursor-pointer hover:border-[#0285fd] transition-all shadow-sm" onClick={() => setShowCCModal(true)}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#0285fd]">{formData.costCenterCode}</span>
                                            <span className="text-[12.5px] font-bold text-slate-700 truncate max-w-[120px]">{formData.costCenterName}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300" />
                                    </div>
                                    <button onClick={() => setShowCCModal(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <button onClick={runReport} disabled={loading} className={`w-full h-9 bg-[#2bb744] text-white text-[11px] font-black uppercase tracking-widest rounded-[3px] hover:bg-[#259b3a] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} fill="currentColor" />}
                                    GENERATE
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest opacity-80">Portfolio Ledger Spectrum</span>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Debit Vol.</span>
                                    <span className="text-[15px] font-black text-[#0285fd] font-mono tabular-nums leading-none">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Vol.</span>
                                    <span className="text-[15px] font-black text-slate-800 font-mono tabular-nums leading-none">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden">
                            <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-500 font-black uppercase text-[10.5px] tracking-widest z-10 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 border-r border-gray-100 w-32">Acc ID</th>
                                            <th className="px-6 py-3 border-r border-gray-100">Nomenclature / Stratum</th>
                                            <th className="px-6 py-3 border-r border-gray-100 w-40 text-right">Debit (LKR)</th>
                                            <th className="px-6 py-3 w-40 text-right">Credit (LKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reportResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                                <td className="px-6 py-2 border-r border-gray-50">
                                                    <span className="text-[12px] font-mono font-black text-slate-400">{row.id}</span>
                                                </td>
                                                <td className="px-6 py-2 border-r border-gray-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[12.5px] font-bold text-slate-700">{row.name}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{row.type}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-2 border-r border-gray-50 text-right font-mono font-black text-[13px] tabular-nums ${row.deb === 0 ? 'text-slate-200' : 'text-[#0285fd]'}`}>{row.deb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className={`px-6 py-2 text-right font-mono font-black text-[13px] tabular-nums ${row.cre === 0 ? 'text-slate-200' : 'text-slate-800'}`}>{row.cre.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                        {Array.from({ length: Math.max(0, 8 - reportResults.length) }).map((_, i) => (
                                            <tr key={`filler-${i}`} className="h-10">
                                                <td colSpan={4}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            {showCCModal && (
                <SimpleModal 
                    isOpen={showCCModal} 
                    onClose={() => setShowCCModal(false)} 
                    title={`Cost Center Selection Ledger - ${costCenters.length} Found`} 
                    maxWidth="max-w-2xl"
                >
                    <div className="flex flex-col h-full font-['Tahoma']">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Code or Nomenclature..." 
                                className="h-10 border border-gray-300 px-4 text-sm rounded-md w-80 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={ccSearch} 
                                onChange={(e) => setCcSearch(e.target.value)} 
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                    <tr>
                                        <th className="px-6 border-b text-center">Code</th>
                                        <th className="px-6 border-b">Center Nomenclature</th>
                                        <th className="px-6 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {costCenters.filter(cc => 
                                        cc.name.toLowerCase().includes(ccSearch.toLowerCase()) || 
                                        cc.code.toLowerCase().includes(ccSearch.toLowerCase())
                                    ).map(cc => (
                                        <tr key={cc.code} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                            <td className="p-3 text-center font-mono font-bold text-gray-700">{cc.code}</td>
                                            <td className="p-3 font-medium font-mono uppercase text-gray-700">{cc.name}</td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => {
                                                        setFormData({ ...formData, costCenterCode: cc.code, costCenterName: cc.name });
                                                        setShowCCModal(false);
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
                onDateSelect={handleDateFromSelect}
                initialDate={formData.dateFrom}
            />
            <CalendarModal 
                isOpen={showCalendarTo} 
                onClose={() => setShowCalendarTo(false)} 
                onDateSelect={handleDateToSelect}
                initialDate={formData.dateTo}
            />
        </>
    );
};


export default TrialBalanceBoard;
