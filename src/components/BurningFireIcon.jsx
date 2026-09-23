import React from 'react';

const BurningFireIcon = ({ size = 24, className = '' }) => {
    return (
        <div 
            className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            {/* Ambient fiery heat glow aura */}
            <div 
                className="absolute inset-0 rounded-full bg-gradient-to-t from-red-600/50 via-orange-500/40 to-amber-400/25 blur-[5px] animate-[firePulseGlow_1.2s_ease-in-out_infinite_alternate]"
            />

            <svg 
                viewBox="0 0 36 36" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_2px_6px_rgba(234,88,12,0.7)]"
            >
                <defs>
                    {/* Deep red-orange outer flame */}
                    <linearGradient id="outerFireGrad" x1="18" y1="34.5" x2="18" y2="2.5" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#b91c1c" />
                        <stop offset="25%" stopColor="#dc2626" />
                        <stop offset="55%" stopColor="#ea580c" />
                        <stop offset="85%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>

                    {/* Bright orange-yellow mid flame */}
                    <linearGradient id="midFireGrad" x1="18" y1="32" x2="18" y2="9" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ea580c" />
                        <stop offset="40%" stopColor="#f59e0b" />
                        <stop offset="80%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>

                    {/* Hot glowing yellow-white core */}
                    <linearGradient id="coreFireGrad" x1="18" y1="30.5" x2="18" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="30%" stopColor="#fbbf24" />
                        <stop offset="70%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>

                    {/* Inner spark */}
                    <radialGradient id="sparkGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="60%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Outer Flame - Dancing and waving */}
                <path
                    d="M18 2.5C18 2.5 22.5 8 21.2 14.5C20.5 17.5 22.2 19 24.5 17.8C27.5 16 28.5 12.5 28.5 12.5C28.5 12.5 32 18.5 31 25C29.8 31.8 24.8 34.5 18 34.5C11.2 34.5 6.2 31.8 5 25C4 18.5 7.5 12.5 7.5 12.5C7.5 12.5 8.5 16 11.5 17.8C13.8 19 15.5 17.5 14.8 14.5C13.5 8 18 2.5 18 2.5Z"
                    fill="url(#outerFireGrad)"
                    className="origin-bottom animate-[fireDanceOuter_1.2s_ease-in-out_infinite_alternate]"
                />

                {/* Middle Flame - Counter flicker */}
                <path
                    d="M18 9C18 9 21 13 20.2 17.5C19.6 19.8 21 21 22.8 20C24.8 18.8 25.5 15.8 25.5 15.8C25.5 15.8 28 20 27 25C26 29.5 22.5 32 18 32C13.5 32 10 29.5 9 25C8 20 10.5 15.8 10.5 15.8C10.5 15.8 11.2 18.8 13.2 20C15 21 16.4 19.8 15.8 17.5C15 13 18 9 18 9Z"
                    fill="url(#midFireGrad)"
                    className="origin-bottom animate-[fireDanceMid_0.85s_ease-in-out_infinite_alternate]"
                />

                {/* Inner Core Flame - Hot incandescent heart */}
                <path
                    d="M18 16.5C18 16.5 19.8 19 19.2 21.8C18.8 23.2 19.8 24 21 23.2C22.2 22.2 22.5 20.2 22.5 20.2C22.5 20.2 24 23 23.2 26C22.2 29 19.8 30.5 18 30.5C16.2 30.5 13.8 29 12.8 26C12 23 13.5 20.2 13.5 20.2C13.5 20.2 13.8 22.2 15 23.2C16.2 24 17.2 23.2 16.8 21.8C16.2 19 18 16.5 18 16.5Z"
                    fill="url(#coreFireGrad)"
                    className="origin-bottom animate-[fireDanceCore_0.5s_ease-in-out_infinite_alternate]"
                />

                {/* Floating Embers / Sparks */}
                <circle cx="16" cy="4" r="1.1" fill="url(#sparkGrad)" className="animate-[fireSpark1_1.4s_ease-out_infinite]" />
                <circle cx="21" cy="6" r="0.9" fill="url(#sparkGrad)" className="animate-[fireSpark2_1.8s_ease-out_infinite_0.4s]" />
                <circle cx="13" cy="8" r="0.8" fill="url(#sparkGrad)" className="animate-[fireSpark3_1.6s_ease-out_infinite_0.8s]" />
            </svg>
        </div>
    );
};

export default BurningFireIcon;
