import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldCheck } from 'lucide-react';

const AdminVerificationModal = ({
    isOpen,
    onClose,
    onVerify,
    title = "IDENTITY VERIFICATION",
    message = "PLEASE CONFIRM YOUR PASSWORD TO PROCEED",
    verifyButtonText = "CONFIRM IDENTITY",
    cancelButtonText = "CANCEL",
    loading = false,
    value,
    onChange
}) => {
    const [internalPassword, setInternalPassword] = useState('');

    const isControlled = value !== undefined;
    const password = isControlled ? value : internalPassword;

    if (!isOpen) return null;

    const handleChange = (e) => {
        if (isControlled) {
            onChange(e.target.value);
        } else {
            setInternalPassword(e.target.value);
        }
    };

    const handleVerify = () => {
        if (password) {
            if (onVerify) onVerify(password);
            if (!isControlled) setInternalPassword('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleVerify();
        }
    };

    const handleClose = () => {
        if (!isControlled) setInternalPassword('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] border-t-[6px] border-t-blue-500 shadow-2xl w-full max-w-md overflow-visible animate-in slide-in-from-top-4 fade-in duration-200 flex flex-col rounded-none">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#0f172a]/50">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0078d4]/10 border border-[#0078d4]/30 text-[#0078d4] rounded-none">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-800 dark:text-white">
                            {title || "Security Verification"}
                        </h3>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-slate-700 transition-colors rounded-none"
                        disabled={loading}
                    >
                        <X size={16} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-5 flex flex-col items-center">
                    {/* Input */}
                    <div className="w-full space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Admin Password</span>
                            <span className="text-slate-500 font-normal lowercase tracking-normal">{message}</span>
                        </label>
                        <div className="relative">
                            <KeyRound size={14} className="absolute left-3 top-3 text-slate-500" />
                            <input 
                                type="password"
                                placeholder="••••••••" 
                                value={password}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-all tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end gap-2 w-full mt-5">
                        <button 
                            onClick={handleClose} 
                            disabled={loading}
                            className="px-4 py-2 bg-transparent border border-slate-200 dark:border-[#334155] hover:border-slate-500 text-slate-600 dark:text-slate-300 font-bold hover:text-slate-800 dark:text-white transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-wider rounded-none"
                        >
                            {cancelButtonText}
                        </button>
                        <button 
                            onClick={handleVerify} 
                            disabled={loading || !password}
                            className="px-6 py-2 bg-[#0078d4] hover:bg-[#005a9e] text-slate-800 dark:text-white font-bold transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-wider rounded-none shadow-sm flex items-center gap-2"
                        >
                            {loading ? 'Verifying...' : verifyButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVerificationModal;





