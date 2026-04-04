import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { BarChart3, Search, Calendar, RotateCcw, Printer, Download, X, Loader2, ListFilter, FileText, PieChart, TrendingUp, ChevronRight } from 'lucide-react';
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

    // Dummy Cost Centers
    const costCenters = [
        { code: 'GLB-001', name: 'GLOBAL COST REPOSITORY' },
        { code: 'CC-HQ', name: 'HEADQUARTERS (HQ)' },
        { code: 'CC-BR', name: 'REGIONAL BRANCH - SOUTH' },
        { code: 'CC-IT', name: 'IT INFRASTRUCTURE DEPT' }
    ];

    const runReport = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Report Generated Successfully!');
        } catch (error) {
            toast.error('Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Trial Balance Analysis Report"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Download size={14} /> Export CSV
                        </button>
                        <button className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <Printer size={14} /> Print Report
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Inter'] relative">
                    {/* Branding Icon */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <TrendingUp size={160} />
                    </div>

                    {/* Filter Controls */}
                    <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0078d4]" />
                        <div className="grid grid-cols-12 gap-8 items-end">
                            <div className="col-span-12 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">Report Date From</label>
                                <div className="flex items-center px-3 h-10 border border-gray-200 bg-slate-50 shadow-sm rounded-md hover:border-blue-400 transition-all">
                                    <input
                                        type="date"
                                        value={formData.dateFrom}
                                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                                        className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent"
                                    />
                                    <Calendar size={16} className="text-slate-400" />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">Report Date To</label>
                                <div className="flex items-center px-3 h-10 border border-gray-200 bg-slate-50 shadow-sm rounded-md hover:border-blue-400 transition-all">
                                    <input
                                        type="date"
                                        value={formData.dateTo}
                                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                                        className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent"
                                    />
                                    <Calendar size={16} className="text-slate-400" />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">Cost Center Context</label>
                                <div className="flex gap-1 items-center">
                                    <div className="flex-1 h-10 border border-gray-200 bg-slate-50 rounded-md px-4 flex items-center group cursor-pointer hover:border-blue-300 transition-all" onClick={() => setShowCCModal(true)}>
                                        <div className="flex flex-col flex-1 pointer-events-none">
                                            <span className="text-[9px] font-black text-[#0078d4] leading-none mb-0.5">{formData.costCenterCode}</span>
                                            <span className="text-[12px] font-bold text-slate-600 truncate">{formData.costCenterName}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#0078d4] transition-colors" />
                                    </div>
                                    <button onClick={() => setShowCCModal(true)} className="w-10 h-10 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-md transition-colors shadow-sm">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-2">
                                <button onClick={runReport} disabled={loading} className={`w-full h-10 bg-[#0078d4] text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-[#005a9e] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                                    Run Analysis
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trial Balance Table */}
                    <div className="border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
                        <div className="bg-[#f8fafd] px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={18} className="text-[#0078d4]" />
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Validated Account Ledger Spectrum</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Debit</span>
                                    <span className="text-sm font-black text-[#0078d4] tabular-nums tracking-tighter">12,450.00</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200 mt-1" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Credit</span>
                                    <span className="text-sm font-black text-slate-700 tabular-nums tracking-tighter">12,450.00</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] border-collapse">
                                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="py-4 px-6 text-left border-b border-gray-100">Account ID</th>
                                        <th className="py-4 px-6 text-left border-b border-gray-100">Nomenclature</th>
                                        <th className="py-4 px-6 text-left border-b border-gray-100">Stratum</th>
                                        <th className="py-4 px-6 text-right border-b border-gray-100">Debit Vol.</th>
                                        <th className="py-4 px-6 text-right border-b border-gray-100">Credit Vol.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="py-4 px-6 text-slate-400 font-black tabular-nums">10100</td>
                                        <td className="py-4 px-6 font-bold text-slate-700">Main Operating Account</td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">Asset</span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-black text-[#0078d4] text-[13px] tabular-nums tracking-tighter">12,450.00</td>
                                        <td className="py-4 px-6 text-right font-black text-slate-200 text-[13px] tabular-nums tracking-tighter">0.00</td>
                                    </tr>
                                    <tr className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="py-4 px-6 text-slate-400 font-black tabular-nums">20100</td>
                                        <td className="py-4 px-6 font-bold text-slate-700">Accounts Payable</td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">Liability</span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-black text-slate-200 text-[13px] tabular-nums tracking-tighter">0.00</td>
                                        <td className="py-4 px-6 text-right font-black text-slate-700 text-[13px] tabular-nums tracking-tighter">5,200.00</td>
                                    </tr>
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <tr key={i} className="bg-slate-50/10 h-14">
                                            <td colSpan={5}></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 px-6 py-3 rounded-lg border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live Precision Protocol
                            </div>
                            <div className="h-4 w-[1px] bg-slate-300" />
                            <span>Timestamp: {new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PieChart size={14} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter">Strategic Financial Auditing Tool v2.4</span>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center Search Modal */}
            {showCCModal && (
                <SearchModal
                    title="Search Operation Cost Centers"
                    query={ccSearch}
                    setQuery={setCcSearch}
                    onClose={() => setShowCCModal(false)}
                    data={costCenters}
                    columns={[{ label: 'Code', key: 'code' }, { label: 'Center Nomenclature', key: 'name' }]}
                    onSelect={(cc) => {
                        setFormData({ ...formData, costCenterCode: cc.code, costCenterName: cc.name });
                        setShowCCModal(false);
                    }}
                />
            )}
        </>
    );
};

const SearchModal = ({ title, query, setQuery, onClose, data, columns, onSelect }) => (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-500/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] font-['Inter']">
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
                                    <button className="bg-white text-[#0078d4] text-[10px] px-4 py-1.5 rounded-md font-black border border-blue-200 shadow-sm transition-all hover:bg-[#0078d4] hover:text-white uppercase tracking-tighter">SELECT</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default TrialBalanceBoard;
