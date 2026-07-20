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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="bg-white border border-gray-200 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-[3px] overflow-hidden">
                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                    <h3 className="text-[15px] font-bold text-gray-800">
                        {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-[3px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="bg-white border border-gray-200 rounded-[3px] p-4 space-y-5">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Plan Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.planName}
                                onChange={e => setFormData({...formData, planName: e.target.value})}
                                placeholder="e.g. Professional"
                                className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Price ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                                    placeholder="0.00"
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Billing Cycle *</label>
                                <select
                                    value={formData.billingCycle}
                                    onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Max Users *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.maxUsers}
                                    onChange={e => setFormData({...formData, maxUsers: parseInt(e.target.value) || 0})}
                                    placeholder="5"
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Max Companies *</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.maxCompanies}
                                    onChange={e => setFormData({...formData, maxCompanies: parseInt(e.target.value) || 0})}
                                    placeholder="1"
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
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
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0285fd]"></div>
                            </label>
                            <span className="text-[13px] font-medium text-gray-700">Plan is Active (Visible to users)</span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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




