import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscription.service';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { Loader2, Search, CalendarClock, CreditCard, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import ConfirmModal from '../modals/ConfirmModal';
import PlanEditorModal from './PlanEditorModal';

const SubscriptionAdminBoard = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);
  const [newStatus, setNewStatus] = useState('Active');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, loading: false });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPlans();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await subscriptionPlanService.getAllPlans();
      if (!data || data.length === 0) {
          await subscriptionPlanService.initTable();
          const newData = await subscriptionPlanService.getAllPlans();
          setPlans(newData || []);
      } else {
          setPlans(data);
      }
    } catch (err) {
      showErrorToast('Failed to fetch pricing plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleDeletePlan = (id) => {
    setDeleteConfirm({ isOpen: true, id, loading: false });
  };

  const executeDeletePlan = async () => {
    setDeleteConfirm(prev => ({ ...prev, loading: true }));
    try {
      await subscriptionPlanService.deletePlan(deleteConfirm.id);
      showSuccessToast('Plan deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null, loading: false });
      fetchPlans();
    } catch (err) {
      showErrorToast('Failed to delete plan');
      setDeleteConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await subscriptionService.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUpdatingUser(true);
    try {
      const res = await subscriptionService.updateSubscription(selectedUser.emp_Code, extendMonths, newStatus);
      if (res.success) {
        showSuccessToast('Subscription updated successfully');
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      showErrorToast(err.message || 'Update failed');
    } finally {
      setUpdatingUser(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.emp_Name?.toLowerCase().includes(search.toLowerCase()) || 
    u.emp_Code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-100 dark:bg-white/5 backdrop-blur-md shadow-lg border border-slate-300 dark:border-white/10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-[12px] overflow-hidden mb-6 min-h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-300 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#0c0c0c]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center rounded-none">
            <CalendarClock className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Subscription & Pricing Management</h2>
            <p className="text-[11px] text-gray-400 font-medium">Manage employee subscriptions and pricing plans</p>
          </div>
        </div>
        {activeTab === 'plans' && (
          <div className="flex items-center gap-3 self-start">
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowPlanEditor(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-800 dark:text-white text-xs font-bold rounded-none transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              Create Plan
            </button>
          </div>
        )}
      </div>

      {/* Selector Bar */}
      <div className="bg-slate-50 dark:bg-[#0c0c0c] p-4 border border-slate-300 dark:border-white/10 mx-6 flex flex-col gap-4 rounded-none shadow-inner">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Select View:</span>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${activeTab === 'users'
                ? 'bg-[#0078d4] text-white shadow-sm border border-[#0078d4]'
: 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-600 dark:text-gray-300'
              }`}
            >
              User Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${activeTab === 'plans'
                ? 'bg-amber-600 text-slate-800 dark:text-white shadow-sm border border-amber-600'
: 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-600 dark:text-gray-300'
              }`}
            >
              Pricing Plans
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white text-xs w-full outline-none focus:border-[#0078d4] focus:bg-slate-200 dark:bg-white/10 rounded-none transition-all placeholder:text-gray-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="border border-slate-300 dark:border-white/10 overflow-hidden mx-6 bg-slate-100 dark:bg-white/5 rounded-none shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0c0c0c]/80 border-b border-slate-300 dark:border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Emp Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">First Login</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {loadingUsers ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[13px] text-gray-500 font-medium">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.emp_Code} className="hover:bg-slate-100 dark:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-[13px] text-slate-800 dark:text-white font-bold">{user.emp_Code}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-800 dark:text-gray-200 font-bold">{user.emp_Name}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-400 font-medium">
                        {user.first_Login_Date ? new Date(user.first_Login_Date).toLocaleDateString() : <span className="text-gray-600">Never</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-400 font-medium">
                        {user.subscription_End_Date ? new Date(user.subscription_End_Date).toLocaleDateString() : <span className="text-gray-600">N/A</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-none ${
                          user.subscription_Status === 'Trial' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' :
                          user.subscription_Status === 'Active' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' :
                          'bg-red-600/20 text-red-400 border-red-500/50'
                        }`}>
                          {user.subscription_Status || 'Trial'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setExtendMonths(1);
                            setNewStatus(user.subscription_Status || 'Active');
                          }}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-none transition-all bg-blue-600 text-white shadow-sm border border-blue-500 hover:bg-blue-500 flex items-center gap-1 ml-auto"
                        >
                          <CreditCard size={10} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="mx-6">
          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-400" />
              <span className="text-xs font-medium">Loading pricing plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500 border border-dashed border-white/20 bg-slate-100 dark:bg-white/5">
              <CreditCard size={40} className="text-gray-600" />
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-400 mb-1">No Pricing Plans Found</p>
                <p className="text-[11px] text-gray-500 font-medium">Create your first pricing plan to get started.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanEditor(true);
                }}
                className="px-6 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold rounded-none transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> Create Pricing Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 shadow-sm flex flex-col relative transition-all hover:bg-white/[0.07]">
                  {!plan.isActive && (
                    <div className="absolute top-4 right-4 bg-red-600/20 text-red-400 text-[10px] font-bold px-2 py-1 border border-red-500/50 uppercase tracking-widest">
                      Inactive
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{plan.planName}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800 dark:text-white">${plan.price}</span>
                      <span className="text-gray-400 text-sm font-medium">/{plan.billingCycle.toLowerCase()}</span>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-400 font-medium">Max Users</span>
                        <span className="font-bold text-slate-800 dark:text-white">{plan.maxUsers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-gray-400 font-medium">Max Companies</span>
                        <span className="font-bold text-slate-800 dark:text-white">{plan.maxCompanies}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-medium">Status</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${plan.isActive ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-200 dark:bg-white/10 text-gray-400 border-white/20'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-300 dark:border-white/10 p-4 flex gap-2 bg-black/20">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanEditor(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 py-2 text-xs font-bold transition-all rounded-none uppercase tracking-wider"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 px-3 py-2 text-xs font-bold transition-all rounded-none uppercase tracking-wider"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage User Modal */}
            {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-none">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Manage Subscription</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-slate-200 dark:bg-white/10 transition-colors rounded-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">User</p>
                <p className="text-[15px] font-bold text-slate-800 dark:text-white">{selectedUser.emp_Name} <span className="text-gray-400 font-mono">({selectedUser.emp_Code})</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Extend By (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={extendMonths}
                  onChange={e => setExtendMonths(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-200/50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white text-sm outline-none focus:border-[#0078d4] focus:bg-slate-100 dark:bg-white/5 transition-all rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Trial', 'Active', 'Expired'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status)}
                      className={`px-3 py-2 text-xs font-bold rounded-none transition-all ${
                        newStatus === status
                          ? status === 'Trial' ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                            : status === 'Active' ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                            : 'bg-red-600 text-white shadow-sm border border-red-600'
                          : 'bg-slate-100 dark:bg-white/5 border border-white/20 text-gray-400 hover:bg-slate-200 dark:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-white/10 transition-all rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="flex-1 px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all rounded-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updatingUser ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, loading: false })}
        onConfirm={executeDeletePlan}
        title="Delete Pricing Plan"
        message="Are you sure you want to permanently delete this pricing plan? This action cannot be undone."
        loading={deleteConfirm.loading}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <PlanEditorModal
        isOpen={showPlanEditor}
        onClose={() => setShowPlanEditor(false)}
        editingPlan={editingPlan}
        onSaveSuccess={fetchPlans}
      />
    </div>
  );
};

export default SubscriptionAdminBoard;




