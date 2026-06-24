import { Loader2, X, Check } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    loading = false, 
    confirmText = "ok", 
    cancelText = "Cancel",
    variant = "danger" 
}) => {
    if (!isOpen) return null;

    const isDanger = variant === "danger";
    const bgClass = isDanger ? 'bg-[#ea5b5b]' : 'bg-[#3b82f6]';
    const btnClass = isDanger ? 'bg-[#ea5b5b] hover:bg-[#d64545]' : 'bg-[#3b82f6] hover:bg-[#2563eb]';
    const WatermarkIcon = isDanger ? X : Check;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center font-['Plus_Jakarta_Sans'] pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !loading && onClose()} />
            
            <div className={`relative w-full shadow-[0_10px_40px_rgb(0,0,0,0.3)] rounded-none overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col`}>
                
                {/* Top Section */}
                <div className={`${bgClass} py-10 px-6 relative overflow-hidden`}>
                    <WatermarkIcon className="absolute right-0 -top-8 w-48 h-48 text-black opacity-10 rotate-12 pointer-events-none" strokeWidth={4} />
                    
                    <div className="max-w-7xl mx-auto w-full relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <h2 className="text-white text-[18px] font-medium tracking-wide">{title}</h2>
                            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        
                        {/* Body Text */}
                        <div className="mt-2 pr-4">
                            <p className="text-white/90 text-[12px] leading-relaxed break-words font-['Tahoma'] whitespace-pre-wrap">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bg-white py-4 px-6 flex relative z-10">
                    <div className="max-w-7xl mx-auto w-full flex justify-end gap-2">
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-1.5 bg-[#d1d5db] hover:bg-[#9ca3af] text-white uppercase text-[11px] font-bold tracking-widest transition-colors rounded-sm disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-6 py-1.5 text-white uppercase text-[11px] font-bold tracking-widest transition-colors rounded-sm flex items-center gap-2 disabled:opacity-50 ${btnClass}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
