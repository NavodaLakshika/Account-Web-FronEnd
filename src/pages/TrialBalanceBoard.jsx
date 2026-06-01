import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { trialBalanceService } from '../services/trialBalance.service';


import { 
    Printer, 
    Calendar, 
    ChevronRight, 
    Loader2, 
    Search,
    BarChart3,
    TrendingUp,
    TrendingDown,
    FileSpreadsheet,
    RefreshCw,
    X,
    ChevronLeft,
    List,
    Save
} from 'lucide-react';
import { getCompanyCode } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const TrialBalanceBoard = ({ isOpen, onClose, companyCodeProp, companyNameProp }) => {
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [loading, setLoading] = useState(false);
    const getInitialFormData = () => ({
        dateFrom: formatDate(new Date()), // DD/MM/YYYY
        dateTo: formatDate(new Date()),   // DD/MM/YYYY
        costCenterCode: 'all',
        costCenterName: 'ALL COST CENTERS',
        isYearEnd: false,
        allAccounts: false
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [lookups, setLookups] = useState({ costCenters: [], dateRanges: [] });
    const [reportResults, setReportResults] = useState([]);
    const [hideZero, setHideZero] = useState(true);

    // Modal States
    const [showCCModal, setShowCCModal] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            loadLookups();
        }
    }, [isOpen]);

    const loadLookups = async () => {
        try {
            const data = await trialBalanceService.getLookups(companyCodeProp || getCompanyCode());
            setLookups(data);
        } catch (e) {
            console.error('Lookup load failed', e);
        }
    };

    // Premium Toast Helpers
    // Calculate totals dynamically
    const totalDebit = reportResults.reduce((sum, row) => sum + (row.debit || 0), 0);
    const totalCredit = reportResults.reduce((sum, row) => sum + (row.credit || 0), 0);

    const runReport = async () => {
        setLoading(true);
        try {
            const data = await trialBalanceService.generate({
                companyCode: companyCodeProp || getCompanyCode(),
                dateFrom: formData.dateFrom,
                dateTo: formData.dateTo,
                costCenter: formData.costCenterCode,
                isYearEnd: formData.isYearEnd,
                hideZeroBalances: hideZero && !formData.allAccounts
            });
            setReportResults(data);
            showSuccessToast(`Analysis Complete: ${data.length} records discovered`);
        } catch (error) {
            showErrorToast('Report execution failed');
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

    const handleClear = () => {
        setFormData({
            dateFrom: formatDate(new Date()),
            dateTo: formatDate(new Date()),
            costCenterCode: 'all',
            costCenterName: 'ALL COST CENTERS',
            isYearEnd: false,
            allAccounts: false
        });
        setReportResults([]);
        setHideZero(true);
    };

    // --- PURCHASE ORDER STYLE CONSTANTS ---
    const labelStyle = "text-[11px] font-bold text-gray-500 uppercase";
    const inputStyle = "w-[120px] h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all";
    const pickerStyle = "flex-1 min-w-[200px] h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none shadow-sm cursor-pointer flex items-center justify-between overflow-hidden focus-within:border-[#00D1FF] focus-within:ring-2 focus-within:ring-[#00D1FF]/20 transition-all";
    const iconBtnStyle = "w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none";

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
            <div className="flex gap-3">
                <button className="px-6 h-10 bg-white border border-emerald-200 text-emerald-600 text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] hover:bg-emerald-50 transition-all active:scale-95 flex items-center gap-2">
                    <FileSpreadsheet size={14} /> EXPORT EXCEL
                </button>
            </div>
            <div className="flex gap-4">
                <button onClick={handleClear} className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                    <RefreshCw size={14} /> CLEAR
                </button>
                <button className="px-8 h-10 bg-[#0285fd] text-white text-[13px] font-mono font-bold uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none">
                    <Printer size={14} /> PRINT REPORT
                </button>
            </div>
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
                title={companyNameProp ? `Trial Balance - ${companyNameProp}` : "Strategic Portfolio Insight: Trial Balance"}
                maxWidth="max-w-[1250px]"
                footer={footer}
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    
                    {/* Filter Matrix - Perfectly aligned as per User Image */}
                    {/* Filter Matrix - Perfectly aligned as per User Image */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                            
                            {/* Date From */}
                            <div className="flex items-center gap-3">
                                <label className={labelStyle}>Date From</label>
                                <div className="flex gap-1">
                                    <input 
                                        readOnly 
                                        value={formData.dateFrom} 
                                        className={inputStyle} 
                                        onClick={() => setShowCalendarFrom(true)}
                                    />
                                    <button onClick={() => setShowCalendarFrom(true)} className={iconBtnStyle}>
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date To */}
                            <div className="flex items-center gap-3">
                                <label className={labelStyle}>Date To</label>
                                <div className="flex gap-1">
                                    <input 
                                        readOnly 
                                        value={formData.dateTo} 
                                        className={inputStyle} 
                                        onClick={() => setShowCalendarTo(true)}
                                    />
                                    <button onClick={() => setShowCalendarTo(true)} className={iconBtnStyle}>
                                        <Calendar size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Cost Center */}
                            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                                <label className={labelStyle}>Cost Center</label>
                                <div className="flex-1 flex gap-1">
                                    <div onClick={() => setShowCCModal(true)} className={pickerStyle}>
                                        <span className="truncate">{formData.costCenterName}</span>
                                    </div>
                                    <button onClick={() => setShowCCModal(true)} className={iconBtnStyle}>
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* ALL Checkbox */}
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setFormData({...formData, costCenterCode: 'all', costCenterName: 'ALL COST CENTERS'})}>
                                <div className={`w-8 h-8 rounded-[5px] transition-all flex items-center justify-center ${formData.costCenterCode === 'all' ? 'bg-[#00D1FF]' : 'border border-slate-200 bg-white'}`}>
                                    {formData.costCenterCode === 'all' ? <X size={16} className="text-white" /> : null}
                                </div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">ALL</span>
                            </div>

                            {/* RUN Button */}
                            <button 
                                onClick={runReport} 
                                disabled={loading} 
                                className="px-8 h-9 bg-[#2bb744] hover:bg-[#259b3a] text-white rounded-[5px] font-mono font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-green-100 transition-all active:scale-95 disabled:opacity-50 border-none ml-auto"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                {loading ? 'RUNNING' : 'RUN'}
                            </button>
                        </div>

                        {/* Checkbox Row - Aligned below */}
                        <div className="flex items-center gap-8 pl-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isYearEnd ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-slate-300 bg-white group-hover:border-[#00D1FF]'}`}>
                                    {formData.isYearEnd && <Save size={10} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.isYearEnd}
                                    onChange={e => setFormData({...formData, isYearEnd: e.target.checked})}
                                    className="hidden"
                                />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Trial Balance to Year end</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${hideZero ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-slate-300 bg-white group-hover:border-[#00D1FF]'}`}>
                                    {hideZero && <Save size={10} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={hideZero}
                                    onChange={e => setHideZero(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight group-hover:text-blue-600 transition-colors">Omit Empty Balances</span>
                            </label>
                        </div>
                    </div>

                    {/* Report Matrix - Table Style */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,209,255,0.5)]" />
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Discovery Results Stream</span>
                            </div>
                            <div className="flex gap-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Debit</span>
                                    <span className="text-[18px] font-black text-[#00D1FF] font-mono tabular-nums leading-none">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex flex-col items-end border-l border-slate-200 pl-8">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Credit</span>
                                    <span className="text-[18px] font-black text-slate-800 font-mono tabular-nums leading-none">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[5px] shadow-sm overflow-hidden min-h-[400px]">
                            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="px-5 py-3 border-r border-slate-100 w-24 text-center">Class</th>
                                            <th className="px-5 py-3 border-r border-slate-100 w-32">Identifier</th>
                                            <th className="px-5 py-3 border-r border-slate-100">Nomenclature</th>
                                            <th className="px-5 py-3 border-r border-slate-100 w-44 text-right">Debit Volume</th>
                                            <th className="px-5 py-3 w-44 text-right">Credit Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reportResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-5 py-2.5 border-r border-slate-100 text-center">
                                                    <span className={`text-[10px] font-black uppercase ${
                                                        row.mainType === 'Assets' ? 'text-emerald-500' :
                                                        row.mainType === 'Liability' ? 'text-rose-500' :
                                                        'text-blue-400'
                                                    }`}>
                                                        {row.mainType || 'ACC'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-slate-100 font-mono text-[12px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    {row.code}
                                                </td>
                                                <td className="px-5 py-2.5 border-r border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-slate-900 transition-colors">{row.name}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{row.accountType}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-5 py-2.5 border-r border-slate-100 text-right font-mono font-black text-[14px] tabular-nums ${row.debit > 0 ? 'text-[#00D1FF]' : 'text-slate-200'}`}>
                                                    {row.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className={`px-5 py-2.5 text-right font-mono font-black text-[14px] tabular-nums ${row.credit > 0 ? 'text-slate-800' : 'text-slate-200'}`}>
                                                    {row.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        {reportResults.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={5} className="py-32 text-center">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Search size={48} className="text-gray-400" />
                                                        <span className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-500 italic">No discovery records found</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* CC Discovery Modal - PurchaseOrderBoard Style */}
            {showCCModal && (
                <SimpleModal 
                    isOpen={showCCModal} 
                    onClose={() => setShowCCModal(false)} 
                    title="Segment Category Discovery" 
                    maxWidth="max-w-[650px]"
                >
                    <div className="space-y-4 font-['Tahoma']">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[5px] border border-slate-200 mb-2">
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Search Facility</span>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input 
                                    type="text" 
                                    placeholder="" 
                                    className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm focus:border-[#00D1FF] bg-white shadow-sm font-bold transition-all focus:ring-2 focus:ring-[#00D1FF]/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm bg-white">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Reference ID</th>
                                            <th className="px-5 py-3">Credential Name</th>
                                            <th className="px-5 py-3 text-right">Interaction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                       
                                        {lookups.costCenters.filter(cc => 
                                            cc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            cc.code.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(cc => (
                                            <tr 
                                                key={cc.code} 
                                                onClick={() => {
                                                    setFormData({ ...formData, costCenterCode: cc.code, costCenterName: cc.name });
                                                    setShowCCModal(false);
                                                }}
                                                className="group hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[12px] font-bold text-slate-500">{cc.code}</td>
                                                <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{cc.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase tracking-widest border-none">Select</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
