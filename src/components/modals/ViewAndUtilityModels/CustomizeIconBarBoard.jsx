import React, { useState, useEffect } from 'react';
import {
    X, ChevronRight, ChevronLeft, Save, RotateCcw,
    LogOut, Home, UserPlus, Users, Truck, FileText,
    CreditCard, PenTool, Wallet, ArrowDownLeft, BookOpen,
    RefreshCcw, BarChart2, Search, Bot, Building2, Calculator, HelpCircle, Layers, PieChart, Bell
} from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0388cc';

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
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'category', label: 'Category', icon: Layers },
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'text-yellow-400' },
];

const IconRow = ({ item, selected, onSelect }) => {
    const isSelected = selected?.id === item.id;
    const Icon = item.icon;
    return (
        <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-b border-slate-100 last:border-b-0 ${
                isSelected ? 'bg-[#4f83ff] text-white' : 'hover:bg-blue-50/30'
            }`}
        >
            <div
                className={`w-9 h-9 flex items-center justify-center border rounded-[5px] shadow-sm shrink-0 ${
                    isSelected ? 'bg-white/15 border-white/25' : 'bg-slate-50 border-slate-200'
                }`}
            >
                <Icon
                    size={18}
                    className={item.color || (isSelected ? 'text-white' : 'text-slate-600')}
                />
            </div>
            <span className={`text-[12px] font-bold uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {item.label}
            </span>
        </button>
    );
};

const CustomizeIconBarBoard = ({ isOpen, onClose, onSave }) => {
    const [availableIcons, setAvailableIcons] = useState(ALL_POSSIBLE_ICONS);
    const [currentIcons, setCurrentIcons] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState(null);
    const [selectedCurrent, setSelectedCurrent] = useState(null);

    const defaultIds = ['home', 'new_account', 'customer', 'vendor', 'enter_bill', 'pay_bill', 'write_chq', 'petty_cash', 'make_deposit', 'journal_entry', 'bank_rec', 'trial_balance', 'search', 'ai_chat', 'dashboard', 'logout'];

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
                const current = ALL_POSSIBLE_ICONS.filter(icon => defaultIds.includes(icon.id));
                const available = ALL_POSSIBLE_ICONS.filter(icon => !defaultIds.includes(icon.id));
                setCurrentIcons(current);
                setAvailableIcons(available);
            }
            setSelectedAvailable(null);
            setSelectedCurrent(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

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

    const persistIcons = () => {
        const ids = currentIcons.map(i => i.id);
        localStorage.setItem('ribbon_icons', JSON.stringify(ids));
        if (onSave) onSave(ids);
        return ids;
    };

    const handleSave = () => {
        persistIcons();
        onClose();
    };

    const handleApply = () => {
        persistIcons();
    };

    const handleReset = () => {
        const current = ALL_POSSIBLE_ICONS.filter(icon => defaultIds.includes(icon.id));
        const available = ALL_POSSIBLE_ICONS.filter(icon => !defaultIds.includes(icon.id));
        setCurrentIcons(current);
        setAvailableIcons(available);
        setSelectedAvailable(null);
        setSelectedCurrent(null);
    };

    const currentUserName = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.empName || user.EmpName || 'ADMIN';
        } catch {
            return 'ADMIN';
        }
    })();

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-3xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: accent }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4f83ff]/10 flex items-center justify-center">
                            <Layers size={16} className="text-[#4f83ff]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.25em] text-slate-900 leading-tight">Customize Icon Bar</h2>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider">Ribbon Icon Configuration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90">
                        <X size={28} strokeWidth={1.5} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-4 select-none">
                        <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-slate-700">Current User :</span>
                            <span className="text-[12.5px] font-bold text-[#4f83ff] uppercase tracking-wide">
                                {currentUserName}
                            </span>
                        </div>

                        <div className="flex items-stretch gap-4">
                            <div className="flex-1 space-y-2 min-w-0">
                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">All Icons</span>
 <div className=" rounded-[5px] shadow-sm bg-white h-[400px] overflow-y-auto no-scrollbar">
                                    {availableIcons.length === 0 ? (
                                        <p className="text-center py-10 text-slate-300 text-[12px] font-bold uppercase tracking-widest">No icons available</p>
                                    ) : (
                                        availableIcons.map(item => <IconRow key={item.id} item={item} selected={selectedAvailable} onSelect={setSelectedAvailable} />)
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-3 pt-8">
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!selectedAvailable}
                                    className={`w-10 h-8 flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 ${
                                        selectedAvailable
                                            ? 'bg-[#4f83ff] text-white hover:bg-[#3a6fdf] border-none'
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <ChevronRight size={20} strokeWidth={3} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={!selectedCurrent}
                                    className={`w-10 h-8 flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 ${
                                        selectedCurrent
                                            ? 'bg-[#4f83ff] text-white hover:bg-[#3a6fdf] border-none'
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2 min-w-0">
                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Icon</span>
 <div className=" rounded-[5px] shadow-sm bg-white h-[400px] overflow-y-auto no-scrollbar">
                                    {currentIcons.length === 0 ? (
                                        <p className="text-center py-10 text-slate-300 text-[12px] font-bold uppercase tracking-widest">No icons selected</p>
                                    ) : (
                                        currentIcons.map(item => <IconRow key={item.id} item={item} selected={selectedCurrent} onSelect={setSelectedCurrent} />)
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center opacity-25 grayscale pointer-events-none">
                            <span className="text-xl font-black text-slate-300 tracking-tighter">
                                onimta <span className="text-[#4f83ff]">IT</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6 py-4 rounded-b-[5px]">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                    >
                        <RotateCcw size={14} /> RESET
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-8 h-10 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            APPLY
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-8 h-10 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            <Save size={14} /> OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeIconBarBoard;
