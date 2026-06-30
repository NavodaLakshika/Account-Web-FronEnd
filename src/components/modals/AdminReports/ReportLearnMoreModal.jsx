import React, { useState } from 'react';
import { X, Search, ChevronRight, ChevronDown, ThumbsUp, Clock, Calendar, FileText, Settings2, Download, Printer, Mail, Sparkles, BookOpen } from 'lucide-react';

const sections = [
    {
        id: 'overview',
        title: "What's the Report Builder?",
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>
                    The Report Builder is ONIMTA's integrated reporting engine for viewing financial and operational reports.
                    It combines high-speed performance with modern tools such as column filters, export options, and an AI-powered assistant.
                </p>
                <p>
                    Key reporting tools are easier to access than ever. Here is a list of location updates for these tools:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-slate-600">
                    <li><strong className="text-slate-800">Cash vs Accrual:</strong> A toggle for your preferred accounting method, located in the filters bar.</li>
                    <li><strong className="text-slate-800">Header dropdowns:</strong> Display columns by and Compare to are now accessible directly in the report header.</li>
                    <li><strong className="text-slate-800">Customisation:</strong> Located in a dedicated panel to streamline your workflow.</li>
                    <li><strong className="text-slate-800">Page-level scroll:</strong> Hover your mouse in the white space to the left or right of a report to scroll through the page.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'system-modules',
        title: 'Core System Modules',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Your ONIMTA Accounts system is integrated with the following core financial modules:</p>
                <div className="grid grid-cols-1 gap-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">Banking & Cash</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>Bank Reconciliation</li>
                            <li>Direct Bank Transactions</li>
                            <li>Main Cash & Petty Cash</li>
                            <li>Cheque Management (Write, Cancel, In Hand)</li>
                            <li>Funds Transfers & Deposits</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">Sales & Payables</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>Customer Invoices & Receipts</li>
                            <li>Estimates & Advances</li>
                            <li>Vendor Bills (Enter & Pay Bill)</li>
                            <li>Payment Setoffs</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">General Accounting</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>Chart of Accounts</li>
                            <li>Journal Entries & Reversals</li>
                            <li>Opening Balances</li>
                            <li>Trial Balance</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'report-types',
        title: 'Available Report Types',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>The system provides 90+ pre-built reports covering all aspects of your business. Here are the key categories:</p>
                <div className="grid grid-cols-1 gap-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">Business Overview</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>Profit and Loss</li>
                            <li>Balance Sheet</li>
                            <li>Statement of Cash Flows</li>
                            <li>Business Snapshot</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">Who owes you (A/R)</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>A/R Ageing Summary</li>
                            <li>Customer Balance Detail</li>
                            <li>Open Invoices</li>
                            <li>Collections Report</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">What you owe (A/P)</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>A/P Ageing Summary</li>
                            <li>Supplier Balance Detail</li>
                            <li>Unpaid Bills</li>
                            <li>Expenses by Supplier Summary</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1.5">Accounting & Other</h4>
                        <ul className="list-disc pl-4 text-[12px] text-slate-600 space-y-0.5">
                            <li>General Ledger & Journal</li>
                            <li>Tax Liability Report</li>
                            <li>Inventory Valuation Summary</li>
                            <li>Audit Log</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'date-range',
        title: 'Setting Date Ranges',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>You can control the time period for your report using the following options:</p>
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-2">
                    <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Report period dropdown:</span>
                            <span className="text-slate-600 ml-1">Quick-select from predefined periods such as Today, This Week, This Month, This Year, or This year to date.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Custom From / To dates:</span>
                            <span className="text-slate-600 ml-1">Click the date fields to open a calendar popup and select a custom start and end date for your report.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'accounting-method',
        title: 'Cash vs Accrual Accounting',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Toggle between Cash and Accrual accounting methods using the segmented control in the filters bar:</p>
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-2">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center text-[10px] font-bold text-emerald-700 mt-0.5 shrink-0">C</div>
                        <div>
                            <span className="font-bold text-slate-800">Cash basis:</span>
                            <span className="text-slate-600 ml-1">Records revenue and expenses when cash is actually received or paid.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-[10px] font-bold text-blue-700 mt-0.5 shrink-0">A</div>
                        <div>
                            <span className="font-bold text-slate-800">Accrual basis:</span>
                            <span className="text-slate-600 ml-1">Records revenue when earned and expenses when incurred, regardless of cash flow.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'display-compare',
        title: 'Display Columns By & Compare To',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-3">
                    <div>
                        <span className="font-bold text-slate-800">Display columns by:</span>
                        <span className="text-slate-600 ml-1">Pivots your report data into columns. Choose from Customer, Employee, Product/Service, Supplier, or time periods.</span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-800">Compare to:</span>
                        <span className="text-slate-600 ml-1">Add comparison columns to your report. Options include Previous Year, Previous Period, Year-to-date, Previous Year YTD, and Custom Period.</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'customise',
        title: 'Customising Your Report',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Click the <strong>Customise</strong> button to open the customisation panel with two tabs:</p>
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-3">
                    <div>
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1">Data tab</h4>
                        <ul className="list-disc pl-5 text-[12px] text-slate-600 space-y-1">
                            <li><strong>Filters:</strong> Add conditions to narrow down report data.</li>
                            <li><strong>Number format:</strong> Divide by 1000, hide currency symbols, round to whole numbers.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-[12px] mb-1">Visual tab</h4>
                        <ul className="list-disc pl-5 text-[12px] text-slate-600 space-y-1">
                            <li><strong>Header:</strong> Toggle company logo, report period, and company name.</li>
                            <li><strong>Footer:</strong> Show date prepared, time prepared, and report basis.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'export-print',
        title: 'Export, Print & Email',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <div className="space-y-2">
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-[3px]">
                        <Download size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Export:</span>
                            <span className="text-slate-600 ml-1">Download your report as Excel (.xlsx), CSV, or PDF.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-[3px]">
                        <Printer size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Print:</span>
                            <span className="text-slate-600 ml-1">Open the print preview with full controls.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-[3px]">
                        <Mail size={16} className="text-purple-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Email:</span>
                            <span className="text-slate-600 ml-1">Send the report directly as an email attachment.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ai-assistant',
        title: 'Onimta AI Assistant (BETA)',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-[3px] border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-[#0077c5]" />
                        <span className="font-bold text-slate-800 text-[12px]">How it works</span>
                    </div>
                    <ul className="list-disc pl-5 text-[12px] text-slate-600 space-y-1">
                        <li>Type your question about the current report.</li>
                        <li>The AI analyses the report context and provides a concise response.</li>
                    </ul>
                </div>
            </div>
        )
    }
];

const relatedLinks = [
    { label: 'View Customer details and transactions', href: '/customers' },
    { label: 'View Vendor details and transactions', href: '/vendors' },
    { label: 'Create charts to see your business performance', href: '/dashboard' },
    { label: 'View and edit management reports', href: '/reports' },
    { label: 'Chart of Accounts setup', href: '/accounts' }
];

const ReportLearnMoreModal = ({ isOpen, onClose }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState(null);

    const toggleSection = (id) => {
        setExpandedSection(prev => prev === id ? null : id);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[600] bg-transparent" onClick={onClose} />
            
            {/* Side Panel Drawer */}
            <div className="fixed inset-y-0 right-0 z-[601] w-[450px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 font-sans border-l border-gray-200">
                {/* Header (Blue) */}
                <div className="bg-[#105b9b] px-4 pt-3 pb-4 shrink-0 flex flex-col shadow-md z-10 relative">
                    <div className="flex justify-end mb-3">
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <X size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold" strokeWidth={2.5} />
                        <input 
                            type="text" 
                            placeholder="Search questions, keywords or topics" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 rounded-[3px] bg-white text-[14px] text-gray-800 outline-none placeholder:text-gray-500 font-medium border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                        />
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="p-7">
                        {/* Title & Meta */}
                        <div className="border-t border-gray-200 pt-3 mb-6">
                            <h1 className="text-[22px] font-bold text-gray-900 leading-tight mb-4">
                                Customise your reports with a modern view in ONIMTA
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-600 mb-6 font-medium">
                                <span className="font-bold text-gray-900">by ONIMTA</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><ThumbsUp size={14} className="text-gray-500" /> 422</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" /> Updated 3 weeks ago</span>
                            </div>
                        </div>

                        {/* Intro Paragraphs */}
                        <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed mb-8">
                            <p>Customise your reports with a modern view in ONIMTA Accounts Advanced.</p>
                            <p>With ONIMTA Accounts, you can create and personalise reports using the Custom Report Builder to track your business performance accurately.</p>
                            <p>Modern view combines high-speed performance with highly requested features from classic view, such as auto-refresh and zero-balance drilldowns.</p>
                            
                            <h3 className="font-bold text-[18px] text-gray-900 mt-8 mb-3">What's Modern View?</h3>
                            <p>Modern view is a revamped reporting experience for standard and custom reports. Explore the features below:</p>
                        </div>

                        {/* Accordions */}
                        <div className="space-y-0 border-t border-gray-200 pt-2 mb-8">
                            {sections.map((section) => {
                                const isOpen = expandedSection === section.id;
                                return (
                                    <div key={section.id} className="border-b border-gray-200">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center gap-3 py-4 hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <div className="text-[#0077c5] shrink-0 transform transition-transform duration-200 group-hover:text-[#005a9c]">
                                                {isOpen ? <ChevronDown size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />}
                                            </div>
                                            <span className="text-[15px] font-medium text-[#0077c5] group-hover:underline group-hover:text-[#005a9c]">{section.title}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="pl-8 pr-2 pb-5 pt-1 animate-in slide-in-from-top-2 duration-200">
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Video Placeholder */}
                        <div className="w-full aspect-video bg-gray-100 rounded-[3px] border border-gray-200 flex flex-col items-center justify-center mb-10 overflow-hidden relative group cursor-pointer">
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors z-10" />
                            <div className="w-16 h-12 bg-red-600 rounded-[3px] flex items-center justify-center shadow-lg z-20 group-hover:bg-red-700 transition-colors">
                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                            </div>
                            <span className="mt-3 font-bold text-gray-700 z-20">Watch on YouTube</span>
                        </div>

                        {/* Related Links */}
                        <div className="mb-6">
                            <h3 className="text-[17px] font-bold text-gray-900 mb-4">Related links</h3>
                            <ul className="list-disc pl-5 space-y-3">
                                {relatedLinks.map((link, i) => (
                                    <li key={i} className="text-gray-800 marker:text-gray-400">
                                        <a href={link.href} className="text-[#0077c5] hover:underline text-[14px] font-medium leading-tight">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-5 shrink-0 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 w-full justify-center">
                        <span className="text-[14px] text-gray-700 font-medium">
                            {feedbackStatus ? 'Thank you for your feedback!' : 'Was this helpful?'}
                        </span>
                        {!feedbackStatus && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setFeedbackStatus('yes')}
                                    className="px-5 py-1.5 border border-gray-400 bg-white hover:bg-gray-50 hover:border-[#0077c5] hover:text-[#0077c5] rounded text-[13px] font-bold text-gray-700 transition-colors shadow-sm"
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setFeedbackStatus('no')}
                                    className="px-5 py-1.5 border border-gray-400 bg-white hover:bg-gray-50 hover:border-[#0077c5] hover:text-[#0077c5] rounded text-[13px] font-bold text-gray-700 transition-colors shadow-sm"
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="w-full border-t border-gray-200 my-1" />
                    <button className="px-5 py-2 border-2 border-green-700 text-blue-700 hover:bg-blue-50 rounded-[3px] font-bold text-[14px] bg-white transition-colors shadow-sm">
                        Contact Us
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReportLearnMoreModal;

