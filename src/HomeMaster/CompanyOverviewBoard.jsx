import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, Mail, Phone, MapPin, Globe, LayoutDashboard, Activity, FileText, Settings,
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
const matchesSearch = tx.docNo?.toLowerCase().includes(searchTx.toLowerCase()) || tx.account?.toLowerCase().includes(searchTx.toLowerCase());
const matchesType = filterType === 'All' || tx.payType === filterType;
return matchesSearch && matchesType;
});
}, [transactions, searchTx, filterType]);
// Analytics Calculations
const revenueTransactions = useMemo(() => {
return transactions.filter(tx => tx.iid === 'INV' || tx.iid === 'REC' || (tx.category && String(tx.category).toUpperCase() === 'INCOME')
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
<div className="space-y-6">
{/* KPI Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
{[
        { title: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
{ title: 'Total Transactions', value: txCount, icon: CreditCard, gradient: 'from-blue-500 to-blue-600' },
{ title: 'Avg. Transaction', value: `Rs ${avgValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
{ title: 'Active Users', value: company.activeUsers || 0, icon: Users, gradient: 'from-purple-500 to-purple-600' },
].map((stat, i) => (
<div key={i} className="relative overflow-hidden bg-gradient-to-br text-white p-4 rounded-[3px] shadow-lg border border-white/10 flex flex-col" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}>
<div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
<div className="relative z-10 flex flex-col h-full">
<div className="flex items-center justify-between mb-3">
<div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white shadow-inner">
<stat.icon size={16} strokeWidth={2.5} />
</div>
</div>
<div className="mt-auto">
<span className="text-[10px] font-black uppercase tracking-widest text-white/70 block">{stat.title}</span>
<p className="text-2xl font-black tracking-tight font-['Tahoma'] text-white">{stat.value}</p>
</div>
</div>
</div>
))}
</div>
{/* Company Details */}
<div className="bg-white border border-gray-200 p-6 rounded-[3px]">
<h3 className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-6 flex items-center gap-2">
<Building2 size={14} className="text-[#0285fd]" />
Company Profile
</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-4">
<div className="flex items-start gap-4">
<div className="w-9 h-9 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 rounded-[3px] text-[#0285fd]">
<Building2 size={16} />
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Company Name</p>
<p className="text-sm font-bold text-gray-800 mt-0.5">{company.companyName || company.company_Name || company.comp_Name}</p>
</div>
</div>
<div className="flex items-start gap-4">
<div className="w-9 h-9 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 rounded-[3px] text-[#0285fd]">
<Mail size={16} />
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</p>
<p className="text-sm font-bold text-gray-800 mt-0.5">{company.email || 'N/A'}</p>
</div>
</div>
</div>
<div className="space-y-4">
<div className="flex items-start gap-4">
<div className="w-9 h-9 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 rounded-[3px] text-[#0285fd]">
<Phone size={16} />
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Phone Number</p>
<p className="text-sm font-bold text-gray-800 mt-0.5">{company.phone || 'N/A'}</p>
</div>
</div>
<div className="flex items-start gap-4">
<div className="w-9 h-9 bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 rounded-[3px] text-[#0285fd]">
<MapPin size={16} />
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Location</p>
<p className="text-sm font-bold text-gray-800 mt-0.5">
{company.address1 || 'N/A'} {company.country ? `, ${company.country}` : ''}
</p>
</div>
</div>
</div>
</div>
</div>
{/* Full Company Details */}
<div className="bg-white border border-gray-200 p-6 mt-6 rounded-[3px]">
<h3 className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-6 flex items-center gap-2">
<Database size={14} className="text-[#0285fd]" />
Additional Details
</h3>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{Object.entries(company).map(([key, value]) => {
// Skip primary details already shown or internal object keys
if (['companyName', 'company_Name', 'comp_Name', 'email', 'phone', 'address1', 'country', 'companyCode', 'code', 'transactions', 'activeUsers'].includes(key)) return null;
if (typeof value === 'object' || typeof value === 'function') return null;
return (
<div key={key} className="bg-gray-50 p-4 border border-gray-200 flex flex-col justify-center rounded-[3px]">
<h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{key.replace(/_/g, ' ')}</h4>
<p className="text-xs font-bold text-gray-700 break-words">
{value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-gray-500 font-normal italic">Empty</span>}
</p>
</div>
);
})}
</div>
</div>
</div>
);
const renderSalesDashboard = () => (
<div className="space-y-6">
<div className="bg-white border border-gray-200 p-6 rounded-[3px]">
<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
<div>
<h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
<TrendingUp size={16} className="text-[#0285fd]" /> Revenue Overview
</h3>
<p className="text-[11px] text-gray-500 mt-1">Weekly transaction performance</p>
</div>
<div className="flex items-center gap-2">
{['Week', 'Month', 'Year'].map(t => (
<button key={t} className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-black transition-all ${
t === 'Week' ? 'bg-[#0285fd] text-white shadow-sm border border-[#0285fd] rounded-[3px]' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-[3px]'
}`}>
{t}
</button>
))}
</div>
</div>
{/* CSS Bar Chart */}
<div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-200 pb-2">
{chartData.map((d, i) => {
const maxVal = Math.max(...chartData.map(c => c.value)) || 1;
let heightPct = (d.value / maxVal) * 100;
if (heightPct < 2) heightPct = 2;
return (
<div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
<div className="w-full relative flex justify-center h-full items-end">
<div className="w-full max-w-[40px] bg-[#0285fd] opacity-80 border-t-2 border-[#0285fd] group-hover:opacity-100 transition-all relative rounded-[3px]"
style={{ height: `${heightPct}%` }}
>
<div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-[3px] whitespace-nowrap z-10 shadow-lg">
Rs {d.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
</div>
</div>
</div>
<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d.day}</span>
</div>
);
})}
</div>
</div>
</div>
);
const renderTransactions = () => (
<div className="bg-white border border-gray-200 overflow-hidden flex flex-col h-full rounded-[3px]">
<div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
<div className="relative flex-1 max-w-md">
<Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
<input type="text" placeholder="Search Doc No or Account..." value={searchTx}
onChange={e => setSearchTx(e.target.value)}
className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-[3px] text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 placeholder:text-gray-400"
/>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2 bg-white border border-gray-300 px-3 h-10 rounded-[3px]">
<Filter className="w-4 h-4 text-gray-500" />
<select value={filterType}
onChange={e => setFilterType(e.target.value)}
className="bg-transparent text-xs font-bold text-gray-600 focus:outline-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-700"
>
<option value="All">All Types</option>
<option value="Cash">Cash</option>
<option value="Credit">Credit</option>
<option value="Cheque">Cheque</option>
</select>
</div>
</div>
</div>
<div className="flex-1 overflow-auto bg-white">
{loadingTx ? (
<div className="flex justify-center items-center h-64">
<Loader2 className="w-8 h-8 text-[#0285fd] animate-spin" />
</div>
) : filteredTransactions.length === 0 ? (
<div className="flex flex-col items-center justify-center h-64 text-center px-4">
<div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center mb-4 rounded-[3px]">
<Database className="w-8 h-8 text-gray-400" />
</div>
<p className="text-gray-800 font-bold text-sm mb-1">No Transactions Found</p>
<p className="text-xs text-gray-500">Try adjusting your filters or search terms.</p>
</div>
) : (
<table className="w-full text-left border-collapse min-w-[800px]">
<thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-gray-200">
<tr>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">Doc No</th>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">Type</th>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">Account</th>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">Date</th>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">Amount</th>
<th className="py-3 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-center">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-200">
{filteredTransactions.map(tx => (
<tr key={tx.docNo} className="hover:bg-gray-50 transition-colors group">
<td className="py-3 px-6">
<span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-[3px]">{tx.docNo}</span>
</td>
<td className="py-3 px-6">
<span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-[3px] border ${
tx.payType === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
tx.payType === 'Credit' ? 'bg-blue-50 text-blue-700 border-blue-300' :
'bg-gray-50 text-gray-600 border-gray-300'
}`}>
{tx.payType || 'N/A'}
</span>
</td>
<td className="py-3 px-6 text-xs text-gray-600 font-medium">{tx.account || 'System'}</td>
<td className="py-3 px-6 text-xs text-gray-500">{tx.postDate || 'N/A'}</td>
<td className="py-3 px-6 text-xs font-black text-gray-800 text-right">Rs {(tx.amount || 0).toFixed(2)}</td>
<td className="py-3 px-6">
<div className="flex items-center justify-center gap-2">
<button onClick={() => setSelectedTx(tx)}
className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all bg-[#0285fd] text-white border border-[#0285fd] hover:bg-[#0073ff] flex items-center gap-1 shadow-sm"
title="View Details"
>
<Eye size={10} /> View
</button>
<button onClick={() => handleDeleteTransaction(tx.docNo)}
className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all bg-white text-red-600 border border-red-300 hover:bg-red-50 flex items-center gap-1 shadow-sm"
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
<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
<div className="bg-white border border-gray-200 shadow-2xl w-[95vw] max-w-[1500px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden rounded-[3px]">
{/* Modal Header */}
<div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-[#0285fd] text-white flex items-center justify-center rounded-[3px] shadow-sm">
<Building2 className="w-5 h-5" />
</div>
<div>
<h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
{company.companyName || company.company_Name || company.comp_Name}
</h2>
<p className="text-[11px] text-gray-500 mt-0.5 tracking-wide">Company Overview (ID: {company.companyCode || company.code})</p>
</div>
</div>
<button onClick={onClose}
className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-[3px]">
                            <X size={24} strokeWidth={1.5} />
</button>
</div>
{/* Horizontal Tab Navigation */}
<div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 overflow-x-auto shrink-0 scrollbar-hide">
{tabs.map(tab => {
const active = activeTab === tab.id;
return (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id)}
className={`flex items-center gap-2 px-5 py-2.5 rounded-[3px] transition-all text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
active ? 'bg-[#0285fd] text-white shadow-sm border border-[#0285fd]' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
}`}
>
<tab.icon size={14} className={active ? 'text-white' : 'text-gray-500'} />
{tab.label}
</button>
);
})}
</div>
{/* Main Content Area */}
<div className="flex-1 overflow-y-auto p-6 relative bg-transparent">
<div className="w-full max-w-none h-full flex flex-col">
<div className="mb-6 pb-4 border-b border-gray-200">
<h2 className="text-lg font-black text-gray-800 tracking-wide flex items-center gap-2">
{tabs.find(t => t.id === activeTab)?.label}
</h2>
<p className="text-xs text-gray-500 mt-1">Manage and monitor detailed metrics for {company.companyName || company.company_Name || company.comp_Name}</p>
</div>
{activeTab === 'overview' && renderOverview()}
{activeTab === 'sales' && renderSalesDashboard()}
{activeTab === 'transactions' && renderTransactions()}
</div>
</div>
</div>
    {/* Transaction Details Modal */}
    {selectedTx && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden rounded-[3px]">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                            <ShieldAlert className="text-emerald-600" size={16} />
                            Transaction Details
                        </h3>
                        <p className="text-[12px] text-gray-500 mt-1">DOC: {selectedTx.docNo}</p>
                    </div>
                    <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-[3px]">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount</label>
                                <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-emerald-600 flex items-center rounded-[3px]">
                                    Rs {(selectedTx.amount || 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-gray-700 flex items-center rounded-[3px]">
                                    {selectedTx.postDate || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account</label>
                                <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-medium text-gray-700 flex items-center rounded-[3px]">
                                    {selectedTx.account || 'System'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Type</label>
                                <div className="w-full h-10 border border-gray-200 bg-gray-50/50 px-3 text-[14px] font-bold text-gray-700 flex items-center rounded-[3px]">
                                    <span className={`inline-block px-3 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-[3px] border ${
                                        selectedTx.payType === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                        selectedTx.payType === 'Credit' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                        'bg-gray-50 text-gray-600 border-gray-300'
                                    }`}>
                                        {selectedTx.payType || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => handleDeleteTransaction(selectedTx.docNo)}
                            className="px-6 h-10 bg-white hover:bg-red-50 border border-red-300 text-red-600 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Record
                        </button>
                        <button onClick={() => setSelectedTx(null)}
                            className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all"
                        >
                            Close Details
                        </button>
                    </div>
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
