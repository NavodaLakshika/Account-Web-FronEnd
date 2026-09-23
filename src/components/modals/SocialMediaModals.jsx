import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ExternalLink, Phone, MessageCircle, Copy, Check, Send } from 'lucide-react';
import { showSuccessToast } from '../../utils/toastUtils';

const SocialMediaModals = ({ modalType, isOpen, onClose }) => {
    // Form state for Email modal
    const [toEmail, setToEmail] = useState('navoda991@gmail.com');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);

    // Keep To address auto-filled with navoda991@gmail.com
    useEffect(() => {
        if (isOpen) {
            setToEmail('navoda991@gmail.com');
            setSubject('');
            setMessage('');
            setCopiedEmail(false);
            setCopiedPhone(false);
            // Prevent background scrolling while modal is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !modalType) return null;

    // Actions
    const handleCopyEmail = (e) => {
        e?.stopPropagation();
        navigator.clipboard?.writeText(toEmail);
        setCopiedEmail(true);
        showSuccessToast('Email address copied to clipboard!');
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const handleCopyPhone = (e) => {
        e?.stopPropagation();
        navigator.clipboard?.writeText('+94721220008');
        setCopiedPhone(true);
        showSuccessToast('Phone number copied to clipboard!');
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const handleSendEmail = (e) => {
        e?.preventDefault();
        const encodedSubject = encodeURIComponent(subject || 'Inquiry to Onimta');
        const encodedBody = encodeURIComponent(message || '');
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodedSubject}&body=${encodedBody}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        showSuccessToast('Opening Gmail composer...');
        onClose();
    };

    const handleOpenMailto = () => {
        const encodedSubject = encodeURIComponent(subject || 'Inquiry to Onimta');
        const encodedBody = encodeURIComponent(message || '');
        window.location.href = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`;
        onClose();
    };

    const handleConfirmFacebook = () => {
        window.open('https://www.facebook.com/onimta', '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleConfirmInstagram = () => {
        window.open('https://www.instagram.com/onimta', '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleWhatsAppMessage = () => {
        window.open('https://wa.me/94721220008', '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleWhatsAppCall = () => {
        window.location.href = 'tel:+94721220008';
        onClose();
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop click dismiss */}
            <div 
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Card - Styled to perfectly match Dashboard.jsx modals */}
            <div 
                className="relative w-full max-w-[540px] bg-white rounded-[3px] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 z-10"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ==================== 1. FACEBOOK MODAL ==================== */}
                {modalType === 'facebook' && (
                    <>
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-[14px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                                    VISIT ONIMTA FACEBOOK
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    OFFICIAL SOCIAL COMMUNITY
                                </span>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer" 
                                title="Close (Esc)"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-white space-y-4">
                            <p className="text-[13.5px] text-slate-700 leading-relaxed font-sans">
                                Do you want to visit the official <strong className="text-slate-900 font-bold">Onimta Facebook Page</strong>?
                            </p>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-slate-800 truncate">Onimta | Maharagama | Facebook</div>
                                    <div className="text-[11.5px] text-slate-500 font-mono mt-0.5 truncate">https://www.facebook.com/onimta</div>
                                </div>
                                <span className="shrink-0 px-2 py-0.5 bg-[#0078d4] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                                    Official
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 flex items-center justify-end gap-2.5 border-t border-slate-200 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmFacebook}
                                className="px-6 py-2 bg-[#0078d4] hover:bg-[#0066b8] text-white font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                                <span>Visit Page</span>
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </>
                )}

                {/* ==================== 2. WHATSAPP MODAL ==================== */}
                {modalType === 'whatsapp' && (
                    <>
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-[14px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                                    ONIMTA CUSTOMER CENTER
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    DIRECT ASSISTANCE & SUPPORT
                                </span>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer" 
                                title="Close (Esc)"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-white space-y-4">
                            <p className="text-[13.5px] text-slate-700 leading-relaxed font-sans">
                                Contact <strong className="text-slate-900 font-bold">Onimta Customer Center</strong> directly via WhatsApp message or telephone call:
                            </p>

                            {/* Phone number display box */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Phone size={16} className="text-[#0078d4]" />
                                    <span className="text-[15px] font-bold text-slate-900 font-mono tracking-wide">+94 72 122 0008</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyPhone}
                                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-[3px] text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                    title="Copy number"
                                >
                                    {copiedPhone ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>

                            {/* Two Direct Action Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleWhatsAppMessage}
                                    className="p-4 border border-emerald-300/80 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 rounded-[3px] transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-98 shadow-xs"
                                >
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold">Message on WhatsApp</div>
                                        <div className="text-[11px] text-emerald-700 font-mono mt-0.5">+94721220008</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleWhatsAppCall}
                                    className="p-4 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950 rounded-[3px] transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer active:scale-98 shadow-xs"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#0078d4] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold">Call Customer Center</div>
                                        <div className="text-[11px] text-blue-700 font-mono mt-0.5">Direct Voice Call</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 flex items-center justify-end border-t border-slate-200 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}

                {/* ==================== 3. EMAIL / GMAIL MODAL ==================== */}
                {modalType === 'email' && (
                    <form onSubmit={handleSendEmail} className="flex flex-col">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-[14px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                                    SEND EMAIL INQUIRY
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    ONIMTA SUPPORT DESK
                                </span>
                            </div>
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer" 
                                title="Close (Esc)"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-white space-y-4">
                            {/* To field (Auto-filled with navoda991@gmail.com) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
                                        To:
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleCopyEmail}
                                        className="text-[11px] text-[#0078d4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedEmail ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                        <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={toEmail}
                                        onChange={(e) => setToEmail(e.target.value)}
                                        className="w-full h-10 border border-slate-300 rounded-[3px] px-3 pr-24 text-[13px] font-semibold text-slate-800 bg-slate-50 font-mono outline-none focus:bg-white focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors"
                                        required
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-[#0078d4] rounded-[2px]">
                                        Auto-filled
                                    </span>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Subject:
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter inquiry subject..."
                                    className="w-full h-10 border border-slate-300 rounded-[3px] px-3 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Message:
                                </label>
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message to Onimta team here..."
                                    className="w-full p-3 border border-slate-300 rounded-[3px] text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-200 shrink-0">
                            <button
                                type="button"
                                onClick={handleOpenMailto}
                                className="text-[12px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                            >
                                Open in default mail client
                            </button>
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#0078d4] hover:bg-[#0066b8] text-white font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                >
                                    <Send size={14} />
                                    <span>Open in Gmail</span>
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ==================== 4. INSTAGRAM MODAL ==================== */}
                {modalType === 'instagram' && (
                    <>
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 select-none shrink-0">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-[14px] font-mono font-bold text-slate-800 uppercase tracking-widest truncate">
                                    VISIT ONIMTA INSTAGRAM
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    OFFICIAL SOCIAL PROFILE
                                </span>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer" 
                                title="Close (Esc)"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-white space-y-4">
                            <p className="text-[13.5px] text-slate-700 leading-relaxed font-sans">
                                Do you want to visit <strong className="text-slate-900 font-bold">Onimta</strong> on Instagram?
                            </p>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-slate-800 truncate">Onimta Official Instagram</div>
                                    <div className="text-[11.5px] text-slate-500 font-mono mt-0.5 truncate">https://www.instagram.com/onimta</div>
                                </div>
                                <span className="shrink-0 px-2 py-0.5 bg-gradient-to-r from-[#dc2743] to-[#bc1888] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                                    Instagram
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 flex items-center justify-end gap-2.5 border-t border-slate-200 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmInstagram}
                                className="px-6 py-2 bg-[#0078d4] hover:bg-[#0066b8] text-white font-semibold text-[13px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                                <span>Visit Instagram</span>
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>,
        document.body
    );
};

export default SocialMediaModals;
