import React from 'react';
import SimpleModal from '../SimpleModal';
import { DotLottiePlayer } from '@dotlottie/react-player';

const FeatureLockedModal = ({ isOpen, onClose }) => {
    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="LOCK STATUS"
            maxWidth="max-w-[360px]"
            showHeaderClose={false}
        >
            <div className="flex flex-col items-center text-center space-y-6 font-['Tahoma'] py-2">
                <div className="w-28 h-28 shrink-0">
                    <DotLottiePlayer src="/lottiefile/Forgot Password1.lottie" autoplay loop />
                </div>
                <div className="space-y-1">
                    <h3 className="text-[18px] font-bold text-red-600 uppercase tracking-tight">Access Locked</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                        Please contact supporters to unlock this feature.
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full h-11 bg-[#ff3b30] text-white text-[12px] font-black rounded-[5px] hover:bg-[#e03127] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(255,59,48,0.3)] hover:shadow-[0_12px_24px_rgba(255,59,48,0.4)] border-none"
                >
                    CLOSE DIALOG
                </button>
            </div>
        </SimpleModal>
    );
};

export default FeatureLockedModal;
