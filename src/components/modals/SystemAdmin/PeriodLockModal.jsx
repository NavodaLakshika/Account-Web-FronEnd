import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import {
    Lock,
    Calendar,
    X,
    RotateCcw,
    CheckCircle2,
    Target,
    ShieldCheck,
    Save,
    Search
} from 'lucide-react';
import { periodLockService } from '../../../services/periodLock.service';

import { DotLottiePlayer } from '@dotlottie/react-player';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


const PeriodLockModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [costCenters, setCostCenters] = useState([]);
    const [allCostCenters, setAllCostCenters] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await periodLockService.getAll();
            setCostCenters(data || []);

            // Set dates from first item if exists
            if (data && data.length > 0 && data[0].fromDate) {
                setDateFrom(data[0].fromDate.split('T')[0]);
                setDateTo(data[0].toDate.split('T')[0]);
            }
        } catch (error) {
            showErrorToast("Failed to load cost center lock data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAllCheckChange = (e) => {
        const checked = e.target.checked;
        setAllCostCenters(checked);
        setCostCenters(costCenters.map(cc => ({ ...cc, isCheck: checked })));
    };

    const handleRowCheckChange = (index) => {
        const updated = [...costCenters];
        updated[index].isCheck = !updated[index].isCheck;
        setCostCenters(updated);

        // If any item is unchecked, "All" should be unchecked
        if (!updated[index].isCheck) setAllCostCenters(false);
        // If all items are checked, "All" should be checked
        if (updated.every(cc => cc.isCheck)) setAllCostCenters(true);
    };

    const handleSave = async () => {
        if (!dateFrom || !dateTo) {
            showErrorToast("Date From and Date To are required.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                dateFrom,
                dateTo,
                items: costCenters.map(cc => ({
                    costCenterCode: cc.costCenterCode,
                    isCheck: cc.isCheck
                }))
            };

            await periodLockService.update(payload);
            showSuccessToast("Period Lock Facility Updated Successfully.");
            onClose();
        } catch (error) {
            showErrorToast(error.response?.data?.message || "Failed to update period lock.");
        } finally {
            setIsSaving(false);
        }
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
            <div className="flex gap-3">
                <button onClick={fetchData} disabled={loading || isSaving} className="px-6 py-3 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                    <RotateCcw size={14} /> CLEAR FORM
                </button>
            </div>
            <div className="flex gap-3">
                <button onClick={handleSave} disabled={loading || isSaving} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${isSaving ? 'opacity-50' : ''}`}>
                    {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <ShieldCheck size={14} />} SECURE PERIOD
                </button>
            </div>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Period Lock Facility"
                maxWidth="max-w-[700px]"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px]">

                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[17px] font-bold text-slate-800 uppercase tracking-tight">Financial Period Authorization & Lock</h2>
                        </div>
                    </div>

                    {/* Date Selection Section */}
                    <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-[3px] space-y-4">
                        <div className="flex items-center justify-between gap-10">
                            <div className="flex items-center gap-8">
                                {/* Date From */}
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-24 shrink-0">Date From</label>
                                    <div className="flex items-center gap-1 h-8">
                                        <input
                                            type="text"
                                            value={dateFrom}
                                            readOnly
                                            onClick={() => setShowCalendarFrom(true)}
                                            className="w-[130px] h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-slate-700 cursor-default text-center bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all"
                                        />
                                        <button
                                            onClick={() => setShowCalendarFrom(true)}
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Date To */}
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest w-20 shrink-0 text-right">Date To</label>
                                    <div className="flex items-center gap-1 h-8">
                                        <input
                                            type="text"
                                            value={dateTo}
                                            readOnly
                                            onClick={() => setShowCalendarTo(true)}
                                            className="w-[130px] h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-slate-700 cursor-default text-center bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all"
                                        />
                                        <button
                                            onClick={() => setShowCalendarTo(true)}
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* All Cost Centers Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group bg-white border border-gray-200 px-4 py-2 rounded-[3px] shadow-sm hover:border-blue-300 transition-all">
                                <div className="relative w-5 h-5">
                                    <input
                                        type="checkbox"
                                        checked={allCostCenters}
                                        onChange={handleAllCheckChange}
                                        className="sr-only"
                                    />
                                    <div className={`absolute inset-0 border-2 rounded-[3px] transition-all flex items-center justify-center ${allCostCenters ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                        {allCostCenters && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">All </span>
                            </label>
                        </div>
                    </div>

                    {/* Cost Centers Grid */}
                    <div className="border border-gray-300 rounded-[3px] overflow-hidden flex flex-col bg-white shadow-sm relative">
                        {/* Table Header */}
                        <div className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                            <div className="w-16 px-3 py-3 text-center border-r border-gray-200">#</div>
                            <div className="w-20 px-3 py-3 text-center border-r border-gray-200">Select</div>
                            <div className="w-32 px-4 py-3 border-r border-gray-200">Dept Code</div>
                            <div className="flex-1 px-4 py-3">Cost Center Description</div>
                        </div>

                        {/* Data Rows */}
                        <div className="flex-1 bg-white overflow-y-auto max-h-[400px] min-h-[300px] divide-y divide-gray-100 no-scrollbar">
                            {loading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="w-20 h-20">
                                        <DotLottiePlayer src="/lottiefile/Loading animation blue.lottie" autoplay loop />
                                    </div>
                                </div>
                            ) : costCenters.length === 0 ? (
                                <div className="h-[300px] flex flex-col items-center justify-center gap-4 opacity-30">
                                    <Target size={48} className="text-slate-300" />
                                    <span className="font-bold uppercase tracking-[0.3em] text-slate-400">No Cost Centers Found</span>
                                </div>
                            ) : costCenters.map((cc, idx) => (
                                <div key={cc.costCenterCode}
                                    onClick={() => handleRowCheckChange(idx)}
                                    className={`flex items-center hover:bg-blue-50/50 cursor-pointer transition-colors group ${cc.isCheck ? 'bg-blue-50/20' : ''}`}
                                >
                                    <div className="w-16 px-3 py-2.5 text-center border-r border-gray-200 font-mono text-gray-400 text-[11px]">{idx + 1}</div>
                                    <div className="w-20 px-3 py-2.5 flex justify-center border-r border-gray-200">
                                        <div className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${cc.isCheck ? 'bg-[#2bb744] border-[#2bb744]' : 'bg-white border-gray-200 group-hover:border-blue-400'}`}>
                                            {cc.isCheck && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="w-32 px-4 py-2.5 border-r border-gray-200 font-mono font-bold text-[#0078d4] text-[12px]">{cc.costCenterCode}</div>
                                    <div className="flex-1 px-4 py-2.5 font-bold text-slate-700 uppercase tracking-wide truncate">{cc.costCenterName}</div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Bar */}
                        <div className="bg-slate-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Total Cost Centers: {costCenters.length} | Active Selection: {costCenters.filter(cc => cc.isCheck).length}
                            </span>
                            <div className="flex items-center gap-1">
                                <Search size={12} className="text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Record Found</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice Bar */}
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <Lock size={12} className="text-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ">Locked periods prevent transaction entry for unauthorized cost centers</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 opacity-50 uppercase tracking-tighter">Onimta Security Engine | Build.882.2024</span>
                    </div>

                </div>
            </SimpleModal>

            {/* Calendar Modals */}
            <CalendarModal
                isOpen={showCalendarFrom}
                onClose={() => setShowCalendarFrom(false)}
                onDateSelect={(date) => { setDateFrom(date); setShowCalendarFrom(false); }}
                initialDate={dateFrom}
            />
            <CalendarModal
                isOpen={showCalendarTo}
                onClose={() => setShowCalendarTo(false)}
                onDateSelect={(date) => { setDateTo(date); setShowCalendarTo(false); }}
                initialDate={dateTo}
            />
        </>
    );
};

export default PeriodLockModal;
