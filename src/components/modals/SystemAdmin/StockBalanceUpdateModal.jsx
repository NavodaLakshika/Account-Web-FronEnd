import React, { useState, useEffect } from 'react';
import TransactionFormWrapper from '../../TransactionFormWrapper';
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
    X,
    Loader2
} from 'lucide-react';
import { stockBalanceService } from '../../../services/stockBalance.service';
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

    if (!isOpen) return null;

    return (
        <>
            <TransactionFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Stock Balance Update"
                subtitle="Inventory Management"
                icon={Database}
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSaveClick} disabled={loading} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE & APPLY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 select-none font-['Tahoma']">
                    
                    {/* Header Controls */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12 lg:col-span-8 flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Stock Date</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={stockDate}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer"
                                            onClick={() => setShowCalendar(true)}
                                        />
                                        <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                            <CalendarIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-4 flex items-end justify-end">
                                <button 
                                    onClick={handleLoad}
                                    disabled={loading}
                                    className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"
                                >
                                    <Search size={14} /> LOAD DATA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="border border-gray-200 rounded-[3px] bg-white shadow-xl overflow-hidden flex flex-col min-h-[350px]">
                        {/* Table header */}
                        <div className="bg-slate-50 flex sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10 shadow-sm z-10">
                            <div className="w-32 px-4 border-r border-gray-200 text-center">CC Code</div>
                            <div className="flex-1 px-4 border-r border-gray-200">Cost Center Description</div>
                            <div className="w-40 px-4 text-right">Stock Value</div>
                        </div>

                        <div className="flex-1 bg-white relative overflow-y-auto max-h-[380px] no-scrollbar">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <div key={index} className="flex border-b border-gray-50 text-[12px] text-gray-700 hover:bg-blue-50/30 items-center transition-all group bg-white cursor-pointer">
                                        <div className="w-32 py-2 px-4 border-r border-gray-100 text-center text-blue-700 font-mono font-bold uppercase">
                                            {item.costCenterCode}
                                        </div>
                                        <div className="flex-1 py-2 px-4 border-r border-gray-100 uppercase truncate font-bold text-slate-700">
                                            {item.costCenterName}
                                        </div>
                                        <div className="w-40 px-2 py-1 bg-white group-hover:bg-transparent">
                                            <input 
                                                type="number"
                                                value={item.stock}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                className="w-full h-8 bg-transparent text-right text-[12px] font-mono font-bold text-blue-700 outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] border border-transparent rounded-[3px] px-2 transition-all hover:border-gray-200"
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                                    {loading ? (
                                        <Loader2 size={32} className="animate-spin text-blue-500" />
                                    ) : (
                                        <>
                                            <Table size={48} className="opacity-20" />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">No Data Loaded</span>
                                        </>
                                    )}
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
            </TransactionFormWrapper>

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
