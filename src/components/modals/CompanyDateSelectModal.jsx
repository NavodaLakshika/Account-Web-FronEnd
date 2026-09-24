import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ArrowLeft, X, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import CalendarModal from '../CalendarModal';

const CompanyDateSelectModal = ({ isOpen, onClose, onConfirm, initialDate }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedDate(initialDate || todayStr);
            setShowCalendar(false);
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    const handleContinue = () => {
        const dateToUse = selectedDate || todayStr;
        onConfirm(dateToUse);
    };

    const setQuickDate = (type) => {
        const now = new Date();
        if (type === 'today') {
            setSelectedDate(now.toISOString().split('T')[0]);
        } else if (type === 'month_start') {
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            setSelectedDate(`${y}-${m}-01`);
        } else if (type === 'jan_start') {
            const y = now.getFullYear();
            setSelectedDate(`${y}-01-01`);
        } else if (type === 'apr_start') {
            const y = now.getFullYear();
            setSelectedDate(`${y}-04-01`);
        }
    };

    const fiscalYear = selectedDate ? selectedDate.split('-')[0] : new Date().getFullYear();

    return (
        <>
            <div className="fixed inset-0 z-[150] flex items-center justify-center font-['Arial'] overflow-y-auto">
                {/* Backdrop with soft blur */}
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                    onClick={onClose}
                />

                {/* Full-width Modal Strip Centered on Page */}
                <div className="relative w-full z-10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-y border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
                    
                    {/* Content Container spanning the wide view */}
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-7 relative">
                        
                        {/* Dismiss X Button Top Right */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-6 sm:right-10 text-slate-400 hover:text-slate-600 p-1.5 transition-colors rounded-[3px] hover:bg-slate-100"
                            title="Close"
                        >
                            <X size={24} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6 pr-12">
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-[3px] flex items-center justify-center text-[#00acee] shadow-xs shrink-0">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-tahoma">
                                    Select Accounting Start Date
                                </h2>
                                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                                    Define the commencement date for your company accounts before entering profile details.
                                </p>
                            </div>
                        </div>

                        {/* Main Grid: Left (Input & Presets) / Right (Fiscal Details & Guidelines) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column (5 cols) - Date Selection */}
                            <div className="lg:col-span-5 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest font-sans">
                                            Accounting Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-slate-400 font-sans">
                                            Format: YYYY-MM-DD
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <input type="text" value={selectedDate} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-[3px] font-mono font-bold text-slate-800 text-base outline-none transition-all hover:border-[#00acee] focus:border-[#00acee] focus:ring-4 focus:ring-[#00acee]/20 pr-12 shadow-xs" name="selectedDate" onChange={(e) => setSelectedDate(e.target.value)} />
                                        <button
                                            type="button"
                                            onClick={() => setShowCalendar(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00acee] transition-colors p-1.5 bg-transparent border-none cursor-pointer"
                                            title="Open Calendar"
                                        >
                                            <Calendar size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Presets */}
                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                                        Quick Presets:
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate('today')}
                                            className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 rounded-[2px] border border-slate-200 transition-colors"
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate('month_start')}
                                            className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 rounded-[2px] border border-slate-200 transition-colors"
                                        >
                                            1st of Month
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate('jan_start')}
                                            className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 rounded-[2px] border border-slate-200 transition-colors"
                                        >
                                            Jan 1 ({fiscalYear})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuickDate('apr_start')}
                                            className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-[#00acee] hover:border-[#00acee] text-slate-600 rounded-[2px] border border-slate-200 transition-colors"
                                        >
                                            Apr 1 ({fiscalYear})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (7 cols) - Fiscal Details & System Guidelines */}
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* Fiscal Details Card */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-[3px]">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-3">
                                        <ShieldCheck size={16} className="text-[#00acee]" />
                                        <span>Fiscal Period Details</span>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                            <span className="text-slate-500">Fiscal Year</span>
                                            <span className="font-mono font-bold text-slate-800">{fiscalYear}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                            <span className="text-slate-500">Commencement</span>
                                            <span className="font-mono font-bold text-[#00acee]">{selectedDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-slate-500">Period Status</span>
                                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 size={13} /> Active &amp; Ready
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Guidelines Card */}
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[3px]">
                                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-3">
                                        <Info size={16} className="text-[#0078d4]" />
                                        <span>System Guidelines</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                                        <li>Opening balances lock to this starting date.</li>
                                        <li>Transactions prior to this date will be restricted.</li>
                                        <li>Fiscal reports (P&amp;L, Balance Sheet) benchmark from here.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer Bar with Step Note and Action Buttons */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-center">
                                <Info size={15} className="text-[#00acee] shrink-0" />
                                <span>
                                    Next step: Select business operating module (Sales or Service).
                                </span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-[3px] text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                    <ArrowLeft size={15} /> Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-[3px] bg-[#00acee] hover:bg-[#0092cc] text-white text-sm font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-[#00acee]/30"
                                >
                                    Continue to Select Module <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <CalendarModal
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                }}
                currentDate={selectedDate}
            />
        </>
    );
};

export default CompanyDateSelectModal;
