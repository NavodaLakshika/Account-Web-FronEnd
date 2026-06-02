import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Loader2, AlertTriangle, CreditCard, Banknote, Percent } from 'lucide-react';
import { cardCommissionService } from '../../../services/cardCommission.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = { BankAccCode: '', BankAccName: '', CardID: '', CardType: '', Rate: '0.0' };

    const [formData, setFormData] = useState(initialState);
    const [cardTypes, setCardTypes] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) { fetchLookups(); }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await cardCommissionService.getLookups();
            setCardTypes(data.cardTypes || []);
            setBankAccounts(data.bankAccounts || []);
        } catch (error) { showErrorToast('Failed to load lookup data'); }
    };

    const handleCardSelect = async (id, name) => {
        setFormData(prev => ({ ...prev, CardID: id, CardType: name }));
        if (id && formData.BankAccCode) {
            try { const rate = await cardCommissionService.getRate(formData.BankAccCode, id); setFormData(prev => ({ ...prev, CardID: id, CardType: name, Rate: rate.toString() })); } catch { setFormData(prev => ({ ...prev, CardID: id, CardType: name, Rate: '0.0' })); }
        }
        setShowCardModal(false);
    };

    const handleBankSelect = async (code, name) => {
        setFormData(prev => ({ ...prev, BankAccCode: code, BankAccName: name }));
        if (formData.CardID && code) {
            try { const rate = await cardCommissionService.getRate(code, formData.CardID); setFormData(prev => ({ ...prev, BankAccCode: code, BankAccName: name, Rate: rate.toString() })); } catch { setFormData(prev => ({ ...prev, BankAccCode: code, BankAccName: name, Rate: '0.0' })); }
        }
        setShowBankModal(false);
    };

    const handleSave = () => {
        if (!formData.BankAccCode) { showErrorToast('Please select a Bank Account'); return; }
        if (!formData.CardID) { showErrorToast('Card Type Not Found.'); return; }
        if (parseFloat(formData.Rate) === 0) { showErrorToast('Commission Rate cannot be zero.'); return; }
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            await cardCommissionService.save({ ...formData, Rate: parseFloat(formData.Rate) });
            showSuccessToast('Commission Rate Saved Successfully.');
            setFormData(prev => ({ ...prev, CardID: '', CardType: '', Rate: '0.0' }));
        } catch (error) { showErrorToast(error); } finally { setLoading(false); }
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Card Sale Commission Rate"
                subtitle="Configure bank card commission percentages"
                icon={CreditCard}
                maxWidth="max-w-2xl"
                isEditMode={false}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                saveLabel="SAVE"
            >
                <MasterFieldRow label="Bank Account" colSpan="col-span-12">
                    <MasterLookupInput value={formData.BankAccName || formData.BankAccCode} onSearchClick={() => setShowBankModal(true)} placeholder="Select bank account..." />
                </MasterFieldRow>
                <MasterFieldRow label="Card Type" colSpan="col-span-12">
                    <MasterLookupInput value={formData.CardType || formData.CardID} onSearchClick={() => setShowCardModal(true)} placeholder="Select card type..." />
                </MasterFieldRow>
                <MasterFieldRow label="Commission Rate" colSpan="col-span-12">
                    <div className="flex items-center gap-3 flex-1">
                        <input type="number" step="0.1" value={formData.Rate} onChange={(e) => setFormData(prev => ({ ...prev, Rate: e.target.value }))}
                            className="w-[140px] h-8 border border-slate-200 px-3 text-sm font-mono font-bold rounded outline-none bg-slate-50 text-slate-700 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all text-right" placeholder="0.0" />
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-wider">% Percentage</span>
                    </div>
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                title="Bank Account Lookup"
                columns={[
                    { label: 'CODE', key: 'sub_Code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.sub_Code}</span> },
                    { label: 'ACCOUNT NAME', key: 'sub_Acc_Name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.sub_Acc_Name}</span> },
                ]}
                items={bankAccounts}
                onSelect={(b) => handleBankSelect(b.sub_Code, b.sub_Acc_Name)}
                emptyMsg="No bank accounts found"
            />

            <MasterLookupModal
                isOpen={showCardModal}
                onClose={() => setShowCardModal(false)}
                title="Card Type Lookup"
                columns={[
                    { label: 'CARD ID', key: 'cardID', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.cardID}</span> },
                    { label: 'CARD NAME', key: 'cardName', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.cardName}</span> },
                ]}
                items={cardTypes}
                onSelect={(c) => handleCardSelect(c.cardID, c.cardName)}
                emptyMsg="No card types found"
            />

            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowSaveConfirm(false)} />
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-emerald-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Save</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">
                                Do you want to save this commission record for <span className="font-bold text-[#0285fd] uppercase">"{formData.CardType || formData.CardID}"</span>?
                                <br />This will update the rate to <span className="font-bold text-slate-800">{formData.Rate}%</span>.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmSave} disabled={loading} className="flex-1 h-11 bg-emerald-500 text-white text-[11px] font-black rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Record'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Transaction Integrity Guaranteed</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardCommissionBoard;
