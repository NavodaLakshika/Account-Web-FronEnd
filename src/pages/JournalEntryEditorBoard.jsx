import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Calendar, Check, Trash2, Plus, Save, Loader2, FileEdit } from 'lucide-react';
import { journalEntryEditorService } from '../services/journalEntryEditor.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
        (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4 font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="text" placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                    </div>
                </div>
                <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className="w-32 px-5 py-3">Identifier</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records discovered</td></tr>
                                ) : filtered.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { onSelect(item); onClose(); }}>
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

const JournalEntryEditorBoard = ({ isOpen, onClose }) => {
    const [entryNo, setEntryNo] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAccountLookup, setShowAccountLookup] = useState(false);
    const [showJournalSearch, setShowJournalSearch] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [lookups, setLookups] = useState([]);
    const [journalList, setJournalList] = useState([]);

    const [currentRow, setCurrentRow] = useState({
        accountCode: '', accountName: '', debit: '', credit: '', memo: ''
    });

    const totalDebit = rows.reduce((sum, row) => sum + (parseFloat(row.debit) || 0), 0);
    const totalCredit = rows.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0);

    useEffect(() => {
        if (isOpen) { fetchLookups(); }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await journalEntryEditorService.getLookups();
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load accounts archive');
        }
    };

    const handleLoad = async () => {
        if (!entryNo) return showErrorToast('Enter a valid Journal Number');
        setLoading(true);
        try {
            const session = getSessionData();
            const data = await journalEntryEditorService.loadEntries(entryNo, session.companyCode);
            setRows(data);
            showSuccessToast('Journal record synchronized');
        } catch (error) {
            showErrorToast('Failed to retrieve journal entries');
        } finally {
            setLoading(false);
        }
    };

    const handleJournalSearch = async () => {
        setLoading(true);
        try {
            const session = getSessionData();
            const data = await journalEntryEditorService.searchJournals(session.companyCode, entryNo);
            setJournalList(data);
            setShowJournalSearch(true);
        } catch (error) {
            showErrorToast('Failed to fetch journal list');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRow = (id) => {
        setRowToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!rowToDelete) return;
        setLoading(true);
        try {
            const session = getSessionData();
            await journalEntryEditorService.deleteRow(rowToDelete, session.companyCode);
            const updatedRows = await journalEntryEditorService.loadEntries(entryNo, session.companyCode);
            setRows(updatedRows);
            showSuccessToast('Row removed successfully');
        } catch (error) {
            showErrorToast('Failed to delete journal row');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setRowToDelete(null);
        }
    };

    const handleAddRow = async () => {
        if (!currentRow.accountCode) return showErrorToast('Please select an account');
        if (!currentRow.debit && !currentRow.credit) return showErrorToast('Please enter debit or credit amount');

        setLoading(true);
        try {
            const session = getSessionData();
            const payload = {
                docNo: entryNo,
                date: entryDate,
                company: session.companyCode,
                accountCode: currentRow.accountCode,
                accountName: currentRow.accountName,
                debit: parseFloat(currentRow.debit || 0),
                credit: parseFloat(currentRow.credit || 0),
                memo: currentRow.memo,
                user: session.userName
            };
            await journalEntryEditorService.updateRow(payload);
            const updatedRows = await journalEntryEditorService.loadEntries(entryNo, session.companyCode);
            setRows(updatedRows);
            setCurrentRow({ accountCode: '', accountName: '', debit: '', credit: '', memo: '' });
            showSuccessToast('Row processed successfully');
        } catch (error) {
            showErrorToast('Failed to update entry row');
        } finally {
            setLoading(false);
        }
    };

    const handleDone = async () => {
        if (rows.length === 0) return showErrorToast('No journal entries to save');
        if (totalDebit !== totalCredit) return showErrorToast('Journal entry is not balanced (Debit != Credit)');

        setLoading(true);
        try {
            const session = getSessionData();
            await journalEntryEditorService.applyChanges(entryNo, session.companyCode, session.userName);
            showSuccessToast('Journal Entry Processed Successfully');
            setTimeout(onClose, 2000);
        } catch (error) {
            showErrorToast('Failed to apply changes to master ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setRows([]);
        setEntryNo('');
        setCurrentRow({ accountCode: '', accountName: '', debit: '', credit: '', memo: '' });
        showSuccessToast('Editor cleared successfully');
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Journal Editor" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Journal Entry Editor"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <div className="flex gap-3">
                            <button onClick={handleLoad} disabled={loading}
                                className="px-6 h-10 border border-[#e49e1b] text-[#e49e1b] bg-white hover:bg-amber-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Load
                            </button>
                            <button onClick={handleDone} disabled={loading}
                                className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Done
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Inputs */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px]">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-end">
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Journal Entry Number</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input type="text" value={entryNo}
                                            onChange={(e) => setEntryNo(e.target.value)}
                                            placeholder="JRN-00001"
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                    </div>
                                    <button onClick={handleJournalSearch}
                                        className="w-10 h-10 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-[3px] transition-all flex items-center justify-center bg-white">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">&nbsp;</label>
                                <button onClick={handleLoad} disabled={loading}
                                    className="w-full h-10 bg-[#e49e1b] hover:bg-[#d49218] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 border-none disabled:opacity-50">
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Load
                                </button>
                            </div>
                            <div className="col-span-5">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Journal Entry Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={entryDate}
                                        onClick={() => setShowCalendar(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowCalendar(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Entry Grid */}
                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden flex flex-col">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 w-40 border-r border-slate-200">Account Code</th>
                                    <th className="px-4 flex-1 border-r border-slate-200">Account Name</th>
                                    <th className="px-4 w-32 text-right border-r border-slate-200">Debit</th>
                                    <th className="px-4 w-32 text-right border-r border-slate-200">Credit</th>
                                    <th className="px-4 w-48 border-r border-slate-200">Memo</th>
                                    <th className="px-4 w-12 text-center"></th>
                                <th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] opacity-50">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileEdit size={32} className="opacity-30" />
                                                No entries found. Add a row below.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-4 py-3 font-mono font-bold text-gray-800 text-[12px] border-r border-gray-50">{row.accountCode}</td>
                                            <td className="px-4 py-3 font-bold text-slate-700 text-[12px] border-r border-gray-50">{row.accountName}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-gray-800 text-[12px] text-right border-r border-gray-50">
                                                {parseFloat(row.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-gray-800 text-[12px] text-right border-r border-gray-50">
                                                {parseFloat(row.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-[12px] italic border-r border-gray-50">{row.memo}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleRemoveRow(row.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                <tr className="font-black text-gray-800 text-[12px] uppercase">
                                    <td colSpan="2" className="px-4 py-3 text-right tracking-wider">Total Balance</td>
                                    <td className="px-4 py-3 text-right bg-[#f0fdf0] text-[#0285fd] border-r border-slate-200">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right bg-[#f0fdf0] text-[#0285fd] border-r border-slate-200">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td colSpan="2" className="px-4 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Entry Input Row */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px]">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                            <Plus size={14} className="text-[#0285fd]" />
                            <span className="block text-[13px] font-medium text-gray-700">Add Entry Row</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-4 gap-y-3.5 items-end">
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Acct Code</label>
                                <div className="flex gap-1">
                                    <input type="text" readOnly value={currentRow.accountCode}
                                        onClick={() => setShowAccountLookup(true)}
                                        placeholder="Search..."
                                        className="flex-1 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700" />
                                    <button onClick={() => setShowAccountLookup(true)}
                                        className="w-10 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shrink-0 border-none">
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account Name</label>
                                <input type="text" readOnly value={currentRow.accountName}
                                    onClick={() => setShowAccountLookup(true)}
                                    placeholder="Select an account"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Debit</label>
                                <input type="text" value={currentRow.debit}
                                    onChange={(e) => setCurrentRow({...currentRow, debit: e.target.value, credit: ''})}
                                    placeholder="0.00"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit</label>
                                <input type="text" value={currentRow.credit}
                                    onChange={(e) => setCurrentRow({...currentRow, credit: e.target.value, debit: ''})}
                                    placeholder="0.00"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-800 font-mono font-bold" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo / Narrative</label>
                                <input type="text" value={currentRow.memo}
                                    onChange={(e) => setCurrentRow({...currentRow, memo: e.target.value})}
                                    placeholder="Entry details..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">&nbsp;</label>
                                <button onClick={handleAddRow}
                                    className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-bold rounded-[3px] text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border-none">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => { setEntryDate(date); setShowCalendar(false); }}
                initialDate={entryDate}
            />

            <SearchModal
                isOpen={showAccountLookup}
                onClose={() => setShowAccountLookup(false)}
                title="Chart of Accounts Lookup"
                items={lookups}
                onSelect={(acc) => {
                    setCurrentRow({ ...currentRow, accountCode: acc.code, accountName: acc.name });
                    setShowAccountLookup(false);
                }}
                searchPlaceholder="Search accounts..."
            />

            <SearchModal
                isOpen={showJournalSearch}
                onClose={() => setShowJournalSearch(false)}
                title="Journal Entry Search"
                items={journalList}
                onSelect={(jnl) => {
                    setEntryNo(jnl.code);
                    setShowJournalSearch(false);
                }}
                searchPlaceholder="Search journal numbers..."
            />

            {showDeleteConfirm && (
                <SimpleModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion" maxWidth="max-w-[700px]">
                    <div className="p-6 text-center font-['Tahoma']">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Delete Row?</h3>
                        <p className="text-slate-500 text-[13px] leading-relaxed mb-6">
                            Are you sure you want to remove this journal entry row? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-blue-50/50 font-semibold rounded-full text-[13px] transition-all border-none cursor-pointer group border-b border-gray-50">
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-sm text-[13px] transition-all border-none">
                                Delete
                            </button>
                        </div>
                    </div>
                </SimpleModal>
            )}
        </>
    );
};

export default JournalEntryEditorBoard;
