import React, { useState } from 'react';
import { X, ChevronRight, Layout, Bell, Send, Mail, Search, Calculator, Printer, FileText, File, Briefcase, Sidebar, Image } from 'lucide-react';
import LetterEnvelopesModal from './LetterEnvelopesModal';
import OfficeDocumentModal from './OfficeDocumentModal';
import ToDoListBoard from './ViewAndUtilityModels/ToDoListBoard';
import SendFileBoard from './ViewAndUtilityModels/SendFileBoard';
import FindBoard from './ViewAndUtilityModels/FindBoard';
import CalculatorBoard from './ViewAndUtilityModels/CalculatorBoard';

const ViewUtilityModal = ({ isOpen, onClose, onToggleSideBar }) => {
    const [showLetterEnvelopesModal, setShowLetterEnvelopesModal] = useState(false);
    const [showOfficeDocumentModal, setShowOfficeDocumentModal] = useState(false);
    const [showToDoListBoard, setShowToDoListBoard] = useState(false);
    const [showSendFileBoard, setShowSendFileBoard] = useState(false);
    const [showFindBoard, setShowFindBoard] = useState(false);
    const [showCalculatorBoard, setShowCalculatorBoard] = useState(false);

    if (!isOpen) return null;

    const menuItems = [
        { icon: Layout, label: 'Customize Icon Bar', shortcut: '' },
        { icon: Bell, label: 'Reminder - To Do List', shortcut: '', onClick: () => setShowToDoListBoard(true) },
        { icon: Send, label: 'Send File', shortcut: '', onClick: () => setShowSendFileBoard(true) },
        { icon: Mail, label: 'Use E-Mail', shortcut: '' },
        { icon: Search, label: 'Find', shortcut: 'Ctrl+F', onClick: () => setShowFindBoard(true) },
        { icon: Search, label: 'Search', shortcut: '', onClick: () => setShowFindBoard(true) },
        { icon: Calculator, label: 'Use Calculator', shortcut: '', onClick: () => setShowCalculatorBoard(true) },
        { icon: Printer, label: 'Printer Setup', shortcut: '' },
        { icon: FileText, label: 'Open Notepad', shortcut: '' },
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
        { icon: Image, label: 'Change Background...', shortcut: '' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
                
                {/* Modal Container */}
                <div className="relative w-full max-w-sm bg-[#f0f0f0] border border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-300 select-none">
                        <div className="flex items-center gap-2">
                            <Layout size={14} className="text-[#0078d4]" />
                            <span className="text-xs font-bold text-gray-700">View and Utility</span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-5 flex items-center justify-center bg-white hover:bg-[#e81123] hover:text-white transition-colors border border-gray-300 rounded group"
                        >
                            <X size={12} className="group-hover:stroke-white te" />
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-1 bg-white m-1 border border-gray-300 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
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
                    <div className="bg-[#f0f0f0] px-3 py-1.5 border-t border-gray-300 flex justify-between items-center">
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

            {showCalculatorBoard && (
                <CalculatorBoard 
                    isOpen={showCalculatorBoard} 
                    onClose={() => setShowCalculatorBoard(false)} 
                />
            )}
        </>
    );
};

export default ViewUtilityModal;
