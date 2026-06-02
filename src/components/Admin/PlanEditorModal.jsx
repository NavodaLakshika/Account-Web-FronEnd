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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
 <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[17px] font-bold text-slate-800">
                        {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none font-light">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-2">Plan Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.planName}
                            onChange={e => setFormData({...formData, planName: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Billing Cycle</label>
                            <select 
                                className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                value={formData.billingCycle}
                                onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Max Users</label>
                            <input 
                                type="number" 
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.maxUsers}
                                onChange={e => setFormData({...formData, maxUsers: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Max Companies</label>
                            <input 
                                type="number" 
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.maxCompanies}
                                onChange={e => setFormData({...formData, maxCompanies: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input 
                            type="checkbox" 
                            id="isActivePlan"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActivePlan" className="text-[14px] font-semibold text-slate-700">
                            Plan is Active (Visible to users)
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-slate-100/80 text-slate-800 rounded-[12px] text-[14px] font-bold hover:bg-slate-200/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-[#4f46e5] text-white rounded-[12px] text-[14px] font-bold hover:bg-[#4338ca] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanEditorModal;
