import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { 
  Bell, 
  Save, 
  List, 
  X, 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { reminderService } from '../services/reminder.service';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/modals/ConfirmModal';

const ReminderBoard = ({ isOpen, onClose, onViewAll, taskToEdit }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const [formData, setFormData] = useState({
        task: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                const dateParts = (taskToEdit.date || taskToEdit.Date || '').split('/');
                let formattedInputDate = '';
                if (dateParts.length === 3) {
                    formattedInputDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                }
                
                setFormData({
                    task: taskToEdit.task || taskToEdit.Task || '',
                    date: formattedInputDate || new Date().toISOString().split('T')[0],
                    time: taskToEdit.time || taskToEdit.Time || '10:30 AM'
                });
            } else {
                setFormData({
                    task: '',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                });
            }
        }
    }, [isOpen, taskToEdit]);

    const handleSave = () => {
        if (!formData.task.trim()) {
            toast.error('Please enter a task description.');
            return;
        }
        setShowConfirm(true);
    };

    const confirmSave = async () => {
        setShowConfirm(false);
        try {
            const dateParts = formData.date.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formData.date;
            
            if (taskToEdit) {
                const id = taskToEdit.id_No || taskToEdit.Id_No || taskToEdit.idNo;
                await reminderService.updateReminder(id, {
                    ...formData,
                    date: formattedDate
                });
                toast.success('Task Updated Successfully..');
            } else {
                await reminderService.addReminder({
                    ...formData,
                    date: formattedDate
                });
                toast.success('Task Saved Successfully..');
            }
            onClose();
        } catch (error) {
            console.error('Error saving reminder:', error);
            toast.error('Failed to save task.');
        }
    };

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [viewDate]);

    const handleDateSelect = (day) => {
        const y = viewDate.getFullYear();
        const m = String(viewDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        setFormData(prev => ({ ...prev, date: dateStr }));
        setShowDatePicker(false);
    };

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title={taskToEdit ? "Edit Task" : "Add Task"}
            maxWidth="max-w-[540px]"
            footer={
                <div className="flex items-center justify-between w-full px-6 h-16 bg-slate-50 border-t border-slate-200">
                    {!taskToEdit && (
                        <button 
                            onClick={onViewAll}
                            className="flex items-center gap-2 px-5 h-10 bg-white border border-slate-300 text-[#0078d4] text-sm font-bold rounded-md hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 whitespace-nowrap min-w-fit"
                        >
                            <List size={16} /> All Task
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button 
                            onClick={handleSave}
                            className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md hover:bg-blue-600 shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap min-w-fit"
                        >
                            <Save size={16} /> {taskToEdit ? 'Update Task' : 'Save Task'}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="px-6 h-10 bg-white border border-slate-300 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap min-w-fit"
                        >
                            <X size={16} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col font-['Plus_Jakarta_Sans'] bg-white">
                <div className="flex items-center justify-between p-7 pb-3">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 flex items-center justify-center transform hover:scale-105 transition-transform cursor-pointer overflow-hidden p-1">
                             <DotLottiePlayer
                                src="/lottiefile/todo.lottie"
                                autoplay
                                loop
                                className="w-full h-full scale-125"
                             />
                        </div>
                        <div>
                            <h1 className="text-[22px] font-black text-[#0078d4] tracking-tight select-none leading-none">
                                {taskToEdit ? 'Edit Task' : 'Add Reminder'}
                            </h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                                Tasks & Reminders
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-6">
                    {/* The Inner Box for the form */}
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                        
                        {/* Task Field First (Primary Focus) */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block pl-0.5">Task Description</label>
                            <div className="w-full bg-slate-50/50 border border-slate-200 rounded-xl focus-within:border-[#0078d4] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden">
                                <textarea 
                                    value={formData.task}
                                    onChange={(e) => setFormData({...formData, task: e.target.value})}
                                    className="w-full h-[200px] p-3 text-[14px] font-bold text-slate-700 focus:outline-none resize-none overflow-y-auto bg-transparent leading-relaxed"
                                    spellCheck="false"
                                    placeholder="What needs to be done?"
                                />
                            </div>
                        </div>

                        {/* Date & Time Row (Ordered and Compact) */}
                        <div className="grid grid-cols-2 gap-5">
                            {/* Date Field */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block pl-0.5">Date</label>
                                <div className="flex items-center border border-slate-200 hover:border-[#0078d4] bg-slate-50/50 hover:bg-white transition-all overflow-hidden rounded-xl shadow-sm group">
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={formatDateForDisplay(formData.date)}
                                        className="w-full h-10 px-3 text-[13px] font-bold text-slate-700 outline-none select-none bg-transparent"
                                    />
                                    <button 
                                        onClick={() => setShowDatePicker(true)}
                                        className="h-10 w-10 border-l border-slate-200 bg-slate-100/50 flex items-center justify-center hover:bg-blue-50 text-[#0078d4] transition-colors"
                                    >
                                        <Calendar size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Time Field */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block pl-0.5">Time</label>
                                <div className="relative flex items-center border border-slate-200 hover:border-[#0078d4] bg-slate-50/50 hover:bg-white transition-all overflow-hidden rounded-xl shadow-sm group">
                                    <Clock size={16} className="absolute left-3 text-slate-400 group-hover:text-[#0078d4] z-10" />
                                    <input 
                                        type="text" 
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        placeholder="11:16 AM"
                                        className="w-full h-10 pl-10 pr-3 text-[13px] font-bold text-slate-700 outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmSave}
                title={taskToEdit ? "Update Task" : "Confirm Task"}
                message={taskToEdit ? "Are you sure you want to update this task?" : "Are you sure you want to save this Task?"}
            />

            <SimpleModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} title="Select Task Date" maxWidth="max-w-[320px]">
                <div className="p-1 px-2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all"><ChevronLeft size={18} /></button>
                        <span className="text-[14px] font-bold text-slate-700">{viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}</span>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-all"><ChevronRight size={18} /></button>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={i} className="h-8" />;
                            // Fix: Use local date components to avoid ISO timezone shift
                            const y = viewDate.getFullYear();
                            const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                            const d = String(day).padStart(2, '0');
                            const currentDayStr = `${y}-${m}-${d}`;
                            const isSelected = formData.date === currentDayStr;
                            
                            return (
                                <button key={i} onClick={() => handleDateSelect(day)} className={`h-8 w-8 text-[12px] font-bold rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-[#0078d4] text-white' : 'hover:bg-slate-100'}`}>
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SimpleModal>
        </SimpleModal>
    );
};

export default ReminderBoard;
