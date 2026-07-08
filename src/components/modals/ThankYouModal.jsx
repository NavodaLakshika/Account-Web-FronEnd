import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import AnimatedBackground from '../AnimatedBackground';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@keyframes stroke-draw {
  0% {
    stroke-dashoffset: 600;
    fill-opacity: 0;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  50% {
    stroke-dashoffset: 0;
    fill-opacity: 0;
  }
  100% {
    stroke-dashoffset: 0;
    fill-opacity: 1;
    opacity: 1;
  }
}

@keyframes underline-expand {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ty-letter {
  display: inline-block;
  position: relative;
}

.ty-letter svg {
  display: block;
}

.ty-underline {
  transform-origin: left center;
  animation: underline-expand 0.8s 2s cubic-bezier(0.65, 0, 0.35, 1) both;
}

.ty-fade {
  opacity: 0;
  animation: fade-up 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
`;

const THANK_YOU = 'THANK YOU';

const ThankYouModal = ({ isOpen, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.id = 'ty-art-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        return () => {
            const existing = document.getElementById('ty-art-styles');
            if (existing) existing.remove();
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            const redirectTimer = setTimeout(() => {
                authService.logout();
                localStorage.removeItem('selectedCompany');
                window.location.href = '/login';
            }, 3200);

            const duration = 5000;
            const startTime = Date.now();
            let animationFrameId;

            const animateProgress = () => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed / duration) * 100, 100);
                setProgress(percent);

                if (percent < 100) {
                    animationFrameId = requestAnimationFrame(animateProgress);
                }
            };

            animationFrameId = requestAnimationFrame(animateProgress);

            return () => {
                cancelAnimationFrame(animationFrameId);
                clearTimeout(redirectTimer);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 opacity-100"><AnimatedBackground customColor="11, 29, 74" /></div>
            <div className="relative flex flex-col items-center pointer-events-auto select-none">
                {/* Typography Art - Letter by Letter Drawing */}
                <div className="relative flex flex-col items-center mb-8">
                    <div
                        style={{
                            fontFamily: "'Allura', cursive",
                            fontSize: 'clamp(3rem, 9vw, 5.5rem)',
                            lineHeight: 1,
                            letterSpacing: '6px',
                            color: '#0f172a',
                            textAlign: 'center',
                        }}
                    >
                        {THANK_YOU.split('').map((letter, i) => (
                            <span
                                key={i}
                                className="ty-letter"
                                style={{
                                    animation: letter === ' ' ? 'none' : undefined,
                                }}
                            >
                                <svg
                                    viewBox={letter === ' ' ? '0 0 30 100' : '0 0 80 100'}
                                    height="1em"
                                    style={{
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                        overflow: 'visible',
                                    }}
                                >
                                    <defs>
                                        <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#0f172a" />
                                            <stop offset="100%" stopColor="#334155" />
                                        </linearGradient>
                                    </defs>
                                    <text
                                        x="50%"
                                        y="74%"
                                        textAnchor="middle"
                                        fontFamily="'Allura', cursive"
                                        fontSize="82"
                                        fill="transparent"
                                        stroke={`url(#grad-${i})`}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="600"
                                        strokeDashoffset="600"
                                        style={{
                                            animation: letter === ' ' ? 'none' : `stroke-draw 1.2s ${0.15 + i * 0.12}s cubic-bezier(0.65, 0, 0.35, 1) forwards`,
                                        }}
                                    >
                                        {letter === ' ' ? '' : letter}
                                    </text>
                                </svg>
                            </span>
                        ))}
                    </div>

                    {/* Decorative underline */}
                    <div
                        className="ty-underline h-[2px] rounded-full mt-2"
                        style={{
                            width: 'clamp(140px, 32vw, 260px)',
                            background: 'linear-gradient(90deg, transparent 0%, #0f172a 40%, #475569 70%, transparent 100%)',
                            transform: 'scaleX(0)',
                            opacity: 0,
                        }}
                    />
                </div>

                {/* Subtitle */}
                <p
                    className="ty-fade text-slate-400 text-[12px] tracking-[4px] uppercase mb-12"
                    style={{
                        animationDelay: '2.3s',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        letterSpacing: '8px',
                    }}
                >
                    Signed Out Successfully
                </p>

                {/* Return button */}
                <button
                    onClick={() => window.location.href = '/login'}
                    className="ty-fade relative px-10 py-3 text-[12px] font-bold text-white rounded-sm transition-all duration-300"
                    style={{
                        animationDelay: '2.8s',
                        fontFamily: "'Inter', sans-serif",
                        background: '#0B1D4A',
                        letterSpacing: '3px',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#122b5c';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0B1D4A';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    BACK TO LOGIN
                </button>

                {/* Progress */}
                <div
                    className="ty-fade mt-10 w-20 h-[2px] rounded-full overflow-hidden"
                    style={{
                        animationDelay: '3.2s',
                        background: '#e2e8f0',
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-100 ease-linear"
                        style={{
                            width: `${progress}%`,
                            background: '#0f172a',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ThankYouModal;
