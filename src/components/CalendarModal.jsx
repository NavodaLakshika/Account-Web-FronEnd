import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, onDateSelect, initialDate }) => {
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date();
        // Handle DD/MM/YYYY format
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        }
        // Handle YYYY-MM-DD format
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return new Date(year, month - 1, day);
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const [viewDate, setViewDate] = useState(parseDate(initialDate));

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

    React.useEffect(() => {
        if (isOpen) {
            setViewDate(parseDate(initialDate));
        }
    }, [isOpen, initialDate]);

    const handleDateClick = (day, specificDate = null) => {
        const selected = specificDate || new Date(currentYear, currentMonth, day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        const formatted = `${dd}/${mm}/${yyyy}`;
        onDateSelect(formatted);
        onClose();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/10"
            onClick={onClose}
        >
            <style>
                {`
                    @keyframes calendarSlideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .calendar-animate {
                        animation: calendarSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}
            </style>
            
            <div 
                className="relative w-full max-w-[360px] bg-white rounded-[15px] shadow-2xl overflow-hidden calendar-animate font-['Tahoma',_sans-serif]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Blue Header */}
                <div className="bg-[#0388cc] pt-8 pb-4 px-6 text-white relative">
                    
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="hover:bg-white/10 p-1 rounded-full transition-all active:scale-90"><ChevronLeft size={20} /></button>
                        <h2 className="text-[30px] font-mono font-bold tracking-tighter uppercase">{months[currentMonth]}</h2>
                        <button onClick={nextMonth} className="hover:bg-white/10 p-1 rounded-full transition-all active:scale-90"><ChevronRight size={20} /></button>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="bg-white/10 px-3 py-1 rounded-[6px] border border-white/20">
                            <span className="text-[16px]  font-mono font-bold tracking-widest">{currentYear}</span>
                        </div>
                        <span className="text-[11px] font-mono text-white/60 tracking-[0.2em]">ACCOUNTING REGISTER</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4 bg-white">
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {daysOfWeek.map((day, idx) => (
                            <div key={day} className={`h-8 flex items-center justify-center text-[13px] font-mono font-bold tracking-widest ${idx === 0 ? 'text-[#f04e3e]' : 'text-[#0388cc]'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => (
                            <div key={idx} className="h-10 flex items-center justify-center">
                                {day ? (
                                    <button
                                        onClick={() => handleDateClick(day)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-[5px] text-[14px] font-mono font-bold transition-all relative group
                                            ${idx % 7 === 0 ? 'text-[#f04e3e]' : 'text-[#0388cc]'}
                                            ${isToday(day) ? 'bg-blue-50 text-[#0388cc] border border-[#0388cc]/30 shadow-sm' : 'hover:bg-slate-100'}
                                            active:scale-90
                                        `}
                                    >
                                        {day}
                                        {isToday(day) && <div className="absolute bottom-1 w-1 h-1 bg-[#0388cc] rounded-full" />}
                                    </button>
                                ) : (
                                    <div className="w-9 h-9 opacity-10" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center px-2">
                        <div className="flex items-center gap-2 text-[12px] font-mono text-slate-300 uppercase tracking-widest"> Onimta IT Solutions
                        </div>
                        <button 
                            onClick={() => handleDateClick(null, new Date())}
                            className="text-[11px] font-black text-white bg-[#0388cc] hover:bg-[#0276a1] transition-colors uppercase tracking-widest px-4 py-1.5 rounded-[5px] shadow-md active:scale-95"
                        >
                            Today
                        </button>   
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
