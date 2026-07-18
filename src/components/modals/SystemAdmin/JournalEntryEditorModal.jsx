import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    Search, 
    X, 
    RotateCcw, 
    Calendar, 
    Check, 
    ChevronDown, 
    FileEdit, 
    Save, 
    Trash2, 
    Plus, 
    SearchCode,
    Calculator,
    Database
} from 'lucide-react';


import CalendarModal from '../../CalendarModal';
import UniversalLookupModal from '../ViewAndUtilityModels/UniversalLookupModal';
import { journalEntryEditorService } from '../../../services/journalEntryEditor.service';
import { getSessionData } from '../../../utils/session';
import { Loader2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


const JournalEntryEditorModal = ({ isOpen, onClose }) => {
    // State Management
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

    // New Row State
    const [currentRow, setCurrentRow] = useState({
        accountCode: '',
        accountName: '',
        debit: '',
        credit: '',
        memo: ''
    });

    // Custom Toast Handlers
    // Calculation Helpers
    const totalDebit = rows.reduce((sum, row) => sum + (parseFloat(row.debit) || 0), 0);
    const totalCredit = rows.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0);

    // Fetch Lookups on Mount
    React.useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
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

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-200 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleDone}
                className="px-8 h-10 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#0073ff] shadow-md transition-all active:scale-95 border-none flex items-center justify-center gap-2 uppercase tracking-widest"
            >
                <Check size={16} strokeWidth={3} /> Done
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-slate-400 text-white text-[13px] font-bold rounded-[3px] hover:bg-slate-500 shadow-md transition-all active:scale-95 border-none flex items-center justify-center gap-2 uppercase tracking-widest"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

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
                title="JOURNAL ENTRY EDITOR"
                maxWidth="max-w-[700px]"
                footer={footer}
            >
                <div className="p-6 font-['Tahoma'] select-none">
                    {/* Header Inputs */}
                    <div className="grid grid-cols-12 gap-6 mb-8 items-end bg-slate-50/50 p-4 border border-slate-100 rounded-[3px] shadow-sm">
                        <div className="col-span-4 space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Journal Entry Number</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" 
                                    value={entryNo}
                                    onChange={(e) => setEntryNo(e.target.value)}
                                    className="flex-1 h-9 border border-slate-200 px-3 bg-white rounded-[3px] outline-none font-bold text-slate-700 text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] transition-colors shadow-sm appearance-none"
                                    placeholder="JRN-00001"
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <button 
                                onClick={handleLoad}
                                disabled={loading}
                                className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Load'}
                            </button>
                        </div>

                        <div className="col-span-4 space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Journal Entry Date</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" 
                                    value={entryDate}
                                    readOnly
                                    className="flex-1 h-9 border border-slate-200 px-3 bg-white rounded-[3px] outline-none font-bold text-slate-700 text-[13px] shadow-sm"
                                />
                                <button 
                                    onClick={() => setShowCalendar(true)}
                                    className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] shadow-md transition-all active:scale-90"
                                >
                                    <Calendar size={16} strokeWidth={2}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Entry Grid */}
                    <div className="bg-white border border-slate-200 rounded-[3px] overflow-hidden shadow-lg shadow-slate-100 mb-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafd] text-slate-400 uppercase text-[10px] tracking-[2px] font-black border-b border-gray-200">
                                    <th className="border-r border-white/10 w-[150px] px-5 py-3">Account Code</th>
                                    <th className="border-r border-white/10 px-5 py-3">Account Name</th>
                                    <th className="border-r border-white/10 w-[120px] text-right px-5 py-3">Debit</th>
                                    <th className="border-r border-white/10 w-[120px] text-right px-5 py-3">Credit</th>
                                    <th className="w-[250px] px-5 py-3">Memo</th>
                                    <th className="w-[50px] px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            No entries found. Please add a row below.
                                        </td>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{row.accountCode}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{row.accountName}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {parseFloat(row.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                {parseFloat(row.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{row.memo}</td>
                                            <td className="text-right px-5 py-3">
                                                <button onClick={() => handleRemoveRow(row.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {/* Totals Row */}
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                <tr className="font-black text-slate-800 text-[12px] uppercase">
                                    <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Total Balance</td>
                                    <td className="text-right bg-blue-50/50 text-[#0285fd] px-5 py-3">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-right bg-blue-50/50 text-[#0285fd] px-5 py-3">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Entry Input Row */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[3px] p-4 grid grid-cols-12 gap-3 items-end shadow-inner">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Acct Code</label>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    value={currentRow.accountCode} 
                                    readOnly
                                    onClick={() => setShowAccountLookup(true)}
                                    className="flex-1 h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-bold text-blue-600 cursor-pointer hover:border-[#0285fd] transition-colors appearance-none"
                                    placeholder="Search..."
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                            </div>
                        </div>
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Account Name</label>
                            <input 
                                type="text" 
                                value={currentRow.accountName} 
                                readOnly
                                onClick={() => setShowAccountLookup(true)}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-bold text-slate-600 truncate cursor-pointer hover:border-[#0285fd] transition-colors"
                                placeholder="Select an account"
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Debit</label>
                            <input 
                                type="text" 
                                value={currentRow.debit}
                                onChange={(e) => setCurrentRow({...currentRow, debit: e.target.value, credit: ''})}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-mono font-bold text-blue-600"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Credit</label>
                            <input 
                                type="text" 
                                value={currentRow.credit}
                                onChange={(e) => setCurrentRow({...currentRow, credit: e.target.value, debit: ''})}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-mono font-bold text-red-600"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Memo / Narrative</label>
                            <input 
                                type="text" 
                                value={currentRow.memo}
                                onChange={(e) => setCurrentRow({...currentRow, memo: e.target.value})}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-medium text-slate-600"
                                placeholder="Entry details..."
                            />
                        </div>
                        <div className="col-span-1">
                            <button 
                                onClick={handleAddRow}
                                className="w-full h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[4px] shadow-md active:scale-90"
                            >
                                <Plus size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showCalendar && (
                <CalendarModal 
                    isOpen={showCalendar} 
                    onClose={() => setShowCalendar(false)} 
                    onDateSelect={(date) => { setEntryDate(date); setShowCalendar(false); }} 
                    initialDate={entryDate}
                />
            )}

            {showAccountLookup && (
                <UniversalLookupModal
                    isOpen={showAccountLookup}
                    onClose={() => setShowAccountLookup(false)}
                    onSelect={(acc) => {
                        setCurrentRow({ ...currentRow, accountCode: acc.code, accountName: acc.name });
                        setShowAccountLookup(false);
                    }}
                    type="account"
                    title="CHART OF ACCOUNTS LOOKUP"
                    initialData={lookups}
                    placeholder="Search accounts..."
                />
            )}
            {showJournalSearch && (
                <UniversalLookupModal
                    isOpen={showJournalSearch}
                    onClose={() => setShowJournalSearch(false)}
                    onSelect={(jnl) => {
                        setEntryNo(jnl.code);
                        setShowJournalSearch(false);
                    }}
                    type="journal"
                    title="JOURNAL ENTRY SEARCH"
                    initialData={journalList}
                    placeholder="Search journal numbers..."
                />
            )}
            {showDeleteConfirm && (
                <SimpleModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="CONFIRM DELETION"
                    maxWidth="max-w-[700px]"
                >
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Delete Row?</h3>
                        <p className="text-slate-500 text-[13px] leading-relaxed mb-6">
                            Are you sure you want to remove this journal entry row? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </SimpleModal>
            )}
        </>
    );
};

export default JournalEntryEditorModal;
