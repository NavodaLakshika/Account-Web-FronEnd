import React, { useState, useMemo, useEffect } from 'react';
import { FileText, ClipboardList, ShieldAlert, Building2, Users, Search, BarChart3, Eye, EyeOff, X, PieChart, Landmark, UserSquare, Box, History, Trash2, ScrollText, BookOpen, Clock, RefreshCcw, ListChecks, Receipt, AlertCircle, List, Calendar, Scale } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { menuGroups } from '../components/modals/AdminReports/ReportsCenterModal';
import SystemUpdateAuthModal from '../components/modals/SystemAdmin/SystemUpdateAuthModal';

const AdminCompanyReportsBoard = ({ hierarchy, allEmployees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [globalSearch, setGlobalSearch] = useState('');
    const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, pendingReport: null });

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
        const url = `/report-viewer?title=${encodeURIComponent(reportId)}&companyCode=${encodeURIComponent(selectedCompany)}&empCode=${encodeURIComponent(selectedEmployee)}`;
        window.open(url, '_blank');
    };

    const [hiddenReports, setHiddenReports] = useState([]);

    useEffect(() => {
        if (selectedEmployee && selectedCompany) {
            api.get(`/SuperAdmin/reports/hidden?empCode=${selectedEmployee}&companyCode=${selectedCompany}`)
                .then(res => setHiddenReports(res.data))
                .catch(err => console.error("Error fetching hidden reports", err));
        } else {
            setHiddenReports([]);
        }
    }, [selectedEmployee, selectedCompany]);

    const handleToggleHideClick = (e, reportId, reportName) => {
        e.stopPropagation();
        setAuthModalConfig({ isOpen: true, pendingReport: { id: reportId, name: reportName } });
    };

    const executeToggleVisibility = async () => {
        if (!authModalConfig.pendingReport) return;
        const { id: reportId, name: reportName } = authModalConfig.pendingReport;

        try {
            const res = await api.post('/SuperAdmin/reports/toggle-visibility', {
                empCode: selectedEmployee,
                companyCode: selectedCompany,
                reportName: reportId
            });
            if (res.data.hidden) {
                setHiddenReports(prev => [...prev, reportId]);
                showSuccessToast(`Report '${reportName}' is now hidden`);
            } else {
                setHiddenReports(prev => prev.filter(id => id !== reportId && id !== reportName));
                showSuccessToast(`Report '${reportName}' is now visible`);
            }
        } catch (err) {
            console.error("Error toggling report visibility", err);
            showErrorToast("Failed to toggle report visibility");
        } finally {
            setAuthModalConfig({ isOpen: false, pendingReport: null });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header & Target Selector */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shadow-sm border border-blue-200">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">Company Reports</h2>
                        <p className="text-[12px] text-gray-500 font-medium">Select a system employee and their active company registry to view reports</p>
                    </div>
                </div>

                <div className="bg-gray-50/50 p-5 border border-gray-100 rounded-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex flex-col w-full sm:w-auto">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Reporting Target
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className={`text-[14px] font-bold ${selectedEmployee ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {selectedEmployee ? selectedEmployeeName : 'No Employee Selected'}
                                </span>
                                <span className="hidden sm:inline text-gray-300 font-black">/</span>
                                <span className={`text-[14px] font-bold ${selectedCompany ? 'text-blue-600' : 'text-blue-300'}`}>
                                    {selectedCompany ? selectedCompanyName : 'No Company Selected'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => { setShowEmpModal(true); setEmpSearch(''); setEmpSearchTriggered(false); }}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={14} className="text-blue-500" />
                                Employee
                            </button>
                            <button
                                onClick={() => { setShowCompModal(true); setCompSearch(''); setCompSearchTriggered(false); }}
                                disabled={!selectedEmployee}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Search Bar */}
                    <div className="bg-white p-2.5 rounded-2xl border border-gray-200 mb-6 flex items-center shadow-sm w-full max-w-2xl mx-auto">
                        <Search className="text-gray-400 ml-3 w-5 h-5 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search across all reports & analytics..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-[14px] font-medium text-gray-700 w-full ml-3 placeholder:text-gray-400"
                        />
                        {globalSearch && (
                            <button onClick={() => setGlobalSearch('')} className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {menuGroups.map((group, gIdx) => {
                        const CategoryIcon = group.icon;
                        const filteredItems = group.items.filter(item => item.toLowerCase().includes(globalSearch.toLowerCase()));

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={gIdx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                        <CategoryIcon size={16} className="text-blue-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{group.title}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredItems.map((item, idx) => {
                                        const itemId = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                                        const isHidden = hiddenReports.includes(itemId) || hiddenReports.includes(item);
                                        return (
                                            <div key={idx} className={`bg-gray-50 border border-gray-200 p-5 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between group ${isHidden ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="flex items-start gap-3 mb-5">
                                                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[14px] font-bold text-gray-800 mb-1 leading-tight">{item}</h4>
                                                        <p className="text-[11px] text-gray-500 font-medium line-clamp-2">Detailed business insights and records for {item}.</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-auto">
                                                    <button
                                                        onClick={() => handleOpenReport(item)}
                                                        className="flex-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> Open Report
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleToggleHideClick(e, itemId, item)}
                                                        className={`flex-none px-4 py-2 text-xs font-bold text-white shadow-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${isHidden ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                                                        title={isHidden ? "Unhide Report" : "Hide Report"}
                                                    >
                                                        {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedEmployee && !selectedCompany && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-12 h-12 text-blue-300 mb-4" />
                    <h3 className="text-[16px] font-bold text-gray-700">Almost there...</h3>
                    <p className="text-[13px] text-gray-500 mt-2 max-w-sm">
                        You've selected <span className="font-bold text-gray-700">{selectedEmployeeName}</span>. Now choose a target company to load their reports.
                    </p>
                </div>
            )}

            {!selectedEmployee && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                    <PieChart className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-[16px] font-bold text-gray-700">Awaiting Target Selection</h3>
                    <p className="text-[13px] text-gray-500 mt-2 max-w-sm">
                        Select an employee to discover their mapped companies and access business intelligence reports.
                    </p>
                </div>
            )}

            {/* Employee Selection Modal */}
            {showEmpModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 h-14 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Select Employee
                            </h3>
                            <button onClick={() => setShowEmpModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex flex-col gap-2 relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by code or name..."
                                        value={empSearch}
                                        onChange={e => { setEmpSearch(e.target.value); setEmpSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setEmpSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 h-10 border border-gray-200 shadow-sm rounded-lg text-[13px] bg-white font-medium text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-gray-400"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setEmpSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-md transition-colors"
                                    >
                                        Load
                                    </button>
                                </div>
                            </div>

                            {empSearchTriggered && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-2">
                                    <div
                                        onClick={() => { setSelectedEmployee(''); setSelectedCompany(''); setShowEmpModal(false); setEmpSearch(''); setEmpSearchTriggered(false); }}
                                        className="p-3 border-b border-gray-100 text-xs cursor-pointer transition-all bg-gray-50 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
                                    >
                                        -- Reset Selection --
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
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
                                                    className="p-3 border-b border-gray-50 text-xs cursor-pointer transition-all text-gray-700 hover:bg-blue-50 flex items-center justify-between group"
                                                >
                                                    <span className="font-bold group-hover:text-blue-600">{name}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{roleName}</span>
                                                </div>
                                            );
                                        })}
                                        {filteredEmployees.length === 0 && (
                                            <div className="p-6 text-center text-xs text-gray-500 font-medium">No employees found.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Company Selection Modal */}
            {showCompModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 h-14 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500" /> Select Company
                            </h3>
                            <button onClick={() => setShowCompModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex flex-col gap-2 relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search Company..."
                                        value={compSearch}
                                        onChange={e => { setCompSearch(e.target.value); setCompSearchTriggered(false); }}
                                        onKeyDown={e => e.key === 'Enter' && setCompSearchTriggered(true)}
                                        className="w-full pl-9 pr-24 h-10 border border-gray-200 shadow-sm rounded-lg text-[13px] bg-white font-medium text-gray-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-gray-400"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setCompSearchTriggered(true)}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-md transition-colors"
                                    >
                                        Load
                                    </button>
                                </div>
                            </div>

                            {compSearchTriggered && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-2">
                                    <div
                                        onClick={() => { setSelectedCompany(''); setShowCompModal(false); setCompSearch(''); setCompSearchTriggered(false); }}
                                        className="p-3 border-b border-gray-100 text-xs cursor-pointer transition-all bg-gray-50 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
                                    >
                                        -- Reset Selection --
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {filteredCompanies.map(c => (
                                            <div
                                                key={c.code}
                                                onClick={() => { setSelectedCompany(c.code); setShowCompModal(false); setCompSearch(''); setCompSearchTriggered(false); }}
                                                className="p-3 border-b border-gray-50 text-xs cursor-pointer transition-all text-gray-700 hover:bg-blue-50 font-bold group hover:text-blue-600"
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                        {filteredCompanies.length === 0 && (
                                            <div className="p-6 text-center text-xs text-gray-500 font-medium">
                                                {companies.length === 0 ? 'No companies mapped to this employee.' : 'No companies match your search.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <SystemUpdateAuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ isOpen: false, pendingReport: null })}
                onVerified={executeToggleVisibility}
            />
        </div>
    );
};

export default AdminCompanyReportsBoard;
