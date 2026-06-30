import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

import { getSessionData } from '../utils/session';

import * as XLSX from 'xlsx';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Find record by legal name or code..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.code?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Name</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            No matching records found
                                        </td>
                                    </tr>
                                ) : filtered.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50"
                                        onClick={() => { onSelect(item); onClose(); }}
                                    >
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{item.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
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
    const [companyCode, setCompanyCode] = useState(null);
    const [currentUser, setCurrentUser] = useState('');

    const getInitialHeader = () => ({
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

    const [header, setHeader] = useState(getInitialHeader());

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
        drMode: true
    });

    const [selectedDateRange, setSelectedDateRange] = useState({ code: '11', name: 'Today' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [lineToDelete, setLineToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setHeader(getInitialHeader());
            const { companyCode: sessCompany, userName: sessUser } = getSessionData();
            setCompanyCode(sessCompany);
            setCurrentUser(sessUser);
            loadInitialData(sessCompany, sessUser);
        }
    }, [isOpen]);

    const loadInitialData = async (compCode, user) => {
        if (!compCode) {
            showErrorToast("Company session not found. Please select a company from the dashboard.");
            return;
        }
        try {
            setLoading(true);
            const lks = await journalService.getLookups(compCode, user);
            setLookups({
                costCenters: lks.costCenters || [],
                accounts: lks.accounts || [],
                customers: lks.customers || [],
                suppliers: lks.suppliers || [],
                dateRanges: lks.dateRanges || []
            });

            const docs = await journalService.generateDocNo(compCode);

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
        loadHistory(compCode);
    };

    const loadHistory = async (compCode) => {
        const hist = await journalService.getHistory(compCode, selectedDateRange.code);
        setHistory(hist);
    };

    const handleDateRangeSelect = (item) => {
        setSelectedDateRange(item);
        loadHistory();
    };

    const handleAccountSelect = async (item) => {
        setCurrentLine(prev => ({ ...prev, accId: item.code, accName: item.name }));
        const bal = await journalService.getBalance(item.code);
        setAccBalance(bal);
    };

    const handleAddLine = async () => {
        if (!currentLine.accId || (!currentLine.debit && !currentLine.credit)) {
            showErrorToast("Please select an account and enter an amount");
            return;
        }

        const data = {
            accId: currentLine.accId,
            accName: currentLine.accName,
            costCenter: currentLine.costCenter || '',
            costCenterName: currentLine.costCenterName || '',
            debit: parseFloat(currentLine.debit || 0),
            credit: parseFloat(currentLine.credit || 0),
            memo: currentLine.memo || '',
            vendId: currentLine.vendId || '',
            vendName: currentLine.vendName || '',
            docNo: header.docNo,
            entryNo: header.entryNo,
            date: header.date,
            company: companyCode,
            createUser: currentUser,
            type: '',
            drNote: header.debitNote,
            idNo: 0,
            reconcileDate: '',
            reconcileDocNo: '',
            tempIdNo: 0,
            balance: 0
        };

        try {
            const res = await journalService.addTempEntry(data);
            setTempEntries(res);
            resetLine();
            showSuccessToast("Line added successfully");
        } catch (error) {
            showErrorToast("Failed to add line");
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
            showSuccessToast("Line removed");
        } catch (error) {
            showErrorToast("Failed to delete line");
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

    const fileInputRef = useRef(null);

    const handleDownloadTemplate = useCallback(() => {
        const wb = XLSX.utils.book_new();

        const entryHeaders = [['Account Code', 'Account Name', 'Cost Center', 'Debit', 'Credit', 'Memo']];
        const emptyRows = Array.from({ length: 20 }, () => ['', '', '', 0, 0, '']);
        const entryData = [...entryHeaders, ...emptyRows];
        const wsEntry = XLSX.utils.aoa_to_sheet(entryData);

        wsEntry['!cols'] = [
            { wch: 16 },
            { wch: 35 },
            { wch: 22 },
            { wch: 14 },
            { wch: 14 },
            { wch: 35 },
        ];
        XLSX.utils.book_append_sheet(wb, wsEntry, 'Journal_Entries');

        const accHeaders = [['Account Code', 'Account Name']];
        const accRows = (lookups.accounts || []).map(a => [a.code, a.name]);
        const wsAcc = XLSX.utils.aoa_to_sheet([...accHeaders, ...accRows]);
        wsAcc['!cols'] = [{ wch: 18 }, { wch: 45 }];
        XLSX.utils.book_append_sheet(wb, wsAcc, 'Account_Directory');

        const ccHeaders = [['Cost Center Code', 'Cost Center Name']];
        const ccRows = (lookups.costCenters || []).map(c => [c.code, c.name]);
        const wsCC = XLSX.utils.aoa_to_sheet([...ccHeaders, ...ccRows]);
        wsCC['!cols'] = [{ wch: 18 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, wsCC, 'Cost_Centers');

        XLSX.writeFile(wb, `JNL_Template_${header.docNo}.xlsx`);
        showSuccessToast(`Template downloaded with ${lookups.accounts.length} accounts & ${lookups.costCenters.length} cost centers. See reference sheets inside.`);
    }, [lookups.accounts, lookups.costCenters, header.docNo]);

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
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (rows.length < 2) {
                return showErrorToast('File has no data rows. Fill in the Journal_Entries sheet and try again.');
            }

            const headers = rows[0];
            const accCodeIdx = headers.findIndex(h => /account.*code|code/i.test(String(h)));
            const accNameIdx = headers.findIndex(h => /account.*name|name/i.test(String(h)));
            const costCenterIdx = headers.findIndex(h => /cost.*center|strategic|unit/i.test(String(h)));
            const debitIdx = headers.findIndex(h => /debit|dr/i.test(String(h)));
            const creditIdx = headers.findIndex(h => /credit|cr/i.test(String(h)));
            const memoIdx = headers.findIndex(h => /memo|narrative|notes/i.test(String(h)));

            const dataRows = rows.slice(1).filter(row => row[accCodeIdx] || row[accNameIdx]);
            if (dataRows.length === 0) {
                return showErrorToast('No valid data rows found. Ensure the file has account codes or names in the first column.');
            }

            const successLines = [];
            const errorLines = [];

            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                const rawAccCode = String(row[accCodeIdx] || '').trim();
                const rawAccName = String(row[accNameIdx] || '').trim();
                const rawCC = String(row[costCenterIdx] || '').trim();
                const rawDebit = parseFloat(row[debitIdx]) || 0;
                const rawCredit = parseFloat(row[creditIdx]) || 0;
                const rawMemo = String(row[memoIdx] || '').trim();

                let accCode = rawAccCode;
                let accName = rawAccName;

                if (!accCode && accName) {
                    const match = lookups.accounts.find(a => a.name.toLowerCase() === accName.toLowerCase());
                    if (match) accCode = match.code;
                }

                if (!accCode && !accName) {
                    errorLines.push(`Row ${i + 1}: No account identifier`);
                    continue;
                }

                if (!accName && accCode) {
                    const match = lookups.accounts.find(a => a.code === accCode);
                    if (match) accName = match.name;
                }

                let costCenterCode = rawCC;
                let costCenterName = rawCC;
                if (rawCC) {
                    const ccMatch = lookups.costCenters.find(c => c.code === rawCC || c.name === rawCC);
                    if (ccMatch) {
                        costCenterCode = ccMatch.code;
                        costCenterName = ccMatch.name;
                    }
                }

                const payload = {
                    accId: accCode,
                    accName: accName,
                    costCenter: costCenterCode,
                    costCenterName: costCenterName,
                    debit: rawDebit,
                    credit: rawCredit,
                    memo: rawMemo,
                    vendId: '',
                    vendName: '',
                    docNo: header.docNo,
                    entryNo: header.entryNo,
                    date: header.date,
                    company: companyCode,
                    createUser: currentUser,
                    drNote: header.debitNote,
                    type: '', idNo: 0, reconcileDate: '', reconcileDocNo: '', tempIdNo: 0, balance: 0
                };

                try {
                    const res = await journalService.addTempEntry(payload);
                    if (res && Array.isArray(res)) {
                        successLines.push(res);
                    }
                } catch (err) {
                    errorLines.push(`Row ${i + 1}: ${err.message || 'API error'}`);
                }
            }

            if (successLines.length > 0) {
                const latest = successLines[successLines.length - 1];
                setTempEntries(Array.isArray(latest) ? latest : []);
                showSuccessToast(`${successLines.length} line(s) imported.${errorLines.length > 0 ? ` ${errorLines.length} error(s).` : ''}`);
            } else if (errorLines.length > 0) {
                showErrorToast(`Import failed: ${errorLines[0]}`);
            } else {
                showErrorToast('No lines could be imported. Check file format.');
            }

            resetLine();
        } catch (error) {
            showErrorToast(`File read error: ${error.message}`);
        } finally {
            setIsLoadingExcel(false);
        }
    }, [header, companyCode, currentUser, lookups]);

    const handleLoadEditJournal = async (journalObj) => {
        try {
            setLoading(true);
            setHeader(prev => ({ ...prev, editSaved: true }));
            const data = await journalService.loadForEdit({
                docNo: journalObj.docNo,
                company: companyCode,
                createUser: currentUser
            });
            setHeader(prev => ({
                ...prev,
                docNo: data.docNo || journalObj.docNo,
                entryNo: data.entryNo || '',
                date: data.date || journalObj.date,
                lastEntryNo: data.lastEntryNo || prev.lastEntryNo
            }));
            setTempEntries(data.entries || data.lines || []);
            showSuccessToast(`Loaded journal ${journalObj.docNo} for editing`);
            setActiveModal(null);
        } catch (error) {
            showErrorToast("Failed to load journal for editing");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (tempEntries.length === 0) return showErrorToast("No lines to save.");
        if (totalDebit !== totalCredit) return showErrorToast("Journal is not balanced!");

        try {
            setLoading(true);
            await journalService.applyJournal({
                docNo: header.docNo,
                entryNo: header.entryNo,
                date: header.date,
                company: companyCode,
                createUser: currentUser,
                editSaved: header.editSaved,
                debitNote: header.debitNote
            });
            showSuccessToast('Journal entry saved successfully!');
            setHeader(getInitialHeader());
            setTempEntries([]);
            if (onComplete) onComplete();
            onClose();
        } catch (error) {
            showErrorToast(error.message || 'Failed to save journal entry');
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = tempEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = tempEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Journal Entry"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-4">
                            <button
                                onClick={async () => {
                                    if (header.docNo) {
                                        await journalService.clearTemp(header.docNo, companyCode);
                                    }
                                    setTempEntries([]);
                                    resetLine();
                                }}
                                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> CLEAR
                            </button>
                            <button
                                onClick={() => setActiveModal('history')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                            >
                                <History size={14} /> JOURNAL
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={loading || tempEntries.length === 0 || totalDebit !== totalCredit}
                                className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar">

                    {/* Excel Utilities & Mode Selection */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={header.editSaved}
                                    onChange={e => setHeader(prev => ({ ...prev, editSaved: e.target.checked }))}
                                    className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd] cursor-pointer"
                                />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-[#0285fd] transition-colors">Edit Mode</span>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                className="hidden"
                                onChange={handleLoadExcel}
                            />
                            <button
                                onClick={handleDownloadTemplate}
                                className="h-8 px-4 bg-white text-emerald-600 border border-emerald-500 text-[10px] font-bold rounded-[3px] hover:bg-emerald-50 transition-all flex items-center gap-2 uppercase shadow-sm"
                            >
                                <FileDown size={14} /> TEMPLATE
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoadingExcel}
                                className="h-8 px-4 bg-white text-blue-600 border border-blue-500 text-[10px] font-bold rounded-[3px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                                {isLoadingExcel ? 'LOADING...' : 'LOAD EXCEL'}
                            </button>
                        </div>
                    </div>

                    {/* Document Header */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Entry No</label>
                                <input
                                    type="text"
                                    value={header.entryNo}
                                    onChange={e => setHeader({ ...header, entryNo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                />
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={header.date}
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => setShowDatePicker(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Last Entry</label>
                                <div className="w-full h-10 border border-gray-300 rounded-[3px] px-3 flex items-center bg-red-50/50 border-red-200 text-[14px] font-bold font-mono text-red-500">
                                    {String(header.lastEntryNo || '0').padStart(5, '0')}
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">System Doc</label>
                                {header.editSaved ? (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={header.docNo}
                                            onChange={e => setHeader({ ...header, docNo: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleLoadEditJournal({ docNo: header.docNo });
                                            }}
                                            placeholder="Doc No"
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700"
                                        />
                                        <button onClick={() => setActiveModal('history')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full h-10 border border-gray-300 rounded-[3px] px-3 flex items-center text-[14px] font-bold font-mono text-blue-600">
                                        <span className="truncate">{header.docNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Line Entry Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ledger Account</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={currentLine.accName}
                                        onClick={() => setActiveModal('account')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                    />
                                    <button onClick={() => setActiveModal('account')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Strategic Unit</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={currentLine.costCenterName}
                                        onClick={() => setActiveModal('costCenter')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                    />
                                    <button onClick={() => setActiveModal('costCenter')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Brief Memo</label>
                                <input
                                    type="text"
                                    value={currentLine.memo}
                                    onChange={e => setCurrentLine({ ...currentLine, memo: e.target.value })}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                />
                            </div>

                            {/* Financials & Action */}
                            <div className="col-span-12 flex items-center justify-between border-t border-slate-100 pt-3">
                                <div className="flex gap-5">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Debit (DR)</label>
                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input
                                                type="number" step="0.01"
                                                value={currentLine.debit}
                                                disabled={!currentLine.drMode}
                                                onChange={e => setCurrentLine({ ...currentLine, debit: e.target.value })}
                                                className={`w-full h-10 border rounded-[3px] pl-9 pr-3 text-[14px] font-bold outline-none text-right
                                                    ${currentLine.drMode
                                                        ? 'border-gray-300 bg-white text-blue-600 focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]'
                                                        : 'border-gray-300 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit (CR)</label>
                                        <div className="relative w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">Rs.</span>
                                            <input
                                                type="number" step="0.01"
                                                value={currentLine.credit}
                                                disabled={currentLine.drMode}
                                                onChange={e => setCurrentLine({ ...currentLine, credit: e.target.value })}
                                                className={`w-full h-10 border rounded-[3px] pl-9 pr-3 text-[14px] font-bold outline-none text-right
                                                    ${!currentLine.drMode
                                                        ? 'border-red-400 bg-white text-red-600 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
                                                        : 'border-gray-300 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-gray-50 border border-gray-300 rounded-[3px] h-10 items-center px-3 gap-4">
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                                type="radio" name="drCrToggle"
                                                checked={currentLine.drMode}
                                                onChange={() => setCurrentLine({ ...currentLine, drMode: true, credit: '0.00' })}
                                                className="w-3.5 h-3.5 text-[#0285fd] focus:ring-[#0285fd] border-gray-300 cursor-pointer"
                                            />
                                            <span className={`text-[10px] font-bold uppercase transition-colors ${currentLine.drMode ? 'text-[#0285fd]' : 'text-gray-400'}`}>DR</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                                type="radio" name="drCrToggle"
                                                checked={!currentLine.drMode}
                                                onChange={() => setCurrentLine({ ...currentLine, drMode: false, debit: '0.00' })}
                                                className="w-3.5 h-3.5 text-red-500 focus:ring-red-500 border-gray-300 cursor-pointer"
                                            />
                                            <span className={`text-[10px] font-bold uppercase transition-colors ${!currentLine.drMode ? 'text-red-500' : 'text-gray-400'}`}>CR</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleAddLine}
                                        className="h-10 px-6 bg-[#0285fd] text-white text-[13px] font-semibold rounded-[3px] shadow-sm hover:bg-[#0073ff] transition-all flex items-center gap-2"
                                    >
                                        <Plus size={16} strokeWidth={3} /> ADD RECORD
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journal Grid Table */}
                    <div className="border border-slate-200 rounded-[3px] bg-white flex flex-col overflow-hidden">
                        <div className="flex bg-slate-50 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 items-center">
                            <div className="w-12 px-3 text-center">No</div>
                            <div className="flex-1 px-4">Account Descriptor</div>
                            <div className="w-32 px-4">Cost Center</div>
                            <div className="w-36 px-4 text-right">Debit</div>
                            <div className="w-36 px-4 text-right">Credit</div>
                            <div className="flex-1 px-4">Narrative</div>
                            <div className="w-9"></div>
                        </div>
                        <div className="bg-white overflow-y-auto max-h-[160px] divide-y divide-slate-100 no-scrollbar">
                            {tempEntries.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-gray-300">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Queue is Empty</span>
                                </div>
                            ) : tempEntries.map((entry, idx) => (
                                <div key={idx} className="flex text-[12px] hover:bg-gray-50 items-center transition-colors group">
                                    <div className="w-12 px-3 py-2 text-center font-mono text-gray-400">{idx + 1}</div>
                                    <div className="flex-1 px-4 py-2">
                                        <span className="text-blue-600 font-mono text-[10px] font-bold">{entry.acc_Id} </span>
                                        <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{entry.acc_Name}</span>
                                    </div>
                                    <div className="w-32 px-4 py-2 text-gray-400 truncate text-[11px]">{entry.costCenter}</div>
                                    <div className="w-36 px-4 py-2 text-right font-mono font-bold text-slate-800">
                                        {entry.debit > 0 ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="w-36 px-4 py-2 text-right font-mono font-bold text-slate-800">
                                        {entry.credit > 0 ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </div>
                                    <div className="flex-1 px-4 py-2 truncate text-gray-500 text-[11px]">{entry.memo}</div>
                                    <div className="w-9 flex justify-center">
                                        <button onClick={() => handleDeleteClick(entry)} className="text-red-300 hover:text-red-500 p-1">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white border border-slate-200 rounded-[3px] p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[13px] font-medium text-gray-700">Aggregated Journal Totals</span>
                                <div className="flex gap-3 font-mono text-[13px] font-bold">
                                    <span className="text-blue-600">DR: {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    <span className="text-red-600">CR: {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 px-4 py-2 rounded-[3px] border-2 transition-all ${difference === 0 ? 'bg-blue-50/50  text-blue-700' : 'bg-amber-50/50 border-amber-300 text-amber-700'}`}>
                                <span className="text-[11px] font-bold uppercase tracking-widest">{difference === 0 ? 'BALANCED' : 'UNBALANCED'}</span>
                                <div className={`text-[18px] font-mono font-bold ${difference === 0 ? 'text-blue-600' : 'text-amber-600'}`}>Rs. {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* History Modal */}
            {activeModal === 'history' && (
                <HistoryArchiveModal
                    history={history}
                    onClose={() => setActiveModal(null)}
                    onSelectDateRange={() => setActiveModal('dateRange')}
                    selectedDateRange={selectedDateRange}
                    isEditMode={header.editSaved}
                    onEdit={handleLoadEditJournal}
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

const HistoryArchiveModal = ({ history, onClose, onSelectDateRange, selectedDateRange, isEditMode, onEdit }) => {
    const [search, setSearch] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);

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
            <SimpleModal isOpen={true} onClose={onClose} title="Historical Journal Archive">
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find journal by document number, account or narrative..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Journal No</th>
                                        <th className="text-center px-5 py-3">Post Date</th>
                                        <th className=" px-5 py-3">General Narrative</th>
                                        <th className="text-right px-5 py-3">Total Value</th>
                                        <th className="text-center px-5 py-3">Entries</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <FileText size={56} strokeWidth={1} className="text-slate-300" />
                                                    <span className="text-[14px] font-bold text-slate-400 uppercase tracking-[3px] italic">Archive Directory Empty</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtered.map((h, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-blue-50/50 transition-all  group cursor-pointer group border-b border-gray-50"
                                            onClick={() => setSelectedJournal(h)}
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{h.docNo}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{h.date}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <div className="text-[11px] font-bold text-slate-800 uppercase group-hover:text-blue-700 transition-colors truncate max-w-xs">{h.memo || 'General Ledger Entry'}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 italic">Consolidated View</div>
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                Rs. {h.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-[3px]">{h.lines.length} Lines</span>
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                {isEditMode ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(h); }}
                                                        className="bg-[#0285fd] text-white text-[10px] px-4 py-1.5 rounded font-bold hover:bg-[#0073ff] transition-all uppercase"
                                                    >
                                                        EDIT
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedJournal(h); }}
                                                        className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                                                    >
                                                        DETAILS
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

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
        <SimpleModal isOpen={true} onClose={onClose} title={`Journal Details - ${journal.docNo}`}>
            <div className="space-y-4 p-1">
                {/* Header Summary */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-[3px] border border-gray-200">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Document No</span>
                        <div className="text-[14px] font-bold text-blue-600 font-mono">{journal.docNo}</div>
                    </div>
                    <div className="space-y-1 border-x border-gray-200 px-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Post Date</span>
                        <div className="text-[14px] font-bold text-slate-700">{journal.date}</div>
                    </div>
                    <div className="space-y-1 pl-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Journal Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Post Confirmed</span>
                        </div>
                    </div>
                </div>

                {/* Details Table */}
                <div className="border border-gray-200 rounded-[3px] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                            <tr>
                                <th className=" px-5 py-3">Account Descriptor</th>
                                <th className=" px-5 py-3">Narrative / Memo</th>
                                <th className="text-right px-5 py-3">Debit (DR)</th>
                                <th className="text-right px-5 py-3">Credit (CR)</th>
                            <th className="text-right px-5 py-3">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {journal.lines.map((line, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-all cursor-pointer group border-b border-gray-50">
                                    <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                        <div className="text-[11px] font-bold text-slate-800 uppercase">{line.accName}</div>
                                        <div className="text-[10px] font-mono text-blue-500 mt-0.5">{line.accId}</div>
                                    </td>
                                    <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{line.memo || '-'}</td>
                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                        {line.debit > 0 ? line.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                        {line.credit > 0 ? line.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50/50 border-t-2 border-gray-200">
                            <tr>
                                <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Balance check verified</td>
                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                    {journal.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                    {journal.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#0285fd] text-white font-semibold rounded-[3px] shadow-sm text-[13px] hover:bg-[#0073ff] transition-all uppercase"
                    >
                        DONE
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default JournalEntryBoard;
