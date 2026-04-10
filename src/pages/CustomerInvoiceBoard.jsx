import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import { customerInvoiceService } from '../services/customerInvoice.service';
import { toast } from 'react-hot-toast';

const CustomerInvoiceBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ customers: [], accounts: [] });
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        customerId: '',
        description: '',
        amount: '0.00',
        discount: '0.00',
        netAmount: '0.00',
        accountId: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [activeModal, setActiveModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            generateDocNo();

            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';

            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await customerInvoiceService.getLookups();
            setLookups({
                customers: data.customers || [],
                accounts: data.incomeAccounts || data.accounts || []
            });
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async () => {
        try {
            const data = await customerInvoiceService.generateDocNo(formData.company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            console.error('Failed to gen doc no');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'amount' || name === 'discount') {
                const amt = parseFloat(newState.amount) || 0;
                const disc = parseFloat(newState.discount) || 0;
                newState.netAmount = (amt - disc).toFixed(2);
            }
            return newState;
        });
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            customerId: '',
            description: '',
            amount: '0.00',
            discount: '0.00',
            netAmount: '0.00',
            accountId: ''
        });
        setSearchTerm('');
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.customerId) return toast.error('Customer is required.');
        if (!formData.accountId) return toast.error('Account is required.');
        if (parseFloat(formData.netAmount) <= 0) return toast.error('Valid net amount is required.');

        setLoading(true);
        try {
            await customerInvoiceService.save(formData);
            toast.success('Invoice saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredData = () => {
        if (activeModal === 'customer') return lookups.customers.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'account') return lookups.accounts.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Invoice (Other Invoice)"
                maxWidth="max-w-3xl"
                footer={
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={handleSave} disabled={loading} className={`px-6 h-9 bg-[#0078d4] text-white text-xs font-bold rounded shadow-sm hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-6 h-9 bg-white border border-gray-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-9 bg-white border border-gray-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-3 font-['Plus_Jakarta_Sans']">
                    {/* Form Body Container */}
                    <div className="bg-white p-4 border border-gray-100 rounded shadow-sm space-y-4">
                        
                        {/* Doc Number & Date Display */}
                        <div className="flex justify-between items-center bg-gray-50/50 p-2.5 border border-gray-100 rounded">
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Trans No</span>
                                <span className="text-[14px] font-black text-[#b91c1c] tracking-widest">{formData.docNo}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700">Date</label>
                                <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="h-7 border border-gray-300 px-2 text-[13px] font-bold text-gray-700 rounded-sm outline-none bg-white shadow-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            
                            {/* Main Data Column */}
                            <div className="col-span-12 space-y-4">
                                {/* Customer Selection */}
                                <div className="space-y-1">
                                    <label className="text-[13px] font-bold text-gray-700 pl-1">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={lookups.customers.find(c => c.code === formData.customerId)?.name || ''} 
                                            placeholder="Select Customer..." 
                                            className="flex-1 h-8 border border-gray-300 px-3 text-[13px] font-bold text-[#b91c1c] rounded-sm outline-none bg-gray-50/50" 
                                        />
                                        <button onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                     {/* Account Selection */}
                                    <div className="space-y-1">
                                        <label className="text-[13px] font-bold text-gray-700 pl-1">
                                            Account / Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-1">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={lookups.accounts.find(a => a.code === formData.accountId)?.name ? `${formData.accountId} - ${lookups.accounts.find(a => a.code === formData.accountId)?.name}` : ''} 
                                                placeholder="Select Account..." 
                                                className="flex-1 h-8 border border-gray-300 px-3 text-[13px] font-medium text-gray-600 rounded-sm outline-none bg-gray-50/50" 
                                            />
                                            <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                                <Search size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1">
                                        <label className="text-[13px] font-bold text-gray-700 pl-1">Description</label>
                                        <input 
                                            name="description" 
                                            type="text"
                                            value={formData.description} 
                                            onChange={handleInputChange} 
                                            placeholder="Entry narrative..."
                                            className="w-full h-8 border border-gray-300 px-3 text-[13px] font-medium text-gray-700 rounded-sm outline-none bg-white focus:border-[#0078d4] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary / Calculations Column */}
                            <div className="col-span-12 bg-gray-50/50 p-4 rounded border border-gray-100 flex items-center justify-between">
                                <div className="flex flex-1 items-center gap-8">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[13px] font-bold text-gray-500">Gross</label>
                                        <input 
                                            name="amount" 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.amount} 
                                            onChange={handleInputChange} 
                                            className="w-[120px] h-8 border border-gray-300 px-2 text-right text-[14px] font-bold text-gray-800 rounded-sm outline-none bg-white shadow-sm" 
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 px-6 border-l border-gray-200">
                                        <label className="text-[13px] font-bold text-gray-500">Discount</label>
                                        <input 
                                            name="discount" 
                                            type="number" 
                                            step="0.01" 
                                            value={formData.discount} 
                                            onChange={handleInputChange} 
                                            className="w-[120px] h-8 border border-gray-300 px-2 text-right text-[14px] font-bold text-[#b91c1c] rounded-sm outline-none bg-white shadow-sm" 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pl-10 border-l border-gray-200">
                                    <label className="text-[14px] font-black text-slate-700 uppercase tracking-widest leading-none ml-[-30px]">Net Total</label>
                                    <div className="min-w-[140px] h-9 flex items-center justify-end px-3 text-[18px] font-black text-[#0078d4] bg-white border-b-2 border-[#0078d4] shadow-sm tabular-nums ml-[-10px]">
                                        {formData.netAmount}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modal (Universal Search) */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                                {activeModal === 'customer' ? 'Search Customers' : 'Search Accounts'}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Type to filter..." 
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none font-medium" 
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
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Title</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'customer') {
                                                setFormData(prev => ({ ...prev, customerId: item.code }));
                                            } else {
                                                setFormData(prev => ({ ...prev, accountId: item.code }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 border-b font-medium text-gray-700">{item.code}</td>
                                            <td className="p-3 border-b font-bold uppercase text-blue-600">{item.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-black tracking-widest hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic">No matches found for "{searchTerm}"</td></tr>
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

export default CustomerInvoiceBoard;
