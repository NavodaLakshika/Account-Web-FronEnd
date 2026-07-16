import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, X, Save, RotateCcw, Loader2, FileText } from 'lucide-react';
import { customerInvoiceService } from '../services/customerInvoice.service';
import TransactionReceiptModal from '../components/modals/TransactionReceiptModal';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SearchableSelect from '../components/SearchableSelect';


const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = '' }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(
        item =>
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
                                <tr><th className="w-32 px-5 py-3">Code</th><th className=" px-5 py-3">Name</th><th className="text-right px-5 py-3">Action</th></tr>
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

const CustomerInvoiceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], accounts: [] });
    const [loading, setLoading] = useState(false);

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

    const getInitialFormData = () => ({
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

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [receiptTx, setReceiptTx] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({ ...prev, company: companyCode, createUser: userName }));
            fetchLookups(companyCode);
            generateDocNo(companyCode);
            setTimeout(() => { customerInputRef.current?.focus(); }, 300);
        }
    }, [isOpen]);

    const fetchLookups = async (companyCode) => {
        try {
            const data = await customerInvoiceService.getLookups(companyCode);
            setLookups({ customers: data.customers || [], accounts: data.accounts || [] });
        } catch { showErrorToast('Failed to load transaction lookups.'); }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await customerInvoiceService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch { console.error('Failed to generate document number.'); }
    };

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
            amount: prev.amount ? parseFloat(prev.amount).toFixed(2) : '0.00',
            discount: prev.discount ? parseFloat(prev.discount).toFixed(2) : '0.00',
            netAmount: prev.netAmount ? parseFloat(prev.netAmount).toFixed(2) : '0.00'
        }));
    };

    const handleSelectCustomer = item => {
        setFormData(prev => ({ ...prev, customerId: item.code, customerName: item.name }));
        setTimeout(() => { descriptionRef.current?.focus(); }, 100);
    };

    const handleSelectAccount = item => {
        setFormData(prev => ({ ...prev, accountCode: item.code, accountName: item.name }));
        setTimeout(() => { saveBtnRef.current?.focus(); }, 100);
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
        setTimeout(() => { customerInputRef.current?.focus(); }, 100);
    };

    const handleSave = async () => {
        if (!formData.customerId) return showErrorToast('Customer Code is required.');
        if (!formData.customerName) return showErrorToast('Customer Name is required.');
        if (!formData.description) return showErrorToast('Description is required.');
        if (!formData.amount || parseFloat(formData.amount) <= 0) return showErrorToast('A valid Gross Amount is required.');
        if (!formData.accountCode) return showErrorToast('Account Code is required.');
        if (!formData.accountName) return showErrorToast('Account Name is required.');

        setLoading(true);
        try {
            const payload = {
                customerId: formData.customerId,
                description: formData.description,
                amount: parseFloat(formData.amount) || 0,
                discount: parseFloat(formData.discount) || 0,
                netAmount: parseFloat(formData.netAmount) || 0,
                postDate: formData.postDate,
                accountCode: formData.accountCode,
                accountName: formData.accountName,
                company: formData.company,
                createUser: formData.createUser
            };
            const resp = await customerInvoiceService.save(payload);
            showSuccessToast(`Invoice saved! Doc ID: ${resp.docNo}`);
            setReceiptTx({
                type: 'CUSTOMER INVOICE',
                docNo: resp.docNo,
                date: formData.postDate,
                payee: formData.customerName,
                total: parseFloat(formData.netAmount),
                details: {
                    header: { memo: formData.description },
                    expenses: [
                        { accCode: formData.accountCode, memo: formData.description, amount: parseFloat(formData.amount) },
                        parseFloat(formData.discount) > 0 ? { accCode: "DISCOUNT", memo: "Trade Discount", amount: -parseFloat(formData.discount) } : null
                    ].filter(Boolean)
                }
            });
            handleClear();
        } catch (error) {
            showErrorToast(error?.toString() || 'Failed to save invoice.');
        } finally { setLoading(false); }
    };

    const handleKeyDown = (e, nextField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextField === 'customerSearch') { setActiveModal('customer'); }
            else if (nextField === 'accountSearch') { setActiveModal('account'); }
            else if (nextField === 'description') { descriptionRef.current?.focus(); }
            else if (nextField === 'amount') { amountRef.current?.focus(); amountRef.current?.select(); }
            else if (nextField === 'discount') { handleAmountBlur(); discountRef.current?.focus(); discountRef.current?.select(); }
            else if (nextField === 'account') { handleAmountBlur(); accountInputRef.current?.focus(); }
            else if (nextField === 'save') { saveBtnRef.current?.focus(); }
        }
    };

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen} onClose={onClose}
                title="Customer Invoice (Other Invoice)"
                subtitle="Customer Invoices" icon={null}
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button ref={saveBtnRef} onClick={handleSave} disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save &amp; Apply
                        </button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Customer */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.customerId}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.customers || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = handleSelectCustomer;
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-[#0285fd] font-mono cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.customers || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Doc ID */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>

                            {/* Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.accountCode}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const item = (lookups.accounts || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || i === val);
                                            if (item) {
                                                const handler = handleSelectAccount;
                                                handler(item);
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(lookups.accounts || []).map((item, idx) => (
                                            <option key={idx} value={item.code || item.name || item}>
                                                {item.code ? `${item.code} - ${item.name}` : (item.name || item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input ref={dateInputRef} type="text" readOnly
                                        value={formData.postDate ? formatDateToDMY(formData.postDate) : ''}
                                        onKeyDown={e => handleKeyDown(e, 'save')}
                                        onClick={() => setShowDatePicker(true)}
                                        placeholder="Select date..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer"
                                    />
                                    <button ref={dateBtnRef} onClick={() => setShowDatePicker(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                                <input ref={descriptionRef} name="description" type="text"
                                    value={formData.description} onChange={handleInputChange}
                                    onKeyDown={e => handleKeyDown(e, 'amount')}
                                    placeholder="Enter description..."
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px]">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Gross Amount <span className="text-red-500">*</span></label>
                                <input ref={amountRef} name="amount" type="number" step="0.01"
                                    value={formData.amount} onChange={handleInputChange}
                                    onBlur={handleAmountBlur} onKeyDown={e => handleKeyDown(e, 'discount')}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] font-mono" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Discount</label>
                                <input ref={discountRef} name="discount" type="number" step="0.01"
                                    value={formData.discount} onChange={handleInputChange}
                                    onBlur={handleAmountBlur} onKeyDown={e => handleKeyDown(e, 'account')}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] text-right font-black text-[#b91c1c] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] font-mono" />
                            </div>
                            <div className="col-span-4 flex items-end justify-end">
                                <div className="flex items-center gap-3 pb-1">
                                    <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider">NET TOTAL</span>
                                    <span className="min-w-[120px] h-10 flex items-center justify-end px-4 text-[22px] font-black text-[#0285fd] bg-slate-50 border-b-2 border-[#0285fd] rounded-t-[3px] tabular-nums">
                                        {formData.netAmount || '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal isOpen={activeModal === 'customer'} onClose={() => setActiveModal(null)}
                title="Customer Lookup" items={lookups.customers} onSelect={handleSelectCustomer}
                searchPlaceholder="Find customer..." />

            <SearchModal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)}
                title="Account / Category Lookup" items={lookups.accounts} onSelect={handleSelectAccount}
                searchPlaceholder="Find account..." />

            <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}
                initialDate={formData.postDate}
                onDateSelect={date => setFormData(prev => ({ ...prev, postDate: date }))} />

            {receiptTx && (
                <TransactionReceiptModal
                    selectedTx={receiptTx}
                    onClose={() => { setReceiptTx(null); onClose(); }}
                />
            )}
        </>
    );
};

export default CustomerInvoiceBoard;
