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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 font-['Plus_Jakarta_Sans']">
            <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md overflow-visible animate-in slide-in-from-top-4 fade-in duration-200 flex flex-col rounded-[5px]">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-blue-50 border border-blue-500/20 text-[#0078d4] rounded-[3px]">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-800">
                            {title || "Security Verification"}
                        </h3>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-[3px]"
                        disabled={loading}
                    >
                        <X size={16} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-5 flex flex-col items-center">
                    {/* Input */}
                    <div className="w-full space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Admin Password</span>
                            <span className="text-slate-400 font-normal lowercase tracking-normal">{message}</span>
                        </label>
                        <div className="relative">
                            <KeyRound size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="password"
                                placeholder="••••••••" 
                                value={password}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-sm font-bold text-slate-800 outline-none focus:border-[#0078d4] transition-all tracking-widest placeholder:tracking-normal placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end gap-2 w-full mt-5">
                        <button 
                            onClick={handleClose} 
                            disabled={loading}
                            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-bold hover:text-slate-800 transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-wider rounded-[3px]"
                        >
                            {cancelButtonText}
                        </button>
                        <button 
                            onClick={handleVerify} 
                            disabled={loading || !password}
                            className="px-6 py-2 bg-[#0078d4] hover:bg-[#005a9e] text-white font-bold transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-wider rounded-[3px] shadow-sm flex items-center gap-2"
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





