import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Building2, Mail, Phone, MapPin, Globe, 
    LayoutDashboard, Activity, FileText, Settings,
    Search, Filter, ChevronRight, DollarSign, Users,
    CreditCard, ArrowUpRight, TrendingUp, BarChart3,
    Trash2, Eye, Calendar, Wallet, Database, Loader2,
    ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from '../components/modals/ConfirmModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const CompanyOverviewBoard = ({ company, onClose, onTransactionDeleted }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);
    const [searchTx, setSearchTx] = useState('');
    const [filterType, setFilterType] = useState('All');
    
    // Modals
    const [selectedTx, setSelectedTx] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        if (company) {
            fetchTransactions();
        }
    }, [company]);

    const fetchTransactions = async () => {
        setLoadingTx(true);
        try {
            const res = await api.get(`/SuperAdmin/company/${company.companyCode || company.code}/transactions`);
            setTransactions(res.data || []);
        } catch (e) {
            console.error("Error fetching txs", e);
            showErrorToast('Failed to fetch transactions');
        } finally {
            setLoadingTx(false);
        }
    };

    const handleDeleteTransaction = (docNo) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Transaction',
            message: `Are you sure you want to permanently delete transaction ${docNo}?`,
            onConfirm: async () => {
                try {
                    await api.delete(`/SuperAdmin/company/${company.companyCode || company.code}/transaction/${docNo}`);
                    setTransactions(prev => prev.filter(t => t.docNo !== docNo));
                    if (onTransactionDeleted) onTransactionDeleted();
                    showSuccessToast(`Transaction ${docNo} deleted`);
                } catch (error) {
                    showErrorToast('Failed to delete transaction');
                    console.error(error);
                } finally {
                    setConfirmConfig({ isOpen: false });
                    setSelectedTx(null);
                }
            }
        });
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.docNo?.toLowerCase().includes(searchTx.toLowerCase()) || 
                                  tx.account?.toLowerCase().includes(searchTx.toLowerCase());
            const matchesType = filterType === 'All' || tx.payType === filterType;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchTx, filterType]);

    // Analytics Calculations
    const revenueTransactions = useMemo(() => {
        return transactions.filter(tx => 
            tx.iid === 'INV' || 
            tx.iid === 'REC' || 
            (tx.category && String(tx.category).toUpperCase() === 'INCOME')
        );
    }, [transactions]);

    const totalRevenue = revenueTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const txCount = transactions.length;
    const avgValue = revenueTransactions.length > 0 ? (totalRevenue / revenueTransactions.length) : 0;
    
    // Real Chart Data based on actual Revenue transactions
    const chartData = useMemo(() => {
        const dataMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        revenueTransactions.forEach(tx => {
            // Check if amount exists and is positive
            if (tx.postDate && (tx.amount || 0) >= 0) {
                const d = new Date(tx.postDate);
                if (!isNaN(d.getTime())) {
                    const dayName = daysOrder[d.getDay()];
                    dataMap[dayName] += (tx.amount || 0);
                }
            }
        });
        
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
            day,
            value: dataMap[day]
        }));
    }, [revenueTransactions]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sales', label: 'Sales Dashboard', icon: Activity },
        { id: 'transactions', label: 'Transactions', icon: FileText },
    ];

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { title: 'Total Transactions', value: txCount, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                    { title: 'Avg. Transaction', value: `Rs ${avgValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                    { title: 'Active Users', value: company.activeUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0f172a]/50 p-5 border border-slate-200 dark:border-[#334155] hover:bg-[#334155]/30 rounded-none transition-all group shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 flex items-center justify-center border ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <h4 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.title}</h4>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Company Details */}
            <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] shadow-inner p-6 rounded-none">
                <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <Building2 size={14} className="text-blue-400" />
                    Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 rounded-none text-blue-400">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company Name</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{company.companyName || company.company_Name || company.comp_Name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 rounded-none text-blue-400">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{company.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 rounded-none text-blue-400">
                                <Phone size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{company.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 rounded-none text-blue-400">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                                    {company.address1 || 'N/A'} {company.country ? `, ${company.country}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Company Details */}
            <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] shadow-inner p-6 mt-6 rounded-none">
                <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <Database size={14} className="text-blue-400" />
                    Additional Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(company).map(([key, value]) => {
                        // Skip primary details already shown or internal object keys
                        if (['companyName', 'company_Name', 'comp_Name', 'email', 'phone', 'address1', 'country', 'companyCode', 'code', 'transactions', 'activeUsers'].includes(key)) return null;
                        if (typeof value === 'object' || typeof value === 'function') return null;
                        
                        return (
                            <div key={key} className="bg-black/20 p-4 border border-slate-200 dark:border-[#334155] flex flex-col justify-center rounded-none">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{key.replace(/_/g, ' ')}</h4>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 break-words">
                                    {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-600 font-normal italic">Empty</span>}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderSalesDashboard = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] p-6 shadow-inner rounded-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-400" /> Revenue Overview
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Weekly transaction performance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {['Week', 'Month', 'Year'].map(t => (
                            <button key={t} className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-black transition-all ${
                                t === 'Week' 
                                ? 'bg-[#0078d4] text-white shadow-sm border border-[#0078d4]' 
                                : 'bg-white dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#334155] hover:bg-[#334155]'
                            }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-slate-200 dark:border-[#334155] pb-2">
                    {chartData.map((d, i) => {
                        const maxVal = Math.max(...chartData.map(c => c.value)) || 1;
                        let heightPct = (d.value / maxVal) * 100;
                        if (heightPct < 2) heightPct = 2; // Show a small sliver even if 0 for visual consistency
                        
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                                <div className="w-full relative flex justify-center h-full items-end">
                                    <div 
                                        className="w-full max-w-[40px] bg-[#0078d4] opacity-80 border-t-2 border-blue-400 group-hover:opacity-100 group-hover:bg-blue-500 transition-all relative shadow-[0_0_15px_rgba(0,120,212,0.3)]"
                                        style={{ height: `${heightPct}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-[10px] font-bold px-2 py-1 rounded-none whitespace-nowrap z-10 shadow-lg">
                                            Rs {d.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );

    const renderTransactions = () => (
        <div className="bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] shadow-inner overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-none">
            <div className="p-4 border-b border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search Doc No or Account..." 
                        value={searchTx}
                        onChange={e => setSearchTx(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-[#334155] text-xs focus:outline-none focus:bg-white dark:bg-[#0f172a] focus:border-[#0078d4] transition-all bg-black/20 font-medium text-slate-800 dark:text-white placeholder:text-slate-600 rounded-none"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/20 border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-none">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select 
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer [&>option]:bg-white dark:bg-[#1e293b] [&>option]:text-slate-800 dark:text-white"
                        >
                            <option value="All">All Types</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit">Credit</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white dark:bg-[#1e293b]">
                {loadingTx ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-[#0078d4] animate-spin" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                        <div className="w-16 h-16 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] flex items-center justify-center mb-4 rounded-none">
                            <Database className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-800 dark:text-white font-bold text-sm mb-1">No Transactions Found</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0c0c0c]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(255,255,255,0.05)] border-b border-slate-200 dark:border-[#334155]">
                            <tr>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Doc No</th>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Type</th>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Account</th>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Date</th>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 text-right">Amount</th>
                                <th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/50">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.docNo} className="hover:bg-slate-100 dark:bg-white/5 transition-colors group">
                                    <td className="py-3 px-6">
                                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded-none">{tx.docNo}</span>
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                                            tx.payType === 'Cash' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' :
                                            tx.payType === 'Credit' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' :
                                            'bg-slate-600/20 text-slate-500 dark:text-slate-400 border-slate-500/50'
                                        }`}>
                                            {tx.payType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-xs text-slate-600 dark:text-slate-300 font-medium">{tx.account || 'System'}</td>
                                    <td className="py-3 px-6 text-xs text-slate-500 dark:text-slate-400">{tx.postDate || 'N/A'}</td>
                                    <td className="py-3 px-6 text-xs font-black text-slate-800 dark:text-white text-right">Rs {(tx.amount || 0).toFixed(2)}</td>
                                    <td className="py-3 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setSelectedTx(tx)}
                                                className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-none transition-all bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/50 hover:bg-blue-600/40 flex items-center gap-1"
                                                title="View Details"
                                            >
                                                <Eye size={10} /> View
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTransaction(tx.docNo)}
                                                className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-none transition-all bg-red-600/20 text-red-400 shadow-sm border border-red-500/50 hover:bg-red-600/40 flex items-center gap-1"
                                                title="Delete"
                                            >
                                                <Trash2 size={10} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-[95vw] max-w-[1500px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 rounded-none">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0f172a]/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0078d4] text-white flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(0,120,212,0.4)]">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {company.companyName || company.company_Name || company.comp_Name}
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">Company Overview (ID: {company.companyCode || company.code})</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-[#334155] transition-all rounded-none"
                    >
                        <X size={24} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Horizontal Tab Navigation */}
                <div className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-[#334155] px-6 py-4 flex items-center gap-3 overflow-x-auto shrink-0 scrollbar-hide shadow-inner">
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-none transition-all text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                                    active 
                                        ? 'bg-[#0078d4] text-white shadow-[0_0_10px_rgba(0,120,212,0.3)] border border-[#0078d4]' 
                                        : 'bg-black/20 text-slate-500 dark:text-slate-400 hover:bg-[#334155] hover:text-slate-800 dark:text-white border border-slate-200 dark:border-[#334155]'
                                }`}
                            >
                                <tab.icon size={14} className={active ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 relative bg-transparent">
                    <div className="w-full max-w-none h-full flex flex-col">
                        <div className="mb-6 pb-4 border-b border-slate-200 dark:border-[#334155]/50">
                            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-wide flex items-center gap-2">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage and monitor detailed metrics for {company.companyName || company.company_Name || company.comp_Name}</p>
                        </div>

                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'sales' && renderSalesDashboard()}
                        {activeTab === 'transactions' && renderTransactions()}
                    </div>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
                    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-emerald-500 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 rounded-none">
                        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
                            <div>
                                <h3 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <ShieldAlert className="text-emerald-400" size={16} />
                                    Transaction Details
                                </h3>
                                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 tracking-wider">DOC: {selectedTx.docNo}</p>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-[#334155] transition-all rounded-none">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 bg-transparent">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount</p>
                                    <p className="text-xl font-black text-emerald-400">Rs {(selectedTx.amount || 0).toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Date</p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1.5">{selectedTx.postDate || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Account</p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-1.5">{selectedTx.account || 'System'}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Payment Type</p>
                                    <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                                        selectedTx.payType === 'Cash' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' :
                                        selectedTx.payType === 'Credit' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' :
                                        'bg-slate-600/20 text-slate-500 dark:text-slate-400 border-slate-500/50'
                                    }`}>
                                        {selectedTx.payType || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0f172a]/50 flex justify-end gap-3">
                            <button 
                                onClick={() => handleDeleteTransaction(selectedTx.docNo)}
                                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 rounded-none transition-all flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Delete Record
                            </button>
                            <button 
                                onClick={() => setSelectedTx(null)}
                                className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] border border-[#0078d4] text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-none shadow-md transition-all active:scale-95"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                variant="danger"
                confirmText="Permanently Delete"
            />
        </div>
    );
};

export default CompanyOverviewBoard;




