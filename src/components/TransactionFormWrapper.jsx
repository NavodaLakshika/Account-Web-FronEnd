import React from 'react';
import { X } from 'lucide-react';

const TransactionFormWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-7xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className={`relative w-full ${maxWidth} bg-white rounded-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-400 flex flex-col max-h-[95vh]`}>
        <div className="flex items-center justify-between px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-none bg-slate-100 flex items-center justify-center">
                <Icon size={15} className="text-slate-500" />
              </div>
            )}
            <div>
              <h2 className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest leading-tight">{title}</h2>
              {subtitle && <p className="text-[11px] font-bold text-gray-500 uppercase">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors border-none shrink-0 bg-transparent">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionFormWrapper;
