import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, RefreshCw, Layers, UserCircle, Briefcase } from 'lucide-react';
import { openingBalanceService } from '../services/openingBalance.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


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
            showErrorToast("Failed to load initial data");
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
            showErrorToast(`Please select a ${activeTab} and an account.`);
            return;
        }

        try {
            setLoading(true);
            await openingBalanceService.save({ ...formData, type: activeTab });
            showSuccessToast('Opening Balance saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
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
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 rounded-b-[5px]">
                        <button onClick={loadInitialData} disabled={loading} className="px-8 h-10 bg-white border-2 border-slate-200 text-slate-500 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
                        </button>
                        <button onClick={handleSave} disabled={loading} className={`px-8 h-10 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-8 h-10 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                             <RotateCcw size={14} /> CLEAR
                        </button>
                        <button onClick={onClose} className="px-8 h-10 bg-white border-2 border-red-100 text-red-500 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                             <X size={14} strokeWidth={3} /> EXIT
                        </button>
                    </div>
                }
            >
                {/* Tabs */}
                <div className="mt-[-1rem] mb-6 flex border-b border-gray-200">
                    {[
                        { id: 'Vendor', icon: Briefcase, label: 'Vendor' },
                        { id: 'Customer', icon: UserCircle, label: 'Customer Center' },
                        { id: 'Account', icon: Layers, label: 'Account' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 text-[12px] uppercase tracking-widest font-bold flex items-center gap-2.5 transition-all relative ${activeTab === tab.id ? 'text-[#00adff]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00adff] animate-in slide-in-from-left duration-300" />}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-6 border border-slate-200 rounded-[5px] shadow-sm space-y-6">
                        
                        <div className="grid grid-cols-12 gap-x-12 gap-y-4">
                            {/* Row 1 */}
                            <div className="col-span-12 lg:col-span-7 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 h-8 border border-[#00adff]/30 px-3 text-[12px] font-bold text-[#00adff] bg-blue-50/20 rounded-[5px] outline-none tracking-widest" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 w-24 shrink-0 uppercase tracking-widest">{activeTab === 'Vendor' ? 'A/P Account' : activeTab === 'Customer' ? 'A/R Account' : 'G/L Account'}</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.accountName ? `${formData.accountCode} - ${formData.accountName}` : ''} 
                                            placeholder={`Select ${activeTab} Account...`} 
                                            className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 rounded-[5px] bg-slate-50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white rounded-[5px] flex items-center justify-center transition-all active:scale-95 shadow-sm border-none">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.costCenter ? lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter : ''} 
                                            className="flex-1 h-8 border border-slate-200 px-3 text-[12px] font-bold text-slate-700 rounded-[5px] bg-slate-50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white rounded-[5px] flex items-center justify-center transition-all active:scale-95 shadow-sm border-none">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32 shrink-0">Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 rounded-[5px] px-3 text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32 shrink-0">Pay. Balance</label>
                                    <input name="payBalance" value={formData.payBalance} onChange={handleInputChange} type="number" step="0.01" className="flex-1 h-8 border-b border-slate-200 px-3 text-[14px] font-bold text-right text-slate-700 bg-slate-50 outline-none focus:border-b-[#00D1FF] transition-all" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        {/* Entity Select Row */}
                        {activeTab !== 'Account' && (
                            <div className="grid grid-cols-12 gap-x-12 items-center">
                                <div className="col-span-12 lg:col-span-12 flex items-center gap-3">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">{activeTab}</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.entityName ? `${formData.entityId} - ${formData.entityName}` : ''} 
                                            placeholder={`Click search to select ${activeTab.toLowerCase()}...`} 
                                            className="flex-1 h-8 border border-slate-200 rounded-[5px] px-3 text-[12px] font-bold text-slate-700 bg-white outline-none shadow-sm placeholder-slate-400" 
                                        />
                                        <button onClick={() => { setActiveModal('entity'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white rounded-[5px] flex items-center justify-center transition-all active:scale-95 shadow-sm border-none">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">Address</label>
                            <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="flex-1 h-8 border border-slate-200 rounded-[5px] px-3 text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm" />
                        </div>

                        <div className="grid grid-cols-12 gap-x-12 items-start pt-2">
                             <div className="col-span-12 lg:col-span-7 flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">Memo</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-8 border border-slate-200 rounded-[5px] px-3 text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm" placeholder="Opening balance remarks..." />
                            </div>
                            <div className="col-span-12 lg:col-span-5 flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32 shrink-0">Curr. Bal</label>
                                <div className="flex-1 h-8 flex items-center justify-end px-3 bg-red-50 text-[14px] font-black text-red-600 rounded-[5px] border border-red-100 shadow-sm">
                                    Rs. {formData.currentBalance.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-x-12 items-center pt-2">
                             <div className="col-span-12 lg:col-span-7 flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">O.P. Balance</label>
                                <div className="flex-1 flex items-center gap-6">
                                    <input name="openingBalance" value={formData.openingBalance} onChange={handleInputChange} type="number" step="0.01" className="w-[180px] h-9 border-b-2 border-[#00adff] px-2 text-[18px] text-right font-black text-slate-800 bg-blue-50/20 outline-none" placeholder="0.00" />
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFormData(prev => ({ ...prev, isDebit: !prev.isDebit }))}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isDebit ? 'bg-[#00adff] border-[#00adff]' : 'bg-white border-slate-300'}`}>
                                            {formData.isDebit && <Check size={10} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Debit Balance</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-5 flex items-center gap-3">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-32 shrink-0">Balance as at</label>
                                <input name="balanceAsAt" type="date" value={formData.balanceAsAt} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 rounded-[5px] px-3 text-[12px] font-bold text-[#00adff] bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm" />
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
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                {activeModal === 'account' ? 'Search Accounts' : activeModal === 'cc' ? 'Search Cost Centers' : `Search ${activeTab}s`}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by code or name..." 
                                    className="h-8 border border-slate-200 px-3 text-[12px] rounded-[5px] w-64 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                                <button 
                                    onClick={() => setActiveModal(null)} 
                                    className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[5px] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200">Code</th>
                                        <th className="p-3 border-b border-slate-200">Name</th>
                                        <th className="p-3 border-b border-slate-200 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0" onClick={() => {
                                            if (activeModal === 'account') {
                                                setFormData(prev => ({ ...prev, accountCode: item.code, accountName: item.name }));
                                            } else if (activeModal === 'cc') {
                                                setFormData(prev => ({ ...prev, costCenter: item.code }));
                                            } else {
                                                setFormData(prev => ({ ...prev, entityId: item.code, entityName: item.name, address: item.address || '' }));
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="p-3 font-medium text-slate-700 text-[11px]">{item.code}</td>
                                            <td className="p-3 font-medium uppercase text-[#00adff] text-[11px]">{item.name}</td>
                                            <td className="p-3 text-center">
                                                <button className="bg-[#0285fd] text-white text-[10px] px-3 py-1.5 rounded-[5px] font-bold hover:bg-[#0073ff] tracking-wider uppercase transition-all shadow-sm">Select</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic text-[12px]">No results found for "{searchTerm}"</td></tr>
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
