import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

const SystemLoader = ({ inline = false, message }) => {
    if (inline) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                <div className="w-20 h-20">
                    <DotLottiePlayer
                        src="/lottiefile/DashboardLoader.lottie"
                        autoplay
                        loop
                    />
                </div>
                {message && <span className="text-xs font-bold">{message}</span>}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-white/80">
            <div className="w-[150px] h-[150px]">
                <DotLottiePlayer
                    src="/lottiefile/DashboardLoader.lottie"
                    autoplay
                    loop
                />
            </div>
        </div>
    );
};

export default SystemLoader;
