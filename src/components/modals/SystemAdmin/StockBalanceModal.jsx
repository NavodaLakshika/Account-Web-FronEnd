import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RotateCcw, 
    X, 
    Save, 
    Search, 
    Calendar,
    Activity,
    Database,
    RefreshCw
} from 'lucide-react';
import { stockBalanceService } from '../../../services/stockBalance.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { getSessionData } from '../../../utils/session';

const StockBalanceModal = ({ isOpen, onClose }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('SYSTEM READY');
    const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
    
    useEffect(() => {
        if (isOpen) {
            handleLoad();
        }
    }, [isOpen]);

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[400px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
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

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[400px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const handleLoad = async () => {
        if (!stockDate) return showErrorToast('Please select a date.');
        setLoading(true);
        setStatusMessage('LOADING DATA...');
        try {
            const session = getSessionData();
            const data = await stockBalanceService.loadStock(session.userName, stockDate, session.compCode);
            setItems(data);
            setStatusMessage('READY');
        } catch (error) {
            showErrorToast('Failed to load stock data.');
            setStatusMessage('ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!stockDate) return showErrorToast('Stock date is required.');
        if (items.length === 0) return showErrorToast('No data to save.');

        // Check for zero stocks
        const hasZeroStock = items.some(item => parseFloat(item.stock) === 0);
        if (hasZeroStock) {
            if (!window.confirm('Some Cost Centers have zero stock. Are you sure you want to update?')) {
                return;
            }
        }

        setLoading(true);
        setStatusMessage('SAVING...');
        try {
            const session = getSessionData();
            const resp = await stockBalanceService.saveStock({
                stockDate,
                userName: session.userName,
                compCode: session.compCode,
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
                    .dashed-box {
                        background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23d1d5db' stroke-width='1.5' stroke-dasharray='4%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
                    }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={() => !loading && onClose()}
                title="Stock Balance Update"
                maxWidth="max-w-[650px]"
                showHeaderClose={!loading}
                footer={
                    <div className="bg-slate-50 px-5 py-3 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl font-['Tahoma']">
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="px-4 h-8 bg-[#00adff] text-white text-[12px] font-black rounded-[4px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm disabled:opacity-50"
                        >
                            <RotateCcw size={12} /> CLEAR
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 h-8 bg-white border-2 border-gray-200 text-gray-500 text-[12px] font-black rounded-[4px] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                            >
                                CLOSE
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 h-8 bg-[#0285fd] text-white text-[12px] font-black rounded-[4px] hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                <Save size={14} /> SAVE UPDATE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="relative space-y-4 font-['Tahoma'] select-none">
                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 -m-1 bg-white/80 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                            <div className="w-28 h-28">
                                <DotLottiePlayer 
                                    src="/lottiefile/Loading animation blue.lottie" 
                                    autoplay 
                                    loop 
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1 -mt-4">
                                <span className="text-[12px] font-black text-[#00adff] uppercase tracking-[0.2em] animate-pulse">
                                    {statusMessage}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Header Controls */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Stock Date:</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={stockDate}
                                    onChange={(e) => setStockDate(e.target.value)}
                                    className="h-9 border border-gray-300 px-3 text-[12px] font-bold text-blue-600 bg-white rounded-[4px] outline-none shadow-sm focus:border-blue-500 w-40" 
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleLoad}
                            disabled={loading}
                            className="h-9 px-4 bg-white border border-gray-300 text-gray-700 text-[11px] font-black rounded-[4px] hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm uppercase tracking-widest"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Load Cost Centers
                        </button>
                        <div className="ml-auto flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">System Status</span>
                            <span className={`text-[14px] font-black tracking-tight ${loading ? 'text-blue-600 animate-pulse' : 'text-slate-700'}`}>
                                {statusMessage}
                            </span>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 w-32 text-center">CC Code</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800">Cost Center Name</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest w-32 text-center">Stock Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.length > 0 ? (
                                        items.map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-4 py-2.5 text-[11px] font-bold text-gray-500 text-center bg-gray-50 group-hover:bg-blue-50/50">
                                                    {item.costCenterCode}
                                                </td>
                                                <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700">
                                                    {item.costCenterName}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <input 
                                                        type="number"
                                                        value={item.stock}
                                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                                        className="w-full h-8 border border-gray-200 px-3 text-[13px] font-black text-right text-blue-600 bg-white rounded-[4px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <Database size={40} />
                                                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">No Data Loaded</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Total Cost Centers: {items.length}
                        </div>
                        <div>Authorized Session: {getSessionData().userName}</div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default StockBalanceModal;
