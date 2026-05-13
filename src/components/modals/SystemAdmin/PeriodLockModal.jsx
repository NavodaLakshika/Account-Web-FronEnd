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
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
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
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Tahoma']">
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-10 h-10 bg-[#2bb744] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSaving ? "SAVING..." : <><ShieldCheck size={14} /> OK</>}
            </button>
            <button
                onClick={fetchData}
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Period Lock Facility"
                maxWidth="max-w-3xl"
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
                    <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-[5px] space-y-4">
                        <div className="flex items-center justify-between gap-10">
                            <div className="flex items-center gap-8">
                                {/* Date From */}
                                <div className="flex items-center gap-4">
                                    <label className="font-bold text-gray-500 uppercase tracking-widest text-[11px]">Date From</label>
                                    <div className="flex items-center gap-1 h-9">
                                        <input
                                            type="text"
                                            value={dateFrom}
                                            readOnly
                                            className="w-[130px] h-9 border border-gray-300 rounded-[5px] px-3 text-sm outline-none font-bold text-[#0078d4] cursor-default text-center bg-white shadow-sm"
                                        />
                                        <button
                                            onClick={() => setShowCalendarFrom(true)}
                                            className="w-10 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-[5px] transition-all shadow-md shadow-blue-500/10 active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Date To */}
                                <div className="flex items-center gap-4">
                                    <label className="font-bold text-gray-500 uppercase tracking-widest text-[11px]">Date To</label>
                                    <div className="flex items-center gap-1 h-9">
                                        <input
                                            type="text"
                                            value={dateTo}
                                            readOnly
                                            className="w-[130px] h-9 border border-gray-300 rounded-[5px] px-3 text-sm outline-none font-bold text-[#0078d4] cursor-default text-center bg-white shadow-sm"
                                        />
                                        <button
                                            onClick={() => setShowCalendarTo(true)}
                                            className="w-10 h-9 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-[5px] transition-all shadow-md shadow-blue-500/10 active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* All Cost Centers Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group bg-white border border-gray-200 px-4 py-2 rounded-[5px] shadow-sm hover:border-blue-300 transition-all">
                                <div className="relative w-5 h-5">
                                    <input
                                        type="checkbox"
                                        checked={allCostCenters}
                                        onChange={handleAllCheckChange}
                                        className="sr-only"
                                    />
                                    <div className={`absolute inset-0 border-2 rounded-md transition-all flex items-center justify-center ${allCostCenters ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                        {allCostCenters && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">All </span>
                            </label>
                        </div>
                    </div>

                    {/* Cost Centers Grid */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col bg-white shadow-sm relative">
                        {/* Table Header */}
                        <div className="flex bg-[#f8fafc] border-b border-gray-300 select-none font-black text-gray-400 uppercase tracking-widest text-[10.5px]">
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
                                    <div className="w-16 px-3 py-2.5 text-center border-r border-gray-100 font-mono text-gray-400 text-[11px]">{idx + 1}</div>
                                    <div className="w-20 px-3 py-2.5 flex justify-center border-r border-gray-100">
                                        <div className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${cc.isCheck ? 'bg-[#2bb744] border-[#2bb744]' : 'bg-white border-gray-200 group-hover:border-blue-400'}`}>
                                            {cc.isCheck && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="w-32 px-4 py-2.5 border-r border-gray-100 font-mono font-bold text-[#0078d4] text-[12px]">{cc.costCenterCode}</div>
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
