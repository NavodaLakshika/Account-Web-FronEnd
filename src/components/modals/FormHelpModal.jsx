import React, { useState } from 'react';
import { X, Search, ChevronRight, ChevronDown, ThumbsUp, Clock, FileText, Settings2, Keyboard, List, SearchCode } from 'lucide-react';

const sections = [
    {
        id: 'overview',
        title: "Navigating Transaction Forms",
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>
                    Transaction forms are the core of ONIMTA Accounts, allowing you to seamlessly create and manage financial records.
                </p>
                <p>
                    Key form tools are easily accessible from the header and footer:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-slate-600">
                    <li><strong className="text-slate-800">Clear Form:</strong> Instantly reset all fields to their default state using the CLEAR button.</li>
                    <li><strong className="text-slate-800">Lookup Fields:</strong> Click on fields with a magnifying glass to search for Customers, Vendors, Cost Centers, etc.</li>
                    <li><strong className="text-slate-800">Transaction History:</strong> Access recent transactions by clicking the History icon in the top left.</li>
                    <li><strong className="text-slate-800">Feedback:</strong> Send us your thoughts directly using the 'Give feedback' button in the header.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'lookup-modals',
        title: 'Using Lookup Modals',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Lookup modals help you find related records quickly without leaving the current form.</p>
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-2">
                    <div className="flex items-start gap-3">
                        <SearchCode size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Smart Search:</span>
                            <span className="text-slate-600 ml-1">Begin typing immediately when the modal opens. It filters both names and codes in real-time.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <List size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Selection:</span>
                            <span className="text-slate-600 ml-1">Click anywhere on the row or press the SELECT button to choose a record and auto-fill the form.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Navigate forms faster using standard keyboard shortcuts:</p>
                <div className="grid grid-cols-1 gap-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100 flex justify-between items-center">
                        <span className="text-[12px] text-slate-700">Move to next field</span>
                        <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">Tab</kbd>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100 flex justify-between items-center">
                        <span className="text-[12px] text-slate-700">Move to previous field</span>
                        <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">Shift</kbd>
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">Tab</kbd>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100 flex justify-between items-center">
                        <span className="text-[12px] text-slate-700">Save / Submit Form</span>
                        <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">Ctrl</kbd>
                            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">S</kbd>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
];

const relatedLinks = [
    { label: 'View general ledger entries', href: '/journal' },
    { label: 'Manage customer and vendor profiles', href: '/master' },
    { label: 'View comprehensive financial reports', href: '/reports' }
];

const FormHelpModal = ({ isOpen, onClose }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [feedbackStatus, setFeedbackStatus] = useState(null);
    const [helpfulCount, setHelpfulCount] = useState(185);

    const toggleSection = (id) => {
        setExpandedSection(prev => prev === id ? null : id);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[600] bg-transparent" onClick={onClose} />
            
            {/* Side Panel Drawer */}
            <div className="fixed inset-y-0 right-0 z-[601] w-[450px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 font-sans border-l border-gray-200">
                {/* Body Content */}
                <div className="flex-1 overflow-y-auto bg-white relative">
                    <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/80 rounded-full p-1">
                        <X size={22} strokeWidth={2.5} />
                    </button>
                    <div className="p-7 pt-10">
                        {/* Title & Meta */}
                        <div className="mb-6">
                            <h1 className="text-[22px] font-bold text-gray-900 leading-tight mb-4">
                                Managing Forms & Transactions in ONIMTA
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-600 mb-6 font-medium">
                                <span className="font-bold text-gray-900">by ONIMTA</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><ThumbsUp size={14} className="text-gray-500" /> {helpfulCount}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" /> Updated 1 week ago</span>
                            </div>
                        </div>

                        {/* Intro Paragraphs */}
                        <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed mb-8">
                            <p>Master the transaction forms to work efficiently in ONIMTA Accounts Advanced.</p>
                            <p>With ONIMTA Accounts, you can quickly input data, manage lookups, and streamline your entire data entry process.</p>
                            <p>The updated form interface combines high-speed processing with modern accessibility tools to enhance your daily workflow.</p>
                            
                            <h3 className="font-bold text-[18px] text-gray-900 mt-8 mb-3">Quick Navigation Tips</h3>
                            <p>Explore the tips below to navigate and fill out your transaction forms faster:</p>
                        </div>

                        {/* Accordions */}
                        <div className="space-y-0 border-t border-gray-200 pt-2 mb-8">
                            {sections.map((section) => {
                                const isOpen = expandedSection === section.id;
                                return (
                                    <div key={section.id} className="border-b border-gray-200">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center gap-3 py-4 hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <div className="text-[#0077c5] shrink-0 transform transition-transform duration-200 group-hover:text-[#005a9c]">
                                                {isOpen ? <ChevronDown size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />}
                                            </div>
                                            <span className="text-[15px] font-medium text-[#0077c5] group-hover:underline group-hover:text-[#005a9c]">{section.title}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="pl-8 pr-2 pb-5 pt-1 animate-in slide-in-from-top-2 duration-200">
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Related Links */}
                        <div className="mb-6">
                            <h3 className="text-[17px] font-bold text-gray-900 mb-4">Related links</h3>
                            <ul className="list-disc pl-5 space-y-3">
                                {relatedLinks.map((link, i) => (
                                    <li key={i} className="text-gray-800 marker:text-gray-400">
                                        <a href={link.href} className="text-[#0077c5] hover:underline text-[14px] font-medium leading-tight">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-5 shrink-0 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 w-full justify-center">
                        <span className="text-[14px] text-gray-700 font-medium">
                            {feedbackStatus ? 'Thank you for your feedback!' : 'Was this helpful?'}
                        </span>
                        {!feedbackStatus && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setFeedbackStatus('yes'); setHelpfulCount(prev => prev + 1); }}
                                    className="px-5 py-1.5 border border-gray-400 bg-white hover:bg-gray-50 hover:border-[#0077c5] hover:text-[#0077c5] rounded text-[13px] font-bold text-gray-700 transition-colors shadow-sm"
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setFeedbackStatus('no')}
                                    className="px-5 py-1.5 border border-gray-400 bg-white hover:bg-gray-50 hover:border-[#0077c5] hover:text-[#0077c5] rounded text-[13px] font-bold text-gray-700 transition-colors shadow-sm"
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="w-full border-t border-gray-200 my-1" />
                    <button className="px-5 h-10 bg-[#0285fd] hover:bg-[#0275e0] text-white rounded-[3px] font-bold text-[14px] transition-colors shadow-sm">
                        Contact Us
                    </button>
                </div>
            </div>
        </>
    );
};

export default FormHelpModal;
