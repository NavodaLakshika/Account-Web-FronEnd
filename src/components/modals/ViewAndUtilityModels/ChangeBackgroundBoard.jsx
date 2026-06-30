import React, { useState, useRef, useEffect } from 'react';
import { Pipette, Check, Sparkles, Zap, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const accent = localStorage.getItem('topBarColor') || '#0ea5e9';

const ChangeBackgroundBoard = ({ isOpen, onClose, currentTopBarColor, onColorSelect }) => {
    const defaultColor = '#0ea5e9';
    const [selectedColor, setSelectedColor] = useState(currentTopBarColor || defaultColor);
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedColor(currentTopBarColor || defaultColor);
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

        ctx.clearRect(0, 0, width, height);

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
        const colorToApply = selectedColor || defaultColor;
        onColorSelect(colorToApply);

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'}
                max-w-[320px] w-full bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-sm flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer
                            src="/lottiefile/Successffull.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                    <div className="flex-grow text-left">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-mono truncate">Theme Updated</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[10px] font-medium">Applied Successfully</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
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

    const safeSelectedColor = selectedColor || defaultColor;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[420px] bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">


                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
                    <div className="space-y-6 select-none">
                        
                        {/* Color Picker Canvas */}
                        <div className="flex flex-col items-center">
                            <div className="relative p-2 bg-white rounded-full border border-slate-200 shadow-sm">
                                <canvas
                                    ref={canvasRef}
                                    width={220}
                                    height={220}
                                    className="rounded-full shadow-inner cursor-crosshair active:scale-[0.98] transition-transform"
                                    onMouseDown={(e) => { setIsDragging(true); handleCanvasInteraction(e); }}
                                    onMouseMove={(e) => { if (isDragging) handleCanvasInteraction(e); }}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseLeave={() => setIsDragging(false)}
                                />
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[3px] border-white shadow-md pointer-events-none transition-colors duration-200"
                                    style={{ backgroundColor: safeSelectedColor }}
                                />
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Click or Drag to select a color</p>
                        </div>

                        {/* Selected Color Info */}
                        <div className="bg-white p-4 rounded-[3px] border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-[3px] shadow-inner border border-slate-200 transition-colors duration-200" style={{ backgroundColor: safeSelectedColor }} />
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800">Active Color</h4>
                                        <p className="text-xs font-mono text-slate-500 mt-0.5">{safeSelectedColor.toUpperCase()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedColor(currentTopBarColor || defaultColor)}
                                    className="w-9 h-9 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-[3px] transition-all flex items-center justify-center border border-slate-200 shadow-sm"
                                    title="Reset to Current"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="text-xs font-medium text-slate-600 block mb-1.5">Hex Code</label>
                                <input
                                    type="text"
                                    value={safeSelectedColor.toUpperCase()}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                                    placeholder="#0EA5E9"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3.5 rounded-[3px] border border-blue-100 flex items-start gap-2.5">
                            <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                The top ribbon color of the dashboard will instantly update to your selection.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer matching standard web style */}
                <div className="bg-white border-t border-slate-200 flex items-center justify-end gap-3 px-6 py-4 rounded-b-sm">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 text-sm font-medium text-white rounded-sm shadow-sm transition-all flex items-center gap-2 border-none hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: safeSelectedColor }}
                    >
                        <Check size={16} strokeWidth={2.5} />
                        Apply Theme
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeBackgroundBoard;
