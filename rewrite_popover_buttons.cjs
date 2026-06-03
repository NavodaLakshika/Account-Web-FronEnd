const fs = require('fs');
let content = fs.readFileSync('src/components/CalendarPopover.jsx', 'utf8');

// Fix day numbers styling
content = content.replace(
    /className=\{\`w-9 h-9 flex items-center justify-center rounded-\[5px\] text-\[14px\] font-mono font-bold transition-all relative group\n\s*\$\{idx % 7 === 0 \? 'text-\[#f04e3e\]' : 'text-\[#0388cc\]'\}\n\s*\$\{isToday\(day\) \? 'bg-blue-50 text-\[#0388cc\] border border-\[#0388cc\]\/30 shadow-sm' : 'hover:bg-slate-100'\}\n\s*active:scale-90\n\s*\`\}/g,
    `className={\`w-9 h-9 flex items-center justify-center rounded-[4px] text-[13px] font-medium transition-all relative
                                            \${isToday(day) ? 'bg-[#0077c5] text-white shadow-sm' : (idx % 7 === 0 || idx % 7 === 6) ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-800 hover:bg-gray-100'}
                                        \`}`
);

// Remove red dot for today
content = content.replace(
    /\{isToday\(day\) && <div className="absolute bottom-1 w-1 h-1 bg-\[#0388cc\] rounded-full" \/>\}/g,
    ``
);

// Fix bottom bar
content = content.replace(
    /<div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center px-2">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/g,
    `<div className="mt-4 pt-3 border-t border-gray-100 flex justify-end px-1">
                        <button 
                            onClick={() => handleDateClick(null, new Date())}
                            className="text-[12px] font-bold text-[#0077c5] hover:text-[#005ca6] transition-colors px-2 py-1"
                        >
                            Today
                        </button>   
                    </div>
                </div>
            </div>
        </div>`
);

fs.writeFileSync('src/components/CalendarPopover.jsx', content);
