import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, CornerDownLeft, X } from 'lucide-react';

const GlobalSearchModal = ({ isOpen, onClose, items = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Typing Animation State
    const [placeholderText, setPlaceholderText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const phrases = ["Search for 'Customers'...", "Search for 'Vendor Master'...", "Search for 'Journal Entry'...", "Find any form instantly..."];

    // Typing effect
    useEffect(() => {
        if (!isOpen) return;

        const currentPhrase = phrases[phraseIndex];
        let timer;

        if (isDeleting) {
            timer = setTimeout(() => {
                setPlaceholderText(currentPhrase.substring(0, charIndex - 1));
                setCharIndex(c => c - 1);
                if (charIndex <= 1) {
                    setIsDeleting(false);
                    setPhraseIndex((phraseIndex + 1) % phrases.length);
                }
            }, 40); // fast delete
        } else {
            if (charIndex === currentPhrase.length) {
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, 1500); // pause at end of word
            } else {
                timer = setTimeout(() => {
                    setPlaceholderText(currentPhrase.substring(0, charIndex + 1));
                    setCharIndex(c => c + 1);
                }, 80); // typing speed
            }
        }

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, isOpen, phraseIndex]);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setPlaceholderText('');
            setCharIndex(0);
            setPhraseIndex(0);
            setIsDeleting(false);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Scroll to selected item
    useEffect(() => {
        if (resultsRef.current && resultsRef.current.children[selectedIndex]) {
            const el = resultsRef.current.children[selectedIndex];
            if(el && el.scrollIntoView) {
                 el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    // Filter items based on query
    const filteredItems = items.filter(item => 
        item.label?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.path?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50); // limit to top 50 results

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
            }
        }
    };

    const handleSelect = (item) => {
        if (item.onClick) {
            item.onClick();
        }
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 font-['Tahoma']">
            {/* Backdrop with low blur and smooth fade-in animation */}
            <div 
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-500 ease-out" 
                onClick={onClose}
            ></div>

            {/* Modal Content - Premium Spotlight Style */}
            <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] rounded-[3px] overflow-hidden flex flex-col border border-slate-200/60 animate-in slide-in-from-top-12 zoom-in-[0.98] fade-in duration-400 ease-out">
                
                {/* Search Input Area */}
                <div className="flex items-center p-2.5 border-b border-slate-100 bg-white/50 relative group">
                    <Search className="text-slate-400 ml-2 mr-3 transition-colors group-focus-within:text-blue-500" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholderText || "Search..."}
                        className="flex-1 bg-transparent h-[38px] text-slate-800 text-[14px] outline-none placeholder:text-slate-300 font-medium tracking-wide"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button onClick={() => {setSearchQuery(''); setSelectedIndex(0);}} className="p-1.5 rounded-[3px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ml-2 border-none flex items-center justify-center">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Results List */}
                {searchQuery.trim().length > 0 && (
                    <div 
                        className="max-h-[320px] overflow-y-auto no-scrollbar bg-slate-50/50"
                    >
                        {filteredItems.length === 0 ? (
                            <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-[3px] bg-slate-100 flex items-center justify-center mb-2">
                                    <Search className="text-slate-300" size={16} />
                                </div>
                                <span className="text-[12px] text-slate-500 uppercase tracking-widest font-medium">
                                    No matching forms found for "{searchQuery}"
                                </span>
                            </div>
                        ) : (
                            <div className="p-1.5" ref={resultsRef}>
                                {filteredItems.map((item, index) => {
                                    const isSelected = index === selectedIndex;
                                    return (
                                        <div
                                            key={index}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            onClick={() => handleSelect(item)}
                                            className={`flex items-center justify-between p-2.5 mx-1.5 my-0.5 rounded-[3px] cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-50/80 shadow-sm border border-blue-100/50 translate-x-1' : 'bg-transparent border border-transparent hover:bg-white hover:shadow-sm'}`}
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <div className={`text-[13px] uppercase truncate transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                                                    {item.label}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1 uppercase tracking-widest font-medium">
                                                    {item.path}
                                                </div>
                                            </div>
                                            <div className="text-right pl-4 shrink-0 align-middle">
                                                {isSelected && (
                                                    <div className="inline-flex items-center justify-end gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-100/50 px-3 py-1.5 rounded-[3px] shadow-sm">
                                                        <span>ENTER</span>
                                                        <CornerDownLeft size={12} strokeWidth={2.5} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default GlobalSearchModal;
