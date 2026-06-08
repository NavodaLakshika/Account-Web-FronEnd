import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { 
  Search, Calendar, ChevronDown, Plus, Filter, FileText, 
  CreditCard, PenTool, Wallet, RefreshCw, Loader2, 
  ArrowUpRight, TrendingUp, DollarSign, Users, PieChart, AlertCircle
} from 'lucide-react';
import { biDashboardService } from '../services/biDashboard.service';
import { getSessionData } from '../utils/session';
import { showErrorToast } from '../utils/toastUtils';

const ProfitLossDashboardBoard = ({ 
  isOpen, 
  onClose, 
  onEnterBill, 
  onPayBill, 
  onWriteCheque, 
  onPettyCash 
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    recentTransactions: [],
    categoryBreakdown: []
  });

  const [companyName, setCompanyName] = useState('Profit & Loss Workspace');

  const { companyCode } = getSessionData();

  useEffect(() => {
    try {
      const companyRaw = localStorage.getItem('selectedCompany');
      if (companyRaw) {
        const parsed = JSON.parse(companyRaw);
        setCompanyName(parsed.CompanyName || parsed.companyName || parsed.Company_Name || 'Profit & Loss Workspace');
      }
    } catch (e) {}
  }, []);

  const fetchDashboardData = async () => {
    if (!companyCode) return;
    setLoading(true);
    try {
      const res = await biDashboardService.getSummary(companyCode);
      
      setData({
        totalIncome: res.totalIncome || 0,
        totalExpenses: res.totalExpenses || 0,
        recentTransactions: res.recentTransactions || [],
        categoryBreakdown: res.categoryBreakdown || []
      });
    } catch (error) {
      showErrorToast('Failed to load profit and loss data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  const netProfit = data.totalIncome - data.totalExpenses;
  const profitColor = netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500';
  const profitBg = netProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600';

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Profit & Loss Intelligence Center"
      maxWidth="max-w-[1180px]"
    >
      <div className="flex flex-col gap-6 select-none font-['Plus_Jakarta_Sans'] text-slate-800">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">Profit & Loss Dashboard</h2>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{companyName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
          {/* Net Profit */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${profitBg} text-white p-6 rounded-2xl shadow-lg group hover:shadow-xl hover:scale-[1.01] transition-all duration-300`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-2 -translate-y-2">
              <TrendingUp size={100} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Net Profit (Loss)</span>
            </div>
            <div className="text-3xl font-black tracking-tight font-['Tahoma']">
              {loading ? (
                <div className="h-9 w-32 bg-white/20 rounded animate-pulse" />
              ) : (
                `LKR ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
          </div>

          {/* Income */}
          <div className="relative overflow-hidden bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-400 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Income</span>
            </div>
            <div className="text-3xl font-black tracking-tight font-['Tahoma']">
              {loading ? (
                <div className="h-9 w-32 bg-slate-100 rounded animate-pulse" />
              ) : (
                `LKR ${data.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="relative overflow-hidden bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-amber-400 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Expenses</span>
            </div>
            <div className="text-3xl font-black tracking-tight font-['Tahoma']">
              {loading ? (
                <div className="h-9 w-32 bg-slate-100 rounded animate-pulse" />
              ) : (
                `LKR ${data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-100 flex items-center gap-6 mt-2">
          {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'transactions', label: 'Recent Transactions', icon: FileText }
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
            </div>
          ) : (
            <>
              {selectedTab === 'overview' && (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
                    <PieChart size={64} className="text-slate-300 mb-4" />
                    <span className="text-slate-500 font-bold">More charts coming soon!</span>
                </div>
              )}
              {selectedTab === 'transactions' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto max-h-[480px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 z-10 shadow-sm leading-10">
                        <tr>
                          <th className="px-6 w-[15%]">Date</th>
                          <th className="px-6 w-[15%]">Type</th>
                          <th className="px-6 w-[20%]">Doc No</th>
                          <th className="px-6 w-[30%]">Details</th>
                          <th className="px-6 w-[20%] text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {data.recentTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                            <td className="py-3 px-6 font-mono text-slate-500">{tx.date.split('T')[0]}</td>
                            <td className="py-3 px-6">
                              <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded font-black bg-slate-100 text-slate-500">
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3 px-6 font-mono text-blue-600">{tx.docNo}</td>
                            <td className="py-3 px-6 truncate max-w-[300px] font-mono">{tx.payee || tx.category || '---'}</td>
                            <td className="py-3 px-6 text-right font-mono font-black text-slate-900">
                              {tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        {data.recentTransactions.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-16 text-center text-slate-300 font-bold italic text-xs uppercase tracking-wider">
                              No transactions available.
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

export default ProfitLossDashboardBoard;
