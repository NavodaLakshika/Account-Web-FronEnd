import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Calendar, Clock, FileText } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import { reminderService } from '../services/reminder.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

const AddReminderBoard = ({ isOpen, onClose, editTask }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toTimeString().substring(0, 5));
            setSaving(false);
            if (editTask) {
                setDescription(editTask.task || editTask.Task || '');
                let taskDate = editTask.date || editTask.Date || '';
                let taskTime = editTask.time || editTask.Time || '';

                if (taskDate) {
                    if (taskDate.includes('/')) {
                        const parts = taskDate.split('/');
                        if (parts.length === 3) {
                            taskDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    }
                    setDate(taskDate);
                }

                if (taskTime) {
                    if (taskTime.toUpperCase().includes('AM') || taskTime.toUpperCase().includes('PM')) {
                        const isPM = taskTime.toUpperCase().includes('PM');
                        const timePart = taskTime.replace(/(AM|PM)/i, '').trim();
                        let [h, m] = timePart.split(':');
                        h = parseInt(h, 10);
                        if (isPM && h < 12) h += 12;
                        if (!isPM && h === 12) h = 0;
                        taskTime = `${h.toString().padStart(2, '0')}:${m}`;
                    }
                    setTime(taskTime);
                }
            }
        }
    }, [isOpen, editTask]);

    if (!isOpen) return null;

    const handleClear = () => {
        const now = new Date();
        setDescription('');
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().substring(0, 5));
    };

    const handleSave = async () => {
        if (!description.trim()) { showErrorToast('Task Description is required.'); return; }
        setSaving(true);
        try {
            const dateParts = date.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : date;
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedHours = h % 12 || 12;
            const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;

            if (editTask) {
                const id = editTask.id_No || editTask.Id_No || editTask.idNo;
                await reminderService.updateReminder(id, { Task: description.trim(), Date: formattedDate, Time: formattedTime });
                showSuccessToast('Task Updated Successfully');
            } else {
                await reminderService.addReminder({ Task: description.trim(), Date: formattedDate, Time: formattedTime });
                showSuccessToast('Task Saved Successfully');
            }
            onClose();
        } catch (error) {
            showErrorToast('Failed to save task to database');
        } finally { setSaving(false); }
    };

    return (
        <div className="relative overflow-hidden flex flex-col h-full bg-white border-l border-slate-100 transition-all duration-500 ease-out shrink-0 w-full md:w-[450px] lg:w-[450px]">
            {/* Header */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0285fd]/10 rounded-[3px] flex items-center justify-center">
                        <FileText size={16} className="text-[#0285fd]" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-semibold text-slate-800 leading-tight">{editTask ? 'Edit Reminder' : 'Add Reminder'}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TASKS & REMINDERS</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors"><X size={20} /></button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 font-['Tahoma'] space-y-4">
                <div className="bg-white border border-slate-200 rounded-[3px] p-4 space-y-4">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Task Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full h-28 border border-gray-300 rounded-[3px] px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                            <div className="relative">
                                <input type="text" value={date} readOnly onClick={() => setShowCalendar(true)}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 pr-10 cursor-pointer"
                                />
                                <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Time</label>
                            <div className="relative">
                                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#fcfcfc] px-5 py-4 border-t border-gray-200 shrink-0">
                <div className="flex justify-between items-center gap-3">
                    <button onClick={handleClear} className="px-5 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={14} /> CLEAR
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <span className="animate-spin">⟳</span> : <Save size={14} />} {editTask ? 'UPDATE' : 'SAVE'}
                    </button>
                </div>
            </div>

            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onDateSelect={(d) => { setDate(d); setShowCalendar(false); }} initialDate={date} />
        </div>
    );
};

export default AddReminderBoard;
