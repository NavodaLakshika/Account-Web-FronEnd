import React from 'react';
import { ShieldAlert, Database, CheckCircle, Loader2, Plus, Edit, Trash2, Search, Power, ShieldCheck, Box } from 'lucide-react';
import SystemLoader from '../../components/SystemLoader';

const RoleFeaturesView = ({
    handleSeedFunctions,
    seedingFunctions,
    loadingPermissions,
    handleAllowAllPermissions,
    permissions,
    handleInitiateSavePermissions,
    savingPermissions,
    systemRoles,
    selectedRole,
    setSelectedRole,
    setShowCreateRoleModal,
    userGroups,
    setEditingUserRole,
    setEditRoleName,
    setEditRoleDesc,
    handleDeleteUserRole,
    permSearch,
    setPermSearch,
    handleTogglePermission
}) => {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-200">
            {/* Header Block */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-[4px] border border-blue-200 shadow-sm">
                        <ShieldAlert className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">System Role Permission Master</h3>
                        <p className="text-[12px] text-gray-500 font-medium">Configure deep-level enabled/disabled features for your system roles</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-start">
                    <button
                        onClick={handleSeedFunctions}
                        disabled={seedingFunctions || loadingPermissions}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-[6px] shadow-sm transition-all flex items-center gap-2"
                    >
                        {seedingFunctions ? (
                            <><Loader2 className="animate-spin" size={14} />Seeding...</>
                        ) : (
                            <><Database size={14} />Seed Functions</>
                        )}
                    </button>
                    <button
                        onClick={handleAllowAllPermissions}
                        disabled={loadingPermissions || !permissions.length}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-600 text-white text-[11px] font-bold rounded-[6px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle size={14} />
                        Allow All Config
                    </button>
                    <button
                        onClick={handleInitiateSavePermissions}
                        disabled={savingPermissions || loadingPermissions || !permissions.length}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white text-[11px] font-bold rounded-[6px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {savingPermissions ? (
                            <><Loader2 className="animate-spin" size={14} />Saving Changes...</>
                        ) : (
                            <><ShieldCheck size={14} /> Commit Changes</>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter and Role Select Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 shrink-0">Select Identity:</span>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 shrink-0">
                        {systemRoles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`px-4 py-1.5 text-[11px] font-bold rounded-[6px] transition-all whitespace-nowrap ${selectedRole === role.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-transparent hover:bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-2 shrink-0"></div>
                    <button
                        onClick={() => setShowCreateRoleModal(true)}
                        className="px-3 py-1.5 text-[11px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-[6px] transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                        <Plus size={14} /> Create Role
                    </button>
                    {selectedRole && selectedRole !== 1 && selectedRole !== 99 && (
                        <>
                            <button
                                onClick={(e) => {
                                    const group = userGroups.find(g => g.group_Id === selectedRole);
                                    if (group) {
                                        setEditingUserRole(group);
                                        setEditRoleName(group.group_Name);
                                        setEditRoleDesc(group.description || '');
                                    }
                                }}
                                className="px-3 py-1.5 text-[11px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-[6px] transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                                <Edit size={14} className="text-blue-500" /> Edit
                            </button>
                            <button
                                onClick={(e) => handleDeleteUserRole(e, selectedRole)}
                                className="px-3 py-1.5 text-[11px] font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-[6px] transition-all flex items-center gap-1.5 shadow-sm shrink-0"

                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </>
                    )}
                </div>

                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search system functions..."
                        value={permSearch}
                        onChange={e => setPermSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 shadow-sm bg-white text-gray-700 text-xs w-full outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all"
                    />
                </div>
            </div>

            {loadingPermissions ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex justify-center">
                    <SystemLoader inline message="Connecting to central registry & locking role matrix..." />
                </div>
            ) : !permissions.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500 border border-dashed border-gray-200 bg-white rounded-2xl shadow-sm">
                    <Database size={40} className="text-gray-300" />
                    <div className="text-center">
                        <p className="text-[14px] font-bold text-gray-700 mb-1">No System Functions Found</p>
                        <p className="text-[12px] text-gray-500 font-medium">The system permission table is currently fragmented. Seed default functions to get started.</p>
                    </div>
                    <button
                        onClick={handleSeedFunctions}
                        disabled={seedingFunctions}
                        className="px-6 py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm"
                    >
                        {seedingFunctions ? (
                            <><Loader2 className="animate-spin" size={16} />Seeding Core Matrix...</>
                        ) : (
                            <><Database size={16} />Seed Core Permissions Matrix</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-8 pb-10">
                    {(() => {
                        const filtered = permissions.filter(p => {
                            const code = (p.system_Fuction || p.systemFuction || p.System_Fuction || '').toLowerCase();
                            const desc = (p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || '').toLowerCase();
                            const term = permSearch.toLowerCase();
                            return code.includes(term) || desc.includes(term);
                        });

                        const getCategory = (code) => {
                            const up = (code || '').toUpperCase();
                            const parts = up.split('_');
                            return parts.length > 1 ? parts[0] : 'GENERAL';
                        };

                        const formatCategoryLabel = (prefix) => {
                            const map = {
                                'ACC': 'General Parameters',
                                'MST': 'Master Datastores',
                                'TRN': 'Transactions & Registers',
                                'RPT': 'Internal Reporting',
                                'SYS': 'System Administration',
                                'INV': 'Inventory Management',
                                'POS': 'Point Of Sale',
                                'CUS': 'Customer Relations',
                                'PAY': 'Payroll & HR',
                                'GENERAL': 'General Functions'
                            };
                            return map[prefix] || `${prefix} Sub-system`;
                        };

                        const grouped = {};
                        filtered.forEach(p => {
                            const code = p.system_Fuction || p.systemFuction || p.System_Fuction || '';
                            const cat = getCategory(code);
                            if (!grouped[cat]) grouped[cat] = [];
                            grouped[cat].push(p);
                        });

                        const renderModuleGrid = (items, label) => {
                            if (!items.length) return null;
                            return (
                                <div key={label} className="flex flex-col gap-4">
                                    <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <Box className="w-4 h-4 text-blue-400" />
                                        {label}
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2 text-[10px] lowercase tracking-normal">{items.length} nodes</span>
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                        {items.map(p => {
                                            const code = p.system_Fuction || p.systemFuction || p.System_Fuction;
                                            const desc = p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || code;
                                            const isAllowed = (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === 'T' || (p.allow_Fuction || p.allowFuction || p.Allow_Fuction) === true;

                                            return (
                                                <div
                                                    key={code}
                                                    onClick={() => handleTogglePermission(code)}
                                                    className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group min-h-[140px] ${isAllowed ? 'border-emerald-500/30' : 'border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {isAllowed && (
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                                                    )}
                                                    {!isAllowed && (
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-blue-300 transition-colors"></div>
                                                    )}

                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <span className="font-mono text-[10px] font-bold text-gray-400 mb-2 truncate bg-gray-50 uppercase self-start px-1.5 py-0.5 rounded border border-gray-100">{code}</span>
                                                        <h5 className="text-[13px] text-gray-800 font-bold uppercase leading-tight line-clamp-2">{desc}</h5>
                                                    </div>

                                                    <div className="p-3 bg-gray-50/50 border-t border-gray-100 mt-auto flex items-center justify-between">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isAllowed ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                            <Power className={`w-3.5 h-3.5 ${isAllowed ? 'text-emerald-500' : 'text-gray-400'}`} />
                                                            {isAllowed ? 'Enabled' : 'Disabled'}
                                                        </span>

                                                        {/* Toggle Element */}
                                                        <div className={`w-8 h-4 rounded-full flex items-center transition-colors p-0.5 ${isAllowed ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${isAllowed ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        };

                        const elements = Object.keys(grouped).sort().map(prefix => {
                            return renderModuleGrid(grouped[prefix], formatCategoryLabel(prefix));
                        });

                        return elements;
                    })()}

                    {/* Empty Search State */}
                    {!permissions.filter(p => {
                        const code = (p.system_Fuction || p.systemFuction || p.System_Fuction || '').toLowerCase();
                        const desc = (p.function_Description || p.functionDescription || p.Function_Description || p.fuction_Description || '').toLowerCase();
                        const term = permSearch.toLowerCase();
                        return code.includes(term) || desc.includes(term);
                    }).length && (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search size={32} className="text-gray-300" />
                                <span className="text-[13px] font-bold text-gray-500">No functionality objects match your active search terms.</span>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default RoleFeaturesView;
