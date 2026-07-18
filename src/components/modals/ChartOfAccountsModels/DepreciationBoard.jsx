import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { RotateCcw, Save, Edit, Loader2 } from 'lucide-react';
import { depRateService } from '../../../services/depRate.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const DepreciationBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AccCode: '',
        AccountName: '',
        DepRate: '',
        CreateUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            setFormData(prev => ({ 
                ...prev, 
                CreateUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
            fetchLookups();
            fetchList();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await depRateService.getLookups();
            setLookups(data || []);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const fetchList = async () => {
        try {
            const data = await depRateService.getList();
            setRateList(data || []);
        } catch (error) {
            console.error('List fetch error:', error);
            showErrorToast('Failed to load registered depreciation rates.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...initialState,
            CreateUser: formData.CreateUser
        });
        setIsEditMode(false);
    };

    const handleAccountSelect = (code) => {
        const item = lookups.find(l => l.code === code);
        if (!item) { setFormData(prev => ({ ...prev, AccCode: '', AccountName: '' })); setIsEditMode(false); return; }
        const existing = rateList.find(r => r.accCode === code);
        setFormData(prev => ({ ...prev, AccCode: item.code, AccountName: item.name, DepRate: existing ? existing.depRate : '' }));
        setIsEditMode(!!existing);
    };

    const handleSave = async () => {
        if (!formData.AccCode) {
            showErrorToast('Please select an account.');
            return;
        }
        if (formData.DepRate === '' || isNaN(formData.DepRate)) {
            showErrorToast('Please enter a valid depreciation rate.');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await depRateService.edit({
                    ...formData,
                    DepRate: parseFloat(formData.DepRate)
                });
                showSuccessToast('Record updated successfully.');
            } else {
                await depRateService.save({
                    ...formData,
                    DepRate: parseFloat(formData.DepRate)
                });
                showSuccessToast('Record saved successfully.');
            }
            handleClear();
            fetchList();
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record.');
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (rate) => {
        setFormData({
            AccCode: rate.accCode,
            AccountName: rate.accountName,
            DepRate: rate.depRate,
            CreateUser: formData.CreateUser
        });
        setIsEditMode(true);
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Depreciation Rate"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : (isEditMode ? <Edit size={14} /> : <Save size={14} />)} 
                            {isEditMode ? 'UPDATE' : 'SAVE'}
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px] shadow-sm transition-all">
                        <p className="text-[11px] font-bold text-[#0369a1] text-center leading-relaxed">
                            Depreciation is a decline in value, especially the reduction in the value of<br />
                            a fixed asset charge as an expense when calculation profit and loss.
                        </p>
                    </div>

                    {/* Input Section */}
 <div className="bg-white p-4 rounded-[3px] space-y-4 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Asset Account</label>
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => handleAccountSelect(e.target.value)}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select account...</option>
                                    {lookups.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Depreciation Rate (%)</label>
                                <div className="relative">
                                    <input 
                                        name="DepRate" 
                                        value={formData.DepRate} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.1"
                                        placeholder="0.0"
                                        className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-orange-600 bg-white pr-8 text-center" 
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
 <div className=" rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Registered Depreciation Rates</span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-[3px] shadow-sm">{rateList.length} Records</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-32 px-5 py-3">Account Code</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Asset Description</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right w-24 px-5 py-3">Rate (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rateList.map((rate, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => handleRowClick(rate)}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{rate.accCode}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{rate.accountName}</td>
                                            <td className="text-[11px] font-black text-orange-500 text-right px-5 py-3">{rate.depRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    {rateList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                No depreciation rates defined yet.
                                            </td>
                                        <th className="text-right px-5 py-3">Action</th></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default DepreciationBoard;
