import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Share, Camera, AlertTriangle,
    Sparkles, X, Search, Calendar, Check, Receipt
} from 'lucide-react';
import ReportPrintModal from './modals/AdminReports/ReportPrintModal';
import ReportEmailModal from './modals/AdminReports/ReportEmailModal';
import CalendarModal from './CalendarModal';
import CalendarPopover from './CalendarPopover';
import ReportCustomizeModal from './modals/AdminReports/ReportCustomizeModal';
import ReportLearnMoreModal from './modals/AdminReports/ReportLearnMoreModal';
import PaymentDetailModal from './PaymentDetailModal';
import QuotationDetailModal from './QuotationDetailModal';
import SalesOrderDetailModal from './SalesOrderDetailModal';
import api from '../services/api';

const compactTableStyles = `
.compact-table {
    border-collapse: collapse;
    width: 100%;
}
.compact-table thead tr {
    background: #f8fafc;
}
.compact-table tbody tr:nth-child(even) {
    background: #fafbfc;
}
.compact-table tbody tr:hover {
    background: #f1f5f9;
}
.compact-table td, .compact-table th {
    white-space: nowrap;
    line-height: 1.2;
}
`;

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
    "Profit and Loss by Month",
    "Chart of Accounts",
    "Fixed Assets Item List",
    "Long Term Liability",
    "Depreciation Procedure",
    "Fixed Income",
    "Fixed Expenses",
    "Sales Tax ID List",
    "Products Report",
    "Sales Order Summary"
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
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackImages, setFeedbackImages] = useState([]);
    const [selectedPayDoc, setSelectedPayDoc] = useState(null);
    const [selectedQuotationDoc, setSelectedQuotationDoc] = useState(null);
    const [selectedSalesOrderDoc, setSelectedSalesOrderDoc] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFeedbackImages(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            }
        });
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const removeFeedbackImage = (index) => {
        setFeedbackImages(prev => prev.filter((_, i) => i !== index));
    };
    const [reportPeriod, setReportPeriod] = useState('This year to date');
    const [asOfDate, setAsOfDate] = useState(() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    });
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return `01/01/${d.getFullYear()}`;
    });
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    });
    const [accountingMethod, setAccountingMethod] = useState('Accrual');
    const [displayColumnsBy, setDisplayColumnsBy] = useState('Select');
    const [compareTo, setCompareTo] = useState('Select Period');
    const [compareToState, setCompareToState] = useState({
        PY: false,
        PP: false,
        YTD: false,
        PYYTD: false,
        CP: false,
        PctRow: false,
        PctCol: false,
        PctExp: false,
        PctInc: false
    });

    const handlePeriodChange = (e) => {
        const period = e.target.value;
        setReportPeriod(period);
        const d = new Date();
        let fd, td;
        if (period === 'Today') {
            fd = td = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } else if (period === 'This year to date') {
            fd = `01/01/${d.getFullYear()}`;
            td = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } else if (period === 'This Month') {
            fd = `01/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            td = `${String(endD.getDate()).padStart(2, '0')}/${String(endD.getMonth() + 1).padStart(2, '0')}/${endD.getFullYear()}`;
        } else if (period === 'This Week') {
            const first = d.getDate() - d.getDay();
            const last = first + 6;
            const firstday = new Date(d.getFullYear(), d.getMonth(), first);
            const lastday = new Date(d.getFullYear(), d.getMonth(), last);
            fd = `${String(firstday.getDate()).padStart(2, '0')}/${String(firstday.getMonth() + 1).padStart(2, '0')}/${firstday.getFullYear()}`;
            td = `${String(lastday.getDate()).padStart(2, '0')}/${String(lastday.getMonth() + 1).padStart(2, '0')}/${lastday.getFullYear()}`;
        } else if (period === 'This Year') {
            fd = `01/01/${d.getFullYear()}`;
            td = `31/12/${d.getFullYear()}`;
        }
        if (fd && td) {
            setFromDate(fd);
            setToDate(td);
        }
    };

    const [showNoteArea, setShowNoteArea] = useState(false);
    const [reportNote, setReportNote] = useState('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showFromCalendarModal, setShowFromCalendarModal] = useState(false);
    const [showToCalendarModal, setShowToCalendarModal] = useState(false);
    const [showDisplayColumnsMenu, setShowDisplayColumnsMenu] = useState(false);
    const [showCompareToMenu, setShowCompareToMenu] = useState(false);
    const [dismissAlert, setDismissAlert] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [compactView, setCompactView] = useState(false);
    const [showCompactMenu, setShowCompactMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    useEffect(() => {
        if (!document.getElementById('compact-table-styles')) {
            const style = document.createElement('style');
            style.id = 'compact-table-styles';
            style.textContent = compactTableStyles;
            document.head.appendChild(style);
        }
        return () => {
            const el = document.getElementById('compact-table-styles');
            if (el) el.remove();
        };
    }, []);

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

                // Use fromDate and toDate from state
                if (fromDate && toDate) {
                    const fromParts = fromDate.split('/');
                    if (fromParts.length === 3) {
                        const dd = parseInt(fromParts[0], 10);
                        const mm = parseInt(fromParts[1], 10);
                        const yyyy = parseInt(fromParts[2], 10);
                        const startD = new Date(yyyy, mm - 1, dd);
                        const pad = (n) => n < 10 ? '0' + n : n;
                        startStr = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`;
                    }

                    const toParts = toDate.split('/');
                    if (toParts.length === 3) {
                        const dd = parseInt(toParts[0], 10);
                        const mm = parseInt(toParts[1], 10);
                        const yyyy = parseInt(toParts[2], 10);
                        const endD = new Date(yyyy, mm - 1, dd);
                        const pad = (n) => n < 10 ? '0' + n : n;
                        endStr = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}`;
                    }
                }

                let compareToStr = compareTo;
                if (compareTo === 'Custom' || compareTo === 'Select Period' || Object.values(compareToState).some(Boolean)) {
                    const activeCompares = Object.keys(compareToState).filter(k => compareToState[k]);
                    if (activeCompares.length > 0) {
                        compareToStr = activeCompares.join(',');
                    } else if (compareTo === 'Select Period') {
                        compareToStr = '';
                    }
                }

                const response = await api.get(`/report/${endpoint}?companyId=${companyId}&startDate=${startStr}&endDate=${endStr}&accountingMethod=${accountingMethod}&displayColumnsBy=${displayColumnsBy}&compareTo=${compareToStr}`);
                
                let processedData = response.data;
                if (processedData && processedData.length > 0 && processedData.some(r => 'PivotColumn' in r || 'pivotcolumn' in r)) {
                    const rowsMap = new Map();
                    const firstRow = processedData[0];
                    const standardKeys = Object.keys(firstRow).filter(k => !['Balance', 'PivotColumn', 'balance', 'pivotcolumn'].includes(k));
                    
                    processedData.forEach(row => {
                        const rowKey = standardKeys.map(k => row[k]).join('|');
                        const pivotVal = row['PivotColumn'] || row['pivotcolumn'] || 'Total';
                        const balance = parseFloat(row['Balance'] || row['balance'] || 0);
                        
                        if (!rowsMap.has(rowKey)) {
                            const newRow = {};
                            standardKeys.forEach(k => newRow[k] = row[k]);
                            newRow['Total'] = 0;
                            rowsMap.set(rowKey, newRow);
                        }
                        
                        const existingRow = rowsMap.get(rowKey);
                        existingRow[pivotVal] = (existingRow[pivotVal] || 0) + balance;
                        existingRow['Total'] += balance;
                    });
                    
                    processedData = Array.from(rowsMap.values());
                }
                
                setApiData(processedData);
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
    }, [title, reportPeriod, fromDate, toDate, accountingMethod, displayColumnsBy, compareTo]);

    const [searchQuery, setSearchQuery] = useState('');
    const [columnFilters, setColumnFilters] = useState({});
    const [activeFilterColumn, setActiveFilterColumn] = useState(null);

    const defaultCustomizations = {
        filters: [],
        showRows: 'active',
        showCols: 'active',
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
    const [customizations, setCustomizations] = useState(defaultCustomizations);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, columnFilters, reportPeriod, fromDate, toDate, customizations, apiData]);

    // Use API data if available, otherwise fallback to props
    const baseData = apiData || data;

    // Filter data based on search query and column filters
    const displayData = useMemo(() => {
        let filtered = baseData;
        
        const checkMatch = (val, query) => {
            const rawStr = String(val || '').toLowerCase();
            if (rawStr.includes(query)) return true;
            
            if (val !== null && val !== undefined && val !== '') {
                const num = Number(val);
                if (!isNaN(num)) {
                    const formatted1 = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).toLowerCase();
                    const formatted2 = num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).toLowerCase();
                    if (formatted1.includes(query) || formatted2.includes(query)) return true;
                    
                    if (num < 0) {
                        const absFormatted1 = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).toLowerCase();
                        const absFormatted2 = Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).toLowerCase();
                        if (`(${absFormatted1})`.includes(query) || `(${absFormatted2})`.includes(query)) return true;
                    }
                }
            }
            
            const strippedQuery = query.replace(/,/g, '');
            if (strippedQuery !== query && strippedQuery.trim() !== '' && !isNaN(Number(strippedQuery))) {
                if (rawStr.includes(strippedQuery)) return true;
            }
            
            return false;
        };
        
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(row => {
                return Object.values(row).some(val => checkMatch(val, lowerQuery));
            });
        }

        Object.entries(columnFilters).forEach(([accessor, filterValue]) => {
            if (filterValue && filterValue.trim() !== '') {
                const lowerFilter = filterValue.toLowerCase();
                filtered = filtered.filter(row => checkMatch(row[accessor], lowerFilter));
            }
        });

        // Apply custom filters
        if (customizations.filters && customizations.filters.length > 0) {
            filtered = filtered.filter(row => {
                return customizations.filters.every(f => {
                    if (!f.column || !f.condition || !f.value) return true;
                    const cellValStr = String(row[f.column] || '').toLowerCase();
                    const filterValStr = f.value.toLowerCase();
                    const numCellVal = parseFloat(String(row[f.column] || '').replace(/,/g, ''));
                    const numFilterVal = parseFloat(f.value);

                    switch (f.condition) {
                        case 'Equals':
                            return cellValStr === filterValStr || numCellVal === numFilterVal;
                        case 'Not Equals':
                            return cellValStr !== filterValStr && numCellVal !== numFilterVal;
                        case 'Contains':
                            return cellValStr.includes(filterValStr);
                        case 'Greater Than':
                            return !isNaN(numCellVal) && !isNaN(numFilterVal) && numCellVal > numFilterVal;
                        case 'Less Than':
                            return !isNaN(numCellVal) && !isNaN(numFilterVal) && numCellVal < numFilterVal;
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply showRows: 'nonzero'
        if (customizations.showRows === 'nonzero') {
            filtered = filtered.filter(row => {
                let hasNonZero = false;
                Object.keys(row).forEach(key => {
                    const val = row[key];
                    if (val !== null && val !== undefined && val !== '') {
                        const num = parseFloat(String(val).replace(/,/g, ''));
                        if (!isNaN(num) && num !== 0) {
                            hasNonZero = true;
                        }
                    }
                });
                return hasNonZero;
            });
        }

        return filtered;
    }, [baseData, searchQuery, columnFilters, customizations.filters, customizations.showRows]);

    // Calculate totals for specific columns dynamically
    const columnsToTotal = ['amount', 'qty', 'quantity', 'credit', 'creadis', 'debit', 'total', 'balance', 'hours', 'price', 'discount', 'netincome', 'income'];
    
    // Automatically generate columns if apiData is present and columns prop is empty
    let displayColumns = (apiData && apiData.length > 0 && columns.length === 0)
        ? Object.keys(apiData[0]).filter(key => key !== 'DocNoHidden' && key !== 'docnohidden').map(key => {
            const headerLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isCurrencyCol = columnsToTotal.some(c => headerLower.includes(c)) && !['qty', 'quantity', 'hours', 'code', 'date', 'id', 'name', 'type', 'status', 'no'].some(exclude => headerLower.includes(exclude));
            
            // Format PascalCase/camelCase to Space Case
            const formattedHeader = key.replace(/([A-Z])/g, ' $1').trim();
            
            return {
                header: (isCurrencyCol && !customizations.hideCurrency) ? `${formattedHeader} (LKR)` : formattedHeader,
                accessor: key,
                align: (columnsToTotal.some(c => headerLower.includes(c)) && !['code', 'date', 'id', 'name', 'type', 'status', 'no'].some(exclude => headerLower.includes(exclude))) ? 'right' : 'left',
                format: isCurrencyCol ? (val) => {
                    if (val === null || val === undefined || val === '') return '';
                    if (typeof val === 'string' && isNaN(parseFloat(val))) return val;
                    const num = parseFloat(val);
                    if (isNaN(num)) return val;
                    const absNum = Math.abs(num);
                    let formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    if (num < 0) formatted = `-${formatted}`;
                    return formatted;
                } : undefined
            };
        })
        : columns.map(col => {
            if (col.format) return col;
            const headerLower = (col.header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const isCurrencyCol = columnsToTotal.some(c => headerLower.includes(c)) && !['qty', 'quantity', 'hours', 'code', 'date', 'id', 'name', 'type', 'status', 'no'].some(exclude => headerLower.includes(exclude));
            return {
                ...col,
                header: (isCurrencyCol && !customizations.hideCurrency) ? (!col.header.includes('(LKR)') ? `${col.header} (LKR)` : col.header) : col.header.replace(' (LKR)', ''),
                format: isCurrencyCol ? (val) => {
                    if (val === null || val === undefined || val === '') return '';
                    if (typeof val === 'string' && isNaN(parseFloat(val))) return val;
                    const num = parseFloat(val);
                    if (isNaN(num)) return val;
                    const absNum = Math.abs(num);
                    let formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    if (num < 0) formatted = `-${formatted}`;
                    return formatted;
                } : undefined
            };
        });

    const currencyCols = [];
    const regularCols = [];
    displayColumns.forEach(col => {
        const headerLower = (col.header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const isCurrency = columnsToTotal.some(c => headerLower.includes(c)) && !['qty', 'quantity', 'hours', 'code', 'date', 'id', 'name', 'type', 'status', 'no'].some(exclude => headerLower.includes(exclude));
        if (isCurrency) {
            currencyCols.push(col);
        } else {
            regularCols.push(col);
        }
    });
    displayColumns = [...regularCols, ...currencyCols];

    const nonTotalColumns = ['account_code', 'account_type', 'account_name', 'accountcode', 'accounttype', 'accountname', 'id', 'name', 'type', 'date', 'status', 'description', 'reference', 'memo'];
    const totals = {};
    let hasTotals = false;

    if (displayData && displayData.length > 0) {
        displayColumns.forEach(col => {
            const headerLower = (col.header || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
            // use original accessor to calculate totals since header might have (LKR)
            const accessor = col.accessor || col.key;
            const accessorLower = String(accessor).toLowerCase().replace(/[^a-z0-9_]/g, '');
            
            const isNonTotal = nonTotalColumns.some(c => headerLower === c || accessorLower === c || headerLower.includes('code') || headerLower.includes('name') || headerLower.includes('type') || headerLower.includes('date') || headerLower.includes('id') || headerLower.includes('status') || headerLower.includes('no'));
            const isExplicitTotal = columnsToTotal.some(c => headerLower.includes(c)) && !['code', 'date', 'id', 'name', 'type', 'status', 'no'].some(exclude => headerLower.includes(exclude));
            
            if (isExplicitTotal || !isNonTotal) {
                let sum = 0;
                let isValid = false;
                let isNumericColumn = true;
                
                displayData.forEach(row => {
                    const rawVal = row[accessor];
                    if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
                        const valStr = String(rawVal).trim().replace(/,/g, '');
                        const val = parseFloat(valStr);
                        if (!isNaN(val)) {
                            sum += val;
                            isValid = true;
                        } else {
                            isNumericColumn = false; // Has non-numeric data, do not total
                        }
                    }
                });
                
                if (isValid && isNumericColumn) {
                    totals[accessor] = sum;
                    hasTotals = true;
                }
            }
        });

        // Apply showCols: 'nonzero'
        if (customizations.showCols === 'nonzero') {
            displayColumns = displayColumns.filter(col => {
                const acc = col.accessor || col.key;
                if (totals[acc] !== undefined) {
                    return totals[acc] !== 0;
                }
                return true;
            });
        }
    }

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

    // Dynamic user name from local storage
    const displayUserName = (() => {
        try {
            const userRaw = localStorage.getItem('user');
            if (userRaw) {
                const parsed = JSON.parse(userRaw);
                const name = parsed?.Emp_Name || parsed?.empName || parsed?.EmpName || parsed?.userName || parsed?.name;
                if (name) return name;
            }
        } catch (e) {}
        return "User";
    })();

    const formatCellValue = (value, col) => {
        if (value === null || value === undefined || value === '') {
            return customizations.showEmptyAs === 'dash' ? '-' : '';
        }

        const colName = (col?.header || col?.accessor || '').toLowerCase();
        if (colName.includes('code') || colName.includes('id') || colName.includes('phone') || colName.includes('year') || colName.includes('date')) {
            if (typeof value === 'string' && value.includes('T') && colName.includes('date')) return value.split('T')[0];
            return value;
        }

        if (typeof value === 'string' && isNaN(parseFloat(value))) {
            return value;
        }

        let num = parseFloat(value);
        if (isNaN(num)) return value;

        if (customizations.divideBy1000) {
            num = num / 1000;
        }

        if (customizations.roundWholeNumber) {
            num = Math.round(num);
        }

        const isNegative = num < 0;
        const absNum = Math.abs(num);

        let formatted;
        if (customizations.roundWholeNumber) {
            formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        } else {
            formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        if (isNegative) {
            if (customizations.negativeNumbers === '(100)') {
                formatted = `(${formatted})`;
            } else {
                formatted = `-${formatted}`;
            }
        }

        if (isNegative && customizations.negativeRed) {
            return <span className="text-red-600">{formatted}</span>;
        }

        return formatted;
    };

    const formatTotalValue = (value) => {
        if (value === null || value === undefined) return '';

        let num = parseFloat(value);
        if (isNaN(num)) return value;

        if (customizations.divideBy1000) {
            num = num / 1000;
        }

        if (customizations.roundWholeNumber) {
            num = Math.round(num);
        }

        const isNegative = num < 0;
        const absNum = Math.abs(num);

        let formatted;
        if (customizations.roundWholeNumber) {
            formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        } else {
            formatted = absNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        if (isNegative) {
            if (customizations.negativeNumbers === '(100)') {
                formatted = `(${formatted})`;
            } else {
                formatted = `-${formatted}`;
            }
        }

        if (isNegative && customizations.negativeRed) {
            return <span className="text-red-600">{formatted}</span>;
        }

        return formatted;
    };

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

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) return;
        setIsSubmittingFeedback(true);
        try {
            let activeCompanyCode = companyCode;
            if (!activeCompanyCode) {
                try {
                    const companyStr = localStorage.getItem('selectedCompany');
                    if (companyStr) {
                        const company = JSON.parse(companyStr);
                        activeCompanyCode = company.Company_Code || company.CompanyCode || company.companyCode || company.Company_Id || 'UNKNOWN';
                    }
                } catch (e) {
                    activeCompanyCode = 'UNKNOWN';
                }
            }

            const userStr = localStorage.getItem('user');
            let employeeName = '';
            try {
                if (userStr) {
                    const user = JSON.parse(userStr);
                    employeeName = user.Emp_Name || user.empName || user.EmpName || '';
                }
            } catch (e) {}

            await api.post('/reportfeedback', {
                companyId: activeCompanyCode || 'UNKNOWN',
                reportName: title,
                feedbackText: feedbackText,
                employeeName: employeeName,
                images: feedbackImages
            });
            setShowFeedbackModal(false);
            setFeedbackText('');
            setFeedbackImages([]);
            setShowThankYouModal(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-[#f4f5f8] overflow-y-auto font-sans flex flex-col">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-blue-700 font-bold text-[13px] hover:underline"
                >
                    <ChevronLeft size={16} />
                    Back to dashboard
                </button>

                {onSwitchReport && <OtherReportsDropdown onSelect={onSwitchReport} />}

                <div className="flex items-center gap-6">
                    <button onClick={() => setShowLearnMoreModal(true)} className="flex items-center gap-1.5 text-red-600 font-bold text-[13px] hover:underline">
                        <BookOpen size={14} />
                        Learn more
                    </button>
                    <button 
                        onClick={() => setShowFeedbackModal(true)}
                        className="flex items-center gap-1.5 text-[#0077c5] font-bold text-[13px] hover:underline"
                    >
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
                                onChange={handlePeriodChange}
                                className="appearance-none w-[150px] h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer"
                            >
                                <option>This year to date</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Year</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-[130px] relative">
                        <label className="text-[12px] text-gray-600 font-medium">From</label>
                        <button
                            onClick={() => setShowFromCalendarModal(!showFromCalendarModal)}
                            className="calendar-toggle-btn w-full h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer flex items-center justify-between text-left"
                        >
                            <span>{fromDate}</span>
                            <Calendar size={14} className="text-gray-500" />
                        </button>
                        <CalendarPopover
                            isOpen={showFromCalendarModal}
                            onClose={() => setShowFromCalendarModal(false)}
                            onDateSelect={(dateStr) => {
                                const [yyyy, mm, dd] = dateStr.split('-');
                                setFromDate(`${dd}/${mm}/${yyyy}`);
                            }}
                            initialDate={fromDate.split('/').reverse().join('-')}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 w-[130px] relative">
                        <label className="text-[12px] text-gray-600 font-medium">To</label>
                        <button
                            onClick={() => setShowToCalendarModal(!showToCalendarModal)}
                            className="calendar-toggle-btn w-full h-9 px-3 border border-gray-300 rounded-[3px] text-[13px] font-medium text-gray-800 outline-none focus:border-[#0077c5] bg-white cursor-pointer flex items-center justify-between text-left"
                        >
                            <span>{toDate}</span>
                            <Calendar size={14} className="text-gray-500" />
                        </button>
                        <CalendarPopover
                            isOpen={showToCalendarModal}
                            onClose={() => setShowToCalendarModal(false)}
                            onDateSelect={(dateStr) => {
                                const [yyyy, mm, dd] = dateStr.split('-');
                                setToDate(`${dd}/${mm}/${yyyy}`);
                            }}
                            initialDate={toDate.split('/').reverse().join('-')}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 ml-4">
                        <label className="text-[12px] text-gray-600 font-medium">Accounting method</label>
                        <div className="flex items-center bg-gray-100 p-[3px] rounded h-9">
                            <button 
                                onClick={() => setAccountingMethod('Cash')}
                                className={`px-4 py-1 text-[13px] rounded-[3px] transition-colors ${accountingMethod === 'Cash' ? 'bg-white shadow-sm font-medium text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Cash
                            </button>
                            <button 
                                onClick={() => setAccountingMethod('Accrual')}
                                className={`px-4 py-1 text-[13px] rounded-[3px] transition-colors ${accountingMethod === 'Accrual' ? 'bg-white shadow-sm font-medium text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Accrual
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 ml-4">
                        <label className="text-[12px] text-gray-600 font-medium">Display columns by</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowDisplayColumnsMenu(!showDisplayColumnsMenu)}
                                className={`w-[150px] h-9 px-3 border rounded-[3px] text-[13px] font-medium text-gray-800 outline-none bg-white flex items-center justify-between ${showDisplayColumnsMenu ? 'border-[#0077c5] shadow-[0_0_0_1px_rgba(0,119,197,0.5)]' : 'border-gray-300 hover:border-gray-400'}`}
                            >
                                <span>{displayColumnsBy}</span>
                                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showDisplayColumnsMenu ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showDisplayColumnsMenu && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setShowDisplayColumnsMenu(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-gray-200 shadow-lg rounded-[3px] py-2 z-[101]">
                                        {['Select', 'Customer', 'Employee', 'Product/Service', 'Supplier', 'Days', 'Weeks', 'Months', 'Quarters', 'Years'].map(option => (
                                            <button
                                                key={option}
                                                onClick={() => { setDisplayColumnsBy(option); setShowDisplayColumnsMenu(false); }}
                                                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <div className="w-4 flex justify-center">
                                                    {displayColumnsBy === option && <Check size={14} className="text-blue-600 font-bold" />}
                                                </div>
                                                <span>{option}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 ml-2">
                        <label className="text-[12px] text-gray-600 font-medium">Compare to</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowCompareToMenu(!showCompareToMenu)}
                                className={`w-[140px] h-9 px-3 border rounded-[3px] text-[13px] font-medium text-gray-800 outline-none bg-white flex items-center justify-between ${showCompareToMenu ? 'border-[#0077c5] shadow-[0_0_0_1px_rgba(0,119,197,0.5)]' : 'border-gray-300 hover:border-gray-400'}`}
                            >
                                <span>{compareTo}</span>
                                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showCompareToMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showCompareToMenu && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setShowCompareToMenu(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-gray-200 shadow-lg rounded-[3px] py-3 z-[101]">
                                        <div className="px-4 pb-2 text-[12px] text-gray-500 font-medium">Time Periods</div>
                                        {[
                                            { key: 'PY', label: 'Previous year (PY)' },
                                            { key: 'PP', label: 'Previous Period (PP)' },
                                            { key: 'YTD', label: 'Year-to-date (YTD)' },
                                            { key: 'PYYTD', label: 'Previous year-to-date (PY YTD)' },
                                            { key: 'CP', label: 'Custom period (CP)' }
                                        ].map(option => (
                                            <label key={option.key} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={compareToState[option.key]}
                                                    onChange={(e) => {
                                                        const newVal = e.target.checked;
                                                        setCompareToState(prev => ({ ...prev, [option.key]: newVal }));
                                                        if (newVal) setCompareTo('Custom');
                                                    }}
                                                    className="w-[14px] h-[14px] rounded border-gray-300 text-[#0077c5] focus:ring-[#0077c5] cursor-pointer"
                                                />
                                                <span className="text-[13px] text-gray-700">{option.label}</span>
                                            </label>
                                        ))}

                                        <div className="px-4 py-2 mt-1 border-t border-gray-200 text-[12px] text-gray-500 font-medium">Calculations</div>
                                        {[
                                            { key: 'PctRow', label: '% of Row' },
                                            { key: 'PctCol', label: '% of Column' },
                                            { key: 'PctExp', label: '% of Expense' },
                                            { key: 'PctInc', label: '% of Income' }
                                        ].map(option => (
                                            <label key={option.key} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={compareToState[option.key]}
                                                    onChange={(e) => {
                                                        const newVal = e.target.checked;
                                                        setCompareToState(prev => ({ ...prev, [option.key]: newVal }));
                                                        if (newVal) setCompareTo('Custom');
                                                    }}
                                                    className="w-[14px] h-[14px] rounded border-gray-300 text-[#0077c5] focus:ring-[#0077c5] cursor-pointer"
                                                />
                                                <span className="text-[13px] text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowCustomizeModal(true)} className="h-9 px-4 border border-gray-300 rounded-[3px] bg-white hover:bg-gray-50 flex items-center gap-1.5 text-[13px] font-bold text-[#393a3d] transition-colors">
                        <Settings2 size={14} />
                        Customise Report
                    </button>
                    {/* <button className="h-9 px-4 rounded-[3px] bg-[#0077c5] hover:bg-[#005ca6] text-white text-[13px] font-bold transition-colors">
                        Save As
                    </button> */}
                </div>
            </div>

            {/* Main Report Container */}
            <div className="flex-1 p-6 md:p-10 flex justify-center items-stretch">
                <div className="w-full max-w-[1000px] bg-white border border-gray-200 shadow-sm flex flex-col min-h-[500px]">

                    {/* Inner Toolbar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowCompactMenu(!showCompactMenu)}
                                    className="flex items-center gap-1 text-[13px] text-gray-600 font-medium hover:text-gray-900"
                                >
                                    {compactView ? 'Compact' : 'Detailed'} <ChevronDown size={14} />
                                </button>
                                {showCompactMenu && (
                                    <div
                                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded w-[140px] z-[1000] py-1"
                                        onMouseLeave={() => setShowCompactMenu(false)}
                                        onClick={() => setShowCompactMenu(false)}
                                    >
                                        <button
                                            onClick={() => { setCompactView(false); setShowCompactMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between ${!compactView ? 'text-[#0077c5] font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            Detailed
                                            {!compactView && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </button>
                                        <button
                                            onClick={() => { setCompactView(true); setShowCompactMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between ${compactView ? 'text-[#0077c5] font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            Compact
                                            {compactView && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search in report..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 pr-3 text-[12px] border border-gray-300 rounded-[3px] focus:outline-none focus:border-[#0077c5] w-[200px]"
                                />
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

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
                            <div className="relative">
                                <button
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                                    title="More"
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                {showMoreMenu && (
                                    <div
                                        className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded w-[180px] z-[1000] py-1"
                                        onMouseLeave={() => setShowMoreMenu(false)}
                                        onClick={() => setShowMoreMenu(false)}
                                    >
                                        <button
                                            onClick={() => { setShowCustomizeModal(true); setShowMoreMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <Settings2 size={14} />
                                            Customise Report
                                        </button>
                                        <button
                                            onClick={() => { setShowNoteArea(!showNoteArea); setShowMoreMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <FileText size={14} />
                                            {showNoteArea ? 'Hide Note' : 'Add Note'}
                                        </button>
                                        <div className="border-t border-gray-200 my-1" />
                                        <button
                                            onClick={() => { fetchReportData(); setShowMoreMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <RefreshCw size={14} />
                                            Refresh Data
                                        </button>
                                        <button
                                            onClick={() => { setShowPrintModal(true); setShowMoreMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <Printer size={14} />
                                            Print
                                        </button>
                                        <button
                                            onClick={() => { setShowEmailModal(true); setShowMoreMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <Mail size={14} />
                                            Email
                                        </button>
                                        <div className="border-t border-gray-200 my-1" />
                                        <button
                                            onClick={handleExportExcel}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <Share size={14} />
                                            Export to Excel
                                        </button>
                                        <button
                                            onClick={handleExportCSV}
                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-[#0077c5] flex items-center gap-2"
                                        >
                                            <Share size={14} />
                                            Export as CSV
                                        </button>
                                    </div>
                                )}
                            </div>
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
                            <div className="border border-red-300 bg-red-50 p-4 rounded-[3px] text-red-800 text-[13px] flex items-start gap-3 shadow-sm">
                                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold block mb-1">Unable to generate report</strong>
                                    <p>We encountered an unexpected issue while retrieving the data for this report. Please verify your selected dates and filters, or try again later.</p>
                                </div>
                            </div>
                        )}
                        {displayData.length === 0 && !apiError && !apiLoading && (
                            <div className="border border-[#b3d4f5] bg-[#eef6fc] p-4 rounded-[3px] flex items-start gap-3 shadow-sm transition-all">
                                <Info size={18} className="text-[#0077c5] shrink-0 mt-0.5 fill-blue-100" />
                                <p className="text-[13px] text-gray-800">
                                    <strong className="font-bold">Your selection doesn't have any info.</strong> Change your selection or start a new search.
                                </p>
                            </div>
                        )}

                        {displayData.length > 0 && (
                        <div className="w-full overflow-x-auto border border-gray-200 bg-white">
                            <table className={`w-full text-left border-collapse ${compactView ? 'compact-table' : ''}`}>
                                <thead>
                                    <tr className={`${compactView ? 'border-b border-gray-300' : 'border-b-2 border-gray-300'}`}>
                                        {displayColumns.map((col, i) => {
                                            const acc = col.accessor || col.key || col.header;
                                            const isFilterActive = activeFilterColumn === acc || (columnFilters[acc] && columnFilters[acc] !== '');
                                            return (
                                            <th key={i} className={`font-bold text-gray-800 group relative ${compactView ? 'p-1.5 text-[10.5px]' : 'p-2 text-[12px]'}`} style={{ textAlign: col.align || 'left', whiteSpace: 'nowrap' }}>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`flex items-center gap-2 w-full ${col.align === 'right' ? 'justify-end text-right' : 'justify-between text-left'}`}>
                                                        <span className="flex-1">
                                                            {col.header}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (activeFilterColumn === acc) {
                                                                    setActiveFilterColumn(null);
                                                                    setColumnFilters(prev => ({ ...prev, [acc]: '' }));
                                                                } else {
                                                                    setActiveFilterColumn(acc);
                                                                }
                                                            }}
                                                            className={`text-gray-400 hover:text-[#0077c5] transition-opacity ${isFilterActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                        >
                                                            <Search size={12} />
                                                        </button>
                                                    </div>
                                                    {isFilterActive && (
                                                        <input
                                                            type="text"
                                                            placeholder={`Filter...`}
                                                            value={columnFilters[acc] || ''}
                                                            onChange={(e) => setColumnFilters(prev => ({ ...prev, [acc]: e.target.value }))}
                                                            className="h-6 px-2 text-[10px] font-normal border border-gray-200 rounded-[2px] focus:outline-none focus:border-[#0077c5] bg-white text-gray-700 w-full min-w-[60px]"
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus={activeFilterColumn === acc}
                                                        />
                                                    )}
                                                </div>
                                            </th>
                                        )})}
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiLoading ? <tr><td colSpan="100%" className="text-center py-4">Loading data from database...</td><th className="text-right px-5 py-3">Action</th></tr> : displayData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, i) => {
                                        const isBillPaymentList = title === "Bill Payment List";
                                        const isQuotationSummary = title === "Quotation Summary";
                                        const isSalesOrderSummary = title === "Sales Order Summary";
                                        const isClickableRow = isBillPaymentList || isQuotationSummary || isSalesOrderSummary;
                                        const payDocAcc = displayColumns.find(c => c.header === 'No.' || c.accessor === 'No.' || c.header === 'No' || c.accessor === 'No' || c.header === 'Document ID')?.accessor;
                                        const payDocVal = isClickableRow && payDocAcc ? row[payDocAcc] : null;

                                        return (
                                        <tr 
                                            key={i} 
                                            className={`${compactView ? 'border-b border-gray-200' : 'border-b border-gray-200 hover:bg-gray-50'} ${isClickableRow && payDocVal ? 'cursor-pointer group relative' : ''}`}
                                            onClick={() => {
                                                if (isBillPaymentList && payDocVal) {
                                                    setSelectedPayDoc(payDocVal);
                                                } else if (isQuotationSummary && payDocVal) {
                                                    setSelectedQuotationDoc(payDocVal);
                                                } else if (isSalesOrderSummary && payDocVal) {
                                                    setSelectedSalesOrderDoc(payDocVal);
                                                }
                                            }}
                                        >
                                            {displayColumns.map((col, j) => {
                                                const acc = col.accessor || col.key || col.header;
                                                return (
                                                <td key={j} className={`text-gray-700 ${compactView ? 'p-1 text-[11px]' : 'p-2 text-[12px]'} relative`} style={{ textAlign: col.align || 'left', whiteSpace: 'nowrap' }}>
                                                    {formatCellValue(row[acc], col)}
                                                    {isClickableRow && payDocVal && j === 0 && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#0077c5] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap transition-opacity pointer-events-none">
                                                            <Receipt size={10} className="text-white" />
                                                            View
                                                        </div>
                                                    )}
                                                </td>
                                            )})}
                                        </tr>
                                    )})}

                                    {hasTotals && displayData.length > 0 && !apiLoading && (
                                        <tr className={`${compactView ? 'border-t-2 border-double border-gray-400' : 'border-t-[3px] border-double border-gray-400'} bg-slate-50 font-bold`}>
                                            {displayColumns.map((col, j) => {
                                                const accessor = col.accessor || col.key || col.header;
                                                const isFirstCol = j === 0;
                                                const hasTotalVal = totals[accessor] !== undefined;

                                                if (hasTotalVal) {
                                                    return (
                                                        <td key={j} className={`text-gray-900 ${compactView ? 'p-1 text-[11px]' : 'p-2 text-[12px]'}`} style={{ textAlign: col.align || 'left' }}>
                                                            {formatTotalValue(totals[accessor])}
                                                        </td>
                                                    );
                                                }

                                                if (isFirstCol) {
                                                    return <td key={j} className={`text-gray-900 uppercase tracking-widest text-right ${compactView ? 'p-1 text-[11px]' : 'p-2 text-[12px]'}`} style={{ textAlign: col.align || 'right' }}>Total:</td>;
                                                }

                                                return <td key={j} className={compactView ? 'p-1' : 'p-2'}></td>;
                                            })}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            
                            {displayData.length > 0 && !apiLoading && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6">
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-[12px] text-gray-700">
                                                Showing <span className="font-medium">{displayData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, displayData.length)}</span> of <span className="font-medium">{displayData.length}</span> results
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="border-gray-300 rounded-[3px] text-[12px] h-7 px-2 border focus:outline-none focus:border-[#0077c5]"
                                            >
                                                <option value={10}>10 per page</option>
                                                <option value={20}>20 per page</option>
                                                <option value={50}>50 per page</option>
                                                <option value={100}>100 per page</option>
                                                <option value={500}>500 per page</option>
                                            </select>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <span className="relative inline-flex items-center px-4 py-1.5 text-[12px] font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                                                    Page {currentPage} of {Math.max(1, Math.ceil(displayData.length / rowsPerPage))}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(displayData.length / rowsPerPage)))}
                                                    disabled={currentPage === Math.ceil(displayData.length / rowsPerPage) || displayData.length === 0}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <ChevronLeft size={16} className="rotate-180" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
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
                    <div className={`px-8 py-6 flex flex-col text-[12px] text-gray-500 border-t border-gray-200 mt-auto ${customizations.footerAlignment === 'Left' ? 'items-start text-left' :
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
                userName={displayUserName}
            />

            <ReportPrintModal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                companyName={displayCompanyName}
                title={title}
                subtitle={subtitle}
                data={displayData}
                columns={displayColumns}
                totals={hasTotals ? totals : null}
            />
            {selectedPayDoc && (
                <PaymentDetailModal
                    isOpen={!!selectedPayDoc}
                    onClose={() => setSelectedPayDoc(null)}
                    payDoc={selectedPayDoc}
                />
            )}
            {selectedQuotationDoc && (
                <QuotationDetailModal
                    docNo={selectedQuotationDoc}
                    onClose={() => setSelectedQuotationDoc(null)}
                />
            )}
            {selectedSalesOrderDoc && (
                <SalesOrderDetailModal
                    docNo={selectedSalesOrderDoc}
                    isOpen={!!selectedSalesOrderDoc}
                    onClose={() => setSelectedSalesOrderDoc(null)}
                />
            )}
            <ReportCustomizeModal
                isOpen={showCustomizeModal}
                onClose={() => setShowCustomizeModal(false)}
                customizations={customizations}
                onApply={setCustomizations}
                columns={displayColumns}
            />

            <ReportLearnMoreModal
                isOpen={showLearnMoreModal}
                onClose={() => setShowLearnMoreModal(false)}
            />


            {showFeedbackModal && (
                <div className="absolute right-6 top-[60px] z-[600]">
                    <div className="bg-white rounded-[4px] shadow-2xl w-[350px] flex flex-col font-sans relative border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-[14px] font-bold text-gray-800 text-center w-full">Tell us what you think of the<br/>Report Builder</h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="text-gray-500 hover:text-gray-800 absolute right-4 top-4">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="border border-gray-300 rounded-[2px] p-2 relative h-[180px] flex flex-col">
                                <textarea
                                    className="w-full flex-1 resize-none text-[13px] text-gray-800 outline-none bg-transparent"
                                    placeholder="Share your feedback"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                                {feedbackImages.length > 0 && (
                                    <div className="flex gap-2 mb-6 overflow-x-auto py-1">
                                        {feedbackImages.map((imgUrl, i) => (
                                            <div key={i} className="relative w-12 h-12 shrink-0 border border-gray-200 rounded">
                                                <img src={imgUrl} alt={`Feedback ${i}`} className="w-full h-full object-cover rounded" />
                                                <button 
                                                    onClick={() => removeFeedbackImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 bg-white rounded-full text-red-500 shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleImageUpload} 
                                        className="hidden" 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-gray-500 hover:text-[#0077c5] transition-colors"
                                        title="Add image or screenshot"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 pt-0 flex justify-end">
                            <button
                                onClick={handleSubmitFeedback}
                                disabled={isSubmittingFeedback || !feedbackText.trim()}
                                className="bg-[#0077c5] hover:bg-[#005ca6] text-white font-bold text-[13px] px-6 py-1.5 rounded-[2px]  transition-colors disabled:opacity-50"
                            >
                                {isSubmittingFeedback ? 'Submitting...' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showThankYouModal && (
                <div className="absolute right-6 top-[60px] z-[600]">
                    <div className="bg-white rounded-[4px] shadow-2xl w-[350px] flex flex-col font-sans relative p-6 text-center border border-gray-200">
                        <button onClick={() => setShowThankYouModal(false)} className="text-gray-500 hover:text-gray-800 absolute right-4 top-4">
                            <X size={18} />
                        </button>
                        <div className="w-14 h-14 bg-[#0077c5] text-white rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                            <Check size={28} strokeWidth={3} />
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-800 mb-2">Thank you!</h3>
                        <p className="text-[13px] text-gray-600 mb-6">
                            Your feedback helps us improve the Report Builder for everyone.
                        </p>
                        <button
                            onClick={() => setShowThankYouModal(false)}
                            className="bg-[#0077c5] hover:bg-[#005ca6] text-white font-bold text-[13px] px-6 py-2 rounded-[2px]  transition-colors w-full"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportTemplate;








