import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, FileText, CheckCircle2, User, Wallet, History, AlertCircle, Banknote, ShieldAlert } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

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
            toast.error("Failed to load initial search data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCheque = async () => {
        if (!formData.chequeNo && !formData.receiptNo) {
            toast.error("Please enter a Cheque No or Receipt No to fetch record.");
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
                toast.success("Cheque link details retrieved!");
            } else {
                toast.error("No pending or realized customer cheque found for these details.");
            }
        } catch (error) {
            toast.error("Search protocol failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.customerCode || !formData.chequeNo || formData.chequeAmount <= 0) {
            toast.error("Please verify and search for a valid cheque record first.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveChequeReturn(formData);
            toast.success('Customer cheque return processed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Cheque Return Protocol"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={18} />} Return Instrument
                        </button>
                        <button onClick={handleClear} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <RotateCcw size={16} /> Clear
                        </button>
                        <button onClick={onClose} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 font-['Plus_Jakarta_Sans']">
                    {/* Header Section */}
                    <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <History size={160} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-8 relative z-10">
                            {/* Row 1: Document No & Return Date */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Document No</label>
                                <div className="text-[14px] font-black text-[#0078d4] tracking-tight tabular-nums italic bg-blue-50/50 px-3 py-1 rounded border border-blue-100/50">
                                    {formData.docNo}
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 lg:pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Return Date</label>
                                <div className="flex-1 flex items-center px-3 h-9 border border-gray-200 bg-white shadow-sm rounded-sm hover:border-blue-400 transition-colors">
                                    <input type="date" value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={14} className="text-[#0078d4]" />
                                </div>
                            </div>

                            {/* Row 2: Customer */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Customer</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.customerCode} className="w-32 h-9 border border-gray-200 px-4 text-[13px] font-black text-slate-700 rounded-sm bg-slate-50/50" placeholder="CODE" />
                                    <input type="text" readOnly value={formData.customerName} className="flex-1 h-9 border border-gray-200 px-4 text-[13px] font-bold text-slate-700 rounded-sm bg-slate-50/50" placeholder="Select customer to filter cheques..." />
                                    <button onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm group transition-all shadow-md active:scale-90">
                                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Row 3: Cheque No & Receipt No */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cheque No</label>
                                <div className="flex-1 relative group">
                                    <input type="text" value={formData.chequeNo} onChange={e => setFormData({...formData, chequeNo: e.target.value})} className="w-full h-9 border border-gray-200 px-4 text-[14px] font-black text-[#0078d4] rounded-sm bg-white outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="Enter cheque digit suffix..." />
                                    <button onClick={handleSearchCheque} className="absolute right-1 top-1 w-7 h-7 bg-blue-50 text-[#0078d4] flex items-center justify-center rounded hover:bg-[#0078d4] hover:text-white transition-all">
                                        <Search size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 lg:pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Receipt No</label>
                                <input type="text" value={formData.receiptNo} onChange={e => setFormData({...formData, receiptNo: e.target.value})} className="flex-1 h-9 border border-gray-200 px-4 text-[13px] font-bold text-slate-700 rounded-sm outline-none focus:border-blue-300 bg-white shadow-sm" placeholder="Search by linked receipt..." />
                            </div>

                            {/* Row 4: Bank Account */}
                            <div className="col-span-12 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bank Account</label>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={formData.bankName} placeholder="Deposit target bank account..." className="flex-1 h-9 border border-gray-200 px-4 text-[13px] font-bold rounded-sm bg-slate-50/50 outline-none" />
                                    <button onClick={() => { setActiveModal('bank'); setSearchTerm(''); }} className="w-12 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-md active:scale-90">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 5: Cheque Date & Amount */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cheque Date</label>
                                <div className="flex-1 flex items-center px-3 h-9 border border-gray-200 bg-slate-50/50 rounded-sm">
                                    <input type="date" value={formData.chequeDate} readOnly className="flex-1 text-[13px] font-bold text-slate-500 outline-none bg-transparent" />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4 lg:pl-10">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cheque Amount</label>
                                <div className="flex-1 h-11 bg-white border-2 border-slate-100 flex items-baseline gap-2 px-5 rounded shadow-inner">
                                     <span className="text-[11px] font-black text-slate-300 italic">Rs.</span>
                                     <span className="text-[18px] font-black text-red-600 tabular-nums italic">{formData.chequeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>

                            {/* Row 6: Extra Charges & Remarks */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-4">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Extra Charges</label>
                                <div className="flex-1 relative group">
                                     <input type="number" step="0.01" value={formData.extraCharges} onChange={e => setFormData({...formData, extraCharges: parseFloat(e.target.value) || 0})} className="w-full h-11 border border-gray-300 px-5 text-[18px] font-black text-red-700 rounded-sm outline-none focus:border-red-400 tabular-nums shadow-sm transition-all" />
                                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase italic">LKR</span>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-12 flex items-center gap-4 mt-2">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Remarks / Reason</label>
                                <div className="flex-1 relative">
                                    <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full h-10 border border-gray-200 px-4 text-[13px] font-medium italic rounded-sm outline-none focus:border-blue-400 bg-slate-50/20" placeholder="Specific details regarding instrument return (e.g., Insufficient funds, Signature mismatch)..." />
                                    <AlertCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Warning Section */}
                    <div className="bg-orange-50/50 p-6 border-l-4 border-l-orange-400 rounded-sm flex items-start gap-4">
                        <ShieldAlert size={28} className="text-orange-500 shrink-0 mt-1" />
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em]">Operational Financial Warning</h4>
                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                                Processing a customer cheque return will automatically revert the linked receipt valuation and update the customer ledger balance. Extra charges entered above will be debited to the customer's account as an administrative fee.
                            </p>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 uppercase tracking-widest font-black text-[12px] text-slate-500">
                            Search {activeModal === 'customer' ? 'Customer Master' : 'Bank Portfolio'}
                            <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 text-slate-400 rounded-full transition-all group"><X size={28} className="group-hover:scale-110 transition-transform" /></button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Begin typing to filter..." 
                                    className="w-full h-11 border border-gray-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner font-medium" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#f8fafd] sticky top-0 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-4 border-b">Code</th>
                                        <th className="p-4 border-b">Title / Account</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'customer') setFormData({...formData, customerCode: item.code, customerName: item.name});
                                            if (activeModal === 'bank') setFormData({...formData, bankCode: item.code, bankName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-4 border-b font-black text-slate-700">{item.code}</td>
                                            <td className="p-4 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-4 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">IDENTIFY</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerChequeReturnBoard;
