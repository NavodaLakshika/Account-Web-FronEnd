import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { trialBalanceService } from '../services/trialBalance.service';

import {
    Printer,
    Calendar,
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
    Save,
    FileText,
    CheckSquare,
    Square
} from 'lucide-react';
import { getCompanyCode } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

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
        dateFrom: formatDate(new Date()),
        dateTo: formatDate(new Date()),
        costCenterCode: 'all',
        costCenterName: 'ALL COST CENTERS',
        isYearEnd: false,
        allAccounts: false
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [lookups, setLookups] = useState({ costCenters: [], dateRanges: [] });
    const [reportResults, setReportResults] = useState([]);
    const [hideZero, setHideZero] = useState(true);

    const [showCCModal, setShowCCModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');
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

    const handleDateSelect = (date) => {
        setFormData(prev => ({ ...prev, [datePickerField]: date }));
        setShowDatePicker(false);
    };

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title={companyNameProp ? `Trial Balance - ${companyNameProp}` : "Strategic Portfolio Insight: Trial Balance"}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2">
                                <FileSpreadsheet size={14} /> EXPORT EXCEL
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleClear} className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2">
                                <RefreshCw size={14} /> CLEAR
                            </button>
                            <button className="px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2">
                                <Printer size={14} /> PRINT REPORT
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar">

                    {/* Filter Matrix */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date From</label>
                                <div className="relative">
                                    <input
                                        readOnly
                                        value={formData.dateFrom}
                                        onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date To</label>
                                <div className="relative">
                                    <input
                                        readOnly
                                        value={formData.dateTo}
                                        onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.costCenterName}
                                        onClick={() => setShowCCModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                    />
                                    <button onClick={() => setShowCCModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-end gap-4">
                                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
                                    if (formData.costCenterCode !== 'all') {
                                        setFormData({ ...formData, costCenterCode: 'all', costCenterName: 'ALL COST CENTERS' });
                                    }
                                }}>
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${formData.costCenterCode === 'all' ? 'bg-[#0285fd] border-[#0285fd]' : 'border-gray-300 bg-white'}`}>
                                        {formData.costCenterCode === 'all' && <Save size={10} className="text-white" />}
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-700">ALL</span>
                                </div>
                                <button
                                    onClick={runReport}
                                    disabled={loading}
                                    className="h-10 px-6 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    {loading ? 'RUNNING' : 'RUN'}
                                </button>
                            </div>

                            {/* Checkboxes row */}
                            <div className="col-span-12 flex items-center gap-8 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.isYearEnd}
                                        onChange={e => setFormData({ ...formData, isYearEnd: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Trial Balance to Year end</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={hideZero}
                                        onChange={e => setHideZero(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Omit Empty Balances</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Report Matrix */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#0285fd] rounded-full animate-pulse" />
                                <span className="text-[13px] font-medium text-gray-700">Discovery Results Stream</span>
                            </div>
                            <div className="flex gap-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Debit</span>
                                    <span className="text-[18px] font-black text-[#0285fd] font-mono tabular-nums leading-none">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex flex-col items-end border-l border-slate-200 pl-8">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate Credit</span>
                                    <span className="text-[18px] font-black text-slate-800 font-mono tabular-nums leading-none">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden min-h-[400px]">
                            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10">
                                        <tr>
                                            <th className="px-4 border-r border-slate-100 w-24 text-center">Class</th>
                                            <th className="px-4 border-r border-slate-100 w-32">Identifier</th>
                                            <th className="px-4 border-r border-slate-100">Nomenclature</th>
                                            <th className="px-4 border-r border-slate-100 w-44 text-right">Debit Volume</th>
                                            <th className="px-4 w-44 text-right">Credit Volume</th>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reportResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors group text-[12px]">
                                                <td className="px-4 py-2.5 border-r border-slate-100 text-center">
                                                    <span className={`text-[10px] font-black uppercase ${
                                                        row.mainType === 'Assets' ? 'text-emerald-500' :
                                                        row.mainType === 'Liability' ? 'text-rose-500' :
                                                        'text-blue-400'
                                                    }`}>
                                                        {row.mainType || 'ACC'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 border-r border-slate-100 font-mono font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    {row.code}
                                                </td>
                                                <td className="px-4 py-2.5 border-r border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 uppercase group-hover:text-slate-900 transition-colors">{row.name}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{row.accountType}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-2.5 border-r border-slate-100 text-right font-mono font-black tabular-nums ${row.debit > 0 ? 'text-slate-800' : 'text-slate-200'}`}>
                                                    {row.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-mono font-black tabular-nums ${row.credit > 0 ? 'text-slate-800' : 'text-slate-200'}`}>
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
            </TransactionFormWrapper>

            {/* CC Modal */}
            {showCCModal && (
                <SimpleModal
                    isOpen={showCCModal}
                    onClose={() => setShowCCModal(false)}
                    title="Segment Category Discovery"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                        <tr>
                                            <th className=" px-5 py-3">Code</th>
                                            <th className=" px-5 py-3">Name</th>
                                            <th className="text-right px-5 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
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
                                                className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                            >
                                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{cc.code}</td>
                                                <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{cc.name}</td>
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
            )}

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[datePickerField]}
            />
        </>
    );
};

export default TrialBalanceBoard;
