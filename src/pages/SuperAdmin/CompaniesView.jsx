import React from 'react';
import { Building2, Plus, X, Lock, Unlock, Trash2, MapPin, Mail, Phone, CalendarClock, Settings } from 'lucide-react';

const CompaniesView = ({
    selectedEmpForCompanies, setSelectedEmpForCompanies,
    allCompanies,
    searchTerm,
    setSelectedCompany,
    handleToggleCompanyLock,
    handleDeleteCompany
}) => {
    // Filter the companies based on search and user filter
    const filteredCompanies = allCompanies.filter(c => {
        const matchesSearch = c.comp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEmp = selectedEmpForCompanies ? selectedEmpForCompanies.companies.some(ec => ec.companyCode === c.code) : true;
        return matchesSearch && matchesEmp;
    });

    return (
        <div className="animate-in fade-in zoom-in-95 duration-200">
            {/* Header Block */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-[4px] border border-blue-200 shadow-sm">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">
                            {selectedEmpForCompanies ? `Companies for ${selectedEmpForCompanies.empName}` : 'All Registered Companies'}
                        </h3>
                        <p className="text-[12px] text-gray-500 font-medium">Manage and view system-wide tenant registries</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selectedEmpForCompanies && (
                        <button onClick={() => setSelectedEmpForCompanies(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-[11px] font-bold rounded-[3px] transition-all shadow-sm">
                            <X className="w-3.5 h-3.5" /> Clear Filter
                        </button>
                    )}
                    <div className="bg-white border border-gray-200 text-gray-700 text-[12px] font-bold px-3 py-1.5 rounded-[4px] shadow-sm flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {filteredCompanies.length} Active Records
                    </div>
                </div>
            </div>

            {/* Grid Layout (Metro Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredCompanies.map(comp => (
                    <div
                        key={comp.code}
                        onClick={() => setSelectedCompany(comp)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer flex flex-col h-full"
                    >
                        {/* Company Card Header */}
                        <div className="p-5 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white relative">
                            {comp.acc_Desable === 1 && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                            )}
                            <h3 className="text-[16px] font-bold text-gray-800 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {comp.comp_Name || 'Unknown Company'}
                            </h3>
                            <p className="text-[12px] font-mono text-blue-500 font-bold mt-1.5 bg-blue-50/50 inline-block px-2 py-0.5 rounded border border-blue-100/50">
                                {comp.code}
                            </p>
                        </div>

                        {/* Company Details Body */}
                        <div className="p-5 flex-1 flex flex-col gap-3.5 bg-white">
                            <div className="flex items-center gap-2.5 text-[12px] font-medium text-gray-500">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{comp.email || 'Email not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] font-medium text-gray-500">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{comp.phone || 'Phone not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[12px] font-medium text-emerald-600 mt-2">
                                <div className="w-4 h-4 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center shrink-0">
                                    <Settings className="w-3 h-3 text-emerald-500" />
                                </div>
                                <span className="font-bold tracking-tight text-emerald-700/80 uppercase text-[10px]">Active Configuration</span>
                            </div>
                        </div>

                        {/* Company Card Footer Actions */}
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center gap-2 justify-end shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                                className={`flex-1 py-2 px-3 text-[11px] font-bold text-white shadow-sm rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${comp.acc_Desable === 1 ? 'bg-red-500 hover:bg-red-600 border border-red-600' : 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-600'}`}
                                onClick={(e) => handleToggleCompanyLock(e, comp.code)}
                                title={comp.acc_Desable === 1 ? "Unlock Company" : "Lock Company"}
                            >
                                {comp.acc_Desable === 1 ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                {comp.acc_Desable === 1 ? "Unlock" : "Lock"}
                            </button>
                            <button
                                className="flex-1 py-2 px-3 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                                onClick={(e) => { e.stopPropagation(); handleDeleteCompany(e, comp.code, null); }}
                                title="Delete Company"
                            >
                                <Trash2 className="w-[14px] h-[14px]" /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCompanies.length === 0 && (
                    <div className="col-span-full py-16 bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-300 mb-3" />
                        <h3 className="text-[14px] font-bold text-gray-700">No Companies Found</h3>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompaniesView;
