import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
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
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleProcess} 
                className="px-8 h-10 bg-[#0285fd] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-blue-200 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Play size={14} /> Process Clear
            </button>
            <button 
                onClick={onClose} 
                className="px-8 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <X size={14} /> Exit
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Clear Temporary Data"
                maxWidth="max-w-xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                    
                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                        <Eraser size={20} className="text-[#0078d4]" />
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">System Data Cleanup Facility</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#0078d4] font-bold border-b border-slate-100 pb-1 mb-4">
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

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-[5px] flex items-start gap-4">
                        <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Pre-Cleanup Notice</h4>
                            <p className="text-[10px] text-amber-600 leading-relaxed font-bold">
                                Purging temporary data will improve system responsiveness but may require re-calculating some complex report states. 
                                Ensure no background tasks are currently running.
                            </p>
                        </div>
                    </div>

                </div>
            </SimpleModal>

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
        className={`w-full flex items-center justify-between p-4 rounded-[8px] border transition-all ${checked ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-white hover:bg-slate-50'}`}
    >
        <div className="flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${checked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <div className={`font-bold ${checked ? 'text-blue-900' : 'text-slate-700'}`}>{label}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{description}</div>
            </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-100' : 'border-gray-200'}`}>
            {checked && <CheckCircle2 size={14} className="text-white" />}
        </div>
    </button>
);

export default ClearTempDataModal;
