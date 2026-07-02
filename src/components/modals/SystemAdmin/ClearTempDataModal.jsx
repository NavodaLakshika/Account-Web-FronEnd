import React, { useState } from 'react';
import TransactionFormWrapper from '../../TransactionFormWrapper';
import ConfirmModal from '../ConfirmModal';
import { 
    Eraser, 
    Database, 
    History, 
    Cpu, 
    ShieldAlert, 
    RotateCcw, 
    X,
    Play,
    CheckCircle2
} from 'lucide-react';

const ClearTempDataModal = ({ isOpen, onClose }) => {
    const [options, setOptions] = useState({
        appCache: true,
        sessionLogs: true,
        tempRecords: false,
        auditHistory: false
    });
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleProcess = () => {
        setShowConfirm(true);
    };

    const confirmClear = () => {
        setLoading(true);
        // Simulate clearing
        setTimeout(() => {
            setLoading(false);
            setShowConfirm(false);
            onClose();
        }, 2000);
    };

    const footer = (
        <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex gap-3">
                <button type="button" onClick={() => setOptions({appCache: false, sessionLogs: false, tempRecords: false, auditHistory: false})} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> CLEAR FORM
                </button>
            </div>
            <div className="flex gap-3 items-center">
                <button type="button" onClick={handleProcess} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play size={14} />} PROCESS CLEAR
                </button>
            </div>
        </div>
    );

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="CLEAR TEMPORARY DATA"
                subtitle="System Maintenance"
                icon={Eraser}
                footer={footer}
            >
                <div className="select-none font-['Tahoma']">
                    
                    {/* Master Style Header */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4 mb-4">
                        <div className="border-b border-gray-200 pb-4 flex items-center justify-center gap-3">
                            <Eraser size={20} className="text-[#0285fd]" />
                            <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-tight">System Data Cleanup Facility</h2>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-[#0285fd] font-bold pb-1 mb-2">
                                <ShieldAlert size={14} />
                                <span className="uppercase tracking-wider text-[11px]">Select Entities to Purge</span>
                            </div>

                            {/* Options List */}
                            <div className="grid grid-cols-1 gap-3">
                                <OptionRow 
                                    icon={Cpu} 
                                    label="Application Memory Cache" 
                                    description="Clears local storage and cached UI states"
                                    checked={options.appCache}
                                    onChange={() => handleToggle('appCache')}
                                />
                                <OptionRow 
                                    icon={History} 
                                    label="System Session Logs" 
                                    description="Purges inactive session tracking data"
                                    checked={options.sessionLogs}
                                    onChange={() => handleToggle('sessionLogs')}
                                />
                                <OptionRow 
                                    icon={Database} 
                                    label="Temporary Database Records" 
                                    description="Removes transient calculation table data"
                                    checked={options.tempRecords}
                                    onChange={() => handleToggle('tempRecords')}
                                />
                                <OptionRow 
                                    icon={RotateCcw} 
                                    label="Extended Audit History" 
                                    description="Deletes old search and filter logs ( > 30 days )"
                                    checked={options.auditHistory}
                                    onChange={() => handleToggle('auditHistory')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-[3px] flex items-start gap-3 mb-2">
                        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <h4 className="text-[12px] font-bold text-amber-800">Pre-Cleanup Notice</h4>
                            <p className="text-[11.5px] text-amber-700 leading-relaxed">
                                Purging temporary data will improve system responsiveness but may require re-calculating some complex report states. 
                                Ensure no background tasks are currently running.
                            </p>
                        </div>
                    </div>

                </div>
            </TransactionFormWrapper>

            <ConfirmModal 
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmClear}
                title="Confirm Data Purge"
                message="Are you sure you want to permanently clear the selected temporary data? This action will synchronize across all active nodes."
                loading={loading}
                confirmText="Execute Purge"
                cancelText="Abort"
                variant="danger"
            />
        </>
    );
};

const OptionRow = ({ icon: Icon, label, description, checked, onChange }) => (
    <button 
        onClick={onChange}
        className={`w-full flex items-center justify-between p-3 rounded-[3px] border transition-all ${checked ? 'border-[#0285fd] bg-blue-50/30' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
    >
        <div className="flex items-center gap-3 text-left">
            <div className={`w-8 h-8 rounded-[2px] flex items-center justify-center transition-colors ${checked ? 'bg-[#0285fd] text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon size={16} />
            </div>
            <div>
                <div className={`text-[13px] font-bold ${checked ? 'text-[#0285fd]' : 'text-gray-700'}`}>{label}</div>
                <div className="text-[11px] text-gray-500">{description}</div>
            </div>
        </div>
        <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${checked ? 'bg-[#0285fd] border-[#0285fd]' : 'border-gray-300 bg-white'}`}>
            {checked && <div className="w-[6px] h-[6px] bg-white rounded-full" />}
        </div>
    </button>
);

export default ClearTempDataModal;
