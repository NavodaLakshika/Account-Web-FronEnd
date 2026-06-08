import React, { useState } from 'react';
import { Search, Send, X, ArrowLeft, Phone, MessageSquare, Smartphone, History, Loader2, CheckCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import api from '../../services/api';
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

    // In-app messaging removed as requested

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
            // keep numbers and plus sign
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
        <div className="flex items-center gap-1">
            <button
                onClick={(e) => handleWhatsApp(e, emp)}
                className={`p-2 rounded-lg transition-colors ${getPhone(emp) ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-300 cursor-not-allowed'}`}
                title={getPhone(emp) ? 'Open WhatsApp' : 'No phone number'}
                disabled={!getPhone(emp)}
            >
                <WhatsAppIcon size={16} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); setView('sms'); }}
                className={`p-2 rounded-lg transition-colors ${getPhone(emp) ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10' : 'text-slate-300 cursor-not-allowed'}`}
                title={getPhone(emp) ? 'Send SMS' : 'No phone number'}
                disabled={!getPhone(emp)}
            >
                <Smartphone size={16} />
            </button>
        </div>
    );

    // Chat view removed

    if (view === 'sms') {
        return (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col h-[420px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                        <button onClick={() => { setView('list'); setSelectedEmp(null); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedEmp.emp_Name || selectedEmp.empName || selectedEmp.name}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {getPhone(selectedEmp)}</p>
                        </div>
                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={18} /></button>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                                <Smartphone size={28} className="text-orange-500" />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Send SMS</h4>
                            <p className="text-xs text-slate-500 mt-1">Message will be sent via SMS gateway</p>
                        </div>
                        <textarea
                            value={smsText}
                            onChange={e => setSmsText(e.target.value)}
                            placeholder="Type your SMS message..."
                            maxLength={160}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none h-24 mb-2 text-slate-900 dark:text-white"
                        />
                        <p className="text-right text-xs text-slate-400 mb-3">{smsText.length}/160</p>
                        <button
                            onClick={handleSendSms}
                            disabled={!smsText.trim() || sendingSms}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm transition-colors"
                        >
                            {sendingSms ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {sendingSms ? 'Sending...' : 'Send SMS'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'logs') {
        return (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col h-[420px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setView('list')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Message Logs</h3>
                        </div>
                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                        {loadingLogs ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 size={24} className="animate-spin text-slate-400" />
                            </div>
                        ) : messageLogs.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-16">No message logs yet.</div>
                        ) : (
                            messageLogs.map((log, idx) => (
                                <div key={log.id || idx} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl mb-2 bg-slate-50/50 dark:bg-slate-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-emerald-500" />
                                            <span className="font-bold text-slate-800 dark:text-white text-sm">{log.receiverName || log.phoneNumber}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{log.sentAt ? new Date(log.sentAt).toLocaleString() : ''}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 line-clamp-2">{log.messageText}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <Phone size={10} /> {log.phoneNumber}
                                        <span className="ml-auto">{log.senderName}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col h-[420px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <MessageSquare size={16} className="text-[#00acee]" />
                            Messaging
                        </h3>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={openLogs}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Message Logs"
                            >
                                <History size={16} />
                            </button>
                            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={18} /></button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No employees found.</div>
                    ) : (
                        filtered.map((emp, idx) => (
                            <div
                                key={emp.empCode || emp.emp_Code || emp.id || idx}
                                className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-[#00acee]/10 text-[#00acee] flex items-center justify-center font-bold text-sm shrink-0">
                                        {(emp.emp_Name || emp.empName || emp.name || 'U')[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{emp.emp_Name || emp.empName || emp.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Phone size={11} />
                                            {getPhone(emp) || <span className="text-slate-300 italic">No phone</span>}
                                            <span className="text-slate-400 ml-1">({emp.empCode || emp.emp_Code || ''})</span>
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
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-[10px] text-slate-400 text-center">
                        {allEmployees.length} employees • {allEmployees.filter(e => getPhone(e)).length} with phone numbers
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeMessageDropdown;
