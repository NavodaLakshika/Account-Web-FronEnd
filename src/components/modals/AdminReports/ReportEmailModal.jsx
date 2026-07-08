import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ReportEmailModal = ({ isOpen, onClose, title, companyName, userName }) => {
    const [toEmails, setToEmails] = useState('');
    const [ccEmails, setCcEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [format, setFormat] = useState('Excel');
    const [message, setMessage] = useState('');
    const [fileName, setFileName] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSubject(title || '');
            setFileName(title || '');
            setMessage(`Hello,\n\nAttached is the '${title}' report for ${companyName}.\n\nRegards,\n${userName}`);
        }
    }, [isOpen, title, companyName, userName]);

    if (!isOpen) return null;

    const fileExtension = format === 'Excel' ? '.xlsx' : format === 'CSV' ? '.csv' : '.pdf';

    const handleSend = () => {
        if (!toEmails.trim()) {
            setStatusMsg("Please enter at least one recipient email.");
            return;
        }

        setIsSending(true);
        setStatusMsg("Sending...");
        
        fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: toEmails,
                subject: subject,
                html: message.replace(/\n/g, "<br>")
            })
        }).then(res => res.json())
        .then(data => {
            setIsSending(false);
            if (data.success) {
                setStatusMsg("Email sent successfully!");
                setTimeout(() => {
                    onClose();
                    setStatusMsg('');
                }, 3000);
            } else {
                setStatusMsg("Failed to send: " + (data.error || 'Unknown error'));
            }
        }).catch(err => {
            setIsSending(false);
            setStatusMsg("Failed to load email service.");
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-200/50 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white shadow-2xl rounded-[2px] w-full max-w-[750px] overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2 relative">
                    <h2 className="text-[22px] font-bold text-gray-800 w-full text-center">Send {title}</h2>
                    <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-gray-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1">
                    
                    <div className="space-y-5">
                        {/* To */}
                        <div className="flex items-start">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800 mt-2">To</label>
                            <input 
                                type="text" 
                                value={toEmails}
                                onChange={(e) => setToEmails(e.target.value)}
                                placeholder="Separate multiple emails with commas" 
                                className="flex-1 h-10 border border-gray-300 rounded-[2px] px-3 text-[14px] text-gray-700 outline-none focus:border-[#0077c5] focus:ring-1 focus:ring-[#107c41] placeholder-gray-400"
                            />
                        </div>

                        {/* Cc */}
                        <div className="flex items-start">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800 mt-2">Cc</label>
                            <input 
                                type="text" 
                                value={ccEmails}
                                onChange={(e) => setCcEmails(e.target.value)}
                                placeholder="Separate multiple emails with commas" 
                                className="flex-1 h-10 border border-gray-300 rounded-[2px] px-3 text-[14px] text-gray-700 outline-none focus:border-[#0077c5] focus:ring-1 focus:ring-[#107c41] placeholder-gray-400"
                            />
                        </div>

                        {/* Subject */}
                        <div className="flex items-start ">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800 mt-2">Subject</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="flex-1 h-10 border border-gray-300 rounded-[2px] px-3 text-[14px] text-gray-700 outline-none focus:border-[#0077c5] focus:ring-1 focus:ring-[#107c41] "
                            />
                        </div>

                        {/* Format */}
                        <div className="flex items-center mt-2">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800">Format</label>
                            <div className="flex items-center gap-6">
                                {['Excel', 'CSV', 'PDF'].map((fmt) => (
                                    <label key={fmt} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                            ${format === fmt ? 'border-[#0077c5]' : 'border-gray-400 group-hover:border-[#0077c5]'}
                                        `}>
                                            {format === fmt && <div className="w-2.5 h-2.5 bg-[#0077c5] rounded-full" />}
                                        </div>
                                        <span className="text-[14px] text-gray-600 font-medium">{fmt}</span>
                                        <input 
                                            type="radio" 
                                            name="format" 
                                            value={fmt} 
                                            checked={format === fmt} 
                                            onChange={() => setFormat(fmt)} 
                                            className="hidden " 
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex items-start pt-2">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800 mt-2">Message</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={8}
                                className="flex-1 border border-gray-300 rounded-[2px] p-3 text-[14px] text-gray-700 outline-none focus:border-[#0077c5] focus:ring-1 focus:ring-[#107c41] resize-none leading-relaxed"
                            />
                        </div>

                        {/* FileName */}
                        <div className="flex items-center">
                            <label className="w-[100px] text-[13px] font-semibold text-gray-800">FileName</label>
                            <div className="flex-1 flex items-center gap-3">
                                <input 
                                    type="text" 
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="flex-1 h-10 border border-gray-300 rounded-[2px] px-3 text-[14px] text-gray-700 outline-none focus:border-[#0077c5] focus:ring-1 focus:ring-[#107c41]"
                                />
                                <span className="text-[14px] font-bold text-gray-800 w-10">{fileExtension}</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`text-[13px] font-semibold ${statusMsg.includes('success') ? 'text-blue-600' : statusMsg.includes('Please') || statusMsg.includes('Failed') || statusMsg.includes('Error') ? 'text-red-600' : 'text-[#0077c5]'}`}>
                            {statusMsg}
                        </div>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className={`px-5 py-2 text-slate-800 dark:text-white font-bold transition-colors shadow-md ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0077c5] hover:bg-[#005c9a]'}`}
                    >
                        {isSending ? 'Sending...' : 'Send email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportEmailModal;




