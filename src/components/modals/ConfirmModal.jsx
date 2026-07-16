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
            
            <div className={`relative w-[600px] bg-white shadow-[0_10px_40px_rgb(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col`}>
                
                {/* Colored Area */}
                <div className={`relative ${bgClass} overflow-hidden w-full flex flex-col py-6`}>
                    {/* Watermark Icon */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                        <svg width="200" height="200" viewBox="0 0 100 100" className="fill-black opacity-[0.05]">
                             <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                        </svg>
                        {isDanger ? (
                            <svg width="120" height="120" viewBox="0 0 100 100" className="fill-black opacity-[0.08] absolute right-[40px]">
                                 <path d="M20,5 L50,35 L80,5 L95,20 L65,50 L95,80 L80,95 L50,65 L20,95 L5,80 L35,50 L5,20 Z" />
                            </svg>
                        ) : (
                            <Check size={120} strokeWidth={4} className="text-black opacity-[0.08] absolute right-[40px]" />
                        )}
                    </div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 px-6">
                        {/* Header */}
                        <div className="pb-2 border-b border-black/10 flex justify-between items-center">
                            <h3 className="text-[15px] font-mono font-bold text-white uppercase tracking-widest">{title}</h3>
                        </div>
                        
                        {/* Body Text */}
                        <div className="pt-3 pb-2">
                            <div className="text-white/95 text-[15px] leading-relaxed font-sans max-w-3xl whitespace-pre-wrap break-words">
                                {message}
                            </div>
                        </div>
                    </div>
                </div>

                {/* White Footer Area */}
                <div className="bg-white py-3 w-full flex relative z-10">
                    <div className="max-w-7xl mx-auto w-full px-6 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="px-8 py-2 bg-[#cccccc] hover:bg-[#b3b3b3] text-white font-medium rounded-[3px] transition-colors text-[14px] uppercase"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-8 py-2 ${btnClass} text-white font-medium rounded-[3px] hover:brightness-90 transition-all text-[14px] uppercase flex items-center justify-center gap-2 min-w-[100px] shadow-sm`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
