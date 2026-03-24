import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    X, ChevronRight, ChevronLeft, Save, RotateCcw, 
    LogOut, Home, UserPlus, Users, Truck, FileText, 
    CreditCard, PenTool, Wallet, ArrowDownLeft, BookOpen, 
    RefreshCcw, BarChart2, Search, Bot, Building2, Calculator, HelpCircle, Layers
} from 'lucide-react';

const ALL_POSSIBLE_ICONS = [
    { id: 'logout', label: 'LogOut', icon: LogOut, color: 'text-red-500' },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'new_account', label: 'New Account', icon: UserPlus },
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'vendor', label: 'Vendor', icon: Truck },
    { id: 'enter_bill', label: 'Enter Bill', icon: FileText },
    { id: 'pay_bill', label: 'Pay Bill', icon: CreditCard },
    { id: 'write_chq', label: 'Write Chq', icon: PenTool },
    { id: 'petty_cash', label: 'Petty Cash', icon: Wallet },
    { id: 'make_deposit', label: 'Make Deposit', icon: ArrowDownLeft },
    { id: 'journal_entry', label: 'Journal Entry', icon: BookOpen },
    { id: 'bank_rec', label: 'Bank Rec', icon: RefreshCcw },
    { id: 'trial_balance', label: 'Trial Balance', icon: BarChart2 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'ai_chat', label: 'AI Chat', icon: Bot, color: 'text-blue-500' },
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'category', label: 'Category', icon: Layers },
];

const CustomizeIconBarBoard = ({ isOpen, onClose, onSave }) => {
    const [availableIcons, setAvailableIcons] = useState(ALL_POSSIBLE_ICONS);
    const [currentIcons, setCurrentIcons] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState(null);
    const [selectedCurrent, setSelectedCurrent] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('ribbon_icons');
            if (saved) {
                const savedIds = JSON.parse(saved);
                const current = ALL_POSSIBLE_ICONS.filter(icon => savedIds.includes(icon.id));
                const available = ALL_POSSIBLE_ICONS.filter(icon => !savedIds.includes(icon.id));
                setCurrentIcons(current);
                setAvailableIcons(available);
            } else {
                // Default icons
                const defaultIds = ['logout', 'home', 'new_account', 'customer', 'vendor', 'enter_bill', 'pay_bill', 'write_chq', 'petty_cash', 'make_deposit', 'journal_entry', 'bank_rec', 'trial_balance', 'search', 'ai_chat'];
                const current = ALL_POSSIBLE_ICONS.filter(icon => defaultIds.includes(icon.id));
                const available = ALL_POSSIBLE_ICONS.filter(icon => !defaultIds.includes(icon.id));
                setCurrentIcons(current);
                setAvailableIcons(available);
            }
        }
    }, [isOpen]);

    const handleAdd = () => {
        if (selectedAvailable) {
            setCurrentIcons([...currentIcons, selectedAvailable]);
            setAvailableIcons(availableIcons.filter(i => i.id !== selectedAvailable.id));
            setSelectedAvailable(null);
        }
    };

    const handleRemove = () => {
        if (selectedCurrent) {
            setAvailableIcons([...availableIcons, selectedCurrent]);
            setCurrentIcons(currentIcons.filter(i => i.id !== selectedCurrent.id));
            setSelectedCurrent(null);
        }
    };

    const handleSave = () => {
        const ids = currentIcons.map(i => i.id);
        localStorage.setItem('ribbon_icons', JSON.stringify(ids));
        if (onSave) onSave(ids);
        onClose();
    };

    const handleReset = () => {
        const defaultIds = ['logout', 'home', 'new_account', 'customer', 'vendor', 'enter_bill', 'pay_bill', 'write_chq', 'petty_cash', 'make_deposit', 'journal_entry', 'bank_rec', 'trial_balance', 'search', 'ai_chat'];
        const current = ALL_POSSIBLE_ICONS.filter(icon => defaultIds.includes(icon.id));
        const available = ALL_POSSIBLE_ICONS.filter(icon => !defaultIds.includes(icon.id));
        setCurrentIcons(current);
        setAvailableIcons(available);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
             <button onClick={handleReset} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSave} className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2">
                <Save size={14} /> OK
            </button>
            <button onClick={handleSave} className="px-6 h-10 bg-white text-slate-600 text-sm font-bold rounded-md border border-gray-200 hover:bg-slate-50 transition-all active:scale-95">
                Apply
            </button>
            <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border-none">
                <X size={14} /> Exit
            </button>
        </div>
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Customize Icon Bar"
            maxWidth="max-w-3xl"
            footer={footer}
        >
            <div className="p-4 font-['Plus_Jakarta_Sans'] select-none">
                <div className="mb-6">
                    <span className="text-sm font-bold text-[#0078d4]">Current User : </span>
                    <span className="text-sm font-bold text-[#0078d4] uppercase">
                        {JSON.parse(localStorage.getItem('user'))?.empName || 'ADMIN'}
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    {/* All Icons List */}
                    <div className="flex-1 space-y-2">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider ml-1">All Icons</label>
                        <div className="border border-gray-300 rounded shadow-inner bg-white h-[400px] overflow-y-auto no-scrollbar">
                            {availableIcons.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedAvailable(item)}
                                    className={`flex items-center gap-4 px-3 py-2 cursor-pointer transition-colors ${selectedAvailable?.id === item.id ? 'bg-[#0078d4] text-white' : 'hover:bg-blue-50'}`}
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center bg-slate-50 border border-gray-200 rounded-sm shadow-sm ${selectedAvailable?.id === item.id ? 'bg-white/10 border-white/20' : ''}`}>
                                        <item.icon size={20} className={item.color || (selectedAvailable?.id === item.id ? 'text-white' : 'text-slate-600')} />
                                    </div>
                                    <span className={`text-sm font-bold ${selectedAvailable?.id === item.id ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 pt-6">
                        <button
                            onClick={handleAdd}
                            disabled={!selectedAvailable}
                            className={`w-12 h-10 flex items-center justify-center border border-gray-300 rounded shadow-sm transition-all ${selectedAvailable ? 'bg-white hover:bg-blue-50 active:scale-90 text-[#0078d4]' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                            <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={!selectedCurrent}
                            className={`w-12 h-10 flex items-center justify-center border border-gray-300 rounded shadow-sm transition-all ${selectedCurrent ? 'bg-white hover:bg-red-50 active:scale-90 text-red-500' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    {/* Current Icons List */}
                    <div className="flex-1 space-y-2">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider ml-1">Current Icon</label>
                        <div className="border border-gray-300 rounded shadow-inner bg-white h-[400px] overflow-y-auto no-scrollbar">
                            {currentIcons.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedCurrent(item)}
                                    className={`flex items-center gap-4 px-3 py-2 cursor-pointer transition-colors ${selectedCurrent?.id === item.id ? 'bg-[#0078d4] text-white' : 'hover:bg-blue-50'}`}
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center bg-slate-50 border border-gray-200 rounded-sm shadow-sm ${selectedCurrent?.id === item.id ? 'bg-white/10 border-white/20' : ''}`}>
                                        <item.icon size={20} className={item.color || (selectedCurrent?.id === item.id ? 'text-white' : 'text-slate-600')} />
                                    </div>
                                    <span className={`text-sm font-bold ${selectedCurrent?.id === item.id ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center opacity-30 grayscale hover:grayscale-0 transition-all cursor-default scale-110">
                    {/* Placeholder for the logo from the image */}
                    <span className="text-2xl font-black text-slate-300 tracking-tighter">onimta <span className="text-[#0078d4]">IT</span></span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CustomizeIconBarBoard;
