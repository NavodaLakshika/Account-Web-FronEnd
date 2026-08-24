import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RefreshCw, 
    ShieldCheck, 
    CheckCircle2,
    AlertTriangle,
    Command,
    Terminal,
    Settings
} from 'lucide-react';
import { systemUpdateService } from '../../../services/systemUpdate.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import SystemUpdateAuthModal from './SystemUpdateAuthModal';

const SystemUpdateModal = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('idle'); // idle, updating, success, error
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const handleBeginUpdate = () => {
        setIsAuthOpen(true);
    };

    const handleUpdate = async () => {
        setStatus('updating');
        setError(null);
        setProgress(0);
        
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return 98;
                return prev + 1;
            });
        }, 800);

        try {
            const response = await systemUpdateService.runUpdate();
            clearInterval(progressInterval);
            setProgress(100);
            
            if (response.success) {
                setStatus('success');
                showSuccessToast("System maintenance initiated successfully.");
            } else {
                throw new Error(response.message || "Failed to start maintenance.");
            }
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.message || "An error occurred.");
            setStatus('error');
            showErrorToast(err.message || "Maintenance failed.");
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SYSTEM ADMINISTRATION"
            maxWidth="max-w-[700px]"
        >
            <div className="py-6 px-8 select-none font-['Tahoma'] bg-white">
                
                {/* Clean Header */}
                <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <h2 className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">System Update</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Maintenance Utility | Build 2024.05</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                        <Settings size={20} className="text-[#0285fd]" />
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="min-h-[160px]">
                    
                    {status === 'idle' && (
                        <div className="space-y-6">
                            <div className="p-4 border-l-4 border-[#0285fd] bg-blue-50/30">
                                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                                    New configuration patches and security definitions are available for deployment. This process will run in the background.
                                </p>
                            </div>
                            <div className="pt-2">
                                <button 
                                    onClick={handleBeginUpdate}
                                    className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                                >
                                    <Terminal size={14} />
                                    Execute Update Sequence
                                </button>
                                <p className="text-[9px] text-slate-400 text-center mt-3 font-bold uppercase tracking-widest">
                                    Identity verification required to proceed
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'updating' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw size={12} className="animate-spin text-[#0285fd]" />
                                        <span>Deployment in progress...</span>
                                    </div>
                                    <span className="text-[#0285fd]">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-[3px] overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#0285fd] to-[#00adff] transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded space-y-3">
                                <div className="flex items-center gap-3 opacity-40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Verifying Integrity</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0285fd] animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Synchronizing Repository</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center space-y-6 py-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border border-emerald-100">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[16px] font-bold text-slate-800 uppercase tracking-widest">Update Complete</h3>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">All background tasks finalized</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-full h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                Close Console
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full mx-auto flex items-center justify-center border border-red-100">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <div className="p-3 border border-red-100 bg-red-50/50 rounded">
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                            </div>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="text-[10px] font-bold text-[#0078d4] hover:underline uppercase tracking-widest"
                            >
                                Re-Attempt Execution
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Meta */}
                <div className="mt-12 pt-4 border-t border-slate-50 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Build 4.8.2</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Onimta Systems</span>
                </div>

            </div>

            {/* Authentication Modal */}
            <SystemUpdateAuthModal 
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onVerified={handleUpdate}
            />
        </SimpleModal>
    );
};

export default SystemUpdateModal;
