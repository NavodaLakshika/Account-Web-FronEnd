import React, { useState } from 'react';
import { X, ChevronRight, Building2, Target, Users, UserSquare, CreditCard, PieChart, UserCog, Settings, Key, LogOut, Layers, Briefcase } from 'lucide-react';
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

const MasterSubModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleLogOff = () => {
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
        { icon: Building2, label: 'Open Company', shortcut: '', onClick: () => setShowCompanyBoard(true) },
        { icon: Target, label: 'Cost Center Master', shortcut: '', onClick: () => setShowCostCenterBoard(true) },
        { icon: Briefcase, label: 'Create Department', shortcut: '', onClick: () => setShowDepartmentBoard(true) },
        { icon: Layers, label: 'Create Category', shortcut: '', onClick: () => setShowCategoryBoard(true) },
        { icon: UserSquare, label: 'Supplier Master', shortcut: '', onClick: () => setShowSupplierMasterBoard(true) },
        { icon: Users, label: 'Customer Master', shortcut: '', onClick: () => setShowCustomerMasterBoard(true) },
        { icon: CreditCard, label: 'Card Sale Commission', shortcut: '', onClick: () => setShowCardCommissionBoard(true) },
        { icon: PieChart, label: 'Chart of Accountant', hasSubmenu: true, onClick: () => setShowChartOfAccountantModal(true) },
        { icon: UserCog, label: 'User Profile Maintenance', shortcut: '', onClick: () => setShowUserProfileBoard(true) },
        { icon: Settings, label: 'Vendor Types', shortcut: '', onClick: () => setShowVendorTypesBoard(true) },
        { icon: Key, label: 'Change Password', shortcut: '', onClick: () => setShowChangePasswordBoard(true) },
        { type: 'separator' },
        { icon: LogOut, label: 'Log Off', shortcut: '', color: 'text-red-600', onClick: handleLogOff },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        {/* System Color Left Accent */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                            style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                        />
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-[#0078d4]" />
                            <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Master File Management</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                            title="Close"
                        >
                            <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                        {menuItems.map((item, idx) => {
                            if (item.type === 'separator') {
                                return <div key={idx} className="my-1.5 h-[1px] bg-gray-200 mx-2" />;
                            }
                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 group transition-all relative overflow-hidden"
                                >
                                    {/* Hover Indicator Bar */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0078d4' }}
                                    />
                                    
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm group-hover:shadow-md">
                                            <Icon size={16} className={`text-slate-500 transition-colors ${item.color || 'group-hover:text-[#0078d4]'}`} style={{ color: !item.color ? undefined : undefined }} />
                                        </div>
                                        <span className={`text-[13px] font-bold ${item.color || 'text-slate-700'} group-hover:text-slate-900 transition-colors`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 relative z-10">
                                        {item.shortcut && (
                                            <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                {item.shortcut}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

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
