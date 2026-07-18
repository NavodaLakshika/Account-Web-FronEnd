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
                                className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export const MasterSelect = ({
    value,
    onChange,
    name,
    options = [],
    readOnly,
    isIdField,
    className,
    placeholder = "Select...",
    ...props
}) => {
    const baseClass = "flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 appearance-none bg-no-repeat bg-right";
    const bgImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
    
    let stateClass = "";
    if (readOnly && isIdField) {
        stateClass = "w-32 text-[#0285fd] bg-slate-50 flex-none cursor-not-allowed";
    } else if (readOnly) {
        stateClass = "text-gray-700 bg-slate-50 cursor-not-allowed";
    } else {
        stateClass = "text-gray-700 bg-white cursor-pointer";
    }

    return (
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={readOnly}
            className={`${baseClass} ${stateClass} ${className || ''}`}
            style={{ backgroundImage: bgImage, backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
            {...props}
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

