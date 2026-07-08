import api from '../services/api';
import { subscriptionService } from '../services/subscription.service';
import { subscriptionPlanService } from '../services/subscriptionPlan.service';
import { reviewService } from '../services/review.service';
import { adService } from '../services/ad.service';
import { systemLogService } from '../services/systemLog.service';
import { backupService } from '../services/backup.service';

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data) return Array.isArray(data.data) ? data.data : [];
  if (data?.records) return Array.isArray(data.records) ? data.records : [];
  if (data?.items) return Array.isArray(data.items) ? data.items : [];
  if (data?.list) return Array.isArray(data.list) ? data.list : [];
  return [];
};

export const saDataService = {
  async getCompanies() {
    try {
      const resp = await api.get('/SuperAdmin/companies');
      const data = normalizeArray(resp.data);
      return data.slice(0, 30).map(c => ({
        code: c.company_Code || c.companyCode || c.Code || '',
        name: c.company_Name || c.companyName || c.Name || '',
        email: c.email || c.Email || '',
        status: c.status || c.Status || (c.acc_Desable ? 'Locked' : 'Active'),
        isLocked: c.acc_Desable || false
      }));
    } catch { return []; }
  },

  async getEmployees() {
    try {
      const resp = await api.get('/SuperAdmin/employees');
      const data = normalizeArray(resp.data);
      return data.slice(0, 30).map(e => ({
        code: e.emp_Code || e.empCode || e.Code || '',
        name: e.emp_Name || e.empName || e.Name || '',
        email: e.email || e.Email || '',
        role: e.role_Name || e.roleName || e.Role || '',
        status: e.status || e.Status || (e.acc_Desable ? 'Locked' : 'Active'),
        isLocked: e.acc_Desable || false
      }));
    } catch { return []; }
  },

  async getRoles() {
    try {
      const resp = await api.get('/UserRole/system-roles');
      const data = normalizeArray(resp.data);
      return data.slice(0, 20).map(r => ({
        id: r.id || r.Id || r.role_Id || '',
        name: r.name || r.Name || r.role_Name || '',
        description: r.description || r.Description || ''
      }));
    } catch { return []; }
  },

  async getSubscriptions() {
    try {
      const data = await subscriptionService.getUsers();
      const users = normalizeArray(data);
      return users.slice(0, 20).map(u => ({
        empCode: u.emp_Code || u.empCode || '',
        name: u.emp_Name || u.empName || '',
        firstLogin: u.first_Login || u.firstLogin || '',
        expiry: u.expiry_Date || u.expiry || '',
        status: u.status || u.Status || ''
      }));
    } catch { return []; }
  },

  async getPricingPlans() {
    try {
      const data = await subscriptionPlanService.getAllPlans();
      return normalizeArray(data).slice(0, 20).map(p => ({
        id: p.id || p.Id || p.plan_Id || '',
        name: p.plan_Name || p.planName || p.Name || '',
        price: p.price || p.Price || 0,
        billingCycle: p.billing_Cycle || p.billingCycle || '',
        maxUsers: p.max_Users || p.maxUsers || 0,
        maxCompanies: p.max_Companies || p.maxCompanies || 0,
        isActive: p.is_Active || p.isActive || false
      }));
    } catch { return []; }
  },

  async getReviews() {
    try {
      const data = await reviewService.getAllReviews();
      return normalizeArray(data).slice(0, 20).map(r => ({
        id: r.id || r.Id || r.review_Id || '',
        employee: r.emp_Name || r.empName || '',
        rating: r.rating || r.Rating || 0,
        comment: r.comment || r.Comment || '',
        status: r.status || r.Status || 'Pending',
        date: r.created_At || r.createdAt || r.Date || ''
      }));
    } catch { return []; }
  },

  async getAds() {
    try {
      const data = await adService.getAllAds();
      return normalizeArray(data).slice(0, 20).map(a => ({
        id: a.id || a.Id || a.ad_Id || '',
        title: a.title || a.Title || a.ad_Title || '',
        description: a.description || a.Description || '',
        isActive: a.is_Active || a.isActive || false,
        location: a.location || a.Location || '',
        placement: a.placement || a.Placement || ''
      }));
    } catch { return []; }
  },

  async getLogs() {
    try {
      const data = await systemLogService.getAllLogs();
      return normalizeArray(data).slice(0, 30).map(l => ({
        id: l.id || l.Id || l.log_Id || '',
        action: l.action || l.Action || l.action_Name || '',
        user: l.user || l.User || l.emp_Name || '',
        date: l.date || l.Date || l.created_At || '',
        details: l.details || l.Details || l.description || ''
      }));
    } catch { return []; }
  },

  async getBackups() {
    try {
      const data = await backupService.getHistory();
      return normalizeArray(data).slice(0, 20).map(b => ({
        name: b.file_Name || b.fileName || b.name || '',
        date: b.created_At || b.createdAt || b.date || '',
        size: b.file_Size || b.fileSize || b.size || '',
        type: b.backup_Type || b.backupType || b.type || ''
      }));
    } catch { return []; }
  },

  async getFeedback() {
    try {
      const resp = await api.get('/reportfeedback/all');
      return normalizeArray(resp.data).slice(0, 20).map(f => ({
        id: f.id || f.Id || '',
        employee: f.emp_Name || f.empName || '',
        company: f.company_Name || f.companyName || '',
        report: f.report_Name || f.reportName || '',
        comment: f.feedback_Text || f.feedbackText || f.comment || '',
        date: f.created_At || f.createdAt || f.date || ''
      }));
    } catch { return []; }
  },

  async getStats() {
    try {
      const resp = await api.get('/SuperAdmin/hierarchy');
      const hierarchy = normalizeArray(resp.data);
      const totalCompanies = hierarchy.reduce((acc, emp) => acc + (emp.companies?.length || 0), 0);
      return {
        totalEmployees: hierarchy.length,
        totalCompanies,
        totalEntities: hierarchy.length + totalCompanies
      };
    } catch { return { totalEmployees: 0, totalCompanies: 0, totalEntities: 0 }; }
  },

  async getPendingResets() {
    try {
      const resp = await api.get('/SuperAdmin/pending-resets');
      return normalizeArray(resp.data);
    } catch { return []; }
  },

  async searchInSystem(query) {
    const q = query.toLowerCase();
    const results = {};
    try {
      const [companies, employees] = await Promise.allSettled([
        this.getCompanies(),
        this.getEmployees()
      ]);
      if (companies.value) {
        const match = companies.value.filter(c =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
        if (match.length) results.companies = match;
      }
      if (employees.value) {
        const match = employees.value.filter(e =>
          e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
        );
        if (match.length) results.employees = match;
      }
    } catch {}
    return results;
  }
};
