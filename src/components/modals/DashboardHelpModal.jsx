import React, { useState } from 'react';
import { X, Search, ChevronRight, ChevronDown, ThumbsUp, Clock, LayoutDashboard, Navigation, Bolt, BarChart3, Users } from 'lucide-react';

const sections = [
    {
        id: 'overview',
        title: "Welcome to your Dashboard",
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>
                    Your ONIMTA Accounts Dashboard is your central hub for monitoring business performance and accessing key modules.
                </p>
                <p>
                    From here, you can get a bird's-eye view of your financials, dive into detailed reports, or jump straight into creating new transactions.
                </p>
            </div>
        )
    },
    {
        id: 'navigation',
        title: 'Mastering Navigation',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Navigate the system quickly using our specialized menus:</p>
                <div className="bg-slate-50 p-4 rounded-[3px] space-y-2">
                    <div className="flex items-start gap-3">
                        <Navigation size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Top Navigation Bar:</span>
                            <span className="text-slate-600 ml-1">Access major functional areas like Sales, Purchases, Banking, and Reports. Hover over any tab to see sub-modules.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Bolt size={16} className="text-[#0077c5] mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold text-slate-800">Quick Actions (Ribbon):</span>
                            <span className="text-slate-600 ml-1">Use the Quick Actions grid to instantly launch common tasks like creating an invoice or recording a deposit.</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'widgets',
        title: 'Dashboard Widgets',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>Keep track of your business health at a glance:</p>
                <div className="grid grid-cols-1 gap-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100 flex items-center gap-3">
                        <BarChart3 size={20} className="text-emerald-600" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-[12px] mb-0.5">Financial Metrics</h4>
                            <p className="text-[11px] text-slate-600">Review cash flow, income vs expenses, and account balances.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-[3px] border border-slate-100 flex items-center gap-3">
                        <Users size={20} className="text-blue-600" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-[12px] mb-0.5">Receivables & Payables</h4>
                            <p className="text-[11px] text-slate-600">See who owes you money and what bills you need to pay soon.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'support',
        title: 'Getting Help',
        content: (
            <div className="space-y-3 text-[13px] text-slate-700 leading-relaxed">
                <p>We are here to support your success with ONIMTA:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-slate-600">
                    <li><strong className="text-slate-800">AI Assistant:</strong> Click the glowing AI button in the header to get instant answers to your questions.</li>
                    <li><strong className="text-slate-800">Contextual Help:</strong> Look for the Help icon (?) on any transaction form or report for specific guidance.</li>
                    <li><strong className="text-slate-800">System Support:</strong> Contact our support team directly using the button below if you encounter any technical issues.</li>
                </ul>
            </div>
        )
    }
];

const relatedLinks = [
    { label: 'Set up your Chart of Accounts', href: '/accounts' },
    { label: 'Configure System Settings', href: '/settings' },
    { label: 'Manage Users and Roles', href: '/users' }
];

const DashboardHelpModal = ({ isOpen, onClose }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [feedbackStatus, setFeedbackStatus] = useState(null);
    const [helpfulCount, setHelpfulCount] = useState(843);

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
                                Getting Started with Your Dashboard
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-600 mb-6 font-medium">
                                <span className="font-bold text-gray-900">by ONIMTA</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><ThumbsUp size={14} className="text-gray-500" /> {helpfulCount}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" /> Updated 2 days ago</span>
                            </div>
                        </div>

                        {/* Intro Paragraphs */}
                        <div className="space-y-4 text-[14px] text-gray-700 leading-relaxed mb-8">
                            <p>Discover how to maximize your efficiency using the ONIMTA Accounts Dashboard.</p>
                            <p>The dashboard provides real-time insights and one-click access to all your most important tasks, whether it's recording a payment or analyzing cash flow.</p>
                            <p>Use the Quick Actions grid to rapidly jump into forms, or use the top navigation menu for full access to all system features.</p>
                            
                            <h3 className="font-bold text-[18px] text-gray-900 mt-8 mb-3">Dashboard Guide</h3>
                            <p>Explore the sections below to learn more about navigating your Dashboard:</p>
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

export default DashboardHelpModal;
