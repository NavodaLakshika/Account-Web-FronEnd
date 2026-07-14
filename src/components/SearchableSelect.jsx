import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = 'Select...', 
    searchPlaceholder = 'Search...' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef(null);

    const filteredOptions = options.filter(opt => 
        (opt.name || opt.label || '').toLowerCase().includes(query.toLowerCase()) ||
        (opt.code || opt.value || '').toLowerCase().includes(query.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value || opt.code === value);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className="w-full h-10 border border-gray-300 rounded-[3px] px-3 flex items-center justify-between bg-white cursor-pointer hover:border-[#0285fd] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-[13px] truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full h-8 pl-8 pr-3 text-[12px] bg-slate-50 border border-transparent rounded outline-none focus:border-[#0285fd] focus:bg-white transition-colors"
                                placeholder={searchPlaceholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto no-scrollbar py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-[12px] text-gray-400 italic">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-blue-50 flex items-center justify-between group ${
                                        (value === opt.value || value === opt.code) ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                            {opt.name || opt.label}
                                        </span>
                                        {(opt.code || opt.value) && (
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                {opt.code || opt.value}
                                            </span>
                                        )}
                                    </div>
                                    {(value === opt.value || value === opt.code) && (
                                        <Check size={14} className="text-blue-600" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
