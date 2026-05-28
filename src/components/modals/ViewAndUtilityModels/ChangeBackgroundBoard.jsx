import React, { useState, useRef, useEffect } from 'react';
import { Pipette, Check, Sparkles, Zap, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

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

    useEffect(() => {
        if (isOpen) {
            drawColorWheel();
        }
    }, [isOpen]);

    if (!isOpen) return null;

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
            if (pixel[3] > 0) {
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Sparkles size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Theme Configuration</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Color Customization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={18} strokeWidth={3} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-8 select-none py-4">
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
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-white shadow-xl pointer-events-none"
                                    style={{ backgroundColor: selectedColor }}
                                />
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Click or Drag to Select Color</p>
                        </div>

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
                                            className="w-28 h-8 px-3 border border-slate-200 rounded text-[12px] font-bold text-slate-700 bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all shadow-sm placeholder:text-slate-300 tabular-nums"
                                            placeholder="#000000"
                                        />
                                        <div className="absolute -top-2.5 left-2 bg-white px-1.5 text-[9px] font-black text-slate-400 tracking-widest uppercase">Hex Code</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedColor(currentTopBarColor);
                                        }}
                                        className="w-9 h-9 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center group"
                                        title="Reset to Current"
                                    >
                                        <RefreshCw size={16} className="group-active:rotate-180 transition-transform duration-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 border border-blue-100/30">
                                <p className="text-[11px] font-bold text-blue-600/70 leading-relaxed uppercase tracking-tighter">
                                    Select a professional tone. <span className="text-blue-400 font-medium">Applied colors will update the dashboard ribbon immediately upon clicking 'Apply Theme'.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6 py-4 rounded-b-[5px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Theme Settings</span>
                    <button
                        onClick={handleApply}
                        className="px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md transition-all active:scale-95 flex items-center gap-2 border-none"
                        style={{
                            backgroundColor: selectedColor,
                            boxShadow: `0 8px 20px -6px ${selectedColor}66`
                        }}
                    >
                        <Check size={14} strokeWidth={3} /> APPLY THEME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeBackgroundBoard;
