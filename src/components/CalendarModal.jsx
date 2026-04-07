import React, { useState } from 'react';
import SimpleModal from './SimpleModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, onDateSelect, initialDate }) => {
    const [viewDate, setViewDate] = useState(initialDate ? new Date(initialDate) : new Date());

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

    const handleDateClick = (day) => {
        const selected = new Date(currentYear, currentMonth, day);
        // Format as YYYY-MM-DD for consistency with <input type="date">
        const formatted = selected.toISOString().split('T')[0];
        onDateSelect(formatted);
        onClose();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    // Calculate grid
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title="Select System Date" maxWidth="max-w-[340px]">
            <div className="p-4 font-['Tahoma'] select-none">
                <div className="flex items-center justify-between mb-6 bg-slate-50 p-2 rounded-lg border border-gray-100">
                    <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all active:scale-90"><ChevronLeft size={20} className="text-gray-600" /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-[14px] font-black text-blue-600 uppercase tracking-widest">{months[currentMonth]}</span>
                        <span className="text-[11px] font-bold text-gray-400">{currentYear}</span>
                    </div>
                    <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all active:scale-90"><ChevronRight size={20} className="text-gray-600" /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => (
                        <div key={idx} className="h-10 flex items-center justify-center">
                            {day ? (
                                <button
                                    onClick={() => handleDateClick(day)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-bold transition-all
                                        ${isToday(day) ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-slate-100 text-gray-700'}
                                        active:scale-95 shadow-sm hover:shadow-md
                                    `}
                                >
                                    {day}
                                </button>
                            ) : (
                                <div className="w-9 h-9" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase ">
                        <CalendarIcon size={12} /> Financial Period 2026/27
                    </div>
                    <button onClick={() => handleDateClick(new Date().getDate())} className="text-[11px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">Today</button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CalendarModal;
