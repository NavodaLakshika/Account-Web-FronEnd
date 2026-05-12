import React, { useState, useEffect } from "react";
import SimpleModal from "../components/SimpleModal";
import { 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCcw, 
  Clock, 
  Calendar as CalendarIcon,
  X,
  CheckCircle
} from "lucide-react";
import { reminderService } from "../services/reminder.service";
import ConfirmModal from "../components/modals/ConfirmModal";
import { toast } from "react-hot-toast";
import { DotLottiePlayer } from "@dotlottie/react-player";

const ReminderListBoard = ({ isOpen, onClose, onEditTask }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1 font-['Tahoma']">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-emerald-50">
                <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 3000, position: 'top-right' });
  };

  const showErrorToast = (message) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
            max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
            <div className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                </div>
                <div className="flex-grow text-left py-1 font-['Tahoma']">
                    <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                        <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                    </div>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="h-[2px] w-full bg-red-50">
                <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
            </div>
        </div>
    ), { duration: 3000, position: 'top-right' });
  };

  useEffect(() => {
    if (isOpen) fetchTasks();
  }, [isOpen]);

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setLoading(true);
    try {
      await reminderService.deleteReminder(deleteConfirm.id);
      setReminders(prev => prev.filter(r => (r.id_No || r.Id_No) !== deleteConfirm.id));
      showSuccessToast("Task Deleted Successfully..");
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error("Error deleting task:", error);
      showErrorToast("Failed to delete task.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpire = async (id, currentExpire) => {
    try {
      if ((currentExpire || 'F') === 'F') {
        await reminderService.expireReminder(id);
        showSuccessToast("Task marked as completed.");
      }
      fetchTasks();
    } catch (error) {
      console.error("Error toggling expire:", error);
    }
  };

  const filteredReminders = reminders.filter(r => 
    (r.task || r.Task || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.date || r.Date || '').includes(searchQuery)
  );

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Reminders & Tasks"
      maxWidth="max-w-[1000px]"
      footer={
        <div className="flex items-center justify-end w-full px-6 h-16 bg-slate-50 border-t border-slate-200">
          <button 
            onClick={onClose}
            className="px-8 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
          >
            <X size={16} /> Close Report
          </button>
        </div>
      }
    >
      <style>
        {`
            @keyframes toastProgress {
                0% { width: 100%; }
                100% { width: 0%; }
            }
        `}
      </style>
      <div className="flex flex-col h-[650px] font-['Plus_Jakarta_Sans'] bg-white">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks, dates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
              />
           </div>
           
           <button 
             onClick={fetchTasks}
             className="p-2.5 h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#0078d4] hover:border-blue-200 transition-all shadow-sm"
           >
             <RefreshCcw size={18} className={(loading && !deleteConfirm.show) ? "animate-spin" : ""} />
           </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f8faff] border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left w-12 text-center">#</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left w-32 border-l border-slate-200">Date</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left w-32 border-l border-slate-200">Time</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left border-l border-slate-200">Task Details</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-32 border-l border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !deleteConfirm.show ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <RefreshCcw size={32} className="text-blue-500 animate-spin" />
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Loading Tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">No tasks found</span>
                  </td>
                </tr>
              ) : filteredReminders.map((r, idx) => (
                <tr key={r.id_No || r.Id_No} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-4 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                  <td className="px-4 py-4 border-l border-slate-100/50">
                     <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase">
                        <CalendarIcon size={12} className="text-slate-400" />
                        {r.date || r.Date}
                     </div>
                  </td>
                  <td className="px-4 py-4 border-l border-slate-100/50">
                     <div className="flex items-center gap-2 text-slate-600 font-medium text-xs uppercase">
                        <Clock size={12} className="text-slate-400" />
                        {r.time || r.Time}
                     </div>
                  </td>
                  <td className="px-4 py-4 border-l border-slate-100/50">
                    <p className={`text-sm font-medium text-slate-600 leading-tight ${(r.expire || r.Expire) === 'T' ? 'line-through opacity-40 text-slate-400' : ''}`}>
                      {r.task || r.Task}
                    </p>
                  </td>
                  <td className="px-4 py-4 border-l border-slate-100/50">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                         onClick={() => onEditTask(r)}
                         className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                         title="Edit Task"
                       >
                         <Edit3 size={16} />
                       </button>
                       <button 
                         onClick={() => setDeleteConfirm({ show: true, id: r.id_No || r.Id_No })}
                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                         title="Delete Task"
                       >
                         <Trash2 size={16} />
                       </button>
                       {(r.expire || r.Expire) === 'F' && (
                         <button 
                           onClick={() => handleToggleExpire(r.id_No || r.Id_No, r.expire || r.Expire)}
                           className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                           title="Mark Complete"
                         >
                           <CheckCircle size={16} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        variant="danger"
        loading={loading}
      />
    </SimpleModal>
  );
};

export default ReminderListBoard;
