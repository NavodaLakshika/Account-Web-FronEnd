import React from 'react';
import { Users, Edit, Lock, Unlock, Trash2, Mail, Fingerprint, Settings, ShieldCheck } from 'lucide-react';

const EmployeesView = ({
    allEmployees,
    searchTerm,
    systemRoles,
    setSelectedEmployeeView,
    setEditingEmp,
    setSelectedRoleId,
    setSelectedGroupName,
    handleToggleEmployeeLock,
    handleDeleteEmployee
}) => {

    // Filter employees based on search
    const filteredEmployees = allEmployees.filter(e =>
        e.emp_Name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        e.emp_Code?.toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    return (
        <div className="animate-in fade-in zoom-in-95 duration-200">
            {/* Header Block */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-[4px] border border-blue-200 shadow-sm">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">All Employees</h3>
                        <p className="text-[12px] text-gray-500 font-medium">Manage and view system-wide employee accounts</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 text-gray-700 text-[12px] font-bold px-3 py-1.5 rounded-[4px] shadow-sm flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    {filteredEmployees.length} Active Records
                </div>
            </div>

            {/* Grid Layout (Metro Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredEmployees.map(emp => {
                    const isSystemAdmin = emp.userRole_Id == 99;
                    const roleName = systemRoles.find(r => r.id === emp.userRole_Id || r.id?.toString() === emp.userRole_Id?.toString())?.name || (isSystemAdmin ? 'System Admin' : `Role ${emp.userRole_Id}`);
                    const isLocked = emp.acc_Desable === "1" || emp.accDesable === "1";

                    return (
                        <div
                            key={emp.emp_Code}
                            onClick={() => setSelectedEmployeeView(emp)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer flex flex-col h-full"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white relative">
                                {isLocked && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                )}
                                <h3 className="text-[16px] font-bold text-gray-800 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">
                                    {emp.emp_Name || 'Unknown Employee'}
                                </h3>
                                <div className="mt-2.5 flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-blue-500 font-bold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50 flex items-center gap-1.5">
                                        <Fingerprint className="w-3.5 h-3.5" />
                                        {emp.emp_Code}
                                    </span>
                                </div>
                            </div>

                            {/* Card Attributes Body */}
                            <div className="p-5 flex-1 flex flex-col gap-3.5 bg-white">
                                <div className="flex items-center gap-2.5 text-[12px] font-medium text-gray-500">
                                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{emp.email || 'Email not provided'}</span>
                                </div>
                                <div className={`flex items-center justify-between mt-1 px-3 py-2 rounded-lg border ${isSystemAdmin ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00000060]">Access</span>
                                    <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                                        {isSystemAdmin && <ShieldCheck className="w-3.5 h-3.5" />}
                                        {roleName}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center gap-2 justify-end shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                    className="flex-1 py-1.5 px-2 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-[6px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingEmp(emp);
                                        setSelectedRoleId(emp.userRole_Id);
                                        setSelectedGroupName(emp.member_Id || 'Administrators');
                                    }}
                                    title="Edit Employee Privilege"
                                >
                                    <Edit className="w-[14px] h-[14px]" /> Edit
                                </button>
                                <button
                                    className={`flex-1 py-1.5 px-2 text-[11px] font-bold text-white shadow-sm rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${isLocked ? 'bg-red-500 hover:bg-red-600 border border-red-600' : 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-600'}`}
                                    onClick={(e) => { e.stopPropagation(); handleToggleEmployeeLock(e, emp.emp_Code || emp.empCode, isLocked); }}
                                    title={isLocked ? "Unlock Access" : "Lock Access"}
                                >
                                    {isLocked ? <Lock className="w-[14px] h-[14px]" /> : <Unlock className="w-[14px] h-[14px]" />}
                                    {isLocked ? "Unlock" : "Lock"}
                                </button>
                                <button
                                    className={`flex-1 py-1.5 px-2 text-[11px] font-bold text-white shadow-sm rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${isSystemAdmin ? 'bg-red-600 border border-red-600 cursor-not-allowed opacity-60' : 'bg-red-500 hover:bg-red-600 border border-red-600'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isSystemAdmin) handleDeleteEmployee(e, emp.emp_Code);
                                    }}
                                    title={isSystemAdmin ? "Super Admin constraint lock" : "Delete Employee"}
                                    disabled={isSystemAdmin}
                                >
                                    <Trash2 className="w-[14px] h-[14px]" /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredEmployees.length === 0 && (
                    <div className="col-span-full py-16 bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 text-gray-300 mb-3" />
                        <h3 className="text-[14px] font-bold text-gray-700">No Employees Found</h3>
                        <p className="text-[12px] text-gray-500 font-medium mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeesView;
