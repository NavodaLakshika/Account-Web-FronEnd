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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
 <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-[3px] bg-blue-50 text-blue-500">
                            <ShieldCheck size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">Security Verification</h3>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-[3px] text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        disabled={loading}
                    >
                        <X size={28} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 flex flex-col items-center">
                    
                    {/* Icon */}
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                        <KeyRound size={28} className="text-blue-500" />
                    </div>
                    
                    {/* Titles */}
                    <h2 className="text-base font-black text-blue-600 tracking-wide uppercase text-center mb-1">
                        {title}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center mb-6">
                        {message}
                    </p>
                    
                    {/* Input */}
                    <div className="w-full space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Admin Password
                        </label>
                        <input 
                            type="password"
                            placeholder="••••••••" 
                            value={password}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white border border-blue-300 rounded-[3px] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.2em]"
                        />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-3 w-full mt-6">
                        <button 
                            onClick={handleClose} 
                            disabled={loading}
                            className="flex-1 h-11 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
                        >
                            {cancelButtonText}
                        </button>
                        <button 
                            onClick={handleVerify} 
                            disabled={loading || !password}
                            className="flex-1 h-11 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
                        >
                            {loading ? 'Verifying...' : verifyButtonText}
                        </button>
                    </div>
                </div>
                
                {/* Footer Strip */}
                <div className="bg-slate-50 py-3 border-t border-slate-100 rounded-b-2xl">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">
                        Authorized Access Only
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminVerificationModal;
