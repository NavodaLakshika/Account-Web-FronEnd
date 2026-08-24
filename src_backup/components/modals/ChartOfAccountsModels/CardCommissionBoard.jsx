import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { RotateCcw, Save, Loader2, CreditCard, Landmark, Percent } from 'lucide-react';
import { cardCommissionService } from '../../../services/cardCommission.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = {
        BankAccCode: '',
        BankAccName: '',
        CardID: '',
        CardType: '',
        Rate: '0.00'
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [cardTypes, setCardTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
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
        } catch (error) {
            console.error('Lookup error:', error);
        }
    };

    const fetchCurrentRate = async (bankCode, cardId) => {
        try {
            const data = await cardCommissionService.getRate(bankCode, cardId);
            setFormData(prev => ({ ...prev, Rate: data.rate.toFixed(2) }));
        } catch (error) {
            console.error('Rate fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    const handleSave = async () => {
        if (!formData.BankAccCode) {
            showErrorToast('Please select a bank account.');
            return;
        }
        if (!formData.CardID) {
            showErrorToast('Please select a card type.');
            return;
        }
        if (parseFloat(formData.Rate) === 0) {
            showErrorToast('Commission rate cannot be zero.');
            return;
        }

        setLoading(true);
        try {
            await cardCommissionService.save(formData);
            showSuccessToast('Commission rate saved successfully');
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    const bankOptions = banks.map(b => ({
        value: b.code || b.Code || b.sub_Code || b.Sub_Code,
        label: `${b.code || b.Code || b.sub_Code || b.Sub_Code} - ${b.name || b.Name || b.sub_Acc_Name || b.Sub_Acc_Name}`
    }));

    const cardOptions = cardTypes.map(c => ({
        value: c.cardID || c.CardID,
        label: c.name || c.CardName
    }));

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Card Sale Commission Setup"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            SAVE
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
 <div className="bg-white p-6 rounded-[3px] space-y-6 shadow-sm border-l-4 border-l-[#e49e1b]">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Landmark size={12} className="text-[#e49e1b]" /> Bank Account
                                </label>
                                <select
                                    value={formData.BankAccCode}
                                    onChange={(e) => {
                                        const bank = banks.find(b => (b.code || b.Code || b.sub_Code || b.Sub_Code) === e.target.value);
                                        setFormData(prev => ({ ...prev, BankAccCode: e.target.value, BankAccName: bank ? (bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name) : '' }));
                                    }}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select bank account...</option>
                                    {bankOptions.map((opt, idx) => (
                                        <option key={idx} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} className="text-[#e49e1b]" /> Card Type
                                </label>
                                <select
                                    value={formData.CardID}
                                    onChange={(e) => {
                                        const card = cardTypes.find(c => (c.cardID || c.CardID) === e.target.value);
                                        setFormData(prev => ({ ...prev, CardID: e.target.value, CardType: card ? (card.name || card.CardName) : '' }));
                                    }}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select card type...</option>
                                    {cardOptions.map((opt, idx) => (
                                        <option key={idx} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Percent size={12} className="text-[#e49e1b]" /> Commission Rate (%)
                                </label>
                                <div className="relative">
                                    <input 
                                        name="Rate"
                                        value={formData.Rate}
                                        onChange={handleInputChange}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full h-10 border border-slate-200 px-4 text-[16px] focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded font-black text-right text-gray-700 shadow-sm pr-12 bg-white"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Enter the percentage value for card sale commissions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default CardCommissionBoard;
