import React, { useState } from 'react';
import TransactionFormWrapper from './TransactionFormWrapper';
import SimpleModal from './SimpleModal';
import { Search, RefreshCw, Save, Trash2, Check, Loader2 } from 'lucide-react';

export const MasterFormWrapper = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    maxWidth = 'max-w-4xl',
    isEditMode,
    loading,
    onClear,
    onSave,
    onDelete,
    children,
    saveLabel = "SAVE",
    updateLabel = "UPDATE",
    customFooter
}) => {
    return (
        <TransactionFormWrapper
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            icon={icon}
            maxWidth={maxWidth}
            footer={
                customFooter ? customFooter : (
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 rounded-b-[5px]">
                        <button
                            onClick={onClear}
                            disabled={loading}
                            className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={14} /> CLEAR FORM
                        </button>

                        {isEditMode && onDelete && (
                            <button
                                onClick={onDelete}
                                disabled={loading}
                                className="px-8 h-10 bg-white text-[#ff3b30] border-2 border-[#ff3b30] hover:bg-red-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE DOC
                            </button>
                        )}

                        <button
                            onClick={onSave}
                            disabled={loading}
                            className={`px-8 h-10 bg-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm border-2 ${isEditMode
                                ? 'text-[#2bb744] border-[#2bb744] hover:bg-green-50'
                                : 'text-[#2bb744] border-[#2bb744] hover:bg-green-50'
                                }`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isEditMode ? updateLabel : saveLabel}
                        </button>
                    </div>
                )
            }
        >
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                        {children}
                    </div>
                </div>
            </div>
        </TransactionFormWrapper>
    );
};

export const MasterFieldRow = ({ label, labelWidth = "w-[120px]", colSpan = "col-span-12", children }) => (
    <div className={`${colSpan} flex items-center gap-2 min-w-0`}>
        <label className={`text-[11px] font-bold text-gray-500 uppercase tracking-widest ${labelWidth} shrink-0`}>
            {label}
        </label>
        <div className="flex-1 flex gap-1 min-w-0 items-center h-8">
            {children}
        </div>
    </div>
);

export const MasterInput = ({
    type = "text",
    value,
    onChange,
    name,
    placeholder,
    readOnly,
    isIdField,
    className,
    checked,
    ...props
}) => {
    if (type === "checkbox") {
        return (
            <label className="flex items-center gap-2 cursor-pointer h-8">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#00D1FF]"
                    disabled={readOnly}
                    {...props}
                />
            </label>
        );
    }

    const baseClass = "flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 ";

    let stateClass = "";
    if (readOnly && isIdField) {
        stateClass = "w-32 text-center text-[#0285fd] bg-slate-50 flex-none cursor-not-allowed";
    } else if (readOnly) {
        stateClass = "text-gray-700 bg-slate-50 cursor-not-allowed";
    } else {
        stateClass = "text-gray-700 bg-white";
    }

    return (
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`${baseClass} ${stateClass} ${className || ''}`}
            {...props}
        />
    );
};

export const MasterLookupInput = ({
    value,
    onSearchClick,
    placeholder,
    readOnly = true,
    isIdField = false,
    className
}) => {
    const baseClass = "flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all cursor-pointer focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 ";
    const stateClass = isIdField ? "w-32 text-center text-[#0285fd] bg-white flex-none" : "text-gray-700 bg-white";

    return (
        <>
            <input
                type="text"
                readOnly={readOnly}
                value={value || ''}
                onClick={onSearchClick}
                className={`${baseClass} ${stateClass} ${className || ''}`}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={onSearchClick}
                className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
            >
                <Search size={14} />
            </button>
        </>
    );
};

export const MasterLookupModal = ({
    isOpen,
    onClose,
    title,
    columns,
    items,
    loading,
    onSelect,
    searchQuery,
    setSearchQuery,
    emptyMsg = "No records found"
}) => {
    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[700px]">
            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            placeholder="Search..."
                        />
                    </div>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={i} className={`px-5 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.width || ''}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-5 py-6 text-center">
                                            <Loader2 size={18} className="animate-spin text-[#00D1FF] mx-auto mb-1.5" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
                                        </td>
                                    </tr>
                                ) : items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className="group hover:bg-blue-50/50 cursor-pointer transition-all border-b border-gray-50"
                                            onClick={() => onSelect(item)}
                                        >
                                            {columns.map((col, i) => (
                                                <td key={i} className={`px-5 py-3 ${col.align === 'right' ? 'text-right' : ''}`}>
                                                    <span className={`text-[12px] font-bold ${col.isId ? 'font-mono text-blue-600' : 'text-slate-700 uppercase group-hover:text-blue-600 transition-colors'}`}>
                                                        {col.render ? col.render(item) : item[col.key]}
                                                    </span>
                                            </td>
                                        ))}
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                        {emptyMsg}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};
