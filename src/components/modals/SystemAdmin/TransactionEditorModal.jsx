import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Calendar as CalendarIcon, Save, Eraser, LogOut, Plus, Trash2, Loader2, ChevronDown } from 'lucide-react';
import SimpleModal from '../../SimpleModal';
import UniversalLookupModal from '../ViewAndUtilityModels/UniversalLookupModal';
import CalendarModal from '../../CalendarModal';
import { transactionEditorService } from '../../../services/transactionEditor.service';
import { getSessionData } from '../../../utils/session';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const TransactionEditorModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState({});
    
    // Header State
    const [transType, setTransType] = useState('');
    const [docNo, setDocNo] = useState('');
    const [vendor, setVendor] = useState({ code: '', name: '' });
    const [payee, setPayee] = useState('');
    const [memo, setMemo] = useState('');
    const [depositor, setDepositor] = useState('');
    const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
    const [chequeDate, setChequeDate] = useState(new Date().toISOString().split('T')[0]);
    const [chequeNo, setChequeNo] = useState('');
    const [paymentAcc, setPaymentAcc] = useState({ code: '', name: '' });
    const [amount, setAmount] = useState('0.00');
    const [creditDebit, setCreditDebit] = useState('');

    // Grid State
    const [rows, setRows] = useState([]);
    const [currentRow, setCurrentRow] = useState({ expAcc: '', costCenter: '', amount: '', memo: '' });

    // Lookup/UI State
    const [showCalendar, setShowCalendar] = useState(null); // 'trans' or 'cheque'
    const [showLookup, setShowLookup] = useState(null); // 'vendor', 'acc', 'doc', 'costCenter'
    const [lookups, setLookups] = useState({ vendors: [], accounts: [], costCenters: [], transTypes: [] });

    useEffect(() => {
        if (isOpen) {
            const data = getSessionData();
            setSession(data);
            fetchLookups(data.companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await transactionEditorService.getLookups(company);
            setLookups(data);
        } catch (error) {
            console.error('Failed to fetch lookups');
        }
    };

    // Removed old toast methods as they are now handled by shared utils

    const handleLoad = async () => {
        if (!docNo || !transType) {
            showErrorToast('Please enter Document No and Transaction Type');
            return;
        }

        setLoading(true);
        try {
            const data = await transactionEditorService.loadTransaction(docNo, transType, sessionData?.companyCode);
            if (data.header) {
                setVendor({ code: data.header.vendorId, name: '' });
                setPayee(data.header.payee || '');
                setMemo(data.header.memo || '');
                setDepositor(data.header.depositor || '');
                setTransDate(data.header.postDate || transDate);
                setChequeDate(data.header.chequeDate || chequeDate);
                setPaymentAcc({ code: data.header.payAccount, name: '' });
                setAmount(data.header.amount || 0);
                setChequeNo(data.header.chequeNo || '');
                
                setRows(data.details.map(d => ({
                    id: d.id,
                    expAcc: d.accCode,
                    costCenter: d.custJob || '', 
                    amount: d.amount,
                    memo: d.memo
                })));
                showSuccessToast('Transaction loaded successfully');
            }
        } catch (error) {
            showErrorToast('Error loading transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = async () => {
        if (!currentRow.expAcc || !currentRow.amount) {
            showErrorToast('Please select an account and enter amount');
            return;
        }

        setLoading(true);
        try {
            await transactionEditorService.saveRow({
                docNo,
                company: sessionData?.companyCode,
                accCode: currentRow.expAcc,
                accName: '', 
                memo: currentRow.memo,
                amount: parseFloat(currentRow.amount),
                costCode: currentRow.costCenter,
                id: currentRow.id ? currentRow.id.toString() : '0'
            });

            // Reload grid
            const data = await transactionEditorService.loadTransaction(docNo, transType, sessionData?.companyCode);
            setRows(data.details.map(d => ({
                id: d.id,
                expAcc: d.accCode,
                costCenter: d.custJob || '',
                amount: d.amount,
                memo: d.memo
            })));

            setCurrentRow({ id: null, expAcc: '', costCenter: '', amount: '', memo: '' });
            showSuccessToast('Row updated successfully');
        } catch (error) {
            showErrorToast('Error saving row');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!docNo) return;
        
        setLoading(true);
        try {
            await transactionEditorService.commitTransaction({
                tranType: transType,
                vendorId: vendor.code,
                vendorName: vendor.name,
                payee,
                memo,
                depositor,
                docNo,
                postDate: transDate,
                chequeDate,
                chequeNo,
                payAccount: paymentAcc.code,
                amount: parseFloat(amount),
                company: sessionData?.companyCode,
                user: sessionData?.empCode
            });
            showSuccessToast('Transaction committed successfully');
            handleClear();
        } catch (error) {
            showErrorToast('Error committing transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setDocNo('');
        setVendor({ code: '', name: '' });
        setPayee('');
        setMemo('');
        setDepositor('');
        setAmount('0.00');
        setChequeNo('');
        setRows([]);
        setCurrentRow({ id: null, expAcc: '', costCenter: '', amount: '', memo: '' });
    };

    const totalAmount = useMemo(() => {
        return rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0).toFixed(2);
    }, [rows]);

    const footer = (
        <div className="flex items-center justify-between w-full px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-xl font-black text-[#0285fd] font-mono tracking-tighter">
                        {totalAmount}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="h-10 px-6 bg-[#28a745] text-white text-[11px] font-black rounded-[5px] uppercase tracking-widest hover:bg-[#218838] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={3} />}
                    Save
                </button>
                <button 
                    onClick={handleClear}
                    className="h-10 px-6 bg-[#0285fd] text-white text-[11px] font-black rounded-[5px] uppercase tracking-widest hover:bg-[#0073ff] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Eraser size={14} strokeWidth={3} />
                    Clear
                </button>
            </div>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="TRANSACTION EDITOR"
                maxWidth="max-w-[1100px]"
                footer={footer}
            >
                <div className="p-6 font-['Tahoma'] select-none">
                    {/* Top Row: Types and IDs */}
                    <div className="grid grid-cols-12 gap-4 mb-6">
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" 
                                    value={transType}
                                    readOnly
                                    onClick={() => setShowLookup('transType')}
                                    className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px] cursor-pointer"
                                />
                                <button onClick={() => setShowLookup('transType')} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-[#0073ff] shadow-md transition-all active:scale-90">
                                    <Search size={14} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document No</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" 
                                    value={docNo}
                                    onChange={(e) => setDocNo(e.target.value)}
                                    className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px] focus:border-[#0285fd]"
                                />
                                <button onClick={handleLoad} className="px-3 bg-[#e49e1b] text-white rounded-[5px] font-bold text-[10px] uppercase tracking-tighter hover:bg-[#cb9b34] transition-all">Load</button>
                            </div>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Date</label>
                            <div className="flex gap-1.5">
                                <input 
                                    type="text" 
                                    value={transDate} 
                                    readOnly 
                                    onClick={() => setShowCalendar('trans')}
                                    className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px] cursor-pointer"
                                />
                                <button 
                                    onClick={() => setShowCalendar('trans')}
                                    className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-[#0073ff] shadow-md transition-all active:scale-90 shrink-0"
                                >
                                    <CalendarIcon size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</label>
                            <input 
                                type="text" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full h-9 border border-slate-200 px-3 bg-slate-50 rounded-[5px] outline-none font-black text-[#0285fd] text-[14px] font-mono text-right"
                            />
                        </div>
                    </div>

                    {/* Middle Section: Vendor/Payee and Cheque */}
                    <div className="grid grid-cols-12 gap-6 mb-6">
                        <div className="col-span-6 space-y-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor / Entity</label>
                                <div className="flex gap-1.5">
                                    <input 
                                        type="text" 
                                        value={vendor.code} 
                                        readOnly 
                                        className="w-24 h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-600 text-[12px]" 
                                    />
                                    <input 
                                        type="text" 
                                        value={vendor.name} 
                                        readOnly 
                                        className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-600 text-[12px]" 
                                    />
                                    <button onClick={() => setShowLookup('vendor')} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-[#0073ff] shadow-sm"><Search size={14}/></button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payee Name</label>
                                <input 
                                    type="text" 
                                    value={payee}
                                    onChange={(e) => setPayee(e.target.value)}
                                    className="w-full h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Memo</label>
                                <textarea 
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    className="w-full h-20 border border-slate-200 p-3 bg-white rounded-[5px] outline-none font-medium text-slate-600 text-[12px] resize-none focus:border-[#0285fd]"
                                />
                            </div>
                        </div>

                        <div className="col-span-6 space-y-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cheque Date</label>
                                    <div className="flex gap-1.5">
                                        <input 
                                            type="text" 
                                            value={chequeDate} 
                                            readOnly 
                                            onClick={() => setShowCalendar('cheque')}
                                            className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px] cursor-pointer"
                                        />
                                        <button 
                                            onClick={() => setShowCalendar('cheque')}
                                            className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-[#0073ff] shadow-md transition-all active:scale-90 shrink-0"
                                        >
                                            <CalendarIcon size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cheque Number</label>
                                    <input 
                                        type="text" 
                                        value={chequeNo}
                                        onChange={(e) => setChequeNo(e.target.value)}
                                        className="w-full h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Account</label>
                                <div className="flex gap-1.5">
                                    <input 
                                        type="text" 
                                        value={paymentAcc.code} 
                                        readOnly 
                                        className="w-24 h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-600 text-[12px]" 
                                    />
                                    <input 
                                        type="text" 
                                        value={paymentAcc.name} 
                                        readOnly 
                                        className="flex-grow h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-600 text-[12px]" 
                                    />
                                    <button onClick={() => setShowLookup('acc')} className="w-9 h-9 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-[#0073ff] shadow-sm"><Search size={14}/></button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depositor</label>
                                <input 
                                    type="text" 
                                    value={depositor}
                                    onChange={(e) => setDepositor(e.target.value)}
                                    className="w-full h-9 border border-slate-200 px-3 bg-white rounded-[5px] outline-none font-bold text-slate-700 text-[12px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#f8fafd] border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Account</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Center</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Memo</th>
                                    <th className="px-4 py-3 w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic opacity-60">
                                            No transaction lines available. Add a line below.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => setCurrentRow(row)}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700">{row.expAcc}</td>
                                            <td className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase">{row.costCenter}</td>
                                            <td className="px-4 py-2.5 text-[12px] font-black text-[#0285fd] font-mono text-right">{parseFloat(row.amount).toFixed(2)}</td>
                                            <td className="px-4 py-2.5 text-[12px] text-slate-500 italic">{row.memo}</td>
                                            <td className="px-4 py-2.5 text-right">
                                                <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Entry Row */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Exp Account</label>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    value={currentRow.expAcc} 
                                    readOnly 
                                    onClick={() => setShowLookup('expAcc')}
                                    className="flex-grow h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-bold text-slate-600 cursor-pointer" 
                                />
                                <button onClick={() => setShowLookup('expAcc')} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[4px] hover:bg-[#0073ff] shadow-sm">
                                    <Search size={14} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cost Center</label>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    value={currentRow.costCenter} 
                                    readOnly 
                                    onClick={() => setShowLookup('costCenter')}
                                    className="flex-grow h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-bold text-slate-600 cursor-pointer" 
                                />
                                <button onClick={() => setShowLookup('costCenter')} className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[4px] shadow-sm transition-all active:scale-90 shrink-0">
                                    <Search size={14} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Amount</label>
                            <input 
                                type="text" 
                                value={currentRow.amount}
                                onChange={(e) => setCurrentRow({...currentRow, amount: e.target.value})}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-black text-[#0285fd] font-mono text-right"
                            />
                        </div>
                        <div className="col-span-3 space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Row Memo</label>
                            <input 
                                type="text" 
                                value={currentRow.memo}
                                onChange={(e) => setCurrentRow({...currentRow, memo: e.target.value})}
                                className="w-full h-8 border border-slate-300 px-2 bg-white rounded-[4px] outline-none text-[11px] font-medium text-slate-600"
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
                    isOpen={!!showCalendar} 
                    onClose={() => setShowCalendar(null)} 
                    onDateSelect={(date) => { 
                        if (showCalendar === 'trans') setTransDate(date);
                        else setChequeDate(date);
                        setShowCalendar(null); 
                    }} 
                    initialDate={showCalendar === 'trans' ? transDate : chequeDate}
                />
            )}

            {showLookup && (
                <UniversalLookupModal
                    isOpen={!!showLookup}
                    onClose={() => setShowLookup(null)}
                    onSelect={(item) => {
                        if (showLookup === 'vendor') setVendor({ code: item.code, name: item.name });
                        else if (showLookup === 'acc') setPaymentAcc({ code: item.code, name: item.name });
                        else if (showLookup === 'expAcc') setCurrentRow({ ...currentRow, expAcc: item.code });
                        else if (showLookup === 'costCenter') setCurrentRow({ ...currentRow, costCenter: item.code });
                        else if (showLookup === 'transType') setTransType(item.code);
                        setShowLookup(null);
                    }}
                    type={
                        showLookup === 'vendor' ? 'supplier' : 
                        showLookup === 'transType' ? 'transType' :
                        showLookup === 'costCenter' ? 'costCenter' :
                        'account'
                    }
                    title={
                        showLookup === 'vendor' ? 'ENTITY LOOKUP' : 
                        showLookup === 'transType' ? 'TRANSACTION TYPE' :
                        showLookup === 'costCenter' ? 'COST CENTER LOOKUP' :
                        'ACCOUNT LOOKUP'
                    }
                    initialData={
                        showLookup === 'vendor' ? lookups.vendors : 
                        showLookup === 'transType' ? lookups.transTypes :
                        showLookup === 'costCenter' ? lookups.costCenters :
                        lookups.accounts
                    }
                />
            )}
        </>
    );
};

export default TransactionEditorModal;
