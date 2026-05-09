import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, RefreshCw, Layers, UserCircle, Briefcase } from 'lucide-react';
import { openingBalanceService } from '../services/openingBalance.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

const OpeningBalanceBoard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Vendor'); // 'Vendor', 'Customer', 'Account'
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ apAccounts: [], arAccounts: [], glAccounts: [], costCenters: [], vendors: [], customers: [] });
    
    const [formData, setFormData] = useState({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        accountCode: '',
        accountName: '',
        payBalance: 0,
        costCenter: '',
        entityId: '',
        entityName: '',
        address: '',
        memo: '',
        openingBalance: 0,
        isDebit: false,
        currentBalance: 0,
        balanceAsAt: new Date().toISOString().split('T')[0],
        company: '',
        createUser: ''
    });

    const [activeModal, setActiveModal] = useState(null); // 'account', 'cc', 'entity'
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
    }, [isOpen, activeTab]);

    const loadInitialData = async (compCode) => {
        try {
            setLoading(true);
            const companyCode = compCode || formData.company;
            const [lookupRes, docRes] = await Promise.all([
                openingBalanceService.getLookups(companyCode),
                openingBalanceService.generateDocNo(activeTab, companyCode)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accountCode: '',
            accountName: '',
            payBalance: 0,
            costCenter: '',
            entityId: '',
            entityName: '',
            address: '',
            memo: '',
            openingBalance: 0,
            isDebit: false,
            currentBalance: 0
        });
        loadInitialData();
    };

    const handleSave = async () => {
        if (!formData.entityId || !formData.accountCode) {
            toast.error(`Please select a ${activeTab} and an account.`);
            return;
        }

        try {
            setLoading(true);
            await openingBalanceService.save({ ...formData, type: activeTab });
            toast.success('Opening Balance saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredLookup = () => {
        if (activeModal === 'account') {
            const list = activeTab === 'Vendor' ? lookups.apAccounts : activeTab === 'Customer' ? lookups.arAccounts : lookups.glAccounts;
            return list.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (activeModal === 'cc') return lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'entity') {
            const list = activeTab === 'Vendor' ? lookups.vendors : lookups.customers;
            return list.filter(e => (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return [];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Opening Balance"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button onClick={loadInitialData} disabled={loading} className="px-6 h-9 bg-white border border-gray-300 text-slate-600 text-[12px] font-bold rounded flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-10 h-9 bg-[#0078d4] text-white text-[12px] font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-10 h-9 bg-white border border-gray-300 text-slate-600 text-[12px] font-bold rounded hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                             <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-10 h-9 bg-white border border-gray-300 text-slate-600 text-[12px] font-bold rounded hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                             <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                {/* Tabs */}
                <div className="mt-[-1rem] mb-6 flex border-b border-gray-200 font-['Plus_Jakarta_Sans']">
                    {[
                        { id: 'Vendor', icon: Briefcase, label: 'Vendor' },
                        { id: 'Customer', icon: UserCircle, label: 'Customer Center' },
                        { id: 'Account', icon: Layers, label: 'Account' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 text-[13px] font-bold flex items-center gap-2.5 transition-all relative ${activeTab === tab.id ? 'text-[#0078d4]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0078d4] animate-in slide-in-from-left duration-300" />}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 font-['Plus_Jakarta_Sans']">
                    <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm space-y-6">
                        
                        <div className="grid grid-cols-12 gap-x-12 gap-y-4">
                            {/* Row 1 */}
                            <div className="col-span-12 lg:col-span-7 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 h-8 border border-[#0078d4]/30 px-3 text-[13px] font-bold text-[#0078d4] bg-blue-50/20 rounded-sm outline-none tracking-widest" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0 uppercase">{activeTab === 'Vendor' ? 'A/P Account' : activeTab === 'Customer' ? 'A/R Account' : 'G/L Account'}</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.accountName ? `${formData.accountCode} - ${formData.accountName}` : ''} 
                                            placeholder={`Select ${activeTab} Account...`} 
                                            className="flex-1 h-8 border border-gray-300 px-3 text-[13px] font-bold rounded-sm bg-gray-50/50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.costCenter ? lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter : ''} 
                                            className="flex-1 h-8 border border-gray-300 px-3 text-[13px] rounded-sm bg-gray-50/50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-95">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-3 text-[13px] outline-none rounded-sm font-bold text-gray-600" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0 italic">Pay. Balance</label>
                                    <input name="payBalance" value={formData.payBalance} onChange={handleInputChange} type="number" step="0.01" className="flex-1 h-8 border-b-2 border-gray-300 px-3 text-[14px] font-bold text-right text-slate-800 bg-gray-50/20 outline-none" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        {/* Entity Select Row (Hidden for G/L Account type if needed, but screenshot shows it for Vendor) */}
                        {activeTab !== 'Account' && (
                            <div className="grid grid-cols-12 gap-x-12 items-center">
                                <div className="col-span-12 lg:col-span-12 flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">{activeTab}</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.entityName ? `${formData.entityId} - ${formData.entityName}` : ''} 
                                            placeholder={`Click search to select ${activeTab.toLowerCase()}...`} 
                                            className="flex-1 h-9 border border-gray-300 px-4 text-[13px] font-bold text-[#b91c1c] rounded-sm bg-gray-50/50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('entity'); setSearchTerm(''); }} className="w-12 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-md active:scale-90">
                                            <Search size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Address</label>
                            <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="flex-1 h-8 border border-gray-300 px-3 text-[13px] rounded-sm bg-gray-50/30 outline-none" />
                        </div>

                        <div className="grid grid-cols-12 gap-x-12 items-start pt-2">
                             <div className="col-span-12 lg:col-span-7 flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-8 border-b border-gray-300 px-3 text-[13px] focus:border-b-[#0078d4] outline-none italic text-gray-500" placeholder="Opening balance remarks..." />
                            </div>
                            <div className="col-span-12 lg:col-span-5 flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Curr. Bal</label>
                                <div className="flex-1 h-8 flex items-center justify-end px-3 bg-red-50 text-[14px] font-black text-[#b91c1c] rounded-sm border border-red-100">
                                    Rs. {formData.currentBalance.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-12 items-center pt-2">
                             <div className="col-span-12 lg:col-span-7 flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">O.P. Balance</label>
                                <div className="flex-1 flex items-center gap-6">
                                    <input name="openingBalance" value={formData.openingBalance} onChange={handleInputChange} type="number" step="0.01" className="w-[180px] h-9 border-b-2 border-[#0078d4] px-2 text-[18px] text-right font-black text-slate-800 bg-blue-50/10 outline-none" placeholder="0.00" />
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFormData(prev => ({ ...prev, isDebit: !prev.isDebit }))}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isDebit ? 'bg-[#0078d4] border-[#0078d4]' : 'bg-white border-gray-300'}`}>
                                            {formData.isDebit && <Check size={10} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-[12px] font-bold text-gray-500">Debit Balance</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-5 flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Balance as at</label>
                                <input name="balanceAsAt" type="date" value={formData.balanceAsAt} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-3 text-[13px] outline-none rounded-sm font-bold text-[#0078d4]" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                {activeModal === 'account' ? 'Search Accounts' : activeModal === 'cc' ? 'Search Cost Centers' : `Search ${activeTab}s`}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by code or name..." 
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
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
                                            if (activeModal === 'account') {
                                                setFormData(prev => ({ ...prev, accountCode: item.code, accountName: item.name }));
                                            } else if (activeModal === 'cc') {
                                                setFormData(prev => ({ ...prev, costCenter: item.code }));
                                            } else {
                                                setFormData(prev => ({ ...prev, entityId: item.code, entityName: item.name, address: item.address || '' }));
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
                                    {filteredLookup().length === 0 && (
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

export default OpeningBalanceBoard;
