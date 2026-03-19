import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { cardCommissionService } from '../../../services/cardCommission.service';
import { toast } from 'react-hot-toast';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = {
        BankAccCode: '',
        BankAccName: '',
        CardID: '',
        CardType: '',
        Rate: '0.0'
    };

    const [formData, setFormData] = useState(initialState);
    const [cardTypes, setCardTypes] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await cardCommissionService.getLookups();
            setCardTypes(data.cardTypes || []);
            setBankAccounts(data.bankAccounts || []);
        } catch (error) {
            toast.error('Failed to load lookup data');
        }
    };

    const handleBankChange = (e) => {
        const code = e.target.value;
        const selected = bankAccounts.find(b => b.sub_Code === code);
        setFormData(prev => ({
            ...prev,
            BankAccCode: code,
            BankAccName: selected ? selected.sub_Acc_Name : ''
        }));
    };

    const handleCardChange = async (e) => {
        const id = e.target.value;
        const selected = cardTypes.find(c => c.cardID === id);
        
        setFormData(prev => ({
            ...prev,
            CardID: id,
            CardType: selected ? selected.cardName : ''
        }));

        if (id && formData.BankAccCode) {
            try {
                const rate = await cardCommissionService.getRate(formData.BankAccCode, id);
                setFormData(prev => ({ ...prev, Rate: rate.toString() }));
            } catch (error) {
                setFormData(prev => ({ ...prev, Rate: '0.0' }));
            }
        }
    };

    const handleSave = async () => {
        if (!formData.BankAccCode) {
            toast.error('Please select a Bank Account');
            return;
        }
        if (!formData.CardID) {
            toast.error('Card Type Not Found.');
            return;
        }
        if (parseFloat(formData.Rate) === 0) {
            toast.error('Commission Rate cannot be zero.');
            return;
        }

        if (!window.confirm("Do you want to save this record?")) return;

        setLoading(true);
        try {
            await cardCommissionService.save({
                ...formData,
                Rate: parseFloat(formData.Rate)
            });
            toast.success('Commission Rate Saved Successfully.');
            setFormData(prev => ({ ...prev, CardID: '', CardType: '', Rate: '0.0' }));
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Card Sale Commission Rate"
            maxWidth="max-w-xl"
            footer={
                <div className="flex justify-center gap-3 w-full pt-3">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border hover:bg-[#005a9e] flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </button>
                    <button 
                        onClick={handleClear}
                        className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100"
                    >
                        Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-6 py-4 font-['Plus_Jakarta_Sans']">
                <div className="bg-gray-50 p-8 border border-gray-200 rounded-sm space-y-6 shadow-sm">
                    {/* Bank Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-gray-600 w-[140px] shrink-0">Bank Account</label>
                        <select 
                            value={formData.BankAccCode}
                            onChange={handleBankChange}
                            className="flex-1 h-9 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white shadow-inner"
                        >
                            <option value="">Select Account</option>
                            {bankAccounts.map(b => (
                                <option key={b.sub_Code} value={b.sub_Code}>{b.sub_Acc_Name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Card Type Selection */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-gray-600 w-[140px] shrink-0">Card Type</label>
                        <select 
                            value={formData.CardID}
                            onChange={handleCardChange}
                            className="flex-1 h-9 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white shadow-inner"
                        >
                            <option value="">Select Card Type</option>
                            {cardTypes.map(c => (
                                <option key={c.cardID} value={c.cardID}>{c.cardName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Commission Rate Input */}
                    <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-gray-600 w-[140px] shrink-0">Commission Rate</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                step="0.1"
                                value={formData.Rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, Rate: e.target.value }))}
                                className="w-40 h-9 border border-gray-300 px-3 text-sm text-right focus:border-blue-500 outline-none rounded-sm bg-white font-bold text-blue-600 shadow-inner"
                                placeholder="0.0"
                            />
                            <span className="text-sm font-black text-gray-700">%</span>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CardCommissionBoard;
