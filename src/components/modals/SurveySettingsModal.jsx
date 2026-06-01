import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';
import { Save, Bell, Mail, MessageSquare, Star, Settings2 } from 'lucide-react';
import { showSuccessToast } from '../../utils/toastUtils';

const SurveySettingsModal = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        enableEmailSurveys: true,
        enableSmsSurveys: false,
        sendAfterInvoicePaid: true,
        delayDays: '3',
        minimumRatingForReferral: '4',
        emailSubject: 'How did we do? We value your feedback!',
        customMessage: 'Thank you for choosing us! Please take a moment to rate your experience and let us know how we can improve.',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        showSuccessToast('Survey settings saved successfully!');
        onClose();
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
            <button 
                onClick={onClose}
                className="px-6 h-9 bg-white text-slate-600 border border-slate-200 text-[12px] font-bold rounded shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
                CANCEL
            </button>
            <button 
                onClick={handleSave}
                className="px-6 h-9 bg-[#2ca01c] text-white text-[12px] font-bold rounded shadow-sm hover:bg-[#207a15] transition-all flex items-center justify-center gap-2"
            >
                <Save size={15} /> SAVE SETTINGS
            </button>
        </div>
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Survey Settings"
            maxWidth="max-w-[700px]"
            footer={footer}
        >
            <div className="p-6 font-['Plus_Jakarta_Sans'] bg-white space-y-8">
                
                {/* Header Description */}
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <Settings2 className="text-blue-500 mt-0.5 shrink-0" size={20} />
                    <div>
                        <h4 className="text-[14px] font-bold text-slate-800">Automate your customer feedback</h4>
                        <p className="text-[12px] text-slate-600 mt-1">Configure when and how post-invoice surveys are sent to your customers. High ratings can automatically trigger referral requests to help grow your business.</p>
                    </div>
                </div>

                {/* Delivery Channels */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Bell size={14} className="text-slate-400" /> Delivery Channels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${settings.enableEmailSurveys ? 'border-[#2ca01c] bg-green-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input 
                                type="checkbox" 
                                name="enableEmailSurveys"
                                checked={settings.enableEmailSurveys}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-[#2ca01c] rounded border-slate-300 focus:ring-[#2ca01c]"
                            />
                            <div>
                                <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-800">
                                    <Mail size={14} className="text-slate-500" /> Email Surveys
                                </div>
                                <p className="text-[12px] text-slate-500 mt-1">Send a beautifully formatted email survey with a 1-click rating system.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${settings.enableSmsSurveys ? 'border-[#2ca01c] bg-green-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input 
                                type="checkbox" 
                                name="enableSmsSurveys"
                                checked={settings.enableSmsSurveys}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-[#2ca01c] rounded border-slate-300 focus:ring-[#2ca01c]"
                            />
                            <div>
                                <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-800">
                                    <MessageSquare size={14} className="text-slate-500" /> SMS Surveys
                                </div>
                                <p className="text-[12px] text-slate-500 mt-1">Send a short text message with a direct link to the feedback form.</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Timing & Triggers */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Star size={14} className="text-slate-400" /> Timing & Triggers
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-5">
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="sendAfterInvoicePaid"
                                checked={settings.sendAfterInvoicePaid}
                                onChange={handleChange}
                                className="w-4 h-4 text-[#2ca01c] rounded border-slate-300 focus:ring-[#2ca01c]"
                            />
                            <span className="text-[13px] font-semibold text-slate-700">Send survey automatically when an invoice is fully paid</span>
                        </label>

                        <div className="flex items-center gap-3 pl-7">
                            <span className="text-[13px] text-slate-600">Delay sending by</span>
                            <select 
                                name="delayDays"
                                value={settings.delayDays}
                                onChange={handleChange}
                                className="border border-slate-300 rounded px-2 py-1 text-[13px] text-slate-800 font-medium focus:border-blue-500 outline-none"
                            >
                                <option value="0">0 days (Immediately)</option>
                                <option value="1">1 day</option>
                                <option value="3">3 days</option>
                                <option value="7">7 days</option>
                            </select>
                            <span className="text-[13px] text-slate-600">after payment is recorded.</span>
                        </div>

                        <div className="h-px w-full bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold text-slate-700">Ask for a referral if rating is at least</span>
                            <div className="flex items-center gap-1">
                                <select 
                                    name="minimumRatingForReferral"
                                    value={settings.minimumRatingForReferral}
                                    onChange={handleChange}
                                    className="border border-slate-300 rounded px-2 py-1 text-[13px] font-bold text-slate-800 focus:border-blue-500 outline-none"
                                >
                                    <option value="4">4 Stars</option>
                                    <option value="5">5 Stars</option>
                                </select>
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Email Customization */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" /> Email Customization
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Email Subject line</label>
                            <input 
                                type="text"
                                name="emailSubject"
                                value={settings.emailSubject}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-[13px] text-slate-800 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Message Body</label>
                            <textarea 
                                name="customMessage"
                                value={settings.customMessage}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-[13px] text-slate-800 focus:border-blue-500 outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>
                </div>
                
            </div>
        </SimpleModal>
    );
};

export default SurveySettingsModal;
