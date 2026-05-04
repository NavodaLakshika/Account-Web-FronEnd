import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { BarChart3, Search, Calendar, RotateCcw, Printer, Download, X, Loader2, ListFilter, FileText, PieChart, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { trialBalanceService } from '../services/trialBalance.service';
import { toast } from 'react-hot-toast';

const TrialBalanceBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dateFrom: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
        dateTo: new Date().toLocaleDateString('en-GB'),   // DD/MM/YYYY
        costCenterCode: 'all',
        costCenterName: 'ALL COST CENTERS',
        isYearEnd: false,
        allAccounts: false
    });

    const [lookups, setLookups] = useState({ costCenters: [], dateRanges: [] });
    const [reportResults, setReportResults] = useState([]);
    const [hideZero, setHideZero] = useState(true);

    // Modal States
    const [showCCModal, setShowCCModal] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const companyCode = localStorage.getItem('company') || 'C001';

    useEffect(() => {
        if (isOpen) {
            loadLookups();
        }
    }, [isOpen]);

    const loadLookups = async () => {
        try {
            const data = await trialBalanceService.getLookups(companyCode);
            setLookups(data);
        } catch (e) {
            console.error('Lookup load failed', e);
        }
    };

    // Calculate totals dynamically
    const totalDebit = reportResults.reduce((sum, row) => sum + (row.debit || 0), 0);
    const totalCredit = reportResults.reduce((sum, row) => sum + (row.credit || 0), 0);

    const runReport = async () => {
        setLoading(true);
        try {
            const data = await trialBalanceService.generate({
                ...formData,
                companyCode,
                costCenter: formData.costCenterCode,
                hideZeroBalances: hideZero && !formData.allAccounts
            });
            setReportResults(data);
            toast.success(`Retrieved ${data.length} Matching Ledger Records`);
        } catch (error) {
            toast.error('Report execution failed');
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
            <button className="px-6 h-9 bg-[#0285fd] text-white text-[12px] font-black rounded-[3px] shadow-sm hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <Printer size={15} /> PRINT STATEMENT
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Strategic Portfolio Insight: Trial Balance Discovery"
                maxWidth="max-w-[1300px]"
                footer={footer}
            >
                <div className="space-y-4 pt-1 font-['Tahoma',_sans-serif]">
                    {/* Image-Inspired Filter Matrix */}
                    <div className="bg-white/50 backdrop-blur-sm p-5 border border-gray-200 rounded-[8px] shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-5 items-center">
                            <div className="col-span-3 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-slate-500 w-12">From</label>
                                <div className="flex flex-1 h-9 gap-1">
                                    <input readOnly value={formData.dateFrom} className="flex-1 px-3 text-[12px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm" />
                                    <button onClick={() => setShowCalendarFrom(true)} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90"><Calendar size={14} /></button>
                                </div>
                            </div>

                            <div className="col-span-3 flex items-center gap-3">
                                <label className="text-[12px] font-bold text-slate-500 w-12">To</label>
                                <div className="flex flex-1 h-9 gap-1">
                                    <input readOnly value={formData.dateTo} className="flex-1 px-3 text-[12px] border border-gray-300 bg-white rounded-[3px] outline-none text-slate-800 font-mono font-bold shadow-sm" />
                                    <button onClick={() => setShowCalendarTo(true)} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] transition-all shadow-sm active:scale-90"><Calendar size={14} /></button>
                                </div>
                            </div>

                            <div className="col-span-3 flex items-center gap-3 pl-4">
                                <label className="text-[12px] font-bold text-slate-500 whitespace-nowrap">Cost Center</label>
                                <div className="flex-1 h-9 border border-gray-300 bg-white rounded-[3px] px-3 flex items-center justify-between group cursor-pointer hover:border-[#0285fd] transition-all shadow-sm" onClick={() => setShowCCModal(true)}>
                                    <span className="text-[12px] font-bold text-slate-700 truncate">{formData.costCenterName}</span>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </div>
                                <div className="flex items-center gap-2 px-2 shrink-0">
                                    <input type="checkbox" checked={formData.costCenterCode === 'all'} onChange={() => setFormData({...formData, costCenterCode: 'all', costCenterName: 'ALL COST CENTERS'})} className="w-4 h-4 accent-blue-600" />
                                    <span className="text-[11px] font-bold text-slate-500">All</span>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-3 pl-4">
                                <input type="checkbox" id="allAcc" checked={formData.allAccounts} onChange={e => setFormData({...formData, allAccounts: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                                <label htmlFor="allAcc" className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">All Accounts</label>
                            </div>

                            <div className="col-span-1">
                                <button onClick={runReport} disabled={loading} className={`w-full h-9 bg-white border-2 border-emerald-500 text-emerald-600 text-[11px] font-black uppercase tracking-widest rounded-[3px] hover:bg-emerald-50 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Display'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                                <input type="checkbox" id="yEnd" checked={formData.isYearEnd} onChange={e => setFormData({...formData, isYearEnd: e.target.checked})} className="w-3.5 h-3.5 accent-blue-600" />
                                <label htmlFor="yEnd" className="text-[11px] font-bold text-slate-500">Trial Balance to Year end</label>
                            </div>
                            {!formData.allAccounts && (
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                                    <input type="checkbox" id="hZero" checked={hideZero} onChange={e => setHideZero(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500" />
                                    <label htmlFor="hZero" className="text-[11px] font-bold text-slate-500">Hide Zero Balances</label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Report Matrix */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest opacity-80">Discovery Results Stream</span>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Debit Volume</span>
                                    <span className="text-[16px] font-black text-[#0285fd] font-mono tabular-nums leading-none">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Volume</span>
                                    <span className="text-[16px] font-black text-slate-800 font-mono tabular-nums leading-none">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden">
                            <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-500 font-black uppercase text-[10.5px] tracking-widest z-10 sticky top-0">
                                        <tr>
                                            <th className="px-5 py-3 border-r border-gray-100 w-24">Type</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-32">Acc Code</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-44">Account Type</th>
                                            <th className="px-5 py-3 border-r border-gray-100 min-w-[300px]">Account Name / Stratum</th>
                                            <th className="px-5 py-3 border-r border-gray-100 w-40 text-right">Debit (LKR)</th>
                                            <th className="px-5 py-3 w-40 text-right">Credit (LKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 font-['Tahoma']">
                                        {reportResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[11px] font-black text-blue-400 uppercase">{row.mainType || 'ACC'}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12px] font-mono font-black text-slate-400">{row.code}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{row.accountType}</span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-gray-50">
                                                    <span className="text-[12.5px] font-bold text-slate-700 uppercase">{row.name}</span>
                                                </td>
                                                <td className={`px-5 py-2.5 border-r border-gray-50 text-right font-mono font-black text-[13px] tabular-nums ${row.debit === 0 ? 'text-slate-200' : 'text-[#0285fd]'}`}>
                                                    {row.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className={`px-5 py-2.5 text-right font-mono font-black text-[13px] tabular-nums ${row.credit === 0 ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {row.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        {Array.from({ length: Math.max(0, 10 - reportResults.length) }).map((_, i) => (
                                            <tr key={`filler-${i}`} className="h-11">
                                                <td colSpan={6}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Discovery Modal */}
            {showCCModal && (
                <SimpleModal 
                    isOpen={showCCModal} 
                    onClose={() => setShowCCModal(false)} 
                    title={`Cost Center Discovery Portal - ${lookups.costCenters.length} Matched`} 
                    maxWidth="max-w-2xl"
                >
                    <div className="flex flex-col h-full font-['Tahoma']">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Context Discovery</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filter by ID or Nomenclature..." 
                                className="h-10 border border-gray-300 px-4 text-sm rounded-md w-80 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                    <tr>
                                        <th className="px-6 border-b text-center">ID</th>
                                        <th className="px-6 border-b">Nomenclature</th>
                                        <th className="px-6 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                     <tr onClick={() => { setFormData({ ...formData, costCenterCode: 'all', costCenterName: 'ALL COST CENTERS' }); setShowCCModal(false); }} className="bg-blue-50/30 hover:bg-blue-100/50 transition-colors cursor-pointer font-black italic">
                                        <td className="p-3 text-center text-blue-600">ALL</td>
                                        <td className="p-3 text-blue-600 uppercase">Universal Center Consolidation</td>
                                        <td className="p-3 text-center">
                                            <button className="bg-blue-600 text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                    {lookups.costCenters.filter(cc => 
                                        cc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        cc.code.toLowerCase().includes(searchTerm.toLowerCase())
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
