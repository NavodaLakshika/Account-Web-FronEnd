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
                className={`p-2 rounded-[3px] transition-colors ${getPhone(emp) ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 cursor-not-allowed'}`}
                title={getPhone(emp) ? 'Open WhatsApp' : 'No phone number'}
                disabled={!getPhone(emp)}
            >
                <WhatsAppIcon size={18} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); setView('sms'); }}
                className={`p-2 rounded-[3px] transition-colors ${getPhone(emp) ? 'text-[#0285fd] hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
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
        <div className="fixed inset-0 z-[99999] flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            
            <div 
                className="relative w-full md:w-[450px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200 font-['Tahoma']"
                onClick={(e) => e.stopPropagation()}
            >
                {view === 'list' && (
                    <>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                            <h3 className="text-[15px] font-semibold text-gray-800 flex items-center gap-2">
                                <MessageSquare size={16} className="text-[#0285fd]" />
                                Messaging Center
                            </h3>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={openLogs}
                                    className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors"
                                    title="Message Logs"
                                >
                                    <History size={18} />
                                </button>
                                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-[3px] text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {filtered.length === 0 ? (
                                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                    <MessageSquare size={40} className="text-gray-300 mb-3" />
                                    <p className="text-gray-800 font-bold text-sm mb-1">No employees found</p>
                                    <p className="text-xs text-gray-500">Try adjusting your search.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filtered.map((emp, idx) => (
                                        <div
                                            key={emp.empCode || emp.emp_Code || emp.id || idx}
                                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-[3px] transition-colors hover:border-gray-300"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-[3px] bg-blue-50 text-[#0285fd] flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                                                    {(emp.emp_Name || emp.empName || emp.name || 'U')[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{emp.emp_Name || emp.empName || emp.name}</p>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Phone size={10} />
                                                        {getPhone(emp) || <span className="text-gray-400 italic">No phone</span>}
                                                        <span className="text-gray-400 ml-1">({emp.empCode || emp.emp_Code || ''})</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                {employeeActions(emp)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-[10px] text-gray-500 text-center font-bold tracking-wider uppercase">
                                {allEmployees.length} EMPLOYEES • {allEmployees.filter(e => getPhone(e)).length} WITH PHONE
                            </p>
                        </div>
                    </>
                )}

                {view === 'sms' && (
                    <div className="flex flex-col h-full">
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                            <button onClick={() => { setView('list'); setSelectedEmp(null); }} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors">
                                <ArrowLeft size={18} />
                            </button>
                            <div className="flex-1">
                                <h3 className="text-[15px] font-semibold text-gray-800">{selectedEmp.emp_Name || selectedEmp.empName || selectedEmp.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} /> {getPhone(selectedEmp)}</p>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 p-5 flex flex-col overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-[3px] bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3">
                                    <Smartphone size={24} className="text-[#0285fd]" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Send SMS Message</h4>
                                <p className="text-xs text-gray-500 mt-1">Message will be sent instantly via SMS gateway</p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <FileText size={12} /> Quick Templates
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {templates.map((tmpl, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => applyTemplate(tmpl)}
                                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
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
                                    className="flex-1 w-full border border-gray-300 rounded-[3px] p-4 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 placeholder:text-gray-400 resize-none min-h-[120px]"
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500 font-medium">
                                    {smsText.length}/160
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleSendSms}
                                disabled={!smsText.trim() || sendingSms}
                                className="w-full h-10 flex items-center justify-center gap-2 bg-[#0285fd] hover:bg-[#0073ff] disabled:opacity-50 text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all"
                            >
                                {sendingSms ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sendingSms ? 'Sending SMS...' : 'Send Message Now'}
                            </button>
                        </div>
                    </div>
                )}

                {view === 'logs' && (
                    <div className="flex flex-col h-full">
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setView('list')} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors">
                                    <ArrowLeft size={18} />
                                </button>
                                <h3 className="text-[15px] font-semibold text-gray-800">Message History</h3>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-[3px] transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            {loadingLogs ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 size={24} className="animate-spin text-[#0285fd]" />
                                </div>
                            ) : messageLogs.length === 0 ? (
                                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                    <History size={40} className="text-gray-300 mb-3" />
                                    <p className="text-gray-800 font-bold text-sm mb-1">No message logs</p>
                                    <p className="text-xs text-gray-500">Sent messages will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {messageLogs.map((log, idx) => (
                                        <div key={log.id || idx} className="bg-white border border-gray-200 rounded-[3px] p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={14} className="text-emerald-600" />
                                                    <span className="font-bold text-gray-800 text-sm">{log.receiverName || log.phoneNumber}</span>
                                                </div>
                                                <span className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{log.sentAt ? new Date(log.sentAt).toLocaleString() : ''}</span>
                                            </div>
                                            <p className="text-[12px] text-gray-600 mb-2 leading-relaxed bg-gray-50 border border-gray-200 p-2 rounded-[3px]">{log.messageText}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                                <Phone size={10} /> {log.phoneNumber}
                                                <span className="ml-auto text-[#0285fd]">Sent by: {log.senderName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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





