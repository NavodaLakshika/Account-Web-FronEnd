import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscription.service';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { Loader2, Search, CalendarClock, CreditCard, Plus, Edit, Trash2, CheckCircle, XCircle, UserCheck } from 'lucide-react';
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6 mb-6">
      {/* Header Container */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-lg border border-indigo-100 shadow-sm">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-800 tracking-tight leading-none mb-1">Subscription & Pricing Management</h2>
              <p className="text-[12px] text-gray-500 font-medium">Configure network pricing plans and manage client tier authorizations</p>
            </div>
          </div>

          {activeTab === 'plans' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanEditor(true);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={14} />
                Register Plan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Config & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-nowrap items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
            >
              Active Profiles
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex-1 md:flex-none text-center whitespace-nowrap ${activeTab === 'plans'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
            >
              Pricing Matrix
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search client profiles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 bg-white shadow-sm text-gray-800 text-xs w-full outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg transition-all placeholder:text-gray-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          {loadingUsers ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <span className="text-[12px] font-bold">Scanning user directory...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
              <UserCheck className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-[15px] font-bold text-gray-700">No Subscriber Matches</h3>
              <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                There are no active system users matching your current criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map(user => (
                <div key={user.emp_Code} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col relative">
                  {/* Top Status Gradient indicator */}
                  <div className={`h-1.5 w-full absolute top-0 left-0 ${user.subscription_Status === 'Trial' ? 'bg-blue-500' :
                      user.subscription_Status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />

                  <div className="p-5 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                        {(user.emp_Name || 'U')[0]}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800 leading-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-1">{user.emp_Name}</h3>
                        <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider">ID: {user.emp_Code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Auth Status</span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-sm ${user.subscription_Status === 'Trial' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          user.subscription_Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-red-50 text-red-600 border-red-200'
                        }`}>
                        {user.subscription_Status || 'Trial'}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500">First Login</span>
                        <span className="text-[12px] font-bold text-gray-700">
                          {user.first_Login_Date ? new Date(user.first_Login_Date).toLocaleDateString() : <span className="text-gray-300">Never</span>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500">Expiry Date</span>
                        <span className="text-[12px] font-bold text-gray-800">
                          {user.subscription_End_Date ? new Date(user.subscription_End_Date).toLocaleDateString() : <span className="text-gray-300 font-medium">Undefined</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setExtendMonths(1);
                        setNewStatus(user.subscription_Status || 'Active');
                      }}
                      className="px-4 py-2 w-full text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 shadow-sm rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <CreditCard size={14} /> Update Auth Policy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          {loadingPlans ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <span className="text-[12px] font-bold">Scanning pricing matrix...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
              <CreditCard size={48} className="text-gray-300 mb-4" />
              <h3 className="text-[15px] font-bold text-gray-700">Matrix Unconfigured</h3>
              <p className="text-[13px] text-gray-500 mt-1 max-w-sm mb-6">
                The system requires valid pricing policies to allow external registrations.
              </p>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanEditor(true);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> System Override: Create Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-white rounded-2xl border transition-all flex flex-col group overflow-hidden ${plan.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-200 bg-gray-50/50 grayscale'}`}>

                  <div className={`p-6 border-b flex flex-col gap-1 ${plan.isActive ? 'border-gray-50 bg-white' : 'border-gray-200 bg-gray-100/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${plan.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-300'
                        }`}>
                        {plan.isActive ? 'Operational' : 'Suspended'}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-black text-gray-800 uppercase tracking-tight line-clamp-1">{plan.planName}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-[32px] font-black text-blue-600 leading-none">
                        <span className="text-[20px] text-gray-400 font-bold">$</span>{plan.price}
                      </span>
                      <span className="text-gray-400 text-[11px] font-black uppercase tracking-widest ml-1">/{plan.billingCycle}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-4 bg-gray-50/30 border-b border-gray-50">
                    <div className="flex items-center justify-between text-[12px] font-medium border-b border-dashed border-gray-200 pb-3">
                      <span className="text-gray-500 font-bold">Max Operator Slots</span>
                      <span className="font-black text-gray-800 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{plan.maxUsers}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] font-medium border-b border-dashed border-gray-200 pb-3">
                      <span className="text-gray-500 font-bold">Max Company Registries</span>
                      <span className="font-black text-gray-800 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{plan.maxCompanies}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] font-medium">
                      <span className="text-gray-500 font-bold">Storage Allowance</span>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm border border-indigo-100">Unlimited</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanEditor(true);
                      }}
                      className="flex-1 py-2 text-[11px] font-bold text-white bg-gray-800 hover:bg-gray-900 shadow-sm border border-gray-800 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit size={14} /> Refactor
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-3 py-2 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm rounded-lg transition-all flex items-center justify-center"
                      title="Permanently Delete Plan"
                    >
                      <Trash2 size={14} />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                <CreditCard size={18} /> Modify Policy
              </h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors rounded-lg">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-6">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center font-black text-gray-500 uppercase">
                  {(selectedUser.emp_Name || 'U')[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Object</p>
                  <p className="text-[14px] font-bold text-gray-800 leading-tight uppercase">{selectedUser.emp_Name}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Policy Duration (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={extendMonths}
                  onChange={e => setExtendMonths(parseInt(e.target.value) || 0)}
                  className="w-full text-center px-4 h-12 text-[18px] font-black text-blue-600 bg-white shadow-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Operational State</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Trial', 'Active', 'Expired'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status)}
                      className={`px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${newStatus === status
                          ? status === 'Trial' ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1'
                            : status === 'Active' ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-1'
                              : 'bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-1'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 h-12 bg-gray-50 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-100 border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-widest shadow-md transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updatingUser ? <><Loader2 className="animate-spin" size={14} /> Processing...</> : 'Save Configuration'}
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
        title="Eradicate Protocol"
        message="Are you sure you want to permanently purge this pricing plan? Existing bindings will remain active until cyclic expiration."
        loading={deleteConfirm.loading}
        confirmText="Purge Record"
        cancelText="Disengage"
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
