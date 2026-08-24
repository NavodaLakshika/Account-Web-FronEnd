// import React, { useEffect } from 'react';
// import { DotLottiePlayer } from '@dotlottie/react-player';

// const TransitionModal = ({ isOpen, onComplete }) => {
//     useEffect(() => {
//         if (isOpen) {
//             const timer = setTimeout(() => {
//                 if (onComplete) onComplete();
//             }, 10000000); // 3 seconds transition
//             return () => clearTimeout(timer);
//         }
//     }, [isOpen, onComplete]);

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center overflow-hidden">
//             <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-3xl" />
            
//             {/* Massive Full-Screen Wave Effect */}
//             <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
//                 <div className="absolute inset-0 flex items-center justify-center opacity-40 scale-[2] pointer-events-none">
//                     <div className="w-[800px] h-[800px]">
//                         <DotLottiePlayer
//                             src="/lottiefile/Wave Lottie Animation.lottie"
//                             autoplay
//                             loop
//                         />
//                     </div>
//                 </div>
                
//                 <div className="relative z-10 flex flex-col items-center">
//                     <div className="mb-12 animate-shimmer-slow">
//                         <h2 className="text-white text-[16px] font-black tracking-[1.5em] uppercase opacity-80 mb-4 text-center ml-4">
//                             Synchronizing
//                         </h2>
//                         <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto" />
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full bg-[#00acee] animate-bounce [animation-delay:-0.3s] shadow-[0_0_12px_#00acee]" />
//                         <div className="w-2 h-2 rounded-full bg-[#00acee] animate-bounce [animation-delay:-0.15s] shadow-[0_0_12px_#00acee]" />
//                         <div className="w-2 h-2 rounded-full bg-[#00acee] animate-bounce shadow-[0_0_12px_#00acee]" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TransitionModal;
