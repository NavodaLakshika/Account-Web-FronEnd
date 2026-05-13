import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { ShieldAlert, KeyRound, ArrowRight, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '../../../utils/toastUtils';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SystemUpdateAuthModal = ({ isOpen, onClose, onVerified }) => {
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!password) return;

        setIsVerifying(true);
        setError('');

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const empName = userData.empName || userData.EmpName;
            
            if (!empName) {
                throw new Error("User session not found. Please log in again.");
            }

            const response = await axios.post('/api/Auth/verify-password', {
                emp_name: empName,
                pass_word: password
            });

            if (response.data.success) {
                showSuccessToast("Identity Verified");
                onVerified();
                onClose();
            }
        } catch (err) {
            console.error("Verification failed:", err);
            const msg = err.response?.data?.message || "Invalid password. Please try again.";
            setError(msg);
            showErrorToast(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="SECURITY VERIFICATION"
            maxWidth="max-w-md"
        >
            <div className="py-6 px-4 font-['Tahoma'] select-none">
                <div className="flex flex-col items-center text-center space-y-6">
                    
                    {/* Security Lottie Animation */}
                    <div className="w-24 h-24">
                        <DotLottiePlayer 
                            src="/lottiefile/Forgot Password.lottie" 
                            autoplay 
                            loop 
                        />
                    </div>

                    {/* Text content */}
                    <div className="space-y-1">
                        <h2 className="text-[16px] font-bold text-[#0078d4] uppercase tracking-tight">
                            Identity Verification
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            Please confirm your password to proceed
                        </p>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleVerify} className="w-full space-y-4 pt-2">
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoFocus
                                className={`w-full h-12 px-4 bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200 focus:border-[#0078d4]'} rounded-lg text-[14px] font-bold text-slate-600 outline-none transition-all`}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isVerifying || !password}
                                className="flex-[2] h-12 bg-[#0078d4] hover:bg-[#005a9e] disabled:bg-slate-200 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
                            >
                                {isVerifying ? "Verifying..." : "Confirm Identity"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </SimpleModal>
    );
};

export default SystemUpdateAuthModal;
