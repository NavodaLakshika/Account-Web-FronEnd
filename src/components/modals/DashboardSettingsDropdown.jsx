import React, { useState, useEffect, useRef } from 'react';
import { Palette, Layout, Shield, Maximize, ZapOff, Type, CircleDashed, Square, List, Circle } from 'lucide-react';

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

    const SettingRow = ({ icon: Icon, title, stateKey }) => (
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

    return (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-3 z-[600] w-[280px] bg-white rounded-[4px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-150 font-['Tahoma'] cursor-default max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 rounded-t-[4px] flex items-center gap-2">
                <Palette size={14} className="text-gray-500" />
                <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Dashboard Display</h4>
            </div>

            {/* Content */}
            <div className="py-1">
                <SettingRow icon={Layout} title="Compact Layout" stateKey="compactLayout" />
                <SettingRow icon={Maximize} title="Full Width" stateKey="fullWidth" />
                <SettingRow icon={List} title="List View Layout" stateKey="listLayout" />
                <SettingRow icon={Square} title="Solid Cards" stateKey="solidCards" />
                <SettingRow icon={Circle} title="Rounded Buttons" stateKey="roundedButtons" />
                <SettingRow icon={Type} title="Monospace Font" stateKey="monoFont" />
                <SettingRow icon={Shield} title="High Contrast" stateKey="highContrast" />
                <SettingRow icon={CircleDashed} title="Grayscale Mode" stateKey="grayscale" />
                <SettingRow icon={ZapOff} title="Disable Animations" stateKey="disableAnimations" />
            </div>
        </div>
    );
};

export default DashboardSettingsDropdown;
