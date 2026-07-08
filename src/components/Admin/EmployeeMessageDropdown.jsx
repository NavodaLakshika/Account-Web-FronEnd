import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Send, X, ArrowLeft, Phone, MessageSquare, Smartphone, History, Loader2, CheckCircle, FileText } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import smsService from '../../services/sms.service';

const EmployeeMessageDropdown = ({ allEmployees = [], onClose }) => {
    const [search, setSearch] = useState('');
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [view, setView] = useState('list'); // list | sms | logs
    const [smsText, setSmsText] = useState('');
    const [sendingSms, setSendingSms] = useState(false);
    const [messageLogs, setMessageLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const getPhone = (emp) => emp.phone || emp.mobile || emp.mobile_No || emp.phone_No || emp.phone_Number || '';

    const filtered = allEmployees.filter(emp => {
        const term = search.toLowerCase();
        const name = (emp.emp_Name || emp.empName || emp.name || '').toLowerCase();
        const phone = getPhone(emp).toLowerCase();
        const code = (emp.empCode || emp.emp_Code || '').toLowerCase();
        return name.includes(term) || phone.includes(term) || code.includes(term);
    });

    const handleSendSms = async () => {
        if (!smsText.trim()) return;
        const phone = getPhone(selectedEmp);
        if (!phone) {
            showErrorToast("No phone number for this employee");
            return;
        }
        setSendingSms(true);
        try {
            const userStr = localStorage.getItem('user');
            let senderName = 'Super Admin';
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    senderName = userObj.name || userObj.emp_Name || userObj.empName || 'Super Admin';
                } catch (e) {}
            }
            await smsService.sendAndLog(
                phone,
                smsText,
                senderName,
                selectedEmp.emp_Name || selectedEmp.empName || selectedEmp.name,
                selectedEmp.empCode || selectedEmp.emp_Code || ''
            );
            showSuccessToast(`SMS sent to ${selectedEmp.emp_Name || selectedEmp.empName || selectedEmp.name}`);
            setSmsText('');
            setView('list');
            setSelectedEmp(null);
        } catch (e) {
            showErrorToast("Failed to send SMS");
        } finally {
            setSendingSms(false);
        }
    };

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const logs = await smsService.getServerLogs();
            setMessageLogs(logs);
        } catch {
            setMessageLogs(smsService.getLocalLogs());
        } finally {
            setLoadingLogs(false);
        }
    };

    const openLogs = () => {
        loadLogs();
        setView('logs');
    };

    const WhatsAppIcon = ({ size = 16, className = "" }) => (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
    );

    const handleWhatsApp = (e, emp) => {
        e.stopPropagation();
        const phone = getPhone(emp);
        if (phone) {
            let cleanPhone = phone.replace(/[^0-9+]/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '94' + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith('+')) {
                cleanPhone = cleanPhone.substring(1);
            } else if (cleanPhone.length === 9) {
                cleanPhone = '94' + cleanPhone;
            }
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    const employeeActions = (emp) => (
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => handleWhatsApp(e, emp)}
                className={`p-2 rounded-none transition-colors ${getPhone(emp) ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-slate-600 cursor-not-allowed'}`}
                title={getPhone(emp) ? 'Open WhatsApp' : 'No phone number'}
                disabled={!getPhone(emp)}
            >
                <WhatsAppIcon size={18} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); setView('sms'); }}
                className={`p-2 rounded-none transition-colors ${getPhone(emp) ? 'text-blue-400 hover:bg-blue-500/20' : 'text-slate-600 cursor-not-allowed'}`}
                title={getPhone(emp) ? 'Send SMS' : 'No phone number'}
                disabled={!getPhone(emp)}
            >
                <Smartphone size={18} />
            </button>
        </div>
    );

    const applyTemplate = (text) => {
        setSmsText(text);
    };

    const templates = [
        "Please check the system for an urgent update.",
        "Your password reset request has been processed successfully.",
        "A new notification requires your immediate attention.",
        "Please contact the Super Admin as soon as possible."
    ];

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/20 animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="absolute top-6 bottom-6 right-6 w-1/4 min-w-[320px] bg-white dark:bg-[#1e293b]/80 backdrop-blur-xl border border-slate-200 dark:border-[#334155] border-l-[6px] border-l-blue-500 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                
                {view === 'list' && (
                    <>
                        <div className="p-5 border-b border-slate-200 dark:border-[#334155] bg-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                                    <MessageSquare size={18} className="text-blue-400" />
                                    Messaging Center
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={openLogs}
                                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white hover:bg-[#334155]/50 rounded-none transition-colors"
                                        title="Message Logs"
                                    >
                                        <History size={18} />
                                    </button>
                                    <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-none transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none text-sm focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white placeholder:text-slate-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 no-scrollbar bg-transparent">
                            {filtered.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-sm mt-10">No employees found.</div>
                            ) : (
                                filtered.map((emp, idx) => (
                                    <div
                                        key={emp.empCode || emp.emp_Code || emp.id || idx}
                                        className="flex items-center justify-between p-3 mb-2 bg-white dark:bg-[#0f172a]/40 hover:bg-[#334155]/60 border border-slate-200 dark:border-[#334155]/50 rounded-none transition-all shadow-sm group"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-none bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                                                {(emp.emp_Name || emp.empName || emp.name || 'U')[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{emp.emp_Name || emp.empName || emp.name}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                    <Phone size={10} className="text-slate-500" />
                                                    {getPhone(emp) || <span className="text-slate-600 italic">No phone</span>}
                                                    <span className="text-slate-500 ml-1">({emp.empCode || emp.emp_Code || ''})</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                            {employeeActions(emp)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-200 dark:border-[#334155] bg-transparent">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold tracking-wider uppercase">
                                {allEmployees.length} EMPLOYEES • {allEmployees.filter(e => getPhone(e)).length} WITH PHONE
                            </p>
                        </div>
                    </>
                )}

                {view === 'sms' && (
                    <div className="flex flex-col h-full bg-transparent">
                        <div className="p-4 border-b border-slate-200 dark:border-[#334155] bg-transparent flex items-center gap-3">
                            <button onClick={() => { setView('list'); setSelectedEmp(null); }} className="p-1.5 hover:bg-[#334155]/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white rounded-none transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{selectedEmp.emp_Name || selectedEmp.empName || selectedEmp.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Phone size={12} /> {getPhone(selectedEmp)}</p>
                            </div>
                            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-none transition-colors"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 p-5 flex flex-col overflow-y-auto no-scrollbar bg-transparent">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-none bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Smartphone size={24} className="text-blue-400" />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Send SMS Message</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Message will be sent instantly via SMS gateway</p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <FileText size={12} /> Quick Templates
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {templates.map((tmpl, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => applyTemplate(tmpl)}
                                            className="text-left px-3 py-1.5 bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] hover:border-blue-500 hover:text-blue-400 text-xs text-slate-600 dark:text-slate-300 rounded-none transition-colors"
                                        >
                                            {tmpl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col relative">
                                <textarea
                                    value={smsText}
                                    onChange={e => setSmsText(e.target.value)}
                                    placeholder="Type your custom SMS message here..."
                                    maxLength={160}
                                    className="flex-1 w-full bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-[#334155] rounded-none p-4 text-sm focus:outline-none focus:border-blue-500 resize-none text-slate-800 dark:text-white placeholder:text-slate-500 min-h-[120px]"
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 font-medium">
                                    {smsText.length}/160
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-transparent border-t border-slate-200 dark:border-[#334155]">
                            <button
                                onClick={handleSendSms}
                                disabled={!smsText.trim() || sendingSms}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-slate-800 dark:text-white py-3 rounded-none font-bold text-sm transition-all"
                            >
                                {sendingSms ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sendingSms ? 'Sending SMS...' : 'Send Message Now'}
                            </button>
                        </div>
                    </div>
                )}

                {view === 'logs' && (
                    <div className="flex flex-col h-full bg-transparent">
                        <div className="p-4 border-b border-slate-200 dark:border-[#334155] bg-transparent flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setView('list')} className="p-1.5 hover:bg-[#334155]/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white rounded-none transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Message History</h3>
                            </div>
                            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-none transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-transparent">
                            {loadingLogs ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 size={24} className="animate-spin text-blue-400" />
                                </div>
                            ) : messageLogs.length === 0 ? (
                                <div className="text-center text-slate-500 text-sm mt-20 flex flex-col items-center">
                                    <History size={40} className="text-slate-600 mb-3" />
                                    No message logs yet.
                                </div>
                            ) : (
                                messageLogs.map((log, idx) => (
                                    <div key={log.id || idx} className="p-3 mb-3 bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-[#334155] rounded-none">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-emerald-400" />
                                                <span className="font-bold text-slate-800 dark:text-white text-sm">{log.receiverName || log.phoneNumber}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-[#334155]/50 px-2 py-0.5 rounded-none font-medium">{log.sentAt ? new Date(log.sentAt).toLocaleString() : ''}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed bg-white dark:bg-[#0f172a]/80 p-2 rounded-none border border-slate-200 dark:border-[#334155]/50">{log.messageText}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                            <Phone size={10} /> {log.phoneNumber}
                                            <span className="ml-auto text-blue-400">Sent by: {log.senderName}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>,
        document.body
    );
};

export default EmployeeMessageDropdown;





