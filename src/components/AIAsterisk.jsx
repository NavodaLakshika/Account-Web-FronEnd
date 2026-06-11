import React from 'react';

const AIAsterisk = ({ className = '', size = 18, isThinking = false }) => {
    const thickness = Math.max(2, Math.round(size / 6));
    return (
        <div 
            className={`relative flex items-center justify-center shrink-0 transition-all duration-700 ease-in-out ${isThinking ? 'scale-110' : 'group-hover:scale-110'} ${className}`}
            style={{ width: size, height: size }}
        >
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-full bg-gradient-to-b from-[#3b82f6] to-[#1e1b4b] rounded-full ${isThinking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} style={{ width: thickness, animationDelay: '0ms' }}></div>
            <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-full bg-gradient-to-r from-[#60a5fa] to-[#4338ca] rounded-full ${isThinking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} style={{ height: thickness, animationDelay: '200ms' }}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-gradient-to-r from-[#93c5fd] to-[#312e81] rounded-full rotate-45 ${isThinking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} style={{ height: thickness, animationDelay: '400ms' }}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-gradient-to-r from-[#bfdbfe] to-[#3730a3] rounded-full -rotate-45 ${isThinking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} style={{ height: thickness, animationDelay: '600ms' }}></div>
        </div>
    );
};

export default AIAsterisk;
