import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Calendar as CalendarIcon, Save, Eraser, LogOut, Plus, Trash2, Loader2, ChevronDown, FileText, RotateCcw } from 'lucide-react';
import TransactionFormWrapper from '../../TransactionFormWrapper';
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
        if (!docNo) {
            showErrorToast('Please enter a Document No or load a transaction first');
            return;
        }
        
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
        <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex gap-3">
                <button type="button" onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> CLEAR FORM
                </button>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex flex-col mr-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</span>
                    <span className="text-xl font-black text-[#0285fd] font-mono tracking-tighter text-right">
                        {totalAmount}
                    </span>
                </div>
                <button type="button" onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE TRANSACTION
                </button>
            </div>
        </div>
    );

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="TRANSACTION EDITOR"
                subtitle="Edit Transactions"
                icon={FileText}
                footer={footer}
            >
                <div className="select-none font-['Tahoma']">
                    {/* Header Information Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4 mb-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 border-b border-slate-200 pb-4">
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Transaction Type</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={transType}
                                        readOnly
                                        onClick={() => setShowLookup('transType')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                    />
                                    <button onClick={() => setShowLookup('transType')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document No</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={docNo}
                                        onChange={(e) => setDocNo(e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-20"
                                    />
                                    <button onClick={handleLoad} className="absolute right-1 top-1.5 bottom-1.5 px-3 flex items-center justify-center text-blue-600 font-bold bg-blue-50 border border-blue-100 rounded-[2px] cursor-pointer hover:bg-blue-100 text-[11px] uppercase tracking-wider">
                                        Load
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Transaction Date</label>
                                <div className="relative w-full">
                                    <input 
                                        type="text" 
                                        value={transDate} 
                                        readOnly 
                                        onClick={() => setShowCalendar('trans')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                    />
                                    <button onClick={() => setShowCalendar('trans')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <CalendarIcon size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Amount</label>
                                <div className="w-full h-10 border border-gray-200 bg-blue-50/30 px-3 text-[14px] font-bold text-[#0285fd] text-right flex items-center justify-end rounded-[3px]">
                                    <input 
                                        type="text" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full h-full bg-transparent border-none outline-none font-bold text-[#0285fd] font-mono text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Vendor/Payee and Cheque */}
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 pt-2">
                            <div className="col-span-6 space-y-3.5">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor / Entity</label>
                                    <div className="relative flex gap-2">
                                        <input 
                                            type="text" 
                                            value={vendor.code} 
                                            readOnly 
                                            className="w-[100px] h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none text-gray-500 font-mono" 
                                        />
                                        <div className="relative flex-grow">
                                            <input 
                                                type="text" 
                                                value={vendor.name} 
                                                readOnly 
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                                onClick={() => setShowLookup('vendor')}
                                            />
                                            <button onClick={() => setShowLookup('vendor')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payee Name</label>
                                    <input 
                                        type="text" 
                                        value={payee}
                                        onChange={(e) => setPayee(e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Transaction Memo</label>
                                    <textarea 
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        className="w-full h-[104px] border border-gray-300 p-3 bg-white rounded-[3px] outline-none text-[14px] text-gray-700 resize-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]"
                                    />
                                </div>
                            </div>

                            <div className="col-span-6 space-y-3.5">
                                <div className="grid grid-cols-2 gap-x-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Date</label>
                                        <div className="relative w-full">
                                            <input 
                                                type="text" 
                                                value={chequeDate} 
                                                readOnly 
                                                onClick={() => setShowCalendar('cheque')}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                            />
                                            <button onClick={() => setShowCalendar('cheque')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <CalendarIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cheque Number</label>
                                        <input 
                                            type="text" 
                                            value={chequeNo}
                                            onChange={(e) => setChequeNo(e.target.value)}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Account</label>
                                    <div className="relative flex gap-2">
                                        <input 
                                            type="text" 
                                            value={paymentAcc.code} 
                                            readOnly 
                                            className="w-[100px] h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none text-gray-500 font-mono" 
                                        />
                                        <div className="relative flex-grow">
                                            <input 
                                                type="text" 
                                                value={paymentAcc.name} 
                                                readOnly 
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                                onClick={() => setShowLookup('acc')}
                                            />
                                            <button onClick={() => setShowLookup('acc')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Depositor</label>
                                    <input 
                                        type="text" 
                                        value={depositor}
                                        onChange={(e) => setDepositor(e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4">
                                <button className="text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all border-blue-600 text-blue-600">
                                    Transaction Lines
                                </button>
                            </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col mb-4">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-5 w-[25%]">Expense Account</th>
                                        <th className="px-5 w-[25%]">Cost Center</th>
                                        <th className="px-5 w-[15%] text-right">Amount</th>
                                        <th className="px-5 w-[25%]">Memo</th>
                                        <th className="px-5 w-[10%] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center h-[120px] align-middle text-gray-300 font-black text-[11px] uppercase tracking-widest">
                                                No transaction lines available. Add a line below.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => setCurrentRow(row)}
                                                className="border-b border-gray-50 text-[12px] font-bold text-gray-700 transition-colors hover:bg-slate-50/50 cursor-pointer group"
                                            >
                                                <td className="px-5 py-2.5 uppercase align-middle group-hover:text-blue-600">{row.expAcc}</td>
                                                <td className="px-5 py-2.5 uppercase align-middle group-hover:text-blue-600">{row.costCenter}</td>
                                                <td className="px-5 py-2.5 font-mono text-blue-700 text-right align-middle">{parseFloat(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-5 py-2.5 uppercase align-middle group-hover:text-blue-600 truncate max-w-[200px]">{row.memo}</td>
                                                <td className="px-5 py-2.5 text-right align-middle">
                                                    <button className="text-gray-300 hover:text-red-500 transition-colors bg-transparent border-none"><Trash2 size={15}/></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            
                            {/* Entry Row within the table box for a cleaner look */}
                            <div className="border-t border-slate-200 bg-slate-50 p-3 grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-3">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Exp Account</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={currentRow.expAcc} 
                                            readOnly 
                                            onClick={() => setShowLookup('expAcc')}
                                            className="w-full h-9 border border-gray-300 px-3 bg-white rounded-[3px] outline-none text-[12px] font-bold text-gray-700 cursor-pointer pr-10" 
                                        />
                                        <button onClick={() => setShowLookup('expAcc')} className="absolute right-1 top-1 bottom-1 w-7 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Cost Center</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={currentRow.costCenter} 
                                            readOnly 
                                            onClick={() => setShowLookup('costCenter')}
                                            className="w-full h-9 border border-gray-300 px-3 bg-white rounded-[3px] outline-none text-[12px] font-bold text-gray-700 cursor-pointer pr-10" 
                                        />
                                        <button onClick={() => setShowLookup('costCenter')} className="absolute right-1 top-1 bottom-1 w-7 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Amount</label>
                                    <input 
                                        type="text" 
                                        value={currentRow.amount}
                                        onChange={(e) => setCurrentRow({...currentRow, amount: e.target.value})}
                                        className="w-full h-9 border border-gray-300 px-3 bg-white rounded-[3px] outline-none text-[12px] font-bold text-blue-700 font-mono text-right focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Row Memo</label>
                                    <input 
                                        type="text" 
                                        value={currentRow.memo}
                                        onChange={(e) => setCurrentRow({...currentRow, memo: e.target.value})}
                                        className="w-full h-9 border border-gray-300 px-3 bg-white rounded-[3px] outline-none text-[12px] font-medium text-gray-700 focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <button 
                                        onClick={handleAddRow}
                                        className="w-full h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] shadow-sm transition-all active:scale-95 border-none"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

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
