import React, { useState, useMemo, useEffect } from 'react';
import { FileText, ClipboardList, ShieldAlert, Building2, Users, Search, BarChart3, Eye, EyeOff, X, PieChart, Landmark, UserSquare, Box, History, Trash2, ScrollText, BookOpen, Clock, RefreshCcw, ListChecks, Receipt, AlertCircle, List, Calendar, Scale } from 'lucide-react';
import api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { menuGroups } from '../components/modals/AdminReports/ReportsCenterModal';
import SystemUpdateAuthModal from '../components/modals/SystemAdmin/SystemUpdateAuthModal';
import ReportTemplate from '../components/ReportTemplate';



const AdminCompanyReportsBoard = ({ hierarchy, allEmployees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [activeReport, setActiveReport] = useState(null);
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
        setActiveReport(reportId);
    };

    const handleCloseReport = () => {
        setActiveReport(null);
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

    const handleToggleHide = (e, reportId, reportName) => {
        e.stopPropagation();
        setAuthModalConfig({
            isOpen: true,
            pendingReport: { reportId, reportName }
        });
    };

    const executeToggleVisibility = async () => {
        if (!authModalConfig.pendingReport) return;
        const { reportId, reportName } = authModalConfig.pendingReport;

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
                setHiddenReports(prev => prev.filter(id => id !== reportId));
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
            {/* Header */}
 <div className="bg-white rounded-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-[3px] bg-[#00acee]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#00acee]" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-800">Company Reports</h2>
                        <p className="text-[11px] text-slate-500 font-medium">Select an employee and company to view available reports</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200/60">
 <div className="bg-white p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-[3px] shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                Employee
                            </button>
                            <button
                                onClick={() => { setShowCompModal(true); setCompSearch(''); setCompSearchTriggered(false); }}
                                disabled={!selectedEmployee}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-50 border border-slate-200 hover:border-[#00acee] hover:text-[#00acee] text-slate-600 text-xs font-bold uppercase tracking-wider rounded-[3px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    {/* Search Bar */}
                    <div className="bg-slate-50/50 p-3 rounded-[3px] border border-slate-200/60 mb-6 flex items-center">
                        <Search className="text-slate-400 ml-2 w-5 h-5 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search across all reports..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full ml-3 placeholder:text-slate-400"
                        />
                        {globalSearch && (
                            <button onClick={() => setGlobalSearch('')} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {menuGroups.map((group, gIdx) => {
                        const CategoryIcon = group.icon;
                        const filteredItems = group.items.filter(item => item.toLowerCase().includes(globalSearch.toLowerCase()));
                        
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={gIdx}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-8 h-8 rounded-[3px] bg-blue-50 flex items-center justify-center`}>
                                        <CategoryIcon size={16} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{group.title}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredItems.map((item, idx) => {
                                        const itemId = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                                        const isHidden = hiddenReports.includes(itemId) || hiddenReports.includes(item);
                                        return (
                                            <div key={idx} className="relative group">
                                                <button
                                                    onClick={() => handleOpenReport(item)}
                                                    className={`w-full bg-white shadow-sm border border-slate-200/50 hover:border-slate-400 p-5 transition-all text-left hover:shadow-lg active:scale-[0.98] ${isHidden ? 'opacity-50 grayscale' : ''}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-[3px] bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                        <FileText className={`w-5 h-5 text-slate-500`} />
                                                    </div>
                                                    <h4 className="text-[13px] font-bold text-slate-900 mb-1.5 line-clamp-1" title={item}>{item}</h4>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">Detailed insights and records for {item}.</p>
                                                    <div className="mt-3 flex items-center gap-1.5 text-[#00acee] text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                                        <Eye className="w-3 h-3" />
                                                        View Report
                                                    </div>
                                                </button>
                                                
                                                <button
                                                    onClick={(e) => handleToggleHide(e, itemId, item)}
                                                    title={isHidden ? "Show Report" : "Hide Report"}
                                                    className={`absolute top-3 right-3 p-2 rounded-[3px] transition-all opacity-0 group-hover:opacity-100 ${isHidden ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-slate-50 text-slate-400 hover:text-[#00acee] hover:bg-[#00acee]/10'}`}
                                                >
                                                    {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
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
                <div className="bg-slate-50 border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-[15px] font-bold text-slate-600">Select a Company</h3>
                    <p className="text-[13px] text-slate-400 mt-1 max-w-md">
                        Choose a company to view available reports for {selectedEmployeeName}.
                    </p>
                </div>
            )}

            {!selectedEmployee && (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-[15px] font-bold text-slate-600">Select an Employee</h3>
                    <p className="text-[13px] text-slate-400 mt-1 max-w-md">
                        Choose an employee to see their associated companies and available reports.
                    </p>
                </div>
            )}

            {/* Employee Selection Modal */}
            {showEmpModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
 <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-[13px] font-bold tracking-wide uppercase text-slate-900">Select Employee</h3>
                            <button onClick={() => setShowEmpModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={28} />
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
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-[3px] text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setEmpSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {empSearchTriggered && (
 <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white rounded-sm shadow-2xl max-h-[250px] overflow-y-auto">
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
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Select Company</h3>
                            <button onClick={() => setShowCompModal(false)} className="w-8 h-8 flex items-center justify-center rounded-[3px] text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                                <X size={28} />
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
                                        className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-[3px] text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setCompSearchTriggered(true)}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-colors shadow-sm"
                                    >
                                        Load
                                    </button>
                                    {compSearchTriggered && (
                                        <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white rounded-sm shadow-2xl max-h-[250px] overflow-y-auto">
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
            {activeReport && (
                <ReportTemplate
                    companyName={selectedCompanyName}
                    title={activeReport}
                    subtitle={`As of ${new Date().toLocaleDateString()}`}
                    onClose={handleCloseReport}
                    onSwitchReport={setActiveReport}
                    companyCode={selectedCompany}
                    empCode={selectedEmployee}
                    roleId="1"
                />
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
