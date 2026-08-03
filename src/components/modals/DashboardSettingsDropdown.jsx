import React, { useState, useEffect, useRef } from 'react';
import { Palette, Layout, Shield, Maximize, ZapOff, Type, CircleDashed, Square, List, Circle, Coffee, Sun } from 'lucide-react';

const SettingRow = ({ icon: Icon, title, stateKey, settings, toggleSetting }) => (
    <div
        className="flex items-center justify-between py-2.5 px-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
        onClick={() => toggleSetting(stateKey)}
    >
        <div className="flex items-center gap-3">
            <Icon size={14} className="text-gray-400" />
            <span className="text-[12px] font-semibold text-gray-700">{title}</span>
        </div>
        <div className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out ${settings[stateKey] ? 'bg-[#0285fd]' : 'bg-gray-200'}`}>
            <span aria-hidden="true" className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${settings[stateKey] ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
        </div>
    </div>
);

const FontSelectorRow = ({ currentFont, onFontChange }) => {
    const fonts = [
        { id: 'Default', label: 'Default' },
        { id: 'Tahoma', label: 'Tahoma' },
        { id: 'Inter', label: 'Inter' },
        { id: 'Monospace', label: 'Mono' }
    ];

    return (
        <div className="py-2.5 px-4 border-b border-gray-50 flex flex-col gap-2.5 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
                <Type size={14} className="text-gray-400" />
                <span className="text-[12px] font-semibold text-gray-700">Typography Format</span>
            </div>
            <div className="flex bg-gray-100/50 p-1 rounded-[3px] border border-gray-200/50">
                {fonts.map(font => (
                    <button
                        key={font.id}
                        onClick={() => onFontChange(font.id)}
                        className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-[2px] transition-all flex items-center justify-center ${currentFont === font.id ? 'bg-white text-[#0285fd] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                    >
                        {font.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const BorderSelectorRow = ({ currentBorder, onBorderChange }) => {
    const borders = [
        { id: 'Sharp', label: 'Sharp', roundedClass: 'rounded-none' },
        { id: 'Default', label: 'Soft', roundedClass: 'rounded-[3px]' },
        { id: 'Round', label: 'Round', roundedClass: 'rounded-md' },
        { id: 'Pill', label: 'Pill', roundedClass: 'rounded-full' }
    ];

    return (
        <div className="py-2.5 px-4 border-b border-gray-50 flex flex-col gap-2.5 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
                <Square size={14} className="text-gray-400" />
                <span className="text-[12px] font-semibold text-gray-700">Border Radius</span>
            </div>
            <div className="flex gap-2">
                {borders.map(border => (
                    <button
                        key={border.id}
                        onClick={() => onBorderChange(border.id)}
                        className={`flex-1 text-[10px] uppercase font-bold py-1.5 transition-all flex items-center justify-center ${border.roundedClass} ${currentBorder === border.id ? 'bg-[#0285fd] text-white shadow-sm' : 'bg-gray-100/50 text-gray-500 border border-gray-200/50 hover:bg-gray-200/50 hover:text-gray-700'}`}
                    >
                        {border.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DashboardSettingsDropdown = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const toggleSetting = (key) => {
        onSettingsChange({ ...settings, [key]: !settings[key] });
    };

    const changeFont = (fontId) => {
        onSettingsChange({ ...settings, fontFamily: fontId });
    };

    const changeBorder = (borderId) => {
        onSettingsChange({ ...settings, borderStyle: borderId });
    };

    return (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-3 z-[600] w-[280px] bg-white rounded-[4px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 font-['Tahoma'] cursor-default max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 rounded-t-[4px] flex items-center gap-2">
                <Palette size={14} className="text-gray-500" />
                <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Dashboard Display</h4>
            </div>

            {/* Content */}
            <div className="py-1">
                <SettingRow icon={Layout} title="Compact Layout" stateKey="compactLayout" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={Maximize} title="Full Width" stateKey="fullWidth" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={List} title="List View Layout" stateKey="listLayout" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={Square} title="Solid Cards" stateKey="solidCards" settings={settings} toggleSetting={toggleSetting} />
                <FontSelectorRow currentFont={settings.fontFamily || 'Default'} onFontChange={changeFont} />
                <BorderSelectorRow currentBorder={settings.borderStyle || 'Default'} onBorderChange={changeBorder} />
                <SettingRow icon={CircleDashed} title="Grayscale Mode" stateKey="grayscale" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={Coffee} title="Sepia Print Mode" stateKey="sepiaMode" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={Sun} title="Vibrant Colors" stateKey="vibrantMode" settings={settings} toggleSetting={toggleSetting} />
                <SettingRow icon={ZapOff} title="Disable Animations" stateKey="disableAnimations" settings={settings} toggleSetting={toggleSetting} />
            </div>
        </div>
    );
};

export default DashboardSettingsDropdown;
