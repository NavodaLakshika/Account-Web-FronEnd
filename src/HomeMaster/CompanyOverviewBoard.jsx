import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Building2, Mail, Phone, MapPin, Globe, 
    LayoutDashboard, Activity, FileText, Settings,
    Search, Filter, ChevronRight, DollarSign, Users,
    CreditCard, ArrowUpRight, TrendingUp, BarChart3,
    Trash2, Eye, Calendar, Wallet, Database, Loader2
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
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const txCount = transactions.length;
    const avgValue = txCount > 0 ? (totalRevenue / txCount) : 0;
    
    // Mock Chart Data based on actual transactions
    const chartData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day,
            value: Math.floor(Math.random() * (totalRevenue > 0 ? totalRevenue / 2 : 10000))
        }));
    }, [totalRevenue]);

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
                    { title: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { title: 'Total Transactions', value: txCount, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { title: 'Avg. Transaction', value: `Rs ${avgValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { title: 'Active Users', value: 'N/A', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
 <div key={i} className="bg-white p-5  shadow-sm hover:border-slate-200 rounded-[12px] transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10  flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1  flex items-center gap-1">
                                <ArrowUpRight size={12} /> +12%
                            </span>
                        </div>
                        <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</h4>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Company Details */}
 <div className="bg-white  shadow-sm p-6">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Company Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10  bg-slate-50 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</p>
                                <p className="text-sm font-semibold text-slate-900">{company.companyName || company.company_Name || company.comp_Name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10  bg-slate-50 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                                <p className="text-sm font-semibold text-slate-900">{company.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10  bg-slate-50 flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                                <p className="text-sm font-semibold text-slate-900">{company.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10  bg-slate-50 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {company.address1 || 'N/A'} {company.country ? `, ${company.country}` : ''}
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>
            </div>

            {/* Full Company Details */}
 <div className="bg-white  shadow-sm p-6 mt-6">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Additional Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(company).map(([key, value]) => {
                        // Skip primary details already shown or internal object keys
                        if (['companyName', 'company_Name', 'comp_Name', 'email', 'phone', 'address1', 'country', 'companyCode', 'code', 'transactions'].includes(key)) return null;
                        if (typeof value === 'object' || typeof value === 'function') return null;
                        
                        return (
                            <div key={key} className="bg-slate-50 p-4  border border-slate-100 flex flex-col justify-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{key.replace(/_/g, ' ')}</h4>
                                <p className="text-sm font-bold text-slate-800 break-words">
                                    {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-300 font-normal italic">Empty</span>}
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
 <div className="bg-white p-6  shadow-sm ">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                        <p className="text-sm text-slate-500">Weekly transaction performance</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 ">
                        {['Week', 'Month', 'Year'].map(t => (
                            <button key={t} className={`px-4 py-1.5 text-xs font-bold rounded-[3px] transition-colors ${t === 'Week' ? 'bg-white text-[#0078d4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {chartData.map((d, i) => {
                        const maxVal = Math.max(...chartData.map(c => c.value)) || 1;
                        const heightPct = (d.value / maxVal) * 100;
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="w-full relative flex justify-center h-full items-end">
                                    <div 
                                        className="w-full max-w-[40px] bg-blue-100 rounded-t-xl group-hover:bg-blue-200 transition-colors relative"
                                        style={{ height: `${heightPct}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                                            Rs {d.value.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{d.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-white p-6  shadow-sm ">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50  transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10  bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Wallet size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{tx.docNo}</p>
                                        <p className="text-xs text-slate-500">{tx.postDate || 'Just now'}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-500">+ Rs {tx.amount?.toFixed(2) || '0.00'}</span>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>

 <div className="bg-white p-6  shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-orange-50  flex items-center justify-center text-orange-400 mb-4">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Advanced Analytics</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">Detailed sales breakdowns, product performance, and forecasting tools are available in the Pro version.</p>
                    <button className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold uppercase tracking-wider  shadow-md rounded-[12px] transition-all active:scale-95">
                        Upgrade Features
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTransactions = () => (
 <div className="bg-white  shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search Doc No or Account..." 
                        value={searchTx}
                        onChange={e => setSearchTx(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200  text-sm focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4] rounded-[12px] transition-all bg-white font-medium"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200  px-3 py-1.5">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit">Credit</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {loadingTx ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-[#0078d4] animate-spin" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50  flex items-center justify-center mb-4">
                            <Database className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-bold text-lg mb-1">No Transactions Found</p>
                        <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                            <tr>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400">Doc No</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400">Type</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400">Account</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400">Date</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400 text-right">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold tracking-wider uppercase text-slate-400 text-center">Actions</th>
                            <th className="text-right px-5 py-3">Action</th></tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(tx => (
                                <tr key={tx.docNo} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-4 px-6 font-mono text-sm text-slate-900 font-bold">{tx.docNo}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-[3px] ${
                                            tx.payType === 'Cash' ? 'bg-emerald-100 text-emerald-700' :
                                            tx.payType === 'Credit' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {tx.payType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">{tx.account || 'System'}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{tx.postDate || 'N/A'}</td>
                                    <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">Rs {(tx.amount || 0).toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedTx(tx)}
                                                className="p-2 text-slate-400 hover:text-[#0078d4] hover:bg-[#0078d4]/10  rounded-[12px] transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTransaction(tx.docNo)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50  rounded-[12px] transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
            <div className="bg-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[95vw] h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0078d4]/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-[#0078d4]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-800">{company.companyName || company.company_Name || company.comp_Name}</h2>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Company Overview (ID: {company.companyCode || company.code})</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-[12px] transition-all active:scale-95"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Horizontal Tab Navigation */}
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-hide">
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-[12px] transition-all font-bold text-sm whitespace-nowrap ${
                                    active 
                                        ? 'bg-[#0078d4] text-white shadow-md shadow-[#0078d4]/20' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-hide">
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2  rounded-[12px] transition-all font-bold text-sm whitespace-nowrap ${
                                    active 
                                        ? 'bg-[#0078d4] text-white shadow-md shadow-[#0078d4]/20' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 relative">
                    <div className="w-full max-w-none h-full flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage and monitor detailed metrics for {company.companyName || company.company_Name || company.comp_Name}</p>
                        </div>

                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'sales' && renderSalesDashboard()}
                        {activeTab === 'transactions' && renderTransactions()}
                    </div>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-[15px] font-bold text-slate-800">Transaction Details</h3>
                                <p className="text-[11px] font-mono text-slate-500 font-medium mt-0.5">{selectedTx.docNo}</p>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-[12px] transition-all">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amount</p>
                                    <p className="text-xl font-black text-emerald-500">Rs {(selectedTx.amount || 0).toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Date</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedTx.postDate || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Account</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedTx.account || 'System'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Payment Type</p>
                                    <span className="inline-block mt-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                        {selectedTx.payType || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                            <button 
                                onClick={() => handleDeleteTransaction(selectedTx.docNo)}
                                className="px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-[12px] transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Record
                            </button>
                            <button 
                                onClick={() => setSelectedTx(null)}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-[12px] shadow-md transition-all active:scale-95"
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
