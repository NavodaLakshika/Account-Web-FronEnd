import React, { useState, useMemo } from 'react';
import {
    X, Search, Building2, Target, Users, UserSquare,
    CreditCard, PieChart, UserCog, Settings, Key, LogOut, Layers,
    Briefcase, Lock, MapPin, Navigation, Tag, Shield, FolderOpen
} from 'lucide-react';

import ChartOfAccountantModal from '../ChartOfAccountsModels/ChartOfAccountantModal';
import FixedAssetsBoard from '../ChartOfAccountsModels/FixedAssetsBoard';
import LongTermLiabilityBoard from '../ChartOfAccountsModels/LongTermLiabilityBoard';
import DepreciationBoard from '../ChartOfAccountsModels/DepreciationBoard';
import FixedIncomeBoard from '../ChartOfAccountsModels/FixedIncomeBoard';
import FixedExpensesBoard from '../ChartOfAccountsModels/FixedExpensesBoard';
import NewAccountBoard from '../../../pages/NewAccountBoard';

import CompanyBoard from './CompanyBoard';
import CostCenterBoard from './CostCenterBoard';
import DepartmentBoard from './DepartmentBoard';
import CategoryBoard from './CategoryBoard';
import RouteBoard from './RouteBoard';
import AreaBoard from './AreaBoard';
import SupplierMasterBoard from './SupplierMasterBoard';
import CustomerMasterBoard from './CustomerMasterBoard';
import CardCommissionBoard from './CardCommissionBoard';
import UserProfileBoard from './UserProfileBoard';
import VendorTypesBoard from './VendorTypesBoard';
import CustomerTypeBoard from './CustomerTypeBoard';
import ChangePasswordBoard from './ChangePasswordBoard';

import ThankYouModal from '../ThankYouModal';
import LogoutConfirmModal from '../LogoutConfirmModal';
import FeatureLockedModal from '../FeatureLockedModal';

const menuGroups = [
    {
        title: 'Company Setup',
        items: [
            { icon: Building2, label: 'Open Company', id: 'master_company', desc: 'Manage company profiles and details', board: 'company' },
            { icon: Target, label: 'Cost Center Master', id: 'master_costCenter', desc: 'Define cost center structures', board: 'costCenter' },
        ]
    },
    {
        title: 'Organization Structure',
        items: [
            { icon: Briefcase, label: 'Create Department', id: 'master_department', desc: 'Set up departments and locations', board: 'department' },
            { icon: Layers, label: 'Create Category', id: 'master_category', desc: 'Manage item categories', board: 'category' },
            { icon: MapPin, label: 'Create Route', id: 'master_route', desc: 'Define route master data', board: 'route' },
            { icon: Navigation, label: 'Create Area', id: 'master_area', desc: 'Manage area master records', board: 'area' },
        ]
    },
    {
        title: 'Business Partners',
        items: [
            { icon: UserSquare, label: 'Supplier Master', id: 'master_supplier', desc: 'Supplier directory and records', board: 'supplier' },
            { icon: Users, label: 'Customer Master', id: 'master_customer', desc: 'Customer directory and records', board: 'customer' },
            { icon: Tag, label: 'Customer Type Master', id: 'master_customerType', desc: 'Customer classification types', board: 'customerType' },
            { icon: Settings, label: 'Vendor Types', id: 'master_vendorTypes', desc: 'Vendor classification types', board: 'vendorTypes' },
        ]
    },
    {
        title: 'Finance & Accounting',
        items: [
            { icon: PieChart, label: 'Chart of Accountant', id: 'master_chartOfAccount', desc: 'Full chart of accounts management', board: 'chartOfAccount' },
            { icon: CreditCard, label: 'Card Sale Commission', id: 'master_cardSale', desc: 'Commission rate configuration', board: 'cardSale' },
        ]
    },
    {
        title: 'System Administration',
        items: [
            { icon: UserCog, label: 'User Profile Maintenance', id: 'master_userProfile', desc: 'Manage user access and profiles', board: 'userProfile' },
            { icon: Key, label: 'Change Password', id: 'master_changePassword', desc: 'Update login credentials', board: 'changePassword' },
            { icon: LogOut, label: 'Log Off', id: 'master_logoff', desc: 'End current session', board: 'logoff' },
        ]
    }
];

const MasterSubModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);

    const [showChartOfAccountantModal, setShowChartOfAccountantModal] = useState(false);
    const [showCompanyBoard, setShowCompanyBoard] = useState(false);
    const [showCostCenterBoard, setShowCostCenterBoard] = useState(false);
    const [showDepartmentBoard, setShowDepartmentBoard] = useState(false);
    const [showCategoryBoard, setShowCategoryBoard] = useState(false);
    const [showRouteBoard, setShowRouteBoard] = useState(false);
    const [showAreaBoard, setShowAreaBoard] = useState(false);
    const [showSupplierMasterBoard, setShowSupplierMasterBoard] = useState(false);
    const [showCustomerMasterBoard, setShowCustomerMasterBoard] = useState(false);
    const [showCustomerTypeBoard, setShowCustomerTypeBoard] = useState(false);
    const [showCardCommissionBoard, setShowCardCommissionBoard] = useState(false);
    const [showNewAccountBoard, setShowNewAccountBoard] = useState(false);
    const [showFixedAssetsBoard, setShowFixedAssetsBoard] = useState(false);
    const [showLiabilityBoard, setShowLiabilityBoard] = useState(false);
    const [showDepreciationBoard, setShowDepreciationBoard] = useState(false);
    const [showFixedIncomeBoard, setShowFixedIncomeBoard] = useState(false);
    const [showFixedExpensesBoard, setShowFixedExpensesBoard] = useState(false);
    const [showUserProfileBoard, setShowUserProfileBoard] = useState(false);
    const [showVendorTypesBoard, setShowVendorTypesBoard] = useState(false);
    const [showChangePasswordBoard, setShowChangePasswordBoard] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

    const filteredGroups = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return menuGroups;
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
            )
        })).filter(group => group.items.length > 0);
    }, [searchQuery]);

    if (!isOpen) return null;

    const handleLogOff = () => {
        if (localStorage.getItem('isLocked_master_logoff') === 'true') {
            setShowLockModal(true);
            return;
        }
        setShowLogoutConfirmModal(true);
    };

    const openBoard = (board) => {
        const setters = {
            company: () => setShowCompanyBoard(true),
            costCenter: () => setShowCostCenterBoard(true),
            department: () => setShowDepartmentBoard(true),
            category: () => setShowCategoryBoard(true),
            route: () => setShowRouteBoard(true),
            area: () => setShowAreaBoard(true),
            supplier: () => setShowSupplierMasterBoard(true),
            customer: () => setShowCustomerMasterBoard(true),
            customerType: () => setShowCustomerTypeBoard(true),
            vendorTypes: () => setShowVendorTypesBoard(true),
            cardSale: () => setShowCardCommissionBoard(true),
            chartOfAccount: () => setShowChartOfAccountantModal(true),
            userProfile: () => setShowUserProfileBoard(true),
            changePassword: () => setShowChangePasswordBoard(true),
            logoff: handleLogOff,
        };
        setters[board]?.();
    };

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
    <div className="bg-[#1e3a5f] px-5 py-3.5 flex items-center justify-between select-none relative overflow-hidden">
                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                                <FolderOpen size={13} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-white uppercase tracking-[2px] font-mono leading-none">Master File Management</span>
                                <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-0.5">System Configuration & Records</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 rounded-[8px] transition-all active:scale-90 outline-none border-none group"
                        >
                            <X size={16} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="px-3 py-2 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search master files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-6 text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[65vh] no-scrollbar">
                        {filteredGroups.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                    <Search size={18} className="text-slate-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">No master files found</p>
                                <button onClick={() => setSearchQuery('')} className="mt-1.5 text-[9px] font-bold text-[#0285fd] uppercase tracking-wider hover:underline">
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            filteredGroups.map((group, gi) => (
                                <div key={gi}>
                                    <div className="flex items-center gap-2 px-4 py-2">
                                        <div className="w-1 h-1 rounded-full bg-[#0285fd]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</span>
                                        <div className="flex-1" />
                                        <span className="text-[9px] font-mono font-bold text-slate-300">{group.items.length}</span>
                                    </div>
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        const isLocked = localStorage.getItem(`isLocked_${item.id}`) === 'true';

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (isLocked) { setShowLockModal(true); return; }
                                                    item.board === 'logoff' ? handleLogOff() : openBoard(item.board);
                                                }}
                                                className="group w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all relative overflow-hidden text-left border-none"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0285fd]" />

                                                <div className="flex items-center gap-3 relative z-10 w-full">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-sm ${isLocked ? 'bg-red-50' : 'bg-slate-100 group-hover:bg-white'}`}>
                                                        {isLocked ? <Lock size={14} className="text-red-500" /> : <Icon size={14} className="text-slate-500 group-hover:text-[#0285fd] transition-colors" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        {isLocked && (
                                                            <span className="text-[7px] font-black text-red-500 uppercase tracking-[0.2em] mb-0.5">Secured Module</span>
                                                        )}
                                                        <span className={`text-[12px] font-bold transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {menuGroups.reduce((sum, g) => sum + g.items.length, 0)} Modules
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">v2.0</span>
                    </div>
                </div>
            </div>

            <FeatureLockedModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />

            {showCompanyBoard && <CompanyBoard isOpen={showCompanyBoard} onClose={() => setShowCompanyBoard(false)} />}
            {showCostCenterBoard && <CostCenterBoard isOpen={showCostCenterBoard} onClose={() => setShowCostCenterBoard(false)} />}
            {showDepartmentBoard && <DepartmentBoard isOpen={showDepartmentBoard} onClose={() => setShowDepartmentBoard(false)} />}
            {showCategoryBoard && <CategoryBoard isOpen={showCategoryBoard} onClose={() => setShowCategoryBoard(false)} />}
            {showRouteBoard && <RouteBoard isOpen={showRouteBoard} onClose={() => setShowRouteBoard(false)} />}
            {showAreaBoard && <AreaBoard isOpen={showAreaBoard} onClose={() => setShowAreaBoard(false)} />}
            {showSupplierMasterBoard && <SupplierMasterBoard isOpen={showSupplierMasterBoard} onClose={() => setShowSupplierMasterBoard(false)} />}
            {showCustomerMasterBoard && <CustomerMasterBoard isOpen={showCustomerMasterBoard} onClose={() => setShowCustomerMasterBoard(false)} />}
            {showCustomerTypeBoard && <CustomerTypeBoard isOpen={showCustomerTypeBoard} onClose={() => setShowCustomerTypeBoard(false)} />}
            {showCardCommissionBoard && <CardCommissionBoard isOpen={showCardCommissionBoard} onClose={() => setShowCardCommissionBoard(false)} />}
            {showUserProfileBoard && <UserProfileBoard isOpen={showUserProfileBoard} onClose={() => setShowUserProfileBoard(false)} />}
            {showVendorTypesBoard && <VendorTypesBoard isOpen={showVendorTypesBoard} onClose={() => setShowVendorTypesBoard(false)} />}
            {showChangePasswordBoard && <ChangePasswordBoard isOpen={showChangePasswordBoard} onClose={() => setShowChangePasswordBoard(false)} />}

            {showChartOfAccountantModal && (
                <ChartOfAccountantModal
                    isOpen={showChartOfAccountantModal}
                    onClose={() => setShowChartOfAccountantModal(false)}
                    onCreateNewAccount={() => { setShowChartOfAccountantModal(false); setShowNewAccountBoard(true); }}
                    onOpenFixedAssets={() => { setShowChartOfAccountantModal(false); setShowFixedAssetsBoard(true); }}
                    onOpenLiability={() => { setShowChartOfAccountantModal(false); setShowLiabilityBoard(true); }}
                    onOpenDepreciation={() => { setShowChartOfAccountantModal(false); setShowDepreciationBoard(true); }}
                    onOpenFixedIncome={() => { setShowChartOfAccountantModal(false); setShowFixedIncomeBoard(true); }}
                    onOpenFixedExpenses={() => { setShowChartOfAccountantModal(false); setShowFixedExpensesBoard(true); }}
                />
            )}

            {showNewAccountBoard && <NewAccountBoard isOpen={showNewAccountBoard} onClose={() => setShowNewAccountBoard(false)} />}
            {showFixedAssetsBoard && <FixedAssetsBoard isOpen={showFixedAssetsBoard} onClose={() => setShowFixedAssetsBoard(false)} />}
            {showLiabilityBoard && <LongTermLiabilityBoard isOpen={showLiabilityBoard} onClose={() => setShowLiabilityBoard(false)} />}
            {showDepreciationBoard && <DepreciationBoard isOpen={showDepreciationBoard} onClose={() => setShowDepreciationBoard(false)} />}
            {showFixedIncomeBoard && <FixedIncomeBoard isOpen={showFixedIncomeBoard} onClose={() => setShowFixedIncomeBoard(false)} />}
            {showFixedExpensesBoard && <FixedExpensesBoard isOpen={showFixedExpensesBoard} onClose={() => setShowFixedExpensesBoard(false)} />}

            <ThankYouModal isOpen={showThankYouModal} onClose={() => { setShowThankYouModal(false); onClose(); }} />
            <LogoutConfirmModal isOpen={showLogoutConfirmModal} onClose={() => setShowLogoutConfirmModal(false)} onConfirm={() => { setShowLogoutConfirmModal(false); setShowThankYouModal(true); }} />
        </>
    );
};

export default MasterSubModal;
