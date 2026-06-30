import React, { useState } from 'react';
import {
    X, Search, Layout, Bell, Send, Mail, FileText,
    Calculator, Printer, File, Briefcase, Sidebar, Image, Notebook
} from 'lucide-react';
import LetterEnvelopesModal from './LetterEnvelopesModal';
import OfficeDocumentModal from './OfficeDocumentModal';
import ToDoListBoard from './ViewAndUtilityModels/ToDoListBoard';
import SendFileBoard from './ViewAndUtilityModels/SendFileBoard';
import FindBoard from './ViewAndUtilityModels/FindBoard';
import CustomizeIconBarBoard from './ViewAndUtilityModels/CustomizeIconBarBoard';
import ChangeBackgroundBoard from './ViewAndUtilityModels/ChangeBackgroundBoard';

const menuGroups = [
    {
        title: 'Workspace Customization',
        items: [
            { icon: Layout, label: 'Customize Icon Bar', desc: 'Customize the ribbon icon shortcuts', board: 'customizeIconBar' },
            { icon: Sidebar, label: 'View Side Bar', desc: 'Toggle sidebar visibility', board: 'viewSidebar' },
            { icon: Image, label: 'Change Background', desc: 'Customize dashboard appearance', board: 'changeBackground' },
        ]
    },
    {
        title: 'Document & Communication',
        items: [
            { icon: Send, label: 'Send File', desc: 'Transfer files to network computers', board: 'sendFile' },
            { icon: Mail, label: 'Use E-Mail', desc: 'Send emails from the system', board: 'email' },
            { icon: File, label: 'Open Office Document', desc: 'Access office document management', board: 'officeDocument' },
        ]
    },
    {
        title: 'Productivity Tools',
        items: [
            { icon: Bell, label: 'Reminder - To Do List', desc: 'Manage tasks and reminders', board: 'todoList' },
            { icon: Notebook, label: 'Open Notepad', desc: 'Quick note-taking utility', board: 'notepad' },
            { icon: Calculator, label: 'Use Calculator', desc: 'System calculator tool', board: 'calculator' },
        ]
    },
    {
        title: 'Search & Print',
        items: [
            { icon: Search, label: 'Find', desc: 'Simple document search tool', board: 'find' },
            { icon: Printer, label: 'Printer Setup', desc: 'Configure print settings', board: 'printer' },
        ]
    },
];

const ViewUtilityModal = ({ isOpen, onClose, onToggleSideBar, onOpenCalculator, onOpenNotepad, onOpenPrinter, currentTopBarColor, onColorSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const [showLetterEnvelopesModal, setShowLetterEnvelopesModal] = useState(false);
    const [showOfficeDocumentModal, setShowOfficeDocumentModal] = useState(false);
    const [showToDoListBoard, setShowToDoListBoard] = useState(false);
    const [showSendFileBoard, setShowSendFileBoard] = useState(false);
    const [showFindBoard, setShowFindBoard] = useState(false);
    const [showCalculatorBoard, setShowCalculatorBoard] = useState(false);
    const [showCustomizeIconBarBoard, setShowCustomizeIconBarBoard] = useState(false);
    const [showChangeBackgroundBoard, setShowChangeBackgroundBoard] = useState(false);

    if (!isOpen) return null;

    const filteredGroups = (() => {
        const q = searchQuery.toLowerCase();
        if (!q) return menuGroups;
        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
            )
        })).filter(group => group.items.length > 0);
    })();

    const openBoard = (board) => {
        switch (board) {
            case 'customizeIconBar': setShowCustomizeIconBarBoard(true); break;
            case 'viewSidebar': onToggleSideBar(); onClose(); break;
            case 'changeBackground': setShowChangeBackgroundBoard(true); break;
            case 'sendFile': setShowSendFileBoard(true); break;
            case 'email': break;
            case 'officeDocument': setShowOfficeDocumentModal(true); break;
            case 'todoList': setShowToDoListBoard(true); break;
            case 'notepad': onOpenNotepad(); onClose(); break;
            case 'calculator': onOpenCalculator(); onClose(); break;
            case 'find': setShowFindBoard(true); break;
            case 'printer': onOpenPrinter(); onClose(); break;
            case 'letterEnvelopes': setShowLetterEnvelopesModal(true); break;
        }
    };

    const totalModules = menuGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

 <div className="relative w-full max-w-sm bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="bg-[#1e3a5f] px-5 py-3.5 flex items-center justify-between select-none relative overflow-hidden">
                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-[3px] bg-white/15 flex items-center justify-center">
                                <Layout size={13} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-white uppercase tracking-[2px] font-mono leading-none">View and Utility Hub</span>
                                <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-0.5">System Tools &amp; Utilities</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                            <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <div className="px-3 py-2 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] border border-gray-200 bg-white">
                            <Search size={12} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search utilities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-6 text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="p-2 bg-white flex-1 overflow-y-auto max-h-[65vh] no-scrollbar">
                        {filteredGroups.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                    <Search size={18} className="text-slate-300" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400">No utilities found</p>
                                <button onClick={() => setSearchQuery('')} className="mt-1.5 text-[9px] font-bold text-[#0285fd] uppercase tracking-wider hover:underline">Clear search</button>
                            </div>
                        ) : (
                            filteredGroups.map((group, gi) => (
                                <div key={gi}>
                                    <div className="flex items-center gap-2 px-4 py-2">
                                        <div className="w-1 h-1 rounded-full bg-[#0285fd]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</span>
                                        <div className="flex-1" />
                                        <span className="text-[9px] font-mono font-bold text-slate-300">{group.items.length}</span>
                                    </div>
                                    {group.items.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => openBoard(item.board)}
                                                className="group w-full flex items-center justify-between px-4 py-2.5 rounded-[3px] hover:bg-slate-50 transition-all relative overflow-hidden text-left border-none"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0285fd]" />

                                                <div className="flex items-center gap-3 relative z-10 w-full">
 <div className="w-7 h-7 rounded-sm bg-slate-100 flex items-center justify-center transition-colors shadow-sm group-hover:bg-white">
                                                        <Icon size={14} className="text-slate-500 group-hover:text-[#0285fd] transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {totalModules} Modules
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Utilities</span>
                    </div>
                </div>
            </div>

            {showLetterEnvelopesModal && (
                <LetterEnvelopesModal
                    isOpen={showLetterEnvelopesModal}
                    onClose={() => setShowLetterEnvelopesModal(false)}
                />
            )}
            {showOfficeDocumentModal && (
                <OfficeDocumentModal
                    isOpen={showOfficeDocumentModal}
                    onClose={() => setShowOfficeDocumentModal(false)}
                />
            )}
            {showToDoListBoard && (
                <ToDoListBoard
                    isOpen={showToDoListBoard}
                    onClose={() => setShowToDoListBoard(false)}
                />
            )}
            {showSendFileBoard && (
                <SendFileBoard
                    isOpen={showSendFileBoard}
                    onClose={() => setShowSendFileBoard(false)}
                />
            )}
            {showFindBoard && (
                <FindBoard
                    isOpen={showFindBoard}
                    onClose={() => setShowFindBoard(false)}
                />
            )}
            {showCustomizeIconBarBoard && (
                <CustomizeIconBarBoard
                    isOpen={showCustomizeIconBarBoard}
                    onClose={() => setShowCustomizeIconBarBoard(false)}
                    onSave={() => window.location.reload()}
                />
            )}
            {showChangeBackgroundBoard && (
                <ChangeBackgroundBoard
                    isOpen={showChangeBackgroundBoard}
                    onClose={() => setShowChangeBackgroundBoard(false)}
                    currentTopBarColor={currentTopBarColor}
                    onColorSelect={(color) => {
                        onColorSelect(color);
                        setShowChangeBackgroundBoard(false);
                    }}
                />
            )}
        </>
    );
};

export default ViewUtilityModal;
