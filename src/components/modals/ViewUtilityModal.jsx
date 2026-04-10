import React, { useState } from 'react';
import { X, ChevronRight, Layout, Bell, Send, Mail, Search, Calculator, Printer, FileText, File, Briefcase, Sidebar, Image } from 'lucide-react';
import LetterEnvelopesModal from './LetterEnvelopesModal';
import OfficeDocumentModal from './OfficeDocumentModal';
import ToDoListBoard from './ViewAndUtilityModels/ToDoListBoard';
import SendFileBoard from './ViewAndUtilityModels/SendFileBoard';
import FindBoard from './ViewAndUtilityModels/FindBoard';
import CalculatorBoard from './ViewAndUtilityModels/CalculatorBoard';
import ChangeBackgroundBoard from './ViewAndUtilityModels/ChangeBackgroundBoard';
import CustomizeIconBarBoard from './ViewAndUtilityModels/CustomizeIconBarBoard';

const ViewUtilityModal = ({ isOpen, onClose, onToggleSideBar, onOpenReminder, onOpenCalculator, onOpenNotepad, onOpenPrinter, currentTopBarColor, onColorSelect }) => {
    const [showLetterEnvelopesModal, setShowLetterEnvelopesModal] = useState(false);
    const [showOfficeDocumentModal, setShowOfficeDocumentModal] = useState(false);
    const [showToDoListBoard, setShowToDoListBoard] = useState(false);
    const [showSendFileBoard, setShowSendFileBoard] = useState(false);
    const [showFindBoard, setShowFindBoard] = useState(false);
    const [showCalculatorBoard, setShowCalculatorBoard] = useState(false);
    const [showCustomizeIconBarBoard, setShowCustomizeIconBarBoard] = useState(false);
    const [showChangeBackgroundBoard, setShowChangeBackgroundBoard] = useState(false);

    if (!isOpen) return null;

    const menuItems = [
        { icon: Layout, label: 'Customize Icon Bar', shortcut: '', onClick: () => setShowCustomizeIconBarBoard(true) },
        { icon: Bell, label: 'Reminder - To Do List', shortcut: '', onClick: () => {
             onOpenReminder();
             onClose();
        } },
        { icon: Send, label: 'Send File', shortcut: '', onClick: () => setShowSendFileBoard(true) },
        { icon: Mail, label: 'Use E-Mail', shortcut: '' },
        { icon: Search, label: 'Find', shortcut: 'Ctrl+F', onClick: () => setShowFindBoard(true) },
        { icon: Search, label: 'Search', shortcut: '', onClick: () => setShowFindBoard(true) },
        { icon: Calculator, label: 'Use Calculator', shortcut: '', onClick: () => {
             onOpenCalculator();
             onClose();
        } },
        { icon: Printer, label: 'Printer Setup', shortcut: '', onClick: () => {
             onOpenPrinter();
             onClose();
        } },
        { icon: FileText, label: 'Open Notepad', shortcut: '', onClick: () => {
             onOpenNotepad();
             onClose();
        } },
        { icon: File, label: 'Open Office Document', hasSubmenu: true, onClick: () => {
            console.log('Opening Office Modal...');
            setShowOfficeDocumentModal(true);
        }},
        { icon: Briefcase, label: 'Prepare Letter with Envelopes', hasSubmenu: true, onClick: () => setShowLetterEnvelopesModal(true) },
        { icon: Sidebar, label: 'View Side Bar..', shortcut: '', onClick: () => {
            onToggleSideBar();
            onClose();
        }},
        { type: 'separator' },
        { icon: Image, label: 'Change Background...', shortcut: '', onClick: () => setShowChangeBackgroundBoard(true) },
    ];

    return (
        <>
            {/* Modal Container Logic */}
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                        {/* System Color Left Accent */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                            style={{ backgroundColor: currentTopBarColor }}
                        />
                        
                        <div className="flex items-center gap-2">
                            <Layout size={14} className="text-[#0078d4]" />
                            <span className="text-lg font-bold text-slate-800 tracking-tight">View and Utility</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                            title="Close"
                        >
                            <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
                        {menuItems.map((item, idx) => {
                            if (item.type === 'separator') {
                                return <div key={idx} className="my-1.5 h-[1px] bg-gray-200 mx-2" />;
                            }

                            const Icon = item.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-[#0078d4] group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={16} className={`text-gray-500 group-hover:text-white transition-colors`} />
                                        <span className={`text-[13px] font-medium text-gray-700 group-hover:text-white transition-colors`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {item.shortcut && (
                                            <span className="text-[10px] text-gray-400 group-hover:text-white/80">
                                                {item.shortcut}
                                            </span>
                                        )}
                                        {item.hasSubmenu && (
                                            <ChevronRight size={14} className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-medium">{menuItems.filter(i => i.type !== 'separator').length} Items</span>
                        <span className="text-[10px] text-[#0078d4] font-bold uppercase tracking-widest italic">Management Tools</span>
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
                    onSave={() => window.location.reload()} // Reload to apply icons across dashboard
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
