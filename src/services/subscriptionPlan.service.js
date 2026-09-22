import api from './api';

const STORAGE_KEY = 'subscription_plans_cache';

// Core accounting package subscription plans - exactly matching the system
export const CORE_ACCOUNTING_PLANS = [
    {
        id: 1,
        planName: 'Starter Plan',
        price: 99.00,
        billingCycle: 'monthly',
        maxUsers: 5,
        maxCompanies: 1,
        isActive: true,
        category: 'CORE ERP',
        badge: '',
        description: 'Enjoy access to our financial system with support for up to 5 users and 1 companies.',
        features: [
            'Up to 5 Operator Slots',
            'Manage up to 1 Companies'
        ]
    },
    {
        id: 2,
        planName: 'Professional Plan',
        price: 100.00,
        billingCycle: 'monthly',
        maxUsers: 50,
        maxCompanies: 5,
        isActive: true,
        category: 'CORE ERP',
        badge: 'POPULAR',
        description: 'Enjoy access to our financial system with support for up to 50 users and 5 companies.',
        features: [
            'Up to 50 Operator Slots',
            'Manage up to 5 Companies'
        ]
    },
    {
        id: 3,
        planName: 'Enterprise Plan',
        price: 299.00,
        billingCycle: 'monthly',
        maxUsers: 9999,
        maxCompanies: 50,
        isActive: true,
        category: 'CORE ERP',
        badge: '',
        description: 'Enjoy access to our financial system with support for up to 9999 users and 50 companies.',
        features: [
            'Up to 9999 Operator Slots',
            'Manage up to 50 Companies'
        ]
    }
];

export const subscriptionPlanService = {
    getStoredPlans() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Check if the 3 core plans are present
                    const hasStarter = parsed.some(p => p.planName?.toLowerCase().includes('starter') && p.price === 99);
                    if (hasStarter) {
                        return parsed;
                    }
                    // If previous cache had different mock plans, merge core plans with any user-created custom plans
                    const customPlans = parsed.filter(p => 
                        !p.planName?.toLowerCase().includes('starter') &&
                        !p.planName?.toLowerCase().includes('professional') &&
                        !p.planName?.toLowerCase().includes('enterprise')
                    );
                    const merged = [...CORE_ACCOUNTING_PLANS, ...customPlans];
                    this.savePlans(merged);
                    return merged;
                }
            }
        } catch (e) {
            console.error('Failed to read plans from storage', e);
        }
        this.savePlans(CORE_ACCOUNTING_PLANS);
        return CORE_ACCOUNTING_PLANS;
    },

    savePlans(plans) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
        } catch (e) {
            console.error('Failed to save plans to storage', e);
        }
    },

    initTable: async () => {
        try {
            const response = await api.post('/SubscriptionPlan/init');
            return response.data;
        } catch (e) {
            return { success: true, message: 'Initialized' };
        }
    },

    getAllPlans: async function () {
        try {
            const response = await api.get('/SubscriptionPlan');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Backend returned plans
                const backendPlans = response.data;

                // Normalize plans: preserve exact core accounting package details and allow custom plans to have their rich details
                const normalized = backendPlans.map(p => {
                    const isStarter = p.planName?.toLowerCase().includes('starter');
                    const isPro = p.planName?.toLowerCase().includes('professional');
                    const isEnterprise = p.planName?.toLowerCase().includes('enterprise');

                    if (isStarter) {
                        return {
                            ...p,
                            planName: 'Starter Plan',
                            price: p.price ?? 99.00,
                            billingCycle: p.billingCycle || 'monthly',
                            maxUsers: p.maxUsers ?? 5,
                            maxCompanies: p.maxCompanies ?? 1,
                            category: p.category || 'CORE ERP',
                            badge: p.badge || '',
                            description: p.description || `Enjoy access to our financial system with support for up to ${p.maxUsers || 5} users and ${p.maxCompanies || 1} companies.`,
                            features: (Array.isArray(p.features) && p.features.length > 0)
                                ? p.features
                                : [
                                    `Up to ${p.maxUsers || 5} Operator Slots`,
                                    `Manage up to ${p.maxCompanies || 1} Companies`
                                ]
                        };
                    }

                    if (isPro) {
                        return {
                            ...p,
                            planName: 'Professional Plan',
                            price: p.price ?? 100.00,
                            billingCycle: p.billingCycle || 'monthly',
                            maxUsers: p.maxUsers ?? 50,
                            maxCompanies: p.maxCompanies ?? 5,
                            category: p.category || 'CORE ERP',
                            badge: p.badge || 'POPULAR',
                            description: p.description || `Enjoy access to our financial system with support for up to ${p.maxUsers || 50} users and ${p.maxCompanies || 5} companies.`,
                            features: (Array.isArray(p.features) && p.features.length > 0)
                                ? p.features
                                : [
                                    `Up to ${p.maxUsers || 50} Operator Slots`,
                                    `Manage up to ${p.maxCompanies || 5} Companies`
                                ]
                        };
                    }

                    if (isEnterprise) {
                        return {
                            ...p,
                            planName: 'Enterprise Plan',
                            price: p.price ?? 299.00,
                            billingCycle: p.billingCycle || 'monthly',
                            maxUsers: p.maxUsers ?? 9999,
                            maxCompanies: p.maxCompanies ?? 50,
                            category: p.category || 'CORE ERP',
                            badge: p.badge || '',
                            description: p.description || `Enjoy access to our financial system with support for up to ${p.maxUsers || 9999} users and ${p.maxCompanies || 50} companies.`,
                            features: (Array.isArray(p.features) && p.features.length > 0)
                                ? p.features
                                : [
                                    `Up to ${p.maxUsers || 9999} Operator Slots`,
                                    `Manage up to ${p.maxCompanies || 50} Companies`
                                ]
                        };
                    }

                    // Newly added subscription plan
                    return {
                        ...p,
                        category: p.category || 'ADD-ON PLAN',
                        badge: p.badge || '',
                        description: p.description || `Subscription package for up to ${p.maxUsers || 5} users and ${p.maxCompanies || 1} companies.`,
                        features: (Array.isArray(p.features) && p.features.length > 0)
                            ? p.features
                            : (typeof p.features === 'string' && p.features.trim())
                                ? p.features.split('\n').map(s => s.trim()).filter(Boolean)
                                : [
                                    `Up to ${p.maxUsers || 5} Operator Slots`,
                                    `Manage up to ${p.maxCompanies || 1} Companies`
                                ]
                    };
                });

                // Also check if any locally registered custom plans exist that aren't yet in backend
                const stored = this.getStoredPlans();
                const customOnly = stored.filter(sp => !normalized.some(np => String(np.id) === String(sp.id) || np.planName?.toLowerCase() === sp.planName?.toLowerCase()));
                const combined = [...normalized, ...customOnly];

                this.savePlans(combined);
                return combined;
            }
        } catch (e) {
            // Backend offline or error, fallback to stored
        }
        return this.getStoredPlans();
    },

    getPlanById: async function (id) {
        try {
            const response = await api.get(`/SubscriptionPlan/${id}`);
            if (response.data) return response.data;
        } catch (e) {}
        const plans = this.getStoredPlans();
        return plans.find(p => String(p.id) === String(id)) || null;
    },

    createPlan: async function (planData) {
        const newPlan = {
            ...planData,
            id: planData.id || `custom-plan-${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        const current = this.getStoredPlans();
        const updated = [...current, newPlan];
        this.savePlans(updated);

        try {
            await api.post('/SubscriptionPlan', newPlan);
        } catch (e) {}

        return newPlan;
    },

    updatePlan: async function (id, planData) {
        const current = this.getStoredPlans();
        const index = current.findIndex(p => String(p.id) === String(id));
        let updatedItem = { ...planData, id };
        if (index !== -1) {
            updatedItem = { ...current[index], ...planData, id, updatedAt: new Date().toISOString() };
            current[index] = updatedItem;
            this.savePlans(current);
        }

        try {
            await api.put(`/SubscriptionPlan/${id}`, updatedItem);
        } catch (e) {}

        return updatedItem;
    },

    deletePlan: async function (id) {
        const current = this.getStoredPlans();
        const updated = current.filter(p => String(p.id) !== String(id));
        this.savePlans(updated);

        try {
            await api.delete(`/SubscriptionPlan/${id}`);
        } catch (e) {}

        return { success: true };
    }
};
