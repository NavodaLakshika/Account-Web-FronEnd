import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, X, Save, RotateCcw, Loader2, FileText } from 'lucide-react';
import { customerInvoiceService } from '../services/customerInvoice.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


// ─── Utility ────────────────────────────────────────────────────────────────
const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

// ─── Reusable Search Modal ───────────────────────────────────────────────────
const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = '' }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(
        item =>
            (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[640px]">
            <div className="space-y-4 font-['Tahoma']">
                {/* Search bar */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">
                        Search Facility
                    </span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-sans"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 w-32">Code</th>
                                    <th className="px-5 py-3">Name</th>
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
                                        <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">
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

// ─── Main Component ──────────────────────────────────────────────────────────
const CustomerInvoiceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], accounts: [] });
    const [loading, setLoading] = useState(false);

    // Refs for input elements to handle enter key press order
    const customerInputRef = useRef(null);
    const customerSearchBtnRef = useRef(null);
    const accountInputRef = useRef(null);
    const accountSearchBtnRef = useRef(null);
    const dateInputRef = useRef(null);
    const dateBtnRef = useRef(null);
    const descriptionRef = useRef(null);
    const amountRef = useRef(null);
    const discountRef = useRef(null);
    const saveBtnRef = useRef(null);

    const [formData, setFormData] = useState({
        docNo: '',
        postDate: new Date().toISOString().split('T')[0],
        customerId: '',
        customerName: '',
        description: '',
        amount: '0.00',
        discount: '0.00',
        netAmount: '0.00',
        accountCode: '',
        accountName: '',
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'customer' | 'account'
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ── Toast helpers (AdvancePay style) ─────────────────────────────────────
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({ ...prev, company: companyCode, createUser: userName }));
            fetchLookups(companyCode);
            generateDocNo(companyCode);
            // Autofocus Customer field on load
            setTimeout(() => {
                customerInputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    const fetchLookups = async (companyCode) => {
        try {
            const data = await customerInvoiceService.getLookups(companyCode);
            setLookups({
                customers: data.customers || [],
                accounts: data.accounts || []
            });
        } catch {
            showErrorToast('Failed to load transaction lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await customerInvoiceService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch {
            console.error('Failed to generate document number.');
        }
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'amount' || name === 'discount') {
                const amt = parseFloat(updated.amount) || 0;
                const dis = parseFloat(updated.discount) || 0;
                updated.netAmount = Math.max(0, amt - dis).toFixed(2);
            }
            return updated;
        });
    };

    const handleAmountBlur = () => {
        setFormData(prev => ({
            ...prev,
            amount:    prev.amount ? parseFloat(prev.amount).toFixed(2) : '0.00',
            discount:  prev.discount ? parseFloat(prev.discount).toFixed(2) : '0.00',
            netAmount: prev.netAmount ? parseFloat(prev.netAmount).toFixed(2) : '0.00'
        }));
    };

    const handleSelectCustomer = item => {
        setFormData(prev => ({ ...prev, customerId: item.code, customerName: item.name }));
        // Focus Description input next after selection
        setTimeout(() => {
            descriptionRef.current?.focus();
        }, 100);
    };

    const handleSelectAccount = item => {
        setFormData(prev => ({ ...prev, accountCode: item.code, accountName: item.name }));
        // Focus Save button next after selection
        setTimeout(() => {
            saveBtnRef.current?.focus();
        }, 100);
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            customerId: '', customerName: '',
            description: '',
            amount: '0.00', discount: '0.00', netAmount: '0.00',
            accountCode: '', accountName: ''
        }));
        generateDocNo(formData.company);
        setTimeout(() => {
            customerInputRef.current?.focus();
        }, 100);
    };

    const handleSave = async () => {
        if (!formData.customerId)   return showErrorToast('Customer Code is required.');
        if (!formData.customerName) return showErrorToast('Customer Name is required.');
        if (!formData.description)  return showErrorToast('Description is required.');
        if (!formData.amount || parseFloat(formData.amount) <= 0)
                                    return showErrorToast('A valid Gross Amount is required.');
        if (!formData.accountCode)  return showErrorToast('Account Code is required.');
        if (!formData.accountName)  return showErrorToast('Account Name is required.');

        setLoading(true);
        try {
            const payload = {
                customerId:  formData.customerId,
                description: formData.description,
                amount:      parseFloat(formData.amount)    || 0,
                discount:    parseFloat(formData.discount)  || 0,
                netAmount:   parseFloat(formData.netAmount) || 0,
                postDate:    formData.postDate,
                accountCode: formData.accountCode,
                accountName: formData.accountName,
                company:     formData.company,
                createUser:  formData.createUser
            };
            const resp = await customerInvoiceService.save(payload);
            showSuccessToast(`Invoice saved! Doc ID: ${resp.docNo}`);
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error?.toString() || 'Failed to save invoice.');
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Navigation handler matching WinForms
    const handleKeyDown = (e, nextField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextField === 'customerSearch') {
                setActiveModal('customer');
            } else if (nextField === 'accountSearch') {
                setActiveModal('account');
            } else if (nextField === 'description') {
                descriptionRef.current?.focus();
            } else if (nextField === 'amount') {
                amountRef.current?.focus();
                amountRef.current?.select();
            } else if (nextField === 'discount') {
                handleAmountBlur();
                discountRef.current?.focus();
                discountRef.current?.select();
            } else if (nextField === 'account') {
                handleAmountBlur();
                accountInputRef.current?.focus();
            } else if (nextField === 'save') {
                saveBtnRef.current?.focus();
            }
        }
    };

    return (
        <>
            <style>{`
                @keyframes toastProgress {
                    0%   { width: 100%; }
                    100% { width: 0%;   }
                }
            `}</style>

            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Invoice (Other Invoice)"
                subtitle="Customer Invoices"
                icon={FileText}
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                        {/* Left: Clear */}
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> Clear Form
                        </button>

                        {/* Right: Save */}
                        <button
                            ref={saveBtnRef}
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                {/* ── Form Body ─────────────────────────────────────────────── */}
                <div className="space-y-4 font-['Tahoma']">
                    <div className="bg-white p-5 border border-slate-200 rounded-[5px] shadow-sm space-y-4">
                        
                        {/* Row 1: Customer & Doc ID */}
                        <div className="flex items-center justify-between gap-6">
                            {/* Customer */}
                            <div className="flex-1 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">
                                    Customer <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        ref={customerInputRef}
                                        type="text"
                                        readOnly
                                        value={formData.customerId ? `${formData.customerId} — ${formData.customerName}` : ''}
                                        onKeyDown={e => handleKeyDown(e, 'customerSearch')}
                                        onClick={() => setActiveModal('customer')}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-red-600 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                    />
                                    <button
                                        ref={customerSearchBtnRef}
                                        onClick={() => setActiveModal('customer')}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Doc ID */}
                            <div className="w-[260px] flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-16 shrink-0 text-right pr-2">Doc ID</label>
                                <input
                                    type="text"
                                    value={formData.docNo}
                                    readOnly
                                    className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-blue-600 bg-slate-50 rounded outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Row 2: Account & Date */}
                        <div className="flex items-center justify-between gap-6">
                            {/* Account */}
                            <div className="flex-1 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">
                                    Account <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        ref={accountInputRef}
                                        type="text"
                                        readOnly
                                        value={formData.accountCode ? `${formData.accountCode} — ${formData.accountName}` : ''}
                                        onKeyDown={e => handleKeyDown(e, 'accountSearch')}
                                        onClick={() => setActiveModal('account')}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                    />
                                    <button
                                        ref={accountSearchBtnRef}
                                        onClick={() => setActiveModal('account')}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="w-[260px] flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-16 shrink-0 text-right pr-2">Date</label>
                                <div className="flex-grow flex gap-1 h-8 min-w-0">
                                    <input
                                        ref={dateInputRef}
                                        type="text"
                                        readOnly
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''}
                                        onKeyDown={e => handleKeyDown(e, 'save')}
                                        onClick={() => setShowDatePicker(true)}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-mono font-bold text-slate-700 bg-slate-50 rounded outline-none shadow-sm cursor-pointer"
                                    />
                                    <button
                                        ref={dateBtnRef}
                                        type="button"
                                        onClick={() => setShowDatePicker(true)}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                    >
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Description */}
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={descriptionRef}
                                name="description"
                                type="text"
                                value={formData.description}
                                onChange={handleInputChange}
                                onKeyDown={e => handleKeyDown(e, 'amount')}
                                className="flex-grow h-8 border border-slate-200 px-3 text-[12px] font-mono rounded outline-none bg-slate-50 shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                            />
                        </div>

                        {/* Row 4: Gross Amount, Discount, Net Total */}
                        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-6">
                            {/* Gross Amount */}
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase shrink-0">
                                    Gross Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={amountRef}
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    onBlur={handleAmountBlur}
                                    onKeyDown={e => handleKeyDown(e, 'discount')}
                                    className="w-[140px] h-8 border border-slate-200 px-3 text-[14px] text-right font-black text-slate-800 bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 shadow-sm font-mono"
                                />
                            </div>

                            {/* Discount */}
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Discount</label>
                                <input
                                    ref={discountRef}
                                    name="discount"
                                    type="number"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    onBlur={handleAmountBlur}
                                    onKeyDown={e => handleKeyDown(e, 'account')}
                                    className="w-[140px] h-8 border border-slate-200 px-3 text-[14px] text-right font-black text-[#b91c1c] bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 shadow-sm font-mono"
                                />
                            </div>

                            {/* Net Total Display */}
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 flex-1 justify-end">
                                <label className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider shrink-0">NET TOTAL</label>
                                <div className="w-[160px] h-10 flex items-center justify-end px-4 text-[22px] font-black text-[#0285fd] bg-slate-50 border-b-2 border-[#0285fd] shadow-sm tabular-nums rounded-t-[5px]">
                                    {formData.netAmount || '0.00'}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Lookups Search Modals */}
            <SearchModal
                isOpen={activeModal === 'customer'}
                onClose={() => setActiveModal(null)}
                title="Customer Lookup"
                items={lookups.customers}
                onSelect={handleSelectCustomer}
            />

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title="Account / Category Lookup"
                items={lookups.accounts}
                onSelect={handleSelectAccount}
            />

            {/* Calendar Modal */}
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                initialDate={formData.postDate}
                onDateSelect={date => setFormData(prev => ({ ...prev, postDate: date }))}
            />
        </>
    );
};

export default CustomerInvoiceBoard;
