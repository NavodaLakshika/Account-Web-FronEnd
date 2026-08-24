import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { X, MessageSquare, Settings, HelpCircle, History, ExternalLink } from 'lucide-react';
import SubmitReviewModal from './modals/SubmitReviewModal';
import FormHelpModal from './modals/FormHelpModal';
import FeatureLockedModal from './modals/FeatureLockedModal';
import FormSettingsModal from './modals/FormSettingsModal';

const TransactionFormWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, children, footer, maxWidth = 'max-w-7xl', boardName }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lockedMessage, setLockedMessage] = useState("");
  const [isPoppedOut, setIsPoppedOut] = useState(false);

  const externalWindowRef = useRef(null);
  const containerRef = useRef(null);

  const [formSettings, setFormSettings] = useState(() => {
    const saved = localStorage.getItem('transactionFormSettings');
    let parsed = saved ? JSON.parse(saved) : { darkMode: false, compactLayout: false, showTooltips: true, highContrast: false, fullWidth: false, disableAnimations: false, grayscale: false, fontFamily: 'Default', borderStyle: 'Default', sepiaMode: false, vibrantMode: false };

    if (parsed.monoFont) {
      parsed.fontFamily = 'Monospace';
      delete parsed.monoFont;
    }
    if (!parsed.fontFamily) {
      parsed.fontFamily = 'Default';
    }
    return parsed;
  });

  const updateFormSettings = (newSettings) => {
    setFormSettings(newSettings);
    localStorage.setItem('transactionFormSettings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    if (isOpen && !isPoppedOut) {
      window.history.pushState({ modalOpen: title }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, title, isPoppedOut]);

  const [containerNode, setContainerNode] = useState(null);

  const handlePopOut = () => {
    if (boardName) {
      window.open(`/board?name=${boardName}`, '_blank');
      if (onClose) onClose();
      return;
    }
    if (isPoppedOut) return;

    const win = window.open('', '_blank');
    if (win) {
      externalWindowRef.current = win;
      win.document.title = title || 'Onimta Form';

      // Copy styles
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        win.document.head.appendChild(style.cloneNode(true));
      });

      // Set body background
      win.document.body.className = `bg-[#f4f5f8] overflow-x-hidden ${formSettings.darkMode ? 'bg-slate-900' : ''}`;

      // CRITICAL: The container MUST be created using the original window's document
      // to avoid React rendering bugs related to cross-window instanceof checks!
      const div = document.createElement('div');
      div.style.minHeight = '100vh';
      div.style.width = '100vw';
      div.style.overflow = 'hidden';

      win.document.body.appendChild(div);

      setContainerNode(div);
      setIsPoppedOut(true);

      win.addEventListener('beforeunload', () => {
        setIsPoppedOut(false);
        setContainerNode(null);
        externalWindowRef.current = null;
      });
    } else {
      alert('Please allow popups to open forms in a new tab.');
    }
  };

  useEffect(() => {
    return () => {
      if (externalWindowRef.current) {
        externalWindowRef.current.close();
      }
    };
  }, []);


  if (!isOpen) return null;

  const contentToRender = (
    <div className={`fixed inset-0 z-[500] flex bg-[#f4f5f8] overflow-hidden text-gray-800 ${formSettings.fontFamily === 'Monospace' ? 'font-mono' : 'font-sans'} ${formSettings.darkMode ? 'bg-slate-900' : ''}`}>
      <Helmet>
        <title>{title ? `Onimta Accounting | ${title}` : 'Onimta Accounting'}</title>
      </Helmet>
      {formSettings.disableAnimations && (
        <style>{`
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
          }
        `}</style>
      )}
      {formSettings.fontFamily && formSettings.fontFamily !== 'Default' && (
        <style>{`
          * {
            font-family: ${formSettings.fontFamily === 'Inter' ? '"Inter", sans-serif' :
            formSettings.fontFamily === 'Monospace' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' :
              formSettings.fontFamily === 'Serif' ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' :
                formSettings.fontFamily === 'Arial' ? 'Arial, Helvetica, sans-serif' :
                  formSettings.fontFamily === 'Tahoma' ? '"Tahoma", sans-serif' :
                    'inherit'
          } !important;
          }
        `}</style>
      )}
      {formSettings?.borderStyle && formSettings.borderStyle !== 'Default' && (
        <style>{`
            ${formSettings.borderStyle === 'Sharp' ? '* { border-radius: 0px !important; }' : ''}
            ${formSettings.borderStyle === 'Round' ? 'button, input, select, textarea, [class~="rounded"], [class*="rounded-"] { border-radius: 10px !important; }' : ''}
            ${formSettings.borderStyle === 'Pill' ? 'button, input, select, textarea { border-radius: 9999px !important; }' : ''}
        `}</style>
      )}
      <div
        className="relative w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        style={{
          filter: [
            formSettings.darkMode ? 'invert(0.92) hue-rotate(180deg)' : '',
            formSettings.grayscale ? 'grayscale(1)' : '',
            formSettings.sepiaMode ? 'sepia(0.8)' : '',
            formSettings.vibrantMode ? 'saturate(2) contrast(1.1) brightness(1.05)' : ''
          ].filter(Boolean).join(' ') || 'none',
          transform: formSettings.compactLayout ? 'scale(0.92)' : 'scale(1)',
          transformOrigin: 'top center',
          transition: formSettings.disableAnimations ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white shrink-0 border-b border-gray-200 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="flex items-center justify-center text-gray-600">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
              )}
              <div className="flex flex-col gap-0.5 overflow-hidden justify-center">
                <span className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {subtitle}
                  </span>
                )}
              </div>
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
            <div className="relative flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsModal(!showSettingsModal);
                }}
                className={`transition-colors bg-transparent border-none p-1 ${showSettingsModal ? 'text-[#0285fd]' : 'text-gray-500 hover:text-gray-800'}`}
                title="Settings"
              >
                <Settings size={20} strokeWidth={2} />
              </button>
              <FormSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                settings={formSettings}
                onSettingsChange={updateFormSettings}
              />
            </div>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1"
              title="Help"
            >
              <HelpCircle size={20} strokeWidth={2} />
            </button>
            <button
              onClick={handlePopOut}
              disabled={isPoppedOut}
              className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1 disabled:opacity-50"
              title="Open in new tab"
            >
              <ExternalLink size={20} strokeWidth={2} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-none p-1 ml-2">
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f4f5f8] relative z-0">
          <div className={`mx-auto w-full ${formSettings.fullWidth ? 'max-w-full px-8' : maxWidth} p-6 pb-24 h-full transition-all duration-300`}>
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
      <FormHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <FeatureLockedModal isOpen={showLockedModal} onClose={() => setShowLockedModal(false)} message={lockedMessage} />
    </div>
  );

  if (isPoppedOut && containerNode) {
    return ReactDOM.createPortal(contentToRender, containerNode);
  }

  return contentToRender;
};

export default TransactionFormWrapper;
