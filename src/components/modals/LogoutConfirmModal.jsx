import React from 'react';
import { LogOut, X, AlertTriangle, Loader2 } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
                onClick={() => !loading && onClose()} 
            />
            
            {/* Modal Container - Matching Delete Confirmation Style */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Close button (optional, but keep for consistency with other modals) */}
                <button 
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    {/* Icon Container - Matching Red Circle Style */}
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                        <LogOut size={40} className="text-[#d13438]" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Logout</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Are you sure you want to sign out from your account? 
                        <br />Make sure you have saved all your active work.
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 h-12 bg-[#d13438] text-white font-bold rounded-2xl hover:bg-[#a4262c] shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Yes, Logout"}
                        </button>
                    </div>
                </div>
                
                {/* Footer Strip */}
                <div className="bg-slate-50 py-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">
                        Security Session Termination
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;

