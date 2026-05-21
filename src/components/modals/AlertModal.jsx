import { CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

const AlertModal = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    variant = "success", // success, info, warning
    confirmText = "OK"
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'success':
                return <CheckCircle size={40} className="text-emerald-500" />;
            case 'warning':
                return <AlertTriangle size={40} className="text-amber-500" />;
            default:
                return <Info size={40} className="text-[#0078d4]" />;
        }
    };

    const getColors = () => {
        switch (variant) {
            case 'success':
                return { bg: 'bg-emerald-50', border: 'border-emerald-100', button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' };
            case 'warning':
                return { bg: 'bg-amber-50', border: 'border-amber-100', button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' };
            default:
                return { bg: 'bg-blue-50', border: 'border-blue-100', button: 'bg-[#0078d4] hover:bg-[#005a9e] shadow-blue-200' };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] ">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className={`w-20 h-20 ${colors.bg} ${colors.border} rounded-full flex items-center justify-center mx-auto mb-6 border-4 shadow-lg`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {message}
                    </p>
                    
                    <button 
                        onClick={onClose}
                        className={`w-full h-12 ${colors.button} text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}
                    >
                        {confirmText}
                    </button>
                </div>
                
                <div className="bg-slate-50 py-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">
                        System Alert
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
