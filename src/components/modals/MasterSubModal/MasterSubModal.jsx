import React, { useState } from 'react';
import { X, ChevronRight, Building2, Target, Users, UserSquare, CreditCard, PieChart, UserCog, Settings, Key, LogOut, Layers, Briefcase } from 'lucide-react';
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

const MasterSubModal = ({ isOpen, onClose }) => {
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

    if (!isOpen) return null;

    const menuItems = [
        { icon: Building2, label: 'Open Company...', shortcut: 'Ctrl+O', onClick: () => setShowCompanyBoard(true) },
        { icon: Target, label: 'Cost Center Master', shortcut: '', onClick: () => setShowCostCenterBoard(true) },
        { icon: Briefcase, label: 'Create Department...', shortcut: '', onClick: () => setShowDepartmentBoard(true) },
        { icon: Layers, label: 'Create Category...', shortcut: '', onClick: () => setShowCategoryBoard(true) },
        { icon: UserSquare, label: 'Supplier Master...', shortcut: '', onClick: () => setShowSupplierMasterBoard(true) },
        { icon: Users, label: 'Customer Master...', shortcut: '', onClick: () => setShowCustomerMasterBoard(true) },
        { icon: CreditCard, label: 'Card Sale Commission', shortcut: '', onClick: () => setShowCardCommissionBoard(true) },
        { icon: PieChart, label: 'Chart of Accountant', hasSubmenu: true, onClick: () => setShowChartOfAccountantModal(true) },
        { icon: UserCog, label: 'User Profile Maintenance...', shortcut: '', onClick: () => setShowUserProfileBoard(true) },
        { icon: Settings, label: 'Vendor Types', shortcut: '', onClick: () => setShowVendorTypesBoard(true) },
        { icon: Key, label: 'Change Password', shortcut: '', onClick: () => setShowChangePasswordBoard(true) },
        { type: 'separator' },
        { icon: LogOut, label: 'Log Off', shortcut: 'Alt+F4', color: 'text-red-600' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-[#0078d4]" />
                            <span className="text-xs font-bold text-gray-700">Master File Management</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                        >
                            <X size={12} className="group-hover:stroke-white" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-1 bg-white m-1 border border-gray-300 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                        {menuItems.map((item, idx) => {
                            if (item.type === 'separator') {
                                return <div key={idx} className="my-1.5 h-[1px] bg-gray-200 mx-2" />;
                            }

                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={16} className={`text-gray-500 group-hover:text-white transition-colors ${item.color && 'group-hover:text-white'}`} />
                                        <span className={`text-[13px] font-medium ${item.color || 'text-gray-700'} group-hover:text-white transition-colors`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {item.shortcut && (
                                            <span className="text-[10px] text-gray-400 group-hover:text-white/80">
                                                {item.shortcut}
                                            </span>
                                        )}
                                        {item.hasSubmenu && (
                                            <ChevronRight size={14} className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-medium">{menuItems.filter(i => i.type !== 'separator').length} Items</span>
                        <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic font-sans">Master Master Sub Modal</span>
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
        </>
    );
};

export default MasterSubModal;
