import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    Settings2, Printer, Mail, Download, MoreVertical,
    ChevronLeft,
    BookOpen,
    MessageSquare,
    RefreshCw,
    ChevronDown,
    Info,
    FileText,
    Share,
    Sparkles, X
} from 'lucide-react';
import ReportPrintModal from './modals/AdminReports/ReportPrintModal';
import ReportEmailModal from './modals/AdminReports/ReportEmailModal';
import CalendarModal from './CalendarModal';
import CalendarPopover from './CalendarPopover';
import ReportCustomizeModal from './modals/AdminReports/ReportCustomizeModal';
import api from '../services/api';

const allReportsList = [
    "Profit and Loss Detail",
    "Profit and Loss year-to-date comparison",
    "Quarterly Profit and Loss Summary",
    "Statement of Changes in Equity",
    "Custom Summary Report",
    "Project Profitability Summary",
    "Customer Balance Summary",
    "Customer Balance Detail",
    "Open Invoices",
    "Accounts receivable ageing detail",
    "Collections Report",
    "Invoice List",
    "Statement List",
    "Terms List",
    "Unbilled time",
    "Unbilled charges",
    "Sales by Customer Summary",
    "Sales by Customer Detail",
    "Sales by Product/Service Summary",
    "Sales by Product/Service Detail",
    "Product/Service List",
    "Income by Customer Summary",
    "Customer Contact List",
    "Payment Method List",
    "Transaction List by Customer",
    "Time Activities by Customer Detail",
    "Estimates by Customer",
    "Deposit Detail",
    "Bill Approval Status",
    "Product/Item Profitability by Customer",
    "Invoice Approval Status",
    "Transaction List by Tag Group",
    "Invoices and Received Payments",
    "Supplier Phone List",
    "Bills and Applied Payments",
    "Customer Phone List",
    "Purchases by Product/Service Detail",
    "Time Summary by Pay Type",
    "Timesheet Detail by Employee",
    "Tax Liability Report",
    "Adjusted Trial Balance",
    "Invalid Journal Transactions",
    "Profit and Loss By Tag Group",
    "Sales by Customer Type Detail",
    "Purchase List",
    "General Ledger List",
    "Purchases by Supplier Detail",
    "Audit Log",
    "Expenses by Supplier Summary",
    "Transaction List by Supplier",
    "Supplier Contact List",
    "Cheque Detail",
    "Accounts payable ageing summary",
    "Supplier Balance Detail",
    "Bill Payment List",
    "Accounts payable ageing detail",
    "Unpaid Bills",
    "Supplier Balance Summary",
    "Account List",
    "Reconciliation Reports",
    "Trial Balance",
    "Journal",
    "Profit and Loss",
    "Profit and Loss Comparison",
    "Balance Sheet",
    "Balance Sheet Comparison",
    "Transaction Detail by Account",
    "General Ledger",
    "Transaction List with Splits",
    "Statement of Cash Flows",
    "Transaction List by Date",
    "Recent Transactions",
    "Recurring Template List",
    "Time Activities by Employee Detail",
    "Recent/Edited Time Activities",
    "Employee Contact List",
    "Inventory Valuation Summary",
    "Inventory Valuation Detail",
    "Stock Take Worksheet",
    "Open Purchase Order Detail",
    "Open Purchase Order List",
    "Accounts receivable ageing summary",
    "Balance Sheet Detail",
    "Balance Sheet Summary",
    "Business Snapshot",
    "Profit and Loss as % of total income",
    "Profit and Loss by Customer",
    "Profit and Loss by Month"
];


const OtherReportsDropdown = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = allReportsList.filter(r => r.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative ml-8">
            <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white h-[42px] w-[600px]">
                <input
                    type="text"
                    className="flex-1 h-full px-3 text-[13px] text-gray-700 placeholder-gray-400 outline-none"
                    placeholder="Type report name here"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />
                <div className="w-[42px] h-full flex items-center justify-center border-l border-gray-300 bg-gray-50 text-gray-500 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronDown size={14} />
                </div>
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full max-h-[300px] overflow-y-auto bg-white border border-gray-300 shadow-lg z-[600] rounded-sm py-1">
                    {filtered.length === 0 && <div className="px-4 py-2 text-[13px] text-gray-500">No reports found</div>}
                    {filtered.map(report => (
                        <div
                            key={report}
                            className="px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => {
                                onSelect(report);
                                setIsOpen(false);
                                setSearch('');
                            }}
                        >
                            {report}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ReportTemplate = ({
    title = "A/R Ageing Summary Report",
    subtitle = "As of June 3, 2026",
    companyName = "ONIMTA IT SOLUTIONS",
    data = [],
    columns = [],
    onClose,
    onSwitchReport,
    companyCode,
    empCode,
    roleId,
    isStandalone = false
}) => {
    const [reportPeriod, setReportPeriod] = useState('Today');
    const [asOfDate, setAsOfDate] = useState(() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    });
    const [showNoteArea, setShowNoteArea] = useState(false);
    const [reportNote, setReportNote] = useState('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [dismissAlert, setDismissAlert] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportExcel = () => {
        if (!displayData || displayData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
        setShowExportMenu(false);
    };

    const handleExportCSV = () => {
        if (!displayData || displayData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(displayData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    // AI State
    const [showAIBox, setShowAIBox] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);


    const [apiData, setApiData] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const fetchReportData = async () => {
        if (isStandalone) return;
        
        const endpoint = title.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(w => w.toLowerCase()).filter(Boolean).join('-');

        if (endpoint) {
            setApiLoading(true);
            try {
                const companyRaw = localStorage.getItem('selectedCompany');
                const company = companyRaw ? JSON.parse(companyRaw) : null;
                const localCompanyId = company?.companyCode || company?.CompanyCode || company?.Company_Code || company?.Code || company?.Company_Id || company?.companyId || company?.code || company?.id || '';
                const companyId = companyCode || localCompanyId;

                let startStr = '';
                let endStr = '';
                if (asOfDate) {
                    const parts = asOfDate.split('/');
                    if (parts.length === 3) {
                        const dd = parseInt(parts[0], 10);
                        const mm = parseInt(parts[1], 10);
                        const yyyy = parseInt(parts[2], 10);
                        const endD = new Date(yyyy, mm - 1, dd);
                        let startD = new Date(endD);

                        if (reportPeriod === 'Today') {
                            startD = new Date(endD);
                        } else if (reportPeriod === 'This Week') {
                            const day = startD.getDay();
                            const diff = startD.getDate() - day + (day === 0 ? -6 : 1);
                            startD.setDate(diff);
                        } else if (reportPeriod === 'This Month') {
                            startD = new Date(startD.getFullYear(), startD.getMonth(), 1);
                        } else if (reportPeriod === 'This Year') {
                            startD = new Date(startD.getFullYear(), 0, 1);
                        }

                        const pad = (n) => n < 10 ? '0' + n : n;
                        startStr = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`;
                        endStr = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}`;
                    }
                }

                const response = await api.get(`/report/${endpoint}?companyId=${companyId}&startDate=${startStr}&endDate=${endStr}`);
                setApiData(response.data);
                setApiError(null);
            } catch (error) {
                console.error("Failed to fetch report data", error);
                if (error.response) {
                    setApiError(`API returned ${error.response.status}: ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`);
                } else {
                    setApiError(`Fetch failed: ${error.message}. Is the API URL correct?`);
                }
            } finally {
                setApiLoading(false);
            }
        } else {
            setApiData(null);
            setApiError("Invalid endpoint");
        }
    };

    useEffect(() => {
        fetchReportData();

        // Listen for global data mutations to auto-refresh the report
        const handleDataChange = () => {
            fetchReportData();
        };

        window.addEventListener('reportDataChanged', handleDataChange);

        return () => {
            window.removeEventListener('reportDataChanged', handleDataChange);
        };
    }, [title, reportPeriod, asOfDate]);

    // Use API data if available, otherwise fallback to props
    const displayData = apiData || data;

    // Automatically generate columns if apiData is present and columns prop is empty
    const displayColumns = (apiData && apiData.length > 0 && columns.length === 0)
        ? Object.keys(apiData[0]).map(key => ({ header: key, accessor: key }))
        : columns;

    // Calculate totals for specific columns dynamically
    const columnsToTotal = ['amount', 'qty', 'quantity', 'credit', 'creadis', 'debit', 'total', 'balance', 'hours', 'price', 'discount'];
    const totals = {};
    let hasTotals = false;

    if (displayData && displayData.length > 0) {
        displayColumns.forEach(col => {
            const headerLower = (col.header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const accessor = col.accessor || col.key;
            
            if (columnsToTotal.some(c => headerLower.includes(c))) {
                let sum = 0;
                let isValid = false;
                displayData.forEach(row => {
                    const val = parseFloat(row[accessor]);
                    if (!isNaN(val)) {
                        sum += val;
                        isValid = true;
                    }
                });
                
                if (isValid) {
                    totals[accessor] = sum;
                    hasTotals = true;
                }
            }
        });
    }

    const defaultCustomizations = {
        divideBy1000: false,
        hideCurrency: false,
        roundWholeNumber: false,
        negativeNumbers: '-100',
        negativeRed: false,
        showEmptyAs: 'blank',
        showLogo: false,
        showReportPeriod: true,
        showCompanyName: true,
        headerAlignment: 'Center',
        headerLayout: 'companyFirst',
        showDatePrepared: true,
        showTimePrepared: true,
        showReportBasis: true,
        footerAlignment: 'Center'
    };
    
    // Dynamic company name from local storage
    const displayCompanyName = (() => {
        try {
            const companyRaw = localStorage.getItem('selectedCompany');
            if (companyRaw) {
                const parsed = JSON.parse(companyRaw);
                const name = parsed?.companyName || parsed?.CompanyName || parsed?.Company_Name || parsed?.Name || parsed?.name;
                if (name) return name;
            }
        } catch (e) {}
        return companyName;
    })();

    const [customizations, setCustomizations] = useState(defaultCustomizations);

    const askAI = async () => {
        if (!aiQuestion.trim()) return;
        setIsAiLoading(true);
        setAiResponse("Analyzing report data...");

        try {
            const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
            const apiMessages = [
                { role: "system", content: "You are a helpful, professional AI Assistant integrated into ONIMTA Information Technology's accounting dashboard. You are specifically analyzing a report called '" + title + "'. Provide concise, helpful financial insights based on user questions." },
                { role: "user", content: aiQuestion }
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: apiMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();
            const aiText = data.choices && data.choices[0] && data.choices[0].message.content
                ? data.choices[0].message.content
                : "I couldn't process that response correctly.";

            setAiResponse(aiText);
            setAiQuestion('');
        } catch (error) {
            console.error("AI API Error:", error);
            setAiResponse("I'm sorry, I am currently unable to connect to the AI service. Please try again later.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-[#f4f5f8] overflow-y-auto font-sans flex flex-col">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-green-700 font-bold text-[13px] hover:underline"
                >
                    <ChevronLeft size={16} />
                    Back to dashboard
                </button>

                {onSwitchReport && <OtherReportsDropdown onSelect={onSwitchReport} />}

                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-red-600 font-bold text-[13px] hover:underline">
                        <BookOpen size={14} />
                        Learn more
                    </button>
                    <button className="flex items-center gap-1.5 text-[#0077c5] font-bold text-[13px] hover:underline">
                        <MessageSquare size={14} />
                        Give feedback
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-end justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] text-gray-600 font-medium">Report period</label>
                        <div className="relative">
                            <select
                                value={reportPeriod}
                                onChange={(e) => setReportPeriod(e.target.value)}
                                className="appearance-none w-[160px] h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer"
                            >
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Year</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-[140px] relative">
                        <label className="text-[11px] font-medium text-gray-600">as of</label>
                        <button
                            onClick={() => setShowCalendarModal(!showCalendarModal)}
                            className="calendar-toggle-btn w-[140px] h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer flex items-center justify-start text-left"
                        >
                            {asOfDate}
                        </button>
                        <CalendarPopover
                            isOpen={showCalendarModal}
                            onClose={() => setShowCalendarModal(false)}
                            onDateSelect={(dateStr) => {
                                const [yyyy, mm, dd] = dateStr.split('-');
                                setAsOfDate(`${dd}/${mm}/${yyyy}`);
                            }}
                            initialDate={asOfDate.split('/').reverse().join('-')}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowCustomizeModal(true)} className="h-9 px-4 border border-gray-300 rounded-[3px] bg-white hover:bg-gray-50 flex items-center gap-1.5 text-[13px] font-bold text-[#393a3d] transition-colors">
                        <Settings2 size={14} />
                        Customise
                    </button>
                    <button className="h-9 px-4 rounded-[3px] bg-[#0077c5] hover:bg-[#005ca6] text-white text-[13px] font-bold transition-colors">
                        Save As
                    </button>
                </div>
            </div>

            {/* Main Report Container */}
            <div className="flex-1 p-6 md:p-10 flex justify-center">
                <div className="w-full max-w-[1000px] bg-white border border-gray-200 shadow-sm flex flex-col h-max min-h-[500px]">

                    {/* Inner Toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <button className="flex items-center gap-1 text-[13px] text-gray-600 font-medium hover:text-gray-900">
                            Compact <ChevronDown size={14} />
                        </button>

                        <div className="flex items-center gap-3">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Refresh" onClick={fetchReportData}>
                                <RefreshCw size={16} />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Email" onClick={() => setShowEmailModal(true)}>
                                <Mail size={16} />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Print" onClick={() => setShowPrintModal(true)}>
                                <Printer size={16} />
                            </button>
                            <div className="relative">
                                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Export" onClick={() => setShowExportMenu(!showExportMenu)}>
                                    <Share size={16} />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded shadow-sm w-[160px] z-[1000] flex flex-col py-2" onMouseLeave={() => setShowExportMenu(false)}>
                                        <button onClick={handleExportExcel} className="text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5]">Export to Excel</button>
                                        <button onClick={() => { setShowExportMenu(false); setShowPrintModal(true); }} className="text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5]">Export to PDF</button>
                                        <button onClick={handleExportCSV} className="text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5]">Export as CSV</button>
                                    </div>
                                )}
                            </div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                <MoreVertical size={16} />
                            </button>
                            <button
                                onClick={() => setShowAIBox(!showAIBox)}
                                className="ml-2 h-7 px-3 border border-[#0077c5] text-[#0077c5] hover:bg-blue-50 text-[12px] font-bold rounded-[14px] flex items-center gap-1.5 transition-colors"
                            >
                                Ask a question <span className="bg-[#0077c5] text-white text-[9px] px-1.5 py-0.5 rounded-[3px]">BETA</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Box */}
                    {showAIBox && (
                        <div className="bg-[#f0f8ff] border-b border-[#b3d4f5] p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[#0077c5] font-bold text-[13px]">
                                <Sparkles size={16} /> Onimta Assistant
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask something about this report..."
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && askAI()}
                                    className="flex-1 h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] outline-none focus:border-[#0077c5]"
                                />
                                <button onClick={askAI} disabled={isAiLoading} className={`h-9 px-4 text-white text-[13px] font-bold rounded-[3px] transition-colors ${isAiLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#0077c5] hover:bg-[#005a9c]'}`}>
                                    {isAiLoading ? 'Thinking...' : 'Ask'}
                                </button>
                            </div>
                            {aiResponse && (
                                <div className="bg-white p-3 rounded-[3px] border border-[#b3d4f5] text-[13px] text-gray-700 leading-relaxed shadow-sm">
                                    <strong className="text-[#0077c5] block mb-1">AI:</strong> {aiResponse}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Report Header Text */}
                    <div className={`py-10 flex flex-col gap-1 px-8 ${customizations.headerAlignment === 'Left' ? 'text-left items-start' :
                            customizations.headerAlignment === 'Right' ? 'text-right items-end' : 'text-center items-center'
                        }`}>
                        {customizations.showLogo && (
                            <img src="/onimta_logo-modified.png" alt="Company Logo" className="h-12 w-auto object-contain mb-2" />
                        )}
                        {customizations.headerLayout === 'companyFirst' ? (
                            <>
                                {customizations.showCompanyName && <h1 className="text-[18px] font-bold text-gray-900 uppercase tracking-wide">{displayCompanyName}</h1>}
                                <h2 className="text-[14px] text-gray-700 font-medium">{title}</h2>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[18px] font-bold text-gray-900 tracking-wide">{title}</h2>
                                {customizations.showCompanyName && <h1 className="text-[14px] text-gray-700 font-medium uppercase">{displayCompanyName}</h1>}
                            </>
                        )}
                        {customizations.showReportPeriod && <h3 className="text-[13px] text-gray-500">{subtitle}</h3>}
                    </div>

                    {/* Report Data / Empty State */}
                    <div className="px-8 pb-10 flex-1 flex flex-col gap-4">
                        {apiError && (
                            <div className="border border-red-300 bg-red-50 p-4 rounded-[3px] text-red-800 text-sm">
                                <strong>API Error:</strong> {apiError}
                            </div>
                        )}
                        {displayData.length === 0 && !dismissAlert && !apiError && !apiLoading && (
                            <div className="border border-[#b3d4f5] bg-[#eef6fc] p-4 rounded-[3px] flex items-start justify-between gap-3 shadow-sm transition-all">
                                <div className="flex gap-3">
                                    <Info size={18} className="text-[#0077c5] shrink-0 mt-0.5 fill-blue-100" />
                                    <p className="text-[13px] text-gray-800">
                                        <strong className="font-bold">Your selection doesn't have any info.</strong> Change your selection or start a new search.
                                    </p>
                                </div>
                                <button onClick={() => setDismissAlert(true)} className="text-gray-500 hover:text-gray-800 transition-colors p-1">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="w-full overflow-x-auto border border-gray-200 bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        {displayColumns.map((col, i) => (
                                            <th key={i} className="p-2 text-[12px] font-bold text-gray-800" style={{ textAlign: col.align || 'left' }}>{col.header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiLoading ? <tr><td colSpan="100%" className="text-center py-4">Loading data from database...</td></tr> : displayData.map((row, i) => (
                                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                                            {displayColumns.map((col, j) => (
                                                <td key={j} className="p-2 text-[12px] text-gray-700" style={{ textAlign: col.align || 'left' }}>
                                                    {col.format ? col.format(row[col.accessor || col.key]) : row[col.accessor || col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {displayData.length === 0 && !apiLoading && (
                                        <tr>
                                            <td colSpan={displayColumns.length || 1} className="p-8 text-center text-gray-400 text-[12px] opacity-80">
                                                No data available for this report.
                                            </td>
                                        </tr>
                                    )}
                                    {hasTotals && displayData.length > 0 && !apiLoading && (
                                        <tr className="border-t-[3px] border-double border-gray-400 bg-[#f8fafc] font-bold">
                                            {displayColumns.map((col, j) => {
                                                const accessor = col.accessor || col.key;
                                                const isFirstCol = j === 0;
                                                const hasTotalVal = totals[accessor] !== undefined;

                                                if (hasTotalVal) {
                                                    return (
                                                        <td key={j} className="p-2 text-[12px] text-gray-900" style={{ textAlign: col.align || 'left' }}>
                                                            {col.format ? col.format(totals[accessor]) : totals[accessor].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                    );
                                                }

                                                if (isFirstCol) {
                                                    return <td key={j} className="p-2 text-[12px] text-gray-900 uppercase tracking-widest text-right" style={{ textAlign: col.align || 'right' }}>Total:</td>;
                                                }

                                                return <td key={j} className="p-2"></td>;
                                            })}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Note Area */}
                    {showNoteArea && (
                        <div className="px-8 pb-4">
                            <textarea
                                value={reportNote}
                                onChange={(e) => setReportNote(e.target.value)}
                                placeholder="Enter your note here..."
                                className="w-full h-[80px] p-3 border border-gray-300 rounded-[3px] text-[13px] text-gray-800 outline-none focus:border-[#0077c5] resize-none"
                            />
                        </div>
                    )}

                    {/* Footer */}
                    {/* Footer */}
                    <div className={`px-8 py-6 flex flex-col text-[12px] text-gray-500 border-t border-gray-100 mt-auto ${customizations.footerAlignment === 'Left' ? 'items-start text-left' :
                            customizations.footerAlignment === 'Right' ? 'items-end text-right' : 'items-center text-center'
                        }`}>
                        <div className="w-full flex items-center justify-between mb-4">
                            <button onClick={() => setShowNoteArea(!showNoteArea)} className="flex items-center gap-1.5 text-[#0077c5] font-bold hover:underline">
                                <FileText size={14} /> {showNoteArea ? 'Hide note' : 'Add note'}
                            </button>
                        </div>

                        <div className="flex gap-2 font-medium">
                            {customizations.showDatePrepared && <span>{new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                            {customizations.showDatePrepared && customizations.showTimePrepared && <span>at</span>}
                            {customizations.showTimePrepared && <span>{new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        {customizations.showReportBasis && (
                            <div className="mt-1 opacity-75">
                                Accrual Basis
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <ReportEmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                title={title}
                companyName={displayCompanyName}
                userName="nawoda lakshika"
            />

            <ReportPrintModal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                companyName={displayCompanyName}
                title={title}
                subtitle={subtitle}
                data={displayData}
                columns={displayColumns}
            />
            <ReportCustomizeModal
                isOpen={showCustomizeModal}
                onClose={() => setShowCustomizeModal(false)}
                customizations={customizations}
                onApply={setCustomizations}
            />

        </div>
    );
};

export default ReportTemplate;








