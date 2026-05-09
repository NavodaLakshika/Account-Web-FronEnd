import React, { useState, useEffect } from 'react';
import { 
    Search, Printer, Calendar, Filter, 
    CheckCircle2, XCircle, ArrowRight, 
    Info, CreditCard, User, Landmark, 
    RotateCcw, ChevronRight, LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import chequePrintService from '../services/chequePrint.service';

const ChequePrintBoard = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [], payees: [] });
    const [results, setResults] = useState([]);
    
    // Filters State
    const [filters, setFilters] = useState({
        accId: '',
        searchType: 'ALL', // ALL, CHQ_NO, DATE, PAYEE, ADP
        val1: '',
        val2: '',
        company: localStorage.getItem('companyCode') || 'COM002'
    });

    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchInitData();
    }, []);

    const fetchInitData = async () => {
        try {
            setLoading(true);
            const data = await chequePrintService.getInitData(filters.company);
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!filters.accId && filters.searchType !== 'ADP') {
            toast.error('Please select an account first');
            return;
        }

        try {
            setSearching(true);
            const data = await chequePrintService.searchCheques(filters);
            setResults(data);
            setSelectedRows([]);
            if (data.length === 0) {
                toast('No cheques found for the selected criteria', { icon: 'ℹ️' });
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const toggleRow = (chqNo) => {
        if (selectedRows.includes(chqNo)) {
            setSelectedRows(selectedRows.filter(r => r !== chqNo));
        } else {
            setSelectedRows([...selectedRows, chqNo]);
        }
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one cheque to print');
            return;
        }
        toast.success(`Sent ${selectedRows.length} cheques to print queue`);
        // Actual print logic would go here (e.g. generating a PDF or calling a print endpoint)
    };

    const handleClear = () => {
        setFilters({
            ...filters,
            searchType: 'ALL',
            val1: '',
            val2: ''
        });
        setResults([]);
        setSelectedRows([]);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-2xl shadow-xl">
                <div className="w-48 h-48">
                    <DotLottiePlayer src="https://lottie.host/801a248f-374c-47f9-8473-b31c07080e74/HThQx0u0jD.json" autoplay loop />
                </div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-4">Initializing Utility...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[85vh] bg-[#f8fafc] rounded-2xl overflow-hidden shadow-2xl border border-white">
            {/* Header */}
            <div className="bg-white px-8 py-5 flex justify-between items-center border-b border-slate-100 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Printer className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                            Cheque Printing Utility
                        </h1>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Financial Document Processing Hub</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleClear}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600 group"
                        title="Clear Filters"
                    >
                        <RotateCcw size={20} className="group-active:rotate-[-180deg] transition-transform duration-500" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-500 group"
                    >
                        <XCircle size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* Sidebar Filters */}
                <div className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Landmark size={12} /> Settlement Account
                        </h3>
                        <select 
                            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={filters.accId}
                            onChange={(e) => setFilters({...filters, accId: e.target.value})}
                        >
                            <option value="">Select Account...</option>
                            {lookups.accounts.map(acc => (
                                <option key={acc.code} value={acc.code}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Filter size={12} /> Search Criteria
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'ALL', label: 'Unprinted Cheques', icon: <LayoutGrid size={14}/> },
                                { id: 'CHQ_NO', label: 'Cheque Range', icon: <CreditCard size={14}/> },
                                { id: 'DATE', label: 'Date Range', icon: <Calendar size={14}/> },
                                { id: 'PAYEE', label: 'Specific Payee', icon: <User size={14}/> },
                                { id: 'ADP', label: 'Advance Pay Ref', icon: <ArrowRight size={14}/> },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setFilters({...filters, searchType: type.id, val1: '', val2: ''})}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                        filters.searchType === type.id 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {type.icon}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Inputs based on SearchType */}
                    <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                        {filters.searchType === 'CHQ_NO' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Range</p>
                                <input 
                                    type="text" placeholder="From No" 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val1} onChange={(e) => setFilters({...filters, val1: e.target.value})}
                                />
                                <input 
                                    type="text" placeholder="To No" 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val2} onChange={(e) => setFilters({...filters, val2: e.target.value})}
                                />
                            </div>
                        )}

                        {filters.searchType === 'DATE' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Period</p>
                                <input 
                                    type="date" 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val1} onChange={(e) => setFilters({...filters, val1: e.target.value})}
                                />
                                <input 
                                    type="date" 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val2} onChange={(e) => setFilters({...filters, val2: e.target.value})}
                                />
                            </div>
                        )}

                        {filters.searchType === 'PAYEE' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Payee</p>
                                <select 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val1} onChange={(e) => setFilters({...filters, val1: e.target.value})}
                                >
                                    <option value="">Select Payee...</option>
                                    {lookups.payees.map(p => (
                                        <option key={p.code} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filters.searchType === 'ADP' && (
                            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Reference Number</p>
                                <input 
                                    type="text" placeholder="e.g. ADP-001" 
                                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none"
                                    value={filters.val1} onChange={(e) => setFilters({...filters, val1: e.target.value})}
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleSearch}
                            disabled={searching}
                            className="w-full h-12 bg-slate-800 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {searching ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>FETCH RECORDS <ChevronRight size={14} /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black">
                                {results.length}
                            </span>
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Records Identified</h2>
                        </div>

                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <p className="text-[11px] font-bold text-blue-600 italic">
                                    {selectedRows.length} items selected for processing
                                </p>
                                <button 
                                    onClick={handlePrint}
                                    className="px-5 h-9 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    <Printer size={14} /> PRINT SELECTION
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <div className="w-32 h-32 mb-4 grayscale opacity-50">
                                    <DotLottiePlayer src="https://lottie.host/82548843-0943-4f99-a9c1-586b68516087/OndE3QhYtK.json" autoplay loop />
                                </div>
                                <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">No results to display</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 w-12">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 transition-all"
                                                checked={selectedRows.length === results.length}
                                                onChange={() => {
                                                    if (selectedRows.length === results.length) setSelectedRows([]);
                                                    else setSelectedRows(results.map(r => r.chqNo));
                                                }}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cheque No</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payee Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Disbursement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.map((row, idx) => (
                                        <tr 
                                            key={idx} 
                                            className={`group hover:bg-slate-50 transition-colors cursor-pointer ${selectedRows.includes(row.chqNo) ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => toggleRow(row.chqNo)}
                                        >
                                            <td className="px-8 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 transition-all"
                                                    checked={selectedRows.includes(row.chqNo)}
                                                    readOnly
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-800 font-mono tracking-wider group-hover:text-blue-600 transition-colors">
                                                        {row.chqNo}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Instrument ID</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span className="text-[12px] font-bold text-slate-600">{row.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-slate-700 uppercase">{row.payee}</span>
                                                    <span className="text-[9px] font-bold text-blue-400 tracking-widest">AUTHORIZED VENDOR</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[14px] font-black text-slate-800">
                                                    {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-4 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Info size={12} className="text-blue-400"/> Ensure printer is calibrated for standard cheques</span>
                        </div>
                        <div className="flex items-center gap-2">
                            Total Page Sum: <span className="text-slate-700 font-black">
                                {results.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChequePrintBoard;
