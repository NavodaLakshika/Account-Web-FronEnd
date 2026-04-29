import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    CloudLightning, 
    RefreshCw, 
    ShieldCheck, 
    X,
    Cpu,
    ArrowUpCircle,
    Monitor
} from 'lucide-react';

const SystemUpdateModal = ({ isOpen, onClose }) => {
    const [updating, setUpdating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpdate = () => {
        setUpdating(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setUpdating(false);
            }
        }, 200);
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="System Update"
            maxWidth="max-w-md"
        >
            <div className="py-8 select-none font-['Tahoma'] flex flex-col items-center text-center space-y-10">
                
                {/* Branding Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                            <CloudLightning size={32} className="text-[#0078d4]" />
                        </div>
                    </div>
                    <h1 className="text-[26px] font-black text-[#0078d4] tracking-tight">Onimta Inventory System</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Version 4.8.2 (Stable Build)</span>
                    </div>
                </div>

                {/* Update Action Section */}
                <div className="w-full px-6 space-y-6">
                    {!updating ? (
                        <button 
                            onClick={handleUpdate}
                            className="w-full group relative h-16 bg-white border-2 border-[#0078d4] hover:bg-[#0078d4] text-[#0078d4] hover:text-white rounded-[10px] transition-all duration-300 shadow-lg hover:shadow-blue-200 active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                            <ArrowUpCircle size={24} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[20px] font-bold uppercase tracking-widest">Update Now</span>
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                                <div className="flex items-center gap-2">
                                    <RefreshCw size={12} className="animate-spin text-blue-500" />
                                    <span>Synchronizing Packages...</span>
                                </div>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Please do not close the application during the update process.</p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="pt-4 border-t border-slate-100 w-full flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Onimta Information Technology (Pvt) Ltd.</span>
                    </div>
                    <div className="flex items-center gap-4 opacity-40">
                        <Monitor size={12} />
                        <Cpu size={12} />
                        <span className="text-[9px] font-mono">SECURE_UPDATE_CHNL_09</span>
                    </div>
                </div>

            </div>
        </SimpleModal>
    );
};

export default SystemUpdateModal;
