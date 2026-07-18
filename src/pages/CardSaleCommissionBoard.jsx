import React, { useState, useEffect } from 'react';
import { RotateCcw, Save } from 'lucide-react';
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
                                <select
                                    value={formData.BankAccCode}
                                    onChange={(e) => {
                                        const bank = banks.find(b => (b.code || b.Code || b.sub_Code || b.Sub_Code) === e.target.value);
                                        setFormData(prev => ({ ...prev, BankAccCode: e.target.value, BankAccName: bank ? (bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name) : '' }));
                                    }}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select bank account...</option>
                                    {banks.map((b, idx) => (
                                        <option key={idx} value={b.code || b.Code || b.sub_Code || b.Sub_Code}>
                                            {b.code || b.Code || b.sub_Code || b.Sub_Code} - {b.name || b.Name || b.sub_Acc_Name || b.Sub_Acc_Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Card Type</label>
                                <select
                                    value={formData.CardID}
                                    onChange={(e) => {
                                        const card = cardTypes.find(c => (c.cardID || c.CardID) === e.target.value);
                                        setFormData(prev => ({ ...prev, CardID: e.target.value, CardType: card ? (card.name || card.CardName) : '' }));
                                    }}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select card type...</option>
                                    {cardTypes.map((c, idx) => (
                                        <option key={idx} value={c.cardID || c.CardID}>{c.name || c.CardName}</option>
                                    ))}
                                </select>
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
        </>
    );
};

export default CardSaleCommissionBoard;
