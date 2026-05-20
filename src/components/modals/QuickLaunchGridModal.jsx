import React from 'react';
import { X, Search } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';

/**
 * Full-screen quick launch grid (Home, Accounts, Customers, …).
 * File path: src/components/modals/QuickLaunchGridModal.jsx
 */
const QuickLaunchGridModal = ({ isOpen, onClose, items, onSearch, onAIClick }) => {
  if (!isOpen) return null;

  const tiles = (items || []).filter((i) => i.label !== 'Search');

  return (
    <div
      className="fixed inset-0 z-[8500] flex items-center justify-center p-4 sm:p-8 font-['Plus_Jakarta_Sans']"
      role="dialog"
      aria-modal="true"
      aria-label="Quick launch"
    >
      <div
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-[960px] max-h-[90vh] overflow-hidden rounded-[10px] shadow-2xl border border-white/80 bg-gradient-to-br from-slate-100 via-slate-50 to-sky-100/90 flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3  px-5 pt-5 pb-2 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-1 ">
            Quick launch
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-10 pb-28 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6">
            {tiles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={`${item.label}-${idx}`} className="flex flex-col items-center gap-2.5 group">
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick?.();
                      onClose?.();
                    }}
                    className="w-full aspect-square max-w-[140px] mx-auto flex flex-col items-center justify-center p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-[0_16px_40px_-12px_rgba(0,120,212,0.18)] hover:border-[#0078d4]/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
                  >
                    <Icon
                      size={40}
                      strokeWidth={1.35}
                      className="text-slate-600 group-hover:text-[#0078d4] transition-colors"
                    />
                  </button>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 group-hover:text-[#0078d4] uppercase tracking-widest text-center leading-tight max-w-[120px]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mascot */}
        {/* <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              onAIClick?.();
              onClose?.();
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 drop-shadow-xl"
            title="AI Assistant"
          >
            <DotLottiePlayer
              src="/images/Ai Robot Vector Art.lottie"
              autoplay
              loop
              className="w-full h-full"
            />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default QuickLaunchGridModal;
