import React, { useState, useMemo } from 'react';
import { FileText, ClipboardList, ShieldAlert, Building2, Users, Search, BarChart3, Eye, X, PieChart, Landmark, UserSquare, Box, History, Trash2, ScrollText } from 'lucide-react';
import TrialBalanceBoard from '../pages/TrialBalanceBoard';
import ItemsServicesReportPage from '../pages/ItemsServicesReportPage';
import SystemAnalyticsReportPage from '../pages/SystemAnalyticsReportPage';
import StockReportModal from '../components/modals/AdminReports/StockReportModal';
import TransactionLogReportModal from '../components/modals/AdminReports/TransactionLogReportModal';
import CancelledTransactionReportModal from '../components/modals/AdminReports/CancelledTransactionReportModal';

const hubReportCards = [
    {
        id: 'trial-balance',
        title: 'Trial Balance Report',
        description: 'View debit/credit balances across all accounts for the selected company.',
        icon: BarChart3,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-200/30',
        hoverBorder: 'hover:border-blue-400',
        category: 'Accounting'
    },
    {
        id: 'items-services',
        title: 'Items & Services Report',
        description: 'Detailed product and account mappings with income/expense accounts and pricing.',
        icon: ClipboardList,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-200/30',
        hoverBorder: 'hover:border-emerald-400',
        category: 'Accounting'
    },
    {
        id: 'system-log',
        title: 'System Log & Audit Report',
        description: 'Global audit trail of system activities, user actions, and security events.',
        icon: ShieldAlert,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-200/30',
        hoverBorder: 'hover:border-purple-400',
        category: 'Admin'
    },
    {
        id: 'stock-report',
        title: 'Stock Report',
        description: 'View current stock levels, inventory movements, and product quantities.',
        icon: Box,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-200/30',
        hoverBorder: 'hover:border-orange-400',
        category: 'Admin'
    },
    {
        id: 'transaction-log',
        title: 'Transaction Log Report',
        description: 'Detailed log of all financial transactions across the system.',
        icon: ScrollText,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-200/30',
        hoverBorder: 'hover:border-cyan-400',
        category: 'Admin'
    },
    {
        id: 'cancelled-transactions',
        title: 'Cancelled Transaction Report',
        description: 'Records of all cancelled or voided transactions with audit details.',
        icon: Trash2,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-200/30',
        hoverBorder: 'hover:border-red-400',
        category: 'Admin'
    }
];

const categoryLabels = [
    { key: 'Accounting', label: 'Accounting Reports', icon: ClipboardList, color: 'text-blue-600' },
    { key: 'Banking', label: 'Banking Reports', icon: Landmark, color: 'text-emerald-600' },
    { key: 'Finance', label: 'Finance Management', icon: PieChart, color: 'text-purple-600' },
    { key: 'Vender', label: 'Vender Center Reports', icon: UserSquare, color: 'text-orange-600' },
    { key: 'Customer', label: 'Customer Center Reports', icon: Users, color: 'text-cyan-600' },
    { key: 'Admin', label: 'Admin Reports', icon: ShieldAlert, color: 'text-rose-600' }
];

const AdminCompanyReportsBoard = ({ hierarchy, allEmployees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [activeReport, setActiveReport] = useState(null);

    const [showEmpModal, setShowEmpModal] = useState(false);
    const [showCompModal, setShowCompModal] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const [compSearch, setCompSearch] = useState('');
    const [empSearchTriggered, setEmpSearchTriggered] = useState(false);
    const [compSearchTriggered, setCompSearchTriggered] = useState(false);

    const companies = useMemo(() => {
        if (!selectedEmployee) return [];
        const empNode = hierarchy.find(h => (h.empCode || h.emp_Code) === selectedEmployee);
        if (empNode && empNode.companies) {
            return empNode.companies.map(c => ({
                code: c.companyCode || c.company_Code,
                name: c.companyName || c.company_Name || c.comp_Name || 'Unknown Company'
            }));
        }
        return [];
    }, [selectedEmployee, hierarchy]);

    const selectedCompanyName = useMemo(() => {
        const comp = companies.find(c => c.code === selectedCompany);
        return comp ? comp.name : '';
    }, [selectedCompany, companies]);

    const selectedEmployeeName = useMemo(() => {
        if (!selectedEmployee) return '';
        const emp = allEmployees.find(e => (e.emp_Code || e.empCode) === selectedEmployee);
        return emp ? (emp.emp_Name || emp.empName || selectedEmployee) : selectedEmployee;
    }, [selectedEmployee, allEmployees]);

    const filteredEmployees = useMemo(() => {
        if (!empSearch) return allEmployees;
        return allEmployees.filter(e => {
            const name = (e.emp_Name || e.empName || '').toLowerCase();
            const code = (e.emp_Code || e.empCode || '').toLowerCase();
            const term = empSearch.toLowerCase();
            return name.includes(term) || code.includes(term);
        });
    }, [empSearch, allEmployees]);

    const filteredCompanies = useMemo(() => {
        if (!compSearch) return companies;
        return companies.filter(c => {
            const name = (c.name || '').toLowerCase();
            const code = (c.code || '').toLowerCase();
            const term = compSearch.toLowerCase();
            return name.includes(term) || code.includes(term);
        });
    }, [compSearch, companies]);

    const handleOpenReport = (reportId) => {
        setActiveReport(reportId);
    };

    const handleCloseReport = () => {
        setActiveReport(null);
    };

    const groupedCards = useMemo(() => {
        const groups = {};
        hubReportCards.forEach(card => {
            if (!groups[card.category]) groups[card.category] = [];
            groups[card.category].push(card);
        });
        return groups;
    }, []);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#00acee]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#00acee]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Company Reports</h2>
                        <p className="text-xs text-slate-500">Select an employee and company to view available reports</p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex flex-col w-full sm:w-auto">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selection Target</span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                    {selectedEmployee ? selectedEmployeeName : 'No Employee Selected'}
                                </span>
                                <span className="hidden sm:inline text-slate-300">/</span>
                                <span className="text-sm font-bold text-[#00acee]">
                                    {selectedCompany ? selectedCompanyName : 'No Company Selected'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => { setShowEmpModal(true); setEmpSearch(''); setEmpSearchTriggered(false); }}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                Employee
                            </button>
                            <button
                                onClick={() => { setShowCompModal(true); setCompSearch(''); setCompSearchTriggered(false); }}
                                disabled={!selectedEmployee}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Building2 size={14} />
                                Company
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Hub Categories */}
            {selectedCompany && (
                <div className="space-y-8">
                    {categoryLabels.map(cat => {
                        const CategoryIcon = cat.icon;
                        const catCards = groupedCards[cat.key] || [];
                        const placeholderCards = catCards.length === 0 ? [{ id: `placeholder-${cat.key}`, placeholder: true }] : catCards;
                        return (
                            <div key={cat.key}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-8 h-8 rounded-lg ${cat.color.replace('text', 'bg').replace('600', '100')} flex items-center justify-center`}>
                                        <CategoryIcon size={16} className={cat.color} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{cat.label}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {placeholderCards.map(card => {
                                        if (card.placeholder) {
                                            return (
                                                <div
                                                    key={card.id}
                                                    className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center min-h-[160px] opacity-60"
                                                >
                                                    <CategoryIcon size={28} className="text-slate-300 mb-2" />
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coming Soon</p>
                                                </div>
                                            );
                                        }
                                        const Icon = card.icon;
                                        return (
                                            <button
                                                key={card.id}
                                                onClick={() => handleOpenReport(card.id)}
                                                className={`group relative bg-white rounded-2xl shadow-sm border ${card.border} ${card.hoverBorder} p-5 transition-all text-left hover:shadow-lg active:scale-[0.98]`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{card.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
                                                <div className="mt-3 flex items-center gap-1.5 text-[#00acee] text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye className="w-3 h-3" />
                                                    View Report
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedEmployee && !selectedCompany && (
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-600">Select a Company</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-md">
                        Choose a company to view available reports for {selectedEmployeeName}.
                    </p>
                </div>
            )}

            {!selectedEmployee && (
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-600">Select an Employee</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-md">
                        Choose an employee to see their associated companies and available reports.
                    </p>
                </div>
            )}

            {/* Employee Selection Modal */}
            {showEmpModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Employee</h3>
                            <button onClick={() => setShowEmpModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-visible">
                            <div className="flex flex-col gap-4 relative z-20">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Employee</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Employee..."
                                        value={empSearch}
                                        onChange={e => { setEmpSearch(e.target.value); setEmpSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setEmpSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setEmpSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {empSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto">
                                            <div
                                                onClick={() => { setSelectedEmployee(''); setSelectedCompany(''); setShowEmpModal(false); setEmpSearch(''); setEmpSearchTriggered(false); }}
                                                className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                            >
                                                -- All Employees (Global) --
                                            </div>
                                            {filteredEmployees.map(e => {
                                                const code = e.emp_Code || e.empCode;
                                                const name = e.emp_Name || e.empName;
                                                const roleId = e.userRole_Id || e.role;
                                                const roleName = roleId === 99 ? 'Super Admin' : roleId === 1 ? 'Admin' : roleId === 2 ? 'Accountant' : roleId === 3 ? 'Data Entry' : `Role ${roleId}`;
                                                return (
                                                    <div
                                                        key={code}
                                                        onClick={() => {
                                                            setSelectedEmployee(code);
                                                            setShowEmpModal(false);
                                                            setEmpSearch('');
                                                            setEmpSearchTriggered(false);
                                                            if (companies.length === 1) setSelectedCompany(companies[0].code);
                                                            else setSelectedCompany('');
                                                        }}
                                                        className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                    >
                                                        {name} <span className="text-slate-400 font-normal ml-1">[{roleName}]</span>
                                                    </div>
                                                );
                                            })}
                                            {filteredEmployees.length === 0 && (
                                                <div className="p-6 text-center text-sm text-slate-400">No employees found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Selection Modal */}
            {showCompModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Company</h3>
                            <button onClick={() => setShowCompModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-visible">
                            <div className="flex flex-col gap-4 relative z-20">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Company</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Company..."
                                        value={compSearch}
                                        onChange={e => { setCompSearch(e.target.value); setCompSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setCompSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setCompSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {compSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto">
                                            <div
                                                onClick={() => { setSelectedCompany(''); setShowCompModal(false); setCompSearch(''); setCompSearchTriggered(false); }}
                                                className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                            >
                                                -- All Companies (Global) --
                                            </div>
                                            {filteredCompanies.map(c => (
                                                <div
                                                    key={c.code}
                                                    onClick={() => { setSelectedCompany(c.code); setShowCompModal(false); setCompSearch(''); setCompSearchTriggered(false); }}
                                                    className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                            {filteredCompanies.length === 0 && (
                                                <div className="p-6 text-center text-sm text-slate-400">
                                                    {companies.length === 0 ? 'No companies available for this employee.' : 'No companies match your search.'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trial Balance Report Modal */}
            {activeReport === 'trial-balance' && (
                <TrialBalanceBoard
                    isOpen={true}
                    onClose={handleCloseReport}
                    companyCodeProp={selectedCompany}
                    companyNameProp={selectedCompanyName}
                />
            )}

            {/* Items & Services Report Full-View */}
            {activeReport === 'items-services' && (
                <div className="fixed inset-0 z-[1000] bg-white overflow-hidden animate-in fade-in duration-200">
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={handleCloseReport} className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <ItemsServicesReportPage companyCodeProp={selectedCompany} companyNameProp={selectedCompanyName} />
                </div>
            )}

            {/* System Log & Audit Report Full-View */}
            {activeReport === 'system-log' && (
                <div className="fixed inset-0 z-[1000] bg-white overflow-hidden animate-in fade-in duration-200">
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={handleCloseReport} className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <SystemAnalyticsReportPage companyCodeProp={selectedCompany} companyNameProp={selectedCompanyName} />
                </div>
            )}

            {/* Stock Report Modal */}
            {activeReport === 'stock-report' && (
                <StockReportModal isOpen={true} onClose={handleCloseReport} />
            )}

            {/* Transaction Log Report Modal */}
            {activeReport === 'transaction-log' && (
                <TransactionLogReportModal isOpen={true} onClose={handleCloseReport} />
            )}

            {/* Cancelled Transaction Report Modal */}
            {activeReport === 'cancelled-transactions' && (
                <CancelledTransactionReportModal isOpen={true} onClose={handleCloseReport} />
            )}
        </div>
    );
};

export default AdminCompanyReportsBoard;
