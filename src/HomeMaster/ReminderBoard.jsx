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
import CalendarModal from '../components/CalendarModal';

const ReminderBoard = ({ isOpen, onClose, onViewAll, taskToEdit }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

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
            } else {
                await reminderService.addReminder({
                    ...formData,
                    date: formattedDate
                });
            }

            // High-fidelity Success Toast (Mirrors AuthPage Login Success)
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                    max-w-[320px] w-full bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                    <div className="px-4 py-2 flex items-center gap-3">
                        <div className="w-12 h-12 shrink-0">
                            <DotLottiePlayer
                                src="/lottiefile/Successffull.lottie"
                                autoplay
                                loop={false}
                            />
                        </div>
                        <div className="flex-grow text-left">
                            <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma truncate">Task Processed</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Saved Successfully</span>
                            </div>
                        </div>
                        <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    {/* Progress Bar Timer */}
                    <div className="h-[2px] w-full bg-emerald-50">
                        <div 
                            className="h-full bg-emerald-500"
                            style={{ animation: 'toastProgress 3s linear forwards' }}
                        />
                    </div>
                </div>
            ), {
                duration: 3000,
                position: 'top-right'
            });

            onClose();
        } catch (error) {
            console.error('Error saving reminder:', error);
            toast.error('Failed to save task.');
        }
    };

    const handleDateSelect = (dateStr) => {
        setFormData(prev => ({ ...prev, date: dateStr }));
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

            <CalendarModal 
                isOpen={showDatePicker} 
                onClose={() => setShowDatePicker(false)} 
                onDateSelect={handleDateSelect}
                initialDate={formData.date}
            />
        </SimpleModal>
    );
};

export default ReminderBoard;
