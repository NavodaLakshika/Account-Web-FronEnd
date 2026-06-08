import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Clock, List, ClipboardList, Plus, CheckCircle2, Circle, Trash2, LayoutList } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { reminderService } from '../../../services/reminder.service';

const ToDoListBoard = ({ isOpen, onClose }) => {
    const [view, setView] = useState('add'); // 'add' or 'list'
    const [tasks, setTasks] = useState([]);
    
    // Form States
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    const [showCalendar, setShowCalendar] = useState(false);

    const loadTasks = async () => {
        try {
            const data = await reminderService.getReminders();
            // Optional: Map them if needed, but we can just use the DB fields directly
            setTasks(data || []);
        } catch (error) {
            console.error("Failed to fetch reminders:", error);
            showErrorToast('Failed to load tasks from database');
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadTasks();
            
            // Set default date/time when opening (YYYY-MM-DD for date, HH:MM for time)
            const now = new Date();
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toTimeString().substring(0, 5));
            
            // Default to add view
            setView('add');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!description.trim()) {
            showErrorToast('Task Description is required.');
            return;
        }
        
        try {
            const dateParts = date.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : date;
            
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedHours = h % 12 || 12;
            const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;

            await reminderService.addReminder({
                Task: description.trim(),
                Date: formattedDate,
                Time: formattedTime
            });

            showSuccessToast('Task Saved Successfully');
            setDescription('');
            
            // Reload from DB
            await loadTasks();
            setView('list');
        } catch (error) {
            showErrorToast('Failed to save task to database');
        }
    };

    const toggleTask = async (task) => {
        try {
            const expire = task.expire || task.Expire;
            if (expire === 'T') return; // already done

            const id = task.id_No || task.Id_No || task.idNo;
            await reminderService.expireReminder(id);
            await loadTasks();
        } catch (error) {
            showErrorToast('Failed to update task status');
        }
    };

    const deleteTask = async (task) => {
        try {
            const id = task.Id_No || task.id_No || task.idNo;
            await reminderService.deleteReminder(id);
            showSuccessToast('Task Deleted Successfully');
            await loadTasks();
        } catch (error) {
            showErrorToast('Failed to delete task');
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[500px] bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <button onClick={onClose} className="absolute top-6 right-6 z-10 w-8 h-8 bg-white/50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shrink-0 border-none" title="Close">
                    <X size={24} strokeWidth={1.5} />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
                    
                    {view === 'add' ? (
                        <>
                            {/* Add Task View */}
                            <div className="flex items-center gap-5 mb-8 px-2 select-none">
                                <div className="relative">
                                    <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center shadow-inner">
                                        <ClipboardList size={32} className="text-white" strokeWidth={1.5} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                        <Clock size={20} className="text-slate-800" fill="white" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#4f83ff] leading-none tracking-tight">Add Reminder</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">TASKS & REMINDERS</p>
                                </div>
                            </div>

                            <div className="space-y-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Task Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full h-28 p-3 text-sm resize-none border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                                        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all bg-white">
                                            <input 
                                                type="text" 
                                                readOnly
                                                value={date}
                                                onClick={() => setShowCalendar(true)}
                                                className="w-full h-10 px-3 text-sm font-medium outline-none text-slate-700 cursor-pointer" 
                                            />
                                            <div 
                                                onClick={() => setShowCalendar(true)} 
                                                className="w-10 h-10 flex items-center justify-center border-l border-slate-200 bg-slate-50 shrink-0 text-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
                                            >
                                                <Calendar size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Time</label>
                                        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden px-3 gap-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all bg-white cursor-pointer hover:bg-slate-50">
                                            <Clock size={16} className="text-slate-400 shrink-0" />
                                            <input 
                                                type="time" 
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="w-full h-10 text-sm font-medium outline-none text-slate-700 bg-transparent cursor-pointer" 
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* All Tasks View */}
                            <div className="flex items-center gap-4 mb-6 px-2 select-none">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <LayoutList size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 leading-none">Your Tasks</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Reminders</p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                                {tasks.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                                        <CheckCircle2 size={48} strokeWidth={1} className="mb-4 opacity-20" />
                                        <p className="text-sm font-medium text-slate-500">No tasks remaining</p>
                                        <p className="text-xs mt-1">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {tasks.map(task => {
                                            const expire = task.expire || task.Expire;
                                            const isDone = expire === 'T';
                                            const taskDesc = task.task || task.Task || 'Unnamed Task';
                                            const taskDate = task.date || task.Date || '';
                                            const taskTime = task.time || task.Time || '';
                                            const taskId = task.id_No || task.Id_No || task.idNo;
                                            
                                            return (
                                                <div key={taskId} className="flex items-start gap-3 p-4 group hover:bg-slate-50 transition-colors">
                                                    <button
                                                        onClick={() => toggleTask(task)}
                                                        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                                                    >
                                                        {isDone ? (
                                                            <CheckCircle2 size={20} className="text-green-500 fill-green-500/10" />
                                                        ) : (
                                                            <Circle size={20} />
                                                        )}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {taskDesc}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                <Calendar size={10} /> {taskDate}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                <Clock size={10} /> {taskTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTask(task)}
                                                        className="w-8 h-8 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* Footer matching modern web style */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 rounded-b-sm">
                    {view === 'add' ? (
                        <>
                            <button 
                                onClick={() => setView('list')}
                                className="h-9 px-5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 text-sm font-medium rounded-sm flex items-center gap-2 transition-colors border border-emerald-200"
                            >
                                <List size={16} /> View All Tasks
                            </button>
                            <button 
                                onClick={handleSave}
                                className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Save size={16} /> Save Task
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-medium text-slate-500">
                                {tasks.filter(t => (t.expire || t.Expire) !== 'T').length} pending {tasks.filter(t => (t.expire || t.Expire) !== 'T').length === 1 ? 'task' : 'tasks'}
                            </span>
                            <button 
                                onClick={() => setView('add')}
                                className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Plus size={16} /> Add New Task
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Calendar Modal */}
            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                onDateSelect={(d) => setDate(d)} 
                initialDate={date} 
            />
        </div>
    );
};

export default ToDoListBoard;
