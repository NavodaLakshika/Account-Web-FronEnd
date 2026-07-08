import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Smartphone, Key, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import AlertModal from '../AlertModal';

const TwoFactorSetupModal = ({ isOpen, onClose, position = 'center' }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserCode = user.emp_Code || user.empCode || user.EmpCode || '';
    
    const [is2FAEnabled, setIs2FAEnabled] = useState(null);
    const [twoFASetupData, setTwoFASetupData] = useState(null);
    const [twoFAOTP, setTwoFAOTP] = useState('');
    const [disable2FAPassword, setDisable2FAPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success'
    });

    useEffect(() => {
        if (isOpen && currentUserCode) {
            fetch2FAStatus();
        } else {
            setTwoFAOTP('');
            setDisable2FAPassword('');
            setTwoFASetupData(null);
            setIs2FAEnabled(null);
            setIsLoading(true);
        }
    }, [isOpen, currentUserCode]);

    const fetch2FAStatus = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/UserProfile/2fa-status/${currentUserCode}`);
            const enabled = res.data.is2FAEnabled;
            setIs2FAEnabled(enabled);
            
            if (!enabled) {
                const setupRes = await api.post('/UserProfile/2fa-setup-app', { EmpCode: currentUserCode });
                setTwoFASetupData(setupRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch 2FA status", error);
            setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to load 2FA settings.', variant: 'warning' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable2FAApp = async () => {
        try {
            const res = await api.post('/UserProfile/2fa-enable-app', {
                EmpCode: currentUserCode,
                Secret: twoFASetupData?.secret,
                Code: twoFAOTP
            });
            setIs2FAEnabled(true);
            setTwoFAOTP('');
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Two-Factor Authentication via App enabled successfully.', variant: 'success' });
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to verify OTP.', variant: 'warning' });
        }
    };

    const handleDisable2FA = async () => {
        try {
            const res = await api.post('/UserProfile/2fa-disable', {
                EmpCode: currentUserCode,
                Password: disable2FAPassword
            });
            setIs2FAEnabled(false);
            setDisable2FAPassword('');
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Two-Factor Authentication disabled successfully.', variant: 'success' });
            
            const setupRes = await api.post('/UserProfile/2fa-setup-app', { EmpCode: currentUserCode });
            setTwoFASetupData(setupRes.data);
        } catch (error) {
            setAlertConfig({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to disable 2FA. Please check your password.', variant: 'warning' });
        }
    };

    const isInlineRight = position === 'inline-right';

    if (!isOpen) return null;

    return (
        <div className={isInlineRight 
            ? "relative overflow-hidden flex flex-col h-full bg-white border-l border-slate-100 transition-all duration-500 ease-out shrink-0 w-full md:w-[450px] lg:w-[450px]"
            : "fixed inset-0 z-[150] flex items-center justify-center p-4"
        }>
            {!isInlineRight && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />}
            
            <div className={isInlineRight 
                ? "flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto"
                : "relative w-full max-w-md bg-white rounded-none shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            }>
                {isInlineRight ? (
                    <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white sticky top-0 z-10">
                        <h2 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-[#0285fd]" />
                            Two-Factor Security
                        </h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-[3px] transition-colors ml-1">
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0285fd]" />
                        <div className="flex items-center gap-2.5 pl-2">
                            <div className="w-7 h-7 rounded-[3px] bg-slate-100 flex items-center justify-center">
                                <ShieldAlert size={14} className="text-[#0285fd]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-slate-900 uppercase tracking-[2px] font-mono leading-none">Two-Factor Security</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                            <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                )}

                <div className="flex-1 p-5 md:p-6 bg-slate-50">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0285fd]"></div>
                        </div>
                    ) : is2FAEnabled ? (
                        <div className="bg-white p-5 border border-slate-200 rounded-[8px] shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-slate-800">2FA is Active</h3>
                                    <p className="text-[13px] text-slate-500">Your account is highly secure.</p>
                                </div>
                            </div>
                            
                            <hr className="border-slate-100 my-4" />
                            
                            <h4 className="text-[14px] font-semibold text-slate-700 mb-2">Disable Two-Factor Authentication</h4>
                            <p className="text-[13px] text-slate-500 mb-4">Please enter your password to confirm disabling 2FA. This will reduce your account security.</p>
                            
                            <div className="mb-4">
                                <input 
                                    type="password" 
                                    value={disable2FAPassword} 
                                    onChange={(e) => setDisable2FAPassword(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[14px] rounded-[4px] px-4 py-2.5 outline-none focus:border-[#0285fd] transition-colors" 
                                    placeholder="Your account password"
                                />
                            </div>
                            
                            <button onClick={handleDisable2FA} disabled={!disable2FAPassword} className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-[4px] text-[14px] font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                                Disable 2FA
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-[8px] flex gap-3">
                                <ShieldAlert size={20} className="text-[#0285fd] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-[14px] font-bold text-[#0285fd] mb-1">Protect Your Account</h4>
                                    <p className="text-[13px] text-blue-700/80 leading-relaxed">
                                        Two-Factor Authentication adds an extra layer of security to your account. To log in, you'll need both your password and an authentication code.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-slate-200 rounded-[8px] shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-3">
                                    <div className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">1</div>
                                    <h4 className="text-[14px] font-semibold text-slate-800">Get the Authenticator App</h4>
                                </div>
                                <div className="p-4 flex gap-4">
                                    <div className="p-3 bg-slate-50 rounded-[8px] text-slate-500 h-fit">
                                        <Smartphone size={32} />
                                    </div>
                                    <div className="text-[13px] text-slate-600">
                                        <p className="mb-2">Download and install an authenticator app on your mobile device:</p>
                                        <ul className="list-disc pl-4 space-y-1 text-slate-500 mb-3">
                                            <li><strong>Google Authenticator</strong> (Android / iOS)</li>
                                            <li><strong>Authy</strong> or <strong>Microsoft Authenticator</strong></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[8px] shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-3">
                                    <div className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">2</div>
                                    <h4 className="text-[14px] font-semibold text-slate-800">Scan QR Code</h4>
                                </div>
                                <div className="p-4 flex flex-col items-center">
                                    {twoFASetupData?.qrCode ? (
                                        <div className="bg-white p-2 border border-slate-200 rounded-[8px] shadow-sm mb-4">
                                            <img src={twoFASetupData.qrCode} alt="2FA QR Code" className="w-40 h-40" />
                                        </div>
                                    ) : (
                                        <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-[8px] mb-4 flex items-center justify-center text-slate-400">Loading...</div>
                                    )}
                                    <p className="text-[12px] text-slate-500 mb-2">Can't scan the QR code? Enter this secret key manually:</p>
                                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-[4px] font-mono text-[13px] text-slate-800 font-bold select-all tracking-wider text-center w-full break-all">
                                        {twoFASetupData?.secret || 'LOADING...'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[8px] shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-3">
                                    <div className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">3</div>
                                    <h4 className="text-[14px] font-semibold text-slate-800">Verify Code</h4>
                                </div>
                                <div className="p-4">
                                    <p className="text-[13px] text-slate-600 mb-3">Enter the 6-digit code generated by your app to verify the setup.</p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-0 bottom-0 flex items-center text-slate-400">
                                                <Key size={16} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={twoFAOTP} 
                                                onChange={(e) => setTwoFAOTP(e.target.value)} 
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[4px] pl-10 pr-4 py-2.5 outline-none focus:border-[#0285fd] tracking-[4px] font-mono font-bold" 
                                                maxLength={6}
                                                placeholder="000000"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleEnable2FAApp} 
                                            disabled={twoFAOTP.length !== 6} 
                                            className="px-5 bg-[#0285fd] text-white rounded-[4px] text-[13px] font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            Verify & Enable
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </div>
    );
};

export default TwoFactorSetupModal;
