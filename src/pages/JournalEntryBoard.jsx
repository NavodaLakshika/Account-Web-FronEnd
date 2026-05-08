import React, { useState, useEffect, useRef, useCallback } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import CalendarModal from '../components/CalendarModal';
import {
    Search, X, RotateCcw, Loader2, Calendar, CheckCircle2,
    Plus, Trash2, FileText, Download, Upload, ArrowRight,
    Calculator, Info, History, Landmark, AlertCircle, RefreshCw, User,
    FileDown, FileUp
} from 'lucide-react';
import { journalService } from '../services/journal.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import * as XLSX from 'xlsx';


const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Find record by legal name or code..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item => 
        item.name?.toLowerCase().includes(query.toLowerCase()) || 
        item.code?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[600px]">
            <div className="space-y-4 font-['Tahoma']">
                {/* Search Facility Wrapper */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 w-32">Identifier</th>
                                    <th className="px-5 py-3">Credential / Name</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                                            No matching records discovered
                                        </td>
                                    </tr>
                                ) : filtered.map((item, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="group hover:bg-blue-50/50 cursor-pointer transition-all" 
                                        onClick={() => { onSelect(item); onClose(); }}
                                    >
                                        <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{item.code}</td>
                                        <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 border-none uppercase">
                                                SELECT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const JournalEntryBoard = ({ isOpen, onClose, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ costCenters: [], accounts: [], customers: [], suppliers: [], dateRanges: [] });
    const [tempEntries, setTempEntries] = useState([]);
    const [history, setHistory] = useState([]);
    const [accBalance, setAccBalance] = useState(0);
    const [companyCode] = useState(() => {
        const savedCompany = localStorage.getItem('selectedCompany');
        if (savedCompany) {
            try {
                const parsed = JSON.parse(savedCompany);
                return parsed.companyCode || parsed.CompanyCode || parsed.Company_Id || parsed.companyId || null;
            } catch (e) {
                console.error("Error parsing selectedCompany:", e);
                return null;
            }
        }
        return null;
    });

    const [currentUser] = useState(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                return parsed.emp_Name || parsed.Emp_Name || parsed.empName || parsed.EmpName || 'SYSTEM';
            } catch (e) {
                return 'SYSTEM';
            }
        }
        return 'SYSTEM';
    });

    const [header, setHeader] = useState({
        docNo: 'JNL-AUTO',
        entryNo: '',
        date: new Date().toLocaleDateString('en-GB'),
        lastEntryNo: '',
        editSaved: false,
        reconcileUpdate: false,
        debitNote: false,
        reconcileDate: '',
        reconcileDocNo: ''
    });

    const [currentLine, setCurrentLine] = useState({
        accId: '',
        accName: '',
        costCenter: '',
        costCenterName: '',
        debit: '0.00',
        credit: '0.00',
        memo: '',
        vendId: '',
        vendName: '',
        drMode: true    // true = Debit active, false = Credit active
    });

    const [selectedDateRange, setSelectedDateRange] = useState({ code: '11', name: 'Today' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [lineToDelete, setLineToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        if (!companyCode) {
            showErrorToast("Company session not found. Please select a company from the dashboard.");
            return;
        }
        try {
            setLoading(true);
            const lks = await journalService.getLookups(companyCode, currentUser);
            setLookups({
                costCenters: lks.costCenters || [],
                accounts: lks.accounts || [],
                customers: lks.customers || [],
                suppliers: lks.suppliers || [],
                dateRanges: lks.dateRanges || []
            });

            const docs = await journalService.generateDocNo(companyCode);
            console.log("Journal Docs Response:", docs);

            if (!docs.docNo) {
                showErrorToast("System failed to generate a Journal Number. Please check database registry.");
                return;
            }

            setHeader(prev => ({
                ...prev,
                docNo: docs.docNo,
                entryNo: docs.nextEntry || prev.entryNo,
                lastEntryNo: docs.nextEntry ? (parseInt(docs.nextEntry) - 1).toString() : prev.lastEntryNo
            }));

            // Default cost center if only one
            if (lks.costCenters.length === 1) {
                setCurrentLine(prev => ({
                    ...prev,
                    costCenter: lks.costCenters[0].code,
                    costCenterName: lks.costCenters[0].name
                }));
            }
        } catch (error) {
            showErrorToast("Failed to load metadata");
        } finally {
            setLoading(false);
        }
        loadHistory();
    };

    const loadHistory = async () => {
        const hist = await journalService.getHistory(companyCode, selectedDateRange.code);
        setHistory(hist);
    };

    const handleDateRangeSelect = (item) => {
        setSelectedDateRange(item);
        // In a real app, this would trigger a re-fetch with the date filter
        loadHistory();
    };

    const handleAccountSelect = async (item) => {
        setCurrentLine(prev => ({ ...prev, accId: item.code, accName: item.name }));
        const bal = await journalService.getBalance(item.code);
        setAccBalance(bal);
    };

    const handleAddLine = async () => {
        if (!currentLine.accId || (!currentLine.debit && !currentLine.credit)) {
            toast.error("Please select an account and enter an amount");
            return;
        }

        const data = {
            doc_No: header.docNo,
            acc_Id: currentLine.accId,
            acc_Name: currentLine.accName,
            memo: currentLine.memo,
            debit: parseFloat(currentLine.debit || 0),
            credit: parseFloat(currentLine.credit || 0),
            costCenter: currentLine.costCenter || '',
            vendId: currentLine.vendId || '',
            vendName: currentLine.vendName || '',
            companyCode: companyCode
        };

        try {
            await journalService.saveTempLine(data);
            fetchTempEntries();
            resetLine();
            toast.success("Line added successfully");
        } catch (error) {
            toast.error("Failed to add line");
        }
    };

    const handleDeleteClick = (entry) => {
        setLineToDelete(entry);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!lineToDelete) return;
        setIsDeleting(true);
        try {
            await journalService.deleteTempLine(lineToDelete.id_No, companyCode);
            setTempEntries(prev => prev.filter(e => e.id_No !== lineToDelete.id_No));
            toast.success("Line removed");
        } catch (error) {
            toast.error("Failed to delete line");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setLineToDelete(null);
        }
    };

    const resetLine = () => {
        setCurrentLine(prev => ({
            ...prev,
            accId: '', accName: '',
            debit: '0.00', credit: '0.00',
            memo: '', vendId: '', vendName: '',
            drMode: true
        }));
    };

    // ── Excel Template Download ──────────────────────────────────────
    const fileInputRef = useRef(null);

    const handleDownloadTemplate = useCallback(() => {
        const wb = XLSX.utils.book_new();

        // ── Sheet 1: Journal Entry Template (input sheet) ──────────────
        const entryHeaders = [['Account Code', 'Account Name', 'Cost Center', 'Debit', 'Credit', 'Memo']];
        const emptyRows = Array.from({ length: 20 }, () => ['', '', '', 0, 0, '']);
        const entryData = [...entryHeaders, ...emptyRows];
        const wsEntry = XLSX.utils.aoa_to_sheet(entryData);

        // Column widths
        wsEntry['!cols'] = [
            { wch: 16 }, // Account Code
            { wch: 35 }, // Account Name
            { wch: 22 }, // Cost Center
            { wch: 14 }, // Debit
            { wch: 14 }, // Credit
            { wch: 35 }, // Memo
        ];
        XLSX.utils.book_append_sheet(wb, wsEntry, 'Journal_Entries');

        // ── Sheet 2: Account Directory (reference) ──────────────────────
        const accHeaders = [['Account Code', 'Account Name']];
        const accRows = (lookups.accounts || []).map(a => [a.code, a.name]);
        const wsAcc = XLSX.utils.aoa_to_sheet([...accHeaders, ...accRows]);
        wsAcc['!cols'] = [{ wch: 18 }, { wch: 45 }];
        XLSX.utils.book_append_sheet(wb, wsAcc, 'Account_Directory');

        // ── Sheet 3: Cost Centers (reference) ───────────────────────────
        const ccHeaders = [['Cost Center Code', 'Cost Center Name']];
        const ccRows = (lookups.costCenters || []).map(c => [c.code, c.name]);
        const wsCC = XLSX.utils.aoa_to_sheet([...ccHeaders, ...ccRows]);
        wsCC['!cols'] = [{ wch: 18 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, wsCC, 'Cost_Centers');

        // Save and download
        XLSX.writeFile(wb, `JNL_Template_${header.docNo}.xlsx`);
        showSuccessToast(`Template downloaded with ${lookups.accounts.length} accounts & ${lookups.costCenters.length} cost centers. See reference sheets inside.`);
    }, [lookups.accounts, lookups.costCenters, header.docNo]);


    // ── Load Excel / CSV ─────────────────────────────────────────────
    const [isLoadingExcel, setIsLoadingExcel] = useState(false);

    const handleLoadExcel = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        if (!header.docNo || header.docNo === 'JNL-AUTO') {
            return showErrorToast('Document not initialized. Please wait for doc number.');
        }

        setIsLoadingExcel(true);
        try {
            // ── Parse the file ──────────────────────────────────────────
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });

            // Always use the FIRST sheet (Journal_Entries in our template)
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (rows.length < 2) {
                return showErrorToast('File has no data rows. Fill in the Journal_Entries sheet and try again.');
            }

            // ── Parse rows with carry-forward account logic ───────────────
            // If a row has debit/credit/memo but no account, it inherits
            // the account from the last row that had one (like Excel fill-down).
            const dataRows = [];
            let lastAccId = '';
            let lastAccName = '';
            let lastCostCenterInput = '';

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                const rawAccId   = String(cols[0] || '').trim();
                const rawAccName = String(cols[1] || '').trim();
                const rawCC      = String(cols[2] || '').trim();
                const debit      = parseFloat(cols[3]) || 0;
                const credit     = parseFloat(cols[4]) || 0;
                const memo       = String(cols[5] || '').trim();

                // Completely blank row — stop processing (end of data)
                if (!rawAccId && !rawAccName && debit === 0 && credit === 0 && !memo) continue;

                // Update carry-forward values when a new account is provided
                if (rawAccId)   lastAccId = rawAccId;
                if (rawAccName) lastAccName = rawAccName;
                if (rawCC)      lastCostCenterInput = rawCC;

                // Use carried-forward account if current row has none
                const accId   = lastAccId;
                const accName = lastAccName;
                const costCenterInput = lastCostCenterInput;

                // Skip if still no account available (nothing to carry forward yet)
                if (!accId || !accName) continue;

                dataRows.push({ accId, accName, costCenterInput, debit, credit, memo });
            }

            if (dataRows.length === 0) {
                return showErrorToast('No valid rows found. Ensure at least the first data row has Account Code and Account Name.');
            }


            // ── Clear existing temp entries FIRST (C# DELETE equivalent) ──
            await journalService.clearTemp(header.docNo, companyCode);
            setTempEntries([]);

            // ── Load each validated row ─────────────────────────────────
            let lastEntries = [];
            for (const row of dataRows) {
                const { accId, accName: excelAccName, costCenterInput, debit, credit, memo } = row;

                // Look up the real account name from the DB lookup by account code
                const accMatch = lookups.accounts.find(
                    a => a.code?.toString().trim().toLowerCase() === accId.toLowerCase()
                );
                const accName = accMatch?.name || excelAccName;

                // Resolve cost center: exact code → exact name → numeric-padded match → first
                const ccMatch = lookups.costCenters.find(
                    c => c.code?.toLowerCase() === costCenterInput.toLowerCase() ||
                         c.name?.toLowerCase() === costCenterInput.toLowerCase() ||
                         // Handle "2" matching "002" — strip leading zeros for comparison
                         c.code?.replace(/^0+/, '') === costCenterInput.replace(/^0+/, '')
                );
                const costCenter = ccMatch?.code || (lookups.costCenters[0]?.code || '');
                const costCenterName = ccMatch?.name || (lookups.costCenters[0]?.name || costCenterInput);

                const res = await journalService.addTempEntry({
                    accId, accName, costCenter, costCenterName,
                    debit, credit, memo,
                    vendId: '', vendName: '',
                    docNo: header.docNo,
                    entryNo: header.entryNo,
                    date: header.date,
                    company: companyCode,
                    createUser: currentUser,
                    type: '',
                    drNote: header.debitNote,
                    idNo: 0, reconcileDate: '', reconcileDocNo: '', tempIdNo: 0, balance: 0
                });
                lastEntries = res;
            }


            setTempEntries(lastEntries);
            showSuccessToast(`${dataRows.length} row(s) loaded from Excel successfully.`);

        } catch (err) {
            showErrorToast(`Failed to load file: ${err.message}`);
        } finally {
            setIsLoadingExcel(false);
        }
    }, [header, companyCode, currentUser, lookups.costCenters]);


    const handleSave = async () => {
        if (tempEntries.length === 0) return showErrorToast("No entries to save.");
        if (totalDebit !== totalCredit) return showErrorToast("Journal is not balanced!");

        try {
            setLoading(true);
            const res = await journalService.applyJournal({
                docNo: header.docNo,
                date: header.date,
                entryNo: header.entryNo,
                company: companyCode,
                createUser: currentUser,
                reclUpdate: header.reconcileUpdate
            });
            showSuccessToast(`Successfully Saved as ${res.orgDocNo}`);
            if (onComplete) onComplete(res);
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = tempEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = tempEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="General Journal Entries"
                maxWidth="max-w-[1100px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setTempEntries([]); resetLine(); }}
                                className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] shadow-md shadow-blue-50 hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none uppercase"
                            >
                                <RotateCcw size={14} /> CLEAR
                            </button>
                            <button
                                onClick={() => setActiveModal('history')}
                                className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 uppercase"
                            >
                                <History size={14} /> JOURNAL
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading || tempEntries.length === 0 || totalDebit !== totalCredit}
                                className={`px-10 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all flex items-center gap-2 active:scale-95 uppercase border-none ${loading || tempEntries.length === 0 || totalDebit !== totalCredit ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Apply
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma'] p-0.5 overflow-y-auto no-scrollbar">

                    {/* Excel Utilities & Mode Selection - Unified Top Bar */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={header.editSaved}
                                    onChange={e => setHeader(prev => ({ ...prev, editSaved: e.target.checked }))}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors">Edit Mode</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                className="hidden"
                                onChange={handleLoadExcel}
                            />
                            <button
                                onClick={handleDownloadTemplate}
                                className="h-8 px-4 bg-white text-emerald-600 border-2 border-emerald-500 text-[10px] font-black rounded-[5px] hover:bg-emerald-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm"
                            >
                                <FileDown size={14} /> TEMPLATE
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoadingExcel}
                                className="h-8 px-4 bg-white text-blue-600 border-2 border-blue-500 text-[10px] font-black rounded-[5px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                                {isLoadingExcel ? 'LOADING...' : 'LOAD EXCEL'}
                            </button>
                        </div>
                    </div>

                    {/* Document Header - PO Board Style */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            {/* Entry No */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Entry No</label>
                                <input
                                    type="text"
                                    value={header.entryNo}
                                    onChange={e => setHeader({ ...header, entryNo: e.target.value })}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-gray-50 rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm"
                                />
                            </div>

                            {/* Post Date */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 shrink-0">Post Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={header.date}
                                        onClick={() => setShowDatePicker(true)}
                                        className="flex-1 min-w-28 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                    />
                                    <button onClick={() => setShowDatePicker(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Last Entry */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Last Entry</label>
                                <div className="flex-1 h-8 bg-red-50/50 border border-red-100 rounded-[5px] flex items-center justify-center font-mono text-[13px] font-black text-red-500 shadow-inner">
                                    {String(header.lastEntryNo || '0').padStart(5, '0')}
                                </div>
                            </div>

                            {/* System Doc */}
                            <div className="col-span-3 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">System Doc</label>
                                <div className="flex-1 h-8 border border-gray-300 px-3 text-[11px] font-mono font-bold text-blue-500 bg-gray-50 rounded-[5px] flex items-center overflow-hidden shadow-sm">
                                    <span className="truncate">{header.docNo}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Entry Section - PO Board Style */}
                    <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            {/* Ledger Account */}
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Ledger Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={currentLine.accName}
                                        placeholder=""
                                        onClick={() => setActiveModal('account')}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-red-600 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-pointer"
                                    />
                                    <button onClick={() => setActiveModal('account')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Strategic Unit */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Strategic Unit</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={currentLine.costCenterName}
                                        placeholder=""
                                        onClick={() => setActiveModal('costCenter')}
                                        className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none shadow-sm cursor-pointer"
                                    />
                                    <button onClick={() => setActiveModal('costCenter')} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Brief Memo - full width */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Brief Memo</label>
                                <input
                                    type="text"
                                    value={currentLine.memo}
                                    onChange={e => setCurrentLine({ ...currentLine, memo: e.target.value })}
                                    placeholder=""
                                    className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 font-mono text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]"
                                />
                            </div>

                            {/* Financials & Action */}
                            <div className="col-span-12 flex items-center justify-between border-t border-gray-50 pt-3">
                                <div className="flex gap-5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Debit (DR)</label>
                                        <div className="relative w-36">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input
                                                type="number" step="0.01"
                                                value={currentLine.debit}
                                                disabled={!currentLine.drMode}
                                                onChange={e => setCurrentLine({ ...currentLine, debit: e.target.value })}
                                                className={`w-full h-8 border rounded-[5px] pl-9 pr-3 text-[13px] font-black outline-none text-right shadow-sm transition-colors
                                                    ${currentLine.drMode
                                                        ? 'border-blue-400 bg-white text-blue-700 focus:border-[#0285fd]'
                                                        : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Credit (CR)</label>
                                        <div className="relative w-36">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input
                                                type="number" step="0.01"
                                                value={currentLine.credit}
                                                disabled={currentLine.drMode}
                                                onChange={e => setCurrentLine({ ...currentLine, credit: e.target.value })}
                                                className={`w-full h-8 border rounded-[5px] pl-9 pr-3 text-[13px] font-black outline-none text-right shadow-sm transition-colors
                                                    ${!currentLine.drMode
                                                        ? 'border-red-300 bg-white text-red-600 focus:border-red-400'
                                                        : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-slate-50 border border-gray-200 rounded-[5px] h-8 items-center px-3 gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio" name="drCrToggle"
                                                checked={currentLine.drMode}
                                                onChange={() => setCurrentLine({ ...currentLine, drMode: true, credit: '0.00' })}
                                                className="w-3.5 h-3.5 text-blue-600"
                                            />
                                            <span className={`text-[10px] font-black uppercase ${currentLine.drMode ? 'text-blue-600' : 'text-gray-400'}`}>DR</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio" name="drCrToggle"
                                                checked={!currentLine.drMode}
                                                onChange={() => setCurrentLine({ ...currentLine, drMode: false, debit: '0.00' })}
                                                className="w-3.5 h-3.5 text-slate-600"
                                            />
                                            <span className={`text-[10px] font-black uppercase ${!currentLine.drMode ? 'text-red-500' : 'text-gray-400'}`}>CR</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleAddLine}
                                        className="px-8 h-8 bg-[#0285fd] text-white text-[11px] font-black rounded-[5px] shadow-md hover:bg-[#0073ff] flex items-center gap-2 uppercase transition-all active:scale-95 border-none"
                                    >
                                        <Plus size={16} strokeWidth={3} /> ADD RECORD
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journal Grid Table - Controlled Height */}
                    <div className="border border-gray-100 rounded-lg bg-white shadow-sm overflow-hidden">
                        <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center sticky top-0 z-10">
                            <div className="w-12 py-2 px-3 text-center border-r border-gray-100">No</div>
                            <div className="flex-1 py-2 px-4 border-r border-gray-100">Account Descriptor</div>
                            <div className="w-32 py-2 px-4 border-r border-gray-100">Cost Center</div>
                            <div className="w-36 py-2 px-4 border-r border-gray-100 text-right">Debit</div>
                            <div className="w-36 py-2 px-4 border-r border-gray-100 text-right">Credit</div>
                            <div className="flex-1 py-2 px-4">Narrative</div>
                            <div className="w-9"></div>
                        </div>
                        <div className="bg-white overflow-y-auto max-h-[160px] divide-y divide-gray-50 no-scrollbar">
                            {tempEntries.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-gray-300">
                                    <span className="text-[11px] font-bold uppercase tracking-widest ">Queue is Empty</span>
                                </div>
                            ) : tempEntries.map((entry, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="w-12 py-1.5 px-3 border-r border-gray-50 text-center font-mono text-gray-400">{idx + 1}</div>
                                    <div className="flex-1 py-1.5 px-4 border-r border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 font-mono text-[10px]">{entry.acc_Id}</span>
                                            <span className="truncate">{entry.acc_Name}</span>
                                        </div>
                                    </div>
                                    <div className="w-32 py-1.5 px-4 border-r border-gray-50  text-gray-400 truncate">{entry.costCenter}</div>
                                    <div className="w-36 py-1.5 px-4 border-r border-gray-50 text-right font-mono font-black text-slate-800">
                                        {entry.debit > 0 ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="w-36 py-1.5 px-4 border-r border-gray-50 text-right font-mono font-black text-slate-800">
                                        {entry.credit > 0 ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="flex-1 py-1.5 px-4 truncate text-gray-500 font-mono text-[10px]">{entry.memo}</div>
                                    <div className="w-9 flex justify-center">
                                        <button
                                            onClick={() => handleDeleteClick(entry)}
                                            className="text-red-300 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary & History Section - Compact Side-by-Side feel */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-end">
                            <div className="w-[420px] bg-slate-50/50 border border-gray-100 rounded-lg p-3.5 space-y-2.5 shadow-sm">
                                <div className="flex items-center justify-between text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                                    <span>Aggregated Journal Totals</span>
                                    <div className="flex gap-4">
                                        <span className="text-blue-600">DR: {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        <span className="text-red-600">CR: {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-between px-3 py-2.5 rounded-md border-2 transition-all ${difference === 0 ? 'bg-green-50/50 border-green-200 text-green-700' : 'bg-amber-50/50 border-amber-200 text-amber-700'}`}>
                                    <span className="text-[13px] font-black uppercase tracking-widest">{difference === 0 ? 'BALANCED' : 'UNBALANCED'}</span>
                                    <div className={`text-[20px] font-mono font-black ${difference === 0 ? 'text-green-600' : 'text-amber-600'}`}>Rs. {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </SimpleModal>

            {/* History Modal */}
            {activeModal === 'history' && (
                <HistoryArchiveModal 
                    history={history} 
                    onClose={() => setActiveModal(null)} 
                    onSelectDateRange={() => setActiveModal('dateRange')}
                    selectedDateRange={selectedDateRange}
                />
            )}

            {/* Lookups Modals */}
            <SearchModal
                isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)}
                title="Ledger Account Lookup" items={lookups.accounts}
                onSelect={handleAccountSelect}
            />
            <SearchModal
                isOpen={activeModal === 'costCenter'} onClose={() => setActiveModal(null)}
                title="Strategic Unit Lookup" items={lookups.costCenters}
                onSelect={item => setCurrentLine(prev => ({ ...prev, costCenter: item.code, costCenterName: item.name }))}
            />
            <SearchModal
                isOpen={activeModal === 'vendor'} onClose={() => setActiveModal(null)}
                title="Search Entity / Vendor" items={lookups.suppliers}
                onSelect={v => setCurrentLine(prev => ({ ...prev, vendId: v.code, vendName: v.name }))}
            />
            <SearchModal
                isOpen={activeModal === 'dateRange'} onClose={() => setActiveModal(null)}
                title="Date Period Selection" items={lookups.dateRanges}
                onSelect={handleDateRangeSelect}
            />
            <CalendarModal
                isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}
                initialDate={header.date}
                onDateSelect={date => {
                    setHeader(prev => ({ ...prev, date }));
                }}
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Removal"
                message="Are you sure you want to delete this entry? This action will remove the record from the current journal session."
                loading={isDeleting}
            />
        </>
    );
};

const HistoryArchiveModal = ({ history, onClose, onSelectDateRange, selectedDateRange }) => {
    const [search, setSearch] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);

    // Group history by docNo
    const groupedHistory = useMemo(() => {
        const groups = {};
        history.forEach(item => {
            if (!groups[item.docNo]) {
                groups[item.docNo] = {
                    docNo: item.docNo,
                    date: item.date,
                    memo: item.memo,
                    totalDebit: 0,
                    totalCredit: 0,
                    lines: []
                };
            }
            groups[item.docNo].totalDebit += item.debit;
            groups[item.docNo].totalCredit += item.credit;
            groups[item.docNo].lines.push(item);
        });
        return Object.values(groups).sort((a, b) => b.docNo.localeCompare(a.docNo));
    }, [history]);

    const filtered = groupedHistory.filter(h => 
        h.docNo.toLowerCase().includes(search.toLowerCase()) ||
        h.memo?.toLowerCase().includes(search.toLowerCase()) ||
        h.lines.some(l => l.accName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <SimpleModal
                isOpen={true}
                onClose={onClose}
                title="HISTORICAL JOURNAL ARCHIVE"
                maxWidth="max-w-5xl"
                zoom={1}
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Search Facility Wrapper */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find journal by document number, account or narrative..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Directory Table */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 z-20 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 w-40">Journal No</th>
                                        <th className="px-5 py-3 w-32 text-center">Post Date</th>
                                        <th className="px-5 py-3">General Narrative</th>
                                        <th className="px-5 py-3 text-right w-32">Total Value</th>
                                        <th className="px-5 py-3 text-center w-24">Entries</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <FileText size={56} strokeWidth={1} className="text-slate-300" />
                                                    <span className="text-[14px] font-black text-slate-400 uppercase tracking-[3px] italic">Archive Directory Empty</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtered.map((h, i) => (
                                        <tr 
                                            key={i} 
                                            className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                                            onClick={() => setSelectedJournal(h)}
                                        >
                                            <td className="px-5 py-4 font-mono text-[12px] text-blue-600 font-bold">{h.docNo}</td>
                                            <td className="px-5 py-4 text-center text-[12px] font-mono text-gray-500">{h.date}</td>
                                            <td className="px-5 py-4">
                                                <div className="text-[11px] font-bold text-slate-800 uppercase group-hover:text-blue-700 transition-colors truncate max-w-xs">{h.memo || 'General Ledger Entry'}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 italic">Consolidated View</div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-mono text-[13px] font-black text-emerald-600">
                                                Rs. {h.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full">{h.lines.length} Lines</span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedJournal(h); }}
                                                    className="bg-[#0285fd] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95 border-none uppercase tracking-widest"
                                                >
                                                    DETAILS
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Details Modal */}
            {selectedJournal && (
                <JournalDetailsModal 
                    journal={selectedJournal} 
                    onClose={() => setSelectedJournal(null)} 
                />
            )}
        </>
    );
};

const JournalDetailsModal = ({ journal, onClose }) => {
    return (
        <SimpleModal
            isOpen={true}
            onClose={onClose}
            title={`JOURNAL DETAILS - ${journal.docNo}`}
            maxWidth="max-w-4xl"
            zoom={1.05}
        >
            <div className="space-y-6 font-['Tahoma'] p-1">
                {/* Header Summary */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document No</span>
                        <div className="text-[14px] font-black text-blue-600 font-mono tracking-tighter">{journal.docNo}</div>
                    </div>
                    <div className="space-y-1 border-x border-gray-200 px-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Post Date</span>
                        <div className="text-[14px] font-black text-slate-700">{journal.date}</div>
                    </div>
                    <div className="space-y-1 pl-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Journal Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Post Confirmed</span>
                        </div>
                    </div>
                </div>

                {/* Details Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafd] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3">Account Descriptor</th>
                                <th className="px-5 py-3">Narrative / Memo</th>
                                <th className="px-5 py-3 text-right w-32">Debit (DR)</th>
                                <th className="px-5 py-3 text-right w-32">Credit (CR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {journal.lines.map((line, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="text-[11px] font-bold text-slate-800 uppercase">{line.accName}</div>
                                        <div className="text-[10px] font-mono text-blue-500 mt-0.5">{line.accId}</div>
                                    </td>
                                    <td className="px-5 py-3 text-[10px] text-slate-500 font-bold italic">{line.memo || '-'}</td>
                                    <td className="px-5 py-3 text-right font-mono text-[12px] font-black text-slate-800">
                                        {line.debit > 0 ? line.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono text-[12px] font-black text-red-600">
                                        {line.credit > 0 ? line.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50/50 border-t-2 border-gray-100">
                            <tr>
                                <td colSpan="2" className="px-5 py-3 text-[11px] font-black text-slate-600 uppercase tracking-widest text-right italic">Balance check verified</td>
                                <td className="px-5 py-3 text-right font-mono text-[13px] font-black text-slate-800 bg-white border-x border-gray-100 shadow-sm">
                                    {journal.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-5 py-3 text-right font-mono text-[13px] font-black text-red-600 bg-white shadow-sm">
                                    {journal.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-10 h-10 bg-slate-800 text-white text-[12px] font-black rounded-[5px] hover:bg-black transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-slate-200"
                    >
                        DONE
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default JournalEntryBoard;
