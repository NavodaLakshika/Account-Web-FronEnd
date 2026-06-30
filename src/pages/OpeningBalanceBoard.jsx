import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, Check, Save, RotateCcw, Loader2 } from 'lucide-react';
import { openingBalanceService } from '../services/openingBalance.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import CalendarModal from '../components/CalendarModal';
import OpeningBalanceDetailModal from '../components/OpeningBalanceDetailModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const SearchModal = ({ isOpen, onClose, title, items, onSelect, searchPlaceholder = "Search by code or name..." }) => {
    const [query, setQuery] = useState('');
    const filtered = (items || []).filter(item =>
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
                                <tr><th className="w-32 px-5 py-3">Identifier</th><th className=" px-5 py-3">Credential / Name</th><th className="text-right px-5 py-3">Action</th></tr>
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

const OpeningBalanceBoard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('Vendor');
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ apAccounts: [], arAccounts: [], glAccounts: [], costCenters: [], vendors: [], customers: [] });

    const getInitialFormData = () => ({
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

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showBalanceDateModal, setShowBalanceDateModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
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
            setReceiptData({ ...formData, type: activeTab });
            setShowReceipt(true);
            handleClear();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const getAccountItems = () => {
        if (activeTab === 'Vendor') return lookups.apAccounts;
        if (activeTab === 'Customer') return lookups.arAccounts;
        return lookups.glAccounts;
    };

    const getEntityItems = () => {
        if (activeTab === 'Vendor') return lookups.vendors;
        return lookups.customers;
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Opening Balances" icon={null}
                isOpen={isOpen}
                onClose={onClose}
                title="Opening Balance"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Clear Form
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save &amp; Apply
                        </button>
                    </div>
                }
            >
                {/* Tabs */}
                <div className="mt-[-1rem] mb-6 flex border-b border-gray-200">
                    {[
                        { id: 'Vendor', label: 'Vendor' },
                        { id: 'Customer', label: 'Customer Center' },
                        { id: 'Account', label: 'Account' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 text-[12px] uppercase tracking-widest font-bold flex items-center gap-2.5 transition-all relative ${activeTab === tab.id ? 'text-[#0285fd]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0285fd] animate-in slide-in-from-left duration-300" />}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Row 1 */}
                            {/* Doc No */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Doc ID</label>
                                <input type="text" value={formData.docNo} readOnly
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono truncate" />
                            </div>

                            {/* Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date}
                                        onClick={() => setShowDateModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowDateModal(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Pay. Balance */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay. Balance</label>
                                <input name="payBalance" value={formData.payBalance} onChange={handleInputChange} type="number" step="0.01"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" placeholder="0.00" />
                            </div>

                            {/* Account */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{activeTab === 'Vendor' ? 'A/P Account' : activeTab === 'Customer' ? 'A/R Account' : 'G/L Account'}</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={formData.accountName ? `${formData.accountCode} - ${formData.accountName}` : ''}
                                        placeholder={`Select ${activeTab} Account...`}
                                        onClick={() => setActiveModal('account')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setActiveModal('account')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Cost Center */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={formData.costCenter ? lookups.costCenters.find(c => c.code === formData.costCenter)?.name || formData.costCenter : ''}
                                        placeholder="Select cost center..."
                                        onClick={() => setActiveModal('cc')}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setActiveModal('cc')}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Entity Select */}
                            {activeTab !== 'Account' && (
                                <div className="col-span-8">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{activeTab}</label>
                                    <div className="relative">
                                        <input type="text" readOnly
                                            value={formData.entityName ? `${formData.entityId} - ${formData.entityName}` : ''}
                                            placeholder={`Click search to select ${activeTab.toLowerCase()}...`}
                                            onClick={() => setActiveModal('entity')}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                        <button onClick={() => setActiveModal('entity')}
                                            className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            <div className={activeTab !== 'Account' ? 'col-span-4' : 'col-span-8'}>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address</label>
                                <input name="address" value={formData.address} onChange={handleInputChange} type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            {/* Memo */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Memo</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" placeholder="Opening balance remarks..." />
                            </div>

                            {/* Curr. Bal */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Curr. Bal</label>
                                <div className="w-full h-10 flex items-center justify-end px-3 bg-red-50 text-[14px] font-black text-red-600 rounded-[3px] border border-red-100">
                                    Rs. {formData.currentBalance.toLocaleString()}
                                </div>
                            </div>

                            {/* O.P. Balance */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">O.P. Balance</label>
                                <div className="flex items-center gap-6">
                                    <input name="openingBalance" value={formData.openingBalance} onChange={handleInputChange} type="number" step="0.01"
                                        className="w-[200px] h-10 border border-gray-300 rounded-[3px] px-3 text-[16px] text-right font-black text-gray-800 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" placeholder="0.00" />
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFormData(prev => ({ ...prev, isDebit: !prev.isDebit }))}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isDebit ? 'bg-[#0285fd] border-[#0285fd]' : 'bg-white border-gray-300'}`}>
                                            {formData.isDebit && <Check size={10} className="text-white" strokeWidth={4} />}
                                        </div>
                                        <span className="text-[13px] font-medium text-gray-700">Debit Balance</span>
                                    </div>
                                </div>
                            </div>

                            {/* Balance as at */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Balance as at</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.balanceAsAt}
                                        onClick={() => setShowBalanceDateModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" />
                                    <button onClick={() => setShowBalanceDateModal(true)}
                                        className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SearchModal
                isOpen={activeModal === 'account'}
                onClose={() => setActiveModal(null)}
                title={`Select ${activeTab === 'Vendor' ? 'A/P' : activeTab === 'Customer' ? 'A/R' : 'G/L'} Account`}
                items={getAccountItems()}
                onSelect={(item) => { setFormData(prev => ({ ...prev, accountCode: item.code, accountName: item.name })); }}
            />

            <SearchModal
                isOpen={activeModal === 'cc'}
                onClose={() => setActiveModal(null)}
                title="Select Cost Center"
                items={lookups.costCenters}
                onSelect={(item) => { setFormData(prev => ({ ...prev, costCenter: item.code })); }}
            />

            {activeTab !== 'Account' && (
                <SearchModal
                    isOpen={activeModal === 'entity'}
                    onClose={() => setActiveModal(null)}
                    title={`Select ${activeTab}`}
                    items={getEntityItems()}
                    onSelect={(item) => { setFormData(prev => ({ ...prev, entityId: item.code, entityName: item.name, address: item.address || '' })); }}
                />
            )}

            <CalendarModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                currentDate={formData.date}
                onDateChange={(d) => { setFormData({ ...formData, date: d }); setShowDateModal(false); }}
                title="Select Date"
            />

            <CalendarModal
                isOpen={showBalanceDateModal}
                onClose={() => setShowBalanceDateModal(false)}
                currentDate={formData.balanceAsAt}
                onDateChange={(d) => { setFormData({ ...formData, balanceAsAt: d }); setShowBalanceDateModal(false); }}
                title="Select Balance As At Date"
            />

            {showReceipt && (
                <OpeningBalanceDetailModal
                    docNo={receiptData?.docNo}
                    preloadedData={receiptData}
                    onClose={() => {
                        setShowReceipt(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

export default OpeningBalanceBoard;
