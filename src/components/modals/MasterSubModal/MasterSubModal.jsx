import React, { useState } from 'react';
import { X, ChevronRight, Building2, Target, Users, UserSquare, CreditCard, PieChart, UserCog, Settings, Key, LogOut, Layers, Briefcase, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';

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

import { showErrorToast } from '../../../utils/toastUtils';

import FeatureLockedModal from '../FeatureLockedModal';

const MasterSubModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const [showLockModal, setShowLockModal] = useState(false);

    const handleLogOff = () => {
        if (localStorage.getItem('isLocked_master_logoff') === 'true') {
            setShowLockModal(true);
            return;
        }
        setShowLogoutConfirmModal(true);
    };


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

    const menuItems = [
        { icon: Building2, label: 'Open Company', id: 'master_company', onClick: () => setShowCompanyBoard(true) },
        { icon: Target, label: 'Cost Center Master', id: 'master_costCenter', onClick: () => setShowCostCenterBoard(true) },
        { icon: Briefcase, label: 'Create Department', id: 'master_department', onClick: () => setShowDepartmentBoard(true) },
        { icon: Layers, label: 'Create Category', id: 'master_category', onClick: () => setShowCategoryBoard(true) },
        { icon: UserSquare, label: 'Supplier Master', id: 'master_supplier', onClick: () => setShowSupplierMasterBoard(true) },
        { icon: Users, label: 'Customer Master', id: 'master_customer', onClick: () => setShowCustomerMasterBoard(true) },
        { icon: CreditCard, label: 'Card Sale Commission', id: 'master_cardSale', onClick: () => setShowCardCommissionBoard(true) },
        { icon: PieChart, label: 'Chart of Accountant', id: 'master_chartOfAccount', hasSubmenu: true, onClick: () => setShowChartOfAccountantModal(true) },
        { icon: UserCog, label: 'User Profile Maintenance', id: 'master_userProfile', onClick: () => setShowUserProfileBoard(true) },
        { icon: Settings, label: 'Vendor Types', id: 'master_vendorTypes', onClick: () => setShowVendorTypesBoard(true) },
        { icon: Key, label: 'Change Password', id: 'master_changePassword', onClick: () => setShowChangePasswordBoard(true) },
        { icon: LogOut, label: 'Log Off', id: 'master_logoff', color: 'text-red-600', onClick: handleLogOff },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

                {/* Floating Modal Container - Completely Transparent & Borderless */}
                <div className="relative w-full max-w-5xl flex flex-col animate-in zoom-in-95 duration-500">
                    
                    {/* Header - Floating Pill with Gap */}
                    <div className="relative mb-12">
                        {/* Independent Close Button - Floating Further Outside */}
                        <button 
                            onClick={onClose} 
                            className="absolute -top-12 -right-12 w-10 h-10 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[14px] shadow-[0_12px_24px_rgba(255,59,48,0.4)] hover:shadow-[0_16px_32px_rgba(255,59,48,0.5)] transition-all active:scale-90 outline-none border-none group z-[300]"
                            title="Close"
                        >
                            <X size={24} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="bg-white px-8 py-6 flex items-center justify-center rounded-[14px] border-b border-gray-100/10 select-none relative overflow-hidden shadow-xl w-full">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            
                            <div className="flex items-center gap-3">
                                <Layers size={22} className="text-[#0078d4] animate-pulse" />
                                <span className="text-[19px] font-[900] text-slate-900 uppercase tracking-[8px] font-mono truncate ml-2">Master File Management</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Menu Grid - No backgrounds or borders */}
                    <div className="p-12 flex-1 overflow-y-auto max-h-[80vh] no-scrollbar">
                        <div className="grid grid-cols-6 gap-x-8 gap-y-10">
                            {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                const isLocked = localStorage.getItem(`isLocked_${item.id}`) === 'true';

                                return (
                                    <React.Fragment key={idx}>
                                        {/* Row Separator after 6 items */}
                                        {idx === 6 && (
                                            <div className="col-span-6 my-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />
                                        )}
                                        
                                        <div className="flex flex-col items-center group relative">

                                            <button
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setShowLockModal(true);
                                                        return;
                                                    }
                                                    item.onClick();
                                                }}
                                                className={`w-24 h-24 bg-white rounded-[14px] shadow-lg hover:shadow-2xl hover:-translate-y-3 active:scale-90 transition-all duration-500 flex items-center justify-center relative overflow-hidden ${isLocked ? 'opacity-75 grayscale-[0.5]' : ''}`}
                                            >
                                                {/* Subtle Gradient Backdrop */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                
                                                <Icon 
                                                    size={32} 
                                                    strokeWidth={1.5}
                                                    className={`transition-all duration-500 group-hover:scale-110 ${item.color || (isLocked ? 'text-slate-400' : 'text-slate-500 group-hover:text-[#0078d4]')}`} 
                                                />

                                                {/* Decorative Corner Glow */}
                                                {!isLocked && (
                                                    <div className="absolute -right-6 -top-6 w-12 h-12 bg-[#0078d4]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                                                )}
                                            </button>
                                            
                                            <span className={`mt-5 text-[11px] font-[700] uppercase tracking-[0.25em] text-center leading-tight transition-all duration-300 font-['Inter',sans-serif] ${item.color || 'text-white group-hover:text-white/80'} ${isLocked ? 'opacity-60' : ''}`}>
                                                {item.label}
                                            </span>
                                            
                                            {/* Minimalist Professional Secured Label */}
                                            {isLocked && (
                                                <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full backdrop-blur-md shadow-sm">
                                                    <Lock size={9} strokeWidth={3} className="text-red-400" />
                                                    <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-red-400">Secured</span>
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <FeatureLockedModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
            />

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

            {showNewAccountBoard && (
                <NewAccountBoard
                    isOpen={showNewAccountBoard}
                    onClose={() => setShowNewAccountBoard(false)}
                />
            )}

            {showFixedAssetsBoard && (
                <FixedAssetsBoard
                    isOpen={showFixedAssetsBoard}
                    onClose={() => setShowFixedAssetsBoard(false)}
                />
            )}

            {showLiabilityBoard && (
                <LongTermLiabilityBoard
                    isOpen={showLiabilityBoard}
                    onClose={() => setShowLiabilityBoard(false)}
                />
            )}

            {showDepreciationBoard && (
                <DepreciationBoard
                    isOpen={showDepreciationBoard}
                    onClose={() => setShowDepreciationBoard(false)}
                />
            )}

            {showFixedIncomeBoard && (
                <FixedIncomeBoard
                    isOpen={showFixedIncomeBoard}
                    onClose={() => setShowFixedIncomeBoard(false)}
                />
            )}

            {showFixedExpensesBoard && (
                <FixedExpensesBoard
                    isOpen={showFixedExpensesBoard}
                    onClose={() => setShowFixedExpensesBoard(false)}
                />
            )}

            {showCompanyBoard && (
                <CompanyBoard
                    isOpen={showCompanyBoard}
                    onClose={() => setShowCompanyBoard(false)}
                />
            )}

            {showCostCenterBoard && (
                <CostCenterBoard
                    isOpen={showCostCenterBoard}
                    onClose={() => setShowCostCenterBoard(false)}
                />
            )}

            {showDepartmentBoard && (
                <DepartmentBoard
                    isOpen={showDepartmentBoard}
                    onClose={() => setShowDepartmentBoard(false)}
                />
            )}

            {showCategoryBoard && (
                <CategoryBoard
                    isOpen={showCategoryBoard}
                    onClose={() => setShowCategoryBoard(false)}
                />
            )}

            {showSupplierMasterBoard && (
                <SupplierMasterBoard
                    isOpen={showSupplierMasterBoard}
                    onClose={() => setShowSupplierMasterBoard(false)}
                />
            )}

            {showCustomerMasterBoard && (
                <CustomerMasterBoard
                    isOpen={showCustomerMasterBoard}
                    onClose={() => setShowCustomerMasterBoard(false)}
                />
            )}

            {showCardCommissionBoard && (
                <CardCommissionBoard
                    isOpen={showCardCommissionBoard}
                    onClose={() => setShowCardCommissionBoard(false)}
                />
            )}

            {showUserProfileBoard && (
                <UserProfileBoard
                    isOpen={showUserProfileBoard}
                    onClose={() => setShowUserProfileBoard(false)}
                />
            )}

            {showVendorTypesBoard && (
                <VendorTypesBoard
                    isOpen={showVendorTypesBoard}
                    onClose={() => setShowVendorTypesBoard(false)}
                />
            )}

            {showChangePasswordBoard && (
                <ChangePasswordBoard
                    isOpen={showChangePasswordBoard}
                    onClose={() => setShowChangePasswordBoard(false)}
                />
            )}

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
