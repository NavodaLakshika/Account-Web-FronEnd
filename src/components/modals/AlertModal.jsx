import { Check, Info, X, AlertTriangle, Clock } from 'lucide-react';

const AlertModal = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    variant = "success", // success, error, info, warning, pending
    confirmText = "ok",
    cancelText = "nope",
    showCancel = true,
    onConfirm
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    bgClass: 'bg-[#5cb85c]',
                    btnClass: 'bg-[#5cb85c]',
                    hugeIcon: (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                                 <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                            </svg>
                            <Check size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                        </div>
                    )
                };
            case 'error':
                return {
                    bgClass: 'bg-[#d9534f]',
                    btnClass: 'bg-[#d9534f]',
                    hugeIcon: (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                                 <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                            </svg>
                            <svg width="130" height="130" viewBox="0 0 100 100" className="fill-black opacity-[0.12] absolute">
                                 <path d="M20,5 L50,35 L80,5 L95,20 L65,50 L95,80 L80,95 L50,65 L20,95 L5,80 L35,50 L5,20 Z" />
                            </svg>
                        </div>
                    ),
                };
            case 'warning':
                return {
                    bgClass: 'bg-[#f0ad4e]',
                    btnClass: 'bg-[#f0ad4e]',
                    hugeIcon: (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                                 <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                            </svg>
                            <AlertTriangle size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                        </div>
                    )
                };
            case 'pending':
                return {
                    bgClass: 'bg-[#f0ad4e]',
                    btnClass: 'bg-[#f0ad4e]',
                    hugeIcon: (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                                 <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                            </svg>
                            <Clock size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                        </div>
                    )
                };
            default: // info
                return {
                    bgClass: 'bg-[#5bc0de]',
                    btnClass: 'bg-[#5bc0de]',
                    hugeIcon: (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 pointer-events-none flex items-center justify-center">
                            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-black opacity-[0.08]">
                                 <polygon points="25,0 75,0 100,25 100,75 75,100 25,100 0,75 0,25" />
                            </svg>
                            <Info size={120} strokeWidth={4} className="text-black opacity-[0.12] absolute" />
                        </div>
                    )
                };
        }
    };

    const styles = getVariantStyles();

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        else onClose();
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-[550px] bg-white rounded-[3px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Colored Area */}
                <div className={`relative ${styles.bgClass} overflow-hidden w-full flex flex-col`}>
                    
                    {/* Background Huge Icon */}
                    {styles.hugeIcon}

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-black/10 flex justify-between items-center relative z-10">
                        <h3 className="text-[15px] font-mono font-bold text-white uppercase tracking-widest">{title}</h3>
                        <button onClick={onClose} className="text-white hover:text-white/80 transition-colors mt-1">
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 py-5 relative z-10 min-h-[110px]">
                        <p className="text-white/95 text-[14px] leading-relaxed font-sans">
                            {message}
                        </p>
                    </div>
                </div>

                {/* White Footer Area */}
                <div className="px-6 py-4 bg-white flex justify-end gap-3 w-full">
                    {showCancel && (
                        <button 
                            onClick={onClose} 
                            className="px-8 py-2 bg-[#cccccc] hover:bg-[#b3b3b3] text-white font-medium rounded-[3px] transition-colors text-[14px] lowercase"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm} 
                        className={`px-8 py-2 ${styles.btnClass} text-white font-medium rounded-[3px] hover:brightness-90 transition-all text-[14px] lowercase`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
