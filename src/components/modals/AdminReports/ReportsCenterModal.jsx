import React, { useState, useEffect } from 'react';
import { X, PieChart, Landmark, UserSquare, Users, Search, BarChart3, Package, Clock, FileText, Wallet, ShoppingCart, CreditCard, BookOpen, Lock } from 'lucide-react';
import api from '../../../services/api';

export const menuGroups = [
    {
        title: 'Business overview',
        icon: PieChart,
        items: [
            "Audit Log", "Balance Sheet", "Balance Sheet Comparison", "Balance Sheet Detail", 
            "Balance Sheet Summary", "Statement of Cash Flows", "Business Snapshot", 
            "Custom Summary Report", "Statement of Changes in Equity", "Profit and Loss", 
            "Profit and Loss by Customer", "Profit and Loss by Month", "Profit and Loss By Tag Group", 
            "Profit and Loss Comparison", "Profit and Loss Detail", "Profit and Loss as % of total income", 
            "Profit and Loss year-to-date comparison", "Project Profitability Summary", "Quarterly Profit and Loss Summary"
        ]
    },
    {
        title: 'Who owes you',
        icon: Wallet,
        items: [
            "Accounts receivable ageing summary", "Accounts receivable ageing detail", "Collections Report", 
            "Customer Balance Summary", "Customer Balance Detail", "Invoice List", "Invoices and Received Payments", 
            "Open Invoices", "Statement List", "Terms List", "Unbilled charges", "Unbilled time"
        ]
    },
    {
        title: 'Inventory',
        icon: Package,
        items: [
            "Products Report", "Inventory Valuation Detail", "Inventory Valuation Summary", "Open Purchase Order Detail", 
            "Open Purchase Order List", "Stock Take Worksheet"
        ]
    },
    {
        title: 'Sales and customers',
        icon: Users,
        items: [
            "Sales by Customer Type Detail", "Customer Contact List", "Income by Customer Summary", 
            "Customer Phone List", "Sales by Customer Summary", "Sales by Customer Detail", "Deposit Detail", 
            "Estimates by Customer", "Product/Service List", "Sales by Product/Service Summary", 
            "Sales by Product/Service Detail", "Payment Method List", "Time Activities by Customer Detail", 
            "Transaction List by Customer", "Transaction List by Tag Group", "Invoice Approval Status",
            "Product/Item Profitability by Customer"
        ]
    },
    {
        title: 'What you owe',
        icon: CreditCard,
        items: [
            "Accounts payable ageing summary", "Accounts payable ageing detail", "Bills and Applied Payments", 
            "Bill Payment List", "Unpaid Bills", "Supplier Balance Summary", "Supplier Balance Detail",
            "Bill Approval Status"
        ]
    },
    {
        title: 'Expenses and suppliers',
        icon: ShoppingCart,
        items: [
            "Cheque Detail", "Purchases by Product/Service Detail", "Purchase List", "Transaction List by Supplier", 
            "Purchases by Supplier Detail", "Supplier Contact List", "Expenses by Supplier Summary", "Supplier Phone List"
        ]
    },
    {
        title: 'Sales tax',
        icon: FileText,
        items: [
            "Tax Liability Report"
        ]
    },
    {
        title: 'Employees',
        icon: UserSquare,
        items: [
            "Employee Contact List", "Recent/Edited Time Activities", "Time Activities by Employee Detail"
        ]
    },
    {
        title: 'For my accountant',
        icon: BookOpen,
        items: [
            "Account List", "Balance Sheet", "Balance Sheet Comparison", "Balance Sheet Detail", "Balance Sheet Summary", 
            "Statement of Cash Flows", "Invalid Journal Transactions", "General Ledger", "General Ledger List", 
            "Journal", "Recurring Template List", "Profit and Loss", "Profit and Loss by Customer", 
            "Profit and Loss by Month", "Profit and Loss Comparison", "Profit and Loss as % of total income", 
            "Profit and Loss year-to-date comparison", "Quarterly Profit and Loss Summary", "Recent Transactions", 
            "Reconciliation Reports", "Trial Balance", "Adjusted Trial Balance", "Transaction Detail by Account", 
            "Transaction List by Date", "Transaction List with Splits"
        ]
    },
    {
        title: 'Payroll',
        icon: Landmark,
        items: [
            "Employee Contact List", "Recent/Edited Time Activities", "Time Activities by Employee Detail"
        ]
    },
    {
        title: 'Time',
        icon: Clock,
        items: [
            "Timesheet Detail by Employee", "Time Summary by Pay Type"
        ]
    },
    {
        title: 'Chart of Accounts',
        icon: PieChart,
        items: [
            "Chart of Accounts", "Fixed Assets Item List", "Long Term Liability", "Depreciation Procedure",
            "Fixed Income", "Fixed Expenses", "Sales Tax ID List"
        ]
    }
];

const ReportsCenterModal = ({ isOpen, onClose, onSelectReport, empCode, companyCode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [hiddenReports, setHiddenReports] = useState([]);

    useEffect(() => {
        if (isOpen && empCode && companyCode) {
            api.get(`/SuperAdmin/reports/hidden?empCode=${empCode}&companyCode=${companyCode}`)
                .then(res => setHiddenReports(res.data || []))
                .catch(err => console.error("Error fetching hidden reports", err));
        }
    }, [isOpen, empCode, companyCode]);

    if (!isOpen) return null;

    const filteredGroups = (() => {
        const q = searchQuery.toLowerCase();
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item => {
                // Determine the key for hidden reports (same as we pass to handleOpenReport)
                // In SuperAdmin we used specific IDs like 'trial-balance', here the items are just names.
                // We'll map the report name to a key if needed, or assume the DB stores the report name exactly.
                // Since SuperAdmin passes specific string IDs like "trial-balance", we might need to map them back, 
                // OR we can just check if hiddenReports includes a slugified version of the item name or the exact ID used in SuperAdmin.
                
                // Let's create an ID from the name by lowercasing and replacing spaces with dashes:
                const itemId = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                
                if (!q) return true;
                return item.toLowerCase().includes(q);
            })
        })).filter(group => group.items.length > 0);
    })();

    const handleSelect = (report) => {
        if (onSelectReport) {
            onSelectReport(report);
        }
        onClose();
    };

    const totalModules = menuGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[1300px] h-[85vh] bg-gray-50 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[20px] font-bold text-gray-900 tracking-tight">Reports Hub</span>
                            <span className="text-[12px] font-medium text-gray-500 uppercase tracking-widest mt-1">Explore {totalModules} Financial & Business Reports</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 shadow-inner w-80">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search all reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-[14px] font-medium text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600">
                            <X size={26} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#f4f5f8] custom-scrollbar">
                    {filteredGroups.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No reports found</h3>
                            <p className="text-sm text-gray-500 max-w-sm">We couldn't find any reports matching "{searchQuery}". Try adjusting your search term.</p>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">Clear search</button>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                            {filteredGroups.map((group, gi) => {
                                const Icon = group.icon;
                                return (
                                    <div key={gi} className="break-inside-avoid mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                                                <Icon size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-[14px] font-bold text-gray-900">{group.title}</span>
                                            <div className="flex-1" />
                                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{group.items.length}</span>
                                        </div>
                                        <div className="flex flex-col py-2">
                                            {group.items.map((item, idx) => {
                                                const itemId = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                                                const isLocked = hiddenReports.includes(itemId) || hiddenReports.includes(item);
                                                return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        if (!isLocked) handleSelect(item);
                                                    }}
                                                    disabled={isLocked}
                                                    className={`w-full text-left px-5 py-2 text-[13px] transition-colors group flex justify-between items-start gap-2 ${isLocked ? 'text-gray-400 cursor-not-allowed opacity-70' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                                                >
                                                    <span className="font-medium leading-snug break-words">{item}</span>
                                                    {isLocked && <Lock size={14} className="text-gray-300 group-hover:text-red-500 transition-colors mt-0.5 shrink-0" />}
                                                </button>
                                            )})}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsCenterModal;
