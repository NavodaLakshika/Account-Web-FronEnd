import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, CheckSquare, Square, Filter, Banknote, ListChecks } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const CollectionToDepositBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ costCenters: [], paymentModes: [], customers: [], departments: [] });
    
    // Form States
    const [formData, setFormData] = useState({
        docNo: '',
        costCenter: '',
        costCenterName: '',
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        paymentMode: '',
        customerReceipt: false,
        customerId: '',
        customerName: '',
        department: '',
        departmentName: '',
        company: 'C001',
        createUser: 'SYSTEM'
    });

    const [collections, setCollections] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModal, setActiveModal] = useState(null); // 'costCenter', 'paymentMode', 'customer', 'dept'

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            
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

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const companyCode = formData.company || 'C001';
            const [lookupRes, docRes] = await Promise.all([
                bankingService.getCollectionLookups(companyCode),
                bankingService.generateDocNo(companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleFetchCollections = async () => {
        try {
            setLoading(true);
            const data = await bankingService.getCollections(formData);
            setCollections(data);
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to fetch collections records");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === collections.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(collections.map(c => c.id || c.documentNo));
        }
    };

    const totalToDeposit = collections
        .filter(c => selectedIds.includes(c.id || c.documentNo))
        .reduce((sum, c) => sum + (c.balance || 0), 0);

    const handleSave = async () => {
        if (selectedIds.length === 0) {
            toast.error("Please select at least one record to deposit.");
            return;
        }

        try {
            setLoading(true);
            await bankingService.saveDeposit({
                ...formData,
                items: collections.filter(c => selectedIds.includes(c.id || c.documentNo)),
                totalAmount: totalToDeposit
            });
            toast.success('Funds successfully moved to deposit state!');
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
            costCenter: '',
            costCenterName: '',
            paymentMode: '',
            customerReceipt: false,
            customerId: '',
            customerName: '',
            department: '',
            departmentName: ''
        });
        setCollections([]);
        setSelectedIds([]);
        loadInitialData();
    };

    const filteredLookup = () => {
        if (activeModal === 'costCenter') return lookups.costCenters.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'paymentMode') return lookups.paymentModes.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'customer') return lookups.customers.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'dept') return lookups.departments.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Collection to Deposit"
                maxWidth="max-w-[1200px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />} Done
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
                    {/* Filter Section */}
                    <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <Landmark size={150} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-8 relative z-10">
                            {/* Left Column */}
                            <div className="col-span-12 lg:col-span-7 space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Document No</label>
                                    <input type="text" value={formData.docNo} readOnly className="h-9 border border-gray-300 px-4 text-[13px] font-black text-[#0078d4] bg-blue-50/20 rounded-sm outline-none" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Cost center</label>
                                    <div className="flex-1 flex gap-2">
                                        <input type="text" readOnly value={formData.costCenterName} placeholder="Select Cost Center..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                        <button onClick={() => { setActiveModal('costCenter'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm group transition-all">
                                            <Search size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">View Payment Mode</label>
                                    <div className="flex-1 flex gap-2">
                                        <input type="text" readOnly value={formData.paymentMode} placeholder="Filter by Payment Mode..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                        <button onClick={() => { setActiveModal('paymentMode'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-sm active:scale-90">
                                            <Filter size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">View Cust. Receipt</label>
                                    <div className="flex-1 flex gap-3 items-center">
                                         <input type="checkbox" checked={formData.customerReceipt} onChange={e => setFormData({...formData, customerReceipt: e.target.checked})} className="w-5 h-5 accent-[#0078d4] rounded" />
                                         <div className={`flex-1 flex gap-2 transition-opacity duration-300 ${!formData.customerReceipt ? 'opacity-30 pointer-events-none' : ''}`}>
                                            <input type="text" readOnly value={formData.customerName} placeholder="Select Customer..." className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                            <button onClick={() => { setActiveModal('customer'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-sm active:scale-90">
                                                <Search size={16} />
                                            </button>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-12 lg:col-span-5 space-y-4 lg:pl-10 lg:border-l lg:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 w-24">Date From</label>
                                    <input type="date" value={formData.dateFrom} onChange={e => setFormData({...formData, dateFrom: e.target.value})} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-slate-700 rounded-sm focus:border-blue-500 shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 w-24">Date To</label>
                                    <input type="date" value={formData.dateTo} onChange={e => setFormData({...formData, dateTo: e.target.value})} className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-slate-700 rounded-sm focus:border-blue-500 shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-black uppercase text-slate-400 w-24">Department</label>
                                    <div className="flex-1 flex gap-2">
                                        <input type="text" readOnly value={formData.departmentName} placeholder="All Departments" className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold rounded-sm bg-gray-50/20 outline-none" />
                                        <button onClick={() => { setActiveModal('dept'); setSearchTerm(''); }} className="w-10 h-9 bg-slate-800 text-white flex items-center justify-center hover:bg-black rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button onClick={handleFetchCollections} className="px-10 h-10 bg-blue-50 text-[#0078d4] border border-blue-200 text-sm font-bold rounded shadow-sm hover:bg-blue-100 transition-all flex items-center gap-2">
                                        <Filter size={16} /> Refresh Records
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collection Grid */}
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
                        <div className="bg-slate-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ListChecks size={18} className="text-[#0078d4]" />
                                <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-[0.2em]">Pending Collections Tracking</h4>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Check All Records</span>
                                <div onClick={toggleSelectAll} className={`w-10 h-5 rounded-full transition-all relative ${selectedIds.length === collections.length && collections.length > 0 ? 'bg-[#0078d4]' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedIds.length === collections.length && collections.length > 0 ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>
                        </div>
                        <div className="h-[350px] overflow-y-auto">
                            <table className="w-full text-left text-[12px] border-collapse sticky-header">
                                <thead className="bg-[#f8f9fa] border-b border-gray-200 font-bold text-gray-600 uppercase tracking-tighter">
                                    <tr>
                                        <th className="w-12 px-6 py-3 border-r">#</th>
                                        <th className="px-6 py-3 border-r">Document No</th>
                                        <th className="px-6 py-3 border-r">Date</th>
                                        <th className="px-6 py-3 border-r">Type</th>
                                        <th className="px-6 py-3 border-r">Reference</th>
                                        <th className="px-6 py-3 border-r text-right">Amount</th>
                                        <th className="px-6 py-3 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-['Inter']">
                                    {collections.map((c, i) => (
                                        <tr key={c.id || c.documentNo} onClick={() => toggleSelect(c.id || c.documentNo)} className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${selectedIds.includes(c.id || c.documentNo) ? 'bg-blue-50 border-l-4 border-l-[#0078d4]' : ''}`}>
                                            <td className="px-6 py-3 text-center">
                                                {selectedIds.includes(c.id || c.documentNo) ? <CheckSquare size={16} className="text-[#0078d4] mx-auto" /> : <Square size={16} className="text-gray-200 mx-auto" />}
                                            </td>
                                            <td className="px-6 py-3 font-bold text-gray-700">{c.documentNo}</td>
                                            <td className="px-6 py-3 text-gray-500">{c.date}</td>
                                            <td className="px-6 py-3"><span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black rounded-lg uppercase text-slate-500">{c.type}</span></td>
                                            <td className="px-6 py-3 text-gray-500 italic">{c.reference || 'N/A'}</td>
                                            <td className="px-6 py-3 text-right font-medium">{c.amount?.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-right font-black text-[#0078d4]">{c.balance?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {collections.length === 0 && <tr><td colSpan={7} className="p-24 text-center text-gray-300 font-medium italic">Wait... Loading pending collection records or please adjust filters and refresh.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        {/* Summary Footer */}
                        <div className="bg-slate-50 p-6 border-t border-gray-200 flex justify-end items-center">
                             <div className="flex flex-col items-end">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total To Be Deposited Amount</span>
                                <div className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter flex items-baseline gap-2">
                                    <span className="text-[14px] font-bold text-slate-400 italic">Rs.</span>
                                    {totalToDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Search {activeModal}</h3>
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="w-10 h-10 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={20} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type to filter list..." 
                                    className="w-full h-11 border border-gray-100 pl-11 pr-4 text-sm rounded-lg focus:border-blue-500 outline-none shadow-inner" 
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
                                        <th className="p-4 border-b">Name</th>
                                        <th className="p-4 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'costCenter') setFormData({...formData, costCenter: item.code, costCenterName: item.name});
                                            if (activeModal === 'paymentMode') setFormData({...formData, paymentMode: item.name});
                                            if (activeModal === 'customer') setFormData({...formData, customerId: item.code, customerName: item.name});
                                            if (activeModal === 'dept') setFormData({...formData, department: item.code, departmentName: item.name});
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-4 border-b font-black text-slate-700">{item.code || '---'}</td>
                                            <td className="p-4 border-b font-bold text-[#0078d4] uppercase tracking-tight">{item.name}</td>
                                            <td className="p-4 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-5 py-2 rounded-sm font-black hover:bg-[#005a9e] tracking-widest">SELECT</button>
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

const CheckCircle2 = ({ size, className }) => (
    <Landmark size={size} className={className} />
);

export default CollectionToDepositBoard;
