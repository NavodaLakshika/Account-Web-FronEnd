import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-white">
                    <h3 className="text-sm font-bold text-slate-900 tracking-widest uppercase">
                        Security Verification
                    </h3>
                    <button 
                        onClick={handleClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-8 pt-10 flex flex-col items-center border-t border-slate-50">
                    
                    {/* Removed Illustration */}
                    
                    {/* Titles */}
                    <h2 className="text-lg font-black text-blue-600 tracking-wide uppercase text-center mb-1.5">
                        {title}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center mb-8">
                        {message}
                    </p>
                    
                    {/* Input */}
                    <div className="w-full space-y-2 relative z-20">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Password
                        </label>
                        <input 
                            type="password"
                            placeholder="••••••••" 
                            value={password}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white border border-blue-400 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.2em]"
                        />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-4 w-full mt-8">
                        <button 
                            onClick={handleClose} 
                            disabled={loading}
                            className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors tracking-widest uppercase"
                        >
                            {cancelButtonText}
                        </button>
                        <button 
                            onClick={handleVerify} 
                            disabled={loading || !password}
                            className="flex-1 py-3 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-white rounded-xl transition-colors tracking-widest uppercase shadow-sm"
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
