import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscription.service';
import { subscriptionPlanService } from '../../services/subscriptionPlan.service';
import { Loader2, Search, UserCheck, ShieldAlert, CalendarClock, CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import PlanEditorModal from './PlanEditorModal';

const SubscriptionAdminBoard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'plans'
  
  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);
  const [newStatus, setNewStatus] = useState('Active');

  // Plans State
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

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
          // If no plans, try to initialize once
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

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await subscriptionPlanService.deletePlan(id);
      showSuccessToast('Plan deleted');
      fetchPlans();
    } catch (err) {
      showErrorToast('Failed to delete plan');
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
    try {
      const res = await subscriptionService.updateSubscription(selectedUser.emp_Code, extendMonths, newStatus);
      if (res.success) {
        showSuccessToast('Subscription updated');
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      showErrorToast(err.message || 'Update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.emp_Name?.toLowerCase().includes(search.toLowerCase()) || 
    u.emp_Code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Subscription & Pricing Management</h2>
            <p className="text-[11px] text-slate-500 font-medium">Manage employee free trials and subscription pricing plans</p>
          </div>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-[12px]">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                User Subscriptions
            </button>
            <button 
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${activeTab === 'plans' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Pricing Plans
            </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex items-center justify-end mb-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-100/60 border border-slate-200/60 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 bg-white shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Emp Code</th>
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Name</th>
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">First Login</th>
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Expiry Date</th>
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                <th className="text-right px-5 py-3">Action</th></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.emp_Code} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-[13px] text-slate-900 font-bold">{user.emp_Code}</td>
                  <td className="py-3.5 px-6 text-[13px] text-slate-900 font-bold">{user.emp_Name}</td>
                  <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">
                    {user.first_Login_Date ? new Date(user.first_Login_Date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3.5 px-6 text-[13px] text-slate-500 font-medium">
                    {user.subscription_End_Date ? new Date(user.subscription_End_Date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      user.subscription_Status === 'Trial' ? 'bg-blue-100 text-blue-700' :
                      user.subscription_Status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.subscription_Status || 'Trial'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-[#0078d4]/10 hover:bg-[#0078d4]/20 text-[#0078d4] text-xs font-bold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!loadingUsers && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[13px] text-slate-400 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* End of Users Tab */}
        </>
      ) : (
        <>
          <div className="flex items-center justify-end mb-4">
             <button 
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanEditor(true);
                }}
                className="flex items-center gap-2 bg-[#0078d4] hover:bg-[#005a9e] text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
             >
                <Plus className="w-4 h-4" /> Add New Plan
             </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingPlans ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                    Loading pricing plans...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
 <div key={plan.id} className="bg-white rounded-sm border-t-4 border-t-[#f97316] shadow-sm p-6 flex flex-col relative transition-shadow hover:shadow-md">
                            {!plan.isActive && (
                                <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-[3px] uppercase">
                                    Inactive
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-slate-800">{plan.planName}</h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-800">${plan.price}</span>
                                <span className="text-slate-500 text-sm">/{plan.billingCycle.toLowerCase()}</span>
                            </div>
                            
                            <div className="mt-6 space-y-3 flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Max Users</span>
                                    <span className="font-bold text-slate-800">{plan.maxUsers}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Max Companies</span>
                                    <span className="font-bold text-slate-800">{plan.maxCompanies}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-2">
                                <button 
                                    onClick={() => {
                                        setEditingPlan(plan);
                                        setShowPlanEditor(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-[#ea580c] py-2 rounded-[3px] text-sm font-bold transition-all"
                                >
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="flex-none p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-[3px] transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {plans.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[13px] text-slate-400 font-medium bg-white border border-dashed border-slate-200">
                            No pricing plans created yet.
                        </div>
                    )}
                </div>
            )}
          </div>
        </>
      )}

      {/* Manage User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
 <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-800">Manage Subscription</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none font-light">×</button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div>
                <p className="text-[12px] font-semibold text-slate-500 mb-1">User</p>
                <p className="text-[15px] font-bold text-slate-800 uppercase tracking-wide">{selectedUser.emp_Name} ({selectedUser.emp_Code})</p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-2">Extend By (Months)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[12px] text-[14px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={extendMonths}
                  onChange={e => setExtendMonths(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-2">Status</label>
                <div className="flex bg-slate-100/80 p-1.5 rounded-[14px] gap-1 relative border border-slate-200/60">
                  {['Trial', 'Active', 'Expired'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status)}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-[3px] transition-all duration-300 ${
                        newStatus === status 
                          ? status === 'Trial' ? 'bg-blue-500 text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]'
                            : status === 'Active' ? 'bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                            : 'bg-red-500 text-white shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
                  className="flex-1 py-3 px-4 bg-slate-100/80 text-slate-800 rounded-[12px] text-[14px] font-bold hover:bg-slate-200/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#4f46e5] text-white rounded-[12px] text-[14px] font-bold hover:bg-[#4338ca] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
