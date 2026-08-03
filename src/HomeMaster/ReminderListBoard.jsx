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
  CheckCircle,
  FileText,
  Download
} from "lucide-react";
import { reminderService } from "../services/reminder.service";
import ConfirmModal from "../components/modals/ConfirmModal";
import * as XLSX from 'xlsx';

import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';


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

  const handleDownloadReport = () => {
    if (filteredReminders.length === 0) {
      showErrorToast("No tasks available to export.");
      return;
    }

    const data = filteredReminders.map((r, idx) => ({
      "#": idx + 1,
      "Date": r.date || r.Date,
      "Time": r.time || r.Time,
      "Task Details": r.task || r.Task,
      "Status": (r.expire || r.Expire) === 'T' ? "Completed" : "Pending"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 60 },
      { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reminders");

    XLSX.writeFile(workbook, `Reminders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccessToast("Report downloaded successfully!");
  };

  return (
    <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
      isOpen={isOpen}
      onClose={onClose}
      title="Reminders"
      maxWidth="max-w-[700px]"
      footer={
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
          <div className="flex gap-4">
            <button
              onClick={handleDownloadReport}
              className="px-6 h-10 border border-[#0078d4] text-[#0078d4] hover:bg-blue-50 font-bold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 uppercase tracking-wide"
            >
              <Download size={14} fill="currentColor" className="opacity-80" /> EXPORT REPORT
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 tracking-wide uppercase"
            >
              <X size={14} /> CLOSE
            </button>
          </div>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-[3px] text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
            />
          </div>

          <button
            onClick={fetchTasks}
            className="p-2.5 h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-[3px] text-slate-500 hover:text-[#0078d4] hover:border-blue-200 transition-all shadow-sm"
          >
            <RefreshCcw size={18} className={(loading && !deleteConfirm.show) ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f8faff] border-y border-slate-200">
              <tr>
                <th className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">#</th>
                <th className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">Date</th>
                <th className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">Time</th>
                <th className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">Task Details</th>
                <th className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !deleteConfirm.show ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCcw size={32} className="text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Loading Tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">No tasks found</span>
                  </td>
                </tr>
              ) : filteredReminders.map((r, idx) => (
                <tr key={r.id_No || r.Id_No} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 h-10 text-center text-slate-600 text-sm font-bold border border-slate-100">{idx + 1}</td>
                  <td className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase">
                      <CalendarIcon size={12} className="text-slate-500 dark:text-slate-400" />
                      {r.date || r.Date}
                    </div>
                  </td>
                  <td className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-xs uppercase">
                      <Clock size={12} className="text-slate-500 dark:text-slate-400" />
                      {r.time || r.Time}
                    </div>
                  </td>
                  <td className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">
                    <p className={`text-sm font-medium text-slate-600 leading-tight ${(r.expire || r.Expire) === 'T' ? 'line-through opacity-40 text-slate-500 dark:text-slate-400' : ''}`}>
                      {r.task || r.Task}
                    </p>
                  </td>
                  <td className="px-6 h-10 text-slate-600 text-sm font-bold border border-slate-100">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditTask(r)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-[3px] transition-all"
                        title="Edit Task"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, id: r.id_No || r.Id_No })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-[3px] transition-all"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                      {(r.expire || r.Expire) === 'F' && (
                        <button
                          onClick={() => handleToggleExpire(r.id_No || r.Id_No, r.expire || r.Expire)}
                          className="p-2 text-green-500 hover:bg-blue-50 rounded-[3px] transition-all"
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
    </TransactionFormWrapper>
  );
};

export default ReminderListBoard;




