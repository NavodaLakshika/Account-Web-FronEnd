import { Check, Info, X, AlertTriangle } from 'lucide-react';

const AlertModal = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    variant = "success", // success, error, info, warning
    confirmText = "OK"
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    glow: 'from-[#22c55e]',
                    iconBg: 'bg-[#22c55e]',
                    iconColor: 'text-[#064e3b]',
                    icon: <Check size={32} strokeWidth={3} />,
                    titleColor: 'text-[#4ade80]',
                    buttonBg: 'bg-[#22c55e] hover:bg-[#16a34a] text-[#064e3b]',
                };
            case 'error':
                return {
                    glow: 'from-[#ef4444]',
                    iconBg: 'bg-[#ef4444]',
                    iconColor: 'text-[#450a0a]',
                    icon: <X size={28} strokeWidth={1.5} />,
                    titleColor: 'text-[#f87171]',
                    buttonBg: 'bg-[#ef4444] hover:bg-[#dc2626] text-[#450a0a]',
                };
            case 'warning':
                return {
                    glow: 'from-[#f59e0b]',
                    iconBg: 'bg-[#f59e0b]',
                    iconColor: 'text-[#451a03]',
                    icon: <AlertTriangle size={32} strokeWidth={2.5} />,
                    titleColor: 'text-[#fbbf24]',
                    buttonBg: 'bg-[#f59e0b] hover:bg-[#d97706] text-[#451a03]',
                };
            default: // info
                return {
                    glow: 'from-[#3b82f6]',
                    iconBg: 'bg-[#3b82f6]',
                    iconColor: 'text-[#1e3a8a]',
                    icon: <Info size={32} strokeWidth={2.5} />,
                    titleColor: 'text-[#60a5fa]',
                    buttonBg: 'bg-[#3b82f6] hover:bg-[#2563eb] text-[#1e3a8a]',
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-sm bg-[#1a1b26] border border-slate-800 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Subtle Background Glow Gradients */}
                <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${styles.glow} to-transparent opacity-10 pointer-events-none`} />
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${styles.glow} to-transparent opacity-10 pointer-events-none`} />

                <div className="p-8 text-center relative z-10">
                    <div className={`w-20 h-20 rounded-full ${styles.iconBg} ${styles.iconColor} flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                        {styles.icon}
                    </div>

                    <h3 className={`text-xl font-bold ${styles.titleColor} mb-2 tracking-tight`}>{title}</h3>
                    <p className="text-slate-300 text-[14px] leading-relaxed mb-8 opacity-90">
                        {message}
                    </p>
                    
                    <button 
                        onClick={onClose}
                        className={`w-full h-12 ${styles.buttonBg} font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
