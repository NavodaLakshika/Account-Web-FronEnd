import React, { useState, useEffect } from 'react';
import {
    X, ChevronRight, ChevronLeft, Save, RotateCcw,
    LogOut, Home, UserPlus, Users, Truck, FileText,
    CreditCard, PenTool, Wallet, ArrowDownLeft, BookOpen,
    RefreshCcw, BarChart2, Search, Bot, Building2, Calculator, HelpCircle, Layers, PieChart, Bell,
    ChevronsRight, ChevronsLeft, GripVertical
} from 'lucide-react';

const accent = localStorage.getItem('topBarColor') || '#0ea5e9';

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
    { id: 'reminder', label: 'Reminder', icon: Bell, color: 'text-yellow-500' },
];

const IconRow = ({ item, selected, onSelect, onDoubleClick }) => {
    const isSelected = selected?.id === item.id;
    const Icon = item.icon;
    return (
        <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            onDoubleClick={() => onDoubleClick(item)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-b border-slate-100 last:border-b-0 select-none group ${
                isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50 bg-white'
            }`}
        >
            <div
                className={`w-8 h-8 flex items-center justify-center rounded-sm shadow-sm shrink-0 transition-colors ${
                    isSelected ? 'bg-blue-500 border-transparent text-white' : 'bg-white border border-slate-200 text-slate-600 group-hover:border-slate-300'
                }`}
            >
                <Icon
                    size={16}
                    className={isSelected ? 'text-white' : item.color || 'text-slate-600'}
                />
            </div>
            <span className={`text-[13px] font-medium transition-colors ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-700 group-hover:text-slate-900'}`}>
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
    const [searchAvailable, setSearchAvailable] = useState('');
    const [searchCurrent, setSearchCurrent] = useState('');

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
            setSearchAvailable('');
            setSearchCurrent('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = (itemToMove = selectedAvailable) => {
        if (itemToMove) {
            setCurrentIcons([...currentIcons, itemToMove]);
            setAvailableIcons(availableIcons.filter(i => i.id !== itemToMove.id));
            if (selectedAvailable?.id === itemToMove.id) setSelectedAvailable(null);
        }
    };

    const handleRemove = (itemToMove = selectedCurrent) => {
        if (itemToMove) {
            setAvailableIcons([...availableIcons, itemToMove]);
            setCurrentIcons(currentIcons.filter(i => i.id !== itemToMove.id));
            if (selectedCurrent?.id === itemToMove.id) setSelectedCurrent(null);
        }
    };

    const handleAddAll = () => {
        if (filteredAvailable.length > 0) {
            setCurrentIcons([...currentIcons, ...filteredAvailable]);
            setAvailableIcons(availableIcons.filter(i => !filteredAvailable.find(f => f.id === i.id)));
            setSelectedAvailable(null);
        }
    };

    const handleRemoveAll = () => {
        if (filteredCurrent.length > 0) {
            setAvailableIcons([...availableIcons, ...filteredCurrent]);
            setCurrentIcons(currentIcons.filter(i => !filteredCurrent.find(f => f.id === i.id)));
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
        setSearchAvailable('');
        setSearchCurrent('');
    };

    const currentUserName = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.empName || user.EmpName || 'ADMIN';
        } catch {
            return 'ADMIN';
        }
    })();

    const filteredAvailable = availableIcons.filter(icon => icon.label.toLowerCase().includes(searchAvailable.toLowerCase()));
    const filteredCurrent = currentIcons.filter(icon => icon.label.toLowerCase().includes(searchCurrent.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="flex items-stretch gap-6 h-[460px]">
                        
                        {/* Available Icons */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Available Icons</span>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-[3px]">{filteredAvailable.length}</span>
                                </div>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search available..." 
                                        value={searchAvailable}
                                        onChange={(e) => setSearchAvailable(e.target.value)}
                                        className="w-full pl-9 pr-8 py-1.5 text-sm bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                    />
                                    {searchAvailable && (
                                        <button onClick={() => setSearchAvailable('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                {filteredAvailable.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <Search size={32} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No icons found</p>
                                        <p className="text-xs mt-1 text-slate-400">Try adjusting your search</p>
                                    </div>
                                ) : (
                                    <div className="p-1">
                                        {filteredAvailable.map(item => (
                                            <IconRow 
                                                key={item.id} 
                                                item={item} 
                                                selected={selectedAvailable} 
                                                onSelect={setSelectedAvailable} 
                                                onDoubleClick={() => handleAdd(item)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle Controls */}
                        <div className="flex flex-col justify-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleAdd()}
                                disabled={!selectedAvailable}
                                title="Move Selected Right"
                                className="w-10 h-10 flex items-center justify-center rounded-sm bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>
                            <button
                                type="button"
                                onClick={handleAddAll}
                                disabled={filteredAvailable.length === 0}
                                title="Move All Right"
                                className="w-10 h-10 flex items-center justify-center rounded-sm bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronsRight size={20} strokeWidth={2.5} />
                            </button>
                            
                            <div className="h-px w-full bg-slate-200 my-2"></div>
                            
                            <button
                                type="button"
                                onClick={() => handleRemove()}
                                disabled={!selectedCurrent}
                                title="Move Selected Left"
                                className="w-10 h-10 flex items-center justify-center rounded-sm bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronLeft size={20} strokeWidth={2.5} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveAll}
                                disabled={filteredCurrent.length === 0}
                                title="Move All Left"
                                className="w-10 h-10 flex items-center justify-center rounded-sm bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronsLeft size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Current Icons */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Active Icons</span>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-[3px] border border-blue-100">{filteredCurrent.length}</span>
                                </div>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search active..." 
                                        value={searchCurrent}
                                        onChange={(e) => setSearchCurrent(e.target.value)}
                                        className="w-full pl-9 pr-8 py-1.5 text-sm bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                                    />
                                    {searchCurrent && (
                                        <button onClick={() => setSearchCurrent('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                {filteredCurrent.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <GripVertical size={32} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No active icons</p>
                                        <p className="text-xs mt-1 text-slate-400">Move icons here to show them</p>
                                    </div>
                                ) : (
                                    <div className="p-1">
                                        {filteredCurrent.map(item => (
                                            <IconRow 
                                                key={item.id} 
                                                item={item} 
                                                selected={selectedCurrent} 
                                                onSelect={setSelectedCurrent} 
                                                onDoubleClick={() => handleRemove(item)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Pro tip: Double-click an icon to quickly move it
                        </p>
                        <div className="opacity-40 grayscale pointer-events-none flex items-center gap-1">
                            <span className="text-sm font-bold text-slate-400 tracking-tight">
                                onimta <span className="text-blue-500">IT</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-200 flex items-center justify-between px-6 py-4 rounded-b-sm">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Reset to Default
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-sm transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm shadow-sm shadow-blue-200 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeIconBarBoard;
