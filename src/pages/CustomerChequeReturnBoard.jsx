import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, FileText, CheckCircle2, User, Wallet, History, AlertCircle, Banknote, ShieldAlert } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const CustomerChequeReturnBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ customers: [], banks: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        returnDate: new Date().toISOString().split('T')[0],
        customerCode: '',
        customerName: '',
        chequeNo: '',
        receiptNo: '',
        bankCode: '',
        bankName: '',
        chequeDate: new Date().toISOString().split('T')[0],
        chequeAmount: 0,
        extraCharges: 0,
        remarks: '',
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'customer', 'bank'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
            loadInitialData(companyCode);
        }
    }, [isOpen]);

    const loadInitialData = async (compCode) => {
        try {
            setLoading(true);
            const activeComp = compCode || formData.company;
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getCustomerChequeLookups(activeComp),
                bankingService.generateDocNo('CHR', activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial search data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!formData.chequeNo && !formData.receiptNo) {
            showErrorToast("Please enter a Cheque No or Receipt No to fetch record.");
            return;
        }

        try {
            setLoading(true);
            const cheque = await bankingService.findCustomerCheque({
                chequeNo: formData.chequeNo,
                receiptNo: formData.receiptNo,
                company: formData.company
            });

            if (cheque) {
                setFormData(prev => ({
                    ...prev,
                    customerCode: cheque.customerCode,
                    customerName: cheque.customerName || 'N/A',
                    chequeDate: cheque.chequeDate,
                    chequeAmount: cheque.chequeAmount,
                    bankCode: cheque.bankCode,
                    bankName: cheque.bankName,
                    receiptNo: cheque.receiptNo,
                    chequeNo: cheque.chequeNo
                }));
                showSuccessToast("Cheque link details retrieved!");
            } else {
                showErrorToast("No pending or realized customer cheque found for these details.");
            }
        } catch (error) {
            showErrorToast("Search protocol failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.customerCode || !formData.chequeNo || formData.chequeAmount <= 0) {
            showErrorToast("Please verify and search for a valid cheque record first.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeReturn(formData);
            showSuccessToast('Customer cheque return processed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            customerCode: '',
            customerName: '',
            chequeNo: '',
            receiptNo: '',
            bankCode: '',
            bankName: '',
            chequeDate: new Date().toISOString().split('T')[0],
            chequeAmount: 0,
            extraCharges: 0,
            remarks: ''
        });
        loadInitialData();
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal === 'customer') return lookups.customers.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        if (activeModal === 'bank') return lookups.banks.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        return [];
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Cheque Return Protocol"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} RETURN INSTRUMENT
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-[5px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <History size={160} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            {/* Row 1: Document No & Return Date */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Document No</label>
                                <div className="flex-1 flex items-center">
                                    <div className="text-[14px] font-black text-[#0285fd] tracking-tight tabular-nums italic bg-blue-50/50 px-3 py-1 rounded-[5px] border border-blue-100/50">
                                        {formData.docNo}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0 text-right">Return Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.returnDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowDatePicker(true)} />
                                    <button onClick={() => setShowDatePicker(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: Customer */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.customerName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 3: Cheque No & Receipt No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Cheque No</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" value={formData.chequeNo} onChange={e => setFormData({...formData, chequeNo: e.target.value})} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" />
                                    <button onClick={handleSearchCheque} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Receipt No</label>
                                <input type="text" value={formData.receiptNo} onChange={e => setFormData({...formData, receiptNo: e.target.value})} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono" />
                            </div>

                            {/* Row 4: Bank Account */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Bank Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.bankName} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 5: Cheque Date & Amount */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Cheque Date</label>
                                <input type="date" value={formData.chequeDate} readOnly className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-gray-700 outline-none bg-slate-100" />
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Cheque Amount</label>
                                <div className="flex-1 flex items-baseline gap-2 px-3 h-8 bg-slate-100 border border-slate-200 rounded">
                                     <span className="text-[9px] font-black text-slate-400 italic">Rs.</span>
                                     <span className="text-[13px] font-mono font-black text-[#0285fd] tabular-nums italic py-1.5">{formData.chequeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>

                            {/* Row 6: Extra Charges & Remarks */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Extra Charges</label>
                                <div className="flex-1 relative min-w-0 group">
                                     <input type="number" step="0.01" value={formData.extraCharges} onChange={e => setFormData({...formData, extraCharges: parseFloat(e.target.value) || 0})} className="w-full h-8 border border-red-200 px-3 text-[14px] font-mono font-black text-red-600 rounded shadow-inner outline-none focus:border-[#f04e3e] tabular-nums transition-all" />
                                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase italic">LKR</span>
                                </div>
                            </div>
                            
                            <div className="col-span-12 flex items-center gap-2 pt-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Remarks / Reason</label>
                                <div className="flex-1 relative">
                                    <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-mono italic rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                    <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Warning Section */}
                    <div className="bg-orange-50/50 p-4 border-l-[3px] border-l-[#f04e3e] rounded-[5px] flex items-start gap-4">
                        <ShieldAlert size={24} className="text-[#f04e3e] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-[#f04e3e] tracking-widest font-mono">Operational Financial Warning</h4>
                            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                Processing a customer cheque return will automatically revert the linked receipt valuation and update the customer ledger balance. Extra charges entered above will be debited to the customer's account as an administrative fee.
                            </p>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            <SimpleModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={`Lookup Directory`}
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Record Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (activeModal === 'customer') setFormData({...formData, customerCode: item.code, customerName: item.name});
                                            if (activeModal === 'bank') setFormData({...formData, bankCode: item.code, bankName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{item.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{item.name}</td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
            
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.returnDate}
                onDateSelect={(date) => setFormData({...formData, returnDate: date})}
            />
        </>
    );
};

export default CustomerChequeReturnBoard;
