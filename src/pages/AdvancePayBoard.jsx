import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import { advancePayService } from '../services/advancePay.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

const AdvancePayBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ vendors: [], payAccounts: [], costCenters: [] });
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        venderId: '',
        apAccount: '',
        costCenter: '',
        address: '',
        voucherNo: '',
        refNo: '',
        memo: '',
        amount: '',
        isOnline: false,
        isCheque: false,
        chequeNo: '',
        chequeDate: new Date().toISOString().split('T')[0],
        company: '',
        createUser: ''
    });

    // Search Modal States
    const [activeModal, setActiveModal] = useState(null); // 'vendor', 'account', 'cc'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const { companyCode, userName } = getSessionData();

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            
            fetchLookups();
            generateDocNo(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await advancePayService.getLookups();
            // Data structure mapping from PayBill lookups
            setLookups({
                vendors: data.vendors || [],
                payAccounts: data.chqAccounts || [], // Assuming A/P accounts come from chq/bank accounts for advance
                costCenters: data.costCenters || []
            });
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async (compCode) => {
        try {
            const data = await advancePayService.generateDocNo(compCode || formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            console.error('Failed to generate doc number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            venderId: '',
            apAccount: '',
            costCenter: '',
            address: '',
            voucherNo: '',
            refNo: '',
            memo: '',
            amount: '',
            isOnline: false,
            isCheque: false,
            chequeNo: '',
            chequeDate: new Date().toISOString().split('T')[0],
        });
        setSearchTerm('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.venderId) return toast.error('Vender is required.');
        if (!formData.apAccount) return toast.error('A/P Account is required.');
        if (!formData.amount || parseFloat(formData.amount) <= 0) return toast.error('Valid Amount is required.');

        setLoading(true);
        try {
            await advancePayService.save(formData);
            toast.success('Advance Payment processed successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredData = () => {
        if (activeModal === 'vendor') return lookups.vendors.filter(v => (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (v.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'account') return lookups.payAccounts.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'cc') return lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Advance Pay"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Inter']">
                    {/* Header Row (Doc No and Date) */}
                    <div className="bg-white p-4 border border-gray-200 rounded-sm shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-12 gap-y-4">
                            
                            {/* Left Side Main Fields */}
                            <div className="col-span-7 space-y-3">
                                {/* A/P Account */}
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">A/P Account</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.payAccounts.find(a => a.code === formData.apAccount)?.name ? `${formData.apAccount} - ${lookups.payAccounts.find(a => a.code === formData.apAccount)?.name}` : ''} 
                                            placeholder="Select A/P Account..." 
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] rounded-sm outline-none bg-gray-50 font-medium" 
                                        />
                                        <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Vender */}
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Vender</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.vendors.find(v => v.code === formData.venderId)?.name || ''} 
                                            placeholder="Select Vender..." 
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-gray-50 font-bold text-[#b91c1c]" 
                                        />
                                        <button onClick={() => { setActiveModal('vendor'); setSearchTerm(''); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Cost Center */}
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.costCenters.find(c => c.code === formData.costCenter)?.name || ''} 
                                            placeholder="Select Cost Center..." 
                                            className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-gray-50" 
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-8 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0 mt-1">Address</label>
                                    <textarea 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        rows="2" 
                                        className="flex-1 border border-gray-300 px-2 py-1 text-[13px] rounded-sm outline-none bg-white resize-none" 
                                    />
                                </div>

                                {/* Memo */}
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                    <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-[#0078d4] outline-none" />
                                </div>
                            </div>

                            {/* Right Side Header Fields */}
                            <div className="col-span-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[13px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm outline-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none text-gray-700 bg-white" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Vouch No</label>
                                    <input name="voucherNo" value={formData.voucherNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Ref No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center gap-8">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleInputChange} className="w-4 h-4 text-[#0078d4] rounded focus:ring-0" />
                                    <span className="text-[13px] font-bold text-gray-700">Online Payment</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-12 gap-x-12 gap-y-3 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-16 shrink-0">Amount</label>
                                    <input name="amount" value={formData.amount} onChange={handleInputChange} type="number" step="0.01" className="flex-1 h-8 border-b-2 border-gray-300 px-2 text-[15px] text-right font-black text-[#b91c1c] outline-none focus:border-[#0078d4]" placeholder="0.00" />
                                </div>
                                
                                <div className="col-span-4 flex items-center gap-3 px-4 border-l border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                        <input type="checkbox" name="isCheque" checked={formData.isCheque} onChange={handleInputChange} className="w-4 h-4 text-[#0078d4] rounded focus:ring-0" />
                                        <span className="text-[13px] font-bold text-gray-700">Cheque No</span>
                                    </label>
                                    <input name="chequeNo" value={formData.chequeNo} onChange={handleInputChange} disabled={!formData.isCheque} type="text" className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none disabled:bg-gray-100 disabled:opacity-50" />
                                </div>

                                <div className="col-span-4 flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0 text-right">Cheq Date</label>
                                    <input name="chequeDate" type="date" value={formData.chequeDate} onChange={handleInputChange} disabled={!formData.isCheque} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none disabled:bg-gray-100 disabled:opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection/Search Modal Wrapper */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                {activeModal === 'vendor' ? 'Search Venders' : activeModal === 'account' ? 'Search A/P Accounts' : 'Search Cost Centers'}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by name or code..." 
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                                <button 
                                    onClick={() => setActiveModal(null)} 
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'vendor') {
                                                setFormData(prev => ({ ...prev, venderId: item.code, address: item.address || '' }));
                                            } else if (activeModal === 'account') {
                                                setFormData(prev => ({ ...prev, apAccount: item.code }));
                                            } else {
                                                setFormData(prev => ({ ...prev, costCenter: item.code }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 border-b font-medium text-gray-700">{item.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{item.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic">No results found for "{searchTerm}"</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvancePayBoard;
