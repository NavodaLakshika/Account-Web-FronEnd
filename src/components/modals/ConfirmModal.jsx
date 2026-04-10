import { HelpCircle, X, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    loading = false, 
    confirmText = "Yes", 
    cancelText = "No",
    variant = "primary" // Add variant prop
}) => {
    if (!isOpen) return null;

    const isDanger = variant === "danger";

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
                onClick={() => !loading && onClose()} 
            />
            
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                    title="Close"
                >
                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="p-8 text-center">
                    <div className={`w-20 h-20 ${isDanger ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-white'} rounded-full flex items-center justify-center mx-auto mb-6 border-4 shadow-lg`}>
                        {isDanger ? (
                            <Trash2 size={40} className="text-red-500" />
                        ) : (
                            <HelpCircle size={40} className="text-[#0078d4]" />
                        )}
                    </div>

                    <h3 className={`text-xl font-black ${isDanger ? 'text-red-700' : 'text-slate-800'} mb-2`}>{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {message}
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 h-12 ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-[#0078d4] hover:bg-[#005a9e] shadow-blue-200'} text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : confirmText}
                        </button>
                    </div>
                </div>
                
                <div className="bg-slate-50 py-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">
                        Confirmation Required
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
