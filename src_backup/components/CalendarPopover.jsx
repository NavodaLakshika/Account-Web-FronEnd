
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
 
// Moved outside component so it's stable (no re-creation on every render)
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(Number(year), Number(month) - 1, Number(day));
    }
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            const p2 = parseInt(parts[2]);
            if (parts[2].length === 4) return new Date(p2, p1 - 1, p0); // DD-MM-YYYY
            if (parts[0].length === 4) return new Date(p0, p1 - 1, p2); // YYYY-MM-DD
        }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};
 
const CalendarPopover = ({ isOpen, onClose, onDateSelect, onDateChange, initialDate, currentDate }) => {
    const activeCallback = typeof onDateSelect === 'function' ? onDateSelect
        : typeof onDateChange === 'function' ? onDateChange
        : null;
 
    const activeDate = initialDate || currentDate;
 
    // FIX 1: Derive initial state correctly
    const [viewDate, setViewDate] = useState(() => parseDate(activeDate));
 
    // FIX 2: Sync viewDate when activeDate prop changes or popover opens
    useEffect(() => {
        if (isOpen) {
            setViewDate(parseDate(activeDate));
        }
    }, [isOpen, activeDate]);
 
    // FIX 3: Stable close-on-outside-click handler
    const handleClickOutside = useCallback((e) => {
        if (
            !e.target.closest('.calendar-popover-container') &&
            !e.target.closest('.calendar-toggle-btn')
        ) {
            onClose();
        }
    }, [onClose]);
 
    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClickOutside]);
 
    const daysOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
 
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
 
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
 
    const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
 
    // FIX 4: Parse selected date for highlighting
    const selectedDate = activeDate ? parseDate(activeDate) : null;
 
    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear;
    };
 
    // FIX 5: Check if a day matches the currently selected date
    const isSelected = (day) => {
        if (!selectedDate) return false;
        return selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear;
    };
 
    const handleDateClick = (day) => {
        const selected = new Date(currentYear, currentMonth, day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;
        if (activeCallback) activeCallback(formatted);
        onClose();
    };
 
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
 
    if (!isOpen) return null;
 
    return (
        <div className="absolute top-[100%] left-0 mt-2 z-[2000] calendar-popover-container">
            <style>{`
                @keyframes calendarSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                .calendar-animate { animation: calendarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
            `}</style>
 
            <div className="relative w-[260px] bg-white border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden calendar-animate font-sans calendar-popover-container">
                <div className="p-4 bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                        <button onClick={prevMonth} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-[4px] transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <h2 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide">
                            {months[currentMonth]} {currentYear}
                        </h2>
                        <button onClick={nextMonth} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-[4px] transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
 
                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {daysOfWeek.map((day, idx) => (
                            <div key={day} className={`h-8 flex items-center justify-center text-[11px] font-bold tracking-wider ${idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-500'}`}>
                                {day}
                            </div>
                        ))}
                    </div>
 
                    {/* Day grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => (
                            <div key={idx} className="h-10 flex items-center justify-center">
                                {day ? (
                                    <button
                                        onClick={() => handleDateClick(day)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-[4px] text-[13px] font-medium transition-all
                                            ${isSelected(day)
                                                ? 'bg-[#0077c5] text-white'
                                                : isToday(day)
                                                    ? 'border border-[#0077c5] text-[#0077c5]'
                                                    : (idx % 7 === 0 || idx % 7 === 6)
                                                        ? 'text-gray-400 hover:bg-gray-100'
                                                        : 'text-gray-800 hover:bg-gray-100'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ) : (
                                    <div className="w-9 h-9" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default CalendarPopover;
 


