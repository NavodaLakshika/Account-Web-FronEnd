import React, { useState, useEffect } from 'react';

const FlipUnit = ({ value, showAmPm, isHour }) => {
  const ampm = value >= 12 ? 'PM' : 'AM';
  const displayValue = isHour ? (value % 12 || 12) : value;

  
  return (
    <div className="flex gap-2">
      {String(displayValue).padStart(2, '0').split('').map((digit, i) => (
        <div key={i} className="relative w-6 h-9 rounded-md flex items-center justify-center overflow-hidden">
          {/* Top Half (Transparent) */}
          <div className="absolute top-0 left-0 right-0 h-1/2 border-b border-white/10" />



          {/* Bottom Half (Transparent) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2" />
          
          {/* Centered Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/40 z-10" />

          
          {/* AM/PM Label (Only on first digit segment if needed) */}
          {showAmPm && i === 0 && (
            <div className="absolute top-0.5 left-0.5 z-30 text-[6px] font-black text-white tracking-tighter uppercase">
              {ampm}
            </div>
          )}

          
          <span 
            key={digit}
            className="relative z-20 text-white text-xl font-bold tracking-tighter leading-none select-none animate-[flip_0.4s_ease-out]"
          >



            {digit}
          </span>

          
          {/* Subtle Gloss reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

const FlipClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 scale-90 transform-gpu origin-left">
      <FlipUnit value={time.getHours()} showAmPm isHour />
      <div className="flex flex-col gap-1.5">
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <div className="w-1 h-1 bg-white/20 rounded-full" />
      </div>
      <FlipUnit value={time.getMinutes()} />
      <div className="flex flex-col gap-1.5">
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <div className="w-1 h-1 bg-white/20 rounded-full" />
      </div>
      <FlipUnit value={time.getSeconds()} />
    </div>



  );
};

export default FlipClock;
