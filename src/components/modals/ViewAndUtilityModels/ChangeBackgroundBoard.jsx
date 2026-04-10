import React, { useState, useRef, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Pipette, Check, Sparkles, Zap, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const ChangeBackgroundBoard = ({ isOpen, onClose, currentTopBarColor, onColorSelect }) => {
    const [selectedColor, setSelectedColor] = useState(currentTopBarColor || '#0078d4');
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedColor(currentTopBarColor);
            drawColorWheel();
        }
    }, [isOpen, currentTopBarColor]);

    const drawColorWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const radius = width / 2;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - radius;
                const dy = y - radius;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    const angle = Math.atan2(dy, dx);
                    const hue = (angle + Math.PI) / (2 * Math.PI) * 360;
                    const saturation = (distance / radius) * 100;
                    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 50%)`;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    };

    const handleCanvasInteraction = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');

        try {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
            if (pixel[3] > 0) { // Only if not transparent
                setSelectedColor(hex);
            }
        } catch (err) {
            console.error("Canvas interaction error:", err);
        }
    };

    const handleApply = () => {
        onColorSelect(selectedColor);
        
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[320px] w-full bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer
                            src="/lottiefile/Successffull.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                    <div className="flex-grow text-left">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma truncate">Theme Updated</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Applied Successfully</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {/* Progress Bar Timer */}
                <div className="h-[2px] w-full bg-emerald-50">
                    <div 
                        className="h-full bg-emerald-500"
                        style={{ animation: 'toastProgress 3s linear forwards' }}
                    />
                </div>
            </div>
        ), {
            duration: 3000,
            position: 'top-right'
        });

        onClose();
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Theme Configuration"
            maxWidth="max-w-[420px]"
            footer={
                <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-2">
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleApply}
                            className="px-8 h-10 text-white text-sm font-bold rounded-lg shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                            style={{ 
                                backgroundColor: selectedColor,
                                boxShadow: `0 8px 20px -6px ${selectedColor}66`
                            }}
                        >
                            <Check size={16} strokeWidth={3} /> Apply Theme
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-8 font-['Plus_Jakarta_Sans'] select-none py-4">

                {/* 1. Working Canvas Color Wheel */}
                <div className="flex flex-col items-center">
                    <div className="relative p-2 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                        <canvas
                            ref={canvasRef}
                            width={220}
                            height={220}
                            className="rounded-full shadow-lg cursor-crosshair active:scale-[0.98] transition-transform"
                            onMouseDown={(e) => { setIsDragging(true); handleCanvasInteraction(e); }}
                            onMouseMove={(e) => { if (isDragging) handleCanvasInteraction(e); }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                        />
                        {/* Center Indicator */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-white shadow-xl pointer-events-none"
                            style={{ backgroundColor: selectedColor }}
                        />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Click or Drag to Select Color</p>
                </div>

                {/* 2. Color Controls */}
                <div className="space-y-4 px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl shadow-md border-2 border-white ring-1 ring-slate-100 transition-colors duration-500" style={{ backgroundColor: selectedColor }} />
                            <div>
                                <h4 className="text-[12px] font-black text-slate-700 uppercase tracking-tight">Active Pigment</h4>
                                <p className="text-[11px] font-mono font-bold text-slate-400">{selectedColor.toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={selectedColor.toUpperCase()}
                                    onChange={(e) => {
                                        setSelectedColor(e.target.value);
                                    }}
                                    className="w-28 h-10 border border-slate-200 px-3 text-center text-[13px] font-black text-slate-600 rounded-lg focus:border-[#0078d4] focus:ring-4 focus:ring-blue-50 outline-none transition-all tabular-nums"
                                    placeholder="#000000"
                                />
                                <div className="absolute -top-2.5 left-2 bg-white px-1.5 text-[9px] font-black text-slate-400 tracking-widest uppercase">Hex Code</div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedColor(currentTopBarColor);
                                }}
                                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center group"
                                title="Reset to Current"
                            >
                                <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>

                    {/* Simple Usage Tip */}
                    <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100/30">
                        <p className="text-[11px] font-bold text-blue-600/70 leading-relaxed uppercase tracking-tighter">
                            Select a professional tone. <span className="text-blue-400 font-medium">Applied colors will update the dashboard ribbon immediately upon clicking 'Apply Theme'.</span>
                        </p>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ChangeBackgroundBoard;
