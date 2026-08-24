import React, { useState, useEffect } from 'react';

const positions = {
  0: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [90, 270]]
  ],
  1: [
    [[225, 225], [90, 180], [180, 270]],
    [[225, 225], [0, 180], [0, 180]],
    [[225, 225], [0, 180], [0, 180]],
    [[225, 225], [0, 180], [0, 180]],
    [[225, 225], [0, 0], [0, 0]]
  ],
  2: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 90], [90, 270], [0, 180]],
    [[90, 180], [90, 270], [0, 270]],
    [[0, 180], [225, 225], [225, 225]],
    [[0, 90], [180, 270], [180, 270]]
  ],
  3: [
    [[90, 180], [90, 270], [180, 270]],
    [[225, 225], [90, 180], [0, 180]],
    [[225, 225], [0, 90], [90, 180]],
    [[225, 225], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [90, 180]]
  ],
  4: [
    [[90, 180], [225, 225], [90, 180]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 90], [90, 270], [0, 180]],
    [[225, 225], [225, 225], [0, 180]],
    [[225, 225], [225, 225], [0, 0]]
  ],
  5: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [225, 225]],
    [[0, 90], [90, 270], [180, 270]],
    [[225, 225], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [90, 180]]
  ],
  6: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [225, 225]],
    [[0, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [180, 270]]
  ],
  7: [
    [[90, 180], [90, 270], [180, 270]],
    [[225, 225], [225, 225], [0, 180]],
    [[225, 225], [225, 225], [0, 180]],
    [[225, 225], [225, 225], [0, 180]],
    [[225, 225], [225, 225], [0, 0]]
  ],
  8: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [180, 270]]
  ],
  9: [
    [[90, 180], [90, 270], [180, 270]],
    [[0, 180], [225, 225], [0, 180]],
    [[0, 90], [90, 270], [180, 270]],
    [[225, 225], [225, 225], [0, 180]],
    [[0, 90], [0, 270], [180, 180]]
  ],
  ':': [
    [[225, 225], [225, 225], [225, 225]],
    [[225, 225], [90, 180], [90, 180]],
    [[225, 225], [225, 225], [225, 225]],
    [[225, 225], [0, 90], [0, 0]],
    [[225, 225], [225, 225], [225, 225]]
  ]
};

const Clock = ({ hourAngle, minuteAngle }) => (
  <div className="relative w-8 h-8 rounded-full border border-blue-400/20 bg-white/5 flex items-center justify-center m-[1px] transition-all duration-[600ms]">
    <div 
      className="absolute w-1/2 h-[1.5px] bg-[#0078d4] right-1/2 origin-right transition-transform duration-[600ms]"
      style={{ transform: `rotate(${hourAngle}deg)` }}
    />
    <div 
      className="absolute w-1/2 h-[1.5px] bg-[#0078d4] right-1/2 origin-right transition-transform duration-[600ms]"
      style={{ transform: `rotate(${minuteAngle}deg)` }}
    />
  </div>
);

const ClockDigit = ({ digit }) => {
  const data = positions[digit] || positions[0];
  return (
    <div className="grid grid-cols-3">
      {data.map((row, rIdx) => 
        row.map((clockPos, cIdx) => (
          <Clock key={`${rIdx}-${cIdx}`} hourAngle={clockPos[0]} minuteAngle={clockPos[1]} />
        ))
      )}
    </div>
  );
};

const ClockMadeOfClocks = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => {
    const h = String(t.getHours()).padStart(2, '0');
    const m = String(t.getMinutes()).padStart(2, '0');
    const s = String(t.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const timeStr = formatTime(time);

  return (
    <div className="flex items-center justify-center scale-90 md:scale-110 lg:scale-125 p-12 bg-[#011e41]/5 rounded-3xl backdrop-blur-sm border border-blue-400/10 shadow-2xl">
      {timeStr.split('').map((char, idx) => (
        <React.Fragment key={idx}>
          <ClockDigit digit={char} />
          {idx === 1 || idx === 3 ? <div className="w-4" /> : idx < timeStr.length - 1 ? <div className="w-4" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ClockMadeOfClocks;
