import React, { useState, useEffect } from 'react';
import { Search, Calendar, RotateCcw, Save, Trash2, Loader2, Plus, X, CheckCircle } from 'lucide-react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { pettyCashService } from '../services/pettyCash.service';
import { toast } from 'react-hot-toast';

const today = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchKey = 'name' }) => {
    const [q, setQ] = useState('');
    if (!isOpen) return null;
    const filtered = items.filter(i => (i.name||'').toLowerCase().includes(q.toLowerCase()) || (i.code||'').toLowerCase().includes(q.toLowerCase()));
    return (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e=>e.stopPropagation()}>
                <div className="bg-[#0285fd] px-5 py-3 flex items-center justify-between">
                    <span className="text-white font-mono font-bold text-xs tracking-widest uppercase">{title}</span>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded"><X size={16}/></button>
                </div>
                <div className="p-3 border-b">
                    <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-400"/>
                </div>
                <div className="overflow-y-auto max-h-64">
                    {filtered.map((item,i)=>(
                        <div key={i} onClick={()=>{onSelect(item);onClose();}} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            <span className="text-[11px] font-mono text-blue-600 w-24 shrink-0">{item.code}</span>
                            <span className="text-[12px] text-gray-700">{item.name}</span>
                        </div>
                    ))}
                    {filtered.length===0 && <div className="text-center text-gray-400 text-sm py-6">No results</div>}
                </div>
            </div>
        </div>
    );
};

const PettyCashBoard = ({ isOpen, onClose }) => {
    const userName = localStorage.getItem('userName') || 'SYSTEM';
    const company  = localStorage.getItem('company')  || 'COM001';

    const [loading, setLoading]   = useState(false);
    const [lookups, setLookups]   = useState({ pettyAccounts:[], allAccounts:[], products:[], suppliers:[], costCenters:[], customers:[] });
    const safeCC = lookups.costCenters || [];
    const safePetty = lookups.pettyAccounts || [];
    const safeSuppliers = lookups.suppliers || [];
    const safeAccounts = lookups.allAccounts || [];
    const [expenses, setExpenses] = useState([]);

    // Header form
    const [form, setForm] = useState({
        docNo:'', isVendor:false, vendorId:'', vendorName:'', payee:'',
        location:'', memo:'', date:today(), vouchNo:'', dueDate:today(),
        refNo:'', billAmount:'0.00', pettyAccCode:'', pettyAccName:'',
        costCenterFrom:'', balance:'0.00',
    });

    // Expense line form
    const [line, setLine] = useState({ accCode:'', accName:'', amount:'0.00', memo:'', costCode:'', costName:'', idNo:'0' });
    const [vouAmount, setVouAmount] = useState(0);

    // Modals
    const [showCal,  setShowCal]  = useState(false);
    const [calField, setCalField] = useState('date');
    const [showPettyModal,    setShowPettyModal]    = useState(false);
    const [showVendorModal,   setShowVendorModal]   = useState(false);
    const [showAccModal,      setShowAccModal]      = useState(false);
    const [showCCModal,       setShowCCModal]       = useState(false);
    const [showCCFromModal,   setShowCCFromModal]   = useState(false);
    const [showDocSearch,     setShowDocSearch]     = useState(false);
    const [savedDocs,         setSavedDocs]         = useState([]);

    useEffect(() => {
        if (isOpen) { loadLookups(); generateDoc(); }
    }, [isOpen]);

    const loadLookups = async () => {
        try { setLookups(await pettyCashService.getLookups(company)); }
        catch { toast.error('Failed to load lookup data.'); }
    };

    const generateDoc = async () => {
        try {
            const r = await pettyCashService.generateDocNo(company);
            setForm(f => ({ ...f, docNo: r.docNo }));
        } catch { toast.error('Failed to generate document number.'); }
    };

    const openCal = (field) => { setCalField(field); setShowCal(true); };
    const handleDate = (val) => setForm(f => ({ ...f, [calField]: val }));

    const differ = () => {
        const b = parseFloat(form.billAmount) || 0;
        return (b - vouAmount).toFixed(2);
    };

    const handleAddExpense = async () => {
        if (!line.accCode) return toast.error('Select an expense account.');
        if (!line.costCode) return toast.error('Select a cost center.');
        const amt = parseFloat(line.amount) || 0;
        if (amt <= 0) return toast.error('Enter a valid amount.');
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
            // Save header if first line
            if ((r.lines||[]).length === 1) await saveHeader(r.totOut);
        } catch(e) { toast.error('Error: ' + e.message); }
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
        } catch(e) { toast.error('Error: ' + e.message); }
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
        } catch { /* silent – apply is done on final save */ }
    };

    const handleApply = async () => {
        if (!form.pettyAccCode) return toast.error('Select a petty cash account.');
        if (!form.costCenterFrom) return toast.error('Select cost center (from).');
        if (expenses.length === 0) return toast.error('Add at least one expense line.');
        if (parseFloat(differ()) !== 0) return toast.error(`Bill amount and voucher amount not balanced. Difference: ${differ()}`);
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
            toast.success(`${r.orgDocNo} – Saved successfully!`);
            handleClear();
        } catch(e) { toast.error('Save failed: ' + (e.response?.data || e.message)); }
        finally { setLoading(false); }
    };

    const handleClear = async () => {
        await pettyCashService.clearDraft(form.docNo, company).catch(()=>{});
        setExpenses([]); setVouAmount(0);
        setLine({ accCode:'', accName:'', amount:'0.00', memo:'', costCode:'', costName:'', idNo:'0' });
        setForm(f => ({ ...f, isVendor:false, vendorId:'', vendorName:'', payee:'', location:'', memo:'', vouchNo:'', refNo:'', billAmount:'0.00', pettyAccCode:'', pettyAccName:'', costCenterFrom:'' }));
        generateDoc();
    };

    const openDocSearch = async () => {
        const docs = await pettyCashService.searchDocs(company).catch(()=>[]);
        setSavedDocs(docs); setShowDocSearch(true);
    };

    const fmtLabel = 'text-[11.5px] font-bold text-gray-600 w-28 shrink-0 font-mono uppercase tracking-wide';
    const fmtInput = 'h-8 border border-gray-200 rounded-md px-2.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-mono bg-white transition-all';

    return (
        <>
        <SimpleModal isOpen={isOpen} onClose={onClose} title="Petty Cash" maxWidth="max-w-[1050px]"
            footer={
                <div className="flex gap-2 w-full justify-end">
                    <button onClick={handleApply} disabled={loading} className="px-5 h-9 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50">
                        {loading ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle size={13}/>} Apply &amp; Save
                    </button>
                    <button onClick={handleClear} disabled={loading} className="px-5 h-9 bg-[#0285fd] hover:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95">
                        <RotateCcw size={13}/> Clear
                    </button>
                </div>
            }>
            <div className="space-y-4 text-[12px] font-['Tahoma']">

                {/* ── Header Row ── */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {/* Doc No */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Doc No</span>
                        <input readOnly value={form.docNo} className={`${fmtInput} w-36 bg-blue-50 text-blue-700 font-bold text-center`}/>
                        <button onClick={openDocSearch} className="w-8 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600 active:scale-95 shadow-sm"><Search size={13}/></button>
                    </div>
                    {/* Balance */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Balance</span>
                        <input readOnly value={form.balance} className={`${fmtInput} w-32 text-green-700 font-bold text-right bg-green-50`}/>
                    </div>

                    {/* Vendor toggle */}
                    <div className="col-span-2 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div onClick={()=>setForm(f=>({...f,isVendor:!f.isVendor,vendorId:'',vendorName:'',payee:''}))}
                                className={`w-10 h-5 rounded-full transition-colors ${form.isVendor?'bg-blue-500':'bg-gray-300'} relative`}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVendor?'translate-x-5':'translate-x-0.5'}`}/>
                            </div>
                            <span className="text-[11.5px] font-bold text-gray-600 font-mono uppercase tracking-wide">Vendor</span>
                        </label>
                        {form.isVendor ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input readOnly value={form.vendorId} placeholder="ID" className={`${fmtInput} w-24`}/>
                                <input readOnly value={form.vendorName} placeholder="Vendor name" className={`${fmtInput} flex-1`}/>
                                <button onClick={()=>setShowVendorModal(true)} className="w-8 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600"><Search size={13}/></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1">
                                <span className={fmtLabel}>Payee</span>
                                <input value={form.payee} onChange={e=>setForm(f=>({...f,payee:e.target.value}))} placeholder="Enter payee name" className={`${fmtInput} flex-1`}/>
                            </div>
                        )}
                    </div>

                    {/* Petty Account */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Petty Acc</span>
                        <input readOnly value={form.pettyAccName||form.pettyAccCode} placeholder="Select account" className={`${fmtInput} flex-1`}/>
                        <button onClick={()=>setShowPettyModal(true)} className="w-8 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600"><Search size={13}/></button>
                    </div>
                    {/* Cost Center From */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>CC From</span>
                        <input readOnly value={safeCC.find(c=>c.code===form.costCenterFrom)?.name||form.costCenterFrom} placeholder="Cost center" className={`${fmtInput} flex-1`}/>
                        <button onClick={()=>setShowCCFromModal(true)} className="w-8 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600"><Search size={13}/></button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Location</span>
                        <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} className={`${fmtInput} flex-1`}/>
                    </div>
                    {/* Memo */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Memo</span>
                        <input value={form.memo} onChange={e=>setForm(f=>({...f,memo:e.target.value}))} className={`${fmtInput} flex-1`}/>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Date</span>
                        <input readOnly value={form.date} className={`${fmtInput} w-32 cursor-pointer`} onClick={()=>openCal('date')}/>
                        <button onClick={()=>openCal('date')} className="w-8 h-8 bg-slate-100 hover:bg-blue-50 text-gray-500 rounded-md flex items-center justify-center"><Calendar size={13}/></button>
                    </div>
                    {/* Vouch No */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Vouch No</span>
                        <input value={form.vouchNo} onChange={e=>setForm(f=>({...f,vouchNo:e.target.value}))} className={`${fmtInput} w-36`}/>
                    </div>

                    {/* Bill Amount */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Bill Amount</span>
                        <input type="number" value={form.billAmount} onChange={e=>setForm(f=>({...f,billAmount:e.target.value}))} className={`${fmtInput} w-32 text-right`}/>
                    </div>
                    {/* Difference */}
                    <div className="flex items-center gap-2">
                        <span className={fmtLabel}>Difference</span>
                        <input readOnly value={differ()} className={`${fmtInput} w-32 text-right font-bold ${parseFloat(differ())!==0?'text-red-600 bg-red-50':'text-green-700 bg-green-50'}`}/>
                        <span className={fmtLabel}>Vou Amt</span>
                        <input readOnly value={vouAmount.toFixed(2)} className={`${fmtInput} w-32 text-right text-blue-700 bg-blue-50`}/>
                    </div>
                </div>

                {/* ── Expense Line Entry ── */}
                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 font-mono">Add Expense Line</div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Account */}
                        <div className="flex items-center gap-1">
                            <input readOnly value={line.accName||line.accCode} placeholder="Expense account" className={`${fmtInput} w-44 cursor-pointer`} onClick={()=>setShowAccModal(true)}/>
                            <button onClick={()=>setShowAccModal(true)} className="w-7 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600"><Search size={11}/></button>
                        </div>
                        {/* Amount */}
                        <input type="number" value={line.amount} onChange={e=>setLine(l=>({...l,amount:e.target.value}))} placeholder="Amount" className={`${fmtInput} w-28 text-right`}/>
                        {/* Cost Center */}
                        <div className="flex items-center gap-1">
                            <input readOnly value={line.costName||line.costCode} placeholder="Cost center" className={`${fmtInput} w-36 cursor-pointer`} onClick={()=>setShowCCModal(true)}/>
                            <button onClick={()=>setShowCCModal(true)} className="w-7 h-8 bg-[#0285fd] text-white rounded-md flex items-center justify-center hover:bg-blue-600"><Search size={11}/></button>
                        </div>
                        {/* Memo */}
                        <input value={line.memo} onChange={e=>setLine(l=>({...l,memo:e.target.value}))} placeholder="Memo" className={`${fmtInput} flex-1 min-w-28`}/>
                        {/* Add */}
                        <button onClick={handleAddExpense} disabled={loading} className="h-8 px-4 bg-[#22c55e] hover:bg-green-600 text-white rounded-md text-[11px] font-bold flex items-center gap-1 active:scale-95 disabled:opacity-50">
                            {loading ? <Loader2 size={11} className="animate-spin"/> : <Plus size={11}/>} Add
                        </button>
                    </div>
                </div>

                {/* ── Expense Lines Grid ── */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[2fr_1fr_1.5fr_2fr_auto] bg-[#0285fd] text-white text-[10px] font-black font-mono uppercase tracking-widest">
                        {['Account','Amount','Cost Center','Memo','Del'].map(h=>(
                            <div key={h} className="px-3 py-2">{h}</div>
                        ))}
                    </div>
                    <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                        {expenses.map((exp,i)=>(
                            <div key={i} className="grid grid-cols-[2fr_1fr_1.5fr_2fr_auto] items-center hover:bg-blue-50/40 transition-colors">
                                <div className="px-3 py-1.5 text-[11.5px] font-mono text-gray-700">{exp.accName}</div>
                                <div className="px-3 py-1.5 text-[11.5px] font-mono text-right text-blue-700">{parseFloat(exp.amount||0).toFixed(2)}</div>
                                <div className="px-3 py-1.5 text-[11px] text-gray-600">{exp.costName||exp.costCode}</div>
                                <div className="px-3 py-1.5 text-[11px] text-gray-500">{exp.memo}</div>
                                <div className="px-2">
                                    <button onClick={()=>handleDeleteExpense(exp)} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                        <Trash2 size={12}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {expenses.length===0 && (
                            <div className="text-center text-gray-400 text-xs py-8 font-mono">No expense lines added</div>
                        )}
                    </div>
                </div>

            </div>
        </SimpleModal>

        {/* Calendars */}
        <CalendarModal isOpen={showCal} onClose={()=>setShowCal(false)} onDateSelect={handleDate} initialDate={form[calField]}/>

        {/* Petty Account Modal */}
        <SearchModal isOpen={showPettyModal} onClose={()=>setShowPettyModal(false)} title="Select Petty Cash Account"
            items={safePetty} onSelect={a=>setForm(f=>({...f,pettyAccCode:a.code,pettyAccName:a.name}))}/>

        {/* Vendor Modal */}
        <SearchModal isOpen={showVendorModal} onClose={()=>setShowVendorModal(false)} title="Select Vendor"
            items={safeSuppliers} onSelect={s=>setForm(f=>({...f,vendorId:s.code,vendorName:s.name}))}/>

        {/* Expense Account Modal */}
        <SearchModal isOpen={showAccModal} onClose={()=>setShowAccModal(false)} title="Select Expense Account"
            items={safeAccounts} onSelect={a=>setLine(l=>({...l,accCode:a.code,accName:a.name}))}/>

        {/* Cost Center (line) Modal */}
        <SearchModal isOpen={showCCModal} onClose={()=>setShowCCModal(false)} title="Select Cost Center"
            items={safeCC} onSelect={c=>setLine(l=>({...l,costCode:c.code,costName:c.name}))}/>

        {/* Cost Center From (header) Modal */}
        <SearchModal isOpen={showCCFromModal} onClose={()=>setShowCCFromModal(false)} title="Select Cost Center (From)"
            items={safeCC} onSelect={c=>setForm(f=>({...f,costCenterFrom:c.code}))}/>

        {/* Doc Search */}
        {showDocSearch && (
            <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={()=>setShowDocSearch(false)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e=>e.stopPropagation()}>
                    <div className="bg-[#0285fd] px-5 py-3 flex items-center justify-between">
                        <span className="text-white font-mono font-bold text-xs tracking-widest uppercase">Saved Drafts</span>
                        <button onClick={()=>setShowDocSearch(false)} className="text-white hover:bg-white/20 p-1 rounded"><X size={16}/></button>
                    </div>
                    <div className="divide-y max-h-72 overflow-y-auto">
                        {savedDocs.map((d,i)=>(
                            <div key={i} onClick={async ()=>{ setShowDocSearch(false); }} className="flex items-center gap-4 px-4 py-2.5 hover:bg-blue-50 cursor-pointer">
                                <span className="font-mono text-xs text-blue-600 w-28">{d.docNo}</span>
                                <span className="text-xs text-gray-600 flex-1">{d.payee}</span>
                                <span className="text-xs text-gray-500">{d.date}</span>
                                <span className="text-xs font-bold text-right text-gray-700">{parseFloat(d.amount||0).toFixed(2)}</span>
                            </div>
                        ))}
                        {savedDocs.length===0 && <div className="text-center text-gray-400 text-sm py-8">No saved drafts</div>}
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PettyCashBoard;
