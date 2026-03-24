import React from 'react';
import { X, Palette, Check } from 'lucide-react';

const ChangeBackgroundBoard = ({ isOpen, onClose, currentTopBarColor, onColorSelect }) => {
    if (!isOpen) return null;

    const premiumColors = [
        { name: 'Windows Blue', value: '#0078d4' },
        { name: 'Midnight Navy', value: '#0f172a' },
        { name: 'Forest Green', value: '#115e59' },
        { name: 'Crimson Red', value: '#991b1b' },
        { name: 'Royal Purple', value: '#5b21b6' },
        { name: 'Modern Charcoal', value: '#334155' },
        { name: 'Deep Teal', value: '#134e4a' },
        { name: 'Bordeaux', value: '#7f1d1d' },
        { name: 'Jet Black', value: '#000000' },
        { name: 'Classic Slate', value: '#475569' },
        { name: 'Dark Indigo', value: '#312e81' },
        { name: 'Emerald', value: '#064e3b' },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-slate-50 px-6 py-5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Palette size={20} className="text-[#0078d4]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">Themes</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Top Bar Color</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors rounded-full">
                        <X size={18} />
                    </button>
                </div>

                {/* Body: Color Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-4 gap-4">
                        {premiumColors.map((color, idx) => {
                            const isSelected = currentTopBarColor === color.value;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => onColorSelect(color.value)}
                                    className={`group relative aspect-square rounded-2xl transition-all duration-300 ${isSelected ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-slate-100' : 'hover:scale-105 shadow-sm'}`}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                            <Check size={24} strokeWidth={4} className="drop-shadow-md" />
                                        </div>
                                    )}
                                    
                                    {/* Tooltip on Hover */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity uppercase tracking-tighter">
                                        {color.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Tips */}
                <div className="px-8 pb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[11px] font-medium text-slate-500">
                            Selecting a color will immediately update the navigation ribbon style.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeBackgroundBoard;
