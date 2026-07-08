import React, { useState, useEffect } from 'react';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { Loader2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const PlanEditorModal = ({ isOpen, onClose, editingPlan, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        planName: '',
        price: 0,
        billingCycle: 'Monthly',
        maxUsers: 5,
        maxCompanies: 1,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingPlan) {
                setFormData({
                    planName: editingPlan.planName || '',
                    price: editingPlan.price || 0,
                    billingCycle: editingPlan.billingCycle || 'Monthly',
                    maxUsers: editingPlan.maxUsers || 5,
                    maxCompanies: editingPlan.maxCompanies || 1,
                    isActive: editingPlan.isActive !== false
                });
            } else {
                setFormData({
                    planName: '',
                    price: 0,
                    billingCycle: 'Monthly',
                    maxUsers: 5,
                    maxCompanies: 1,
                    isActive: true
                });
            }
        }
    }, [isOpen, editingPlan]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingPlan?.id) {
                await subscriptionPlanService.updatePlan(editingPlan.id, formData);
                showSuccessToast('Pricing plan updated successfully.');
            } else {
                await subscriptionPlanService.createPlan(formData);
                showSuccessToast('New pricing plan created successfully.');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            showErrorToast('Failed to save the pricing plan.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 font-sans">
            <div className="bg-slate-50 dark:bg-[#0c0c0c] border border-slate-300 dark:border-white/10 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-none">
                <div className="px-6 py-4 border-b border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-100 dark:bg-white/5">
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">
                        {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-200 dark:bg-white/10 transition-colors rounded-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Plan Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.planName}
                            onChange={e => setFormData({...formData, planName: e.target.value})}
                            placeholder="e.g. Professional"
                            className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none placeholder:text-gray-600"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Price ($) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none placeholder:text-gray-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billing Cycle *</label>
                            <select
                                value={formData.billingCycle}
                                onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none"
                            >
                                <option value="Monthly" className="bg-slate-50 dark:bg-[#0c0c0c]">Monthly</option>
                                <option value="Yearly" className="bg-slate-50 dark:bg-[#0c0c0c]">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Max Users *</label>
                            <input
                                type="number"
                                required
                                value={formData.maxUsers}
                                onChange={e => setFormData({...formData, maxUsers: parseInt(e.target.value) || 0})}
                                placeholder="5"
                                className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none placeholder:text-gray-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Max Companies *</label>
                            <input
                                type="number"
                                required
                                value={formData.maxCompanies}
                                onChange={e => setFormData({...formData, maxCompanies: parseInt(e.target.value) || 0})}
                                placeholder="1"
                                className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        <span className="text-xs font-bold text-gray-300">Plan is Active (Visible to users)</span>
                    </div>

                    <div className="mt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-white/10 transition-all rounded-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all rounded-none flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin" size={14} /> Saving...</>
                            ) : (
                                'Save Plan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanEditorModal;




