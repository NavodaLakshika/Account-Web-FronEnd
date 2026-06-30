import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RotateCcw, 
    Save, 
    Search, 
    Calendar as CalendarIcon,
    RefreshCw,
    Table,
    Database,
    ShieldCheck,
    CheckCircle,
    X
} from 'lucide-react';
import { stockBalanceService } from '../../../services/stockBalance.service';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';
import CalendarModal from '../../CalendarModal';
import ConfirmModal from '../ConfirmModal';

import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


const StockBalanceUpdateModal = ({ isOpen, onClose }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('SYSTEM READY');
    const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            handleLoad();
        }
    }, [isOpen]);

    const handleLoad = async () => {
        if (!stockDate) return showErrorToast('Please select a date.');
        setLoading(true);
        setStatusMessage('LOADING DATA...');
        try {
            const session = getSessionData();
            const data = await stockBalanceService.loadStock(session.userName, stockDate, session.companyCode);
            setItems(data);
            setStatusMessage(data.length > 0 ? 'READY' : 'NO DATA');
            if (data.length === 0) showErrorToast('No cost centers found for this user/date.');
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || error.message || 'Failed to load stock data.';
            showErrorToast(msg);
            setStatusMessage('OFFLINE');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClick = () => {
        if (!stockDate) return showErrorToast('Stock date is required.');
        if (items.length === 0) return showErrorToast('No data to save.');

        const hasZeroStock = items.some(item => parseFloat(item.stock) === 0);
        if (hasZeroStock) {
            setShowConfirmModal(true);
        } else {
            handleSave();
        }
    };

    const handleSave = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        setStatusMessage('SAVING...');
        try {
            const session = getSessionData();
            const resp = await stockBalanceService.saveStock({
                stockDate,
                userName: session.userName,
                compCode: session.companyCode,
                items
            });
            showSuccessToast(resp.message);
            setStatusMessage('SUCCESSFUL');
            setTimeout(() => setStatusMessage('READY'), 3000);
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Update failed.');
            setStatusMessage('ERROR');
            setTimeout(() => setStatusMessage('READY'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index, value) => {
        const newItems = [...items];
        newItems[index].stock = value;
        setItems(newItems);
    };

    const handleClear = () => {
        setItems(items.map(item => ({ ...item, stock: 0 })));
        setStatusMessage('READY');
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Stock Balance Update"
                maxWidth="max-w-[700px]"
                showHeaderClose={true}
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSaveClick} disabled={loading} className={`px-6 py-3 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 font-mono font-bold text-sm uppercase tracking-widest rounded-[3px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                <CheckCircle size={14} /> SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Header Controls */}
                    <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-[3px] relative overflow-hidden">
                        {/* {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-[3px] animate-in fade-in duration-300">
                                <div className="w-24 h-24">
                                    <DotLottiePlayer src="/lottiefile/Loading animation blue.lottie" autoplay loop />
                                </div>
                                <span className="text-[11px] font-black text-[#00adff] uppercase tracking-[0.2em] animate-pulse -mt-2">{statusMessage}</span>
                            </div>
                        )} */}
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            <div className="col-span-8 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Stock Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={stockDate}
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowCalendar(true)}
                                    />
                                    <button
                                        onClick={() => setShowCalendar(true)}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <CalendarIcon size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4 flex justify-end">
                                <button 
                                    onClick={handleLoad}
                                    disabled={loading}
                                    className="h-8 px-6 bg-[#0285fd] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-[3px] hover:bg-[#0073ff] transition-all shadow-md active:scale-95 flex items-center gap-2"
                                >
                                    <Search size={14} /> Load
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="border border-gray-300 rounded-[3px] overflow-hidden flex flex-col min-h-[350px] bg-white shadow-inner">
                        {/* Table header */}
                        <div className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                            <div className="w-32 py-2.5 px-4 border-r border-gray-200 text-center uppercase tracking-wider text-[11px]">CC Code</div>
                            <div className="flex-1 py-2.5 px-4 border-r border-gray-200 uppercase tracking-wider text-[11px]">Cost Center Description</div>
                            <div className="w-40 py-2.5 px-4 text-right uppercase tracking-wider text-[11px]">Stock Value</div>
                        </div>

                        <div className="flex-1 bg-slate-50/30 relative overflow-y-auto max-h-[380px] no-scrollbar custom-scrollbar divide-y divide-gray-100">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <div key={index} className="flex border-b border-gray-200 text-[11px] font-bold text-slate-700 hover:bg-blue-50/50/30 items-center transition-all group bg-white cursor-pointer group border-b border-gray-50">
                                        <div className="w-32 py-2.5 px-4 border-r border-gray-200 text-center text-blue-600 font-mono">
                                            {item.costCenterCode}
                                        </div>
                                        <div className="flex-1 py-2.5 px-4 border-r border-gray-200 uppercase truncate">
                                            {item.costCenterName}
                                        </div>
                                        <div className="w-40 border-r border-gray-200 px-1 py-1 bg-white group-hover:bg-transparent">
                                            <input 
                                                type="number"
                                                value={item.stock}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                className="w-full h-7 bg-transparent text-right text-[12px] font-mono font-black text-slate-900 outline-none focus:bg-white border-none px-2"
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20 py-20">
                                    <Table size={48} className="text-slate-400" />
                                    <span className="font-bold uppercase tracking-[0.3em] text-slate-500">No Data Loaded</span>
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                                         style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Info Bar */}
                    <div className="flex items-center justify-between px-2 pt-1 pb-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <RotateCcw size={12} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inventory Feed Active</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 opacity-50 uppercase tracking-tighter italic">Authorized for {getSessionData().userName}</span>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={(date) => { setStockDate(date); setShowCalendar(false); }}
                initialDate={stockDate}
            />

            <ConfirmModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleSave}
                title="Zero Stock Alert"
                message="Some Cost Centers currently have a zero stock balance. Are you sure you want to proceed with this update?"
                confirmText="Yes, Proceed"
                cancelText="Review Again"
                variant="primary"
            />
        </>
    );
};

export default StockBalanceUpdateModal;
