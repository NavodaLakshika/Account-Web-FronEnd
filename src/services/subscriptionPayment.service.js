import api from './api';
import { subscriptionService } from './subscription.service';

const STORAGE_KEY = 'subscription_payments';

const DEFAULT_PAYMENTS = [
  {
    id: 'TXN-98421-2041',
    empCode: 'EMP001',
    empName: 'Navoda Rathnayake',
    companyName: 'ONIMTA Information Technology',
    planId: 'prod-1',
    planName: 'Enterprise Cloud ERP Suite',
    amount: 49.50,
    billingCycle: 'Monthly',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    status: 'Completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Subscribed via Promotional Launch Deal (50% Off)'
  },
  {
    id: 'TXN-76192-3890',
    empCode: 'EMP002',
    empName: 'Kasun Bandara',
    companyName: 'Lanka Logistics PLC',
    planId: 'prod-2',
    planName: 'E-Commerce & POS Real-time Sync',
    amount: 24.50,
    billingCycle: 'Monthly',
    paymentMethod: 'Credit Card',
    cardLast4: '8831',
    status: 'Completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Automated recurring payment'
  },
  {
    id: 'TXN-54019-1124',
    empCode: 'EMP003',
    empName: 'Saman Kumara',
    companyName: 'Apex Distributers Ltd',
    planId: 'prod-3',
    planName: 'Standard Cloud Business',
    amount: 348.00,
    billingCycle: 'Yearly',
    paymentMethod: 'Direct Bank Transfer',
    cardLast4: 'WIRE',
    status: 'Completed',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Annual upfront settlement via Commercial Bank wire'
  }
];

export const subscriptionPaymentService = {
  getStoredPayments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read payments from storage', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    return DEFAULT_PAYMENTS;
  },

  savePayments(payments) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to save payments to storage', e);
    }
  },

  async getAllPayments() {
    try {
      // Try backend endpoint if available
      const res = await api.get('/Subscription/payments');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.savePayments(res.data);
        return res.data;
      }
    } catch (err) {
      // Backend not implemented yet, fallback smoothly to local storage
    }
    return this.getStoredPayments();
  },

  async recordPayment(paymentDetails) {
    const txnId = `TXN-${Date.now().toString().slice(-5)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: txnId,
      empCode: paymentDetails.empCode || 'CURRENT_USER',
      empName: paymentDetails.empName || paymentDetails.userName || 'Subscriber',
      companyName: paymentDetails.companyName || 'Enterprise Client',
      planId: paymentDetails.planId || 'custom-plan',
      planName: paymentDetails.planName || 'Enterprise Subscription',
      amount: parseFloat(paymentDetails.amount || paymentDetails.price || 0),
      billingCycle: paymentDetails.billingCycle || 'Monthly',
      paymentMethod: paymentDetails.paymentMethod || 'Credit Card',
      cardLast4: paymentDetails.cardLast4 || '4242',
      status: 'Completed',
      createdAt: new Date().toISOString(),
      notes: paymentDetails.notes || 'Online secure checkout payment'
    };

    // 1. Save to local storage
    const currentList = this.getStoredPayments();
    const updated = [newPayment, ...currentList];
    this.savePayments(updated);

    // 2. Try POST to backend
    try {
      await api.post('/Subscription/payment', newPayment);
    } catch (e) {
      // Best effort backend sync
    }

    // 3. Automatically activate and extend user's subscription
    if (paymentDetails.empCode) {
      const extendMonths = paymentDetails.billingCycle === 'Yearly' ? 12 : 1;
      try {
        await subscriptionService.updateSubscription(paymentDetails.empCode, extendMonths, 'Active');
      } catch (subErr) {
        console.warn('Subscription auto-update notice:', subErr);
      }
    }

    // 4. Update session / current user subscription in memory/storage
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.SubscriptionStatus = 'Active';
        u.subscriptionStatus = 'Active';
        u.subscription_Status = 'Active';
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + (paymentDetails.billingCycle === 'Yearly' ? 12 : 1));
        u.subscription_End_Date = newExpiry.toISOString();
        u.SubscriptionEndDate = newExpiry.toISOString();
        sessionStorage.setItem('user', JSON.stringify(u));
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('subscription_payment_success', { detail: newPayment }));
    return newPayment;
  },

  async updatePaymentStatus(txnId, status) {
    const list = this.getStoredPayments();
    const idx = list.findIndex(p => p.id === txnId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].updatedAt = new Date().toISOString();
      this.savePayments(list);
    }

    try {
      await api.put(`/Subscription/payment/${txnId}/status`, { status });
    } catch (e) {}

    return list[idx];
  },

  async recordManualPayment(manualData) {
    return this.recordPayment({
      ...manualData,
      paymentMethod: manualData.paymentMethod || 'Manual Admin Entry',
      notes: manualData.notes || 'Recorded manually from Admin Panel'
    });
  },

  getRevenueMetrics() {
    const list = this.getStoredPayments();
    const completed = list.filter(p => p.status === 'Completed');
    const totalRevenue = completed.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const uniqueSubscribers = new Set(completed.map(p => p.empCode)).size;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions: list.length,
      completedCount: completed.length,
      activeSubscribers: uniqueSubscribers,
      recentPayments: list.slice(0, 5)
    };
  }
};
