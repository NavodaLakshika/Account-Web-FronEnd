import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { 
  Search, Calendar, ChevronDown, Plus, Filter, FileText, 
  CreditCard, PenTool, Wallet, RefreshCw, Loader2, 
  ArrowUpRight, TrendingUp, DollarSign, Users, PieChart, AlertCircle
} from 'lucide-react';
import { expensesService } from '../services/expenses.service';
import { supplierService } from '../services/supplier.service';
import { getSessionData } from '../utils/session';
import { showErrorToast } from '../utils/toastUtils';


const ExpensesDashboardBoard = ({ 
  isOpen, 
  onClose, 
  onEnterBill, 
  onPayBill, 
  onWriteCheque, 
  onPettyCash 
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalExpenses: 0,
    unpaidBills: 0,
    overdueBills: 0,
    recentTransactions: [],
    categoryBreakdown: []
  });

  // Filter and Search states
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [vendorSearch, setVendorSearch] = useState('');
  const [suppliersMap, setSuppliersMap] = useState({});

  const [companyName, setCompanyName] = useState('Expense Workspace');

  const { companyCode } = getSessionData();

  useEffect(() => {
    try {
      const companyRaw = localStorage.getItem('selectedCompany');
      if (companyRaw) {
        const parsed = JSON.parse(companyRaw);
        setCompanyName(parsed.CompanyName || parsed.companyName || parsed.Company_Name || 'Expense Workspace');
      }
    } catch (e) {}
  }, []);

  const fetchDashboardData = async () => {
    if (!companyCode) return;
    setLoading(true);
    try {
      const [res, suppliers] = await Promise.all([
        expensesService.getDashboardData(companyCode, dateRange),
        supplierService.getAll().catch(() => [])
      ]);

      const sMap = {};
      if (Array.isArray(suppliers)) {
        suppliers.forEach(s => {
          sMap[s.SupplierCode || s.supplierCode] = s.SupplierName || s.supplierName || s.Name || s.name;
        });
      }
      setSuppliersMap(sMap);

      // Workaround for backend duplicate category issue (returning both Name and GL Code)
      if (res.categoryBreakdown && Array.isArray(res.categoryBreakdown)) {
        const cleaned = [];
        res.categoryBreakdown.forEach(cat => {
          if (/^\d+$/.test(cat.categoryName)) {
            // It's a numeric code. Check if there's a non-numeric category with the exact same amount
            const duplicate = res.categoryBreakdown.find(c => c.amount === cat.amount && !/^\d+$/.test(c.categoryName));
            if (duplicate) return; // skip this numeric one
          }
          cleaned.push(cat);
        });
        
        // Recalculate percentages after deduplication
        const total = cleaned.reduce((sum, c) => sum + c.amount, 0);
        cleaned.forEach(c => {
          c.percentage = total > 0 ? Math.round((c.amount / total) * 100) : 0;
        });
        
        res.categoryBreakdown = cleaned;
      }

      setData(res);
    } catch (error) {
      showErrorToast('Failed to load spend dashboard data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen, dateRange]);

  // Extract unique vendors from recent transactions to build a quick vendor list
  const getVendorSummary = () => {
    const vendorsMap = {};
    
    // Aggregate by vendor name or code
    data.recentTransactions.forEach(tx => {
      if (!tx.payee) return;
      if (!vendorsMap[tx.payee]) {
        vendorsMap[tx.payee] = {
          name: tx.payee,
          totalSpent: 0,
          outstanding: 0,
          txCount: 0
        };
      }
      vendorsMap[tx.payee].txCount += 1;
      
      if (tx.type === 'Bill' && (tx.status === 'Open' || tx.status === 'Overdue')) {
        vendorsMap[tx.payee].outstanding += tx.total;
      }
      if (tx.type !== 'Bill Payment') {
        vendorsMap[tx.payee].totalSpent += tx.total;
      }
    });

    return Object.values(vendorsMap)
      .filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // Filter transactions based on type, status, and search query
  const getFilteredTransactions = () => {
    return data.recentTransactions.filter(tx => {
      const matchesSearch = 
        tx.docNo.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.payee.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.category.toLowerCase().includes(txSearch.toLowerCase());
      
      const matchesType = txTypeFilter === 'all' || 
        (txTypeFilter === 'bill' && tx.type === 'Bill') ||
        (txTypeFilter === 'check' && tx.type === 'Check') ||
        (txTypeFilter === 'cash' && tx.type === 'Cash Expense') ||
        (txTypeFilter === 'payment' && tx.type === 'Bill Payment');
        
      const matchesStatus = txStatusFilter === 'all' || 
        tx.status.toLowerCase() === txStatusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  // Helper color indicators for category rows
  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 
      'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Expenses & Spend Intelligence Center"
      maxWidth="max-w-[1080px]"
    >
      <div className="flex flex-col gap-6 select-none font-['Plus_Jakarta_Sans'] text-slate-800">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">Dashboard</h2>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{companyName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Actions Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-xs shadow-sm shadow-blue-500/10">
                <Plus size={14} /> New Transaction
                <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-lg shadow-xl py-1 hidden group-hover:block z-50 animate-in fade-in duration-200">
                <button onClick={() => { onEnterBill(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FileText size={14} className="text-blue-500" /> Enter Bill
                </button>
                <button onClick={() => { onPayBill(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <CreditCard size={14} className="text-emerald-500" /> Pay Bills
                </button>
                <button onClick={() => { onWriteCheque(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <PenTool size={14} className="text-violet-500" /> Write Check
                </button>
                <button onClick={() => { onPettyCash(); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Wallet size={14} className="text-amber-500" /> Petty Cash Expense
                </button>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {['all', '30days', 'thismonth', 'thisquarter', 'thisyear'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all ${
                    dateRange === range 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === '30days' ? '30 Days' : range === 'thismonth' ? 'Month' : range === 'thisquarter' ? 'Quarter' : 'Year'}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Expenses */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-400/20 group hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-2 -translate-y-2">
              <DollarSign size={100} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-100/90 text-[10px] font-black uppercase tracking-[0.2em]">Total Operating Spend</span>
            </div>
            <div className="text-3xl font-black tracking-tight font-mono">
              {loading ? (
                <div className="h-9 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                `LKR ${data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-[10px] text-emerald-100/70 font-bold mt-2 uppercase tracking-wider flex items-center gap-1.5">
              Calculated from all bills, checks and cash items
            </p>
          </div>

          {/* Card 2: Open Payables */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg border border-amber-400/20 group hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-2 -translate-y-2">
              <FileText size={100} />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-100/90 text-[10px] font-black uppercase tracking-[0.2em]">Unpaid / Open Bills</span>
              {data.unpaidBills > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] opacity-80 font-black uppercase tracking-wider">AP Balance</span>
              )}
            </div>
            <div className="text-3xl font-black tracking-tight font-mono">
              {loading ? (
                <div className="h-9 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                `LKR ${data.unpaidBills.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-[10px] text-amber-100/70 font-bold mt-2 uppercase tracking-wider flex items-center gap-1.5">
              Outstanding vendor obligations pending payment
            </p>
          </div>

          {/* Card 3: Overdue Liabilities */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg border border-rose-400/20 group hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-2 -translate-y-2">
              <AlertCircle size={100} />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-100/90 text-[10px] font-black uppercase tracking-[0.2em]">Overdue Bills</span>
              {data.overdueBills > 0 && (
                <span className="px-2 py-0.5 bg-red-700/30 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-wider animate-pulse">Critical</span>
              )}
            </div>
            <div className="text-3xl font-black tracking-tight font-mono">
              {loading ? (
                <div className="h-9 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                `LKR ${data.overdueBills.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-[10px] text-rose-100/70 font-bold mt-2 uppercase tracking-wider flex items-center gap-1.5">
              Bills past their negotiated payment term due dates
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-100 flex items-center gap-6 mt-2">
          {[
            { id: 'overview', label: 'Spend Overview', icon: PieChart },
            { id: 'transactions', label: 'Expenses & Transactions', icon: FileText },
            { id: 'vendors', label: 'Vendor Directory', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 pb-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all relative ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={36} className="text-blue-500 animate-spin" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Dashboard Metrics...</span>
            </div>
          ) : (
            <>
              {/* 1. Overview Dashboard */}
              {selectedTab === 'overview' && (
                <div className="grid grid-cols-12 gap-8">
                  {/* Category Breakdown list */}
                  <div className="col-span-12 lg:col-span-6 bg-slate-50/50 border border-slate-100 p-6 rounded-2xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-6 flex items-center gap-2">
                      <PieChart size={14} className="text-blue-500" /> Operating Spend by Account Category
                    </h3>

                    {data.categoryBreakdown.length === 0 ? (
                      <div className="py-16 text-center text-slate-300 font-bold  text-[10px] uppercase tracking-wider">
                        No category spend details logged in this period.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.categoryBreakdown.map((cat, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-700 truncate max-w-[70%]">{cat.categoryName}</span>
                              <span className="text-slate-900 font-mono">
                                LKR {cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-slate-400 font-sans ml-2 text-[10px]">({cat.percentage}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${getCategoryColor(idx)}`} 
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="col-span-12 lg:col-span-6 bg-slate-50/50 border border-slate-100 p-6 rounded-2xl flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-4 flex items-center gap-2">
                      <ArrowUpRight size={14} className="text-blue-500" /> Recent Expense Feed
                    </h3>

                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[360px] pr-2 no-scrollbar">
                      {data.recentTransactions.slice(0, 10).map((tx, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-100/50 px-2 rounded-lg transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[220px]">{tx.payee || 'Direct Expense'}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                              <span>{tx.date.split('T')[0]}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="uppercase text-[9px] tracking-wide bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded font-bold">{tx.type}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 font-mono">
                            <span className="text-xs font-black text-slate-900">
                              LKR {tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              tx.status === 'Paid' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : tx.status === 'Overdue' 
                                  ? 'bg-rose-50 text-rose-600' 
                                  : 'bg-amber-50 text-amber-600'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {data.recentTransactions.length === 0 && (
                        <div className="py-16 text-center text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                          No transactions found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Transaction List Table */}
              {selectedTab === 'transactions' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {/* Table Toolbar */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search document no, vendor, account..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white shadow-sm transition-all"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
                        <select 
                          value={txTypeFilter}
                          onChange={(e) => setTxTypeFilter(e.target.value)}
                          className="h-9 px-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none shadow-sm"
                        >
                          <option value="all">All Types</option>
                          <option value="bill">Bills</option>
                          <option value="check">Checks</option>
                          <option value="cash">Cash Expenses</option>
                          <option value="payment">Bill Payments</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                        <select 
                          value={txStatusFilter}
                          onChange={(e) => setTxStatusFilter(e.target.value)}
                          className="h-9 px-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none shadow-sm"
                        >
                          <option value="all">All Statuses</option>
                          <option value="paid">Paid</option>
                          <option value="open">Open</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="overflow-x-auto max-h-[480px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 z-10 shadow-sm leading-10">
                        <tr>
                          <th className="px-6 w-[12%]">Date</th>
                          <th className="px-6 w-[12%]">Type</th>
                          <th className="px-6 w-[15%]">Doc No</th>
                          <th className="px-6 w-[20%]">Payee / Supplier</th>
                          <th className="px-6 w-[20%]">Category</th>
                          <th className="px-6 w-[12%] text-right">Amount</th>
                          <th className="px-6 w-[9%] text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {getFilteredTransactions().map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                            <td className="py-3 px-6 font-mono text-slate-500">{tx.date.split('T')[0]}</td>
                            <td className="py-3 px-6">
                              <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded font-black bg-slate-100 text-slate-500">
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3 px-6 font-mono text-blue-600">{tx.docNo}</td>
                            <td className="py-3 px-6 truncate max-w-[200px] uppercase font-mono">{suppliersMap[tx.payee] || tx.payee || '---'}</td>
                            <td className="py-3 px-6 text-slate-500 italic max-w-[200px] truncate">{tx.category || '---'}</td>
                            <td className="py-3 px-6 text-right font-mono font-black text-slate-900">
                              {tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                tx.status === 'Paid' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : tx.status === 'Overdue' 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {getFilteredTransactions().length === 0 && (
                          <tr>
                            <td colSpan="7" className="py-16 text-center text-slate-300 font-bold italic text-xs uppercase tracking-wider">
                              No transactions match the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Vendor Directory */}
              {selectedTab === 'vendors' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {/* Toolbar */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search vendor directory..."
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-xs font-semibold focus:border-blue-500 focus:outline-none bg-white shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Vendor Table */}
                  <div className="overflow-x-auto max-h-[480px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 z-10 shadow-sm leading-10">
                        <tr>
                          <th className="px-6 w-[20%]">Vendor Name</th>
                          <th className="px-6 w-[15%] text-center">Transactions</th>
                          <th className="px-6 w-[20%] text-right">Total Spent</th>
                          <th className="px-6 w-[20%] text-right">Outstanding (AP)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {getVendorSummary().map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                            <td className="py-3 px-6 font-mono uppercase text-slate-900">{v.name}</td>
                            <td className="py-3 px-6 text-center font-mono">{v.txCount}</td>
                            <td className="py-3 px-6 text-right font-mono text-slate-600">
                              LKR {v.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-6 text-right font-mono font-black text-rose-600">
                              {v.outstanding > 0 ? (
                                `LKR ${v.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              ) : (
                                <span className="text-slate-300 font-sans font-bold">LKR 0.00</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {getVendorSummary().length === 0 && (
                          <tr>
                            <td colSpan="4" className="py-16 text-center text-slate-300 font-bold italic text-xs uppercase tracking-wider">
                              No vendors match the search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SimpleModal>
  );
};

export default ExpensesDashboardBoard;
