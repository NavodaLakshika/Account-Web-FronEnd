import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save } from 'lucide-react';
import { cardCommissionService } from '../services/cardCommission.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { getCompanyCode } from '../utils/session';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const CardSaleCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = { BankAccCode: '', BankAccName: '', CardID: '', CardType: '', Rate: '0.0' };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [cardTypes, setCardTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showCardSearch, setShowCardSearch] = useState(false);
    const [bankSearchTerm, setBankSearchTerm] = useState('');
    const [cardSearchTerm, setCardSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) { fetchLookups(); }
    }, [isOpen]);

    useEffect(() => {
        if (formData.BankAccCode && formData.CardID) {
            fetchCurrentRate(formData.BankAccCode, formData.CardID);
        }
    }, [formData.BankAccCode, formData.CardID]);

    const fetchLookups = async () => {
        try {
            const data = await cardCommissionService.getLookups();
            setBanks(data.bankAccounts || []);
            setCardTypes(data.cardTypes || []);
        } catch (error) { console.error('Lookup error:', error); }
    };

    const fetchCurrentRate = async (bankCode, cardId) => {
        try {
            const data = await cardCommissionService.getRate(bankCode, cardId, getCompanyCode());
            setFormData(prev => ({ ...prev, Rate: (data.rate || 0).toString() }));
        } catch (error) { console.error('Rate fetch error:', error); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => { setFormData(initialState); };

    const handleBankSelect = (bank) => {
        setFormData(prev => ({ ...prev, BankAccCode: bank.code || bank.Code || bank.sub_Code || bank.Sub_Code, BankAccName: bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name }));
        setShowBankSearch(false);
    };

    const handleCardSelect = (card) => {
        setFormData(prev => ({ ...prev, CardID: card.cardID || card.CardID, CardType: card.name || card.CardName }));
        setShowCardSearch(false);
    };

    const handleSave = async () => {
        if (!formData.BankAccCode) { showErrorToast('Please select a bank account.'); return; }
        if (!formData.CardID) { showErrorToast('Please select a card type.'); return; }
        if (parseFloat(formData.Rate) === 0) { showErrorToast('Commission rate cannot be zero.'); return; }
        setLoading(true);
        try {
            await cardCommissionService.save({ ...formData, Rate: parseFloat(formData.Rate), Company: getCompanyCode() });
            showSuccessToast('Commission rate saved successfully');
            setFormData(prev => ({ ...prev, CardID: '', CardType: '', Rate: '0.0' }));
        } catch (error) { showErrorToast(error.message || 'Failed to save record'); } finally { setLoading(false); }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Configure bank card commission percentages" icon={null}
                isOpen={isOpen} onClose={onClose} title="Commission Rate"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-5">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.BankAccName} onClick={() => setShowBankSearch(true)} placeholder="Select bank account..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowBankSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                    {formData.BankAccCode && (
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-green-100 px-1.5 py-0.5 rounded">{formData.BankAccCode}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Card Type</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.CardType} onClick={() => setShowCardSearch(true)} placeholder="Select card type..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowCardSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                    {formData.CardID && (
                                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-green-100 px-1.5 py-0.5 rounded">ID: {formData.CardID}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Commission Rate (%)</label>
                                <div className="relative">
                                    <input type="number" name="Rate" value={formData.Rate} onChange={handleInputChange} step="0.1" placeholder="0.0" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-center pr-10" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                                <p className="text-[11px] text-gray-400 italic mt-1">Enter the percentage value for card sale commissions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showBankSearch} onClose={() => setShowBankSearch(false)} title="Bank Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="SEARCH BANK..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={bankSearchTerm} onChange={(e) => setBankSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Bank Code</th><th className=" px-5 py-3">Bank Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {banks.filter(b => (b.name || b.Name || b.sub_Acc_Name || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase()) || (b.code || b.Code || b.sub_Code || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase())).map((bank, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleBankSelect(bank)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{bank.code || bank.Code || bank.sub_Code || bank.Sub_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {banks.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No bank accounts found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showCardSearch} onClose={() => setShowCardSearch(false)} title="Card Types Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="FILTER CARDS..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={cardSearchTerm} onChange={(e) => setCardSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="p-2 space-y-2 max-h-[350px] overflow-y-auto no-scrollbar">
                        {cardTypes.filter(c => (c.name || '').toLowerCase().includes(cardSearchTerm.toLowerCase())).map((card, idx) => (
                            <button key={idx} onClick={() => handleCardSelect(card)} className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-blue-50/50 border border-slate-200 rounded-[3px] transition-all text-left flex justify-between items-center group shadow-sm cursor-pointer group border-b border-gray-50">
                                <span className="uppercase tracking-widest">{card.name}</span>
                                <span className="text-[#e49e1b] group-hover:text-[#0285fd] transition-colors font-black text-xs">SELECT</span>
                            </button>
                        ))}
                        {cardTypes.length === 0 && <p className="text-center text-gray-400 text-xs py-4">No card types found.</p>}
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default CardSaleCommissionBoard;
