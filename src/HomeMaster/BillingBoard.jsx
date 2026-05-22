import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Plus, Edit2, Trash2, Database, Loader2, Users, Building, HardDrive, RefreshCw } from 'lucide-react';
import { subscriptionPlanService } from '../services/subscriptionPlan.service';
import AlertModal from '../components/modals/AlertModal';
import ConfirmModal from '../components/modals/ConfirmModal';

const BillingBoard = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        planName: '', price: 0, billingCycle: 'Monthly', 
        maxUsers: 5, maxCompanies: 1, isActive: true
    });

    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', variant: 'success' });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const showAlert = (title, message, variant = 'success') => {
        setAlertConfig({ isOpen: true, title, message, variant });
    };

    const showConfirm = (title, message, onConfirm) => {
        setConfirmConfig({ isOpen: true, title, message, onConfirm });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await subscriptionPlanService.getAllPlans();
            setPlans(data || []);
        } catch (error) {
            console.error("Failed to load plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitDB = async () => {
        setIsInitializing(true);
        try {
            await subscriptionPlanService.initTable();
            showAlert("Success", "Database table initialized and default plans seeded successfully!", "success");
            await fetchPlans();
        } catch (error) {
            showAlert("Error", "Failed to initialize database. Make sure API is running.", "danger");
        } finally {
            setIsInitializing(false);
        }
    };

    const handleOpenForm = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData(plan);
        } else {
            setEditingPlan(null);
            setFormData({
                planName: '', price: 0, billingCycle: 'Monthly', 
                maxUsers: 5, maxCompanies: 1, isActive: true
            });
        }
        setIsFormOpen(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await subscriptionPlanService.updatePlan(editingPlan.id, formData);
            } else {
                await subscriptionPlanService.createPlan(formData);
            }
            setIsFormOpen(false);
            fetchPlans();
            showAlert("Saved", "Plan saved successfully.", "success");
        } catch (error) {
            showAlert("Error", "Error saving plan. Ensure API is running and Database is initialized.", "danger");
        }
    };

    const handleDeletePlan = (id) => {
        showConfirm("Delete Plan", "Are you sure you want to delete this subscription plan?", async () => {
            try {
                await subscriptionPlanService.deletePlan(id);
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                fetchPlans();
                showAlert("Deleted", "Plan deleted successfully.", "success");
            } catch (error) {
                showAlert("Error", "Failed to delete plan.", "danger");
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 h-full max-h-[82vh] overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="text-orange-500" size={20} />
                        Billing & Subscription Plans
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Manage tenant subscriptions, pricing tiers, and system limits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleInitDB}
                        disabled={isInitializing}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        title="Creates SQL Table if it does not exist"
                    >
                        {isInitializing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        Init Database
                    </button>
                    <button 
                        onClick={() => handleOpenForm()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={14} /> Create Plan
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm gap-4 text-center p-6">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
                        <Database size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">No Plans Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">You may need to initialize the database table if you haven't run migrations, or simply create your first plan.</p>
                    </div>
                    <button 
                        onClick={handleInitDB}
                        className="px-6 py-2.5 mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Database size={14} /> Auto-Initialize Table & Seed Data
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group relative">
                            {!plan.isActive && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">
                                    Inactive
                                </div>
                            )}
                            <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-2">{plan.planName}</h3>
                                <div className="text-4xl font-black text-orange-500 flex items-start gap-1">
                                    <span className="text-lg mt-1">$</span>
                                    {plan.price}
                                    <span className="text-xs text-slate-400 mt-auto mb-1">/{plan.billingCycle.toLowerCase()}</span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Users className="w-4 h-4 text-slate-400" /> 
                                    <span className="font-bold">{plan.maxUsers}</span> User Accounts
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Building className="w-4 h-4 text-slate-400" /> 
                                    <span className="font-bold">{plan.maxCompanies}</span> Companies / Tenants
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                                    Premium Support Included
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button 
                                    onClick={() => handleOpenForm(plan)}
                                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="px-4 py-2 text-xs font-bold text-red-500 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                                    title="Delete Plan"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                {editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                            </h3>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Plan Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    value={formData.planName}
                                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                                    placeholder="e.g. Starter Plan"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Billing Cycle</label>
                                    <select 
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        value={formData.billingCycle}
                                        onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Max Users</label>
                                    <input 
                                        type="number" required min="1"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        value={formData.maxUsers}
                                        onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Max Companies</label>
                                    <input 
                                        type="number" required min="1"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        value={formData.maxCompanies}
                                        onChange={(e) => setFormData({...formData, maxCompanies: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                                <input 
                                    type="checkbox" 
                                    id="isActive"
                                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                                    Plan is Active and available for purchase
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
                                >
                                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant="danger"
                confirmText="Yes, Delete"
            />
        </div>
    );
};

export default BillingBoard;
