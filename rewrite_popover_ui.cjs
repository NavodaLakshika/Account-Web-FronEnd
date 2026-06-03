const fs = require('fs');
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');

// Fix width constraint
content = content.replace(
    /className="relative w-full max-w-\[360px\] bg-white rounded-\[15px\] shadow-2xl overflow-hidden calendar-animate font-\['Tahoma',_sans-serif\]"/g,
    'className="relative w-[340px] bg-white rounded-[8px] border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.15)] overflow-hidden calendar-animate font-sans"'
);

// Replace header
content = content.replace(
    /\{\/\* Blue Header \*\/\}[\s\S]*?\{\/\* Calendar Grid \*\/\}\n\s*<div className="p-4 bg-white">/g,
    `{/* Calendar Grid */}
                <div className="p-4 bg-white">
                    {/* Simple Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                        <button onClick={prevMonth} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-[4px] transition-all"><ChevronLeft size={18} /></button>
                        <h2 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide">
                            {months[currentMonth]} {currentYear}
                        </h2>
                        <button onClick={nextMonth} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-[4px] transition-all"><ChevronRight size={18} /></button>
                    </div>`
);

// Fix days of week headers styling
content = content.replace(
    /className=\{\`h-8 flex items-center justify-center text-\[13px\] font-mono font-bold tracking-widest \$\{idx === 0 \? 'text-\[#f04e3e\]' : 'text-\[#0388cc\]'\}\`\}/g,
    `className={\`h-8 flex items-center justify-center text-[11px] font-bold tracking-wider \${idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-500'}\`}`
);
content = content.replace(
    /\{day\}/g,
    `{day.substring(0,2)}` // SU, MO, TU, etc.
);

// Fix day numbers styling
content = content.replace(
    /className=\{\`w-9 h-9 flex items-center justify-center rounded-\[5px\] text-\[14px\] font-mono font-bold transition-all relative group\n\s*\$\{idx % 7 === 0 \? 'text-\[#f04e3e\]' : 'text-\[#0388cc\]'\}\n\s*\$\{isToday\(day\) \? 'bg-blue-50 text-\[#0388cc\] border border-\[#0388cc\]\/30 shadow-sm' : 'hover:bg-slate-100'\}\n\s*active:scale-90\n\s*\`\}/g,
    `className={\`w-9 h-9 flex items-center justify-center rounded-[4px] text-[13px] font-medium transition-all relative
                                            \${isToday(day) ? 'bg-[#0077c5] text-white shadow-sm' : (idx % 7 === 0 || idx % 7 === 6) ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-800 hover:bg-gray-100'}
                                        \`}`
);

// Remove red dot for today (since it is now solid blue)
content = content.replace(
    /\{isToday\(day\) && <div className="absolute bottom-1 w-1 h-1 bg-\[#0388cc\] rounded-full" \/>\}/g,
    ``
);

// Fix bottom bar
content = content.replace(
    /<div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center px-2">[\s\S]*?<\/div>\n\s*<\/div>/g,
    `<div className="mt-4 pt-3 border-t border-gray-100 flex justify-end px-1">
                        <button 
                            onClick={() => handleDateClick(null, new Date())}
                            className="text-[12px] font-bold text-[#0077c5] hover:text-[#005ca6] transition-colors px-2 py-1"
                        >
                            Today
                        </button>   
                    </div>
                </div>`
);


fs.writeFileSync('src/components/CalendarPopover.jsx', content);
