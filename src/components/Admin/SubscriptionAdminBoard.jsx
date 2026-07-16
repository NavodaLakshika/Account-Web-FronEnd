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
    <div className="bg-white shadow-sm border border-slate-200/80 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 rounded-[5px] overflow-hidden mb-6 min-h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 flex items-center justify-center rounded-[5px]">
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Subscription & Pricing Management</h2>
            <p className="text-[11px] text-slate-500 font-medium">Manage employee subscriptions and pricing plans</p>
          </div>
        </div>
        {activeTab === 'plans' && (
          <div className="flex items-center gap-3 self-start">
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowPlanEditor(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-[3px] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} />
              Create Plan
            </button>
          </div>
        )}
      </div>

      {/* Selector Bar */}
      <div className="bg-white p-4 border border-slate-200/80 mx-6 flex flex-col gap-4 rounded-[5px] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Select View:</span>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all ${activeTab === 'users'
                ? 'bg-[#0078d4] text-white shadow-sm border border-[#0078d4]'
: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
              }`}
            >
              User Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all ${activeTab === 'plans'
                ? 'bg-amber-600 text-white shadow-sm border border-amber-600'
: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
              }`}
            >
              Pricing Plans
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50 text-slate-800 text-xs w-full outline-none focus:border-[#0078d4] rounded-[3px] transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="border border-slate-200 overflow-hidden mx-6 bg-white rounded-[3px] shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Emp Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">First Login</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingUsers ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[13px] text-slate-500 font-medium">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.emp_Code} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                      <td className="px-4 py-3 font-mono text-[13px] text-slate-800 font-bold">{user.emp_Code}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-800 font-bold">{user.emp_Name}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-500 font-medium">
                        {user.first_Login_Date ? new Date(user.first_Login_Date).toLocaleDateString() : <span className="text-slate-400">Never</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-slate-500 font-medium">
                        {user.subscription_End_Date ? new Date(user.subscription_End_Date).toLocaleDateString() : <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[3px] ${
                          user.subscription_Status === 'Trial' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          user.subscription_Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-red-50 text-red-600 border-red-200'
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
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-[3px] transition-all bg-[#0078d4] hover:bg-[#005a9e] text-white shadow-sm flex items-center gap-1 ml-auto"
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
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-400" />
              <span className="text-xs font-medium">Loading pricing plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500 border-2 border-dashed border-slate-200 bg-white">
              <CreditCard size={40} className="text-slate-400" />
              <div className="text-center">
                <p className="text-[13px] font-bold text-slate-500 mb-1">No Pricing Plans Found</p>
                <p className="text-[11px] text-slate-400 font-medium">Create your first pricing plan to get started.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanEditor(true);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-[3px] transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> Create Pricing Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white border border-slate-200 shadow-sm flex flex-col relative transition-all hover:shadow-md rounded-[5px] overflow-hidden">
                  {!plan.isActive && (
                    <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 border border-red-200 uppercase tracking-widest rounded-[3px]">
                      Inactive
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-800">{plan.planName}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800">${plan.price}</span>
                      <span className="text-slate-500 text-sm font-medium">/{plan.billingCycle.toLowerCase()}</span>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Max Users</span>
                        <span className="font-bold text-slate-800">{plan.maxUsers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Max Companies</span>
                        <span className="font-bold text-slate-800">{plan.maxCompanies}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[3px] ${plan.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-100 p-4 flex justify-end gap-2 bg-slate-50">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanEditor(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#0285fd] hover:bg-[#0073ff] rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-[3px] shadow-sm transition-all flex items-center justify-center w-[90px] gap-1.5"
                    >
                      <Trash2 size={14} /> Delete
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-[5px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-800">Manage Subscription</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors rounded-[3px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">User</p>
                <p className="text-[15px] font-bold text-slate-800">{selectedUser.emp_Name} <span className="text-slate-400 font-mono">({selectedUser.emp_Code})</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Extend By (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={extendMonths}
                  onChange={e => setExtendMonths(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:border-[#0078d4] rounded-[3px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Trial', 'Active', 'Expired'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status)}
                      className={`px-3 py-2 text-xs font-bold rounded-[3px] transition-all ${
                        newStatus === status
                          ? status === 'Trial' ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                            : status === 'Active' ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                            : 'bg-red-600 text-white shadow-sm border border-red-600'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
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
                  className="flex-1 px-5 py-2.5 bg-slate-500 hover:bg-slate-400 text-white text-xs font-bold uppercase tracking-wider rounded-[3px] transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="flex-1 px-5 py-2.5 bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all rounded-[3px] flex items-center justify-center gap-2 disabled:opacity-50"
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




