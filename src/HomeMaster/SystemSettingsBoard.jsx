import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Settings, Lock, Unlock, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SystemSettingsBoard = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        isAddProductLocked: false,
        isAddProductLocked_PO: false
    });

    useEffect(() => {
        const lockedGRN = localStorage.getItem('isAddProductLocked') === 'true';
        const lockedPO = localStorage.getItem('isAddProductLocked_PO') === 'true';
        setSettings({ 
            isAddProductLocked: lockedGRN,
            isAddProductLocked_PO: lockedPO
        });
    }, [isOpen]);

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Plus_Jakarta_Sans']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const handleToggle = (key) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        localStorage.setItem(key, newValue);
        showSuccessToast(`Setting updated successfully.`);
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SYSTEM CONFIGURATION"
            maxWidth="max-w-[420px]"
            showHeaderClose={false}
        >
            <div className="space-y-5 font-['Plus_Jakarta_Sans']">
                <div className="flex flex-col gap-4">
                    {/* Setting Item: Add Product Lock (GRN) */}
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-4">
                            <div className={settings.isAddProductLocked ? 'text-red-500' : 'text-[#0285fd]'}>
                                {settings.isAddProductLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">GRN Product Action</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${settings.isAddProductLocked ? 'text-red-400' : 'text-blue-400'}`}>
                                    {settings.isAddProductLocked ? 'Locked' : 'Unlocked'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleToggle('isAddProductLocked')}
                            className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none ${settings.isAddProductLocked ? 'bg-red-500' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${settings.isAddProductLocked ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full" />

                    {/* Setting Item: Add Product Lock (PO) */}
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-4">
                            <div className={settings.isAddProductLocked_PO ? 'text-red-500' : 'text-[#0285fd]'}>
                                {settings.isAddProductLocked_PO ? <Lock size={18} /> : <Unlock size={18} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">PO Product Action</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${settings.isAddProductLocked_PO ? 'text-red-400' : 'text-blue-400'}`}>
                                    {settings.isAddProductLocked_PO ? 'Locked' : 'Unlocked'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleToggle('isAddProductLocked_PO')}
                            className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none ${settings.isAddProductLocked_PO ? 'bg-red-500' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${settings.isAddProductLocked_PO ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full" />
                </div>

                <div className="pt-2">
                    <button
                        onClick={onClose}
                        className="w-full h-10 bg-[#0285fd] text-white text-[12px] font-black rounded-[5px] hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                        <CheckCircle size={14} /> SAVE CHANGES
                    </button>
                </div>
            </div>
        </SimpleModal>
        </>
    );
};

export default SystemSettingsBoard;
