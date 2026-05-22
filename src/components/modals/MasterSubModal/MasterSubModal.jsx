import React, { useState } from 'react';
import {
    X,
    ChevronRight,
    Building2,
    Target,
    Users,
    UserSquare,
    CreditCard,
    PieChart,
    UserCog,
    Settings,
    Key,
    LogOut,
    Layers,
    Briefcase,
    Lock
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
import SupplierMasterBoard from './SupplierMasterBoard';
import CustomerMasterBoard from './CustomerMasterBoard';
import CardCommissionBoard from './CardCommissionBoard';
import UserProfileBoard from './UserProfileBoard';
import VendorTypesBoard from './VendorTypesBoard';
import ChangePasswordBoard from './ChangePasswordBoard';

import ThankYouModal from '../ThankYouModal';
import LogoutConfirmModal from '../LogoutConfirmModal';
import FeatureLockedModal from '../FeatureLockedModal';

const MasterSubModal = ({ isOpen, onClose }) => {

    const [showLockModal, setShowLockModal] = useState(false);

    const [showChartOfAccountantModal, setShowChartOfAccountantModal] = useState(false);
    const [showCompanyBoard, setShowCompanyBoard] = useState(false);
    const [showCostCenterBoard, setShowCostCenterBoard] = useState(false);
    const [showDepartmentBoard, setShowDepartmentBoard] = useState(false);
    const [showCategoryBoard, setShowCategoryBoard] = useState(false);
    const [showSupplierMasterBoard, setShowSupplierMasterBoard] = useState(false);
    const [showCustomerMasterBoard, setShowCustomerMasterBoard] = useState(false);
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

    if (!isOpen) return null;

    const handleLogOff = () => {
        if (localStorage.getItem('isLocked_master_logoff') === 'true') {
            setShowLockModal(true);
            return;
        }

        setShowLogoutConfirmModal(true);
    };

    const menuItems = [
        { icon: Building2, label: 'Open Company', id: 'master_company', onClick: () => setShowCompanyBoard(true) },
        { icon: Target, label: 'Cost Center Master', id: 'master_costCenter', onClick: () => setShowCostCenterBoard(true) },
        { icon: Briefcase, label: 'Create Department', id: 'master_department', onClick: () => setShowDepartmentBoard(true) },
        { icon: Layers, label: 'Create Category', id: 'master_category', onClick: () => setShowCategoryBoard(true) },
        { icon: UserSquare, label: 'Supplier Master', id: 'master_supplier', onClick: () => setShowSupplierMasterBoard(true) },
        { icon: Users, label: 'Customer Master', id: 'master_customer', onClick: () => setShowCustomerMasterBoard(true) },
        { icon: CreditCard, label: 'Card Sale Commission', id: 'master_cardSale', onClick: () => setShowCardCommissionBoard(true) },
        { icon: PieChart, label: 'Chart of Accountant', id: 'master_chartOfAccount', onClick: () => setShowChartOfAccountantModal(true) },
        { icon: UserCog, label: 'User Profile Maintenance', id: 'master_userProfile', onClick: () => setShowUserProfileBoard(true) },
        { icon: Settings, label: 'Vendor Types', id: 'master_vendorTypes', onClick: () => setShowVendorTypesBoard(true) },
        { icon: Key, label: 'Change Password', id: 'master_changePassword', onClick: () => setShowChangePasswordBoard(true) },
        { icon: LogOut, label: 'Log Off', id: 'master_logoff', color: 'text-red-600', onClick: handleLogOff },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-[#1e335c]/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-md bg-[#f8f8f8] rounded-[18px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">

                    {/* Header */}
                    <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-[#f8f8f8]">

                        {/* Left Blue Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#4f83ff]" />

                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <Layers size={15} className="text-[#4f83ff]" />

                            <h2 className="text-[15px] font-black uppercase tracking-[0.35em] text-[#0f172a]">
                                Master File Management
                            </h2>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90"
                        >
                            <X
                                size={20}
                                strokeWidth={3}
                                className="text-red-600"
                            />
                        </button>
                    </div>

                    {/* Menu List */}
                    <div className="px-4 py-4 max-h-[75vh] overflow-y-auto">

                        <div className="flex flex-col">

                            {menuItems.map((item, idx) => {

                                const Icon = item.icon;

                                const isLocked =
                                    localStorage.getItem(`isLocked_${item.id}`) === 'true';

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {

                                            if (isLocked) {
                                                setShowLockModal(true);
                                                return;
                                            }

                                            item.onClick();
                                        }}
                                        className="group w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white transition-all duration-200"
                                    >

                                        {/* Left */}
                                        <div className="flex items-center gap-4">

                                            {/* Icon Box */}
                                            <div className="w-9 h-9 rounded-xl bg-[#efefef] flex items-center justify-center shadow-sm">

                                                <Icon
                                                    size={17}
                                                    strokeWidth={1.8}
                                                    className={`${item.color || 'text-slate-500'}`}
                                                />
                                            </div>

                                            {/* Label */}
                                            <span className="text-[14px] font-[700] text-slate-700 tracking-tight">
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Right */}
                                        <div className="flex items-center gap-2">

                                            {isLocked && (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-100">

                                                    <Lock
                                                        size={9}
                                                        className="text-red-500"
                                                    />

                                                    <span className="text-[9px] font-bold uppercase text-red-500">
                                                        Locked
                                                    </span>
                                                </div>
                                            )}

                                            <ChevronRight
                                                size={15}
                                                className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Locked */}
            <FeatureLockedModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
            />

            {/* Company */}
            {showCompanyBoard && (
                <CompanyBoard
                    isOpen={showCompanyBoard}
                    onClose={() => setShowCompanyBoard(false)}
                />
            )}

            {/* Cost Center */}
            {showCostCenterBoard && (
                <CostCenterBoard
                    isOpen={showCostCenterBoard}
                    onClose={() => setShowCostCenterBoard(false)}
                />
            )}

            {/* Department */}
            {showDepartmentBoard && (
                <DepartmentBoard
                    isOpen={showDepartmentBoard}
                    onClose={() => setShowDepartmentBoard(false)}
                />
            )}

            {/* Category */}
            {showCategoryBoard && (
                <CategoryBoard
                    isOpen={showCategoryBoard}
                    onClose={() => setShowCategoryBoard(false)}
                />
            )}

            {/* Supplier */}
            {showSupplierMasterBoard && (
                <SupplierMasterBoard
                    isOpen={showSupplierMasterBoard}
                    onClose={() => setShowSupplierMasterBoard(false)}
                />
            )}

            {/* Customer */}
            {showCustomerMasterBoard && (
                <CustomerMasterBoard
                    isOpen={showCustomerMasterBoard}
                    onClose={() => setShowCustomerMasterBoard(false)}
                />
            )}

            {/* Card Commission */}
            {showCardCommissionBoard && (
                <CardCommissionBoard
                    isOpen={showCardCommissionBoard}
                    onClose={() => setShowCardCommissionBoard(false)}
                />
            )}

            {/* User Profile */}
            {showUserProfileBoard && (
                <UserProfileBoard
                    isOpen={showUserProfileBoard}
                    onClose={() => setShowUserProfileBoard(false)}
                />
            )}

            {/* Vendor Types */}
            {showVendorTypesBoard && (
                <VendorTypesBoard
                    isOpen={showVendorTypesBoard}
                    onClose={() => setShowVendorTypesBoard(false)}
                />
            )}

            {/* Change Password */}
            {showChangePasswordBoard && (
                <ChangePasswordBoard
                    isOpen={showChangePasswordBoard}
                    onClose={() => setShowChangePasswordBoard(false)}
                />
            )}

            {/* Chart of Accounts */}
            {showChartOfAccountantModal && (
                <ChartOfAccountantModal
                    isOpen={showChartOfAccountantModal}
                    onClose={() => setShowChartOfAccountantModal(false)}
                    onCreateNewAccount={() => {
                        setShowChartOfAccountantModal(false);
                        setShowNewAccountBoard(true);
                    }}
                    onOpenFixedAssets={() => {
                        setShowChartOfAccountantModal(false);
                        setShowFixedAssetsBoard(true);
                    }}
                    onOpenLiability={() => {
                        setShowChartOfAccountantModal(false);
                        setShowLiabilityBoard(true);
                    }}
                    onOpenDepreciation={() => {
                        setShowChartOfAccountantModal(false);
                        setShowDepreciationBoard(true);
                    }}
                    onOpenFixedIncome={() => {
                        setShowChartOfAccountantModal(false);
                        setShowFixedIncomeBoard(true);
                    }}
                    onOpenFixedExpenses={() => {
                        setShowChartOfAccountantModal(false);
                        setShowFixedExpensesBoard(true);
                    }}
                />
            )}

            {/* New Account */}
            {showNewAccountBoard && (
                <NewAccountBoard
                    isOpen={showNewAccountBoard}
                    onClose={() => setShowNewAccountBoard(false)}
                />
            )}

            {/* Fixed Assets */}
            {showFixedAssetsBoard && (
                <FixedAssetsBoard
                    isOpen={showFixedAssetsBoard}
                    onClose={() => setShowFixedAssetsBoard(false)}
                />
            )}

            {/* Liability */}
            {showLiabilityBoard && (
                <LongTermLiabilityBoard
                    isOpen={showLiabilityBoard}
                    onClose={() => setShowLiabilityBoard(false)}
                />
            )}

            {/* Depreciation */}
            {showDepreciationBoard && (
                <DepreciationBoard
                    isOpen={showDepreciationBoard}
                    onClose={() => setShowDepreciationBoard(false)}
                />
            )}

            {/* Fixed Income */}
            {showFixedIncomeBoard && (
                <FixedIncomeBoard
                    isOpen={showFixedIncomeBoard}
                    onClose={() => setShowFixedIncomeBoard(false)}
                />
            )}

            {/* Fixed Expenses */}
            {showFixedExpensesBoard && (
                <FixedExpensesBoard
                    isOpen={showFixedExpensesBoard}
                    onClose={() => setShowFixedExpensesBoard(false)}
                />
            )}

            {/* Logout */}
            <ThankYouModal
                isOpen={showThankYouModal}
                onClose={() => {
                    setShowThankYouModal(false);
                    onClose();
                }}
            />

            <LogoutConfirmModal
                isOpen={showLogoutConfirmModal}
                onClose={() => setShowLogoutConfirmModal(false)}
                onConfirm={() => {
                    setShowLogoutConfirmModal(false);
                    setShowThankYouModal(true);
                }}
            />
        </>
    );
};

export default MasterSubModal;