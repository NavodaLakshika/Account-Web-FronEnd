import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            const p2 = parseInt(parts[2]);
            if (parts[2].length === 4) return new Date(p2, p1 - 1, p0);
            if (parts[0].length === 4) return new Date(p0, p1 - 1, p2);
        }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};

const CalendarModal = ({ isOpen, onClose, onDateSelect, onDateChange, initialDate, currentDate }) => {
    const activeCallback = (typeof onDateSelect === 'function' ? onDateSelect : null) ||
        (typeof onDateChange === 'function' ? onDateChange : null);
    const activeDate = initialDate || currentDate;

    const [viewDate, setViewDate] = useState(() => parseDate(activeDate));
    const [popupStyle, setPopupStyle] = useState({});
    const [showYearPicker, setShowYearPicker] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setViewDate(parseDate(activeDate));
            setShowYearPicker(false);
            const trigger = document.activeElement;
            if (trigger && trigger.getBoundingClientRect) {
                const rect = trigger.getBoundingClientRect();
                const dropdownWidth = 240;
                const centerX = rect.left + rect.width / 2;
                const left = Math.max(4, Math.min(centerX - dropdownWidth / 2, window.innerWidth - dropdownWidth - 4));
                setPopupStyle({
                    top: `${rect.bottom + 6}px`,
                    left: `${left}px`
                });
            } else {
                setPopupStyle({
                    top: '15vh',
                    left: '50%',
                    transform: 'translateX(-50%)'
                });
            }
        }
    }, [isOpen, activeDate]);

    const handleClickOutside = useCallback((e) => {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
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

    const centuryStart = Math.floor(currentYear / 100) * 100;

    const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
    const prevCentury = () => setViewDate(new Date(centuryStart - 1, currentMonth, 1));
    const nextCentury = () => setViewDate(new Date(centuryStart + 100, currentMonth, 1));

    const selectedDate = activeDate ? parseDate(activeDate) : null;

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
    };

    const handleDateClick = (day, specificDate = null) => {
        const selected = specificDate || new Date(currentYear, currentMonth, day);
        const yyyy = selected.getFullYear();
        const mm = String(selected.getMonth() + 1).padStart(2, '0');
        const dd = String(selected.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;
        if (activeCallback) activeCallback(formatted);
        onClose();
    };

    const handleYearSelect = (year) => {
        setViewDate(new Date(year, currentMonth, 1));
        setShowYearPicker(false);
    };

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
    while (calendarDays.length < 42) calendarDays.push(null);

    if (!isOpen) return null;

    const selectedYear = selectedDate ? selectedDate.getFullYear() : null;

    return (
        <div className="fixed inset-0 z-[2000]" style={{ pointerEvents: 'none' }}>
            <div
                ref={cardRef}
                className="calendar-dropdown-container w-[240px] bg-white border border-gray-300 rounded-[3px] shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden font-sans"
                style={{ ...popupStyle, pointerEvents: 'auto', position: 'fixed' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#0388cc] px-3 py-2">
                    <div className="flex items-center justify-between">
                        <button onClick={showYearPicker ? prevCentury : prevMonth} className="text-white/80 hover:text-white hover:bg-white/10 p-0.5 rounded transition-all">
                            <ChevronLeft size={14} />
                        </button>
                        {showYearPicker ? (
                            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider">
                                {centuryStart} - {centuryStart + 99}
                            </h2>
                        ) : (
                            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider cursor-pointer hover:text-white/80" onClick={() => setShowYearPicker(true)}>
                                {months[currentMonth]} {currentYear}
                            </h2>
                        )}
                        <button onClick={showYearPicker ? nextCentury : nextMonth} className="text-white/80 hover:text-white hover:bg-white/10 p-0.5 rounded transition-all">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-2">
                    {showYearPicker ? (
                        <div className="grid grid-cols-4 gap-1 py-1 max-h-[200px] overflow-y-auto no-scrollbar">
                            {Array.from({ length: 100 }, (_, i) => centuryStart + i).map(year => (
                                <button
                                    key={year}
                                    onClick={() => handleYearSelect(year)}
                                    className={`h-7 flex items-center justify-center text-[11px] font-medium rounded-[2px] transition-all
                                        ${selectedYear === year
                                            ? 'bg-[#0388cc] text-white'
                                            : year === new Date().getFullYear()
                                                ? 'border border-[#0388cc] text-[#0388cc]'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Day labels */}
                            <div className="grid grid-cols-7 gap-0 mb-0.5">
                                {daysOfWeek.map((day, idx) => (
                                    <div key={day} className={`h-6 flex items-center justify-center text-[9px] font-bold tracking-wider ${idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Day grid */}
                            <div className="grid grid-cols-7 gap-0">
                                {calendarDays.map((day, idx) => (
                                    <div key={idx} className="h-7 flex items-center justify-center">
                                        {day ? (
                                            <button
                                                onClick={() => handleDateClick(day)}
                                                className={`w-7 h-7 flex items-center justify-center text-[11px] font-medium transition-all rounded-[2px]
                                                    ${isSelected(day)
                                                        ? 'bg-[#0388cc] text-white'
                                                        : isToday(day)
                                                            ? 'border border-[#0388cc] text-[#0388cc]'
                                                            : (idx % 7 === 0 || idx % 7 === 6)
                                                                ? 'text-gray-400 hover:bg-gray-100'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ) : (
                                            <div className="w-7 h-7" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="mt-2 pt-1.5 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider">Onimta IT</span>
                        <button
                            onClick={() => handleDateClick(null, new Date())}
                            className="text-[9px] font-bold text-white bg-[#0388cc] hover:bg-[#0276a1] transition-colors uppercase tracking-wider px-2 py-0.5 rounded-[2px] active:scale-95"
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
