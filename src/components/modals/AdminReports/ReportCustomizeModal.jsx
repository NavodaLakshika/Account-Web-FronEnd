import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const ReportCustomizeModal = ({ isOpen, onClose, customizations, onApply, columns = [] }) => {
    const [localState, setLocalState] = React.useState(customizations || {});
    
    React.useEffect(() => {
        if (isOpen && customizations) {
            setLocalState(customizations);
        }
    }, [isOpen, customizations]);

    const updateState = (key, value) => {
        setLocalState(prev => {
            const newState = { ...prev, [key]: value };
            if (onApply) onApply(newState);
            return newState;
        });
    };

    const addFilter = () => {
        const currentFilters = localState.filters || [];
        updateState('filters', [...currentFilters, { id: Date.now(), column: '', condition: 'Equals', value: '' }]);
    };

    const updateFilter = (id, key, value) => {
        const currentFilters = localState.filters || [];
        updateState('filters', currentFilters.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const removeFilter = (id) => {
        const currentFilters = localState.filters || [];
        updateState('filters', currentFilters.filter(f => f.id !== id));
    };

    const clearFilters = () => {
        updateState('filters', []);
    };
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        filters: true,
        numberFormat: true,
        showNonZero: true,
        header: true,
        footer: true,
        cellSettings: true
    });

    if (!isOpen) return null;

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="fixed inset-0 z-[600] flex justify-end pointer-events-none">
            <div className="w-[450px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto">
                
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 shrink-0">
                    <h2 className="text-[18px] font-semibold text-slate-800">Customise</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 flex border-b border-gray-200 shrink-0">
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`py-3 px-4 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'data' ? 'border-[#0077c5] text-[#0077c5]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Data
                    </button>
                    <button 
                        onClick={() => setActiveTab('visual')}
                        className={`py-3 px-4 text-[14px] font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'visual' ? 'border-[#0077c5] text-[#0077c5]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        Visual
                        <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[#f4f5f8] p-2">
                    {activeTab === 'data' ? (
                        <div className="flex flex-col gap-2">
                            {/* Filters Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('filters')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <span className="text-[13px] font-bold text-gray-800 flex items-center gap-1">Filters <span className="text-gray-400 font-normal border border-gray-300 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px]">?</span></span>
                                    {expandedSections.filters ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.filters && (
                                    <div className="p-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[12px] text-gray-600">Select how you want to filter your data.</p>
                                            <button onClick={clearFilters} className="text-[#0077c5] text-[12px] font-bold hover:underline">Clear all</button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {(localState.filters || []).map((filter, index) => (
                                                <div key={filter.id} className="p-3 bg-gray-50 border border-gray-200 rounded relative group">
                                                    <button onClick={() => removeFilter(filter.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={14} />
                                                    </button>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="block text-[11px] text-gray-500 mb-1">Filter by</label>
                                                            <select 
                                                                value={filter.column} 
                                                                onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                                                                className="w-[calc(100%-24px)] h-8 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]"
                                                            >
                                                                <option value="">Select a column</option>
                                                                {columns.map(col => (
                                                                    <option key={col.accessor || col.header} value={col.accessor || col.header}>{col.header}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] text-gray-500 mb-1">Condition</label>
                                                            <select 
                                                                value={filter.condition}
                                                                onChange={(e) => updateFilter(filter.id, 'condition', e.target.value)}
                                                                className="w-[calc(100%-24px)] h-8 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]"
                                                            >
                                                                <option value="Equals">Equals</option>
                                                                <option value="Not Equals">Not Equals</option>
                                                                <option value="Contains">Contains</option>
                                                                <option value="Greater Than">Greater Than</option>
                                                                <option value="Less Than">Less Than</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] text-gray-500 mb-1">Value</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Enter value" 
                                                                value={filter.value}
                                                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                                                className="w-[calc(100%-24px)] h-8 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <button onClick={addFilter} className="text-[#0077c5] text-[12px] font-bold hover:underline mt-2 flex items-center">
                                                + Add another filter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Number Format Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('numberFormat')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <span className="text-[13px] font-bold text-gray-800">Number format</span>
                                    {expandedSections.numberFormat ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.numberFormat && (
                                    <div className="p-4 border-t border-gray-200 space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={localState.divideBy1000 || false} onChange={e => updateState('divideBy1000', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                            <span className="text-[13px] text-gray-700">Divide by 1000</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={localState.hideCurrency || false} onChange={e => updateState('hideCurrency', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                            <span className="text-[13px] text-gray-700">Don't show currency symbol</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={localState.roundWholeNumber || false} onChange={e => updateState('roundWholeNumber', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                            <span className="text-[13px] text-gray-700">Round to the nearest whole number</span>
                                        </label>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <label className="block text-[12px] text-gray-600 mb-2">Negative numbers</label>
                                            <div className="flex gap-6 items-center">
                                                <select value={localState.negativeNumbers || '-100'} onChange={e => updateState('negativeNumbers', e.target.value)} className="w-24 h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">
                                                    <option value="-100">-100</option>
                                                    <option value="(100)">(100)</option>
                                                </select>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={localState.negativeRed || false} onChange={e => updateState('negativeRed', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-700">Show in red</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Show non-zero or active Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('showNonZero')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <span className="text-[13px] font-bold text-gray-800">Show non-zero or active</span>
                                    {expandedSections.showNonZero ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.showNonZero && (
                                    <div className="p-4 border-t border-gray-200 space-y-4">
                                        <div>
                                            <label className="block text-[12px] font-bold text-gray-800 mb-2">Show rows</label>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showRows" checked={localState.showRows === 'active' || !localState.showRows} onChange={() => updateState('showRows', 'active')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Active</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showRows" checked={localState.showRows === 'all'} onChange={() => updateState('showRows', 'all')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">All</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showRows" checked={localState.showRows === 'nonzero'} onChange={() => updateState('showRows', 'nonzero')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Non-zero</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-bold text-gray-800 mb-2">Show columns</label>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showCols" checked={localState.showCols === 'active' || !localState.showCols} onChange={() => updateState('showCols', 'active')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Active</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showCols" checked={localState.showCols === 'all'} onChange={() => updateState('showCols', 'all')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">All</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="showCols" checked={localState.showCols === 'nonzero'} onChange={() => updateState('showCols', 'nonzero')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Non-zero</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* Header Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('header')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <span className="text-[13px] font-bold text-gray-800">Header</span>
                                    {expandedSections.header ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.header && (
                                    <div className="p-4 border-t border-gray-200 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={localState.showLogo || false} onChange={e => updateState('showLogo', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Company logo</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={localState.showReportPeriod !== false} onChange={e => updateState('showReportPeriod', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Report period</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={localState.showCompanyName !== false} onChange={e => updateState('showCompanyName', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Company name</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-[12px] text-gray-700 mb-1">Header alignment</label>
                                            <select value={localState.headerAlignment || 'Center'} onChange={e => updateState('headerAlignment', e.target.value)} className="w-full h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">
                                                <option value="Center">Centre</option>
                                                <option value="Left">Left</option>
                                                <option value="Right">Right</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[12px] text-gray-700 mb-2">Header layout</label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="headerLayout" checked={localState.headerLayout === 'companyFirst' || localState.headerLayout === undefined} onChange={() => updateState('headerLayout', 'companyFirst')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Company name first</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="headerLayout" checked={localState.headerLayout === 'titleFirst'} onChange={() => updateState('headerLayout', 'titleFirst')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                    <span className="text-[13px] text-gray-600">Report title first</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('footer')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <span className="text-[13px] font-bold text-gray-800">Footer</span>
                                    {expandedSections.footer ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.footer && (
                                    <div className="p-4 border-t border-gray-200 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={localState.showDatePrepared !== false} onChange={e => updateState('showDatePrepared', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Date prepared</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={localState.showTimePrepared !== false} onChange={e => updateState('showTimePrepared', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Time prepared</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer col-span-2">
                                                <input type="checkbox" checked={localState.showReportBasis !== false} onChange={e => updateState('showReportBasis', e.target.checked)} className="w-4 h-4 text-[#0077c5] rounded border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-700">Report basis (cash vs. accrual)</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] text-gray-700 mb-1">Footer alignment</label>
                                            <select value={localState.footerAlignment || 'Center'} onChange={e => updateState('footerAlignment', e.target.value)} className="w-full h-9 border border-gray-300 rounded px-2 text-[13px] text-gray-700 outline-none focus:border-[#0077c5]">
                                                <option value="Center">Centre</option>
                                                <option value="Left">Left</option>
                                                <option value="Right">Right</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cell settings Section */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleSection('cellSettings')} className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-gray-50 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold text-gray-800">Cell settings</span>
                                        <span className="bg-[#c80076] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">NEW</span>
                                    </div>
                                    {expandedSections.cellSettings ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                </button>
                                {expandedSections.cellSettings && (
                                    <div className="p-4 border-t border-gray-200">
                                        <label className="block text-[12px] text-gray-700 mb-2">Show empty cells as</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="emptyCells" checked={localState.showEmptyAs === 'dash'} onChange={() => updateState('showEmptyAs', 'dash')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-600">Dash</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="emptyCells" checked={localState.showEmptyAs === 'blank' || localState.showEmptyAs === undefined} onChange={() => updateState('showEmptyAs', 'blank')} className="w-4 h-4 text-[#0077c5] border-gray-300 focus:ring-[#0077c5]" />
                                                <span className="text-[13px] text-gray-600">Blank</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#f4f5f8] border-t border-gray-200 flex justify-between items-center shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-[14px] font-bold text-[#0077c5] hover:bg-[#eef6fc] rounded-[3px] transition-colors">
                        Close
                    </button>
                    {/* The Apply button is removed since changes now apply automatically */}
                </div>
            </div>
        </div>
    );
};

export default ReportCustomizeModal;
