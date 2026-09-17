import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const WheelColumn = ({ options, value, onChange }) => {
    const scrollRef = useRef(null);
    const itemHeight = 44;
    const scrollTimeout = useRef(null);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
            if (scrollRef.current) {
                const index = options.findIndex(opt => opt.value === value);
                if (index !== -1) {
                    scrollRef.current.scrollTo({
                        top: index * itemHeight,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [value, itemHeight, options]);

    useEffect(() => {
        if (scrollRef.current) {
            const index = options.findIndex(opt => opt.value === value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, []);

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.max(0, Math.min(options.length - 1, Math.round(scrollTop / itemHeight)));
        
        if (options[index]) {
            setLocalValue(options[index].value);
        }

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            const finalIndex = Math.max(0, Math.min(options.length - 1, Math.round(e.target.scrollTop / itemHeight)));
            if (options[finalIndex]) {
                onChange(options[finalIndex].value);
                e.target.scrollTo({
                    top: finalIndex * itemHeight,
                    behavior: 'smooth'
                });
            }
        }, 150);
    };

    return (
        <div className="flex-1 h-[220px] overflow-hidden relative">
            <div className="absolute top-1/2 left-0 right-0 h-[44px] -mt-[22px] bg-white/5 rounded pointer-events-none" />
            
            <div 
                ref={scrollRef}
                className="h-full overflow-y-auto snap-y snap-mandatory"
                onScroll={handleScroll}
                style={{ 
                    paddingTop: `${(220 - 44) / 2}px`, 
                    paddingBottom: `${(220 - 44) / 2}px`,
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }} 
            >
                <style dangerouslySetInnerHTML={{__html: `
                    .h-full::-webkit-scrollbar {
                        display: none;
                    }
                `}} />
                {options.map((opt, idx) => {
                    const isSelected = opt.value === localValue;
                    return (
                        <div 
                            key={idx} 
                            className={`h-[44px] flex items-center justify-center snap-center text-[18px] transition-all cursor-pointer select-none
                                ${isSelected ? 'text-white font-medium scale-110' : 'text-gray-500 hover:text-gray-400'}`}
                            onClick={() => {
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTo({
                                        top: idx * itemHeight,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                        >
                            {opt.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CalendarModal = ({ isOpen, onClose, onDateSelect, onDateChange, initialDate, currentDate }) => {
    const activeCallback = (typeof onDateSelect === 'function' ? onDateSelect : null) ||
        (typeof onDateChange === 'function' ? onDateChange : null);
    const activeDate = initialDate || currentDate;

    const [viewDate, setViewDate] = useState(() => parseDate(activeDate));
    
    useEffect(() => {
        if (isOpen) {
            setViewDate(parseDate(activeDate));
        }
    }, [isOpen, activeDate]);

    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthOptions = Array.from({length: 12}, (_, i) => ({ value: i, label: i + 1 }));
    
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const dayOptions = Array.from({length: daysInMonth}, (_, i) => ({ value: i + 1, label: i + 1 }));
    
    const yearOptions = Array.from({length: 100}, (_, i) => {
        const year = new Date().getFullYear() - 50 + i;
        return { value: year, label: year };
    });

    const handleMonthChange = (monthIndex) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, Math.min(viewDate.getDate(), new Date(viewDate.getFullYear(), monthIndex + 1, 0).getDate())));
    };

    const handleDayChange = (day) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    };

    const handleYearChange = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), Math.min(viewDate.getDate(), new Date(year, viewDate.getMonth() + 1, 0).getDate())));
    };

    const handleOk = () => {
        const yyyy = viewDate.getFullYear();
        const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
        const dd = String(viewDate.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;
        if (activeCallback) activeCallback(formatted);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose}>
            <div 
                className="w-full sm:w-[320px] bg-[#1c1c1e] sm:rounded-[20px] rounded-t-[20px] overflow-hidden shadow-2xl border-t sm:border border-white/10 font-sans animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="pt-6 pb-4 px-6 text-center">
                    <h2 className="text-white text-[17px] font-semibold tracking-wide">
                        {months[viewDate.getMonth()]} {viewDate.getDate()}, {viewDate.getFullYear()}
                    </h2>
                </div>
                
                <div className="flex px-4 py-2 relative">
                    <WheelColumn options={monthOptions} value={viewDate.getMonth()} onChange={handleMonthChange} />
                    <WheelColumn options={dayOptions} value={viewDate.getDate()} onChange={handleDayChange} />
                    <WheelColumn options={yearOptions} value={viewDate.getFullYear()} onChange={handleYearChange} />
                    
                    {/* Gradient masks for fading top and bottom edges */}
                    <div className="absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-b from-[#1c1c1e] to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-gradient-to-t from-[#1c1c1e] to-transparent pointer-events-none z-10" />
                </div>

                <div className="flex border-t border-white/10">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 text-[#0a84ff] hover:bg-white/5 active:bg-white/10 transition-colors font-medium text-[16px]"
                    >
                        Cancel
                    </button>
                    <div className="w-[1px] bg-white/10" />
                    <button 
                        onClick={handleOk}
                        className="flex-1 py-4 text-[#0a84ff] hover:bg-white/5 active:bg-white/10 transition-colors font-medium text-[16px]"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
