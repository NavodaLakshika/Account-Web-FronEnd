import React, { useState, useEffect } from 'react';
import { Search, Calendar, RotateCcw, Save, Trash2, Loader2, Plus, X, CheckCircle, Wallet, ChevronDown } from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { pettyCashService } from '../services/pettyCash.service';


import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const today = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};


const PettyCashBoard = ({ isOpen, onClose }) => {
    const { companyCode: company, userName } = getSessionData();

    const [loading, setLoading]   = useState(false);
    const [lookups, setLookups]   = useState({ pettyAccounts:[], allAccounts:[], products:[], suppliers:[], costCenters:[], customers:[] });
    const safeCC = lookups.costCenters || [];
    const safePetty = lookups.pettyAccounts || [];
    const safeSuppliers = lookups.suppliers || [];
    const safeAccounts = lookups.allAccounts || [];
    const [expenses, setExpenses] = useState([]);
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState('expenses');

    const getInitialForm = () => ({
        docNo:'', isVendor:false, vendorId:'', vendorName:'', payee:'',
        location:'', memo:'', date:today(), vouchNo:'', dueDate:today(),
        refNo:'', billAmount:'0.00', pettyAccCode:'', pettyAccName:'',
        costCenterFrom:'', balance:'0.00',
    });

    const [form, setForm] = useState(getInitialForm());

    const [line, setLine] = useState({ accCode:'', accName:'', amount:'0.00', memo:'', costCode:'', costName:'', idNo:'0' });
    const [itemLine, setItemLine] = useState({ itemId:'', itemName:'', qty:1, cost:'0.00', description:'', custJob:'', idNo:'0' });
    const [vouAmount, setVouAmount] = useState(0);

    // Modals
    const [showCal,  setShowCal]  = useState(false);
    const [calField, setCalField] = useState('date');
    const [showPettyModal,    setShowPettyModal]    = useState(false);
    const [showVendorModal,   setShowVendorModal]   = useState(false);
    const [showAccModal,      setShowAccModal]      = useState(false);
    const [showCCModal,       setShowCCModal]       = useState(false);
    const [showCCFromModal,   setShowCCFromModal]   = useState(false);
    const [showItemModal,     setShowItemModal]     = useState(false);
    const [showDocSearch,     setShowDocSearch]     = useState(false);
    const [savedDocs,         setSavedDocs]         = useState([]);

    // Search states for modals
    const [pettySearch, setPettySearch] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');
    const [accSearch, setAccSearch] = useState('');
    const [ccSearch, setCcSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [docSearchQuery, setDocSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) { 
            setForm(getInitialForm());
            const { companyCode } = getSessionData();
            loadLookups(companyCode); 
            generateDoc(companyCode); 
        }
    }, [isOpen]);

    const loadLookups = async (companyCode) => {
        try { setLookups(await pettyCashService.getLookups(companyCode)); }
        catch { showErrorToast('Failed to load lookup data.'); }
    };

    const generateDoc = async (companyCode) => {
        try {
            const r = await pettyCashService.generateDocNo(companyCode);
            setForm(f => ({ ...f, docNo: r.docNo }));
        } catch { showErrorToast('Failed to generate document number.'); }
    };

    const openCal = (field) => { setCalField(field); setShowCal(true); };
    const handleDate = (val) => setForm(f => ({ ...f, [calField]: val }));

    const differ = () => {
        const b = parseFloat(form.billAmount) || 0;
        return (b - vouAmount).toFixed(2);
    };

    const handleAddExpense = async () => {
        if (!line.accCode) return showErrorToast('Select an expense account.');
        if (!line.costCode) return showErrorToast('Select a cost center.');
        const amt = parseFloat(line.amount) || 0;
        if (amt <= 0) return showErrorToast('Enter a valid amount.');
        setLoading(true);
        try {
            const payload = {
                DocNo: form.docNo, Company: company, Account: form.pettyAccCode,
                VendorId: form.vendorId || '.', Payee: form.payee || '.',
                AccCode: line.accCode, AccName: line.accName,
                Amount: amt, VouAmount: vouAmount + amt,
                Memo: line.memo || '.', CustJob: '', CostCode: line.costCode,
                CostName: line.costName, IdNo: line.idNo,
            };
            const r = await pettyCashService.addExpense(userName, payload);
            setExpenses(r.lines || []);
            setVouAmount(r.totOut || 0);
            setLine({ accCode:'', accName:'', amount:'0.00', memo:'', costCode:'', costName:'', idNo:'0' });
            if ((r.lines||[]).length === 1) await saveHeader(r.totOut);
        } catch(e) { showErrorToast('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    const handleDeleteExpense = async (exp) => {
        setLoading(true);
        try {
            const r = await pettyCashService.deleteExpense(userName, {
                DocNo: form.docNo, Company: company, Account: form.pettyAccCode,
                VendorId: form.vendorId||'.', Payee: form.payee||'.', ExpName: exp.accName, IdNo: exp.idNo,
            });
            setExpenses(r.lines || []);
            setVouAmount(r.totOut || 0);
        } catch(e) { showErrorToast('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    const handleAddItem = async () => {
        if (!itemLine.itemId) return showErrorToast('Select an item.');
        const cost = parseFloat(itemLine.cost) || 0;
        if (cost <= 0) return showErrorToast('Enter a valid cost.');
        setLoading(true);
        try {
            const payload = {
                DocNo: form.docNo, Company: company, Account: form.pettyAccCode,
                VendorId: form.vendorId || '.', Payee: form.payee || '.',
                ItemId: itemLine.itemId, Description: itemLine.description || itemLine.itemName || '.',
                Qty: itemLine.qty, Cost: cost * itemLine.qty, VouAmount: vouAmount + (cost * itemLine.qty),
                Memo: '.', CustJob: itemLine.custJob || '', IdNo: itemLine.idNo,
            };
            const r = await pettyCashService.addItem(userName, payload);
            setItems(r.lines || []);
            setVouAmount(r.totOut || 0);
            setItemLine({ itemId:'', itemName:'', qty:1, cost:'0.00', description:'', custJob:'', idNo:'0' });
            if ((r.lines||[]).length === 1 && expenses.length === 0) await saveHeader(r.totOut);
        } catch(e) { showErrorToast('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    const handleDeleteItem = async (itm) => {
        setLoading(true);
        try {
            const r = await pettyCashService.deleteItem(userName, {
                DocNo: form.docNo, Company: company, VendorId: form.vendorId||'.', Payee: form.payee||'.', ItemId: itm.itemId, IdNo: itm.idNo,
            });
            setItems(r.lines || []);
            setVouAmount(r.totOut || 0);
        } catch(e) { showErrorToast('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    const saveHeader = async (tot) => {
        try {
            await pettyCashService.apply(userName, {
                DocNo: form.docNo, Company: company, Account: form.pettyAccCode,
                PettyAccCode: form.pettyAccCode, Balance: parseFloat(form.balance)||0,
                VendorId: form.vendorId||'.', Payee: form.payee||'.', Location: form.location||'.',
                Memo: form.memo||'.', Date: form.date, VouchNo: form.vouchNo||'.', DueDate: form.dueDate,
                RefNo: form.refNo||'.', BillAmount: parseFloat(form.billAmount)||0, CostCenterFrom: form.costCenterFrom,
            });
        } catch { /* silent */ }
    };

    const handleApply = async () => {
        if (!form.pettyAccCode) return showErrorToast('Select a petty cash account.');
        if (!form.costCenterFrom) return showErrorToast('Select cost center (from).');
        if (expenses.length === 0 && items.length === 0) return showErrorToast('Add at least one expense or item line.');
        if (parseFloat(differ()) !== 0) return showErrorToast(`Bill amount and voucher amount not balanced. Difference: ${differ()}`);
        setLoading(true);
        try {
            const r = await pettyCashService.apply(userName, {
                DocNo: form.docNo, Company: company, Account: form.pettyAccCode,
                PettyAccCode: form.pettyAccCode, Balance: parseFloat(form.balance)||0,
                VendorId: form.vendorId||'.', Payee: form.payee||'.', Location: form.location||'.',
                Memo: form.memo||'.', Date: form.date, VouchNo: form.vouchNo||'.',
                DueDate: form.dueDate, RefNo: form.refNo||'.', BillAmount: parseFloat(form.billAmount)||0,
                CostCenterFrom: form.costCenterFrom,
            });
            showSuccessToast(`${r.orgDocNo} – Saved successfully!`);
            handleClear();
        } catch(e) { showErrorToast('Save failed: ' + (e.response?.data || e.message)); }
        finally { setLoading(false); }
    };

    const handleClear = async () => {
        await pettyCashService.clearDraft(form.docNo, company).catch(()=>{});
        setExpenses([]); setItems([]); setVouAmount(0);
        setLine({ accCode:'', accName:'', amount:'0.00', memo:'', costCode:'', costName:'', idNo:'0' });
        setItemLine({ itemId:'', itemName:'', qty:1, cost:'0.00', description:'', custJob:'', idNo:'0' });
        setForm(f => ({ ...f, isVendor:false, vendorId:'', vendorName:'', payee:'', location:'', memo:'', vouchNo:'', refNo:'', billAmount:'0.00', pettyAccCode:'', pettyAccName:'', costCenterFrom:'' }));
        generateDoc();
    };

    const openDocSearch = async () => {
        const docs = await pettyCashService.searchDocs(company).catch(()=>[]);
        setSavedDocs(docs || []); setShowDocSearch(true);
    };

    const loadDraft = async (d) => {
        try {
            const data = await pettyCashService.getDraft(d.docNo, company);
            const formatDate = (dbDate) => {
                if (!dbDate) return today();
                if (dbDate.includes('/')) return dbDate;
                if (dbDate.includes('-')) {
                    const parts = dbDate.split('T')[0].split('-');
                    if (parts.length === 3) {
                        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }
                }
                return today();
            };

            if (data.header) {
                setForm(f => ({ ...f, docNo: data.header.doc_No, payee: data.header.payee||'', vendorId: data.header.vendor_Id||'', billAmount: data.header.net_Amount||'0.00', vouchNo: data.header.inv_No||'', date: formatDate(data.header.post_Date), memo: data.header.memo||'', location: data.header.location||'', refNo: data.header.reference||'', dueDate: formatDate(data.header.expected_Date), costCenterFrom: data.header.costCenter||'', pettyAccCode: data.header.account||'', isVendor: !!data.header.vendor_Id }));
            }
            setExpenses(data.expenses || []);
            setItems(data.items || []);
            const expTotal = (data.expenses||[]).reduce((a,b)=>a+parseFloat(b.amount||0), 0);
            const itemTotal = (data.items||[]).reduce((a,b)=>a+(parseFloat(b.cost||0)), 0);
            setVouAmount(expTotal + itemTotal);
        } catch { showErrorToast('Failed to load draft'); }
    };

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
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Petty Cash"
                subtitle="Petty Cash Management"
                icon={Wallet}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleApply} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY &amp; SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma']">
                    {/* Header Information Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-2">
                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc No</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="docNo"
                                        value={form.docNo}
                                        readOnly
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        onClick={openDocSearch}
                                    />
                                    <button onClick={openDocSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Balance</label>
                                <div className="w-full h-10 border border-green-200 bg-blue-50/50 px-3 text-[14px] font-bold text-blue-700 text-right flex items-center justify-end rounded-[3px] min-w-[140px]">
                                    {parseFloat(form.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative w-full">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={form.date} 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" 
                                        onClick={() => openCal('date')}
                                    />
                                    <button onClick={() => openCal('date')} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Petty Cash Account</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={safePetty.find(a => a.code === form.pettyAccCode)?.name || ''}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                            onClick={() => setShowPettyModal(true)}
                                        />
                                        <button onClick={() => setShowPettyModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center (From)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={safeCC.find(c => c.code === form.costCenterFrom)?.name || ''}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                            onClick={() => setShowCCFromModal(true)}
                                        />
                                        <button onClick={() => setShowCCFromModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Location</label>
                                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-6 space-y-3.5">
                                <div className="">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[13px] font-medium text-gray-700">Payee / Vendor</label>
                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                            <div onClick={() => setForm(f => ({ ...f, isVendor: !f.isVendor, vendorId: '', vendorName: '', payee: '' }))}
                                                className={`w-8 h-4 rounded-full transition-colors ${form.isVendor ? 'bg-[#0285fd]' : 'bg-gray-300'} relative cursor-pointer`}>
                                                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${form.isVendor ? 'translate-x-[17px]' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">VENDOR</span>
                                        </label>
                                    </div>
                                    {form.isVendor ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={form.vendorName || form.vendorId}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                                onClick={() => setShowVendorModal(true)}
                                                placeholder="Select vendor"
                                            />
                                            <button onClick={() => setShowVendorModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <input value={form.payee} onChange={e => setForm(f => ({ ...f, payee: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Enter payee name" />
                                    )}
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">General Memo</label>
                                    <input value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vouch No</label>
                                        <input value={form.vouchNo} onChange={e => setForm(f => ({ ...f, vouchNo: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                    </div>
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ref No</label>
                                        <input value={form.refNo} onChange={e => setForm(f => ({ ...f, refNo: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bill Amount</label>
                                        <input type="number" value={form.billAmount} onChange={e => setForm(f => ({ ...f, billAmount: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" />
                                    </div>
                                    <div className="">
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Difference</label>
                                        <div className={`w-full h-10 border rounded-[3px] px-3 text-[14px] font-bold text-right flex items-center justify-end ${parseFloat(differ()) !== 0 ? 'border-red-200 bg-red-50/50 text-red-600' : 'border-green-200 bg-blue-50/50 text-blue-700'}`}>
                                            {differ()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs: Expenses / Items */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2 px-2 border-b border-gray-200 pb-2">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setActiveTab('expenses')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'expenses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Expenses
                                </button>
                                <button 
                                    onClick={() => setActiveTab('items')}
                                    className={`text-[13px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'items' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Items Purchase
                                </button>
                            </div>
                            <div className="flex-1 text-right">
                                <span className="text-[11px] font-bold text-gray-400">Voucher Amount: <span className="text-blue-600 font-black">{vouAmount.toFixed(2)}</span></span>
                            </div>
                        </div>

                        {activeTab === 'expenses' && (
                            <>
                                {/* Expense Entry Row */}
                                <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[200px]">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                            <tr>
                                                <th className="px-4 w-[30%]">Expense Account</th>
                                                <th className="px-4 w-[15%] text-right">Amount</th>
                                                <th className="px-4 w-[20%]">Cost Center</th>
                                                <th className="px-4 w-[25%]">Memo</th>
                                                <th className="px-2 w-[5%] text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((exp, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono text-blue-700 uppercase">{exp.accName}</td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-black text-red-600 bg-red-50/10">{parseFloat(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-2.5 font-mono text-gray-400">{exp.costName || exp.costCode || '---'}</td>
                                                    <td className="px-4 py-2.5 italic text-gray-400 font-medium">{exp.memo || '---'}</td>
                                                    <td className="px-2 py-2.5 text-center">
                                                        <button onClick={() => handleDeleteExpense(exp)} className="text-red-300 hover:text-red-500 bg-red-50 p-1.5 rounded-[3px] transition-all active:scale-95"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {expenses.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No expense items added.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Add Expense Line Row */}
                                    <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2 flex gap-3 items-center">
                                        <div className="flex-[2] relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={line.accName || line.accCode}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                                onClick={() => setShowAccModal(true)}
                                                placeholder="Expense Account"
                                            />
                                            <button onClick={() => setShowAccModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <input type="number" value={line.amount} onChange={e => setLine(l => ({ ...l, amount: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" placeholder="Amount" />
                                        </div>
                                        <div className="flex-[1.5] relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={line.costName || line.costCode}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                                onClick={() => setShowCCModal(true)}
                                                placeholder="Cost Center"
                                            />
                                            <button onClick={() => setShowCCModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-[2] flex gap-2">
                                            <input value={line.memo} onChange={e => setLine(l => ({ ...l, memo: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Memo" />
                                            <button onClick={handleAddExpense} disabled={loading} className="h-10 px-6 bg-white border border-[#0285fd] text-[#0285fd] font-semibold rounded-[3px] text-[13px] hover:bg-blue-50 transition-all flex items-center justify-center whitespace-nowrap gap-1">
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'items' && (
                            <>
                                {/* Items Table */}
                                <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[200px]">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                            <tr>
                                                <th className="px-4 w-[5%]">#</th>
                                                <th className="px-4 w-[30%]">Item</th>
                                                <th className="px-4 w-[10%] text-center">Qty</th>
                                                <th className="px-4 w-[13%] text-right">Unit Cost</th>
                                                <th className="px-4 w-[13%] text-right">Total</th>
                                                <th className="px-4 w-[24%]">Description</th>
                                                <th className="px-2 w-[5%] text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((itm, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 text-[12px] font-bold text-gray-700 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono text-gray-300">{idx + 1}</td>
                                                    <td className="px-4 py-2.5 font-mono text-blue-700 uppercase">{itm.itemId}</td>
                                                    <td className="px-4 py-2.5 text-center font-mono text-gray-600">{itm.qty}</td>
                                                    <td className="px-4 py-2.5 text-right font-mono text-gray-600">{parseFloat(itm.cost || 0).toFixed(2)}</td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-black text-red-600 bg-red-50/10">{(parseFloat(itm.cost || 0) * parseInt(itm.qty || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-2.5 italic text-gray-400 font-medium">{itm.description || '---'}</td>
                                                    <td className="px-2 py-2.5 text-center">
                                                        <button onClick={() => handleDeleteItem(itm)} className="text-red-300 hover:text-red-500 bg-red-50 p-1.5 rounded-[3px] transition-all active:scale-95"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No items added.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Add Item Line Row */}
                                    <div className="mt-auto border-t border-slate-200 bg-slate-50 p-2 flex gap-3 items-center">
                                        <div className="flex-[2] relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={itemLine.itemName || itemLine.itemId}
                                                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                                onClick={() => setShowItemModal(true)}
                                                placeholder="Select Item"
                                            />
                                            <button onClick={() => setShowItemModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        <div className="w-20">
                                            <input type="number" value={itemLine.qty} onChange={e => setItemLine(l => ({ ...l, qty: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center" placeholder="Qty" />
                                        </div>
                                        <div className="flex-[1.5]">
                                            <input type="number" value={itemLine.cost} onChange={e => setItemLine(l => ({ ...l, cost: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" placeholder="Cost" />
                                        </div>
                                        <div className="flex-[2] flex gap-2">
                                            <input value={itemLine.description} onChange={e => setItemLine(l => ({ ...l, description: e.target.value }))} type="text" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Description" />
                                            <button onClick={handleAddItem} disabled={loading} className="h-10 px-6 bg-white border border-[#0285fd] text-[#0285fd] font-semibold rounded-[3px] text-[13px] hover:bg-blue-50 transition-all flex items-center justify-center whitespace-nowrap gap-1">
                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </TransactionFormWrapper>

            <CalendarModal isOpen={showCal} onClose={() => setShowCal(false)} onDateSelect={handleDate} initialDate={form[calField]} />

            {/* Petty Account Search Modal */}
            <SimpleModal isOpen={showPettyModal} onClose={() => setShowPettyModal(false)} title={`Petty Cash Accounts - ${safePetty.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={pettySearch} 
                            onChange={(e) => setPettySearch(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safePetty.filter(a => (a.name || '').toLowerCase().includes(pettySearch.toLowerCase()) || (a.code || '').toLowerCase().includes(pettySearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setForm(f => ({ ...f, pettyAccCode: a.code, pettyAccName: a.name }));
                                                setShowPettyModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Search Modal */}
            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title={`Vendors - ${safeSuppliers.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={vendorSearch} 
                            onChange={(e) => setVendorSearch(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Vendor Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeSuppliers.filter(v => (v.name || '').toLowerCase().includes(vendorSearch.toLowerCase()) || (v.code || '').toLowerCase().includes(vendorSearch.toLowerCase())).map((v, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setForm(f => ({ ...f, vendorId: v.code, vendorName: v.name }));
                                                setShowVendorModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title={`Expense Accounts - ${safeAccounts.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={accSearch} 
                            onChange={(e) => setAccSearch(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Account Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeAccounts.filter(a => (a.name || '').toLowerCase().includes(accSearch.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearch.toLowerCase())).map((a, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setLine(l => ({ ...l, accCode: a.code, accName: a.name }));
                                                setShowAccModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center (Line) Search Modal */}
            <SimpleModal isOpen={showCCModal} onClose={() => setShowCCModal(false)} title={`Cost Center Directory - ${safeCC.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={ccSearch} 
                            onChange={(e) => setCcSearch(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Cost Center</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeCC.filter(c => (c.name || '').toLowerCase().includes(ccSearch.toLowerCase()) || (c.code || '').toLowerCase().includes(ccSearch.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setLine(l => ({ ...l, costCode: c.code, costName: c.name }));
                                                setShowCCModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Cost Center From Modal */}
            <SimpleModal isOpen={showCCFromModal} onClose={() => setShowCCFromModal(false)} title={`Cost Center Directory - ${safeCC.length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={docSearchQuery} 
                            onChange={(e) => setDocSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Cost Center</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeCC.filter(c => (c.name || '').toLowerCase().includes(docSearchQuery.toLowerCase()) || (c.code || '').toLowerCase().includes(docSearchQuery.toLowerCase())).map((c, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setForm(f => ({ ...f, costCenterFrom: c.code }));
                                                setShowCCFromModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Item Search Modal */}
            <SimpleModal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={`Items - ${(lookups.products || []).length} Found`}>
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={itemSearch} 
                            onChange={(e) => setItemSearch(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Code</th>
                                    <th className="border-b px-5 py-3">Item Name</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(lookups.products || []).filter(p => (p.name || '').toLowerCase().includes(itemSearch.toLowerCase()) || (p.code || '').toLowerCase().includes(itemSearch.toLowerCase())).map((p, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{p.code}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.name}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => {
                                                setItemLine(l => ({ ...l, itemId: p.code, itemName: p.name, cost: p.price || '0.00', description: p.name }));
                                                setShowItemModal(false);
                                            }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Saved Drafts Search Modal */}
            <SimpleModal isOpen={showDocSearch} onClose={() => setShowDocSearch(false)} title={`Saved Drafts - ${savedDocs.length} Found`} maxWidth="max-w-[700px]">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            className="w-full h-10 px-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm flex-1" 
                            value={docSearchQuery} 
                            onChange={(e) => setDocSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                                <tr>
                                    <th className="border-b px-5 py-3">Doc No</th>
                                    <th className="border-b px-5 py-3">Payee</th>
                                    <th className="border-b px-5 py-3">Date</th>
                                    <th className="border-b text-right px-5 py-3">Amount</th>
                                    <th className="border-b text-center w-24 px-5 py-3">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {savedDocs.filter(d => 
                                    (d.docNo?.toLowerCase() || '').includes(docSearchQuery.toLowerCase()) || 
                                    (d.payee?.toLowerCase() || '').includes(docSearchQuery.toLowerCase())
                                ).map((d, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.docNo}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{d.payee || '---'}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.date?.split('T')[0] || ''}</td>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{parseFloat(d.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                            <button onClick={() => { loadDraft(d); setShowDocSearch(false); }} className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {savedDocs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No saved drafts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default PettyCashBoard;
