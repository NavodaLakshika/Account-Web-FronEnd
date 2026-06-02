import React, { useState, useEffect } from 'react';
import { Save, Calendar, Clock, X, Bell, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

const ToDoListBoard = ({ isOpen, onClose }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review financial reports for Q2', done: false },
        { id: 2, text: 'Submit vendor payment approvals', done: true },
        { id: 3, text: 'Audit trail reconciliation', done: false },
    ]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isOpen) return null;

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);
        setNewTask('');
        toast.success('Task added', { className: 'text-xs font-bold' });
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Calendar size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Reminder & To-Do List</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">{today}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="select-none space-y-5">
                        <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-amber-50 rounded-xl animate-pulse" />
                                    <Bell size={24} className="text-amber-500 relative z-10" />
                                </div>
                                <div>
                                    <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest leading-none">Task Board</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">{today}</p>
                                </div>
                            </div>
 <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-sm shadow-sm ">
                                <Clock size={14} className="text-[#4f83ff]" />
                                <span className="text-[14px] font-black text-slate-700 font-mono tracking-wider">{currentTime}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                placeholder="Enter a new task..."
                                className="flex-1 h-8 px-3 border border-slate-200 rounded-[5px] text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm placeholder:text-slate-300"
                            />
                            <button
                                onClick={addTask}
                                className="w-10 h-8 bg-[#0285fd] hover:bg-[#0073ff] text-white rounded-[5px] flex items-center justify-center transition-all active:scale-95 shadow-sm border-none"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>

 <div className=" rounded-sm overflow-hidden shadow-sm bg-white">
                            <div className="max-h-[320px] overflow-y-auto no-scrollbar divide-y divide-slate-50">
                                {tasks.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <CheckCircle2 size={40} strokeWidth={1} className="text-slate-200 mx-auto mb-3" />
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[3px]">No tasks yet</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 px-5 py-3.5 group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="shrink-0 focus:outline-none"
                                            >
                                                {task.done ? (
                                                    <CheckCircle2 size={20} className="text-green-500 fill-green-500/10" />
                                                ) : (
                                                    <Circle size={20} className="text-slate-300 group-hover:text-[#4f83ff] transition-colors" />
                                                )}
                                            </button>
                                            <span
                                                className={`flex-1 text-[13px] font-bold transition-all ${
                                                    task.done
                                                        ? 'text-slate-300 line-through'
                                                        : 'text-slate-700'
                                                }`}
                                            >
                                                {task.text}
                                            </span>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6 py-4 rounded-b-[5px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {tasks.filter(t => !t.done).length} pending tasks
                    </span>
                    <button
                        onClick={() => {
                            localStorage.setItem('todo_tasks', JSON.stringify(tasks));
                            toast.success('Tasks saved', { className: 'text-xs font-bold' });
                            onClose();
                        }}
                        className="px-8 h-10 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center gap-2 border-none"
                    >
                        <Save size={14} /> SAVE & CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToDoListBoard;
