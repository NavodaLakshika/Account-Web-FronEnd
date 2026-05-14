import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Settings, Lock, Unlock, ShieldAlert, CheckCircle, X, Layers, ShieldCheck, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { systemLocksService } from '../services/systemLocks.service';

const SystemSettingsBoard = ({ isOpen, onClose }) => {
    // List of all keys we manage
    const masterItems = [
        { label: 'Open Company', id: 'master_company' },
        { label: 'Cost Center Master', id: 'master_costCenter' },
        { label: 'Create Department', id: 'master_department' },
        { label: 'Create Category', id: 'master_category' },
        { label: 'Supplier Master', id: 'master_supplier' },
        { label: 'Customer Master', id: 'master_customer' },
        { label: 'Card Sale Commission', id: 'master_cardSale' },
        { label: 'Chart of Accountant', id: 'master_chartOfAccount' },
        { label: 'User Profile Maint', id: 'master_userProfile' },
        { label: 'Vendor Types', id: 'master_vendorTypes' },
        { label: 'Change Password', id: 'master_changePassword' },
        { label: 'System Logoff Action', id: 'master_logoff' }
    ];

    const adminItems = [
        { label: 'Data Backup', id: 'backup' },
        { label: 'Stock Balance Update', id: 'stockUpdate' },
        { label: 'Inventory Download', id: 'inventoryDownload' },
        { label: 'Delete Account', id: 'deleteAccount' },
        { label: 'Transaction Search', id: 'search' },
        { label: 'Document Editor', id: 'journalEditor' },
        { label: 'Transaction Editor', id: 'transactionEditor' },
        { label: 'System Update', id: 'update' },
        { label: 'Clear Temp Data', id: 'clear' },
        { label: 'Period Lock Facility', id: 'lock' },
        { label: 'Admin Change Pwd', id: 'changePassword' }
    ];

    const transactionItems = [
        { label: 'Purchase Order', id: 'trans_po' },
        { label: 'GRN', id: 'trans_grn' },
        { label: 'Petty Cash', id: 'trans_pettyCash' },
        { label: 'Enter Bills', id: 'trans_enterBills' },
        { label: 'Pay Bills', id: 'trans_payBills' },
        { label: 'Estimate', id: 'trans_estimate' },
        { label: 'Sales Order', id: 'trans_salesOrder' },
        { label: 'Create Invoice', id: 'trans_invoice' },
        { label: 'Receive Payment', id: 'trans_receivePayment' },
        { label: 'Create Sales Receipt', id: 'trans_salesReceipt' },
        { label: 'Refunds and Credit', id: 'trans_refunds' },
        { label: 'Items and Services', id: 'trans_items' },
        { label: 'Journal Entry', id: 'trans_journal' },
        { label: 'Marketing Tool', id: 'trans_marketing' },
        { label: 'Collection Deposit', id: 'trans_collection' },
        { label: 'Cheque Register', id: 'trans_chequeRegister' },
        { label: 'Write Cheque', id: 'trans_writeCheque' }
    ];

    const productActions = [
        { label: 'GRN Product Action', id: 'isAddProductLocked' },
        { label: 'PO Product Action', id: 'isAddProductLocked_PO' }
    ];

    const [settings, setSettings] = useState({});

    useEffect(() => {
        if (isOpen) {
            const allItems = [...masterItems, ...adminItems, ...transactionItems, ...productActions];
            const initialState = {};
            allItems.forEach(item => {
                let key = '';
                if (item.id === 'isAddProductLocked' || item.id === 'isAddProductLocked_PO') {
                    key = item.id;
                } else {
                    key = `isLocked_${item.id}`;
                }
                initialState[item.id] = localStorage.getItem(key) === 'true';
            });
            setSettings(initialState);
        }
    }, [isOpen]);

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden font-['Tahoma']`}>
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

    const handleToggle = async (id, label) => {
        const newValue = !settings[id];
        let key = '';
        if (id === 'isAddProductLocked' || id === 'isAddProductLocked_PO') {
            key = id;
        } else {
            key = `isLocked_${id}`;
        }
        
        // Optimistic UI update
        localStorage.setItem(key, newValue);
        setSettings(prev => ({ ...prev, [id]: newValue }));
        showSuccessToast(`${label} ${newValue ? 'Locked' : 'Unlocked'} Successfully`);

        // Push to server
        try {
            await systemLocksService.updateLock(key, newValue);
        } catch (err) {
            console.error("Failed to update lock on server", err);
            // Optionally revert UI if needed
            // localStorage.setItem(key, !newValue);
            // setSettings(prev => ({ ...prev, [id]: !newValue }));
        }
    };

    const renderItem = (item) => {
        const isLocked = settings[item.id] || false;
        return (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-blue-50/30 rounded-lg transition-all border border-transparent hover:border-blue-100/50 group">
                <div className="flex items-center gap-2.5">
                    <div className={`w-[32px] h-[32px] flex items-center justify-center transition-all duration-300 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm ${isLocked ? 'bg-red-50 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.2)]' : 'bg-[#f8fafd] text-[#0285fd] hover:bg-blue-50'}`}>
                        {isLocked ? <Lock size={14} strokeWidth={2.5} /> : <Unlock size={14} strokeWidth={2.5} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide line-clamp-1">{item.label}</span>
                    </div>
                </div>

                <button
                    onClick={() => handleToggle(item.id, item.label)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-500 focus:outline-none shadow-inner border-2 shrink-0 ${isLocked ? 'bg-red-500 border-red-600' : 'bg-slate-200 border-slate-300 hover:border-blue-300'}`}
                >
                    {/* Switch Knob */}
                    <div className={`absolute top-[1px] left-[1px] bg-white w-3.5 h-3.5 rounded-full transition-all duration-500 shadow-md flex items-center justify-center ${isLocked ? 'translate-x-[18px] scale-110' : 'translate-x-0'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500' : 'bg-slate-300'}`} />
                    </div>
                </button>
            </div>
        );
    };

    const chunkArray = (arr, size) => {
        const chunked = [];
        for (let i = 0; i < arr.length; i += size) {
            chunked.push(arr.slice(i, i + size));
        }
        return chunked;
    };

    const renderSection = (title, IconComponent, items) => {
        const chunks = chunkArray(items, 8);
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80 rounded-[10px] border border-slate-100 shadow-sm sticky top-0 z-10 mx-2">
                    <h4 className="text-[12px] font-[900] text-slate-700 uppercase tracking-[0.25em]">{title}</h4>
                </div>
                <div className="flex flex-col gap-4 px-2">
                    {chunks.map((chunk, idx) => (
                        <div key={idx} className="border-2 border-slate-100 rounded-xl p-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-blue-100 hover:shadow-md transition-all duration-300">
                            <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                                {chunk.map(renderItem)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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
            maxWidth="max-w-[1250px]"
            showHeaderClose={true}
        >
            <div className="font-['mono'] flex flex-col max-h-[85vh]">
                
                <div className="overflow-y-auto no-scrollbar pr-2 flex-grow space-y-10 pb-6">
                    
                    {/* Sections */}
                    {renderSection('Master File Access Control', Layers, masterItems)}
                    {renderSection('Admin Module Access Control', ShieldCheck, adminItems)}
                    {renderSection('Transaction Module Access Control', ShoppingCart, transactionItems)}
                    {renderSection('Transaction Action Controls', Settings, productActions)}
                </div>
            </div>
        </SimpleModal>
        </>
    );
};

export default SystemSettingsBoard;
