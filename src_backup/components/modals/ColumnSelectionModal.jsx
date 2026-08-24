import { useState, useEffect } from 'react';
import { FileDown, X, CheckSquare, Square } from 'lucide-react';

const GRN_COLUMNS = [
    { key: 'Supplier Code', label: 'Supplier Code', validation: true, desc: 'Unique identifier for the supplier' },
    { key: 'Supplier Invoice', label: 'Supplier Invoice', validation: false, desc: 'Invoice number provided by supplier' },
    { key: 'PO Number', label: 'PO Number', validation: false, desc: 'Associated Purchase Order number' },
    { key: 'Payment Method', label: 'Payment Method', validation: false, desc: 'Cash, Credit, Bank Transfer, etc.' },
    { key: 'Comment', label: 'Comment', validation: false, desc: 'Additional internal remarks' },
    { key: 'Product Code', label: 'Product Code', validation: true, desc: 'Unique item identifier' },
    { key: 'Product Name', label: 'Product Name', validation: false, desc: 'Full description of the item' },
    { key: 'Unit', label: 'Unit', validation: false, desc: 'Unit of measurement (Nos, Kg, etc.)' },
    { key: 'Pack Size', label: 'Pack Size', validation: false, desc: 'Number of items per pack' },
    { key: 'Category', label: 'Category', validation: false, desc: 'Primary product category' },
    { key: 'Department', label: 'Department', validation: false, desc: 'Associated department' },
    { key: 'Available Stock', label: 'Available Stock', validation: false, desc: 'Current stock level before GRN' },
    { key: 'Purchase Price', label: 'Purchase Price', validation: false, desc: 'Unit cost price' },
    { key: 'Selling Price', label: 'Selling Price', validation: false, desc: 'Unit retail price' },
    { key: 'Qty', label: 'Qty', validation: true, desc: 'Quantity received' },
    { key: 'Free Qty', label: 'Free Qty', validation: false, desc: 'Bonus or free items received' },
];

const ColumnSelectionModal = ({ isOpen, onClose, onDownload, columns = GRN_COLUMNS }) => {
    const [selected, setSelected] = useState({});

    useEffect(() => {
        if (isOpen) {
            const defaults = {};
            columns.forEach(col => { defaults[col.key] = true; });
            setSelected(defaults);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggle = (key) => {
        setSelected(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const selectAll = () => {
        const all = {};
        columns.forEach(col => { all[col.key] = true; });
        setSelected(all);
    };

    const deselectAllOptional = () => {
        const all = {};
        columns.forEach(col => { all[col.key] = col.validation; });
        setSelected(all);
    };

    const handleDownload = () => {
        const cols = columns.filter(col => selected[col.key]).map(col => col.key);
        onDownload(cols);
        onClose();
    };

    const allSelected = columns.every(col => selected[col.key]);

    return (
        <div className="fixed inset-0 z-[600] bg-white flex flex-col animate-in zoom-in-95 duration-200 font-['Tahoma']">
            {/* Header */}
            <div className="h-[73px] border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white z-20 shadow-sm">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-mono font-black uppercase tracking-widest text-slate-800">
                        Template Configuration
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Select data points to include in the GRN Excel template
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={selectAll}
                        className="text-[11px] font-black uppercase tracking-widest text-[#0285fd] hover:text-[#0073ff] transition-colors flex items-center gap-1.5"
                    >
                        <CheckSquare size={14} /> Select All
                    </button>
                    <span className="text-gray-300 font-bold">|</span>
                    <button
                        onClick={deselectAllOptional}
                        className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
                    >
                        <Square size={14} /> Required Only
                    </button>
                    <button onClick={onClose} className="w-8 h-8 ml-4 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all border border-slate-200 shadow-sm">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6 px-4 py-3 border border-amber-200 bg-amber-50 rounded-[3px] shadow-sm">
                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide leading-relaxed">
                            <span className="font-black text-red-600">Note:</span> Columns marked as Required are mandatory for system validation during import and cannot be excluded.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3px] shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {/* We split columns into chunks for grid display */}
                            <div className="flex flex-col divide-y divide-slate-100">
                                {columns.slice(0, 6).map(col => (
                                    <ColumnRow key={col.key} col={col} selected={selected[col.key]} onToggle={() => toggle(col.key)} />
                                ))}
                            </div>
                            <div className="flex flex-col divide-y divide-slate-100">
                                {columns.slice(6, 12).map(col => (
                                    <ColumnRow key={col.key} col={col} selected={selected[col.key]} onToggle={() => toggle(col.key)} />
                                ))}
                            </div>
                            <div className="flex flex-col divide-y divide-slate-100">
                                {columns.slice(12, 16).map(col => (
                                    <ColumnRow key={col.key} col={col} selected={selected[col.key]} onToggle={() => toggle(col.key)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-[81px] border-t border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="text-[12px] font-black uppercase tracking-widest text-slate-500">
                    Total Columns Selected: <span className="text-[#0285fd]">{columns.filter(c => selected[c.key]).length}</span> / {columns.length}
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="h-10 px-8 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[12px] transition-all flex items-center justify-center font-mono uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        className="h-10 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-[3px] shadow-sm text-[12px] transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-widest"
                    >
                        <FileDown size={16} /> Download Template
                    </button>
                </div>
            </div>
        </div>
    );
};

const ColumnRow = ({ col, selected, onToggle }) => (
    <label
        className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-blue-50/50 transition-colors group
            ${selected ? 'bg-blue-50/20' : 'bg-white'}`}
    >
        <div className="pt-0.5">
            <input
                type="checkbox"
                checked={!!selected}
                disabled={col.validation}
                onChange={onToggle}
                className="w-4 h-4 rounded text-[#0285fd] focus:ring-[#0285fd] border-gray-300 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[12px] font-black uppercase tracking-widest ${col.validation ? 'text-gray-800' : 'text-gray-600 group-hover:text-[#0285fd] transition-colors'}`}>
                    {col.label}
                </span>
                {col.validation && (
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-[3px] border border-red-100">Required</span>
                )}
            </div>
            <span className="text-[11px] text-gray-400 font-medium leading-snug">
                {col.desc}
            </span>
        </div>
    </label>
);

export default ColumnSelectionModal;
