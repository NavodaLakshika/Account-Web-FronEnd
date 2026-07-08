import React, { useState } from 'react';
import { X, PieChart, Landmark, ClipboardList, UserSquare, Users, ShieldAlert, Search, BarChart3, Package, Clock, FileText, Wallet, ShoppingCart, CreditCard, BookOpen } from 'lucide-react';

const menuGroups = [
    {
        title: 'Business Overview',
        icon: PieChart,
        items: [
            "Profit and Loss", "Balance Sheet", "Trial Balance", "Statement of Cash Flows", "Statement of Changes in Equity", "Business Snapshot", "Profit and Loss Comparison", "Balance Sheet Comparison", "Custom Summary Report", "Profit and Loss as % of total income", "Profit and Loss by Month", "Profit and Loss Detail", "Profit and Loss year-to-date comparison", "Quarterly Profit and Loss Summary"
        ]
    },
    {
        title: 'Sales and Customers',
        icon: Users,
        items: [
            "Quotation Summary", "Sales by Customer Summary", "Sales by Customer Detail", "Sales by Product/Service Summary", "Sales by Product/Service Detail", "Income by Customer Summary", "Customer Contact List", "Transaction List by Customer", "Time Activities by Customer Detail", "Estimates by Customer", "Customer Phone List", "Sales by Customer Type Detail", "Project Profitability Summary", "Product/Item Profitability by Customer"
        ]
    },
    {
        title: 'Who Owes You',
        icon: Wallet,
        items: [
            "Customer Balance Summary", "Customer Balance Detail", "Open Invoices", "Accounts receivable ageing summary", "Accounts receivable ageing detail", "Collections Report", "Invoice List", "Statement List", "Invoices and Received Payments"
        ]
    },
    {
        title: 'Expenses and Vendors',
        icon: ShoppingCart,
        items: [
            "Purchase List", "Purchases by Product/Service Detail", "Purchases by Supplier Detail", "Expenses by Supplier Summary", "Transaction List by Supplier", "Supplier Contact List", "Cheque Detail", "Bill Payment List", "Open Purchase Order Detail", "Open Purchase Order List", "Bills and Applied Payments", "Supplier Phone List", "Bill Approval Status", "Invoice Approval Status"
        ]
    },
    {
        title: 'What You Owe',
        icon: Landmark,
        items: [
            "Supplier Balance Summary", "Supplier Balance Detail", "Unpaid Bills", "Accounts payable ageing summary", "Accounts payable ageing detail"
        ]
    },
    {
        title: 'Accountant Reports',
        icon: BookOpen,
        items: [
            "Journal", "General Ledger", "General Ledger List", "Transaction Detail by Account", "Transaction List with Splits", "Transaction List by Date", "Recent Transactions", "Invalid Journal Transactions", "Account List", "Reconciliation Reports", "Adjusted Trial Balance", "Profit and Loss By Tag Group", "Transaction List by Tag Group"
        ]
    },
    {
        title: 'Inventory & Products',
        icon: Package,
        items: [
            "Inventory Valuation Summary", "Inventory Valuation Detail", "Stock Take Worksheet", "Product/Service List", "Products Report"
        ]
    },
    {
        title: 'Employees & Time',
        icon: Clock,
        items: [
            "Unbilled time", "Unbilled charges", "Time Summary by Pay Type", "Timesheet Detail by Employee", "Time Activities by Employee Detail", "Employee Contact List", "Recent/Edited Time Activities"
        ]
    },
    {
        title: 'Taxes & Other Lists',
        icon: FileText,
        items: [
            "Tax Liability Report", "Terms List", "Payment Method List", "Deposit Detail", "Recurring Template List", "Audit Log"
        ]
    },
    {
        title: 'Banking and Cash',
        icon: CreditCard,
        items: [
            "Cheque Register", "Petty Cash Report", "Bank Reconciliation Report", "Deposits List"
        ]
    },
    {
        title: 'System and Audit',
        icon: ShieldAlert,
        items: [
            "System Log & Audit Report"
        ]
    }
];

const ReportsModal = ({ isOpen, onClose, onSelectReport }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredGroups = (() => {
        const q = searchQuery.toLowerCase();
        if (!q) return menuGroups;
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.toLowerCase().includes(q)
            )
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
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[1300px] h-[85vh] bg-gray-50 rounded-[3px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[3px] bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <BarChart3 size={24} className="text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[20px] font-bold text-gray-900 tracking-tight">Reports Hub</span>
                            <span className="text-[12px] font-medium text-gray-500 uppercase tracking-widest mt-1">Explore {totalModules} Financial & Business Reports</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-[3px] border border-gray-300 bg-gray-50 shadow-inner w-80">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search all reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-[14px] font-medium text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-[3px] transition-colors text-gray-500 hover:text-red-600">
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
                        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                            {filteredGroups.map((group, gi) => {
                                const Icon = group.icon;
                                return (
                                    <div key={gi} className="break-inside-avoid bg-white border border-gray-200 rounded-[3px] shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-4 py-3 bg-slate-50 border-b border-gray-200 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-[3px] bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                                                <Icon size={16} className="text-gray-600" />
                                            </div>
                                            <span className="text-[14px] font-bold text-gray-900">{group.title}</span>
                                            <div className="flex-1" />
                                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-[3px]">{group.items.length}</span>
                                        </div>
                                        <div className="flex flex-col py-2">
                                            {group.items.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelect(item)}
                                                    className="w-full text-left px-5 py-2 hover:bg-blue-50 text-[13px] text-gray-700 hover:text-blue-700 transition-colors group flex justify-between items-center"
                                                >
                                                    <span className="font-medium truncate pr-4">{item}</span>
                                                </button>
                                            ))}
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

export default ReportsModal;




