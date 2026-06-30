import React, { useState } from 'react';
import { X, MessageSquare, Settings, HelpCircle, History } from 'lucide-react';
import SubmitReviewModal from './modals/SubmitReviewModal';
import HelpModal from './modals/HelpModal';
import FeatureLockedModal from './modals/FeatureLockedModal';

const TransactionFormWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-7xl' }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedMessage, setLockedMessage] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex bg-[#f4f5f8] overflow-hidden text-gray-800 font-sans">
      <div className="relative w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white shrink-0 border-b border-gray-200 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setLockedMessage("Transaction history is restricted for this module. Please contact your system administrator.");
                setShowLockedModal(true);
              }}
              className="text-gray-400 hover:text-gray-700 transition-colors bg-transparent border-none p-1"
              title="View History"
            >
              <History size={20} strokeWidth={2} />
            </button>
            <div className="flex flex-col gap-0.5 overflow-hidden justify-center">
              <span className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate flex items-center gap-2">
                 {Icon && <Icon size={18} className="text-gray-600" />}
                 {title}
              </span>
              {subtitle && (
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate flex items-center gap-2">
                      {Icon && <span className="w-[18px]"></span>}
                      {subtitle}
                  </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none font-medium"
            >
              <MessageSquare size={18} strokeWidth={2} />
              <span className="hidden sm:inline">Give feedback</span>
            </button>
            <button 
              onClick={() => {
                setLockedMessage("Form settings configuration is restricted. Please contact your system administrator.");
                setShowLockedModal(true);
              }}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1"
              title="Settings"
            >
              <Settings size={20} strokeWidth={2} />
            </button>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1"
              title="Help"
            >
              <HelpCircle size={20} strokeWidth={2} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1 ml-2">
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f4f5f8] relative z-0">
          <div className={`mx-auto w-full ${maxWidth} p-6 pb-24 h-full`}>
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="w-full bg-white border-t border-gray-200 shrink-0 z-20">
            {footer}
          </div>
        )}
      </div>

      {/* Action Modals */}
      <SubmitReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <FeatureLockedModal isOpen={showLockedModal} onClose={() => setShowLockedModal(false)} message={lockedMessage} />
    </div>
  );
};

export default TransactionFormWrapper;
