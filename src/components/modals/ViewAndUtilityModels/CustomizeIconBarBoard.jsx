import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import {
    X, ChevronRight, ChevronLeft, Save, RotateCcw,
    LogOut, Home, UserPlus, Users, Truck, FileText,
    CreditCard, PenTool, Wallet, ArrowDownLeft, BookOpen,
    RefreshCcw, BarChart2, Search, Bot, Building2, Calculator, HelpCircle, Layers, PieChart, Bell
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
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'category', label: 'Category', icon: Layers },
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'text-yellow-400' },
];

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

    const renderIconRow = (item, selected, onSelect) => {
        const isSelected = selected?.id === item.id;
        const Icon = item.icon;
        return (
            <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-[#0285fd] text-white' : 'hover:bg-blue-50/30'
                }`}
            >
                <div
                    className={`w-9 h-9 flex items-center justify-center border rounded-[5px] shadow-sm shrink-0 ${
                        isSelected ? 'bg-white/15 border-white/25' : 'bg-gray-50 border-gray-200'
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

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                >
                    <RotateCcw size={14} /> RESET
                </button>
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[5px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                >
                    APPLY
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none"
                >
                    <Save size={14} /> OK
                </button>
            </div>
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
            <div className="space-y-4 font-['Tahoma'] select-none -mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold text-gray-700">Current User :</span>
                    <span className="text-[12.5px] font-bold text-blue-600 uppercase tracking-wide">
                        {currentUserName}
                    </span>
                </div>

                <div className="flex items-stretch gap-4">
                    {/* All Icons */}
                    <div className="flex-1 space-y-2 min-w-0">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">All Icons</span>
                        <div className="border border-gray-300 rounded-[5px] shadow-sm bg-white h-[400px] overflow-y-auto no-scrollbar">
                            {availableIcons.length === 0 ? (
                                <p className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No icons available</p>
                            ) : (
                                availableIcons.map(item => renderIconRow(item, selectedAvailable, setSelectedAvailable))
                            )}
                        </div>
                    </div>

                    {/* Transfer controls */}
                    <div className="flex flex-col justify-center gap-3 pt-8">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!selectedAvailable}
                            className={`w-10 h-8 flex items-center justify-center rounded-[5px] transition-all shadow-md active:scale-95 ${
                                selectedAvailable
                                    ? 'bg-[#0285fd] text-white hover:bg-[#0073ff] border-none'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
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
                                    ? 'bg-[#0285fd] text-white hover:bg-[#0073ff] border-none'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Current icons */}
                    <div className="flex-1 space-y-2 min-w-0">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Icon</span>
                        <div className="border border-gray-300 rounded-[5px] shadow-sm bg-white h-[400px] overflow-y-auto no-scrollbar">
                            {currentIcons.length === 0 ? (
                                <p className="text-center py-10 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No icons selected</p>
                            ) : (
                                currentIcons.map(item => renderIconRow(item, selectedCurrent, setSelectedCurrent))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-center opacity-25 grayscale pointer-events-none">
                    <span className="text-xl font-black text-slate-300 tracking-tighter font-['Tahoma']">
                        onimta <span className="text-[#0285fd]">IT</span>
                    </span>
                </div>
            </div>
        </SimpleModal>
    );
};

export default CustomizeIconBarBoard;
